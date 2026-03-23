<script setup lang="ts">
import * as THREE from 'three';
import {onMounted, ref} from 'vue';
import {AxesHelper, WebGLRenderer} from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls';
import {FontLoader} from 'three/addons/loaders/FontLoader';
import helvetikerFont from '~/assets/fonts/helvetiker_regular.typeface.json?url';
import matcapTextureUrl from '~/assets/textures/matcaps/8.png?url';
import {TextGeometry} from 'three/addons/geometries/TextGeometry';
import GUI from 'lil-gui';

const gui = new GUI();

let width = window.innerWidth;
let height = window.innerHeight;

const loadingManager = new THREE.LoadingManager();
const textureLoader = new THREE.TextureLoader(loadingManager);
const textTexture = await textureLoader.loadAsync(matcapTextureUrl);
textTexture.colorSpace = THREE.SRGBColorSpace;

const fontLoader = new FontLoader(loadingManager);
const font = await fontLoader.loadAsync(helvetikerFont);

const scene = new THREE.Scene();

const textParams = {
  font,
  size: 0.5,
  depth: 0.2,
  curveSegments: 5,
  bevelEnabled: true,
  bevelThickness: 0.03,
  bevelSize: 0.02,
  bevelOffset: 0,
  bevelSegments: 4,
};

const textGeometry = new TextGeometry('Sergio', textParams);
textGeometry.center();

const textMaterial = new THREE.MeshMatcapMaterial({
  matcap: textTexture,
});

const textMesh = new THREE.Mesh(textGeometry, textMaterial);
textMesh.position.set(0, 0, 0);

scene.add(textMesh);

gui.add(textParams, 'size').min(0).max(100).step(0.01);
gui.add(textParams, 'depth').min(0).max(100).step(0.01);
gui.add(textParams, 'curveSegments').min(0).max(100).step(0.01);
gui.add(textParams, 'bevelEnabled').min(0).max(100).step(0.01);
gui.add(textParams, 'bevelThickness').min(0).max(100).step(0.01);
gui.add(textParams, 'bevelSize').min(0).max(100).step(0.01);
gui.add(textParams, 'bevelOffset').min(0).max(100).step(0.01);
gui.add(textParams, 'bevelSegments').min(0).max(100).step(0.01);

gui.add(textMesh.material, 'wireframe');

gui.onChange(()=> {
  textMesh.geometry.dispose();
  textMesh.geometry = new TextGeometry('Sergio', textParams);
  textMesh.geometry.center();
});

const aspectRatio = width / height;
const camera = new THREE.PerspectiveCamera(75, aspectRatio);
camera.position.z = 3;
camera.lookAt(textMesh.position);
scene.add(camera);

scene.add(new AxesHelper());

console.time('donuts');

const donutGeometry = new THREE.TorusGeometry(0.3, 0.2, 20, 45);
const donutMaterial = new THREE.MeshMatcapMaterial({matcap: textTexture});

for (let i = 0; i < 100; i++) {
  const donut = new THREE.Mesh(donutGeometry, donutMaterial);
  donut.position.x = (Math.random() - 0.5) * 10;
  donut.position.y = (Math.random() - 0.5) * 10;
  donut.position.z = (Math.random() - 0.5) * 10;

  donut.rotation.x = Math.random() * Math.PI;
  donut.rotation.y = Math.random() * Math.PI;

  const scale = Math.random();
  donut.scale.set(scale, scale, scale);

  scene.add(donut);
}
console.timeEnd('donuts');

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