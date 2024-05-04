import GUI from 'lil-gui';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import * as THREE from 'three'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';

import vertShader from './shader/cat.vert.glsl';
import fragShader from './shader/cat.frag.glsl';

let canvas : HTMLCanvasElement;
let renderer : THREE.WebGLRenderer;
let camera : THREE.PerspectiveCamera;
let scene : THREE.Scene;

let capture = false;   // Whether or not to download an image of the canvas on the next redraw

///////////////////////////////////////////////////////////
///////////  Do not modify the code below /////////////////
///////////////////////////////////////////////////////////

const guiState = {
};

export const controller = {
    init,
    draw,
    resize
};

function init() {
    setupGui();

    scene = new THREE.Scene();
    canvas = document.getElementById('main-canvas') as HTMLCanvasElement;
    camera = new THREE.PerspectiveCamera( 48, canvas.width / canvas.height, 0.1, 1000 );
    const controls = new OrbitControls(camera, canvas);
    controls.enablePan = true;
    camera.position.z = 2.5;
    renderer = new THREE.WebGLRenderer({ canvas });

    const texLoader = new THREE.TextureLoader();
    
    const diffTex = texLoader.load( 'models/cat_head_body_texture.png' );
    diffTex.flipY = false;

    const loader = new GLTFLoader().setPath('models/');

    loader.load( 'cat_test.glb', function ( gltf ) {
        gltf.scene.traverse( ( child ) => {
            console.log(child.type);
            if( child.type === 'Mesh' ) {
                const mesh = child as THREE.Mesh;
                mesh.material = new THREE.ShaderMaterial({ 
                    uniforms: {
                        diffuseTex: { value: diffTex },
                    },
                    vertexShader: vertShader, 
                    fragmentShader: fragShader 
                });
                scene.add(child);
            }
        });
    }, undefined, function ( error ) {
        console.log("???");
        console.error( error );

    } );

    draw();
}

function draw() : void {
    renderer.render( scene, camera );

    if (capture) {
        capture = false;
        const image = canvas.toDataURL("image/png");
        const aEl = document.createElement('a');
        aEl.setAttribute("download", 'screen.png');
        aEl.setAttribute("href", image);
        aEl.click();
        aEl.remove();
    }
    window.requestAnimationFrame( draw );
}

function resize() {
    const container = document.getElementById('canvas-container');
    
    renderer.setSize( container.clientWidth, container.clientHeight );
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
}

const buttons = {
    screenshot: () => { capture = true; }
};

function setupGui() {
    const gui = new GUI();
    gui.add(buttons, 'screenshot' ).name("Capture Screenshot");
}