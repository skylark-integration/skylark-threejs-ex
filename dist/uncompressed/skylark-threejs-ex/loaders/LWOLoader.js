define([
    "skylark-threejs",
    "../threex"
], function (
    THREE,
    threex
) {
    'use strict';
    function LWO2Parser(IFFParser) {
        this.IFF = IFFParser;
    }
    LWO2Parser.prototype = {
        constructor: LWO2Parser,
        parseBlock: function () {
            this.IFF.debugger.offset = this.IFF.reader.offset;
            this.IFF.debugger.closeForms();
            var blockID = this.IFF.reader.getIDTag();
            var length = this.IFF.reader.getUint32();
            if (length > this.IFF.reader.dv.byteLength - this.IFF.reader.offset) {
                this.IFF.reader.offset -= 4;
                length = this.IFF.reader.getUint16();
            }
            this.IFF.debugger.dataOffset = this.IFF.reader.offset;
            this.IFF.debugger.length = length;
            switch (blockID) {
            case 'FORM':
                this.IFF.parseForm(length);
                break;
            case 'ICON':
            case 'VMPA':
            case 'BBOX':
            case 'NORM':
            case 'PRE ':
            case 'POST':
            case 'KEY ':
            case 'SPAN':
            case 'TIME':
            case 'CLRS':
            case 'CLRA':
            case 'FILT':
            case 'DITH':
            case 'CONT':
            case 'BRIT':
            case 'SATR':
            case 'HUE ':
            case 'GAMM':
            case 'NEGA':
            case 'IFLT':
            case 'PFLT':
            case 'PROJ':
            case 'AXIS':
            case 'AAST':
            case 'PIXB':
            case 'AUVO':
            case 'STCK':
            case 'PROC':
            case 'VALU':
            case 'FUNC':
            case 'PNAM':
            case 'INAM':
            case 'GRST':
            case 'GREN':
            case 'GRPT':
            case 'FKEY':
            case 'IKEY':
            case 'CSYS':
            case 'OPAQ':
            case 'CMAP':
            case 'NLOC':
            case 'NZOM':
            case 'NVER':
            case 'NSRV':
            case 'NVSK':
            case 'NCRD':
            case 'WRPW':
            case 'WRPH':
            case 'NMOD':
            case 'NPRW':
            case 'NPLA':
            case 'NODS':
            case 'VERS':
            case 'ENUM':
            case 'TAG ':
            case 'OPAC':
            case 'CGMD':
            case 'CGTY':
            case 'CGST':
            case 'CGEN':
            case 'CGTS':
            case 'CGTE':
            case 'OSMP':
            case 'OMDE':
            case 'OUTR':
            case 'FLAG':
            case 'TRNL':
            case 'GLOW':
            case 'GVAL':
            case 'SHRP':
            case 'RFOP':
            case 'RSAN':
            case 'TROP':
            case 'RBLR':
            case 'TBLR':
            case 'CLRH':
            case 'CLRF':
            case 'ADTR':
            case 'LINE':
            case 'ALPH':
            case 'VCOL':
            case 'ENAB':
                this.IFF.debugger.skipped = true;
                this.IFF.reader.skip(length);
                break;
            case 'SURF':
                this.IFF.parseSurfaceLwo2(length);
                break;
            case 'CLIP':
                this.IFF.parseClipLwo2(length);
                break;
            case 'IPIX':
            case 'IMIP':
            case 'IMOD':
            case 'AMOD':
            case 'IINV':
            case 'INCR':
            case 'IAXS':
            case 'IFOT':
            case 'ITIM':
            case 'IWRL':
            case 'IUTI':
            case 'IINX':
            case 'IINY':
            case 'IINZ':
            case 'IREF':
                if (length === 4)
                    this.IFF.currentNode[blockID] = this.IFF.reader.getInt32();
                else
                    this.IFF.reader.skip(length);
                break;
            case 'OTAG':
                this.IFF.parseObjectTag();
                break;
            case 'LAYR':
                this.IFF.parseLayer(length);
                break;
            case 'PNTS':
                this.IFF.parsePoints(length);
                break;
            case 'VMAP':
                this.IFF.parseVertexMapping(length);
                break;
            case 'AUVU':
            case 'AUVN':
                this.IFF.reader.skip(length - 1);
                this.IFF.reader.getVariableLengthIndex();
                break;
            case 'POLS':
                this.IFF.parsePolygonList(length);
                break;
            case 'TAGS':
                this.IFF.parseTagStrings(length);
                break;
            case 'PTAG':
                this.IFF.parsePolygonTagMapping(length);
                break;
            case 'VMAD':
                this.IFF.parseVertexMapping(length, true);
                break;
            case 'DESC':
                this.IFF.currentForm.description = this.IFF.reader.getString();
                break;
            case 'TEXT':
            case 'CMNT':
            case 'NCOM':
                this.IFF.currentForm.comment = this.IFF.reader.getString();
                break;
            case 'NAME':
                this.IFF.currentForm.channelName = this.IFF.reader.getString();
                break;
            case 'WRAP':
                this.IFF.currentForm.wrap = {
                    w: this.IFF.reader.getUint16(),
                    h: this.IFF.reader.getUint16()
                };
                break;
            case 'IMAG':
                var index = this.IFF.reader.getVariableLengthIndex();
                this.IFF.currentForm.imageIndex = index;
                break;
            case 'OREF':
                this.IFF.currentForm.referenceObject = this.IFF.reader.getString();
                break;
            case 'ROID':
                this.IFF.currentForm.referenceObjectID = this.IFF.reader.getUint32();
                break;
            case 'SSHN':
                this.IFF.currentSurface.surfaceShaderName = this.IFF.reader.getString();
                break;
            case 'AOVN':
                this.IFF.currentSurface.surfaceCustomAOVName = this.IFF.reader.getString();
                break;
            case 'NSTA':
                this.IFF.currentForm.disabled = this.IFF.reader.getUint16();
                break;
            case 'NRNM':
                this.IFF.currentForm.realName = this.IFF.reader.getString();
                break;
            case 'NNME':
                this.IFF.currentForm.refName = this.IFF.reader.getString();
                this.IFF.currentSurface.nodes[this.IFF.currentForm.refName] = this.IFF.currentForm;
                break;
            case 'INME':
                if (!this.IFF.currentForm.nodeName)
                    this.IFF.currentForm.nodeName = [];
                this.IFF.currentForm.nodeName.push(this.IFF.reader.getString());
                break;
            case 'IINN':
                if (!this.IFF.currentForm.inputNodeName)
                    this.IFF.currentForm.inputNodeName = [];
                this.IFF.currentForm.inputNodeName.push(this.IFF.reader.getString());
                break;
            case 'IINM':
                if (!this.IFF.currentForm.inputName)
                    this.IFF.currentForm.inputName = [];
                this.IFF.currentForm.inputName.push(this.IFF.reader.getString());
                break;
            case 'IONM':
                if (!this.IFF.currentForm.inputOutputName)
                    this.IFF.currentForm.inputOutputName = [];
                this.IFF.currentForm.inputOutputName.push(this.IFF.reader.getString());
                break;
            case 'FNAM':
                this.IFF.currentForm.fileName = this.IFF.reader.getString();
                break;
            case 'CHAN':
                if (length === 4)
                    this.IFF.currentForm.textureChannel = this.IFF.reader.getIDTag();
                else
                    this.IFF.reader.skip(length);
                break;
            case 'SMAN':
                var maxSmoothingAngle = this.IFF.reader.getFloat32();
                this.IFF.currentSurface.attributes.smooth = maxSmoothingAngle < 0 ? false : true;
                break;
            case 'COLR':
                this.IFF.currentSurface.attributes.undefined = { value: this.IFF.reader.getFloat32Array(3) };
                this.IFF.reader.skip(2);
                break;
            case 'LUMI':
                this.IFF.currentSurface.attributes.Luminosity = { value: this.IFF.reader.getFloat32() };
                this.IFF.reader.skip(2);
                break;
            case 'SPEC':
                this.IFF.currentSurface.attributes.Specular = { value: this.IFF.reader.getFloat32() };
                this.IFF.reader.skip(2);
                break;
            case 'DIFF':
                this.IFF.currentSurface.attributes.Diffuse = { value: this.IFF.reader.getFloat32() };
                this.IFF.reader.skip(2);
                break;
            case 'REFL':
                this.IFF.currentSurface.attributes.Reflection = { value: this.IFF.reader.getFloat32() };
                this.IFF.reader.skip(2);
                break;
            case 'GLOS':
                this.IFF.currentSurface.attributes.Glossiness = { value: this.IFF.reader.getFloat32() };
                this.IFF.reader.skip(2);
                break;
            case 'TRAN':
                this.IFF.currentSurface.attributes.opacity = this.IFF.reader.getFloat32();
                this.IFF.reader.skip(2);
                break;
            case 'BUMP':
                this.IFF.currentSurface.attributes.bumpStrength = this.IFF.reader.getFloat32();
                this.IFF.reader.skip(2);
                break;
            case 'SIDE':
                this.IFF.currentSurface.attributes.side = this.IFF.reader.getUint16();
                break;
            case 'RIMG':
                this.IFF.currentSurface.attributes.reflectionMap = this.IFF.reader.getVariableLengthIndex();
                break;
            case 'RIND':
                this.IFF.currentSurface.attributes.refractiveIndex = this.IFF.reader.getFloat32();
                this.IFF.reader.skip(2);
                break;
            case 'TIMG':
                this.IFF.currentSurface.attributes.refractionMap = this.IFF.reader.getVariableLengthIndex();
                break;
            case 'IMAP':
                this.IFF.reader.skip(2);
                break;
            case 'TMAP':
                this.IFF.debugger.skipped = true;
                this.IFF.reader.skip(length);
                break;
            case 'IUVI':
                this.IFF.currentNode.UVChannel = this.IFF.reader.getString(length);
                break;
            case 'IUTL':
                this.IFF.currentNode.widthWrappingMode = this.IFF.reader.getUint32();
                break;
            case 'IVTL':
                this.IFF.currentNode.heightWrappingMode = this.IFF.reader.getUint32();
                break;
            case 'BLOK':
                break;
            default:
                this.IFF.parseUnknownCHUNK(blockID, length);
            }
            if (blockID != 'FORM') {
                this.IFF.debugger.node = 1;
                this.IFF.debugger.nodeID = blockID;
                this.IFF.debugger.log();
            }
            if (this.IFF.reader.offset >= this.IFF.currentFormEnd) {
                this.IFF.currentForm = this.IFF.parentForm;
            }
        }
    };
    function LWO3Parser(IFFParser) {
        this.IFF = IFFParser;
    }
    LWO3Parser.prototype = {
        constructor: LWO3Parser,
        parseBlock: function () {
            this.IFF.debugger.offset = this.IFF.reader.offset;
            this.IFF.debugger.closeForms();
            var blockID = this.IFF.reader.getIDTag();
            var length = this.IFF.reader.getUint32();
            this.IFF.debugger.dataOffset = this.IFF.reader.offset;
            this.IFF.debugger.length = length;
            switch (blockID) {
            case 'FORM':
                this.IFF.parseForm(length);
                break;
            case 'ICON':
            case 'VMPA':
            case 'BBOX':
            case 'NORM':
            case 'PRE ':
            case 'POST':
            case 'KEY ':
            case 'SPAN':
            case 'TIME':
            case 'CLRS':
            case 'CLRA':
            case 'FILT':
            case 'DITH':
            case 'CONT':
            case 'BRIT':
            case 'SATR':
            case 'HUE ':
            case 'GAMM':
            case 'NEGA':
            case 'IFLT':
            case 'PFLT':
            case 'PROJ':
            case 'AXIS':
            case 'AAST':
            case 'PIXB':
            case 'STCK':
            case 'VALU':
            case 'PNAM':
            case 'INAM':
            case 'GRST':
            case 'GREN':
            case 'GRPT':
            case 'FKEY':
            case 'IKEY':
            case 'CSYS':
            case 'OPAQ':
            case 'CMAP':
            case 'NLOC':
            case 'NZOM':
            case 'NVER':
            case 'NSRV':
            case 'NCRD':
            case 'NMOD':
            case 'NSEL':
            case 'NPRW':
            case 'NPLA':
            case 'VERS':
            case 'ENUM':
            case 'TAG ':
            case 'CGMD':
            case 'CGTY':
            case 'CGST':
            case 'CGEN':
            case 'CGTS':
            case 'CGTE':
            case 'OSMP':
            case 'OMDE':
            case 'OUTR':
            case 'FLAG':
            case 'TRNL':
            case 'SHRP':
            case 'RFOP':
            case 'RSAN':
            case 'TROP':
            case 'RBLR':
            case 'TBLR':
            case 'CLRH':
            case 'CLRF':
            case 'ADTR':
            case 'GLOW':
            case 'LINE':
            case 'ALPH':
            case 'VCOL':
            case 'ENAB':
                this.IFF.debugger.skipped = true;
                this.IFF.reader.skip(length);
                break;
            case 'IPIX':
            case 'IMIP':
            case 'IMOD':
            case 'AMOD':
            case 'IINV':
            case 'INCR':
            case 'IAXS':
            case 'IFOT':
            case 'ITIM':
            case 'IWRL':
            case 'IUTI':
            case 'IINX':
            case 'IINY':
            case 'IINZ':
            case 'IREF':
                if (length === 4)
                    this.IFF.currentNode[blockID] = this.IFF.reader.getInt32();
                else
                    this.IFF.reader.skip(length);
                break;
            case 'OTAG':
                this.IFF.parseObjectTag();
                break;
            case 'LAYR':
                this.IFF.parseLayer(length);
                break;
            case 'PNTS':
                this.IFF.parsePoints(length);
                break;
            case 'VMAP':
                this.IFF.parseVertexMapping(length);
                break;
            case 'POLS':
                this.IFF.parsePolygonList(length);
                break;
            case 'TAGS':
                this.IFF.parseTagStrings(length);
                break;
            case 'PTAG':
                this.IFF.parsePolygonTagMapping(length);
                break;
            case 'VMAD':
                this.IFF.parseVertexMapping(length, true);
                break;
            case 'DESC':
                this.IFF.currentForm.description = this.IFF.reader.getString();
                break;
            case 'TEXT':
            case 'CMNT':
            case 'NCOM':
                this.IFF.currentForm.comment = this.IFF.reader.getString();
                break;
            case 'NAME':
                this.IFF.currentForm.channelName = this.IFF.reader.getString();
                break;
            case 'WRAP':
                this.IFF.currentForm.wrap = {
                    w: this.IFF.reader.getUint16(),
                    h: this.IFF.reader.getUint16()
                };
                break;
            case 'IMAG':
                var index = this.IFF.reader.getVariableLengthIndex();
                this.IFF.currentForm.imageIndex = index;
                break;
            case 'OREF':
                this.IFF.currentForm.referenceObject = this.IFF.reader.getString();
                break;
            case 'ROID':
                this.IFF.currentForm.referenceObjectID = this.IFF.reader.getUint32();
                break;
            case 'SSHN':
                this.IFF.currentSurface.surfaceShaderName = this.IFF.reader.getString();
                break;
            case 'AOVN':
                this.IFF.currentSurface.surfaceCustomAOVName = this.IFF.reader.getString();
                break;
            case 'NSTA':
                this.IFF.currentForm.disabled = this.IFF.reader.getUint16();
                break;
            case 'NRNM':
                this.IFF.currentForm.realName = this.IFF.reader.getString();
                break;
            case 'NNME':
                this.IFF.currentForm.refName = this.IFF.reader.getString();
                this.IFF.currentSurface.nodes[this.IFF.currentForm.refName] = this.IFF.currentForm;
                break;
            case 'INME':
                if (!this.IFF.currentForm.nodeName)
                    this.IFF.currentForm.nodeName = [];
                this.IFF.currentForm.nodeName.push(this.IFF.reader.getString());
                break;
            case 'IINN':
                if (!this.IFF.currentForm.inputNodeName)
                    this.IFF.currentForm.inputNodeName = [];
                this.IFF.currentForm.inputNodeName.push(this.IFF.reader.getString());
                break;
            case 'IINM':
                if (!this.IFF.currentForm.inputName)
                    this.IFF.currentForm.inputName = [];
                this.IFF.currentForm.inputName.push(this.IFF.reader.getString());
                break;
            case 'IONM':
                if (!this.IFF.currentForm.inputOutputName)
                    this.IFF.currentForm.inputOutputName = [];
                this.IFF.currentForm.inputOutputName.push(this.IFF.reader.getString());
                break;
            case 'FNAM':
                this.IFF.currentForm.fileName = this.IFF.reader.getString();
                break;
            case 'CHAN':
                if (length === 4)
                    this.IFF.currentForm.textureChannel = this.IFF.reader.getIDTag();
                else
                    this.IFF.reader.skip(length);
                break;
            case 'SMAN':
                var maxSmoothingAngle = this.IFF.reader.getFloat32();
                this.IFF.currentSurface.attributes.smooth = maxSmoothingAngle < 0 ? false : true;
                break;
            case 'COLR':
                this.IFF.currentSurface.attributes.undefined = { value: this.IFF.reader.getFloat32Array(3) };
                this.IFF.reader.skip(2);
                break;
            case 'LUMI':
                this.IFF.currentSurface.attributes.Luminosity = { value: this.IFF.reader.getFloat32() };
                this.IFF.reader.skip(2);
                break;
            case 'SPEC':
                this.IFF.currentSurface.attributes.Specular = { value: this.IFF.reader.getFloat32() };
                this.IFF.reader.skip(2);
                break;
            case 'DIFF':
                this.IFF.currentSurface.attributes.Diffuse = { value: this.IFF.reader.getFloat32() };
                this.IFF.reader.skip(2);
                break;
            case 'REFL':
                this.IFF.currentSurface.attributes.Reflection = { value: this.IFF.reader.getFloat32() };
                this.IFF.reader.skip(2);
                break;
            case 'GLOS':
                this.IFF.currentSurface.attributes.Glossiness = { value: this.IFF.reader.getFloat32() };
                this.IFF.reader.skip(2);
                break;
            case 'TRAN':
                this.IFF.currentSurface.attributes.opacity = this.IFF.reader.getFloat32();
                this.IFF.reader.skip(2);
                break;
            case 'BUMP':
                this.IFF.currentSurface.attributes.bumpStrength = this.IFF.reader.getFloat32();
                this.IFF.reader.skip(2);
                break;
            case 'SIDE':
                this.IFF.currentSurface.attributes.side = this.IFF.reader.getUint16();
                break;
            case 'RIMG':
                this.IFF.currentSurface.attributes.reflectionMap = this.IFF.reader.getVariableLengthIndex();
                break;
            case 'RIND':
                this.IFF.currentSurface.attributes.refractiveIndex = this.IFF.reader.getFloat32();
                this.IFF.reader.skip(2);
                break;
            case 'TIMG':
                this.IFF.currentSurface.attributes.refractionMap = this.IFF.reader.getVariableLengthIndex();
                break;
            case 'IMAP':
                this.IFF.currentSurface.attributes.imageMapIndex = this.IFF.reader.getUint32();
                break;
            case 'IUVI':
                this.IFF.currentNode.UVChannel = this.IFF.reader.getString(length);
                break;
            case 'IUTL':
                this.IFF.currentNode.widthWrappingMode = this.IFF.reader.getUint32();
                break;
            case 'IVTL':
                this.IFF.currentNode.heightWrappingMode = this.IFF.reader.getUint32();
                break;
            default:
                this.IFF.parseUnknownCHUNK(blockID, length);
            }
            if (blockID != 'FORM') {
                this.IFF.debugger.node = 1;
                this.IFF.debugger.nodeID = blockID;
                this.IFF.debugger.log();
            }
            if (this.IFF.reader.offset >= this.IFF.currentFormEnd) {
                this.IFF.currentForm = this.IFF.parentForm;
            }
        }
    };
    function IFFParser() {
        this.debugger = new Debugger();
    }
    IFFParser.prototype = {
        constructor: IFFParser,
        parse: function (buffer) {
            this.reader = new DataViewReader(buffer);
            this.tree = {
                materials: {},
                layers: [],
                tags: [],
                textures: []
            };
            this.currentLayer = this.tree;
            this.currentForm = this.tree;
            this.parseTopForm();
            if (this.tree.format === undefined)
                return;
            if (this.tree.format === 'LWO2') {
                this.parser = new LWO2Parser(this);
                while (!this.reader.endOfFile())
                    this.parser.parseBlock();
            } else if (this.tree.format === 'LWO3') {
                this.parser = new LWO3Parser(this);
                while (!this.reader.endOfFile())
                    this.parser.parseBlock();
            }
            this.debugger.offset = this.reader.offset;
            this.debugger.closeForms();
            return this.tree;
        },
        parseTopForm() {
            this.debugger.offset = this.reader.offset;
            var topForm = this.reader.getIDTag();
            if (topForm !== 'FORM') {
                console.warn('LWOLoader: Top-level FORM missing.');
                return;
            }
            var length = this.reader.getUint32();
            this.debugger.dataOffset = this.reader.offset;
            this.debugger.length = length;
            var type = this.reader.getIDTag();
            if (type === 'LWO2') {
                this.tree.format = type;
            } else if (type === 'LWO3') {
                this.tree.format = type;
            }
            this.debugger.node = 0;
            this.debugger.nodeID = type;
            this.debugger.log();
            return;
        },
        parseForm(length) {
            var type = this.reader.getIDTag();
            switch (type) {
            case 'ISEQ':
            case 'ANIM':
            case 'STCC':
            case 'VPVL':
            case 'VPRM':
            case 'NROT':
            case 'WRPW':
            case 'WRPH':
            case 'FUNC':
            case 'FALL':
            case 'OPAC':
            case 'GRAD':
            case 'ENVS':
            case 'VMOP':
            case 'VMBG':
            case 'OMAX':
            case 'STEX':
            case 'CKBG':
            case 'CKEY':
            case 'VMLA':
            case 'VMLB':
                this.debugger.skipped = true;
                this.skipForm(length);
                break;
            case 'META':
            case 'NNDS':
            case 'NODS':
            case 'NDTA':
            case 'ADAT':
            case 'AOVS':
            case 'BLOK':
            case 'IBGC':
            case 'IOPC':
            case 'IIMG':
            case 'TXTR':
                this.debugger.length = 4;
                this.debugger.skipped = true;
                break;
            case 'IFAL':
            case 'ISCL':
            case 'IPOS':
            case 'IROT':
            case 'IBMP':
            case 'IUTD':
            case 'IVTD':
                this.parseTextureNodeAttribute(type);
                break;
            case 'ENVL':
                this.parseEnvelope(length);
                break;
            case 'CLIP':
                if (this.tree.format === 'LWO2') {
                    this.parseForm(length);
                } else {
                    this.parseClip(length);
                }
                break;
            case 'STIL':
                this.parseImage();
                break;
            case 'XREF':
                this.reader.skip(8);
                this.currentForm.referenceTexture = {
                    index: this.reader.getUint32(),
                    refName: this.reader.getString()
                };
                break;
            case 'IMST':
                this.parseImageStateForm(length);
                break;
            case 'SURF':
                this.parseSurfaceForm(length);
                break;
            case 'VALU':
                this.parseValueForm(length);
                break;
            case 'NTAG':
                this.parseSubNode(length);
                break;
            case 'ATTR':
            case 'SATR':
                this.setupForm('attributes', length);
                break;
            case 'NCON':
                this.parseConnections(length);
                break;
            case 'SSHA':
                this.parentForm = this.currentForm;
                this.currentForm = this.currentSurface;
                this.setupForm('surfaceShader', length);
                break;
            case 'SSHD':
                this.setupForm('surfaceShaderData', length);
                break;
            case 'ENTR':
                this.parseEntryForm(length);
                break;
            case 'IMAP':
                this.parseImageMap(length);
                break;
            case 'TAMP':
                this.parseXVAL('amplitude', length);
                break;
            case 'TMAP':
                this.setupForm('textureMap', length);
                break;
            case 'CNTR':
                this.parseXVAL3('center', length);
                break;
            case 'SIZE':
                this.parseXVAL3('scale', length);
                break;
            case 'ROTA':
                this.parseXVAL3('rotation', length);
                break;
            default:
                this.parseUnknownForm(type, length);
            }
            this.debugger.node = 0;
            this.debugger.nodeID = type;
            this.debugger.log();
        },
        setupForm(type, length) {
            if (!this.currentForm)
                this.currentForm = this.currentNode;
            this.currentFormEnd = this.reader.offset + length;
            this.parentForm = this.currentForm;
            if (!this.currentForm[type]) {
                this.currentForm[type] = {};
                this.currentForm = this.currentForm[type];
            } else {
                console.warn('LWOLoader: form already exists on parent: ', type, this.currentForm);
                this.currentForm = this.currentForm[type];
            }
        },
        skipForm(length) {
            this.reader.skip(length - 4);
        },
        parseUnknownForm(type, length) {
            console.warn('LWOLoader: unknown FORM encountered: ' + type, length);
            printBuffer(this.reader.dv.buffer, this.reader.offset, length - 4);
            this.reader.skip(length - 4);
        },
        parseSurfaceForm(length) {
            this.reader.skip(8);
            var name = this.reader.getString();
            var surface = {
                attributes: {},
                connections: {},
                name: name,
                inputName: name,
                nodes: {},
                source: this.reader.getString()
            };
            this.tree.materials[name] = surface;
            this.currentSurface = surface;
            this.parentForm = this.tree.materials;
            this.currentForm = surface;
            this.currentFormEnd = this.reader.offset + length;
        },
        parseSurfaceLwo2(length) {
            var name = this.reader.getString();
            var surface = {
                attributes: {},
                connections: {},
                name: name,
                nodes: {},
                source: this.reader.getString()
            };
            this.tree.materials[name] = surface;
            this.currentSurface = surface;
            this.parentForm = this.tree.materials;
            this.currentForm = surface;
            this.currentFormEnd = this.reader.offset + length;
        },
        parseSubNode(length) {
            this.reader.skip(8);
            var name = this.reader.getString();
            var node = { name: name };
            this.currentForm = node;
            this.currentNode = node;
            this.currentFormEnd = this.reader.offset + length;
        },
        parseConnections(length) {
            this.currentFormEnd = this.reader.offset + length;
            this.parentForm = this.currentForm;
            this.currentForm = this.currentSurface.connections;
        },
        parseEntryForm(length) {
            this.reader.skip(8);
            var name = this.reader.getString();
            this.currentForm = this.currentNode.attributes;
            this.setupForm(name, length);
        },
        parseValueForm() {
            this.reader.skip(8);
            var valueType = this.reader.getString();
            if (valueType === 'double') {
                this.currentForm.value = this.reader.getUint64();
            } else if (valueType === 'int') {
                this.currentForm.value = this.reader.getUint32();
            } else if (valueType === 'vparam') {
                this.reader.skip(24);
                this.currentForm.value = this.reader.getFloat64();
            } else if (valueType === 'vparam3') {
                this.reader.skip(24);
                this.currentForm.value = this.reader.getFloat64Array(3);
            }
        },
        parseImageStateForm() {
            this.reader.skip(8);
            this.currentForm.mipMapLevel = this.reader.getFloat32();
        },
        parseImageMap(length) {
            this.currentFormEnd = this.reader.offset + length;
            this.parentForm = this.currentForm;
            if (!this.currentForm.maps)
                this.currentForm.maps = [];
            var map = {};
            this.currentForm.maps.push(map);
            this.currentForm = map;
            this.reader.skip(10);
        },
        parseTextureNodeAttribute(type) {
            this.reader.skip(28);
            this.reader.skip(20);
            switch (type) {
            case 'ISCL':
                this.currentNode.scale = this.reader.getFloat32Array(3);
                break;
            case 'IPOS':
                this.currentNode.position = this.reader.getFloat32Array(3);
                break;
            case 'IROT':
                this.currentNode.rotation = this.reader.getFloat32Array(3);
                break;
            case 'IFAL':
                this.currentNode.falloff = this.reader.getFloat32Array(3);
                break;
            case 'IBMP':
                this.currentNode.amplitude = this.reader.getFloat32();
                break;
            case 'IUTD':
                this.currentNode.uTiles = this.reader.getFloat32();
                break;
            case 'IVTD':
                this.currentNode.vTiles = this.reader.getFloat32();
                break;
            }
            this.reader.skip(2);
        },
        parseEnvelope(length) {
            this.reader.skip(length - 4);
        },
        parseClip(length) {
            var tag = this.reader.getIDTag();
            if (tag === 'FORM') {
                this.reader.skip(16);
                this.currentNode.fileName = this.reader.getString();
                return;
            }
            this.reader.setOffset(this.reader.offset - 4);
            this.currentFormEnd = this.reader.offset + length;
            this.parentForm = this.currentForm;
            this.reader.skip(8);
            var texture = { index: this.reader.getUint32() };
            this.tree.textures.push(texture);
            this.currentForm = texture;
        },
        parseClipLwo2(length) {
            var texture = {
                index: this.reader.getUint32(),
                fileName: ''
            };
            while (true) {
                var tag = this.reader.getIDTag();
                var n_length = this.reader.getUint16();
                if (tag === 'STIL') {
                    texture.fileName = this.reader.getString();
                    break;
                }
                if (n_length >= length) {
                    break;
                }
            }
            this.tree.textures.push(texture);
            this.currentForm = texture;
        },
        parseImage() {
            this.reader.skip(8);
            this.currentForm.fileName = this.reader.getString();
        },
        parseXVAL(type, length) {
            var endOffset = this.reader.offset + length - 4;
            this.reader.skip(8);
            this.currentForm[type] = this.reader.getFloat32();
            this.reader.setOffset(endOffset);
        },
        parseXVAL3(type, length) {
            var endOffset = this.reader.offset + length - 4;
            this.reader.skip(8);
            this.currentForm[type] = {
                x: this.reader.getFloat32(),
                y: this.reader.getFloat32(),
                z: this.reader.getFloat32()
            };
            this.reader.setOffset(endOffset);
        },
        parseObjectTag() {
            if (!this.tree.objectTags)
                this.tree.objectTags = {};
            this.tree.objectTags[this.reader.getIDTag()] = { tagString: this.reader.getString() };
        },
        parseLayer(length) {
            var layer = {
                number: this.reader.getUint16(),
                flags: this.reader.getUint16(),
                pivot: this.reader.getFloat32Array(3),
                name: this.reader.getString()
            };
            this.tree.layers.push(layer);
            this.currentLayer = layer;
            var parsedLength = 16 + stringOffset(this.currentLayer.name);
            this.currentLayer.parent = parsedLength < length ? this.reader.getUint16() : -1;
        },
        parsePoints(length) {
            this.currentPoints = [];
            for (var i = 0; i < length / 4; i += 3) {
                this.currentPoints.push(this.reader.getFloat32(), this.reader.getFloat32(), -this.reader.getFloat32());
            }
        },
        parseVertexMapping(length, discontinuous) {
            var finalOffset = this.reader.offset + length;
            var channelName = this.reader.getString();
            if (this.reader.offset === finalOffset) {
                this.currentForm.UVChannel = channelName;
                return;
            }
            this.reader.setOffset(this.reader.offset - stringOffset(channelName));
            var type = this.reader.getIDTag();
            this.reader.getUint16();
            var name = this.reader.getString();
            var remainingLength = length - 6 - stringOffset(name);
            switch (type) {
            case 'TXUV':
                this.parseUVMapping(name, finalOffset, discontinuous);
                break;
            case 'MORF':
            case 'SPOT':
                this.parseMorphTargets(name, finalOffset, type);
                break;
            case 'APSL':
            case 'NORM':
            case 'WGHT':
            case 'MNVW':
            case 'PICK':
            case 'RGB ':
            case 'RGBA':
                this.reader.skip(remainingLength);
                break;
            default:
                console.warn('LWOLoader: unknown vertex map type: ' + type);
                this.reader.skip(remainingLength);
            }
        },
        parseUVMapping(name, finalOffset, discontinuous) {
            var uvIndices = [];
            var polyIndices = [];
            var uvs = [];
            while (this.reader.offset < finalOffset) {
                uvIndices.push(this.reader.getVariableLengthIndex());
                if (discontinuous)
                    polyIndices.push(this.reader.getVariableLengthIndex());
                uvs.push(this.reader.getFloat32(), this.reader.getFloat32());
            }
            if (discontinuous) {
                if (!this.currentLayer.discontinuousUVs)
                    this.currentLayer.discontinuousUVs = {};
                this.currentLayer.discontinuousUVs[name] = {
                    uvIndices: uvIndices,
                    polyIndices: polyIndices,
                    uvs: uvs
                };
            } else {
                if (!this.currentLayer.uvs)
                    this.currentLayer.uvs = {};
                this.currentLayer.uvs[name] = {
                    uvIndices: uvIndices,
                    uvs: uvs
                };
            }
        },
        parseMorphTargets(name, finalOffset, type) {
            var indices = [];
            var points = [];
            type = type === 'MORF' ? 'relative' : 'absolute';
            while (this.reader.offset < finalOffset) {
                indices.push(this.reader.getVariableLengthIndex());
                points.push(this.reader.getFloat32(), this.reader.getFloat32(), -this.reader.getFloat32());
            }
            if (!this.currentLayer.morphTargets)
                this.currentLayer.morphTargets = {};
            this.currentLayer.morphTargets[name] = {
                indices: indices,
                points: points,
                type: type
            };
        },
        parsePolygonList(length) {
            var finalOffset = this.reader.offset + length;
            var type = this.reader.getIDTag();
            var indices = [];
            var polygonDimensions = [];
            while (this.reader.offset < finalOffset) {
                var numverts = this.reader.getUint16();
                numverts = numverts & 1023;
                polygonDimensions.push(numverts);
                for (var j = 0; j < numverts; j++)
                    indices.push(this.reader.getVariableLengthIndex());
            }
            var geometryData = {
                type: type,
                vertexIndices: indices,
                polygonDimensions: polygonDimensions,
                points: this.currentPoints
            };
            if (polygonDimensions[0] === 1)
                geometryData.type = 'points';
            else if (polygonDimensions[0] === 2)
                geometryData.type = 'lines';
            this.currentLayer.geometry = geometryData;
        },
        parseTagStrings(length) {
            this.tree.tags = this.reader.getStringArray(length);
        },
        parsePolygonTagMapping(length) {
            var finalOffset = this.reader.offset + length;
            var type = this.reader.getIDTag();
            if (type === 'SURF')
                this.parseMaterialIndices(finalOffset);
            else {
                this.reader.skip(length - 4);
            }
        },
        parseMaterialIndices(finalOffset) {
            this.currentLayer.geometry.materialIndices = [];
            while (this.reader.offset < finalOffset) {
                var polygonIndex = this.reader.getVariableLengthIndex();
                var materialIndex = this.reader.getUint16();
                this.currentLayer.geometry.materialIndices.push(polygonIndex, materialIndex);
            }
        },
        parseUnknownCHUNK(blockID, length) {
            console.warn('LWOLoader: unknown chunk type: ' + blockID + ' length: ' + length);
            var data = this.reader.getString(length);
            this.currentForm[blockID] = data;
        }
    };
    function DataViewReader(buffer) {
        this.dv = new DataView(buffer);
        this.offset = 0;
    }
    DataViewReader.prototype = {
        constructor: DataViewReader,
        size: function () {
            return this.dv.buffer.byteLength;
        },
        setOffset(offset) {
            if (offset > 0 && offset < this.dv.buffer.byteLength) {
                this.offset = offset;
            } else {
                console.error('LWOLoader: invalid buffer offset');
            }
        },
        endOfFile: function () {
            if (this.offset >= this.size())
                return true;
            return false;
        },
        skip: function (length) {
            this.offset += length;
        },
        getUint8: function () {
            var value = this.dv.getUint8(this.offset);
            this.offset += 1;
            return value;
        },
        getUint16: function () {
            var value = this.dv.getUint16(this.offset);
            this.offset += 2;
            return value;
        },
        getInt32: function () {
            var value = this.dv.getInt32(this.offset, false);
            this.offset += 4;
            return value;
        },
        getUint32: function () {
            var value = this.dv.getUint32(this.offset, false);
            this.offset += 4;
            return value;
        },
        getUint64: function () {
            var low, high;
            high = this.getUint32();
            low = this.getUint32();
            return high * 4294967296 + low;
        },
        getFloat32: function () {
            var value = this.dv.getFloat32(this.offset, false);
            this.offset += 4;
            return value;
        },
        getFloat32Array: function (size) {
            var a = [];
            for (var i = 0; i < size; i++) {
                a.push(this.getFloat32());
            }
            return a;
        },
        getFloat64: function () {
            var value = this.dv.getFloat64(this.offset, this.littleEndian);
            this.offset += 8;
            return value;
        },
        getFloat64Array: function (size) {
            var a = [];
            for (var i = 0; i < size; i++) {
                a.push(this.getFloat64());
            }
            return a;
        },
        getVariableLengthIndex() {
            var firstByte = this.getUint8();
            if (firstByte === 255) {
                return this.getUint8() * 65536 + this.getUint8() * 256 + this.getUint8();
            }
            return firstByte * 256 + this.getUint8();
        },
        getIDTag() {
            return this.getString(4);
        },
        getString: function (size) {
            if (size === 0)
                return;
            var a = [];
            if (size) {
                for (var i = 0; i < size; i++) {
                    a[i] = this.getUint8();
                }
            } else {
                var currentChar;
                var len = 0;
                while (currentChar !== 0) {
                    currentChar = this.getUint8();
                    if (currentChar !== 0)
                        a.push(currentChar);
                    len++;
                }
                if (!isEven(len + 1))
                    this.getUint8();
            }
            return THREE.LoaderUtils.decodeText(new Uint8Array(a));
        },
        getStringArray: function (size) {
            var a = this.getString(size);
            a = a.split('\0');
            return a.filter(Boolean);
        }
    };
    function Debugger() {
        this.active = false;
        this.depth = 0;
        this.formList = [];
    }
    Debugger.prototype = {
        constructor: Debugger,
        enable: function () {
            this.active = true;
        },
        log: function () {
            if (!this.active)
                return;
            var nodeType;
            switch (this.node) {
            case 0:
                nodeType = 'FORM';
                break;
            case 1:
                nodeType = 'CHK';
                break;
            case 2:
                nodeType = 'S-CHK';
                break;
            }
            console.log('| '.repeat(this.depth) + nodeType, this.nodeID, `( ${ this.offset } ) -> ( ${ this.dataOffset + this.length } )`, this.node == 0 ? ' {' : '', this.skipped ? 'SKIPPED' : '', this.node == 0 && this.skipped ? '}' : '');
            if (this.node == 0 && !this.skipped) {
                this.depth += 1;
                this.formList.push(this.dataOffset + this.length);
            }
            this.skipped = false;
        },
        closeForms: function () {
            if (!this.active)
                return;
            for (var i = this.formList.length - 1; i >= 0; i--) {
                if (this.offset >= this.formList[i]) {
                    this.depth -= 1;
                    console.log('| '.repeat(this.depth) + '}');
                    this.formList.splice(-1, 1);
                }
            }
        }
    };
    function isEven(num) {
        return num % 2;
    }
    function stringOffset(string) {
        return string.length + 1 + (isEven(string.length + 1) ? 1 : 0);
    }
    function printBuffer(buffer, from, to) {
        console.log(THREE.LoaderUtils.decodeText(new Uint8Array(buffer, from, to)));
    }
    var lwoTree;
    var LWOLoader = function (manager, parameters) {
        THREE.Loader.call(this, manager);
        parameters = parameters || {};
        this.resourcePath = parameters.resourcePath !== undefined ? parameters.resourcePath : '';
    };
    LWOLoader.prototype = Object.assign(Object.create(THREE.Loader.prototype), {
        constructor: LWOLoader,
        load: function (url, onLoad, onProgress, onError) {
            var self = this;
            var path = self.path === '' ? extractParentUrl(url, 'Objects') : self.path;
            var modelName = url.split(path).pop().split('.')[0];
            var loader = new THREE.FileLoader(this.manager);
            loader.setPath(self.path);
            loader.setResponseType('arraybuffer');
            loader.load(url, function (buffer) {
                onLoad(self.parse(buffer, path, modelName));
            }, onProgress, onError);
        },
        parse: function (iffBuffer, path, modelName) {
            lwoTree = new IFFParser().parse(iffBuffer);
            var textureLoader = new THREE.TextureLoader(this.manager).setPath(this.resourcePath || path).setCrossOrigin(this.crossOrigin);
            return new LWOTreeParser(textureLoader).parse(modelName);
        }
    });
    function LWOTreeParser(textureLoader) {
        this.textureLoader = textureLoader;
    }
    LWOTreeParser.prototype = {
        constructor: LWOTreeParser,
        parse: function (modelName) {
            this.materials = new MaterialParser(this.textureLoader).parse();
            this.defaultLayerName = modelName;
            this.meshes = this.parseLayers();
            return {
                materials: this.materials,
                meshes: this.meshes
            };
        },
        parseLayers() {
            var meshes = [];
            var finalMeshes = [];
            var geometryParser = new GeometryParser();
            var self = this;
            lwoTree.layers.forEach(function (layer) {
                var geometry = geometryParser.parse(layer.geometry, layer);
                var mesh = self.parseMesh(geometry, layer);
                meshes[layer.number] = mesh;
                if (layer.parent === -1)
                    finalMeshes.push(mesh);
                else
                    meshes[layer.parent].add(mesh);
            });
            this.applyPivots(finalMeshes);
            return finalMeshes;
        },
        parseMesh(geometry, layer) {
            var mesh;
            var materials = this.getMaterials(geometry.userData.matNames, layer.geometry.type);
            this.duplicateUVs(geometry, materials);
            if (layer.geometry.type === 'points')
                mesh = new THREE.Points(geometry, materials);
            else if (layer.geometry.type === 'lines')
                mesh = new THREE.LineSegments(geometry, materials);
            else
                mesh = new THREE.Mesh(geometry, materials);
            if (layer.name)
                mesh.name = layer.name;
            else
                mesh.name = this.defaultLayerName + '_layer_' + layer.number;
            mesh.userData.pivot = layer.pivot;
            return mesh;
        },
        applyPivots(meshes) {
            meshes.forEach(function (mesh) {
                mesh.traverse(function (child) {
                    var pivot = child.userData.pivot;
                    child.position.x += pivot[0];
                    child.position.y += pivot[1];
                    child.position.z += pivot[2];
                    if (child.parent) {
                        var parentPivot = child.parent.userData.pivot;
                        child.position.x -= parentPivot[0];
                        child.position.y -= parentPivot[1];
                        child.position.z -= parentPivot[2];
                    }
                });
            });
        },
        getMaterials(namesArray, type) {
            var materials = [];
            var self = this;
            namesArray.forEach(function (name, i) {
                materials[i] = self.getMaterialByName(name);
            });
            if (type === 'points' || type === 'lines') {
                materials.forEach(function (mat, i) {
                    var spec = { color: mat.color };
                    if (type === 'points') {
                        spec.size = 0.1;
                        spec.map = mat.map;
                        spec.morphTargets = mat.morphTargets;
                        materials[i] = new THREE.PointsMaterial(spec);
                    } else if (type === 'lines') {
                        materials[i] = new THREE.LineBasicMaterial(spec);
                    }
                });
            }
            var filtered = materials.filter(Boolean);
            if (filtered.length === 1)
                return filtered[0];
            return materials;
        },
        getMaterialByName(name) {
            return this.materials.filter(function (m) {
                return m.name === name;
            })[0];
        },
        duplicateUVs(geometry, materials) {
            var duplicateUVs = false;
            if (!Array.isArray(materials)) {
                if (materials.aoMap)
                    duplicateUVs = true;
            } else {
                materials.forEach(function (material) {
                    if (material.aoMap)
                        duplicateUVs = true;
                });
            }
            if (!duplicateUVs)
                return;
            geometry.setAttribute('uv2', new THREE.BufferAttribute(geometry.attributes.uv.array, 2));
        }
    };
    function MaterialParser(textureLoader) {
        this.textureLoader = textureLoader;
    }
    MaterialParser.prototype = {
        constructor: MaterialParser,
        parse: function () {
            var materials = [];
            this.textures = {};
            for (var name in lwoTree.materials) {
                if (lwoTree.format === 'LWO3') {
                    materials.push(this.parseMaterial(lwoTree.materials[name], name, lwoTree.textures));
                } else if (lwoTree.format === 'LWO2') {
                    materials.push(this.parseMaterialLwo2(lwoTree.materials[name], name, lwoTree.textures));
                }
            }
            return materials;
        },
        parseMaterial(materialData, name, textures) {
            var params = {
                name: name,
                side: this.getSide(materialData.attributes),
                flatShading: this.getSmooth(materialData.attributes)
            };
            var connections = this.parseConnections(materialData.connections, materialData.nodes);
            var maps = this.parseTextureNodes(connections.maps);
            this.parseAttributeImageMaps(connections.attributes, textures, maps, materialData.maps);
            var attributes = this.parseAttributes(connections.attributes, maps);
            this.parseEnvMap(connections, maps, attributes);
            params = Object.assign(maps, params);
            params = Object.assign(params, attributes);
            var materialType = this.getMaterialType(connections.attributes);
            return new materialType(params);
        },
        parseMaterialLwo2(materialData, name) {
            var params = {
                name: name,
                side: this.getSide(materialData.attributes),
                flatShading: this.getSmooth(materialData.attributes)
            };
            var attributes = this.parseAttributes(materialData.attributes, {});
            params = Object.assign(params, attributes);
            return new THREE.MeshPhongMaterial(params);
        },
        getSide(attributes) {
            if (!attributes.side)
                return THREE.BackSide;
            switch (attributes.side) {
            case 0:
            case 1:
                return THREE.BackSide;
            case 2:
                return THREE.FrontSide;
            case 3:
                return THREE.DoubleSide;
            }
        },
        getSmooth(attributes) {
            if (!attributes.smooth)
                return true;
            return !attributes.smooth;
        },
        parseConnections(connections, nodes) {
            var materialConnections = { maps: {} };
            var inputName = connections.inputName;
            var inputNodeName = connections.inputNodeName;
            var nodeName = connections.nodeName;
            var self = this;
            inputName.forEach(function (name, index) {
                if (name === 'Material') {
                    var matNode = self.getNodeByRefName(inputNodeName[index], nodes);
                    materialConnections.attributes = matNode.attributes;
                    materialConnections.envMap = matNode.fileName;
                    materialConnections.name = inputNodeName[index];
                }
            });
            nodeName.forEach(function (name, index) {
                if (name === materialConnections.name) {
                    materialConnections.maps[inputName[index]] = self.getNodeByRefName(inputNodeName[index], nodes);
                }
            });
            return materialConnections;
        },
        getNodeByRefName(refName, nodes) {
            for (var name in nodes) {
                if (nodes[name].refName === refName)
                    return nodes[name];
            }
        },
        parseTextureNodes(textureNodes) {
            var maps = {};
            for (var name in textureNodes) {
                var node = textureNodes[name];
                var path = node.fileName;
                if (!path)
                    return;
                var texture = this.loadTexture(path);
                if (node.widthWrappingMode !== undefined)
                    texture.wrapS = this.getWrappingType(node.widthWrappingMode);
                if (node.heightWrappingMode !== undefined)
                    texture.wrapT = this.getWrappingType(node.heightWrappingMode);
                switch (name) {
                case 'Color':
                    maps.map = texture;
                    break;
                case 'Roughness':
                    maps.roughnessMap = texture;
                    maps.roughness = 0.5;
                    break;
                case 'Specular':
                    maps.specularMap = texture;
                    maps.specular = 16777215;
                    break;
                case 'Luminous':
                    maps.emissiveMap = texture;
                    maps.emissive = 8421504;
                    break;
                case 'Luminous Color':
                    maps.emissive = 8421504;
                    break;
                case 'Metallic':
                    maps.metalnessMap = texture;
                    maps.metalness = 0.5;
                    break;
                case 'Transparency':
                case 'Alpha':
                    maps.alphaMap = texture;
                    maps.transparent = true;
                    break;
                case 'Normal':
                    maps.normalMap = texture;
                    if (node.amplitude !== undefined)
                        maps.normalScale = new THREE.Vector2(node.amplitude, node.amplitude);
                    break;
                case 'Bump':
                    maps.bumpMap = texture;
                    break;
                }
            }
            if (maps.roughnessMap && maps.specularMap)
                delete maps.specularMap;
            return maps;
        },
        parseAttributeImageMaps(attributes, textures, maps) {
            for (var name in attributes) {
                var attribute = attributes[name];
                if (attribute.maps) {
                    var mapData = attribute.maps[0];
                    var path = this.getTexturePathByIndex(mapData.imageIndex, textures);
                    if (!path)
                        return;
                    var texture = this.loadTexture(path);
                    if (mapData.wrap !== undefined)
                        texture.wrapS = this.getWrappingType(mapData.wrap.w);
                    if (mapData.wrap !== undefined)
                        texture.wrapT = this.getWrappingType(mapData.wrap.h);
                    switch (name) {
                    case 'Color':
                        maps.map = texture;
                        break;
                    case 'Diffuse':
                        maps.aoMap = texture;
                        break;
                    case 'Roughness':
                        maps.roughnessMap = texture;
                        maps.roughness = 1;
                        break;
                    case 'Specular':
                        maps.specularMap = texture;
                        maps.specular = 16777215;
                        break;
                    case 'Luminosity':
                        maps.emissiveMap = texture;
                        maps.emissive = 8421504;
                        break;
                    case 'Metallic':
                        maps.metalnessMap = texture;
                        maps.metalness = 1;
                        break;
                    case 'Transparency':
                    case 'Alpha':
                        maps.alphaMap = texture;
                        maps.transparent = true;
                        break;
                    case 'Normal':
                        maps.normalMap = texture;
                        break;
                    case 'Bump':
                        maps.bumpMap = texture;
                        break;
                    }
                }
            }
        },
        parseAttributes(attributes, maps) {
            var params = {};
            if (attributes.undefined && !maps.map) {
                params.color = new THREE.Color().fromArray(attributes.undefined.value);
            } else
                params.color = new THREE.Color();
            if (attributes.Transparency && attributes.Transparency.value !== 0) {
                params.opacity = 1 - attributes.Transparency.value;
                params.transparent = true;
            }
            if (attributes['Bump Height'])
                params.bumpScale = attributes['Bump Height'].value * 0.1;
            if (attributes['Refraction Index'])
                params.refractionRatio = 1 / attributes['Refraction Index'].value;
            this.parsePhysicalAttributes(params, attributes, maps);
            this.parseStandardAttributes(params, attributes, maps);
            this.parsePhongAttributes(params, attributes, maps);
            return params;
        },
        parsePhysicalAttributes(params, attributes) {
            if (attributes.Clearcoat && attributes.Clearcoat.value > 0) {
                params.clearcoat = attributes.Clearcoat.value;
                if (attributes['Clearcoat Gloss']) {
                    params.clearcoatRoughness = 0.5 * (1 - attributes['Clearcoat Gloss'].value);
                }
            }
        },
        parseStandardAttributes(params, attributes, maps) {
            if (attributes.Luminous) {
                params.emissiveIntensity = attributes.Luminous.value;
                if (attributes['Luminous Color'] && !maps.emissive) {
                    params.emissive = new THREE.Color().fromArray(attributes['Luminous Color'].value);
                } else {
                    params.emissive = new THREE.Color(8421504);
                }
            }
            if (attributes.Roughness && !maps.roughnessMap)
                params.roughness = attributes.Roughness.value;
            if (attributes.Metallic && !maps.metalnessMap)
                params.metalness = attributes.Metallic.value;
        },
        parsePhongAttributes(params, attributes, maps) {
            if (attributes.Diffuse)
                params.color.multiplyScalar(attributes.Diffuse.value);
            if (attributes.Reflection) {
                params.reflectivity = attributes.Reflection.value;
                params.combine = THREE.AddOperation;
            }
            if (attributes.Luminosity) {
                params.emissiveIntensity = attributes.Luminosity.value;
                if (!maps.emissiveMap && !maps.map) {
                    params.emissive = params.color;
                } else {
                    params.emissive = new THREE.Color(8421504);
                }
            }
            if (!attributes.Roughness && attributes.Specular && !maps.specularMap) {
                if (attributes['Color Highlight']) {
                    params.specular = new THREE.Color().setScalar(attributes.Specular.value).lerp(params.color.clone().multiplyScalar(attributes.Specular.value), attributes['Color Highlight'].value);
                } else {
                    params.specular = new THREE.Color().setScalar(attributes.Specular.value);
                }
            }
            if (params.specular && attributes.Glossiness)
                params.shininess = 7 + Math.pow(2, attributes.Glossiness.value * 12 + 2);
        },
        parseEnvMap(connections, maps, attributes) {
            if (connections.envMap) {
                var envMap = this.loadTexture(connections.envMap);
                if (attributes.transparent && attributes.opacity < 0.999) {
                    envMap.mapping = THREE.EquirectangularRefractionMapping;
                    if (attributes.reflectivity !== undefined) {
                        delete attributes.reflectivity;
                        delete attributes.combine;
                    }
                    if (attributes.metalness !== undefined) {
                        delete attributes.metalness;
                    }
                } else
                    envMap.mapping = THREE.EquirectangularReflectionMapping;
                maps.envMap = envMap;
            }
        },
        getTexturePathByIndex(index) {
            var fileName = '';
            if (!lwoTree.textures)
                return fileName;
            lwoTree.textures.forEach(function (texture) {
                if (texture.index === index)
                    fileName = texture.fileName;
            });
            return fileName;
        },
        loadTexture(path) {
            if (!path)
                return null;
            var texture;
            texture = this.textureLoader.load(path, undefined, undefined, function () {
                console.warn('LWOLoader: non-standard resource hierarchy. Use `resourcePath` parameter to specify root content directory.');
            });
            return texture;
        },
        getWrappingType(num) {
            switch (num) {
            case 0:
                console.warn('LWOLoader: "Reset" texture wrapping type is not supported in three');
                return THREE.ClampToEdgeWrapping;
            case 1:
                return THREE.RepeatWrapping;
            case 2:
                return THREE.MirroredRepeatWrapping;
            case 3:
                return THREE.ClampToEdgeWrapping;
            }
        },
        getMaterialType(nodeData) {
            if (nodeData.Clearcoat && nodeData.Clearcoat.value > 0)
                return THREE.MeshPhysicalMaterial;
            if (nodeData.Roughness)
                return THREE.MeshStandardMaterial;
            return THREE.MeshPhongMaterial;
        }
    };
    function GeometryParser() {
    }
    GeometryParser.prototype = {
        constructor: GeometryParser,
        parse(geoData, layer) {
            var geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.Float32BufferAttribute(geoData.points, 3));
            var indices = this.splitIndices(geoData.vertexIndices, geoData.polygonDimensions);
            geometry.setIndex(indices);
            this.parseGroups(geometry, geoData);
            geometry.computeVertexNormals();
            this.parseUVs(geometry, layer, indices);
            this.parseMorphTargets(geometry, layer, indices);
            geometry.translate(-layer.pivot[0], -layer.pivot[1], -layer.pivot[2]);
            return geometry;
        },
        splitIndices(indices, polygonDimensions) {
            var remappedIndices = [];
            var i = 0;
            polygonDimensions.forEach(function (dim) {
                if (dim < 4) {
                    for (var k = 0; k < dim; k++)
                        remappedIndices.push(indices[i + k]);
                } else if (dim === 4) {
                    remappedIndices.push(indices[i], indices[i + 1], indices[i + 2], indices[i], indices[i + 2], indices[i + 3]);
                } else if (dim > 4) {
                    for (var k = 1; k < dim - 1; k++) {
                        remappedIndices.push(indices[i], indices[i + k], indices[i + k + 1]);
                    }
                    console.warn('LWOLoader: polygons with greater than 4 sides are not supported');
                }
                i += dim;
            });
            return remappedIndices;
        },
        parseGroups(geometry, geoData) {
            var tags = lwoTree.tags;
            var matNames = [];
            var elemSize = 3;
            if (geoData.type === 'lines')
                elemSize = 2;
            if (geoData.type === 'points')
                elemSize = 1;
            var remappedIndices = this.splitMaterialIndices(geoData.polygonDimensions, geoData.materialIndices);
            var indexNum = 0;
            var indexPairs = {};
            var prevMaterialIndex;
            var prevStart = 0;
            var currentCount = 0;
            for (var i = 0; i < remappedIndices.length; i += 2) {
                var materialIndex = remappedIndices[i + 1];
                if (i === 0)
                    matNames[indexNum] = tags[materialIndex];
                if (prevMaterialIndex === undefined)
                    prevMaterialIndex = materialIndex;
                if (materialIndex !== prevMaterialIndex) {
                    var currentIndex;
                    if (indexPairs[tags[prevMaterialIndex]]) {
                        currentIndex = indexPairs[tags[prevMaterialIndex]];
                    } else {
                        currentIndex = indexNum;
                        indexPairs[tags[prevMaterialIndex]] = indexNum;
                        matNames[indexNum] = tags[prevMaterialIndex];
                        indexNum++;
                    }
                    geometry.addGroup(prevStart, currentCount, currentIndex);
                    prevStart += currentCount;
                    prevMaterialIndex = materialIndex;
                    currentCount = 0;
                }
                currentCount += elemSize;
            }
            if (geometry.groups.length > 0) {
                var currentIndex;
                if (indexPairs[tags[materialIndex]]) {
                    currentIndex = indexPairs[tags[materialIndex]];
                } else {
                    currentIndex = indexNum;
                    indexPairs[tags[materialIndex]] = indexNum;
                    matNames[indexNum] = tags[materialIndex];
                }
                geometry.addGroup(prevStart, currentCount, currentIndex);
            }
            geometry.userData.matNames = matNames;
        },
        splitMaterialIndices(polygonDimensions, indices) {
            var remappedIndices = [];
            polygonDimensions.forEach(function (dim, i) {
                if (dim <= 3) {
                    remappedIndices.push(indices[i * 2], indices[i * 2 + 1]);
                } else if (dim === 4) {
                    remappedIndices.push(indices[i * 2], indices[i * 2 + 1], indices[i * 2], indices[i * 2 + 1]);
                } else {
                    for (var k = 0; k < dim - 2; k++) {
                        remappedIndices.push(indices[i * 2], indices[i * 2 + 1]);
                    }
                }
            });
            return remappedIndices;
        },
        parseUVs(geometry, layer) {
            var remappedUVs = Array.from(Array(geometry.attributes.position.count * 2), function () {
                return 0;
            });
            for (var name in layer.uvs) {
                var uvs = layer.uvs[name].uvs;
                var uvIndices = layer.uvs[name].uvIndices;
                uvIndices.forEach(function (i, j) {
                    remappedUVs[i * 2] = uvs[j * 2];
                    remappedUVs[i * 2 + 1] = uvs[j * 2 + 1];
                });
            }
            geometry.setAttribute('uv', new THREE.Float32BufferAttribute(remappedUVs, 2));
        },
        parseMorphTargets(geometry, layer) {
            var num = 0;
            for (var name in layer.morphTargets) {
                var remappedPoints = geometry.attributes.position.array.slice();
                if (!geometry.morphAttributes.position)
                    geometry.morphAttributes.position = [];
                var morphPoints = layer.morphTargets[name].points;
                var morphIndices = layer.morphTargets[name].indices;
                var type = layer.morphTargets[name].type;
                morphIndices.forEach(function (i, j) {
                    if (type === 'relative') {
                        remappedPoints[i * 3] += morphPoints[j * 3];
                        remappedPoints[i * 3 + 1] += morphPoints[j * 3 + 1];
                        remappedPoints[i * 3 + 2] += morphPoints[j * 3 + 2];
                    } else {
                        remappedPoints[i * 3] = morphPoints[j * 3];
                        remappedPoints[i * 3 + 1] = morphPoints[j * 3 + 1];
                        remappedPoints[i * 3 + 2] = morphPoints[j * 3 + 2];
                    }
                });
                geometry.morphAttributes.position[num] = new THREE.Float32BufferAttribute(remappedPoints, 3);
                geometry.morphAttributes.position[num].name = name;
                num++;
            }
            geometry.morphTargetsRelative = false;
        }
    };
    function extractParentUrl(url, dir) {
        var index = url.indexOf(dir);
        if (index === -1)
            return './';
        return url.substr(0, index);
    }

    return threex.loaders.LWOLoader = LWOLoader;
});