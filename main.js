
const scale = 12.0;
const wallDepth = 0.5; // ft
const wallHeight = 10.0;
const verticalShift = 1.5;
const musicInitVol = 0.5;
const voiceInitVol = 0.0;
const voiceDistance = 0.2;
const cameraX = 10.0;
const cameraY = 5.5;
const cameraZ = -10.0;
const jumpNumOfWall = 5;
//const wallColor1 = 'ivory';
const wallColor1 = 'white';
const wallColor2 = 'whitesmoke';
const skyColor = 'dimgray';
const eps = 0.01;
const frameShort = 18;
const frameLong = 22;
const frameDepth = 1;
const lowerY = 51;
const upperY = 77;

import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

let camera, scene, renderer, controls, textureLoader, music;
music = undefined;
let dirLight, spotLight;
let wallA, wallB, wallC, wallE, wallF, wallG, wallH, wallK, wallN;
let audioListener, audioLoader;
const audioDevices = [];
const objects = [];

let raycaster;

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let moveUp = false;
let moveDown = false;
let canJump = false;

let prevTime = performance.now();
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const vertex = new THREE.Vector3();
const color = new THREE.Color();

let frameMaterial; 
const matMaterial = new THREE.MeshBasicMaterial({ color: 'white'});
const floorMat = new THREE.MeshStandardMaterial( { roughness: 0.8, color: 0xffffff, metalness: 0.2, bumpScale: 1 } );
const boxMaterial1 = new THREE.MeshBasicMaterial({ color: wallColor1});
const boxMaterial2 = new THREE.MeshBasicMaterial({ color: wallColor2});

const largeCanvasGeometry = new THREE.BoxGeometry(scale * 4 , scale * 5, scale*wallDepth).toNonIndexed();
const labelGeometry = new THREE.BoxGeometry(16, 22, 0.2).toNonIndexed();
const labelGeometry2 = new THREE.BoxGeometry(0.2, 22, 16).toNonIndexed();

init();
function initLights() {
    // scene.add( new THREE.AmbientLight( 0x404040, 3 ) );
    spotLight = new THREE.SpotLight( 0xffffff, 500 );
    spotLight.name = 'Spot Light';
    spotLight.angle = Math.PI / 5;
    spotLight.penumbra = 0.3;
    spotLight.position.set( 2*scale, 10 * scale, 3*scale );
    spotLight.castShadow = true;
    spotLight.shadow.camera.near = 8;
    spotLight.shadow.camera.far = 30;
    spotLight.shadow.mapSize.width = 1024;
    spotLight.shadow.mapSize.height = 1024;
    scene.add( spotLight );

    dirLight = new THREE.DirectionalLight( 0xffffff, 3 );
    dirLight.name = 'Dir. Light';
    dirLight.position.set( 8 * scale, 13 * scale, 10*scale );
    dirLight.castShadow = true;
    dirLight.shadow.camera.near = 1;
    dirLight.shadow.camera.far = 10;
    dirLight.shadow.camera.right = 55;
    dirLight.shadow.camera.left = - 55;
    dirLight.shadow.camera.top	= 55;
    dirLight.shadow.camera.bottom = - 55;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add( dirLight );
}
function initControls() {
    controls = new PointerLockControls( camera, document.body );

    const blocker = document.getElementById( 'blocker' );
    const instructions = document.getElementById( 'instructions' );

    instructions.addEventListener( 'click', function () {
	controls.lock();
    } );

    controls.addEventListener( 'lock', function () {
        instructions.style.display = 'none';
        blocker.style.display = 'none';
    } );
    controls.addEventListener( 'unlock', function () {
        blocker.style.display = 'block';
	instructions.style.display = '';
    } );
    scene.add( controls.object );
}
function initKeyEvents() {
    const onKeyDown = function ( event ) {
	switch ( event.code ) {
	case 'BracketLeft':
		audioDevices.forEach((audio)=> audio.setVolume( audio.getVolume() * 0.9 ));
		break;
	case 'BracketRight':
		audioDevices.forEach((audio)=> audio.setVolume( audio.getVolume() * 1.1 ));
		break;

	case 'ArrowUp':
	case 'KeyW':
		moveForward = true;
		break;

	case 'ArrowLeft':
	case 'KeyA':
		moveLeft = true;
		break;

	case 'ArrowDown':
	case 'KeyS':
		moveBackward = true;
		break;

	case 'ArrowRight':
	case 'KeyD':
		moveRight = true;
		break;

	case 'Space':
		if ( canJump === true ) velocity.y = wallHeight*jumpNumOfWall*scale;
		canJump = false;
		break;
	case 'KeyU':
		moveUp = true;
		velocity.y = verticalShift*scale;
		break;
	case 'KeyM':
		moveDown = true;
		velocity.y = verticalShift*scale;
		break;
	}
    };
    const onKeyUp = function ( event ) {
	switch ( event.code ) {
	case 'ArrowUp':
	case 'KeyW':
		moveForward = false;
		break;

	case 'ArrowLeft':
	case 'KeyA':
		moveLeft = false;
		break;

	case 'ArrowDown':
	case 'KeyS':
		moveBackward = false;
		break;

	case 'ArrowRight':
	case 'KeyD':
		moveRight = false;
		break;

	case 'KeyU':
		moveUp = false;
		break;
	case 'KeyM':
		moveDown = false;
		break;
	}
    };
	
    document.addEventListener( 'keydown', onKeyDown );
    document.addEventListener( 'keyup', onKeyUp );
}
function initFloor() {
    textureLoader.load( 'img/hardwood2_diffuse.jpg', function ( map ) {
	map.wrapS = THREE.RepeatWrapping;
	map.wrapT = THREE.RepeatWrapping;
	map.anisotropy = 4;
	map.repeat.set( 10, 24 );
	map.colorSpace = THREE.SRGBColorSpace;
	floorMat.map = map;
	floorMat.needsUpdate = true;

    } );
    textureLoader.load( 'img/hardwood2_bump.jpg', function ( map ) {
	map.wrapS = THREE.RepeatWrapping;
	map.wrapT = THREE.RepeatWrapping;
	map.anisotropy = 4;
	map.repeat.set( 10, 24 );
	floorMat.bumpMap = map;
	floorMat.needsUpdate = true;
    } );
    textureLoader.load( 'img/hardwood2_roughness.jpg', function ( map ) {
	map.wrapS = THREE.RepeatWrapping;
	map.wrapT = THREE.RepeatWrapping;
	map.anisotropy = 4;
	map.repeat.set( 10, 24 );
	floorMat.roughnessMap = map;
	floorMat.needsUpdate = true;
    } );
    let floorGeometry = new THREE.PlaneGeometry( 2000, 2000, 100, 100 );
    const floorMesh = new THREE.Mesh( floorGeometry, floorMat );
    floorMesh.receiveShadow = true;
    floorMesh.rotation.x = - Math.PI / 2.0;
    scene.add( floorMesh );
}
function initWalls() {

    let wallInfo = [
	  {width: 7 + wallDepth,    depth: wallDepth, height: wallHeight, x: -wallDepth, y:0, z: -wallDepth}, // a and p
	  {width: 7 + wallDepth,    depth: wallDepth, height: wallHeight, x: 13, y:0, z: -wallDepth},  // b and d
	  {width: 20 + 2*wallDepth,    depth: wallDepth, height: 2, x: -wallDepth, y:8, z: -wallDepth}, // banner
	  {width: 20 + 2*wallDepth, depth: wallDepth, height: wallHeight, x: -wallDepth, y:0, z: 20}, // g and m
	  {width: wallDepth,        depth:20 + 2 * wallDepth, height: wallHeight, x: 20, y:0, z: -wallDepth+eps},  // e
	  {width: wallDepth,        depth:20 + 2 * wallDepth, height: wallHeight, x: -wallDepth, y:0, z: -wallDepth+eps}, // n
	  {width: wallDepth,        depth:4, x: 10-wallDepth/2.0, height: wallHeight, y:0, z: 20-4+eps}, // h and l
	  {width: wallDepth,        depth:8, x: 14+eps, height: wallHeight, y:0, z: 5+eps}, // f and i
	  {width: wallDepth,        depth:8, x: 5.5-eps, height: wallHeight, y:0, z: 5+eps}, // k and o
	  {width: 8+2*wallDepth, depth:wallDepth, height: wallHeight, x: 5.5, y:0, z: 5}, // c and j
    ];
    wallA = wallInfo[0];
    wallB = wallInfo[1];
    wallC = wallInfo[9];
    wallE = wallInfo[4];
    wallF = wallInfo[7];
    wallG = wallInfo[3];
    wallH = wallInfo[6];
    wallK = wallInfo[8];
    wallN = wallInfo[5];

    for (let i = 0; i < wallInfo.length; i++) {
	  const info = wallInfo[i];
	  const boxGeometry = new THREE.BoxGeometry(scale * info.width , scale * info.height, scale * info.depth).toNonIndexed();
	  const boxMaterial = info.width > info.depth ? boxMaterial1 : boxMaterial2;
	  const wall = new THREE.Mesh( boxGeometry, boxMaterial );
	  wall.position.x = (info.x + info.width / 2.0) * scale;
	  wall.position.z = (info.z + info.depth / 2.0) * scale;;
	  wall.position.y = (info.y + info.height / 2.0) * scale;
	  wall.castShadow = true;
	  wall.receiveShadow = true;
	  scene.add( wall );
	  objects.push( wall );
    }
    textureLoader.load( 'img/blackwood.png', function ( texture ) {
	frameMaterial = new THREE.MeshBasicMaterial({ map: texture });
	// perform the following initialization after we create frameMaterial
        initFrontWalls();
        initOtherWalls();	
    } );
}
function initRenderer() {
	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.setAnimationLoop( animate );
	renderer.shadowMap.enabled = true;
	// renderer.shadowMap.type = THREE.BasicShadowMap;
	renderer.shadowMap.type = THREE.PCFShadowMap 
	
	document.body.appendChild( renderer.domElement );
	window.addEventListener( 'resize', onWindowResize );
}
function initCamera() {
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );
    camera.position.y = cameraY * scale;
    camera.position.x = cameraX * scale;
    camera.position.z = cameraZ * scale;
}
function addBox(geometry, material, x, y, z) {
     const canvas = new THREE.Mesh(geometry, material );
     canvas.position.x = x;
     canvas.position.y = y;
     canvas.position.z = z;
     // only cast shadow on frame or large canvas for performance reason.
     canvas.castShadow = (material == frameMaterial || geometry == largeCanvasGeometry);
     scene.add( canvas );
     return canvas;
}
function initTitle() {
    textureLoader.load( 'img/title.jpg', function ( texture ) {
	let canvas = addBox(
	    new THREE.BoxGeometry(72, 24, 0.2).toNonIndexed(),
	    new THREE.MeshBasicMaterial({ map: texture }),
	    10 * scale,
	    9 * scale,
	    -wallDepth*scale -0.1);
   } );                       
}
function init() {
    initCamera();
    scene = new THREE.Scene();
    scene.background = new THREE.Color( skyColor );
    raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 10 );
    textureLoader = new THREE.TextureLoader();
    initLights();
    initControls();
    initKeyEvents();
    initFloor();
    initWalls();
    initRenderer();
    initAudio();
}
function addVoice(label, file) {
/* Temp remove until figure how to use it.
	// create a global audio source
	const voice = new THREE.PositionalAudio( audioListener );
	// load a sound and set it as the Audio object's buffer
	audioLoader.load( './audio/' + file, function( buffer ) {
		voice.setBuffer( buffer );
		voice.setLoop( true );
		voice.setVolume(voiceInitVol);
		voice.setRefDistance( voiceDistance * scale );
		voice.play();
		audioDevices.push(voice);
	});
 */
}
                        			
function initAudio() {
	// create an AudioListener and add it to the camera
	audioListener = new THREE.AudioListener();
	audioLoader = new THREE.AudioLoader();
	camera.add( audioListener );
	    
	// create a global audio source
	music = new THREE.Audio( audioListener );
	// load a sound and set it as the Audio object's buffer
	audioLoader.load( './audio/audio1.mp4', function( buffer ) {
		music.setBuffer( buffer );
		music.setLoop( true );
		music.setVolume(musicInitVol);
		music.play();
		audioDevices.push(music);
	});
}

function initFrontWalls() {
	initTitle();
	initWallA();
	initWallB();
	initWallC();
}

function initOtherWalls() {
	// Separate the loading to avoid blocking
	setTimeout(initWallE, 1000);
	setTimeout(initWallN, 1100);
	
	setTimeout(initWallG, 1200);
	setTimeout(initWallM, 1300);
	
	setTimeout(initWallF, 1400);
	setTimeout(initWallO, 1500);
	
	setTimeout(initWallD, 1600);
	setTimeout(initWallP, 1700);
	
	setTimeout(initWallH, 1800);
	setTimeout(initWallL, 1900);
	
	setTimeout(initWallI, 2000);
	setTimeout(initWallK, 2100);
	
	setTimeout(initWallJ, 2200);
}
function initWallA() {
	textureLoader.load( 'img/F101.jpg', function ( texture ) {
		let canvas = addBox(largeCanvasGeometry, 
		    new THREE.MeshBasicMaterial({ map: texture }),
		    2.5 * scale,
		    (2+5/2) * scale,
		    -wallDepth/2*scale -0.5);
		camera.lookAt(canvas.position);
	} );
	textureLoader.load( 'img/bio.jpg', function ( texture ) {
		let label = addBox(labelGeometry, 
		    new THREE.MeshBasicMaterial({ map: texture }),
		    (3.2+2.5) * scale,
		    (2+5/2) * scale,
		    -wallDepth*scale -0.1);
		addVoice(label, 'bio.m4a');
	} );
}
function initWallB() {
	textureLoader.load( 'img/F102.jpg', function ( texture ) {
		addBox(largeCanvasGeometry, 
		    new THREE.MeshBasicMaterial({ map: texture }),
		    17.5 * scale,
		    (2+5/2) * scale,
		    -wallDepth/2*scale -0.5);
	} );
	textureLoader.load( 'img/statement.jpg', function ( texture ) {
		let label = addBox(labelGeometry, 
		    new THREE.MeshBasicMaterial({ map: texture }),
		    (-3.2+17.5) * scale,
		    (2+5/2) * scale,
		    -wallDepth*scale -0.1);
		addVoice(label, 'statement.m4a');
	} );
}

function addFrameArtwork(name, frameGeometry, matGeometry, x, y, z, xd, yd, zd, xp, yp, zp) {
        const artGeometry = new THREE.BoxGeometry(xp, yp, zp).toNonIndexed();
	textureLoader.load( 'img/' + name, function ( texture ) {
		addBox(frameGeometry, frameMaterial, x, y, z);
		addBox(matGeometry, matMaterial, x + xd, y + yd, z +zd);
		addBox(artGeometry, new THREE.MeshBasicMaterial({ map: texture }),
		       x+2*xd, y+2*yd, z+2*zd);
	} );
} 
function initWallC() {
	const paintings = [
		{name: 'F105.jpg', width: 8, height: 11},
		{name: 'F114.jpg', width: 8, height: 11},
		{name: 'F108.jpg', width: 8, height: 11},
		{name: 'F110.jpg', width: 8, height: 11},
		{name: 'F103.jpg', width: 14, height: 17},
		{name: 'F104.jpg', width: 14, height: 17},
	];
	const frameGeometry = new THREE.BoxGeometry(frameShort , frameLong , frameDepth).toNonIndexed();
	const matGeometry = new THREE.BoxGeometry(frameShort-2 , frameLong-2 , frameDepth).toNonIndexed();
	for (let i = 0; i < paintings.length; i++) {
		const painting = paintings[i];
		const column = (i-(i%2))/2;
		const x = (9+column*2) * scale;
		const y = (i % 2 == 0) ? upperY : lowerY;
		const z = wallC.z*scale - frameDepth/2 - eps;

                const xd = 0;
                const yd = 0;
                const zd = -eps;
                addFrameArtwork(painting.name, frameGeometry, matGeometry, x, y, z, xd, yd, zd, painting.width, painting.height, frameDepth);
	}
	textureLoader.load( 'img/theme.jpg', function ( texture ) {
		let canvas = addBox(labelGeometry, 
		    new THREE.MeshBasicMaterial({ map: texture }),
		    7 * scale,
		    upperY,
		    wallC.z*scale -0.1);
	} );
	textureLoader.load( 'img/self.jpg', function ( texture ) {
		let canvas = addBox(labelGeometry, 
		    new THREE.MeshBasicMaterial({ map: texture }),
		    7 * scale,
		    lowerY,
		    wallC.z*scale -0.1);
	} );
}
function initWallD() {
	const paintings = [
		'F113.jpg', 'F117.jpg', 'F106.jpg', 'F120.jpg'
	];
	{
		const x = (14.2+2.4)*scale;
		const y = 48+19;
		const z = frameDepth/2;
                const frameGeometry = new THREE.BoxGeometry(29 , 42 , frameDepth).toNonIndexed();
                const matGeometry = new THREE.BoxGeometry(24 , 36 , frameDepth).toNonIndexed();
                addFrameArtwork('F130.jpg', frameGeometry, matGeometry, x, y, z, 0, 0, eps, 24 , 36, frameDepth);
	}
	const frameGeometry = new THREE.BoxGeometry(frameShort , frameLong , frameDepth).toNonIndexed();
	const matGeometry = new THREE.BoxGeometry(frameShort-2 , frameLong-2 , frameDepth).toNonIndexed();
	for (let i = 0; i < paintings.length; i++) {
		const painting = paintings[i];
		const column = (i-(i%2))/2;
		const x = (14.2+column*4.8) * scale;
		const y = (i % 2 == 0) ? upperY : lowerY;
		const z = frameDepth/2;
                addFrameArtwork(painting, frameGeometry, matGeometry, x, y, z, 0, 0, eps, 8, 11 , frameDepth);
	}
}
function initWallE() {
	const paintings = [
		{name: 'F115.jpg', width: 8, height: 11},
		{name: 'F121.jpg', width: 8, height: 11},
		{name: 'F119.jpg', width: 5, height: 7},
		{name: 'F122.jpg', width: 8, height: 11},
		{name: 'F111.jpg', width: 8, height: 11},
		{name: 'F123.jpg', width: 8, height: 11},
		{name: 'F107.jpg', width: 8, height: 11},
		{name: 'F112.jpg', width: 8, height: 11},
		undefined,
		undefined,
		{name: 'F205.jpg', width: 8, height: 11},
		{name: 'F206.jpg', width: 8, height: 11},
		{name: 'F210.jpg', width: 8, height: 11},
		{name: 'F211.jpg', width: 8, height: 11},
		{name: 'F212.jpg', width: 8, height: 11},
		{name: 'F203.jpg', width: 6, height: 8},
		{name: 'F202.jpg', width: 11, height: 8},
		{name: 'F204.jpg', width: 8, height: 6},
		{name: 'F213.jpg', width: 11, height: 8},
		{name: 'F207.jpg', width: 11, height: 8},
	];
	const matGeometryP = new THREE.BoxGeometry(frameDepth, frameLong-2 , frameShort-2).toNonIndexed();
	const frameGeometryP = new THREE.BoxGeometry(frameDepth , frameLong , frameShort).toNonIndexed();
	const matGeometryL = new THREE.BoxGeometry(frameDepth, frameShort-2 , frameLong-2).toNonIndexed();
	const frameGeometryL = new THREE.BoxGeometry(frameDepth , frameShort , frameLong).toNonIndexed();
	
	const x = wallE.x * scale - frameDepth/2 - eps;
	
	for (let i = 0; i < paintings.length; i++) {
		const painting =  paintings[i];
		if ( painting ) {
			const column = (i-(i%2))/2;
			const z = (1+column*2) * scale;
			const y = (i % 2 == 0) ? upperY : lowerY;
			if (painting.width < painting.height) {
			      	// Portrait
                		addFrameArtwork(painting.name, frameGeometryP, matGeometryP, x, y, z, -eps, 0, 0, frameDepth, painting.height, painting.width);
			} else {
				// Landscape
                		addFrameArtwork(painting.name, frameGeometryL, matGeometryL, x, y, z, -eps, 0, 0, frameDepth, painting.height, painting.width);
			}
		}
	}
	textureLoader.load( 'img/family.jpg', function ( texture ) {
		let label = addBox(labelGeometry2, 
		    			new THREE.MeshBasicMaterial({ map: texture }),
		  			wallE.x * scale - 0.1,
		  			(upperY+lowerY)/2,
		 			(1+4*2) * scale);
		addVoice(label, 'family.m4a');
	} );
}
function initWallF() {
	const paintings = [
		{name: 'F109.jpg', width: 8, height: 11},
		{name: 'F118.jpg', width: 8, height: 11},
		{name: 'F124.jpg', width: 8, height: 11},
		{name: 'F126.jpg', width: 8, height: 11},
		{name: 'F125.jpg', width: 8, height: 11},
		{name: 'F127.jpg', width: 8, height: 11},
		{name: 'F128.jpg', width: 8, height: 11},
		{name: 'F129.jpg', width: 8, height: 11},
	];
	const frameGeometry = new THREE.BoxGeometry(frameDepth , frameLong , frameShort).toNonIndexed();
	const matGeometry = new THREE.BoxGeometry(frameDepth , frameLong-2 , frameShort-2).toNonIndexed();
	for (let i = 0; i < paintings.length; i++) {
		const painting = paintings[i];
		const column = (i-(i%2))/2;
		const x = (scale*(wallF.x+wallF.width))+frameDepth/2 + eps;
		const y = (i % 2 == 0) ? upperY : lowerY;
		const z = (wallF.z + 1 + column * 2) * scale;	
            	addFrameArtwork(painting.name, frameGeometry, matGeometry, x, y, z, eps, 0, 0, frameDepth , painting.height, painting.width);
	}
}
function initWallG() {
	const paintings = [
		{name: 'F402.jpg', width: 8, height: 11},
		{name: 'F407.jpg', width: 8, height: 11},
		undefined,
		undefined,
		undefined,
		undefined,
		{name: 'F201.jpg', width: 11, height: 8},
		{name: 'F214.jpg', width: 13, height: 17},
		{name: 'F208.jpg', width: 8, height: 11},
		{name: 'F209.jpg', width: 8, height: 11},
	];
	const frameGeometry = new THREE.BoxGeometry(frameShort , frameLong , frameDepth).toNonIndexed();
	
	const matGeometryP = new THREE.BoxGeometry(frameShort-2, frameLong-2 , frameDepth).toNonIndexed();
	const frameGeometryP = new THREE.BoxGeometry(frameShort, frameLong , frameDepth).toNonIndexed();
	const matGeometryL = new THREE.BoxGeometry(frameLong-2, frameShort-2 , frameDepth).toNonIndexed();
	const frameGeometryL = new THREE.BoxGeometry(frameLong , frameShort , frameDepth).toNonIndexed();
	
	for (let i = 0; i < paintings.length; i++) {
		const painting =  paintings[i];
		if ( painting ) {
			const painting = paintings[i];
			const column = (i-(i%2))/2;
			const z = 20 * scale - frameDepth/2 - eps;
			const y = (i % 2 == 0) ? upperY : lowerY;
			const x = (11.2+1.9*column)*scale;
			if (painting.width < painting.height) {
				// Portrait
            	                addFrameArtwork(painting.name, frameGeometryP, matGeometryP, x, y, z, 0, 0, -eps, painting.width, painting.height, frameDepth);
			} else {
				// Landscape
            	                addFrameArtwork(painting.name, frameGeometryL, matGeometryL, x, y, z, 0, 0, -eps, painting.width, painting.height, frameDepth);
			}
		}
	}
	const painting = {name: 'F401.jpg', width: 8, height: 11};
	const column = 1;
	const z = 20 * scale - frameDepth/2 -eps;
	const y = (upperY + lowerY) / 2;
	const x = (11.2+1.9*column)*scale;
        addFrameArtwork('F401.jpg', frameGeometryP, matGeometryP, x, y, z, 0, 0, -eps, painting.width, painting.height, frameDepth);

	textureLoader.load( 'img/abstraction.jpg', function ( texture ) {
		addBox(labelGeometry, 
		    new THREE.MeshBasicMaterial({ map: texture }),
		    (11.2+1.9*2)*scale,
		    y,
		    20*scale -0.1);
	} );
}
function initWallH() {
	const paintings = [
		{name: 'F403.jpg', width: 8, height: 11},
		{name: 'F404.jpg', width: 8, height: 11},
		{name: 'F405.jpg', width: 14, height: 17},
		{name: 'F406.jpg', width: 8, height: 11},
	]
	const x = (wallDepth+wallH.x) * scale + frameDepth/2;
	
	const frameGeometry = new THREE.BoxGeometry(frameDepth , frameLong , frameShort).toNonIndexed();
	const matGeometry = new THREE.BoxGeometry(frameDepth , frameLong-2 , frameShort-2).toNonIndexed();
	for (let i = 0; i < paintings.length; i++) {
		const painting =  paintings[i];
		if ( painting ) {
			const column = (i-(i%2))/2;
			const z = (wallH.z+1+column*2) * scale;
			const y = (i % 2 == 0) ? upperY : lowerY;
			
			textureLoader.load( 'img/' + painting.name, function ( texture ) {
				addBox(frameGeometry, frameMaterial, x+eps, y, z);
				addBox(matGeometry, matMaterial, x+2*eps, y, z);
				addBox(new THREE.BoxGeometry(frameDepth, painting.height, painting.width).toNonIndexed(),
				   new THREE.MeshBasicMaterial({ map: texture }),
				   x+3*eps, y, z);
			} );
		}
	}
}
function initWallI() {
	const painting = {name: 'F311.jpg', width: 20, height: 28};
	const matGeometry = new THREE.BoxGeometry(frameDepth, 36-2 , 24-2).toNonIndexed();
	const frameGeometry = new THREE.BoxGeometry(frameDepth , 36 , 24).toNonIndexed();
	const x = wallF.x * scale - frameDepth/2;
	const z = (1.5 + wallF.z + wallDepth) * scale;
	const y = (upperY + lowerY) / 2;
	textureLoader.load( 'img/' + painting.name, function ( texture ) {
		addBox(frameGeometry, frameMaterial, x-eps, y, z);
		addBox(matGeometry, matMaterial, x-2*eps, y, z);
		addBox(new THREE.BoxGeometry(frameDepth, painting.height, painting.width).toNonIndexed(),
		     new THREE.MeshBasicMaterial({ map: texture }),
		     x-3*eps, y, z);
	} );
	{
		const painting = {name: 'F312.jpg', width: 8, height: 11};
		const matGeometry = new THREE.BoxGeometry(frameDepth, 22-2 , 18-2).toNonIndexed();
		const frameGeometry = new THREE.BoxGeometry(frameDepth , 22 , 18).toNonIndexed();
		const z = (3.7 + wallF.z + wallDepth) * scale;
		textureLoader.load( 'img/' + painting.name, function ( texture ) {
			addBox(frameGeometry, frameMaterial, x-eps, y, z);
			addBox(matGeometry, matMaterial, x-2*eps, y, z);
			addBox(new THREE.BoxGeometry(frameDepth, painting.height, painting.width).toNonIndexed(),
				new THREE.MeshBasicMaterial({ map: texture }),
				x-3*eps, y, z);
		} );
	}
	textureLoader.load( 'img/friends.jpg', function ( texture ) {
		let label = addBox(labelGeometry2, 
			new THREE.MeshBasicMaterial({ map: texture }),
			wallF.x * scale - 0.1,
			(upperY+lowerY)/2,
			(5.7 + wallF.z + wallDepth) * scale);
		addVoice(label, 'friends.m4a');
	} );
}
function initWallJ() {
	const paintings = [
		{name: 'F305.jpg', width: 8, height: 11},
		{name: 'F306.jpg', width: 8, height: 11},
		{name: 'F307.jpg', width: 8, height: 11},
		{name: 'F308.jpg', width: 8, height: 11},
		{name: 'F313.jpg', width: 8, height: 11},
		{name: 'F314.jpg', width: 8, height: 11},
		{name: 'F309.jpg', width: 8, height: 11},
		{name: 'F310.jpg', width: 8, height: 11},
	];
	const frameGeometry = new THREE.BoxGeometry(frameShort , frameLong , frameDepth).toNonIndexed();
	const matGeometry = new THREE.BoxGeometry(frameShort-2 , frameLong-2 , frameDepth).toNonIndexed();
	for (let i = 0; i < paintings.length; i++) {
		const painting = paintings[i];
		const column = (i-(i%2))/2;
		const x = (7+column*2) * scale;
		const y = (i % 2 == 0) ? upperY : lowerY;
		const z = (wallC.z + wallDepth)*scale + frameDepth/2;
		
		textureLoader.load( 'img/' + painting.name, function ( texture ) {
			addBox(frameGeometry, frameMaterial, x, y, z + eps);
			addBox(matGeometry, matMaterial, x, y, z + 2*eps);
			addBox(new THREE.BoxGeometry(painting.width, painting.height , frameDepth).toNonIndexed(),
			       new THREE.MeshBasicMaterial({ map: texture }),
			       x, y, z + 3*eps);
		} );
	}
}
function initWallK() {
	const paintings = [
		{name: 'F301.jpg', width: 8, height: 11},
		{name: 'F302.jpg', width: 8, height: 11},
		{name: 'F303.jpg', width: 8, height: 11},
		{name: 'F304.jpg', width: 8, height: 11},
		{name: 'F316.jpg', width: 8, height: 11},
		{name: 'F317.jpg', width: 8, height: 11},
	]
	const x = (wallDepth+wallK.x) * scale + frameDepth/2;
	const frameGeometry = new THREE.BoxGeometry(frameDepth , frameLong , frameShort).toNonIndexed();
	const matGeometry = new THREE.BoxGeometry(frameDepth , frameLong-2 , frameShort-2).toNonIndexed();
	for (let i = 0; i < paintings.length; i++) {
		const painting =  paintings[i];
		if ( painting ) {
			const column = (i-(i%2))/2;
			const z = (wallK.z+1.5+column*1.8) * scale;
			const y = (i % 2 == 0) ? upperY : lowerY;
			
			textureLoader.load( 'img/' + painting.name, function ( texture ) {
				addBox(frameGeometry, frameMaterial, x+eps, y, z);
				addBox(matGeometry, matMaterial, x+2*eps, y, z);
				addBox(new THREE.BoxGeometry(frameDepth, painting.height, painting.width).toNonIndexed(),
				   new THREE.MeshBasicMaterial({ map: texture }),
				   x+3*eps, y, z);
			} );
		}
	}
	const painting = {name: 'F315.jpg', width: 14, height: 17};
	const y = (upperY+lowerY)/2;
	const column = 3;
	const z = (wallK.z+1.5+column*1.8) * scale;
	textureLoader.load( 'img/' + painting.name, function ( texture ) {
		addBox(frameGeometry, frameMaterial, x+eps, y, z);
		addBox(matGeometry, matMaterial, x+2*eps, y, z);
		addBox(new THREE.BoxGeometry(frameDepth, painting.height, painting.width).toNonIndexed(),
		     new THREE.MeshBasicMaterial({ map: texture }),
		     x+3*eps, y, z);
	} );
}
function initWallL() {
	const paintings = [
		{name: 'F503.jpg', width: 16, height: 20},
		{name: 'F504.jpg', width: 16, height: 20},
		{name: 'F501.jpg', width: 16, height: 20},
		{name: 'F502.jpg', width: 16, height: 20},
	]
	const x = (wallH.x) * scale - frameDepth/2;
	
	const frameGeometry = new THREE.BoxGeometry(frameDepth , frameLong , frameShort).toNonIndexed();
	for (let i = 0; i < paintings.length; i++) {
		const painting =  paintings[i];
		if ( painting ) {
			const column = (i-(i%2))/2;
			const z = (wallH.z+1+column*2) * scale;
			const y = (i % 2 == 0) ? upperY : lowerY;
			
			textureLoader.load( 'img/' + painting.name, function ( texture ) {
				addBox(frameGeometry, frameMaterial, x-eps, y, z);
				addBox(new THREE.BoxGeometry(frameDepth, painting.height, painting.width).toNonIndexed(),
				   new THREE.MeshBasicMaterial({ map: texture }),
				   x-3*eps, y, z);
			} );
		}
	}
}
function initWallM() {
	const paintings = [
		'F525.jpg', 'F526.jpg', 'F527.jpg', 'F528.jpg', 'F521.jpg', 'F522.jpg',
		'F523.jpg', 'F524.jpg', undefined, 'F529.jpg' 
	];
	const frameGeometry = new THREE.BoxGeometry(frameShort , frameLong , frameDepth).toNonIndexed();
	const artworkGeometry = new THREE.BoxGeometry(frameShort-2 , frameLong-2 , frameDepth).toNonIndexed();
	for (let i = 0; i < paintings.length; i++) {
		const painting = paintings[i];
		const column = (i-(i%2))/2;
		const z = 20 * scale - frameDepth/2;
		const y = (i % 2 == 0) ? upperY : lowerY;
		const x = (1+1.9*column)*scale;
		if ( painting != undefined) {
			textureLoader.load( 'img/' + painting, function ( texture ) {
				addBox(frameGeometry, frameMaterial, x, y, z-eps);
				addBox(artworkGeometry,
				   new THREE.MeshBasicMaterial({ map: texture }), x, y, z-2*eps);
			} );
		}
	}
	textureLoader.load( 'img/everywhere.jpg', function ( texture ) {
		let label = addBox(labelGeometry, 
		    new THREE.MeshBasicMaterial({ map: texture }),
		    (1+1.9*4)*scale,
		    upperY,
		    20*scale -0.1);
		addVoice(label, 'everywhere.m4a');
	} );
}
function initWallN() {
	const paintings = [
		'F610.jpg', 'F609.jpg', 'F618.jpg', 'F621.jpg', 'F601.jpg', 'F602.jpg',
		'F603.jpg', 'F604.jpg', 'F605.jpg', 'F606.jpg', 'F607.jpg', 'F608.jpg',
		'F513.jpg', 'F514.jpg', 'F515.jpg', 'F516.jpg', 'F517.jpg', 'F518.jpg',
		'F519.jpg', 'F520.jpg',
	];
	const frameGeometry = new THREE.BoxGeometry(frameDepth , frameLong , frameShort).toNonIndexed();
	const artworkGeometry = new THREE.BoxGeometry(frameDepth , frameLong-2 , frameShort-2).toNonIndexed();
	for (let i = 0; i < paintings.length; i++) {
		const painting = paintings[i];
		const column = (i-(i%2))/2;
		const x = wallN.x+frameDepth/2;
		const y = (i % 2 == 0) ? upperY : lowerY;
		const z = (1 + column * 2) * scale;
		
		textureLoader.load( 'img/' + painting, function ( texture ) {
			addBox(frameGeometry, frameMaterial, x+eps, y, z);
			addBox(artworkGeometry,
			       new THREE.MeshBasicMaterial({ map: texture }), x+2*eps, y, z);
		} );
	}
}
function initWallO() {
	const paintings = [
		{name: 'F619.jpg', width: 16, height: 20},
		{name: 'F620.jpg', width: 16, height: 20},
		{name: 'F617.jpg', width: 16, height: 20},
		{name: 'F622.jpg', width: 16, height: 20},
		undefined,
		undefined,
		{name: 'F511.jpg', width: 16, height: 20},
		{name: 'F512.jpg', width: 16, height: 20},
	]
	const x = wallK.x * scale - frameDepth/2;
	
	const frameGeometry = new THREE.BoxGeometry(frameDepth , frameLong , frameShort).toNonIndexed();
	for (let i = 0; i < paintings.length; i++) {
		const painting =  paintings[i];
		if ( painting ) {
			const column = (i-(i%2))/2;
			const z = (wallK.z+1+column*2) * scale;
			const y = (i % 2 == 0) ? upperY : lowerY;
			
			textureLoader.load( 'img/' + painting.name, function ( texture ) {
				addBox(frameGeometry, frameMaterial, x-eps, y, z);
				addBox(new THREE.BoxGeometry(frameDepth, painting.height, painting.width).toNonIndexed(),
				   new THREE.MeshBasicMaterial({ map: texture }),
				   x-2*eps, y, z);
			} );
		}
	}
	textureLoader.load( 'img/projection.jpg', function ( texture ) {
		let label = addBox(labelGeometry2, 
		    new THREE.MeshBasicMaterial({ map: texture }),
		    wallK.x * scale - 0.1,
		    (upperY+lowerY)/2,
		    (wallK.z+1+2*2) * scale);
		addVoice(label, 'projection.m4a');
	} );
}
function initWallP() {
	const paintings = [ 'F615.jpg', 'F616.jpg', 'F613.jpg', 'F614.jpg', 'F612.jpg', 'F611.jpg' ];
	const frameGeometry = new THREE.BoxGeometry(frameShort , frameLong , frameDepth).toNonIndexed();
	const artworkGeometry = new THREE.BoxGeometry(frameShort-2 , frameLong-2 , frameDepth).toNonIndexed();
	for (let i = 0; i < paintings.length; i++) {
		const painting = paintings[i];
		const column = (i-(i%2))/2;
		const x = (1.5+column*2) * scale;
		const y = (i % 2 == 0) ? upperY : lowerY;
		const z = frameDepth/2;
		
		textureLoader.load( 'img/' + painting, function ( texture ) {
			addBox(frameGeometry, frameMaterial, x, y, z + eps);
			addBox(artworkGeometry,
			       new THREE.MeshBasicMaterial({ map: texture }),
			       x, y, z + 2*eps);
		} );
	}
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();	
	renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate() {
	const time = performance.now();

	if ( controls.isLocked === true ) {
		raycaster.ray.origin.copy( controls.object.position );
		raycaster.ray.origin.y -= cameraY*scale;

		const intersections = raycaster.intersectObjects( objects, false );

		const onObject = intersections.length > 0;

		const delta = ( time - prevTime ) / 1000;

		velocity.x -= velocity.x * 10.0 * delta;
		velocity.z -= velocity.z * 10.0 * delta;
		if (moveUp) {		
		    velocity.y += 9.8 * 100.0 * delta; // 100.0 = mass
		} else {	
		    velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass
		}

		direction.z = Number( moveForward ) - Number( moveBackward );
		direction.x = Number( moveRight ) - Number( moveLeft );
		direction.normalize(); // this ensures consistent movements in all directions

		if ( moveForward || moveBackward ) velocity.z -= direction.z * 400.0 * delta;
		if ( moveLeft || moveRight ) velocity.x -= direction.x * 400.0 * delta;

		if ( onObject === true ) {
			velocity.y = Math.max( 0, velocity.y );
			canJump = true;
		}

		controls.moveRight( - velocity.x * delta );
		controls.moveForward( - velocity.z * delta );
		controls.object.position.y += ( velocity.y * delta ); // new behavior
		if ( controls.object.position.x > (20-wallDepth)*scale ) {
		     controls.object.position.x = (20-wallDepth)*scale;
		}
		if ( controls.object.position.x < wallDepth*scale ) {
		     controls.object.position.x = wallDepth*scale;
		}
		if ( controls.object.position.z > (20-wallDepth)*scale ) {
		     controls.object.position.z = (20-wallDepth)*scale;
		}
		if ( controls.object.position.z < -12*scale ) {
		     controls.object.position.z = -12*scale;
		}
		if ( moveDown) {
		    if (controls.object.position.y < (cameraY - verticalShift) * scale ) {
			velocity.y = 0;
			controls.object.position.y = (cameraY - verticalShift)*scale;
		    }
		} else if ( moveUp ) {
		    if (controls.object.position.y > (cameraY + verticalShift) * scale ) {
			velocity.y = 0;
			controls.object.position.y = (cameraY + verticalShift)*scale;
		    }
		} else {
		    if (controls.object.position.y < cameraY*scale ) {
			velocity.y = 0;
			controls.object.position.y = cameraY*scale;
			canJump = true;
		    }
		}

	}

	prevTime = time;
	renderer.render( scene, camera );
}
