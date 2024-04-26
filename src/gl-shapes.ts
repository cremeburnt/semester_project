import {vec3} from 'gl-matrix';

export function cube( sideLength = 1.0 ) : { p: Array<vec3>, n: Array<vec3>, tris: Array<number> } {
    const sl2 = sideLength / 2.0;

    return {
        p: [
            // Front
            [-sl2, -sl2, sl2], [sl2, -sl2, sl2], [sl2, sl2, sl2], [-sl2, sl2, sl2],
            // Right
            [ sl2, -sl2, sl2], [sl2, -sl2, -sl2], [sl2, sl2, -sl2], [sl2, sl2, sl2],
            // Left
            [-sl2, -sl2, -sl2], [-sl2, -sl2, sl2], [-sl2, sl2, sl2], [-sl2, sl2, -sl2],
            // Back
            [sl2, -sl2, -sl2], [-sl2, -sl2, -sl2], [-sl2, sl2, -sl2], [sl2, sl2, -sl2],
            // Top
            [-sl2, sl2, sl2], [sl2, sl2, sl2], [sl2, sl2, -sl2], [-sl2, sl2, -sl2],
            // Bottom
            [-sl2, -sl2, -sl2], [sl2, -sl2, -sl2], [sl2, -sl2, sl2], [-sl2, -sl2, sl2],
        ],
        n: [
            // Front
            [0,0,1], [0,0,1], [0,0,1], [0,0,1],
            // Right
            [1,0,0], [1,0,0], [1,0,0], [1,0,0],
            // Left
            [-1,0,0], [-1,0,0], [-1,0,0], [-1,0,0],
            // Back
            [0,0,-1], [0,0,-1], [0,0,-1], [0,0,-1],
            // Top
            [0,1,0], [0,1,0], [0,1,0], [0,1,0],
            // Bottom
            [0,-1,0], [0,-1,0], [0,-1,0], [0,-1,0],
        ],
        tris: [
            // Front face
            0,1,2,0,2,3,
            // Right
            4,5,6,4,6,7,
            // Left
            8,9,10,8,10,11,
            // Back
            12,13,14,12,14,15,
            // Top
            16,17,18,16,18,19,
            // Bottom
            20,21,22,20,22,23,
        ],
    };
}


export function sphere(divU : number = 32, divV : number = 16) : { p: Array<vec3>, n: Array<vec3>, tris: Array<number> }{
    const points = [];
    const normals = [];
    
    // Generate verts (skip poles for now)
    for( let iv = 1; iv <= divV - 1; iv++ ) {
        const theta = iv * (Math.PI) / divV;
        for( let iu = 0; iu < divU; iu++ ) {
            const phi = iu * (Math.PI * 2.0) / divU;
            const p = [
                Math.sin(theta) * Math.sin(phi), 
                Math.cos(theta), 
                Math.sin(theta) * Math.cos(phi)
            ];
            points.push(p);
            normals.push(p);
        }
    }

    // Add the point on the north pole
    points.push([0,1,0]);
    normals.push([0,1,0]);
    const northPoleIndex = points.length - 1;

    // Add the south pole point
    points.push([0,-1,0]);
    normals.push([0,-1,0]);
    const southPoleIndex = points.length - 1;

    // Generate triangles
    const tris = [];
    const stride = divU;
    for( let iv = 0; iv < divV - 2; iv++ ) {
        for( let iu = 0; iu < divU; iu++ ) {
            const nextIdxU = (iu + 1) % divU;
            const idx0 = (iv + 1) * stride + iu;       // bottom left
            const idx1 = (iv + 1) * stride + nextIdxU; // bottom right
            const idx2 = iv * stride + nextIdxU;       // top right
            const idx3 = iv * stride + iu;             // top left

            // Triangles
            tris.push( idx0, idx1, idx2 );
            tris.push( idx0, idx2, idx3 );
        }
    }

    // North pole triangles
    for( let iu = 0; iu < divU; iu++ ) {
        const idx0 = iu;
        const idx1 = (iu + 1) % divU;
        tris.push(idx0, idx1, northPoleIndex);
    }

    // South pole triangles
    const startBottomRow = divU * (divV - 2);
    for( let iu = 0; iu < divU; iu++ ) {
        const idx0 = startBottomRow + (iu + 1) % divU;
        const idx1 = startBottomRow + iu;
        tris.push(idx0, idx1, southPoleIndex);
    }

    return { p: points as Array<vec3>, n: normals as Array<vec3>, tris: tris };
}