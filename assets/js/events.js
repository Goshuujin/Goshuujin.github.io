var is_on_top = false;

var animate_links_in = function() {
   $("#bio-container").css({"transform" : "rotate(0deg)"});
   $("#contact-container").css({"transform" : "rotate(0deg)"});
   $("#projects-container").css({"transform" : "rotate(0deg)"});
   $("#bio").css({"transform" : "rotate(0deg)"});
   $("#contact").css({"transform" : "rotate(0deg)"});
   $("#projects").css({"transform" : "rotate(0deg)"});
};

var animate_links_out = function() {
   $("#bio-container").css({"transform" : "rotate(-90deg)"});
   $("#contact-container").css({"transform" : "rotate(-270deg)"});
   $("#projects-container").css({"transform" : "rotate(-180deg)"});
   $("#bio").css({"transform" : "rotate(90deg)"});
   $("#contact").css({"transform" : "rotate(-90deg)"});
   $("#projects").css({"transform" : "rotate(180deg)"});
};

var landing_nav_click_handler = function() {
    var this_link = $(this);
    var clicked_id = parse_id(this_link);
    var show_timeout = 100;

    this_link.trigger("mouseout");

    if (this_link.attr("id") == "github") {
      window.location = "https://www.github.com/Goshuujin";
      return;
    }

    if (!is_on_top) {
        animate_links_in();
        this_link.parent().addClass("on-top");

        setTimeout(function() {
            $("#logo").addClass("scale-down");
            $(".link-container").css({"left" : "-240px"});
            $(".link-container").css({"top" : "-240px"});
            setTimeout(function() {
                $("#projects-container").css({"left" : "+=200px"});
                $("#contact-container").css({"left" : "+=400px"});
                $("#github-container").css({"left" : "+=600px"});
            }, 600);
        }, 600);

        is_on_top = true;
        show_timeout += 1100;
    }

    setTimeout(function() {
        $(".link-container").removeClass("on-top");
        $(".content-container").removeClass("show");
        $("#" + clicked_id + "-content-container").addClass("show");
        $(".nav-link").removeClass("shadow");
        $("#" + clicked_id).addClass("shadow");
    }, show_timeout);
};

var landing_on_hover_handler = function() {
    $(this).animate({width: 90, height: 90, lineHeight : 90, margin: -15}, "fast");
};

var landing_off_hover_handler = function() {
    $(this).animate({width: 60, height: 60, lineHeight : 60, margin: 0}, "fast");
};

var parse_id = function(link) {
    return link.attr('id').split("-")[0];
};

//This function has a lot af variables
var setup_canvas = function () {

var WIDTH = 602,
    HEIGHT = 602,
    VIEW_ANGLE = 45,
    ASPECT = WIDTH / HEIGHT,
    NEAR = 0.1,
    FAR = 10000,
    $container = $('#logo'),
    renderer = new THREE.WebGLRenderer({alpha : true}),
    camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR),
    scene = new THREE.Scene();

renderer.setClearColor( 0xffffff, 0);
renderer.setSize(WIDTH, HEIGHT);
$container.append(renderer.domElement);

camera.position.z = 300;

var radius = 90,
    segments = 32,
    rings = 32,
    sphereMaterial = new THREE.MeshNormalMaterial({transparent : true, opacity : 0.5}),
    sphere = new THREE.Mesh( 
      new THREE.SphereGeometry(radius, segments, rings),
      sphereMaterial);

var geometry = new THREE.TorusKnotGeometry( 45, 10, 200, 20, 3, 4 );
var material = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe : true } );
var torusKnot = new THREE.Mesh( geometry, material );

var pointLight = new THREE.PointLight(0xFFFFFF);

pointLight.position.x = 10;
pointLight.position.y = 50;
pointLight.position.z = 130;

scene.add(camera);
scene.add(sphere);
scene.add( torusKnot );
scene.add(pointLight);

renderer.render(scene, camera);

var render = function() {
  requestAnimationFrame( render );
  torusKnot.rotation.x += 0.01;
  torusKnot.rotation.y -= 0.01;
  renderer.render(scene, camera);
};

render();

};

$(document).ready(function () {
    var win_height = $(window).height();
    var win_width  = $(window).width();

    if (win_width >= 620) {
        $(".link-container").css({"left" : "calc((" + win_width + "px / 2) - 300px)"});
    } else {
        $(".link-container").css({"left" : "20px)"});
    }

    if (win_width >= 890) {
      $(".content-container").css({"left" : "calc((" + win_width + "px / 2) - 450px)"});
    } else {
      $(".content-container").css({"left" : "20px)"});
    }

    $(".nav-link").hover(landing_on_hover_handler, landing_off_hover_handler);

    $(".nav-link").click(landing_nav_click_handler);

    setup_canvas();

});
