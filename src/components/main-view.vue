<script setup lang="ts">
import * as THREE from 'three';
import {onMounted, ref} from 'vue';
import {CameraHelper, PointLightHelper, WebGLRenderer} from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls';
import GUI from 'lil-gui';
import bakedShadow from '~/assets/textures/bakedShadow.jpg';

const gui = new GUI();

let width = window.innerWidth;
let height = window.innerHeight;

const scene = new THREE.Scene();

const material = new THREE.MeshStandardMaterial();
material.roughness = 0.4;
material.metalness = 0;
gui.add(material, 'roughness').min(0).max(1).step(0.1);
gui.add(material, 'metalness').min(0).max(1).step(0.1);

const textureLoader = new THREE.TextureLoader();
const bakedShadowTexture = await textureLoader.loadAsync(bakedShadow);
bakedShadowTexture.colorSpace = THREE.SRGBColorSpace;

const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 32), material);
const plane = new THREE.Mesh(new THREE.PlaneGeometry(5, 5), new THREE.MeshBasicMaterial({
  map: bakedShadowTexture,
}));

sphere.position.set(0, 0, 0);
plane.position.set(0, -1, 0);
plane.rotation.x = Math.PI / -2;

sphere.castShadow = true;
plane.receiveShadow = true;

scene.add(sphere, plane);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(ambientLight);
gui.add(ambientLight, 'intensity').min(0).max(1).step(0.1).name('ambientLight');

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.2);
directionalLight.position.set(2, 2, -1);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.near = 1;
directionalLight.shadow.camera.far = 5.5;
directionalLight.shadow.camera.left = -1;
directionalLight.shadow.camera.right = 1;
directionalLight.shadow.camera.top = 1;
directionalLight.shadow.camera.bottom = -1;
directionalLight.shadow.radius = 10;
directionalLight.shadow.type = THREE.PCFSoftShadowMap;

gui.add(directionalLight, 'intensity').min(0).max(1).step(0.1).name('directionalLight');
gui.add(directionalLight.position, 'x').min(-5).max(5).step(0.001);
gui.add(directionalLight.position, 'y').min(-5).max(5).step(0.001);
gui.add(directionalLight.position, 'z').min(-5).max(5).step(0.001);
gui.add(directionalLight.shadow, 'radius').min(0).max(30).step(1);

scene.add(directionalLight);

const spotLight = new THREE.SpotLight(0xfffffff, 4, 10, Math.PI * 0.3);
spotLight.castShadow = true;
spotLight.position.set(0, 2, 2);
spotLight.shadow.mapSize.set(1024, 1024);
spotLight.shadow.camera.near = 2;
spotLight.shadow.camera.far = 4;
spotLight.shadow.camera.fov = 30;

gui.add(spotLight, 'intensity').min(0).max(10).step(0.1).name('spotLight');

scene.add(spotLight);
scene.add(spotLight.target);

// scene.add(new THREE.CameraHelper(spotLight.shadow.camera));

const directionalLightCameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
directionalLightCameraHelper.visible = false;
scene.add(directionalLightCameraHelper);

const pointLight = new THREE.PointLight(0xffffff, 1.5);
pointLight.castShadow = true;
pointLight.position.set(-1, 1, 0);
pointLight.shadow.mapSize.set(1024, 1024);
pointLight.shadow.camera.near = 0.1;
pointLight.shadow.camera.far = 5;

gui.add(pointLight, 'intensity').min(0).max(3).step(0.1).name('pointLight');

scene.add(pointLight);
// scene.add(new CameraHelper(pointLight.shadow.camera));

const aspectRatio = width / height;
const camera = new THREE.PerspectiveCamera(75, aspectRatio);
camera.position.z = 3;
camera.position.y = 1;
camera.lookAt(plane.position);
scene.add(camera);

const canvas = ref<HTMLCanvasElement | null>(null);
let renderer: WebGLRenderer;

onMounted(()=> {
  if (canvas.value) {
    renderer = new THREE.WebGLRenderer({
      canvas: canvas.value,
    });

    renderer.shadowMap.enabled = false;

    new OrbitControls(camera, canvas.value);

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.render(scene, camera);

    tick();

    window.addEventListener('resize', ()=> {
      width = window.innerWidth;
      height = window.innerHeight;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      renderer.render(scene, camera);
    });

    canvas.value.addEventListener('dblclick', ()=> {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        canvas.value?.requestFullscreen();
      }
    });
  }
});

const timer = new THREE.Timer();
function tick() {
  timer.update();

  sphere.rotation.x = timer.getElapsed() % (2 * Math.PI);
  sphere.rotation.y = timer.getElapsed() % (2 * Math.PI);

  renderer.render(scene, camera);

  requestAnimationFrame(tick);
}
</script>
<template>
  <div>
    <canvas
      ref="canvas"
      class="webgl"
    />
  </div>
</template>
<style lang="scss" scoped>
.webgl {
  outline: none;
}
</style>