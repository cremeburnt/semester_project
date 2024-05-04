
// The diffuse texture (use for the base color)
uniform sampler2D diffuseTex;

// The interpolated texture coordinate
in vec2 texCoord;

void main() {
    
    // TODO: Part 1 - Use the product of the RGB from the two textures as the color for the fragment
    vec4 result = texture(diffuseTex, texCoord);
    pc_fragColor = result;
}