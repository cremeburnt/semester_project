import GUI from 'lil-gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as CANNON from 'cannon-es'

let canvas: HTMLCanvasElement;
let renderer: THREE.WebGLRenderer;
let camera: THREE.PerspectiveCamera;
let scene: THREE.Scene;
let catModel: THREE.Group<THREE.Object3DEventMap>;
let catBody: CANNON.Body;
let balls: THREE.Mesh[];
let ballPhysics: CANNON.Body[];
let lightPhysics: CANNON.Body;
let physicsWorld: CANNON.World;
let capture = false;   // Whether or not to download an image of the canvas on the next redraw

const keys: { [key: string]: boolean } = {};

export const controller = {
    init,
    draw,
    resize
};

document.addEventListener('keydown', (event) => {
    keys[event.key] = true;
});

document.addEventListener('keyup', (event) => {
    keys[event.key] = false;
})

function init() {
    scene = new THREE.Scene();
    canvas = document.getElementById('main-canvas') as HTMLCanvasElement;
    camera = new THREE.PerspectiveCamera(48, canvas.width / canvas.height, 0.1, 1000);
    const controls = new OrbitControls(camera, canvas);
    controls.enablePan = true;
    camera.position.z = 10;
    renderer = new THREE.WebGLRenderer({ canvas });

    const texLoader = new THREE.TextureLoader();

    const diffTex = texLoader.load('models/cat_full_body_texture.png');
    diffTex.flipY = false;

    const loader = new GLTFLoader().setPath('models/');

    const ambLight = new THREE.AmbientLight(0xffffff, .75);
    scene.add(ambLight);

    // Create physics world
    physicsWorld = new CANNON.World({
        gravity: new CANNON.Vec3(0, -9.81, 0),
        frictionGravity: new CANNON.Vec3(0, -9.81, 0)
    });

    // Add cat to the scene
    loader.load('cat_full_with_bones.glb', function (gltf) {
        catModel = gltf.scene;
        scene.add(catModel)
        let mesh: THREE.SkinnedMesh<THREE.BufferGeometry<THREE.NormalBufferAttributes>, THREE.Material | THREE.Material[], THREE.Object3DEventMap>;
        gltf.scene.traverse((child) => {
            console.log(child.type);
            if (child.type === 'SkinnedMesh') {
                mesh = child as THREE.SkinnedMesh;
                // var helper = new THREE.SkeletonHelper(model);
                // scene.add(helper);
            }
        });
        //setupGui(catModel);
    }, undefined, function (error) {
        console.log("???");
        console.error(error);
    });

    // Cat Physics
    catBody = new CANNON.Body({
        mass: 100,
        shape: new CANNON.Box(new CANNON.Vec3(.5, 1, 1)),
    });
    physicsWorld.addBody(catBody);

    createWorld();
    draw();
}

function createWorld(): void {
    // Create room
    const dim = 20;
    const roomGeom = new THREE.BoxGeometry(dim, dim, dim);
    const roomMats = new THREE.MeshStandardMaterial(
        {
            color: 0x808080,
            side: THREE.BackSide
        }
    );
    const room = new THREE.Mesh(roomGeom, roomMats);
    room.position.y = 5;
    room.name = "room";
    scene.add(room);

    // Add room physics to physics world
    //createRoomPhysics();
    const roomPhysics = new CANNON.Body({
        type: CANNON.Body.STATIC,
        shape: new CANNON.Plane(),
    });
    roomPhysics.position.y = -5;
    roomPhysics.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    physicsWorld.addBody(roomPhysics);

    // Create light sphere
    const radius = .15;
    // const ballGeom = new THREE.SphereGeometry(radius);
    // const ballMats = new THREE.MeshBasicMaterial({ color: 0xfaffcf });
    // const lightBall = new THREE.Mesh(ballGeom, ballMats);
    const light = new THREE.PointLight(0xfaffcf, 100);

    // lightBall.add(light);
    // lightBall.position.set(1.1, 5.5, 0);
    // lightBall.name = "lightBall";

    // scene.add(lightBall);

    // Add ball of light to physics world
    lightPhysics = new CANNON.Body({
        mass: .001,
        shape: new CANNON.Sphere(radius),
    });
    lightPhysics.position = new CANNON.Vec3(1.1, 5.5, 0);
    physicsWorld.addBody(lightPhysics);


    // Generate More Balls
    balls = [];
    ballPhysics = [];
    for (let i = 0; i < dim; i++) {
        for (let j = 0; j < dim; j++) {
            const ball = new THREE.SphereGeometry(radius);
            const mats = new THREE.MeshStandardMaterial({ color: Math.floor(Math.random() * (1 << 24)) })
            const newBall = new THREE.Mesh(ball, mats);
            newBall.position.set(i - (dim / 2) + .5, 5, j - (dim / 2) + .5);
            newBall.castShadow = true;
            balls.push(newBall);

            scene.add(newBall);

            const bPhys = new CANNON.Body({
                mass: .001,
                shape: new CANNON.Sphere(radius)
            });
            bPhys.position = new CANNON.Vec3(i - (dim / 2) + .5, 5, j - (dim / 2) + .5);
            ballPhysics.push(bPhys);

            physicsWorld.addBody(bPhys);
        }
    }

    const rando = Math.floor(Math.random() * 400);
    balls[rando].add(light);
    balls[rando].material = new THREE.MeshBasicMaterial({ color: 0xfaffcf });
}

function createRoomPhysics() {
    const wall1 = new CANNON.Body({
        type: CANNON.Body.STATIC,
        shape: new CANNON.Plane(),
    });
    wall1.position.set(0, 8.5, 0);
    wall1.quaternion.setFromEuler(Math.PI / 2, 0, 0);
    physicsWorld.addBody(wall1);
}

function updateCatMovement() {
    const speed = 0.0075;
    const turnSpd = 0.0075;

    const movement = new CANNON.Vec3(0, 0, -1);
    const rotateMove = catBody.quaternion.vmult(movement);

    if (keys['w'])
        catBody.position.vadd(rotateMove.scale(-speed), catBody.position);
    if (keys['s'])
        catBody.position.vadd(rotateMove.scale(speed), catBody.position);
    if (keys['a']) {
        const curAngle = new CANNON.Vec3();
        catBody.quaternion.toEuler(curAngle);
        curAngle.y += turnSpd;
        catBody.quaternion.setFromEuler(curAngle.x, curAngle.y, curAngle.z);
    }
    if (keys['d']) {
        const curAngle = new CANNON.Vec3();
        catBody.quaternion.toEuler(curAngle);
        curAngle.y -= turnSpd;
        catBody.quaternion.setFromEuler(curAngle.x, curAngle.y, curAngle.z);
    }
}


function draw(): void {
    physicsWorld.fixedStep();
    updateCatMovement();
    //scene.getObjectByName("lightBall").position.copy(new THREE.Vector3(lightPhysics.position.x, lightPhysics.position.y, lightPhysics.position.z));
    if (catModel != undefined) {
        catModel.position.copy(catBody.position);
        catModel.quaternion.copy(catBody.quaternion);
    }

    for (let i = 0; i < balls.length; i++) {
        balls[i].position.copy(ballPhysics[i].position);
    }

    renderer.render(scene, camera);


    if (capture) {
        capture = false;
        const image = canvas.toDataURL("image/png");
        const aEl = document.createElement('a');
        aEl.setAttribute("download", 'screen.png');
        aEl.setAttribute("href", image);
        aEl.click();
        aEl.remove();
    }

    window.requestAnimationFrame(draw);
}

function resize() {
    const container = document.getElementById('canvas-container');

    renderer.setSize(container.clientWidth, container.clientHeight);
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
}

const buttons = {
    screenshot: () => { capture = true; }
};

const guiState = {
    Spine: 0,
    Head: 0,
    RightForeLeg: 0,
    LeftForeLeg: 0,
    RightHindLeg: 0,
    LeftHindLeg: 0,
    Tail: 0
};

function setupGui(model: THREE.Group<THREE.Object3DEventMap>) {
    const gui = new GUI();
    gui.add(buttons, 'screenshot').name("Capture Screenshot");


    gui.add(guiState, "Spine", -180.0, 180.0).name("Body rotation: ")
        .onChange(function (value: Number) {
            model.getObjectByName('Spine').rotation.z = Number(value) / 180.0 * Math.PI;
            catBody.quaternion.setFromEuler(0, -Number(value) / 180.0 * Math.PI, 0);
        });
    gui.add(guiState, "Head", -180.0, 180.0).name("Head rotation: ")
        .onChange(function (value: Number) {
            model.getObjectByName('Head').rotation.x = Number(value) / 180.0 * Math.PI;
        });
    gui.add(guiState, "RightForeLeg", -180.0, 180.0).name("RightForeLeg rotation: ")
        .onChange(function (value: Number) {
            const part = model.getObjectByName('RightForeLeg');
            part.rotation.x = 0;
            part.rotation.y = 0;
            part.rotation.z = 0;
            part.rotateZ(-0.56);
            part.rotateX(Number(value) / 180.0 * Math.PI);
        });
    gui.add(guiState, "LeftForeLeg", -180.0, 180.0).name("LeftForeLeg rotation: ")
        .onChange(function (value: Number) {
            const part = model.getObjectByName('LeftForeLeg');
            part.rotation.x = 0;
            part.rotation.y = 0;
            part.rotation.z = 0;
            part.rotateZ(0.56);
            part.rotateX(Number(value) / 180.0 * Math.PI);
        });
    gui.add(guiState, "RightHindLeg", -180.0, 180.0).name("RightHindLeg rotation: ")
        .onChange(function (value: Number) {
            const part = model.getObjectByName('RightHindLeg');
            part.rotation.x = 0;
            part.rotation.y = 0;
            part.rotation.z = 0;
            part.rotateZ(-0.56);
            part.rotateX(Number(value) / 180.0 * Math.PI);
        });
    gui.add(guiState, "LeftHindLeg", -180.0, 180.0).name("LeftHindLeg rotation: ")
        .onChange(function (value: Number) {
            const part = model.getObjectByName('LeftHindLeg');
            part.rotation.x = 0;
            part.rotation.y = 0;
            part.rotation.z = 0;
            part.rotateZ(0.56);
            part.rotateX(Number(value) / 180.0 * Math.PI);
        });

}