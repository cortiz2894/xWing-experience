import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import gsap from 'gsap'

THREE.ColorManagement.enabled = false

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Models
 */
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('/draco/')
const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)

let mixer
let model
let wingLT
let wingLB
let wingRT
let wingRB

gltfLoader.load(
    '/models/xWing/xWing-separate-wings.glb',
    (gltf) => {

        //Set the animation
        model = gltf.scene
        mixer = new THREE.AnimationMixer(model)
        const action = mixer.clipAction(gltf.animations[1])

        wingRT = model.children[1]
        wingRB = model.children[3]
        wingLT = model.children[2]
        wingLB = model.children[4]

        model.scale.set(0.5, 0.5, 0.5)
        model.rotation.set(Math.PI * 2, Math.PI , 0)

        const xWingFolder = gui.addFolder('xWing')
        xWingFolder.add(model.rotation, 'x').min(0).max(20).step(0.0001).name('rotate x')
        xWingFolder.add(model.rotation, 'y').min(0).max(20).step(0.0001).name('rotate y')
        xWingFolder.add(model.rotation, 'z').min(0).max(20).step(0.0001).name('rotate z')

        model.traverse( function( child ) {
            if ( child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial ) { 
                // child.material.envMapIntensity = debugObject.envMapIntensity
                child.material.needsUpdate = true
                child.castShadow = true
                child.receiveShadow = true
            }
    
        } );
        scene.add(model)
    },
)



/**
 * Floor
 */
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshStandardMaterial({
        color: '#444444',
        metalness: 0,
        roughness: 0.5
    })
)
floor.rotation.x = - Math.PI * 0.5

floor.receiveShadow = true
// scene.add(floor)

/**
 * Lights
 */

//Ambient
const ambientLight = new THREE.AmbientLight('#634F85', 0.8)

scene.add(ambientLight)

//Directionals
const directionalLight = new THREE.DirectionalLight('#78AFFF', 0.6)
const directionalLight2 = new THREE.DirectionalLight('#78AFFF', 0.6)
const directionalLight3 = new THREE.DirectionalLight('#78AFFF', 0.6)


const directionalHelper = new THREE.CameraHelper(directionalLight.shadow.camera)
const directionalHelper2 = new THREE.CameraHelper(directionalLight2.shadow.camera)

directionalLight.position.set(5, 5, 5)
directionalLight2.position.set(1.15, 6.3, -0.07)

directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.near = 6
directionalLight.shadow.camera.far = 5
directionalLight.shadow.normalBias = 0.05

directionalLight2.castShadow = true
directionalLight2.shadow.mapSize.set(1024, 1024)
directionalLight2.shadow.camera.near = 1
directionalLight2.shadow.camera.far = 1
directionalLight2.shadow.normalBias = 0.05


scene.add(directionalLight, directionalLight2, directionalLight3)

// Directional Light 1
gui.add(directionalLight, 'intensity').min(0).max(10).step(0.001).name('lightIntensity')
gui.add(directionalLight.position, 'x').min(- 10).max(10).step(0.001).name('lightX')
gui.add(directionalLight.position, 'y').min(- 10).max(10).step(0.001).name('lightY')
gui.add(directionalLight.position, 'z').min(- 10).max(10).step(0.001).name('lightZ')

// Directional Light 2
gui.add(directionalLight2.position, 'x').min(- 10).max(10).step(0.001).name('lightX2')
gui.add(directionalLight2.position, 'y').min(- 10).max(10).step(0.001).name('lightY2')
gui.add(directionalLight2.position, 'z').min(- 10).max(10).step(0.001).name('lightZ2')
gui.add(ambientLight, 'intensity').min(0).max(1).step(0.001)

// scene.add(directionalHelper,directionalHelper2)

//Point

const pointLight = new THREE.PointLight('#8EDBFF', 0.5)
pointLight.position.set(-0.3, 0.6, -3)
scene.add(pointLight)

// Directional Light 2
gui.add(pointLight.position, 'x').min(- 10).max(10).step(0.001).name('PointX')
gui.add(pointLight.position, 'y').min(- 10).max(10).step(0.001).name('PointY')
gui.add(pointLight.position, 'z').min(- 10).max(10).step(0.001).name('PointZ')

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(70, sizes.width / sizes.height, 0.1, 100)
camera.position.set(0, 2, 6)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.target.set(0, 0.75, 0)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
// renderer.useLegacyLights = false
// renderer.toneMapping = THREE.CineonToneMapping
// renderer.toneMappingExposure = 1.75
renderer.outputColorSpace = THREE.LinearSRGBColorSpace
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0

let timeline = gsap.timeline({paused: true})

if(model !== null) {
}

const openWings = () => {
    timeline
    .to(wingRT.rotation, {
        y:0.3
    })
    .to(wingRB.rotation, {
        y:-0.3
    }, '<')
    .to(wingLT.rotation, {
        y:0.3
    }, '<')
    .to(wingLB.rotation, {
        y:-0.3
    }, '<')
    timeline.play()
}

const closeWings = () => {
    timeline.reverse()
}
var animations = { 
    OpenWings:function(){
         openWings() 
    },
    CloseWings:function(){
        closeWings()
   },
};

gui.add(animations,'OpenWings');
gui.add(animations,'CloseWings');


// movement - please calibrate these values
var xSpeed = 0.1;
var ySpeed = 0.1;

document.addEventListener("keydown", onDocumentKeyDown, false);
function onDocumentKeyDown(event) {
    console.log(event.which)
    if(event.keyCode === 37) {
        console.log('Left was pressed', model);
        model.position.x -= xSpeed;
        // camera.position.x -= xSpeed;
    }
    else if(event.keyCode === 39) {
        console.log('Right was pressed');
        model.position.x += xSpeed;

        // camera.position.x += xSpeed;
    }
    else if(event.keyCode === 32) {
        if(wingRT.rotation.y >= 0.3) {
            closeWings()
        }else {
            openWings()
        }
        console.log('Right was pressed');

        // camera.position.x += xSpeed;
    }
};

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    //Update mixer
    if(mixer != null) {
        mixer.update(deltaTime)  
    }
    if(model != null) {
        // model.position.x = Math.cos(elapsedTime * 2) / 10
        model.position.y = Math.sin(elapsedTime * 2) / 10
    }
    // Update controls
    controls.update()
    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()