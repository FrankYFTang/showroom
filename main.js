
const scale = 12.0;
const wallDepth = 0.5; // ft
const wallHeight = 10.0;
const cameraX = 10.0;
const cameraY = 5.5;
const cameraZ = -10.0;
const jumpNumOfWall = 5;
const wallColor1 = 'ivory';
const wallColor2 = 'whitesmoke';
const skyColor = 'dimgray';
const eps = 0.01;
const frameShort = 18;
const frameLong = 22;
const frameDepth = 1;

                        import * as THREE from 'three';
			import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

			let camera, scene, renderer, controls, textureLoader, sound;
sound = undefined;
			let dirLight, spotLight;
let wallA, wallB, wallC, wallE, wallF, wallG. wallH, wallK, wallN;

			const objects = [];

			let raycaster;

			let moveForward = false;
			let moveBackward = false;
			let moveLeft = false;
			let moveRight = false;
			let canJump = false;

			let prevTime = performance.now();
			const velocity = new THREE.Vector3();
			const direction = new THREE.Vector3();
			const vertex = new THREE.Vector3();
			const color = new THREE.Color();

			init();

			function init() {

				camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );
				camera.position.y = cameraY * scale;
				camera.position.x = cameraX * scale;
				camera.position.z = cameraZ * scale;

				scene = new THREE.Scene();
				scene.background = new THREE.Color( skyColor );
				// scene.fog = new THREE.Fog( 0xffffff, 0, 750 );

                                // Lights
				scene.add( new THREE.AmbientLight( 0x404040, 3 ) );

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

				// scene.add( new THREE.CameraHelper( spotLight.shadow.camera ) );

				dirLight = new THREE.DirectionalLight( 0xffffff, 3 );
				dirLight.name = 'Dir. Light';
				dirLight.position.set( 0, 11 * scale, 0 );
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

				// scene.add( new THREE.CameraHelper( dirLight.shadow.camera ) );

				controls = new PointerLockControls( camera, document.body );

				const blocker = document.getElementById( 'blocker' );
				const instructions = document.getElementById( 'instructions' );

				instructions.addEventListener( 'click', function () {

					controls.lock();

if (sound == undefined) {
// create an AudioListener and add it to the camera
const listener = new THREE.AudioListener();
camera.add( listener );

// create a global audio source
sound = new THREE.Audio( listener );

// load a sound and set it as the Audio object's buffer
const audioLoader = new THREE.AudioLoader();
audioLoader.load( './audio/audio1.mp4', function( buffer ) {
	sound.setBuffer( buffer );
	sound.setLoop( true );
	sound.setVolume( 0.5 );
	sound.play();
});
}
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

				const onKeyDown = function ( event ) {

					switch ( event.code ) {
						case 'BracketLeft':
	                                                sound.setVolume( sound.getVolume() * 0.9 );
							break;
						case 'BracketRight':
	                                                sound.setVolume( sound.getVolume() * 1.1 );
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

					}

				};

				document.addEventListener( 'keydown', onKeyDown );
				document.addEventListener( 'keyup', onKeyUp );

				raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 10 );

				// floor

	const floorMat = new THREE.MeshStandardMaterial( {
					roughness: 0.8,
					color: 0xffffff,
					metalness: 0.2,
					bumpScale: 1
				} );
				textureLoader = new THREE.TextureLoader();
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
				// floorGeometry.rotateX( - Math.PI / 2 );

                const floorMesh = new THREE.Mesh( floorGeometry, floorMat );
                floorMesh.receiveShadow = true;
	        floorMesh.rotation.x = - Math.PI / 2.0;
                scene.add( floorMesh );
				// vertex displacement
/*
				let position = floorGeometry.attributes.position;

				for ( let i = 0, l = position.count; i < l; i ++ ) {

					vertex.fromBufferAttribute( position, i );

					vertex.x += Math.random() * 20 - 10;
					vertex.y += Math.random() * 2;
					vertex.z += Math.random() * 20 - 10;

					position.setXYZ( i, vertex.x, vertex.y, vertex.z );

				}

				floorGeometry = floorGeometry.toNonIndexed(); // ensure each face has unique vertices

				position = floorGeometry.attributes.position;
				const colorsFloor = [];

				for ( let i = 0, l = position.count; i < l; i ++ ) {

					color.setHSL( Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75, THREE.SRGBColorSpace );
					colorsFloor.push( color.r, color.g, color.b );

				}

				floorGeometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colorsFloor, 3 ) );
				const floorMaterial = new THREE.MeshBasicMaterial( { vertexColors: true } );
				const floor = new THREE.Mesh( floorGeometry, floorMaterial );
				scene.add( floor );
*/

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

                                const boxMaterial1 = new THREE.MeshBasicMaterial({ color: wallColor1});
                                const boxMaterial2 = new THREE.MeshBasicMaterial({ color: wallColor2});
                                for (let i = 0; i < wallInfo.length; i++)
                                {
                                  const info = wallInfo[i];
				  const boxGeometry = new THREE.BoxGeometry(scale * info.width , scale * info.height, scale * info.depth).toNonIndexed();
                                  const boxMaterial = info.width > info.depth ? boxMaterial1 : boxMaterial2;
	   			  const wall = new THREE.Mesh( boxGeometry, boxMaterial );
			  	  wall.position.x = (info.x + info.width / 2.0) * scale;
				  wall.position.z = (info.z + info.depth / 2.0) * scale;;
				  wall.position.y = (info.y + info.height / 2.0) * scale;
			          scene.add( wall );
				  objects.push( wall );
                                }

				initWallA();
				initWallB();
				initWallC();
				initWallD();
				initWallE();
				initWallF();
				initWallG();
				initWallH();
				initWallI();
				initWallJ();
				initWallK();
				initWallL();
				initWallM();
				initWallN();
				initWallO();
				initWallP();
/*
				// objects
				const boxGeometry = new THREE.BoxGeometry( 20, 20, 20 ).toNonIndexed();

				position = boxGeometry.attributes.position;
				const colorsBox = [];

				for ( let i = 0, l = position.count; i < l; i ++ ) {

					color.setHSL( Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75, THREE.SRGBColorSpace );
					colorsBox.push( color.r, color.g, color.b );

				}


				boxGeometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colorsBox, 3 ) );

				for ( let i = 0; i < 500; i ++ ) {

					const boxMaterial = new THREE.MeshPhongMaterial( { specular: 0xffffff, flatShading: true, vertexColors: true } );
					boxMaterial.color.setHSL( Math.random() * 0.2 + 0.5, 0.75, Math.random() * 0.25 + 0.75, THREE.SRGBColorSpace );

					const box = new THREE.Mesh( boxGeometry, boxMaterial );
					box.position.x = Math.floor( Math.random() * 20 - 10 ) * 20;
					box.position.y = Math.floor( Math.random() * 20 ) * 20 + 10;
					box.position.z = Math.floor( Math.random() * 20 - 10 ) * 20;

					scene.add( box );
					objects.push( box );

				}
*/

				//

				renderer = new THREE.WebGLRenderer( { antialias: true } );
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth, window.innerHeight );
				renderer.setAnimationLoop( animate );
				renderer.shadowMap.enabled = true;
				renderer.shadowMap.type = THREE.BasicShadowMap;

				document.body.appendChild( renderer.domElement );

				//

				window.addEventListener( 'resize', onWindowResize );

			}
			function initWallA() {
	  		  textureLoader.load( 'img/F101.jpg', function ( texture ) {
                             const material = new THREE.MeshBasicMaterial({ map: texture });
			     const geometry = new THREE.BoxGeometry(scale * 4 , scale * 5, scale*wallDepth).toNonIndexed();
	   		     const canvas = new THREE.Mesh( geometry, material );
		             canvas.position.x = 2.5 * scale;
			     canvas.position.y = (2+5/2) * scale;
		             canvas.position.z = -wallDepth/2*scale -0.5;
                             camera.lookAt(canvas.position);
                             scene.add( canvas );
			  } );
                        }
			function initWallB() {
	  		  textureLoader.load( 'img/F102.jpg', function ( texture ) {
                             const material = new THREE.MeshBasicMaterial({ map: texture });
			     const geometry = new THREE.BoxGeometry(scale * 4 , scale * 5, scale*wallDepth).toNonIndexed();
	   		     const canvas = new THREE.Mesh( geometry, material );
		             canvas.position.x = 17.5 * scale;
			     canvas.position.y = (2+5/2) * scale;
		             canvas.position.z = -wallDepth/2*scale -0.5;
                             scene.add( canvas );
			  } );
                        }
			function initWallC() {
                        }
			function initWallD() {
                        }
			function initWallE() {
                        }
			function initWallF() {
                        }
			function initWallG() {
                        }
			function initWallH() {
                        }
			function initWallI() {
                        }
			function initWallJ() {
                        }
			function initWallK() {
                        }
			function initWallL() {
                        }
			function initWallM() {
                        }
			function initWallN() {
			  const objects = [];
                          const frameMaterial = new THREE.MeshBasicMaterial({ color: 'black'});
                          for (let i = 0; i < 10; i++) {
			     let geometry = new THREE.BoxGeometry(frameDepth , frameLong , frameShort).toNonIndexed();
	   		     let canvas = new THREE.Mesh( geometry, frameMaterial );
		             canvas.position.x = wallN.x+eps;
			     canvas.position.y = 77;
		             canvas.position.z = 1 + i*scale;
                             objects.add( canvas );
                             scene.add( canvas );
	   		     canvas = new THREE.Mesh( geometry, frameMaterial );
		             canvas.position.x = wallN.x+eps;
			     canvas.position.y = 51;
		             canvas.position.z = 1 + i*scale;
                             objects.add( canvas );
                             scene.add( canvas );
                          }
                        }
			function initWallO() {
                        }
			function initWallP() {
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

					velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

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

					if ( controls.object.position.x > 20*scale ) {
                                             controls.object.position.x = 20*scale;
                                        }
					if ( controls.object.position.x < 0 ) {
                                             controls.object.position.x = 0;
                                        }
					if ( controls.object.position.z > 20*scale ) {
                                             controls.object.position.z = 20*scale;
                                        }
					if ( controls.object.position.z < -12*scale ) {
                                             controls.object.position.z = -12*scale;
                                        }

					if ( controls.object.position.y < cameraY*scale ) {

						velocity.y = 0;
						controls.object.position.y = cameraY*scale;

						canJump = true;

					}

				}

				prevTime = time;

				renderer.render( scene, camera );

			}
