define([
	"skylark-threejs",
	"./threex",

	"./animation/AnimationClipCreator",
	"./animation/CCDIKSolver",
	"./animation/MMDAnimationHelper",
	"./animation/MMDPhysics",
	"./animation/TimelinerController",

	"./cameras/CinematicCamera",

	"./controls/DeviceOrientationControls",
	"./controls/DragControls",
	"./controls/FirstPersonControls",
	"./controls/FlyControls",
	"./controls/MapControls",
	"./controls/OrbitControls",
	"./controls/PointerLockControls",
	"./controls/TrackballControls",
	"./controls/TransformControls",
	"./controls/TransformControlsGizmo",
	"./controls/TransformControlsPlane",

	"./csm/CSM",
	"./csm/CSMHelper",
	"./csm/Frustum",
	"./csm/Shader",

	"./curves/CurveExtras",
	"./curves/NURBSCurve",
	"./curves/NURBSSurface",
	"./curves/NURBSUtils",

	"./effects/AnaglyphEffect",
	"./effects/AsciiEffect",
	"./effects/OutlineEffect",
	"./effects/ParallaxBarrierEffect",
	"./effects/PeppersGhostEffect",
	"./effects/StereoEffect",

	"./exporters/ColladaExporter",
	"./exporters/DRACOExporter",
	"./exporters/GLTFExporter",
	"./exporters/MMDExporter",
	"./exporters/OBJExporter",
	"./exporters/PLYExporter",
	"./exporters/STLExporter",
	"./exporters/TypedGeometryExporter",

	"./geometries/BoxLineGeometry",
	"./geometries/ConvexBufferGeometry",
	"./geometries/ConvexGeometry",
	"./geometries/DecalGeometry",
	"./geometries/DecalVertex",
	"./geometries/LightningStrike",
	"./geometries/ParametricGeometries",
	"./geometries/TeapotBufferGeometry",

	"./helpers/FaceNormalsHelper",
	"./helpers/LightProbeHelper",
	"./helpers/PositionalAudioHelper",
	"./helpers/RectAreaLightHelper",
	"./helpers/VertexNormalsHelper",
	"./helpers/VertexTangentsHelper",

	"./interactive/SelectionBox",
	"./interactive/SelectionHelper",

	"./lights/LightProbeGenerator",
	"./lights/RectAreaLightUniformsLib",

	"./lines/Line2",
	"./lines/LineGeometry",
	"./lines/LineMaterial",
	"./lines/LineSegments2",
	"./lines/LineSegmentsGeometry",
	"./lines/Wireframe",
	"./lines/WireframeGeometry2",

	"./loaders/TTFLoader",
//	"./loaders/LoaderSupport",
	"./loaders/3MFLoader",
	"./loaders/AMFLoader",
	"./loaders/AssimpJSONLoader",
	"./loaders/AssimpLoader",
	"./loaders/AWDLoader",
	"./loaders/BabylonLoader",
	"./loaders/ColladaLoader",
	"./loaders/DRACOLoader",
	"./loaders/FBXLoader",
	"./loaders/GCodeLoader",
	"./loaders/GLTFLoader",
	"./loaders/MTLLoader",
	"./loaders/OBJLoader",
	"./loaders/OBJLoader2",
	"./loaders/PCDLoader",
	"./loaders/PLYLoader",
	"./loaders/PRWMLoader",
	"./loaders/STLLoader",
	"./loaders/SVGLoader",
	"./loaders/TDSLoader",
	"./loaders/VRMLLoader",
	"./loaders/VTKLoader",
	"./loaders/XLoader",
	"./loaders/DDSLoader",
	"./loaders/PVRLoader",
	"./loaders/TGALoader",
	"./loaders/KTXLoader",

	"./math/ColorConverter",
	"./math/ConvexHull",
	"./math/ImprovedNoise",
	"./math/Lut",
	"./math/MeshSurfaceSampler",
	"./math/OBB",
	"./math/SimplexNoise",

	"./misc/ConvexObjectBreaker",
	"./misc/GPUComputationRenderer",
	"./misc/Gyroscope",
	"./misc/MD2Character",
	"./misc/MD2CharacterComplex",
	"./misc/MorphAnimMesh",
	"./misc/MorphBlendMesh",
	"./misc/Ocean",
	"./misc/RollerCoaster",
	"./misc/TubePainter",
	"./misc/Volume",
	"./misc/VolumeSlice",

	"./modifiers/ExplodeModifier",
	"./modifiers/SimplifyModifier",
	"./modifiers/SubdivisionModifier",
	"./modifiers/TessellateModifier",

	"./objects/Fire",
	"./objects/Lensflare",
	"./objects/LensflareElement",
	"./objects/LightningStorm",
	"./objects/MarchingCubes",
	"./objects/Reflector",
	"./objects/ReflectorRTT",
	"./objects/Refractor",
	"./objects/ShadowMesh",
	"./objects/Sky",
	"./objects/Water",
	"./objects/Water2",

	"./physics/CannonPhysics",

	"./postprocessing/AdaptiveToneMappingPass",
	"./postprocessing/AfterimagePass",
	"./postprocessing/BloomPass",
	"./postprocessing/BokehPass",
	"./postprocessing/ClearMaskPass",
	"./postprocessing/ClearPass",
	"./postprocessing/CubeTexturePass",
	"./postprocessing/DotScreenPass",
	"./postprocessing/EffectComposer",
	"./postprocessing/FilmPass",
	"./postprocessing/GlitchPass",
	"./postprocessing/HalftonePass",
	"./postprocessing/MaskPass",
	"./postprocessing/OutlinePass",
	"./postprocessing/Pass",
	"./postprocessing/RenderPass",
	"./postprocessing/SAOPass",
	"./postprocessing/SavePass",
	"./postprocessing/ShaderPass",
	"./postprocessing/SMAAPass",
	"./postprocessing/SSAARenderPass",
	"./postprocessing/SSAOPass",
	"./postprocessing/TAARenderPass",
	"./postprocessing/TexturePass",
	"./postprocessing/UnrealBloomPass",

	"./renderers/CSS2DRenderer",
	"./renderers/CSS3DRenderer",
	"./renderers/Projector",
	"./renderers/SVGRenderer",

	"./shaders/AfterimageShader",
	"./shaders/BasicShader",
	"./shaders/BleachBypassShader",
	"./shaders/BlendShader",
	"./shaders/BokehShader",
	"./shaders/BokehShader2",
	"./shaders/BrightnessContrastShader",
	"./shaders/ColorCorrectionShader",
	"./shaders/ColorifyShader",
	"./shaders/ConvolutionShader",
	"./shaders/CopyShader",
	"./shaders/DepthLimitedBlurShader",
	"./shaders/DigitalGlitch",
	"./shaders/DOFMipMapShader",
	"./shaders/DotScreenShader",
	"./shaders/FilmShader",
	"./shaders/FocusShader",
	"./shaders/FreiChenShader",
	"./shaders/FresnelShader",
	"./shaders/FXAAShader",
	"./shaders/GammaCorrectionShader",
	"./shaders/GodRaysShader",
	"./shaders/HalftoneShader",
	"./shaders/HorizontalBlurShader",
	"./shaders/HorizontalTiltShiftShader",
	"./shaders/KaleidoShader",
	"./shaders/LuminosityHighPassShader",
	"./shaders/LuminosityShader",
	"./shaders/MirrorShader",
	"./shaders/NormalMapShader",
	"./shaders/OceanShaders",
	"./shaders/ParallaxShader",
	"./shaders/PixelShader",
	"./shaders/RGBShiftShader",
	"./shaders/SAOShader",
	"./shaders/SepiaShader",
	"./shaders/SMAAShader",


	"./shaders/SobelOperatorShader",
	"./shaders/SSAOBlurShader",
	"./shaders/SSAODepthShader",
	"./shaders/SSAOShader",
	"./shaders/TechnicolorShader",
	"./shaders/ToneMapShader",
	"./shaders/ToonShader",
	"./shaders/TranslucentShader",
	"./shaders/UnpackDepthRGBAShader",
	"./shaders/VerticalBlurShader",
	"./shaders/VerticalTiltShiftShader",
	"./shaders/VignetteShader",
	"./shaders/VolumeShader",
	"./shaders/WaterRefractionShader",

	"./textures/FlakesTexture"



],function(THREE){
	return threex;
});