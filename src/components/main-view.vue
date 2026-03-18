<script setup lang="ts">
import * as THREE from 'three';
import {onMounted, ref} from 'vue';
import {DataTexture, WebGLRenderer} from 'three';
// @ts-expect-error Hacky import
import {OrbitControls} from 'three/addons/controls/OrbitControls';
import doorAlpha from '~/assets/textures/door/alpha.jpg';
import doorAmbientOcclussion from '~/assets/textures/door/ambientOcclusion.jpg';
import doorColor from '~/assets/textures/door/color.jpg';
import doorHeight from '~/assets/textures/door/height.jpg';
import doorMetalness from '~/assets/textures/door/metalness.jpg';
import doorNormal from '~/assets/textures/door/normal.jpg';
import doorRoughness from '~/assets/textures/door/roughness.jpg';
import matcap from '~/assets/textures/matcaps/1.png';
import gradient from '~/assets/textures/gradients/3.jpg';
import GUI from 'lil-gui';
import {HDRLoader} from 'three/examples/jsm/loaders/HDRLoader';
import environmentMap from '~/assets/textures/environmentMap/2k.hdr';

let width = window.innerWidth;
let height = window.innerHeight;

const gui = new GUI();

const loadingManager = new THREE.LoadingManager();
const textureLoader = new THREE.TextureLoader(loadingManager);

const doorAlphaTexture = textureLoader.load(doorAlpha);
const doorAmbientOcclussionTexture = textureLoader.load(doorAmbientOcclussion);
const doorColorTexture = textureLoader.load(doorColor);
doorColorTexture.colorSpace = THREE.SRGBColorSpace;
const doorHeightTexture = textureLoader.load(doorHeight);
const doorMetalnessTexture = textureLoader.load(doorMetalness);
const doorNormalTexture = textureLoader.load(doorNormal);
const doorRoughnessTexture = textureLoader.load(doorRoughness);

const matcapTexture = textureLoader.load(matcap);

const gradientTexture = textureLoader.load(gradient);

// const material = new THREE.MeshBasicMaterial({
//   map: doorColorTexture,
//   alphaMap: doorAlphaTexture,
// });

const material = new THREE.MeshPhysicalMaterial();
material.metalness = 1;
material.roughness = 1;

material.map = doorColorTexture;
material.aoMap = doorAmbientOcclussionTexture;
material.aoMapIntensity = 1;
material.displacementMap = doorHeightTexture;
material.displacementScale = 0.1;
material.metalnessMap = doorMetalnessTexture;
material.roughnessMap = doorRoughnessTexture;
material.normalMap = doorNormalTexture;
material.alphaMap = doorAlphaTexture;
material.transparent = true;

material.transmission = 1;

gui.add(material, 'roughness').min(0).max(1).step(0.001);
gui.add(material, 'metalness').min(0).max(1).step(0.001);

const sphereGeometry = new THREE.SphereGeometry(0.5, 64, 64);
const planeGeometry = new THREE.PlaneGeometry(0.5, 0.5, 100, 100);
const torusGeometry = new THREE.TorusGeometry(0.5, 0.1);

const sphereMesh = new THREE.Mesh(sphereGeometry, material);
sphereMesh.position.x = -1;

const planeMesh = new THREE.Mesh(planeGeometry, material);

const torusMesh = new THREE.Mesh(torusGeometry, material);
torusMesh.position.x = 1;

const scene = new THREE.Scene();
scene.add(sphereMesh, planeMesh, torusMesh);

const hdrLoader = new HDRLoader();
hdrLoader.loadAsync(environmentMap).then((map: DataTexture)=> {
  map.mapping = THREE.EquirectangularReflectionMapping;
  scene.background = map;
  scene.environment = map;
});

const aspectRatio = width / height;
const camera = new THREE.PerspectiveCamera(75, aspectRatio);
camera.position.z = 4;
camera.lookAt(planeMesh.position);
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

    tick(Date.now());

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
function tick(timestamp: number) {
  requestAnimationFrame(tick);
  timer.update(timestamp);

  const SPEED_FACTOR = 1;

  sphereMesh.rotation.x = timer.getElapsed() * SPEED_FACTOR;
  sphereMesh.rotation.y = timer.getElapsed() * SPEED_FACTOR;

  planeMesh.rotation.x = timer.getElapsed() * SPEED_FACTOR;
  planeMesh.rotation.y = timer.getElapsed() * SPEED_FACTOR;

  torusMesh.rotation.x = timer.getElapsed() * SPEED_FACTOR;
  torusMesh.rotation.y = timer.getElapsed() * SPEED_FACTOR;

  renderer.render(scene, camera);
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