/*
 * UBC CPSC 314, Vjan2019
 * Assignment 4 Template
 */

// CHECK WEBGL VERSION
if ( WEBGL.isWebGL2Available() === false ) {
  document.body.appendChild( WEBGL.getWebGL2ErrorMessage() );
}

// Setup renderer
var container = document.createElement( 'div' );
document.body.appendChild( container );

var canvas = document.createElement("canvas");
var context = canvas.getContext( 'webgl2' );
var renderer = new THREE.WebGLRenderer( { canvas: canvas, context: context } );
renderer.setClearColor(0X808080); // background colour
container.appendChild( renderer.domElement );

// Adapt backbuffer to window size
function resize() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  shadowMap_Camera.aspect = window.innerWidth / window.innerHeight;
  shadowMap_Camera.updateProjectionMatrix();
}

// Hook up to event listener
window.addEventListener('resize', resize);
window.addEventListener('vrdisplaypresentchange', resize, true);

// Disable scrollbar function
window.onscroll = function() {
  window.scrollTo(0, 0);
}

// Add scene
var depthScene = new THREE.Scene(); // shadow map
var finalScene = new THREE.Scene(); // final map

var lightDirection = new THREE.Vector3(0.49,0.79,0.49);

// Shadow map camera
// TODO: change the shadowMap_camera for scene that creates shadow map
var shadowMapWidth = 10;
var shadowMapHeight = 10;
//var shadowMap_Camera = new THREE.OrthographicCamera(1, 1, 1, 1, 1, 1000);
var shadowMap_Camera = new THREE.OrthographicCamera(shadowMapWidth / - 2, shadowMapWidth / 2, shadowMapHeight / 2, shadowMapHeight / -2, 1, 1000)
shadowMap_Camera.position.set(10, 10, 10)
shadowMap_Camera.lookAt(new THREE.Vector3(shadowMap_Camera.position - lightDirection));
depthScene.add(shadowMap_Camera);


// TODO: set the camera's lookAt and then add at it to the scene
//shadowMap_Camera.position.set(10.0, 10.0, 10.0);


// Main camera
var camera = new THREE.PerspectiveCamera(30, 1, 0.1, 1000); // view angle, aspect ratio, near, far
camera.position.set(0,10,20);
camera.lookAt(finalScene.position);
finalScene.add(camera);


// COMMENT BELOW FOR VR CAMERA
// ------------------------------

// Giving camera some controls
cameraControl = new THREE.OrbitControls(camera);
cameraControl.damping = 0.2;
cameraControl.autoRotate = false;
// ------------------------------
// COMMENT ABOVE FOR VR CAMERA


// UNCOMMENT BELOW FOR VR CAMERA
// ------------------------------
// Apply VR headset positional data to camera.
// var controls = new THREE.VRControls(camera);
// controls.standing = true;

// // Apply VR stereo rendering to renderer.
// var effect = new THREE.VREffect(renderer);
// effect.setSize(window.innerWidth, window.innerHeight);

// var display;

// // Create a VR manager helper to enter and exit VR mode.
// var params = {
//   hideButton: false, // Default: false.
//   isUndistorted: false // Default: false.
// };
// var manager = new WebVRManager(renderer, effect, params);
// ------------------------------
// UNCOMMENT ABOVE FOR VR CAMERA


// XYZ axis helper
var worldFrame = new THREE.AxesHelper(2);
finalScene.add(worldFrame);
var shadowMapWidth = window.innerWidth
var shadowMapHeight = window.innerHeight

// texture containing the depth values from the shadowMap_Camera POV
// TODO: create the depthTexture associating with this RenderTarget
//var shadowMap = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight );
var shadowMap = new THREE.WebGLRenderTarget(shadowMapWidth, shadowMapHeight, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter } )


// load texture
// anisotropy allows the texture to be viewed decently at skewed angles
var colorMap = new THREE.TextureLoader().load('images/color.jpg');
colorMap.minFilter = THREE.LinearFilter;
colorMap.anisotropy = renderer.capabilities.getMaxAnisotropy();
var normalMap = new THREE.TextureLoader().load('images/normal.png');
normalMap.minFilter = THREE.LinearFilter;
normalMap.anisotropy = renderer.capabilities.getMaxAnisotropy();
var aoMap = new THREE.TextureLoader().load('images/ambient_occlusion.png');
aoMap.minFilter = THREE.LinearFilter;
aoMap.anisotropy = renderer.capabilities.getMaxAnisotropy();

// TODO: load texture for environment mapping


// Uniforms
var cameraPositionUniform = {type: "v3", value: camera.position};
var lightColorUniform = {type: "c", value: new THREE.Vector3(1.0, 1.0, 1.0)};
var ambientColorUniform = {type: "c", value: new THREE.Vector3(1.0, 1.0, 1.0)};
var lightDirectionUniform = {type: "v3", value: lightDirection};
var kAmbientUniform = {type: "f", value: 0.1};
var kDiffuseUniform = {type: "f", value: 0.8};
var kSpecularUniform = {type: "f", value: 0.4};
var shininessUniform = {type: "f", value: 50.0};
var armadilloPosition = { type: 'v3', value: new THREE.Vector3(0.0,0.0,0.0)};

var lightViewMatrixUniform = {type: "m4", value: shadowMap_Camera.matrixWorldInverse};
var lightProjectMatrixUniform = {type: "m4", value: shadowMap_Camera.projectionMatrix};
// reflective spheres
var reflectivePosition = {type: 'v3', value: new THREE.Vector3(1, 5, 0)};
var reflectiveRotationAngle = {type: 'f', value: 0.0};

var reflectivePosition2 = {type: 'v3', value: new THREE.Vector3(3, 3, 0)};
var reflectiveRotationAngle2 = {type: 'f', value: 0.0};

var pointLight, sun, moon, earth, earthOrbit, ring, controls, scene, camera, renderer, scene;
var planetSegments = 48;
var earthData = constructPlanetData(365.2564, 0.015, 25, "earth", "images/earth.jpg", 1, planetSegments);
var moonData = constructPlanetData(29.5, 0.01, 2.8, "moon", "images/moon.jpg", 0.5, planetSegments);
var orbitData = {value: 200, runOrbit: true, runRotation: true};




// Materials
var depthFloorMaterial = new THREE.ShaderMaterial({});

var depthArmadilloMaterial = new THREE.ShaderMaterial({
  uniforms: {
    armadilloPosition: armadilloPosition
  }
});

var terrainMaterial = new THREE.ShaderMaterial({
  uniforms: {
    lightColor: lightColorUniform,
    ambientColor: ambientColorUniform,
    lightDirection: lightDirectionUniform,
    kAmbient: kAmbientUniform,
    kDiffuse: kDiffuseUniform,
    kSpecular: kSpecularUniform,
    shininess: shininessUniform,
    colorMap: { type: "t", value: colorMap },
    normalMap: { type: "t", value: normalMap },
    aoMap: { type: "t", value: aoMap },
    shadowMap: { type: "t", value: shadowMap },
    //shadowMap: { type: "t", value: shadowMap },
  lightViewMatrixUniform: lightViewMatrixUniform,
  lightProjectMatrixUniform: lightProjectMatrixUniform
  }
});

// Skybox texture
// TODO: set up the texture for skybox
var skyboxCubemap = new THREE.CubeTextureLoader();
//skyboxCubemap.format = THREE.RGBFormat;
var skyboxCubemap = new THREE.CubeTextureLoader()
  .setPath( 'images/' )
  .load( [
  'posx.png', 'negx.png',
  'posy.png', 'negy.png',
  'posz.png', 'negz.png'
  ] );

  var skyboxCubemap2 = new THREE.CubeTextureLoader()
    .setPath( 'images/skyboxmap/' )
    .load( [
    'cube1.png', 'cube2.png',
    'cube3.png', 'cube4.png',
    'cube5.png', 'cube6.png'
    ] );

// TODO: set up the material for skybox
//var skyboxMaterial = new THREE.ShaderMaterial({ });
var skyboxMaterial = new THREE.ShaderMaterial({
	uniforms: {
		skybox: { type: "t", value: skyboxCubemap },
	},
    side: THREE.DoubleSide
})

var armadilloMaterial = new THREE.ShaderMaterial({
  uniforms: {
    lightColor: lightColorUniform,
    ambientColor: ambientColorUniform,
    lightDirection: lightDirectionUniform,
    kAmbient: kAmbientUniform,
    kDiffuse: kDiffuseUniform,
    kSpecular: kSpecularUniform,
    shininess: shininessUniform,
    armadilloPosition: armadilloPosition
  }
});


// TODO: set up the material for environment mapping
var envmapMaterial = new THREE.ShaderMaterial({
  uniforms: {
    skybox: { type: "t", value: skyboxCubemap },
    reflectivePosition: reflectivePosition,
    reflectiveRotationAngle: reflectiveRotationAngle
  }
 });

 var envmapMaterial2 = new THREE.ShaderMaterial({
 	uniforms: {
 		skybox: { type: "t", value: skyboxCubemap2 },
 		reflectivePosition: reflectivePosition2,
 		reflectiveRotationAngle: reflectiveRotationAngle2
 	},
     side: THREE.DoubleSide
 })

 // TODO: set up the material for environment mapping
 var refractionMaterial = new THREE.ShaderMaterial({
   uniforms: {
     skybox: { type: "t", value: skyboxCubemap },
   }
  });

// Load shaders
var shaderFiles = [
  'glsl/depth.vs.glsl',
  'glsl/depth.fs.glsl',

  'glsl/terrain.vs.glsl',
  'glsl/terrain.fs.glsl',

  'glsl/bphong.vs.glsl',
  'glsl/bphong.fs.glsl',

  'glsl/skybox.vs.glsl',
  'glsl/skybox.fs.glsl',

  'glsl/refraction.vs.glsl',
  'glsl/refraction.fs.glsl',

  'glsl/envmap2.vs.glsl',
  'glsl/envmap2.fs.glsl',

  'glsl/envmap.vs.glsl',
  'glsl/envmap.fs.glsl'
];

new THREE.SourceLoader().load(shaderFiles, function(shaders) {
  depthFloorMaterial.vertexShader = shaders['glsl/depth.vs.glsl'];
  depthFloorMaterial.fragmentShader = shaders['glsl/depth.fs.glsl'];

  depthArmadilloMaterial.vertexShader = shaders['glsl/bphong.vs.glsl'];
  depthArmadilloMaterial.fragmentShader = shaders['glsl/depth.fs.glsl'];

  terrainMaterial.vertexShader = shaders['glsl/terrain.vs.glsl'];
  terrainMaterial.fragmentShader = shaders['glsl/terrain.fs.glsl'];

  armadilloMaterial.vertexShader = shaders['glsl/bphong.vs.glsl'];
  armadilloMaterial.fragmentShader = shaders['glsl/bphong.fs.glsl'];

  skyboxMaterial.vertexShader = shaders['glsl/skybox.vs.glsl'];
  skyboxMaterial.fragmentShader = shaders['glsl/skybox.fs.glsl'];

  envmapMaterial.vertexShader = shaders['glsl/envmap.vs.glsl'];
  envmapMaterial.fragmentShader = shaders['glsl/envmap.fs.glsl'];

  envmapMaterial2.vertexShader = shaders['glsl/envmap2.vs.glsl'];
  envmapMaterial2.fragmentShader = shaders['glsl/envmap2.fs.glsl'];

  refractionMaterial.vertexShader = shaders['glsl/refraction.vs.glsl'];
  refractionMaterial.fragmentShader = shaders['glsl/refraction.fs.glsl'];
});

// var ctx = renderer.context;
// stops shader warnings, seen in some browsers
// ctx.getShaderInfoLog = function () { return '' };

// Adding objects
// LOAD OBJ ROUTINE
// mode is the scene where the model will be inserted
function loadOBJ(scene, file, material, scale, xOff, yOff, zOff, xRot, yRot, zRot) {
  var onProgress = function(query) {
    if (query.lengthComputable) {
      var percentComplete = query.loaded / query.total * 100;
      console.log(Math.round(percentComplete, 2) + '% downloaded');
    }
  };

  var onError = function() {
    console.log('Failed to load ' + file);
  };

  var loader = new THREE.OBJLoader();
  loader.load(file, function(object) {
    object.traverse(function(child) {
      if (child instanceof THREE.Mesh) {
        child.material = material;
      }
    });

    object.position.set(xOff, yOff, zOff);
    object.rotation.x = xRot;
    object.rotation.y = yRot;
    object.rotation.z = zRot;
    object.scale.set(scale, scale, scale);
    scene.add(object);
  }, onProgress, onError);
}

function getPointLight(intensity, color) {
    var light = new THREE.PointLight(color, intensity);
    light.castShadow = true;

    light.shadow.bias = 0.001;
    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;
    return light;
}

function getSphere(material, size, segments) {
    var geometry = new THREE.SphereGeometry(size, segments, segments);
    var obj = new THREE.Mesh(geometry, material);
    obj.castShadow = true;

    return obj;
}

function getMaterial(type, color, myTexture) {
    var materialOptions = {
        color: color === undefined ? 'rgb(255, 255, 255)' : color,
        map: myTexture === undefined ? null : myTexture
    };

    switch (type) {
        case 'basic':
            return new THREE.MeshBasicMaterial(materialOptions);
        case 'lambert':
            return new THREE.MeshLambertMaterial(materialOptions);
        case 'phong':
            return new THREE.MeshPhongMaterial(materialOptions);
        case 'standard':
            return new THREE.MeshStandardMaterial(materialOptions);
        default:
            return new THREE.MeshBasicMaterial(materialOptions);
    }
}

function loadTexturedPlanet(myData, x, y, z, myMaterialType) {
    var myMaterial;
    var passThisTexture;

    if (myData.texture && myData.texture !== "") {
        passThisTexture = new THREE.ImageUtils.loadTexture(myData.texture);
    }
    if (myMaterialType) {
        myMaterial = getMaterial(myMaterialType, "rgb(255, 255, 255 )", passThisTexture);
    } else {
        myMaterial = getMaterial("lambert", "rgb(255, 255, 255 )", passThisTexture);
    }

    myMaterial.receiveShadow = true;
    myMaterial.castShadow = true;
    var myPlanet = getSphere(myMaterial, myData.size, myData.segments);
    myPlanet.receiveShadow = true;
    myPlanet.name = myData.name;
    finalScene.add(myPlanet);
    myPlanet.position.set(x, y, z);

    return myPlanet;
}

function getTube(size, innerDiameter, facets, myColor, name, distanceFromAxis) {
    var ringGeometry = new THREE.TorusGeometry(size, innerDiameter, facets, facets);
    var ringMaterial = new THREE.MeshBasicMaterial({color: myColor, side: THREE.DoubleSide});
    myRing = new THREE.Mesh(ringGeometry, ringMaterial);
    myRing.name = name;
    myRing.position.set(distanceFromAxis, 0, 0);
    myRing.rotation.x = Math.PI / 2;
    finalScene.add(myRing);
    return myRing;
}

function constructPlanetData(myOrbitRate, myRotationRate, myDistanceFromAxis, myName, myTexture, mySize, mySegments) {
    return {
        orbitRate: myOrbitRate
        , rotationRate: myRotationRate
        , distanceFromAxis: myDistanceFromAxis
        , name: myName
        , texture: myTexture
        , size: mySize
        , segments: mySegments
    };
}

function getRing(size, innerDiameter, facets, myColor, name, distanceFromAxis) {
    var ring1Geometry = new THREE.RingGeometry(size, innerDiameter, facets);
    var ring1Material = new THREE.MeshBasicMaterial({color: myColor, side: THREE.DoubleSide});
    var myRing = new THREE.Mesh(ring1Geometry, ring1Material);
    myRing.name = name;
    myRing.position.set(distanceFromAxis, 0, 0);
    myRing.rotation.x = Math.PI / 2;
    finalScene.add(myRing);
    return myRing;
}
function createVisibleOrbits() {
    var orbitWidth = 0.01;
    earthOrbit = getRing(earthData.distanceFromAxis + orbitWidth
        , earthData.distanceFromAxis - orbitWidth
        , 320
        , 0xffffff
        , "earthOrbit"
        , 0);
}

function movePlanet(myPlanet, myData, myTime, stopRotation) {
    if (orbitData.runRotation && !stopRotation) {
        myPlanet.rotation.y += myData.rotationRate;
    }
    if (orbitData.runOrbit) {
        myPlanet.position.x = Math.cos(myTime
                * (1.0 / (myData.orbitRate * orbitData.value)) + 10.0)
                * myData.distanceFromAxis;
        myPlanet.position.z = Math.sin(myTime
                * (1.0 / (myData.orbitRate * orbitData.value)) + 10.0)
                * myData.distanceFromAxis;
    }
}

function moveMoon(myMoon, myPlanet, myData, myTime) {
    movePlanet(myMoon, myData, myTime);
    if (orbitData.runOrbit) {
        myMoon.position.x = myMoon.position.x + myPlanet.position.x;
        myMoon.position.z = myMoon.position.z + myPlanet.position.z;
    }
}


var terrainGeometry = new THREE.PlaneBufferGeometry(10, 10);

var terrainShadow = new THREE.Mesh(terrainGeometry, depthFloorMaterial);
terrainShadow.rotation.set(-1.57, 0, 0);
depthScene.add(terrainShadow);

var terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
terrain.rotation.set(-1.57, 0, 0);
//finalScene.add(terrain);

var skybox = new THREE.Mesh(new THREE.BoxGeometry( 1000, 1000, 1000 ), skyboxMaterial);
finalScene.add(skybox);

loadOBJ(depthScene, 'obj/armadillo.obj', depthArmadilloMaterial, 1.0, -1.0, 1.0, 0, 0, 0, 0);
//loadOBJ(finalScene, 'obj/armadillo.obj', armadilloMaterial,      1.0, -1.0, 1.0, 0, 0, 0, 0);
//loadOBJ(finalScene, 'obj/armadillo.obj', refractionMaterial,         1.0, 2.0, 1.0, 0, 0, 0, 0);
// add reflection spheres
var mapSphere = new THREE.SphereGeometry(1, 32, 32);
//var rotateSphere = new THREE.SphereGeometry(1, 32, 32);
// var reflectionSphere = new THREE.Mesh(rotateSphere, reflectionMaterial);
// finalScene.add(reflectionSphere);

var reflectionSphere2 = new THREE.Mesh(mapSphere, envmapMaterial2);
finalScene.add(reflectionSphere2);

var sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
var sphere = new THREE.Mesh(sphereGeometry, envmapMaterial);
sphere.position.set(0, 1, -2);
finalScene.add(sphere);

var pointLight = getPointLight(1.5, "rgb(255, 220, 180)");
finalScene.add(pointLight);
// Create the sun.
var sunMaterial = getMaterial("basic", "rgb(255, 255, 255)");
sun = getSphere(sunMaterial, 2, 48);
finalScene.add(sun);
// Create the Earth, the Moon, and a ring around the earth.
earth = loadTexturedPlanet(earthData, earthData.distanceFromAxis, 0, 0);
moon = loadTexturedPlanet(moonData, moonData.distanceFromAxis, 0, 0);
ring = getTube(1.8, 0.05, 480, 0x757064, "ring", earthData.distanceFromAxis);

// Create the glow of the sun.
var spriteMaterial = new THREE.SpriteMaterial(
        {
            map: new THREE.ImageUtils.loadTexture("images/glow.png")
            , useScreenCoordinates: false
            , color: 0xffffee
            , transparent: false
            , blending: THREE.AdditiveBlending
        });
var sprite = new THREE.Sprite(spriteMaterial);
sprite.scale.set(70, 70, 1.0);
sun.add(sprite);


// Input
var keyboard = new THREEx.KeyboardState();

function checkKeyboard() {
  if (keyboard.pressed("A"))
    armadilloPosition.value.x -= 0.1;
  if (keyboard.pressed("D"))
    armadilloPosition.value.x += 0.1;
  if (keyboard.pressed("W"))
    armadilloPosition.value.z -= 0.1;
  if (keyboard.pressed("S"))
    armadilloPosition.value.z += 0.1;
}

function updateMaterials() {
  cameraPositionUniform.value = camera.position;

  depthFloorMaterial.needsUpdate = true;
  depthArmadilloMaterial.needsUpdate = true;
  terrainMaterial.needsUpdate = true;
  armadilloMaterial.needsUpdate = true;
  skyboxMaterial.needsUpdate = true;
  envmapMaterial.needsUpdate = true;
  envmapMaterial2.needsUpdate = true;
  reflectiveRotationAngle.value = (Date.now()* 0.001)%100;
	reflectiveRotationAngle2.value = (Date.now()* 0.002)%365;
}

function playAudio(){
  // create an AudioListener and add it to the camera
var listener = new THREE.AudioListener();
camera.add( listener );

// create a global audio source
var sound = new THREE.Audio( listener );

// load a sound and set it as the Audio object's buffer
var audioLoader = new THREE.AudioLoader();
audioLoader.load( 'sounds/Summer.mp3', function( buffer ) {
sound.setBuffer( buffer );
sound.setLoop( true );
sound.setVolume( 0.5 );
sound.play();
});
}

// Update routine
function update() {
  checkKeyboard();
      createVisibleOrbits();
  updateMaterials();
  playAudio();

    var time = Date.now();
  movePlanet(earth, earthData, time);
  movePlanet(ring, earthData, time, true);
  moveMoon(moon, earth, moonData, time);

  requestAnimationFrame(update);
  // render depthScene to shadowMap target (instead of canvas as usual)
  renderer.render(depthScene, shadowMap_Camera, shadowMap);
  // render finalScene to the canvas
  renderer.render(finalScene, camera);

  var gui = new dai.GUI();
  //var folder1 = gui.addFolder('light');
  //folder1.add(pointLight, 'intensity', 0, 10);
  var folder2 = gui.addFolder('speed');
  folder2.add(orbitData, 'value', 0, 500);
  folder2.add(orbitData, 'runOrbit', 0, 1);
  folder2.add(orbitData, 'runRotation', 0, 1);

  // UNCOMMENT to see the shadowmap values
 //renderer.render(depthScene, shadowMap_Camera);

  // UNCOMMENT BELOW FOR VR CAMERA
  // ------------------------------
  // Update VR headset position and apply to camera.
  // controls.update();
  // ------------------------------
  // UNCOMMENT ABOVE FOR VR CAMERA
}

resize();
update();
