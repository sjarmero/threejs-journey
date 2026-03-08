<script setup lang="ts">
import * as THREE from 'three';
import {onMounted, ref} from 'vue';
import {WebGLRenderer} from 'three';

const width = 800;
const height = 600;

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({color: 0xff0000});
const mesh = new THREE.Mesh(geometry, material);

const scene = new THREE.Scene();
scene.add(mesh);

const aspectRatio = width / height;
const camera = new THREE.PerspectiveCamera(75, aspectRatio);
camera.position.z = 3;
camera.lookAt(mesh.position);
scene.add(camera);

const canvas = ref<HTMLCanvasElement | null>(null);
let canvasOffset: {x: number, y:number};
let renderer: WebGLRenderer;

onMounted(()=> {
  if (canvas.value) {
    canvasOffset = {
      x: canvas.value.offsetLeft,
      y: canvas.value.offsetTop
    };

    renderer = new THREE.WebGLRenderer({
      canvas: canvas.value,
    });

    renderer.setSize(width, height);
    renderer.render(scene, camera);

    tick();

    canvas.value.addEventListener('mousemove', onMouseMove);
  }
});

const cursor = {x: 0, y: 0};
const RANGE_OFFSET = -0.5;
function onMouseMove(event: MouseEvent) {
  cursor.x = ((event.clientX - canvasOffset.x) / width) + RANGE_OFFSET;
  cursor.y = ((event.clientY - canvasOffset.y) / height) + RANGE_OFFSET;

  console.log(cursor);
}

const clock = new THREE.Clock();
const fullRev = 2 * Math.PI;
function tick() {
  // mesh.rotation.y = clock.getElapsedTime();
  camera.position.x = Math.sin(cursor.x * fullRev) * 3;
  camera.position.z = Math.cos(cursor.x * fullRev) * 3;
  camera.position.y = cursor.y * 5;
  camera.lookAt(mesh.position);
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