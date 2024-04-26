#version 300 es
precision highp float;

layout(location=0) in vec4 vPosition;
layout(location=1) in vec3 vNormal;

uniform mat4 mModel;      // Model transform
uniform mat4 mView;       // View transform
uniform mat4 mProjection; // Projection transform

uniform vec3 uLightPosition;  // Light position in world coordinates

out vec3 color;

// Shading function.  Computes the color for the vertex based on the light position.
// all parameters should be in camera coordinates.
vec3 shade( vec3 light, vec3 position, vec3 normal ) {
    vec3 toLight = normalize( light - position );
    return max(0.0, dot(toLight, normal)) * vec3(1,0,0);
}

void main() {
    // TODO: Step 1 - CHANGE these to transform the position and normal in to camera coordinates.
    vec3 posCam = vec3(mView * mModel * vPosition);
    vec3 normCam = normalize(mat3(mView) * mat3(mModel) * vNormal);

    // TODO: Step 2 - CHANGE this to transform the light position (uLightPosition) to camera coordinates
    vec3 lightCam = uLightPosition * transpose(mat3(mView));

    color = shade(lightCam, posCam, normCam);
    
    // TODO: Step 1 - CHANGE this to set gl_Position to the position in clip coordinates
    gl_Position = mProjection * vec4(posCam, 1.0);
}
