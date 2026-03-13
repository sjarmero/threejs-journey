<script setup lang="ts">
import * as THREE from 'three';
import {onMounted, ref} from 'vue';
import {WebGLRenderer} from 'three';
import type {Color} from 'three';
// @ts-expect-error Hacky import
import {OrbitControls} from 'three/addons/controls/OrbitControls';
import GUI from 'lil-gui';
import gsap from 'gsap';

let width = window.innerWidth;
let height = window.innerHeight;

const gui = new GUI();
const cubeTweaks = gui.addFolder('cube');

const tweaks = {
  spinObject() {
    gsap.to(mesh.rotation, {duration: 1, y: mesh.rotation.y + 2 * Math.PI});
    gsap.to(sphereMesh.rotation, {duration: 1, y: sphereMesh.rotation.y + 2* Math.PI});
  },
  subdivision: 2,
};


const materialParameters = {
  color: 0xff0000,
  wireframe: true,
};
const material = new THREE.MeshBasicMaterial(materialParameters);

const getGeometry = ()=> new THREE.BoxGeometry(1, 1, 1, tweaks.subdivision, tweaks.subdivision, tweaks.subdivision);

const mesh = new THREE.Mesh(getGeometry(), material);
mesh.position.x = -1;

const scene = new THREE.Scene();
scene.add(mesh);

cubeTweaks.add(mesh.position, 'y').min(-3).max(3).step(0.01).name('elevation');
cubeTweaks.add(mesh, 'visible');
cubeTweaks.add(mesh.material, 'wireframe');
cubeTweaks.addColor(materialParameters, 'color').onChange((color: Color)=> {
  material.color.set(color);
});

const getSphereGeometry = ()=> new THREE.SphereGeometry(1, tweaks.subdivision, tweaks.subdivision);
const sphereMesh = new THREE.Mesh(getSphereGeometry(), material);
sphereMesh.position.x = 1;
scene.add(sphereMesh);

const aspectRatio = width / height;
const camera = new THREE.PerspectiveCamera(75, aspectRatio);
camera.position.z = 3;
camera.lookAt(mesh.position);
scene.add(camera);

const canvas = ref<HTMLCanvasElement | null>(null);
let renderer: WebGLRenderer;

cubeTweaks.add(tweaks, 'spinObject');
cubeTweaks.add(tweaks, 'subdivision').min(1).max(20).step(1).onChange(()=> {
  mesh.geometry.dispose();
  mesh.geometry = getGeometry();

  sphereMesh.geometry.dispose();
  sphereMesh.geometry = getSphereGeometry();
});

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

function tick() {
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