<script setup lang="ts">
import * as THREE from 'three';
import {onMounted, ref} from 'vue';
import {WebGLRenderer} from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls';
import GUI from 'lil-gui';
import {RectAreaLightHelper} from 'three/addons/helpers/RectAreaLightHelper.js';

const gui = new GUI();

let width = window.innerWidth;
let height = window.innerHeight;

const scene = new THREE.Scene();

const material = new THREE.MeshStandardMaterial();
material.roughness = 0.4;

const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 32), material);
const cube = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.75, 0.75), material);
const donut = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.2, 32, 64), material);
const plane = new THREE.Mesh(new THREE.PlaneGeometry(4, 2), material);

sphere.position.set(-1.5, 1, 0);
cube.position.set(0, 1, 0);
donut.position.set(1.5, 1, 0);
plane.position.set(0, 0, 0);
plane.rotation.x = Math.PI / -2;

scene.add(sphere, cube, donut, plane);

const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0x00fffc, 0.9);
directionalLight.position.set(3, 1, 0);
scene.add(directionalLight);

const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 0.5);
scene.add(directionalLightHelper);

const hemisphereLight = new THREE.HemisphereLight(0xff000, 0x0000ff, 0.9);
scene.add(hemisphereLight);

const hemisphereLightHelper = new THREE.HemisphereLightHelper(hemisphereLight, 0.5);
scene.add(hemisphereLightHelper);

const pointLight = new THREE.PointLight(0xff9000, 1.5, 10, 2);
pointLight.position.set(0, 0.5, 0);
scene.add(pointLight);

const pointLightHelper = new THREE.PointLightHelper(pointLight, 0.2);
scene.add(pointLightHelper);

const rectAreaLight = new THREE.RectAreaLight(0x4e00ff, 6, 1, 1);
rectAreaLight.position.set(-1, 0, 1);
rectAreaLight.lookAt(new THREE.Vector3());
scene.add(rectAreaLight);

const rectAreaLightHelper = new RectAreaLightHelper(rectAreaLight);
scene.add(rectAreaLightHelper);

const spotLight = new THREE.SpotLight(0x78ff00, 4.5, 10, Math.PI * 0.1, 0.25, 1);
spotLight.position.set(0, 0, 3);
spotLight.target.position.set(-2, 2, 0);
scene.add(spotLight);
scene.add(spotLight.target);

const spotLightHelper = new THREE.SpotLightHelper(spotLight);
scene.add(spotLightHelper);

gui.add(ambientLight, 'intensity').min(0).max(3).step(0.1).name('ambientLight');
gui.add(directionalLight, 'intensity').min(0).max(3).step(0.1).name('directionalLight');
gui.add(hemisphereLight, 'intensity').min(0).max(3).step(0.1).name('hemishpereLight');
gui.add(pointLight, 'intensity').min(0).max(3).step(0.1).name('pointLight');
gui.add(rectAreaLight, 'intensity').min(0).max(10).step(1).name('rectAreaLight');
gui.add(spotLight, 'intensity').min(0).max(10).step(1).name('spotLight');

const aspectRatio = width / height;
const camera = new THREE.PerspectiveCamera(75, aspectRatio);
camera.position.z = 3;
camera.position.y = 1;
camera.lookAt(plane.position);
scene.add(camera);

console.time('donuts');

const canvas = ref<HTMLCanvasElement | null>(null);
let renderer: WebGLRenderer;

onMounted(()=> {
  if (canvas.value) {
    renderer = new THREE.WebGLRenderer({
      canvas: canvas.value,
    });

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

  donut.rotation.x = timer.getElapsed() % (2 * Math.PI);
  donut.rotation.y = timer.getElapsed() % (2 * Math.PI);

  sphere.rotation.x = timer.getElapsed() % (2 * Math.PI);
  sphere.rotation.y = timer.getElapsed() % (2 * Math.PI);

  cube.rotation.x = timer.getElapsed() % (2 * Math.PI);
  cube.rotation.y = timer.getElapsed() % (2 * Math.PI);

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