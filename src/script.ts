import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import gsap from 'gsap';
import * as dat from 'lil-gui';

import './style.css';

import ProjectedMaterial from "./ProjectedMaterial";

const loadingManager = new THREE.LoadingManager()
loadingManager.onStart = () =>
{
    console.log('loading started')
}
loadingManager.onLoad = () =>
{
    console.log('l oading finished')
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
const colorTexture = textureLoader.load('/textures/uv.jpg');


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
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial({ map: colorTexture , color: 0x00Afff, wireframe: false });


const secondCamera = new THREE.PerspectiveCamera(45, 1, 0.01, 5)
  secondCamera.position.set(0, 0, 5)
  secondCamera.lookAt(0, 0, 0)

  // add a camer frustum helper just for demostration purposes
  const helper = new THREE.CameraHelper(secondCamera)
  scene.add(helper)


//Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xff9000, 0.5)
scene.add(pointLight)

const pointLightHelper = new THREE.PointLightHelper(pointLight, 0.2)
scene.add(pointLightHelper)

// Axe Helper
const axesHelper = new THREE.AxesHelper(2);
//scene.add(axesHelper);

const gui = new dat.GUI();
gui.add(ambientLight, 'intensity').min(0).max(1).step(0.001);
//gui.add(pointLight.position, 'z');
gui.add( secondCamera.position , 'z', -500, 500 ).step(5)


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

    /*objects.forEach(object => {
        object.rotation.y -= 0.003;
    })
*/
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

    let objects : THREE.Mesh[] = [];
    for(let x = -2; x <= 2; x++) {
        for(let y = -2; y <= 2; y++) {
            const mesh = new THREE.Mesh(geometry, otherMaterial);
            mesh.position.set(x * 1.0, y * 1.0, Math.random() * -3);
            objects.push(mesh);
            scene.add(mesh);
        }
    }


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