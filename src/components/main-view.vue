<script setup lang="ts">
import * as THREE from 'three';
import {onMounted, ref} from 'vue';
import {WebGLRenderer} from 'three';
// @ts-expect-error Hacky import
import {OrbitControls} from 'three/addons/controls/OrbitControls';
import doorColor from '~/assets/textures/door/color.jpg';

let width = window.innerWidth;
let height = window.innerHeight;

const loadingManager = new THREE.LoadingManager();
const textureLoader = new THREE.TextureLoader(loadingManager);
const texture = textureLoader.load(doorColor);
texture.colorSpace = THREE.SRGBColorSpace;

const material = new THREE.MeshBasicMaterial({
  map: texture,
});

const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material);

const scene = new THREE.Scene();
scene.add(mesh);

const aspectRatio = width / height;
const camera = new THREE.PerspectiveCamera(75, aspectRatio);
camera.position.z = 3;
camera.lookAt(mesh.position);
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