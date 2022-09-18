import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import gsap from 'gsap';
import * as dat from 'lil-gui';

import './style.css';

import { buildingFactory } from "./buildingFactory";
import ProjectedMaterial from "./ProjectedMaterial";

const loadingManager = new THREE.LoadingManager()
loadingManager.onStart = () =>
{
    console.log('loading started')
}
loadingManager.onLoad = () =>
{
    console.log('loading finished')
}
loadingManager.onProgress = () =>
{
    console.log('loading progressing')
}
loadingManager.onError = () =>
{
    console.log('loading error')
}

const textureLoader = new THREE.TextureLoader(loadingManager)
const colorTexture = textureLoader.load('/textures/marble.jpg');


// Sizes
const sizes = {
     width: window.innerWidth,
    height: window.innerHeight
}

// Scene
const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
camera.position.z = 3;
camera.lookAt(0, 0, 0);
scene.add(camera);

// Object
const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
const material = new THREE.MeshStandardMaterial({ map: colorTexture , color: 0x00Afff, wireframe: false, roughness: 0 });

const plane = new THREE.PlaneGeometry(10, 10);

const planeMesh = new THREE.Mesh(plane, material);
planeMesh.rotateX(-Math.PI/2);
planeMesh.position.set(0,-2.5,0);
scene.add(planeMesh);


const secondCamera = new THREE.PerspectiveCamera(45, 1, 0.01, 5)
  secondCamera.position.set(0, 0, 5)
  secondCamera.lookAt(0, 0, 0)

  // add a camer frustum helper just for demostration purposes
  const helper = new THREE.CameraHelper(secondCamera)
  scene.add(helper)


//Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xff9000, 0.5);
scene.add(pointLight);

const pointLightHelper = new THREE.PointLightHelper(pointLight, 0.2);
scene.add(pointLightHelper);

const pointLight2 = new THREE.PointLight(0xffff00, 0.5);
pointLight2.position.set(0,3,1);
scene.add(pointLight2);

const pointLightHelper2 = new THREE.PointLightHelper(pointLight2, 0.2);
scene.add(pointLightHelper2);

// Axe Helper
const axesHelper = new THREE.AxesHelper(2);
//scene.add(axesHelper);

const gui = new dat.GUI();
gui.add(ambientLight, 'intensity').min(0).max(1).step(0.001);
gui.add(pointLight, 'intensity').min(0).max(1).step(0.001);
//gui.add(pointLight.position, 'z');
gui.add( ambientLight.position , 'z', -500, 500 ).step(5)


// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('canvas.webgl')
});

renderer.setSize(sizes.width, sizes.height);
//renderer.render(scene, camera);

// Controls
const controls = new OrbitControls( camera, renderer.domElement );




/**
 * Animate
 */
//gsap.to(mesh.rotation, { duration: 1, x: 5, repeat:-1 });


function tick()
{
    // Render
    renderer.render(scene, camera);

/*    objects.forEach(object => {
        object.rotation.y -= 0.003;
    })*/

    // Call tick again on the next frame
    window.requestAnimationFrame(tick);

}


window.onload = () => {
    const video = document.getElementById( 'video' ) as HTMLVideoElement;
    if(!video) {
        throw new Error("cannot find the video");
    }
    video.play();
    const videoTexture = new THREE.VideoTexture(video);

    const otherMaterial = new ProjectedMaterial({
        camera: secondCamera,
        texture: videoTexture,
        color: 0x3149D5,
    })

    const objects = buildingFactory(2, geometry, otherMaterial, "2pieces");
    scene.add(...objects)

    tick();
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    // Update renderer
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
})

window.addEventListener('dblclick', () =>
{
    const fullscreenElement = document.fullscreenElement;
    const canvas = document.querySelector('canvas.webgl');

    if(!canvas) {
        return;
    }

    if(!fullscreenElement)
    {
        if(canvas.requestFullscreen)
        {
            canvas.requestFullscreen()
        }
    }
    else
    {
        if(document.exitFullscreen)
        {
            document.exitFullscreen()
        }
        
    }
})