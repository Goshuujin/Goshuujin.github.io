var scene,                          //The THREEjs Scene object
    camera,                         //The THREEjs Camera object
    renderer,                       //The THREEjs Renderer object
    grid,                           //Grid of dot objects with alive/dead boolean
    temp_grid,                      //Grid used to calculate the next update to the grid
    dot_geometry,                   //Geometry of a dot (shared variable)
    SIZE = 120,                     //Global definition of the size of a grid row
    DOT_RADIUS = 4,                 //Global definition of the dot radius
    DOT_ACTIVE_COLOR = 0xff0000,    //Global definition of the dot living color
    DOT_INACTIVE_COLOR = 0xffffff,  //Global definition of the dot dead color
    INIT_PROB = 30;                 //Global definition of the probability of initializing a dot as alive

// var worker_thread, update_func, update_queue;

var init_scene = function () {
    //Create lighting
    var light = new THREE.AmbientLight( 0x424242 );
    var directional_light = new THREE.DirectionalLight( 0xffffff, 1 );

    directional_light.position.set( 0, 0, 1 );

    //Init the scene, camera, and renderer
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1, 1000 );
    renderer = new THREE.WebGLRenderer( {maxLights : 160} );

    camera.position.z = 560;
    // camera.position.z = ((SIZE) + 1) * ((DOT_RADIUS * 2) + 0.1);
    camera.position.x = camera.position.y = ((SIZE / 2) + 1) * ((DOT_RADIUS * 2) + 0.1);
    console.log("Camera Position: Z -> " + camera.position.z + " XY -> " + camera.position.x);
    
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    //Add everything to the scene
    scene.add( camera );
    scene.add( light );
    scene.add( directional_light );
};

//Initialize the grids used to keep track of the dots states
var init_grid = function () {
    // update_queue = new Array( );
    grid = new Array( SIZE );
    temp_grid = new Array( SIZE );
    for (var i = 0; i < SIZE; i++) {
        grid[i] = new Array( SIZE );
        temp_grid[i] = new Array( SIZE );
    }
};

//Init the shared geometry
var init_geometry = function () {
    dot_geometry = new THREE.SphereGeometry( DOT_RADIUS, 8, 4 );
}; 

//Create a new dot
var create_dot = function () {
    var dot_material = new THREE.MeshLambertMaterial( {color: DOT_INACTIVE_COLOR, transparent: true} );
    var dot = new THREE.Mesh( dot_geometry, dot_material );
    return dot;
};

//Create dots and add them to the grids as well as the scene
var init_dots = function () {
    init_grid(SIZE);

    for (var x = 0; x < SIZE; x++) {
        for (var y = 0; y < SIZE; y++) {
            var dot = create_dot();
            dot.position.x = (x + 1) * ((DOT_RADIUS * 2) + 0.1);
            dot.position.y = (y + 1) * ((DOT_RADIUS * 2) + 0.1);
            grid[x][y] = { "dot" : dot, "status" : false };
            temp_grid[x][y] = false;

            //Set this dot to live with probability INIT_PROB
            if (Math.random() * 100 < INIT_PROB) {
                dot.material.setValues( {color: DOT_ACTIVE_COLOR} );
                grid[x][y].status = true;
                temp_grid[x][y] = true;
            }

            scene.add( dot );
        }
    }
};

var is_alive = function (x, y) {
    return grid[x][y].status;
};

var kill_dot = function (x, y) {
    grid[x][y].dot.material.setValues( {color: DOT_INACTIVE_COLOR, opacity: 0.2} );
    grid[x][y].status = false;
};

var raise_dot = function (x, y) {
    grid[x][y].dot.material.setValues( {color: DOT_ACTIVE_COLOR, opacity: 1} );
    grid[x][y].status = true;
};

var get_wraped_position = function (val) {
    if (val == -1) {
        return SIZE - 1;
    }
    if (val == SIZE) {
        return 0;
    }
    return val;
};

var count_cells = function (x, y) {
    var count = 0, a, b;

    for (var i = -1; i < 2; i++) {
        a = get_wraped_position( x + i );

        for (var j = -1; j < 2; j++) {
            if ((i == 0) && (j == 0)) {
                continue;
            }

            b = get_wraped_position( y + j );

            if (is_alive( a, b )) {
                count++;
            }

            if (count >= 4) {
                return count;
            }
        }
    }
    return count;
};

var update_scene = function () {
    for (var x = 0; x < SIZE; x++) {
        for (var y = 0; y < SIZE; y++) {
            if (temp_grid[x][y]) {
                raise_dot( x, y );
            } else {
                kill_dot( x, y );
            }
        }
    }
};

var update_life = function () {
    var num_alive;

    for (var x = 0; x < SIZE; x++) {
        for (var y = 0; y < SIZE; y++) {
            num_alive = count_cells( x, y );
            if (is_alive( x, y )) {
                if ((num_alive < 2) || (num_alive > 3)) {
                    temp_grid[x][y] = false;
                } 
            } else if (num_alive == 3) {
                temp_grid[x][y] = true;
            }
        }
    }

    update_scene();
};

// var update_life_worker = function () {
//     console.log(update_queue);
//     temp_grid = update_queue.shift();
//     if ( temp_grid !== undefined) { update_scene(); }
// };

// var init_worker = function () {
//     if (window.Worker) {
//         worker_thread = new Worker( "worker.js" );
//         update_func = update_life_worker;
//         worker_thread.onmessage = function(e) {
//             update_queue = update_queue.concat( [ e.data[0] ] );
//         };
//         worker_thread.postMessage( [ { "size" : SIZE, "grid" : temp_grid } ] );
//     } else {
//         update_func = update_life;
//     }
// };

var render = function() {
    setTimeout(function () {
        requestAnimationFrame( render );
        update_life();
        // update_func();
        renderer.render( scene, camera );
    }, 1000 / 20);
};

var window_resize = function () {
    renderer.setSize( window.innerWidth, window.innerHeight );
    camera.aspect = window.innerWidth / window.innerHeight;
};

$(document).ready(function () {
    init_scene();
    window.addEventListener('resize', window_resize, true);
    init_geometry();
    init_dots();
    // init_worker();
    render();
});
