import { Vector3 } from '../../types';

// Time without user input before animations pause
export const MAX_IDLE_TIME: number = 1000;

// Number of texture Sampler2D uniforms currently initialized for the phong shader
export const MAX_SUPPORTED_MATERIAL_TEXTURES: number = 5;

export const FIELD_OF_VIEW: number = 40;
export const NEAR_CLIPPING: number = 0.01;
export const FAR_CLIPPING: number = 100;

// Mesh made of two triangles that acts as a projection screen for fragment shaders
export const BASE_TRIANGLE_MESH: number[] = [-1, 1, 0, 1, 1, 0, -1, -1, 0, 1, -1, 0];
// export const DEFAULT_ROTATION_VELOCITY: Vector3 = { x: 0, y: 0.01, z: 0 };
