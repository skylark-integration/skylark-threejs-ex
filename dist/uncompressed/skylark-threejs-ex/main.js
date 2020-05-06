define([
	"skylark-threejs",

	"./shaders/CopyShader",
	"./shaders/BokehShader",
	"./shaders/SAOShader",
	"./shaders/DepthLimitedBlurShader",
	"./shaders/UnpackDepthRGBAShader",
	"./shaders/ConvolutionShader",
	"./shaders/LuminosityHighPassShader",
	"./shaders/FXAAShader",
	"./shaders/SSAOShader",
	"./shaders/FilmShader",
	"./shaders/DotScreenShader",
	"./shaders/LuminosityShader",
	"./shaders/SobelOperatorShader",
	"./shaders/ColorifyShader",
	"./shaders/ToneMapShader",
	"./shaders/TechnicolorShader",
	"./shaders/HueSaturationShader",

	"./postprocessing/EffectComposer",
	"./postprocessing/RenderPass",
	"./postprocessing/ShaderPass",
	"./postprocessing/MaskPass",

	"./curves/NURBSCurve",
	"./curves/NURBSSurface",
	"./curves/NURBSUtils",

	"./objects/Lensflare",
	"./objects/Reflector",
	"./objects/Refractor",

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

	"./modifiers/SimplifyModifier",
	"./modifiers/SubdivisionModifier",

	"./exporters/ColladaExporter",
	"./exporters/DRACOExporter",
	"./exporters/GLTFExporter",
	"./exporters/MMDExporter",
	"./exporters/OBJExporter",
	"./exporters/PLYExporter",
	"./exporters/STLExporter"

],function(THREE){
	return THREE;
});