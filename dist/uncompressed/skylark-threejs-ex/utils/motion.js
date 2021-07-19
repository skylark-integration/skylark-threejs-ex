define([
    "../threex"
],function (threex) {
    'use strict';
    const Constants = {
        Handedness: Object.freeze({
            NONE: 'none',
            LEFT: 'left',
            RIGHT: 'right'
        }),
        ComponentState: Object.freeze({
            DEFAULT: 'default',
            TOUCHED: 'touched',
            PRESSED: 'pressed'
        }),
        ComponentProperty: Object.freeze({
            BUTTON: 'button',
            X_AXIS: 'xAxis',
            Y_AXIS: 'yAxis',
            STATE: 'state'
        }),
        ComponentType: Object.freeze({
            TRIGGER: 'trigger',
            SQUEEZE: 'squeeze',
            TOUCHPAD: 'touchpad',
            THUMBSTICK: 'thumbstick',
            BUTTON: 'button'
        }),
        ButtonTouchThreshold: 0.05,
        AxisTouchThreshold: 0.1,
        VisualResponseProperty: Object.freeze({
            TRANSFORM: 'transform',
            VISIBILITY: 'visibility'
        })
    };
    async function fetchJsonFile(path) {
        const response = await fetch(path);
        if (!response.ok) {
            throw new Error(response.statusText);
        } else {
            return response.json();
        }
    }
    async function fetchProfilesList(basePath) {
        if (!basePath) {
            throw new Error('No basePath supplied');
        }
        const profileListFileName = 'profilesList.json';
        const profilesList = await fetchJsonFile(`${ basePath }/${ profileListFileName }`);
        return profilesList;
    }
    async function fetchProfile(xrInputSource, basePath, defaultProfile = null, getAssetPath = true) {
        if (!xrInputSource) {
            throw new Error('No xrInputSource supplied');
        }
        if (!basePath) {
            throw new Error('No basePath supplied');
        }
        const supportedProfilesList = await fetchProfilesList(basePath);
        let match;
        xrInputSource.profiles.some(profileId => {
            const supportedProfile = supportedProfilesList[profileId];
            if (supportedProfile) {
                match = {
                    profileId,
                    profilePath: `${ basePath }/${ supportedProfile.path }`,
                    deprecated: !!supportedProfile.deprecated
                };
            }
            return !!match;
        });
        if (!match) {
            if (!defaultProfile) {
                throw new Error('No matching profile name found');
            }
            const supportedProfile = supportedProfilesList[defaultProfile];
            if (!supportedProfile) {
                throw new Error(`No matching profile name found and default profile "${ defaultProfile }" missing.`);
            }
            match = {
                profileId: defaultProfile,
                profilePath: `${ basePath }/${ supportedProfile.path }`,
                deprecated: !!supportedProfile.deprecated
            };
        }
        const profile = await fetchJsonFile(match.profilePath);
        let assetPath;
        if (getAssetPath) {
            let layout;
            if (xrInputSource.handedness === 'any') {
                layout = profile.layouts[Object.keys(profile.layouts)[0]];
            } else {
                layout = profile.layouts[xrInputSource.handedness];
            }
            if (!layout) {
                throw new Error(`No matching handedness, ${ xrInputSource.handedness }, in profile ${ match.profileId }`);
            }
            if (layout.assetPath) {
                assetPath = match.profilePath.replace('profile.json', layout.assetPath);
            }
        }
        return {
            profile,
            assetPath
        };
    }
    const defaultComponentValues = {
        xAxis: 0,
        yAxis: 0,
        button: 0,
        state: Constants.ComponentState.DEFAULT
    };
    function normalizeAxes(x = 0, y = 0) {
        let xAxis = x;
        let yAxis = y;
        const hypotenuse = Math.sqrt(x * x + y * y);
        if (hypotenuse > 1) {
            const theta = Math.atan2(y, x);
            xAxis = Math.cos(theta);
            yAxis = Math.sin(theta);
        }
        const result = {
            normalizedXAxis: xAxis * 0.5 + 0.5,
            normalizedYAxis: yAxis * 0.5 + 0.5
        };
        return result;
    }
    class VisualResponse {
        constructor(visualResponseDescription) {
            this.componentProperty = visualResponseDescription.componentProperty;
            this.states = visualResponseDescription.states;
            this.valueNodeName = visualResponseDescription.valueNodeName;
            this.valueNodeProperty = visualResponseDescription.valueNodeProperty;
            if (this.valueNodeProperty === Constants.VisualResponseProperty.TRANSFORM) {
                this.minNodeName = visualResponseDescription.minNodeName;
                this.maxNodeName = visualResponseDescription.maxNodeName;
            }
            this.value = 0;
            this.updateFromComponent(defaultComponentValues);
        }
        updateFromComponent({xAxis, yAxis, button, state}) {
            const {normalizedXAxis, normalizedYAxis} = normalizeAxes(xAxis, yAxis);
            switch (this.componentProperty) {
            case Constants.ComponentProperty.X_AXIS:
                this.value = this.states.includes(state) ? normalizedXAxis : 0.5;
                break;
            case Constants.ComponentProperty.Y_AXIS:
                this.value = this.states.includes(state) ? normalizedYAxis : 0.5;
                break;
            case Constants.ComponentProperty.BUTTON:
                this.value = this.states.includes(state) ? button : 0;
                break;
            case Constants.ComponentProperty.STATE:
                if (this.valueNodeProperty === Constants.VisualResponseProperty.VISIBILITY) {
                    this.value = this.states.includes(state);
                } else {
                    this.value = this.states.includes(state) ? 1 : 0;
                }
                break;
            default:
                throw new Error(`Unexpected visualResponse componentProperty ${ this.componentProperty }`);
            }
        }
    }
    class Component {
        constructor(componentId, componentDescription) {
            if (!componentId || !componentDescription || !componentDescription.visualResponses || !componentDescription.gamepadIndices || Object.keys(componentDescription.gamepadIndices).length === 0) {
                throw new Error('Invalid arguments supplied');
            }
            this.id = componentId;
            this.type = componentDescription.type;
            this.rootNodeName = componentDescription.rootNodeName;
            this.touchPointNodeName = componentDescription.touchPointNodeName;
            this.visualResponses = {};
            Object.keys(componentDescription.visualResponses).forEach(responseName => {
                const visualResponse = new VisualResponse(componentDescription.visualResponses[responseName]);
                this.visualResponses[responseName] = visualResponse;
            });
            this.gamepadIndices = Object.assign({}, componentDescription.gamepadIndices);
            this.values = {
                state: Constants.ComponentState.DEFAULT,
                button: this.gamepadIndices.button !== undefined ? 0 : undefined,
                xAxis: this.gamepadIndices.xAxis !== undefined ? 0 : undefined,
                yAxis: this.gamepadIndices.yAxis !== undefined ? 0 : undefined
            };
        }
        get data() {
            const data = {
                id: this.id,
                ...this.values
            };
            return data;
        }
        updateFromGamepad(gamepad) {
            this.values.state = Constants.ComponentState.DEFAULT;
            if (this.gamepadIndices.button !== undefined && gamepad.buttons.length > this.gamepadIndices.button) {
                const gamepadButton = gamepad.buttons[this.gamepadIndices.button];
                this.values.button = gamepadButton.value;
                this.values.button = this.values.button < 0 ? 0 : this.values.button;
                this.values.button = this.values.button > 1 ? 1 : this.values.button;
                if (gamepadButton.pressed || this.values.button === 1) {
                    this.values.state = Constants.ComponentState.PRESSED;
                } else if (gamepadButton.touched || this.values.button > Constants.ButtonTouchThreshold) {
                    this.values.state = Constants.ComponentState.TOUCHED;
                }
            }
            if (this.gamepadIndices.xAxis !== undefined && gamepad.axes.length > this.gamepadIndices.xAxis) {
                this.values.xAxis = gamepad.axes[this.gamepadIndices.xAxis];
                this.values.xAxis = this.values.xAxis < -1 ? -1 : this.values.xAxis;
                this.values.xAxis = this.values.xAxis > 1 ? 1 : this.values.xAxis;
                if (this.values.state === Constants.ComponentState.DEFAULT && Math.abs(this.values.xAxis) > Constants.AxisTouchThreshold) {
                    this.values.state = Constants.ComponentState.TOUCHED;
                }
            }
            if (this.gamepadIndices.yAxis !== undefined && gamepad.axes.length > this.gamepadIndices.yAxis) {
                this.values.yAxis = gamepad.axes[this.gamepadIndices.yAxis];
                this.values.yAxis = this.values.yAxis < -1 ? -1 : this.values.yAxis;
                this.values.yAxis = this.values.yAxis > 1 ? 1 : this.values.yAxis;
                if (this.values.state === Constants.ComponentState.DEFAULT && Math.abs(this.values.yAxis) > Constants.AxisTouchThreshold) {
                    this.values.state = Constants.ComponentState.TOUCHED;
                }
            }
            Object.values(this.visualResponses).forEach(visualResponse => {
                visualResponse.updateFromComponent(this.values);
            });
        }
    }
    class MotionController {
        constructor(xrInputSource, profile, assetUrl) {
            if (!xrInputSource) {
                throw new Error('No xrInputSource supplied');
            }
            if (!profile) {
                throw new Error('No profile supplied');
            }
            this.xrInputSource = xrInputSource;
            this.assetUrl = assetUrl;
            this.id = profile.profileId;
            this.layoutDescription = profile.layouts[xrInputSource.handedness];
            this.components = {};
            Object.keys(this.layoutDescription.components).forEach(componentId => {
                const componentDescription = this.layoutDescription.components[componentId];
                this.components[componentId] = new Component(componentId, componentDescription);
            });
            this.updateFromGamepad();
        }
        get gripSpace() {
            return this.xrInputSource.gripSpace;
        }
        get targetRaySpace() {
            return this.xrInputSource.targetRaySpace;
        }
        get data() {
            const data = [];
            Object.values(this.components).forEach(component => {
                data.push(component.data);
            });
            return data;
        }
        updateFromGamepad() {
            Object.values(this.components).forEach(component => {
                component.updateFromGamepad(this.xrInputSource.gamepad);
            });
        }
    }
    return threex.utils.motion ={
        Constants,
        MotionController,
        fetchProfile,
        fetchProfilesList
    };
});