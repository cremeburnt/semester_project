import {mat4, vec3} from 'gl-matrix';

/**
 * A Bone represents a posable segment of a compound object.  Each bone has 
 * a joint somewhere relative to its center with a single rotation axis 
 * through that point.
 */
 export class Bone {

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


// bones tell shape location and joint stuff, apply to shape later