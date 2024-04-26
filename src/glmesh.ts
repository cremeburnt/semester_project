import {vec3, vec2} from 'gl-matrix';

/**
 * A WebGL renderable mesh.
 */
export class GLMesh {

    points : Float32Array;
    normals : Float32Array;
    triangles : Uint32Array;
    vao : WebGLVertexArrayObject;
    buffers : Array<WebGLBuffer>;

    /**
     * Constructs a GLMesh.  
     * @param {WebGL2RenderingContext} gl the WebGL 2 render context 
     * @param {ObjMesh} mesh the ObjMesh to be rendered 
     */
    constructor(gl : WebGL2RenderingContext, data : {p : Array<vec3>, n : Array<vec3>, tris : Array<number>}) {
        this.vao = null;
        this.buffers = [];
        this.build(gl, data);
    }

    /**
     * Render this shape.
     * 
     * @param {WebGL2RenderingContext} gl the WebGL2 render context
     * @param {ShaderProgram} shader the active ShaderProgram (currently not used)
     */
    render(gl : WebGL2RenderingContext) {
        // If the buffers haven't been initialized, do nothing
        if( this.vao === null ) return;

        // Bind to the VAO and draw the triangles
        gl.bindVertexArray(this.vao);
        gl.drawElements( gl.TRIANGLES, this.triangles.length, gl.UNSIGNED_INT, 0);
        gl.bindVertexArray(null);  // Un-bind the VAO
    }

    /**
     * Builds the internal buffers and VAO for this shape based on the provided mesh.
     * 
     * @param {WebGL2RenderingContext} gl the WebGL2 render context 
     * @param {ObjMesh} mesh the ObjMesh to use as source data 
     */
    private build(gl : WebGL2RenderingContext, data : { p : Array<vec3>, n : Array<vec3>, tris : Array<number> } ) : void {
        if( this.vao !== null )
            this.deleteBuffers(gl);

        // Copy index data
        this.triangles = new Uint32Array(data.tris.length);
        for( let i = 0; i < data.tris.length; i++ ) {
            this.triangles[i] = data.tris[i];
        }

        if( data.p.length !== data.n.length ) {
            throw new Error("Points and normals arrays must be the same length.");
        }
        
        // Flatten
        this.points = new Float32Array(data.p.length * 3);
        this.normals = new Float32Array(data.n.length * 3);
        for( let i = 0; i < data.p.length; i++ ) {
            const p = data.p[i];
            this.points[ i*3 + 0 ] = p[0];
            this.points[ i*3 + 1 ] = p[1];
            this.points[ i*3 + 2 ] = p[2];
            const n = data.n[i];
            this.normals[ i*3 + 0 ] = n[0];
            this.normals[ i*3 + 1 ] = n[1];
            this.normals[ i*3 + 2 ] = n[2];
        }

        this.initVao(gl);
    }

    /**
     * Build the vertex buffers and VAO
     * 
     * @param {WebGL2RenderingContext} gl 
     */
    private initVao(gl : WebGL2RenderingContext ) : void {
        // Check whether or not the buffers have already been initialized, if so, delete them
        if( this.vao !== null ) this.deleteBuffers(gl);
        this.buffers = [];

        // Index buffer
        this.buffers[0] = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers[0]);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.triangles, gl.STATIC_DRAW);

        // Position buffer
        this.buffers[1] = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[1]);
        gl.bufferData(gl.ARRAY_BUFFER, this.points, gl.STATIC_DRAW);

        // Normal buffer
        this.buffers[2] = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[2]);
        gl.bufferData(gl.ARRAY_BUFFER, this.normals, gl.STATIC_DRAW);

        // Setup VAO
        this.vao = gl.createVertexArray();
        gl.bindVertexArray(this.vao);

        // Set up the element buffer.  The buffer bound to GL_ELEMENT_ARRAY_BUFFER
        // is used by glDrawElements to pull index data (the indices used to access
        // data in the other buffers).
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers[0]);

        // Set up the position pointer.  The position is bound to vertex attribute 0.
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[1]);
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(0);

        // Set up the normal pointer.  The normal is bound to vertex attribute 1.
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[2]);
        gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(1);

        gl.bindVertexArray(null); // Done with this VAO
    }

    /**
     * Deletes all of the vertex data in WebGL memory for this object.  This invalidates the
     * vertex arrays, and the object can no longer be drawn.
     * 
     * @param {WebGL2RenderingContext} gl 
     */
    deleteBuffers(gl : WebGL2RenderingContext) : void {
        // Delete all buffers
        this.buffers.forEach( (buf) => gl.deleteBuffer(buf) );
        this.buffers = [];

        // Delete the VAO
        if( this.vao ) {
            gl.deleteVertexArray(this.vao);
            this.vao = null;
        }
    }
}