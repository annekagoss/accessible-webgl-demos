export enum Direction {
	BOTTOM = 'bottom',
	LEFT = 'left',
	RIGHT = 'right',
	TOP = 'top',
}

export enum LightTypes {
	AMBIENT = 'ambient',
	BOTTOM = 'bottom',
	LEFT = 'left',
	RIGHT = 'right',
	TOP = 'top',
}

export enum ColorName {
	AMBIENT = 'ambientLight',
	BACKGROUND_A = 'backgroundA',
	BACKGROUND_B = 'backgroundB',
	LEFT = 'leftLight',
	RIGHT = 'rightLight',
	TOP = 'topSpot',
	BOTTOM = 'bottomSpot',
}

export enum BufferType {
	VERTEX = 'vertexBuffer',
	NORMAL = 'normalBuffer',
	TEXTURE = 'textureBuffer',
	TEXTURE_ADDRESS = 'textureAddressBuffer',
	INDEX = 'indexBuffer',
	BARYCENTRIC = 'barycentricBuffer',
}

export type DiffuseSources = Record<string, string>;

export type LightPositions = Record<Direction, number[]>;

export type LightIntensities = Record<LightTypes, number>;

export interface Buffer {
	buffer: WebGLBuffer;
	itemSize: number; // Int > 0
	numItems: number; // Int
	data: number[];
}

export type Buffers = Record<BufferType, Buffer>;

export interface AttributeLocations {
	normal: number;
	textureAddress: number;
	textureCoord: number;
	vertexPosition: number;
}

export interface ShadowAttributeLocations {
	vertexPosition: number;
}

export interface Colors {
	[ColorName.AMBIENT]: string;
	[ColorName.BACKGROUND_A]: string;
	[ColorName.BACKGROUND_B]: string;
	[ColorName.LEFT]: string;
	[ColorName.RIGHT]: string;
	[ColorName.TOP]?: string;
	[ColorName.BOTTOM]?: string;
}

export type GLSLColor = Float32List;

export type GLSLColors = Record<ColorName, GLSLColor>;

export interface RGB {
	r: number;
	g: number;
	b: number;
}

export interface RGBA extends RGB {
	a: number;
}

export enum AxisName {
	x = 'x',
	y = 'y',
	z = 'z',
}

export type Axis = keyof typeof AxisName;

export type Vector3 = Record<Axis, number>;

export interface Vector2 {
	x: number;
	y: number;
}

export interface IndexedVector3 extends Vector3 {
	i?: number;
}

export type Matrix = Float32Array;

export interface SceneProps {
	brightness: number; // float > 0
	colors: Colors;
	diffuseSources: DiffuseSources;
	lightPositions?: LightPositions;
	MTLSource: string; // ext: .mtl
	needsFrameCapture?: boolean;
	OBJSource: string; // ext: .obj
	onFrameCapture?: Function;
	onLoadStart?: Function;
	onError?: Function;
	placeholderImage?: string;
	positionOffset?: Vector3;
	rotationOffset?: Vector3;
	scale: number; // float > 0
	shadowStrength: number; // float > 0
	shininess: number; // float > 0
}

export interface SceneSettings {
	colors: GLSLColors;
	glContext: GLContext;
	interaction: Interaction;
	lightSettings: LightSettings;
	transformation: Transformation;
}

export interface ProgramInfo {
	program: WebGLProgram;
	uniformLocations: Record<string, WebGLUniformLocation>;
	attribLocations: AttributeLocations | ShadowAttributeLocations;
}

export interface Geometry {
	boundingBox?: BoundingBox;
	indices: number[]; // int > 0
	normals: number[]; // float
	positions: number[]; // float
	textureAddresses: number[]; // float
	textures: number[]; // float
}

export interface Face {
	a: IndexedVector3;
	b: IndexedVector3;
	c: IndexedVector3;
}

export interface PartialFace {
	a: Partial<IndexedVector3>;
	b: Partial<IndexedVector3>;
	c: Partial<IndexedVector3>;
}

export interface UnpackedGeometry extends Geometry {
	computedNormals: number[];
	faces: PartialFace[];
	hashIndices: Record<number, number>;
	index: number;
}

export interface Material {
	name: string;
	alphaMap?: string;
	ambient?: number; // float
	bumpMap?: string;
	diffuse?: Float32List; // float
	diffuseMap?: string;
	emissive?: Float32List; // float
	normalMap?: string;
	opacity?: number; // float
	reflectivity?: number; // float
	specular?: Float32List; // float
	specularMap?: string;
	textures?: Textures;
}

export interface Texture {
	texture: WebGLTexture;
	textureSize: Vector2;
}

export interface Textures {
	alphaMap?: Texture;
	bumpMap?: Texture;
	diffuseMap?: Texture;
	normalMap?: Texture;
	specularMap?: Texture;
}

export interface Materials {
	0?: Material;
	1?: Material;
	2?: Material;
	3?: Material;
	4?: Material;
	5?: Material;
	6?: Material;
	7?: Material;
	8?: Material;
	textures?: Textures;
}

export interface Mesh extends Geometry {
	materials: Materials;
}

export interface FBO {
	buffer: WebGLBuffer;
	depthBuffer: WebGLRenderbuffer;
	targetTexture: WebGLTexture;
	textureWidth: number;
	textureHeight: number;
}

export interface GLContext {
	$canvas?: HTMLCanvasElement;
	buffers: Record<BufferType, Buffer>;
	fbo?: FBO;
	gl: WebGLRenderingContext;
	hasMaterial: boolean;
	mesh?: Mesh;
	placeholderTexture?: WebGLTexture;
	programInfo: ProgramInfo;
	shadowProgramInfo: ProgramInfo;
	supportsDepth?: boolean;
	textureCount: number;
}

export interface Transformation {
	translation: Vector3;
	rotation: Vector3;
	scale: number;
}

export interface LightSettings {
	positions: LightPositions;
	intensities: LightIntensities;
	customShininess: number; // float > 0
	shadowStrength: number; // float > 0
}

export interface BoundingBox {
	size: Vector3;
	minX: number; // float
	maxX: number; // float
	minY: number; // float
	maxY: number; // float
	minZ: number; // float
	maxZ: number; // float
}

export interface PerspectiveOptions {
	sourceMatrix: Float32Array;
	fieldOfView: number;
	aspect: number;
	near: number;
	far: number;
}
export interface LookAtOptions {
	target: Vector3;
	origin: Vector3;
	up: Vector3;
}

export interface RenderOptions {
	glContext: GLContext;
	transformation: Transformation;
	colors: GLSLColors;
	lightSettings: LightSettings;
	frameId: number;
}

export interface DrawOptions extends RenderOptions {
	aspect: number;
	shadowPass: boolean;
	frameId: number;
}

export enum UNIFORM_TYPE {
	INT_1 = 'uniform1i',
	FLOAT_1 = 'uniform1f',
	VEC_2 = 'uniform2fv',
	VEC_3 = 'uniform3fv',
	VEC_4 = 'uniform4fv',
}

export interface UniformSetting {
	defaultValue: any;
	isBool?: boolean;
	isRadio?: boolean;
	radioChoices?: string[];
	name: string;
	readonly: boolean;
	type: UNIFORM_TYPE;
	value: any;
}

export type UniformSettings = Record<string, UniformSetting>;

export type FaceArray = Vector3[][];

export interface Textures {
	diffuse: Record<string, string>;
}

export interface OBJData {
	OBJSource: string;
	MTLSource?: string;
	textures?: Textures;
}

export interface WebWorkerLoadMessage {
	onLoadHandler: (data: Mesh) => void;
	OBJData: OBJData;
	useWebWorker?: boolean;
}

export enum MESH_TYPE {
	BASE_TRIANGLES,
	FACE_ARRAY,
	OBJ,
}

export interface GyroscopeData {
	beta: number;
	alpha: number;
	enabled: boolean;
	decelerateTimer: number;
	accelerateTimer: number;
	velocity: Vector3;
}

export interface DragData {
	enabled: boolean;
	isDragging: boolean;
	position: Vector2;
	velocity: Vector3;
	dragVelocity: Vector2;
	decelerateTimer: number;
	accelerateTimer: number;
}

export interface Interaction {
	gyroscope: GyroscopeData;
	drag: DragData;
	rotation: Vector3;
	initialRotation: Vector3;
}

export interface LoadedShaders {
	fragmentShader: WebGLShader;
	vertexShader: WebGLShader;
}
