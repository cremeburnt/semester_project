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
let gui = new GUI;

let capture = false;   // Whether or not to download an image of the canvas on the next redraw

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
    
    const diffTex = texLoader.load( 'models/cat_full_body_texture.png' );
    diffTex.flipY = false;

    const loader = new GLTFLoader().setPath('models/');

    

    loader.load( 'cat_full_with_bones.glb', function ( gltf ) {
        const model = gltf.scene;
        gltf.scene.traverse( ( child ) => {
            console.log(child.type);
            if( child.type === 'SkinnedMesh' ) {
                const mesh = child as THREE.SkinnedMesh;
                console.log(mesh.geometry, mesh.material, mesh.skeleton);
                const brug = new THREE.SkinnedMesh(mesh.geometry, mesh.material);
                brug.skeleton = mesh.skeleton;
                brug.material = new THREE.ShaderMaterial({ 
                    uniforms: {
                        diffuseTex: { value: diffTex },
                    },
                    vertexShader: vertShader, 
                    fragmentShader: fragShader 
                });

                var helper = new THREE.SkeletonHelper(brug.skeleton.bones[0]);
                helper.bones[0].updateMatrixWorld(true);

                scene.add(brug);
                scene.add(helper);

            }
        });
        gui.add( guiState, "Spine", -180.0, 180.0 ).name("Body rotation: ")
                .onChange(function(value: Number) {
                    const bruhg = model.getObjectByName('cat_mesh') as THREE.SkinnedMesh;
                    console.log(bruhg.skeleton);
                    bruhg.skeleton.bones[0].rotation.y = Number(value);
                    draw();
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

const guiState = {
    Spine : 0,
    Head : 0,
    RightForeLeg : 0,
    LeftForeLeg : 0,
    RightHindLeg : 0,
    LeftHindLeg : 0,
    Tail : 0
};

function setupGui() {
    // const gui = new GUI();
    gui.add(buttons, 'screenshot' ).name("Capture Screenshot");

    
    // gui.add( guiState, "angle2", -180.0, 180.0 ).name("Thigh rotation: ")
    //     .onChange((v : number) => angleChanged("thigh", v));
    // gui.add( guiState, "angle3", -180.0, 180.0 ).name("Shin rotation: ")
    //     .onChange((v : number) => angleChanged("shin", v));
    // gui.add( guiState, "angle4", -180.0, 180.0 ).name("Foot rotation: ")
    //     .onChange((v : number) => angleChanged("foot", v));
    // gui.add( guiState, "angle5", -180.0, 180.0 ).name("Big toe rotation: ")
    //     .onChange((v : number) => angleChanged("bigToe", v));
    // gui.add( guiState, "angle6", -180.0, 180.0 ).name("Other toes: ")
    //     .onChange((v : number) => angleChanged("otherToes", v));

}