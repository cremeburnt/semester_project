import GUI from 'lil-gui';
import {mat4, vec3} from 'gl-matrix';
import * as Shapes from './shapes';

/**
 * A Bone represents a posable segment of a compound object.  Each bone has 
 * a joint somewhere relative to its center with a single rotation axis 
 * through that point.
 */
 class Bone {

    parent : Bone;        // the parent Bone, or null if this is the root Bone
    location : vec3;      // the position of this Bone relative to the parent Bone 
    scale : vec3;         // the scale (size) of this Bone in each dimension
    jointLocation : vec3; // the location of the joint on this Bone relative to the Bone's center
    jointAxis : vec3;     // the axis of rotation for the joint
    jointAngle : number;  // the angle of rotation around the joint axis (in radians)

    /**
     * Constructs a Bone
     */
    constructor(parent : Bone, location : vec3, scale : vec3, jointLocation : vec3, jointAxis : vec3) {
        this.parent = parent;
        this.location = location;
        this.scale = scale;
        this.jointLocation = jointLocation;
        this.jointAxis = jointAxis;
        this.jointAngle = 0;
    }

    /**
     * Returns the pose matrix for this bone.
     */
    poseMatrix() : mat4 {
        let matrix = mat4.create();
        let untranslate = vec3.fromValues(-this.jointLocation[0], -this.jointLocation[1], -this.jointLocation[2])

        mat4.translate(matrix, matrix, this.location);
        mat4.translate(matrix, matrix, this.jointLocation);
        mat4.rotate(matrix, matrix, this.jointAngle, this.jointAxis);
        mat4.translate(matrix, matrix, untranslate);

        if (this.parent != null) {
            mat4.multiply(matrix, this.parent.poseMatrix(), matrix);
        }        

        return matrix;
    }

    modelMatrix() : mat4 {
        let matrix = mat4.create();
        mat4.scale(matrix, matrix, this.scale);
        mat4.multiply(matrix, this.poseMatrix(), matrix)

        return matrix;
    }
}

// This is the mesh used by ALL Bones
const cube = Shapes.cube(1.0);

const scene : Record<string, Bone> = { };

// Create the hierarchy of Bones (a tree or DAG of Bone objects)
scene['torso'] = new Bone(null,           [0.0, 0.55, 0],  [0.5, 0.15, 0.15],    [0,0,0],       [0,1,0]);
scene['thigh'] = new Bone(scene['torso'], [.175, -.3, 0],  [0.15, 0.45, 0.15],   [0, 0.225, 0], [1, 0, 0]);
scene['shin'] = new Bone(scene['thigh'],  [0, -.45, 0],    [0.15, 0.45, 0.15],   [0, 0.225, 0], [1,0,0]);


scene['foot'] = new Bone(scene['shin'], [0, -0.2, 0.175], [0.15, 0.05, 0.2], [0, 0, -0.175], [1, 0, 0])
scene['bigToe'] = new Bone(scene['foot'], [0.05, 0, 0.125], [0.05, 0.05, 0.05], [0, 0, -0.025], [1, 0, 0])
scene['otherToes'] = new Bone(scene['foot'], [-0.025, 0, 0.125], [0.10, 0.05, 0.05], [0, 0, -0.025], [1, 0, 0])

// Called when the angle for one of the bones is changed in the GUI.  The name of the
// bone is provided in the first parameter.
export function angleChanged( name : string, angle : number ) : void {
    if( name in scene ) {
        scene[name].jointAngle = angle * Math.PI / 180.0;
        draw();
    }
}

// Don't call this directly. Instead, call Main.draw(), which will clear the screen and then call this method.
export function drawShapes( ctx : CanvasRenderingContext2D ) : void {
    for( const bone of Object.values(scene) ) {
        cube.draw(ctx, bone.modelMatrix());
    }
}

///////////////////////////////////////////////////////////
///////////  Do not modify the code below /////////////////
///////////////////////////////////////////////////////////

let canvas = null as HTMLCanvasElement;

const guiState = {
    angle1: 0.0,
    angle2: 0.0,
    angle3: 0.0,
    angle4: 0.0,
    angle5: 0.0,
    angle6: 0.0
};

export const controller = {
    init,
    draw,
    resize: () => {}
};

function init() {
    canvas = document.getElementById('main-canvas') as HTMLCanvasElement;

    const gui = new GUI();
    gui.add( guiState, "angle1", -180.0, 180.0 ).name("Torso rotation: ")
        .onChange((v : number) => angleChanged("torso", v));
    gui.add( guiState, "angle2", -180.0, 180.0 ).name("Thigh rotation: ")
        .onChange((v : number) => angleChanged("thigh", v));
    gui.add( guiState, "angle3", -180.0, 180.0 ).name("Shin rotation: ")
        .onChange((v : number) => angleChanged("shin", v));
    gui.add( guiState, "angle4", -180.0, 180.0 ).name("Foot rotation: ")
        .onChange((v : number) => angleChanged("foot", v));
    gui.add( guiState, "angle5", -180.0, 180.0 ).name("Big toe rotation: ")
        .onChange((v : number) => angleChanged("bigToe", v));
    gui.add( guiState, "angle6", -180.0, 180.0 ).name("Other toes: ")
        .onChange((v : number) => angleChanged("otherToes", v));

    draw();
}

export function draw() {
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = 'rgb(255,255,255)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgb(0,0,0)';
    drawShapes(ctx);
}