import { mat4, vec3 } from "gl-matrix";
import { WireframeMesh } from "./wireframe-mesh";

export function cube( size : number, m : mat4 = null ) : WireframeMesh {
    if( m === null ) 
        m = mat4.identity(mat4.create());
    
    const sz2 = size / 2.0;
    const pts : Array<vec3> = [
        [-sz2, -sz2, sz2],
        [ sz2, -sz2, sz2],
        [ sz2,  sz2, sz2],
        [-sz2,  sz2, sz2],
        [-sz2, -sz2, -sz2],
        [ sz2, -sz2, -sz2],
        [ sz2,  sz2, -sz2],
        [-sz2,  sz2, -sz2],
    ];
    const lines = [
        0, 1, 1, 2, 2, 3, 3, 0,
        4, 5, 5, 6, 6, 7, 7, 4,
        0, 4, 1, 5, 2, 6, 3, 7
    ];
    const transformedPts = pts.map( (p) => vec3.transformMat4(vec3.create(), p, m) )

    return new WireframeMesh(transformedPts, lines);
}

export function cylinder( r : number, widthSegments : number, heightSegments : number, m : mat4 = null ) : WireframeMesh {
    if( m === null ) 
        m = mat4.identity(mat4.create());

    const pts : Array<vec3> = [];
    const lines : Array<number> = [];
    const length = 1.0;

    for(let i = 0; i <= heightSegments; i++ ) {
        const y = i * length / heightSegments;
        for( let j = 0; j <= widthSegments; j++ ) {
            const theta = j * 2.0 * Math.PI / widthSegments;
            const p : [number,number,number] = [r * Math.sin(theta), y, r * Math.cos(theta)];
            pts.push(p);
        }
    }

    for(let i = 0; i < heightSegments; i++ ) {
        for( let j = 0; j < widthSegments; j++ ) {
            const upperLeft = (i+1) * (widthSegments + 1) + j, 
                lowerLeft = i * (widthSegments + 1) + j;
            if( i === heightSegments - 1 ) lines.push( upperLeft, upperLeft + 1 );
            lines.push( lowerLeft, lowerLeft + 1 );
            lines.push( upperLeft, lowerLeft );
        }
    }
    
    const transformedPts = pts.map( (p) => vec3.transformMat4(vec3.create(), p, m) );

    return new WireframeMesh(transformedPts, lines);
}

export function sphere( r : number, widthSegments : number, heightSegments : number, m : mat4 = null ) : WireframeMesh {
    if( m === null ) 
        m = mat4.identity(mat4.create());

    const pts : Array<vec3> = [];
    const lines : Array<number> = [];

    for(let i = 1; i <= heightSegments; i++ ) {
        const theta = i * Math.PI / heightSegments;
        for( let j = 0; j <= widthSegments; j++ ) {
            const phi = j * 2.0 * Math.PI / widthSegments;
            const p : [number,number,number] = [r * Math.sin(theta) * Math.sin(phi), r * Math.cos(theta), r * Math.sin(theta) * Math.cos(phi)];
            pts.push(p);
        }
    }
    // Add top/bottom
    pts.push( [0,r,0] );
    const topIdx = pts.length - 1;
    pts.push( [0,-r,0] );
    const bottomIdx = pts.length - 1;

    for(let i = 0; i < heightSegments - 1; i++ ) {
        for( let j = 0; j < widthSegments; j++ ) {
            const upperLeft = i * (widthSegments + 1) + j, lowerLeft = (i+1) * (widthSegments + 1) + j;
            lines.push( lowerLeft, lowerLeft + 1 );
            lines.push( upperLeft, lowerLeft );
        }
    }

    // Add caps
    for( let i = 0; i <= widthSegments; i++ ) {
        lines.push(topIdx, i);
    }
    const startBottomRow = (widthSegments + 1) * (heightSegments - 2);
    for( let i = 0; i <= widthSegments; i++ ) {
        lines.push(bottomIdx, i + startBottomRow);
    }

    const transformedPts = pts.map( (p) => vec3.transformMat4(vec3.create(), p, m) );

    return new WireframeMesh(transformedPts, lines);
}