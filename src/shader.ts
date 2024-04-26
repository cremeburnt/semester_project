
/**
 * A class that represents a GLSL shader program.  
 * 
 * The locations of the uniform variables are accessible via the 
 * uniform function.  The WebGL program object is stored in the 
 * property programId.
 * 
 * Typical use:
 *   const shader = ShaderProgram.compile(gl, vertCode, fragCode);
 *   shader.use(gl);   // Enable shader
 *   // Set a uniform
 *   gl.uniform3f( shader.uniform('color'), 0, 1.0, 1.0 );
 *  
 */
export class ShaderProgram {

    programId : WebGLProgram;
    uniforms: Record<string, WebGLUniformLocation>;

    /** 
     * Constructs an invalid ShaderProgram.  Don't use this constructor.
     * Instead, create a ShaderProgram using the static function compile:
     * 
     *  const shader = ShaderProgram.compile(...);
     */
    private constructor() {
        this.programId = null;
        this.uniforms = {};
    }

    /**
     * Enable this shader in WebGL.  This function does nothing if the 
     * shader is not yet compiled/linked.
     * 
     * @param {WebGL2RenderingContext} gl the WebGL context object
     */
    use(gl : WebGL2RenderingContext ) {
        if( this.programId ) {
            gl.useProgram(this.programId);
        }
    }

    /**
     * Gets the uniform location for the given name (if it exists);
     * 
     * @param {string} name the name of the uniform variable
     * @returns {WebGLUniformLocation} the uniform location object or undefined if not found.
     */
    uniform( gl: WebGL2RenderingContext, name : string ) : WebGLUniformLocation {
        if( name in this.uniforms ) {
            return this.uniforms[name];
        } else {
            const loc = gl.getUniformLocation(this.programId, name);
            if( loc ) {
                this.uniforms[name] = loc;
            }
            return loc;
        }
    }

    /**
     * Attempt to compile and link a shader program.
     * 
     * @param {WebGL2RenderingContext} gl the WebGL context object
     * @param {string} vertCode the code for the vertex shader 
     * @param {string} fragCode the code for the fragment shader
     * @returns {ShaderProgram} the ShaderProgram object
     * @throws {ShaderError} if there is a compiler or linker error.
     */
    static compile(gl : WebGL2RenderingContext, vertCode : string, fragCode : string) {
        const program = new ShaderProgram();

        // Compile
        const vertShdr = program.compileShader(gl, vertCode, gl.VERTEX_SHADER);
        const fragShdr = program.compileShader(gl, fragCode, gl.FRAGMENT_SHADER);

        // Create a program and attach the shaders
        program.programId = gl.createProgram();
        gl.attachShader( program.programId, vertShdr );
        gl.attachShader( program.programId, fragShdr );

        // Link
        program.link(gl);

        // Detach and delete shaders (they are not needed anymore after the program is linked)
        gl.detachShader( program.programId, vertShdr );
        gl.detachShader( program.programId, fragShdr );
        gl.deleteShader( vertShdr );
        gl.deleteShader( fragShdr );

        program.findUniformLocations(gl);

        return program;
    }

    /**
     * Attempts to compile a vertex or fragment shader.  Don't use this function.
     * Instead, use ShaderProgram.compile.
     * 
     * @param {WebGL2RenderingContext} gl the WebGL context object 
     * @param {string} code the shader code 
     * @param {string} shaderType either "vertex" or "fragment"
     * @returns {WebGLShader} the shader object
     * @throws {ShaderError} if compilation fails
     */
    compileShader( gl : WebGL2RenderingContext, code : string, shaderType : number) : WebGLShader {
        const shdr = gl.createShader( shaderType );
        
        gl.shaderSource( shdr, code );
        gl.compileShader( shdr );

        const shaderName = () => {
            switch(shaderType) {
                case gl.VERTEX_SHADER:
                    return "vertex";
                case gl.FRAGMENT_SHADER:
                    return "fragment";
                default:
                    return "";
            }
        };
    
        if ( ! gl.getShaderParameter(shdr, gl.COMPILE_STATUS) ) {
            let lines = gl.getShaderInfoLog(shdr).split(/\r?\n/);
            let name = shaderName();
            
            console.error(`Compilation of ${name} shader failed:`);
            console.group();
            lines.forEach( (line) => console.error(line) );
            console.groupEnd();
            
            throw new ShaderError( `Compilation of ${name} shader failed: ${lines}` );
        }
    
        return shdr;
    }

    /**
     * Attempts to link this ShaderProgram.  Do not use this function, just call
     * ShaderProgram.compile instead.
     * 
     * @param {WebGL2RenderingContext} gl the WebGL context object 
     * @throws {ShaderError} if link fails
     */
    link( gl : WebGL2RenderingContext ) : void  {
        gl.linkProgram( this.programId );
            
        if ( !gl.getProgramParameter(this.programId, gl.LINK_STATUS) ) {
            let lines = gl.getProgramInfoLog( this.programId ).split(/\r?\n/);
            console.error("Shader program failed to link:");
            console.group();
            lines.forEach( (line) => console.error(line) );
            console.groupEnd();
            throw new ShaderError( "Shader program failed to link.  See console for error log." );
        }
    }

    /**
     * Tries to find the locations of all active uniform variables.  This should be
     * considered a private function.
     * 
     * @param {WebGL2RenderingContext} gl the WebGL context object 
     */
    findUniformLocations( gl : WebGL2RenderingContext ) : void {
        const numUniforms = gl.getProgramParameter( this.programId, gl.ACTIVE_UNIFORMS );

        this.uniforms = {};
        for( let i = 0; i < numUniforms; ++i ) {
            const info = gl.getActiveUniform(this.programId, i);
            let loc = gl.getUniformLocation(this.programId, info.name);
            this.uniforms[info.name] = loc;
        }
    }
}

/**
 * A subclass of Error for compilation or linking errors.
 */
class ShaderError extends Error {
    constructor(msg : string) {
        super(msg);
        this.name = 'ShaderError';
    }
}

