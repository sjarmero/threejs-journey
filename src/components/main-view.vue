<script setup lang="ts">
import * as THREE from 'three';
import {onMounted, ref} from 'vue';
import {CameraHelper, DirectionalLightHelper, WebGLRenderer} from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls';
import GUI from 'lil-gui';
import floorAlphaTexturePath from '~/assets/floor/alpha.jpg';
import floorColorTexturePath from '~/assets/floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_diff_1k.jpg';
import floorARMTexturePath from '~/assets/floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_arm_1k.jpg';
import floorNormalTexturePath from '~/assets/floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_nor_gl_1k.jpg';
import floorDisplacementTexturePath from '~/assets/floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_disp_1k.jpg';

import wallColorTexturePath from '~/assets/wall/castle_brick_broken_06_1k/castle_brick_broken_06_diff_1k.jpg';
import wallARMTexturePath from '~/assets/wall/castle_brick_broken_06_1k/castle_brick_broken_06_arm_1k.jpg';
import wallNormalTexturePath from '~/assets/wall/castle_brick_broken_06_1k/castle_brick_broken_06_nor_gl_1k.jpg';

import roofColorTexturePath from '~/assets/roof/roof_slates_02_1k/roof_slates_02_diff_1k.jpg';
import roofARMTexturePath from '~/assets/roof/roof_slates_02_1k/roof_slates_02_arm_1k.jpg';
import roofNormalTexturePath from '~/assets/roof/roof_slates_02_1k/roof_slates_02_nor_gl_1k.jpg';

import bushColorTexturePath from '~/assets/bush/leaves_forest_ground_1k/leaves_forest_ground_diff_1k.jpg';
import bushARMTexturePath from '~/assets/bush/leaves_forest_ground_1k/leaves_forest_ground_arm_1k.jpg';
import bushNormalTexturePath from '~/assets/bush/leaves_forest_ground_1k/leaves_forest_ground_nor_gl_1k.jpg';

import graveColorTexturePath from '~/assets/grave/plastered_stone_wall_1k/plastered_stone_wall_diff_1k.jpg';
import graveARMTexturePath from '~/assets/grave/plastered_stone_wall_1k/plastered_stone_wall_arm_1k.jpg';
import graveNormalTexturePath from '~/assets/grave/plastered_stone_wall_1k/plastered_stone_wall_nor_gl_1k.jpg';

import doorColorTexturePath from '~/assets/door/color.jpg';
import doorAmbientOcclusionTexturePath from '~/assets/door/ambientOcclusion.jpg';
import doorRoughnessTexturePath from '~/assets/door/roughness.jpg';
import doorMetalnessTexturePath from '~/assets/door/metalness.jpg';
import doorNormalTexturePath from '~/assets/door/normal.jpg';
import doorAlphaTexturePath from '~/assets/door/alpha.jpg';
import doorDisplacementTexturePath from '~/assets/door/height.jpg';

const gui = new GUI();

let width = window.innerWidth;
let height = window.innerHeight;

const scene = new THREE.Scene();

/**
 * Textures
 */

const loadingManager = new THREE.LoadingManager();
const textureLoader = new THREE.TextureLoader(loadingManager);

async function loadTextureWithRepeat(texturePath: string): ReturnType<typeof textureLoader.loadAsync> {
  const texture = await textureLoader.loadAsync(texturePath);
  texture.repeat.set(8, 8);
  texture.wrapT = THREE.RepeatWrapping;
  texture.wrapS = THREE.RepeatWrapping;

  return texture;
}

// Floor
const floorAlphaTexture = await textureLoader.loadAsync(floorAlphaTexturePath);
const floorColorTexture = await loadTextureWithRepeat(floorColorTexturePath);
floorColorTexture.colorSpace = THREE.SRGBColorSpace;
const floorARMTexture = await loadTextureWithRepeat(floorARMTexturePath);
const floorNormalTexture = await loadTextureWithRepeat(floorNormalTexturePath);
const floorDisplacementTexture = await loadTextureWithRepeat(floorDisplacementTexturePath);

// Wall
const wallColorTexture = await textureLoader.loadAsync(wallColorTexturePath);
wallColorTexture.colorSpace = THREE.SRGBColorSpace;
const wallARMTexture = await textureLoader.loadAsync(wallARMTexturePath);
const wallNormalTexture = await textureLoader.loadAsync(wallNormalTexturePath);

// Roof
const roofColorTexture = await textureLoader.loadAsync(roofColorTexturePath);
roofColorTexture.colorSpace = THREE.SRGBColorSpace;
const roofARMTexture = await textureLoader.loadAsync(roofARMTexturePath);
const roofNormalTexture = await textureLoader.loadAsync(roofNormalTexturePath);

roofColorTexture.repeat.set(3, 1);
roofARMTexture.repeat.set(3, 1);
roofNormalTexture.repeat.set(3, 1);

roofColorTexture.wrapS = THREE.RepeatWrapping;
roofARMTexture.wrapS = THREE.RepeatWrapping;
roofNormalTexture.wrapS = THREE.RepeatWrapping;

// Bush
const bushColorTexture = await textureLoader.loadAsync(bushColorTexturePath);
bushColorTexture.colorSpace = THREE.SRGBColorSpace;
const bushARMTexture = await textureLoader.loadAsync(bushARMTexturePath);
const bushNormalTexture = await textureLoader.loadAsync(bushNormalTexturePath);

// Graves
const graveColorTexture = await textureLoader.loadAsync(graveColorTexturePath);
graveColorTexture.colorSpace = THREE.SRGBColorSpace;
const graveARMTexture = await textureLoader.loadAsync(graveARMTexturePath);
const graveNormalTexture = await textureLoader.loadAsync(graveNormalTexturePath);

// Door
const doorColorTexture = await textureLoader.loadAsync(doorColorTexturePath);
doorColorTexture.colorSpace = THREE.SRGBColorSpace;
const doorAmbientOcclusion = await textureLoader.loadAsync(doorAmbientOcclusionTexturePath);
const doorRoughnessTexture = await textureLoader.loadAsync(doorRoughnessTexturePath);
const doorMetalnessTexture = await textureLoader.loadAsync(doorMetalnessTexturePath);
const doorNormalTexture = await textureLoader.loadAsync(doorNormalTexturePath);
const doorAlphaTexture = await textureLoader.loadAsync(doorAlphaTexturePath);
const doorDisplacementTexture = await textureLoader.loadAsync(doorDisplacementTexturePath);

/**
 * 3D Objects
 */

scene.add(new THREE.AxesHelper(25));

// House
const houseGroup = new THREE.Group();
scene.add(houseGroup);

// Floor
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 20, 128, 128),
  new THREE.MeshStandardMaterial({
    map: floorColorTexture,
    transparent: true,
    alphaMap: floorAlphaTexture,
    aoMap: floorARMTexture,
    roughnessMap: floorARMTexture,
    metalnessMap: floorARMTexture,
    normalMap: floorNormalTexture,
    displacementMap: floorDisplacementTexture,
    displacementScale: 0.3,
    displacementBias: -0.2,
  })
);
floor.rotation.x = Math.PI * -0.5;

gui.add(floor.material, 'displacementScale').min(0).max(1).step(0.001).name('floor displacement scale');
gui.add(floor.material, 'displacementBias').min(-1).max(1).step(0.001).name('floor displacement bias');
gui.add(floor.position, 'y').min(0).max(10).step(0.001).name('floor y');

houseGroup.add(floor);

// Walls
const walls = new THREE.Mesh(
  new THREE.BoxGeometry(4, 2.5, 4),
  new THREE.MeshStandardMaterial({
    map: wallColorTexture,
    aoMap: wallARMTexture,
    roughnessMap: wallARMTexture,
    metalnessMap: wallARMTexture,
    normalMap: wallNormalTexture,
  })
);
walls.position.y = walls.geometry.parameters.height / 2;

houseGroup.add(walls);

// Roof
const roof = new THREE.Mesh(
  new THREE.ConeGeometry(3.5, 1.5, 4),
  new THREE.MeshStandardMaterial({
    map: roofColorTexture,
    aoMap: roofARMTexture,
    roughnessMap: roofARMTexture,
    metalnessMap: roofARMTexture,
    normalMap: roofNormalTexture,
  }),
);
roof.position.y = walls.geometry.parameters.height + (roof.geometry.parameters.height / 2);
roof.rotation.y = Math.PI * 0.25;

houseGroup.add(roof);

// Door
const door = new THREE.Mesh(
  new THREE.PlaneGeometry(2.2, 2.2, 128, 128),
  new THREE.MeshStandardMaterial({
    transparent: true,
    map: doorColorTexture,
    alphaMap: doorAlphaTexture,
    aoMap: doorAmbientOcclusion,
    metalnessMap: doorMetalnessTexture,
    roughnessMap: doorRoughnessTexture,
    displacementMap: doorDisplacementTexture,
    normalMap: doorNormalTexture,
    displacementScale: 0.15,
    displacementBias: -0.04,
  })
);

door.position.y = door.geometry.parameters.height * 0.5;
door.position.z = (walls.geometry.parameters.width * 0.5) + 0.01;

houseGroup.add(door);

// Bushes
const bushGeometry = new THREE.SphereGeometry(1, 16, 16);
const bushMaterial = new THREE.MeshStandardMaterial({
  color: '#ccffcc',
  map: bushColorTexture,
  aoMap: bushARMTexture,
  roughnessMap: bushARMTexture,
  metalnessMap: bushARMTexture,
  normalMap: bushNormalTexture,
});

const bushPositions: Array<[x: number, y: number, z: number]> = [
  [0.8, 0.2, 2.2],
  [1.4, 0.1, 2.1],
  [-0.8, 0.1, 2.2],
  [-1, 0.05, 2.6]
];

const bushScales = [0.5, 0.25, 0.4, 0.15];

for (let i = 0; i < bushPositions.length; i++) {
  const bush = new THREE.Mesh(
    bushGeometry,
    bushMaterial
  );
  bush.scale.setScalar(bushScales[i]);
  bush.position.set(...bushPositions[i]);
  bush.rotation.x = -0.75;

  houseGroup.add(bush);
}

// Graves
const gravesGroup = new THREE.Group();
scene.add(gravesGroup);

const graveGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.2);
const graveMaterial = new THREE.MeshStandardMaterial({
  map: graveColorTexture,
  aoMap: graveARMTexture,
  roughnessMap: graveARMTexture,
  metalnessMap: graveARMTexture,
  normalMap: graveNormalTexture,
});

for (let i = 0; i < 30; i++) {
  const angle = Math.random() * Math.PI * 2;
  const radius = 3 + (4 * Math.random());
  const x = Math.sin(angle) * radius;
  const z = Math.cos(angle) * radius;

  const grave = new THREE.Mesh(graveGeometry, graveMaterial);
  grave.position.x = x;
  grave.position.z = z;
  grave.position.y = grave.geometry.parameters.height * 0.5;

  grave.rotation.x = Math.random() - 0.5;
  grave.rotation.y = (Math.random() - 0.5) * 0.4;
  grave.rotation.z = (Math.random() - 0.5) * 0.4;

  gravesGroup.add(grave);
}

/**
 * Lights
 */

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
directionalLight.position.set(3, 2, -8);
scene.add(directionalLight);
scene.add(directionalLight.target);
scene.add(new DirectionalLightHelper(directionalLight, 5));

/**
 * Camera setup
 */

const aspectRatio = width / height;
const camera = new THREE.PerspectiveCamera(75, aspectRatio);
camera.position.x = 5;
camera.position.z = 20;
camera.position.y = 5;
camera.lookAt(new THREE.Vector3());
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