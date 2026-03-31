<script setup lang="ts">
import * as THREE from 'three';
import {onMounted, ref} from 'vue';
import {WebGLRenderer} from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls';
import GUI from 'lil-gui';

const gui = new GUI();

let width = window.innerWidth;
let height = window.innerHeight;

const scene = new THREE.Scene();

const material = new THREE.MeshStandardMaterial();
material.roughness = 0.4;

const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 32), material);
const plane = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), material);

sphere.position.set(0, 0, 0);
plane.position.set(0, -1, 0);
plane.rotation.x = Math.PI / -2;

scene.add(sphere, plane);

const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);
gui.add(ambientLight, 'intensity').min(0).max(10).step(1).name('ambientLight');

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