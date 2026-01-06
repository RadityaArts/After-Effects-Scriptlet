/**
 * @name Auto-Fit_Precomp
 * @version 1.0
 * ================================
 * A streamlined scriptlet for After Effects that automatically precomposes selected layers with bounding box fitting.
 * 
 * Usage: Select layer(s) and run the script
 * 
 * @author ©RadityaArts
 */

(function autoFitPrecompScriptlet() {
    // =============================================================================
    // CONFIGURATION
    // =============================================================================
    
    var CONFIG = {
        MOVE_ANIMATION: true,      // Transfer keyframes to precomp layer
        MOVE_EXPRESSIONS: true,    // Transfer expressions to precomp layer
        CROP_MODE: true,           // Crop precomp to content bounds
        SCRIPT_NAME: "Auto-Fit Precomp"
    };

    // =============================================================================
    // VALIDATION
    // =============================================================================
    
    function validateSelection() {
        var comp = app.project.activeItem;
        
        if (!comp || !(comp instanceof CompItem)) {
            alert("Please select a composition first.", CONFIG.SCRIPT_NAME);
            return null;
        }
        
        var layers = comp.selectedLayers;
        
        if (!layers || layers.length === 0) {
            alert("Please select at least one layer.", CONFIG.SCRIPT_NAME);
            return null;
        }
        
        // Filter out invalid layers (nulls, lights, cameras)
        var validLayers = [];
        for (var i = 0; i < layers.length; i++) {
            var layer = layers[i];
            if (!layer.nullLayer && 
                !(layer instanceof LightLayer) && 
                !(layer instanceof CameraLayer)) {
                validLayers.push(layer);
            }
        }
        
        if (validLayers.length === 0) {
            alert("No valid layers selected.\nNull, Light, and Camera layers cannot be precomposed.", CONFIG.SCRIPT_NAME);
            return null;
        }
        
        return {
            comp: comp,
            layers: validLayers
        };
    }

    // =============================================================================
    // USER INTERFACE
    // =============================================================================
    
    function showNameDialog(defaultName, isGroup) {
        var title = isGroup ? "Group Precomp Name" : "Precomp Name";
        var prompt = isGroup ? "Enter name for group precomp:" : "Enter name for precomp:";
        var hint = "(Leave blank to use layer name)";
        
        var dialog = new Window("dialog", title);
        dialog.orientation = "column";
        dialog.alignChildren = ["fill", "top"];
        dialog.spacing = 10;
        dialog.margins = 16;
        
        // Prompt text
        var promptText = dialog.add("statictext", undefined, prompt);
        promptText.alignment = ["left", "center"];
        
        // Name input
        var nameInput = dialog.add("edittext", undefined, defaultName);
        nameInput.characters = 35;
        nameInput.active = true;
        
        // Hint text
        var hintText = dialog.add("statictext", undefined, hint);
        hintText.alignment = ["left", "center"];
        try {
            hintText.graphics.foregroundColor = hintText.graphics.newPen(
                hintText.graphics.PenType.SOLID_COLOR, [0.5, 0.5, 0.5, 1], 1
            );
        } catch (e) {}
        
        // Buttons
        var buttonGroup = dialog.add("group");
        buttonGroup.orientation = "row";
        buttonGroup.alignment = ["center", "center"];
        buttonGroup.spacing = 10;
        
        var okBtn = buttonGroup.add("button", undefined, "OK", {name: "ok"});
        var cancelBtn = buttonGroup.add("button", undefined, "Cancel", {name: "cancel"});
        
        okBtn.preferredSize = [80, 26];
        cancelBtn.preferredSize = [80, 26];
        
        var result = {confirmed: false, name: ""};
        
        okBtn.onClick = function() {
            result.confirmed = true;
            result.name = nameInput.text;
            dialog.close();
        };
        
        cancelBtn.onClick = function() {
            result.confirmed = false;
            dialog.close();
        };
        
        // Enter key submits
        nameInput.onEnterKey = function() {
            okBtn.notify();
        };
        
        dialog.center();
        dialog.show();
        
        return result;
    }

    // =============================================================================
    // UTILITY FUNCTIONS
    // =============================================================================
    
    var Utils = {
        /**
         * Safely set property value, handling keyframes
         */
        safeSetValue: function(property, value) {
            if (property.numKeys > 0) {
                try {
                    var time = property.containingComp ? property.containingComp.time : 0;
                    property.setValueAtTime(time, value);
                } catch (e) {
                    try {
                        property.setValueAtTime(0, value);
                    } catch (e2) {
                        while (property.numKeys > 0) {
                            property.removeKey(1);
                        }
                        property.setValue(value);
                    }
                }
            } else {
                property.setValue(value);
            }
        },
        
        /**
         * Trim whitespace from string (ExtendScript compatible)
         */
        trim: function(str) {
            if (typeof str !== 'string') return str;
            return str.replace(/^\s+|\s+$/g, "");
        },
        
        /**
         * Check if layer has active masks
         */
        hasActiveMasks: function(layer) {
            if (!layer || !layer.mask) return false;
            for (var i = 1; i <= layer.mask.numProperties; i++) {
                var mask = layer.mask.property(i);
                if (mask && mask.maskMode !== MaskMode.NONE && mask.maskMode !== MaskMode.DISABLED) {
                    return true;
                }
            }
            return false;
        },
        
        /**
         * Get mask bounds at time
         */
        getMaskBounds: function(layer, time) {
            if (!layer || !layer.mask) return null;
            
            var minLeft = Infinity, maxRight = -Infinity;
            var minTop = Infinity, maxBottom = -Infinity;
            var hasMasks = false;
            
            for (var i = 1; i <= layer.mask.numProperties; i++) {
                var mask = layer.mask.property(i);
                if (mask && mask.maskMode !== MaskMode.NONE && mask.maskMode !== MaskMode.DISABLED) {
                    hasMasks = true;
                    var maskShape = mask.maskShape.valueAtTime(time, false);
                    var vertices = maskShape.vertices;
                    
                    for (var j = 0; j < vertices.length; j++) {
                        var v = vertices[j];
                        if (v[0] < minLeft) minLeft = v[0];
                        if (v[0] > maxRight) maxRight = v[0];
                        if (v[1] < minTop) minTop = v[1];
                        if (v[1] > maxBottom) maxBottom = v[1];
                    }
                }
            }
            
            return hasMasks ? {
                left: minLeft,
                top: minTop,
                width: maxRight - minLeft,
                height: maxBottom - minTop
            } : null;
        },
        
        /**
         * Get layer bounds (considers masks if active)
         */
        getLayerBounds: function(layer, time) {
            if (this.hasActiveMasks(layer)) {
                var maskBounds = this.getMaskBounds(layer, time);
                if (maskBounds) return maskBounds;
            }
            var sr = layer.sourceRectAtTime(time, false);
            return {
                left: sr.left,
                top: sr.top,
                width: sr.width,
                height: sr.height
            };
        },
        
        /**
         * Find stroke size in layer
         */
        findStrokeSize: function(propGroup, wdArr) {
            wdArr = wdArr || [];
            var propNum = propGroup.numProperties;
            
            for (var i = 1; i <= propNum; i++) {
                var curProp = propGroup.property(i);
                if (curProp.propertyType === PropertyType.PROPERTY) {
                    var parent = curProp.parentProperty;
                    if ((parent.matchName === "ADBE Vector Graphic - Stroke" || 
                         parent.matchName === "ADBE Vector Graphic - G-Stroke") && 
                        parent.enabled) {
                        if (curProp.matchName === "ADBE Vector Stroke Width") {
                            wdArr.push(curProp.value);
                        }
                    }
                } else if (curProp.propertyType === PropertyType.INDEXED_GROUP || 
                           curProp.propertyType === PropertyType.NAMED_GROUP) {
                    this.findStrokeSize(curProp, wdArr);
                }
            }
            
            var maxWD = 0;
            for (var i = 0; i < wdArr.length; i++) {
                if (wdArr[i] > maxWD) maxWD = wdArr[i];
            }
            return maxWD;
        },
        
        /**
         * Find effects that expand the bounding box
         * Checks for blur, glow, shadow, stroke and other effects
         */
        findEffectsBounds: function(layer) {
            var maxExpansion = 0;
            if (!layer.Effects || layer.Effects.numProperties === 0) return 0;
            
            for (var i = 1; i <= layer.Effects.numProperties; i++) {
                try {
                    var eff = layer.Effects(i);
                    if (!eff.enabled) continue;
                    
                    var expansion = 0;
                    var matchName = eff.matchName;
                    
                    // Fast Box Blur
                    if (matchName === "ADBE Box Blur2") {
                        expansion = eff(1).value * 5; // Blur Radius * 5
                    }
                    // Gaussian Blur
                    else if (matchName === "ADBE Gaussian Blur 2") {
                        expansion = eff(1).value * 6; // Blurriness * 6
                    }
                    // Channel Blur
                    else if (matchName === "ADBE Channel Blur") {
                        var redBlur = eff(1).value || 0;
                        var greenBlur = eff(2).value || 0;
                        var blueBlur = eff(3).value || 0;
                        var alphaBlur = eff(4).value || 0;
                        expansion = Math.max(redBlur, greenBlur, blueBlur, alphaBlur) * 5;
                    }
                    // Bilateral Blur
                    else if (matchName === "ADBE Bilateral Blur") {
                        expansion = eff(1).value * 5; // Radius * 5
                    }
                    // Directional Blur
                    else if (matchName === "ADBE Motion Blur") {
                        expansion = eff(2).value * 2; // Blur Length * 2
                    }
                    // Radial Blur
                    else if (matchName === "ADBE Radial Blur") {
                        expansion = eff(1).value * 3; // Amount * 3
                    }
                    // Glow
                    else if (matchName === "ADBE Glo2") {
                        var glowRadius = eff(2).value || 0; // Glow Radius
                        var glowIntensity = eff(3).value || 0; // Glow Intensity
                        expansion = glowRadius * (glowIntensity / 100) * 2;
                    }
                    // Drop Shadow
                    else if (matchName === "ADBE Drop Shadow") {
                        var shadowDistance = eff(2).value || 0; // Distance
                        var shadowSoftness = eff(3).value || 0; // Softness
                        expansion = Math.max(shadowDistance, shadowSoftness) * 2;
                    }
                    // Bevel Alpha
                    else if (matchName === "ADBE Bevel Alpha") {
                        expansion = (eff(1).value || 0) * 2; // Edge Thickness * 2
                    }
                    // Stroke Effect (not shape layer stroke)
                    else if (matchName === "ADBE Stroke") {
                        var strokeWidth = eff(2).value || 0; // Brush Size
                        var paintStyle = eff(3).value || 1; // Paint Style
                        if (paintStyle === 1 || paintStyle === 3) { // On Transparent or Reveal Original
                            expansion = strokeWidth;
                        }
                    }
                    // Simple Choker (can expand or contract)
                    else if (matchName === "ADBE Simple Choker") {
                        var chokeVal = eff(1).value || 0;
                        if (chokeVal < 0) { // Negative choke expands
                            expansion = Math.abs(chokeVal) * 2;
                        }
                    }
                    // Roughen Edges
                    else if (matchName === "ADBE Roughen Edges") {
                        var border = eff(1).value || 0;
                        var edgeSharp = eff(4).value || 0;
                        expansion = border + edgeSharp;
                    }
                    // CC Radial Blur
                    else if (matchName === "CC Radial Blur") {
                        expansion = (eff(1).value || 0) * 2; // Amount * 2
                    }
                    // CC Vector Blur
                    else if (matchName === "CC Vector Blur") {
                        expansion = (eff(1).value || 0) * 3; // Amount * 3
                    }
                    // Minimax (can expand)
                    else if (matchName === "ADBE Minimax") {
                        var radius = eff(1).value || 0;
                        var operation = eff(2).value || 1;
                        if (operation === 1 || operation === 2) { // Maximum or Minimum
                            expansion = radius * 2;
                        }
                    }
                    
                    if (expansion > maxExpansion) {
                        maxExpansion = expansion;
                    }
                } catch (e) {
                    // Skip effect if error occurs
                }
            }
            return maxExpansion;
        },
        
        /**
         * Get layer size including effects
         */
        getLayerSize: function(layer, time) {
            var bounds = this.getLayerBounds(layer, time);
            var strokeSize = this.findStrokeSize(layer, []);
            var effectsExpansion = this.findEffectsBounds(layer);
            var scale = layer.scale.value;
            
            var width = (bounds.width / (100 / scale[0])) + strokeSize + effectsExpansion;
            var height = (bounds.height / (100 / scale[1])) + strokeSize + effectsExpansion;
            
            return [width, height];
        },
        
        /**
         * Calculate bounding box with rotation
         */
        getBoundingBox: function(layer, wh) {
            var parent = layer.parent;
            layer.parent = null;
            
            var rotation = Math.abs(layer.rotation.value) * (Math.PI / 180);
            var center = [wh[0] / 2, wh[1] / 2];
            
            var newW = ((wh[0] - center[0]) * Math.cos(rotation)) + ((wh[1] - center[1]) * Math.sin(rotation));
            var newH = ((wh[1] - center[1]) * Math.cos(rotation)) + ((wh[0] - center[0]) * Math.sin(rotation));
            
            layer.parent = parent;
            return [Math.round(newW * 2), Math.round(newH * 2)];
        },
        
        /**
         * Find center offset for layer
         */
        findCenterOffset: function(layer, time) {
            if (!layer) return [0, 0];
            
            var parent = layer.parent;
            layer.parent = null;
            
            var bounds = this.getLayerBounds(layer, time);
            var anchor = layer.anchorPoint.valueAtTime(time, false);
            var reposAnc = [
                anchor[0] - (bounds.left + bounds.width / 2),
                anchor[1] - (bounds.top + bounds.height / 2)
            ];
            
            layer.parent = parent;
            return reposAnc;
        },
        
        /**
         * Find all keyframe times in layer
         */
        findKeyTimes: function(propGroup, keyTimeArray) {
            keyTimeArray = keyTimeArray || [0];
            
            for (var i = 1; i <= propGroup.numProperties; i++) {
                var curProp = propGroup.property(i);
                if (curProp.propertyType === PropertyType.PROPERTY) {
                    if (!curProp.isTimeVarying || curProp.propertyValueType === 6412) continue;
                    
                    for (var j = 1; j <= curProp.numKeys; j++) {
                        var keyTime = curProp.keyTime(j);
                        var exists = false;
                        for (var k = 0; k < keyTimeArray.length; k++) {
                            if (keyTimeArray[k] === keyTime) {
                                exists = true;
                                break;
                            }
                        }
                        if (!exists) keyTimeArray.push(keyTime);
                    }
                } else if (curProp.propertyType === PropertyType.INDEXED_GROUP || 
                           curProp.propertyType === PropertyType.NAMED_GROUP) {
                    this.findKeyTimes(curProp, keyTimeArray);
                }
            }
            return keyTimeArray;
        },
        
        /**
         * Copy keyframe with all properties
         */
        copyKeyframe: function(oldProp, newProp, keyIndex, timeOffset) {
            var inInterp = oldProp.keyInInterpolationType(keyIndex);
            var outInterp = oldProp.keyOutInterpolationType(keyIndex);
            var value = oldProp.keyValue(keyIndex);
            
            var tempAutoBezier, tempContBezier, inTempEase, outTempEase;
            var spatAutoBezier, spatContBezier, inSpatTangent, outSpatTangent, roving;
            
            if (inInterp === KeyframeInterpolationType.BEZIER && 
                outInterp === KeyframeInterpolationType.BEZIER) {
                tempAutoBezier = oldProp.keyTemporalAutoBezier(keyIndex);
                tempContBezier = oldProp.keyTemporalContinuous(keyIndex);
            }
            
            if (outInterp !== KeyframeInterpolationType.HOLD) {
                inTempEase = oldProp.keyInTemporalEase(keyIndex);
                outTempEase = oldProp.keyOutTemporalEase(keyIndex);
            }
            
            if (oldProp.propertyValueType === PropertyValueType.TwoD_SPATIAL || 
                oldProp.propertyValueType === PropertyValueType.ThreeD_SPATIAL) {
                spatAutoBezier = oldProp.keySpatialAutoBezier(keyIndex);
                spatContBezier = oldProp.keySpatialContinuous(keyIndex);
                inSpatTangent = oldProp.keyInSpatialTangent(keyIndex);
                outSpatTangent = oldProp.keyOutSpatialTangent(keyIndex);
                roving = oldProp.keyRoving(keyIndex);
            }
            
            var newTime = oldProp.keyTime(keyIndex) - timeOffset;
            var newKeyIndex = newProp.addKey(newTime);
            newProp.setValueAtKey(newKeyIndex, value);
            
            if (outInterp !== KeyframeInterpolationType.HOLD) {
                newProp.setTemporalEaseAtKey(newKeyIndex, inTempEase, outTempEase);
            }
            newProp.setInterpolationTypeAtKey(newKeyIndex, inInterp, outInterp);
            
            if (inInterp === KeyframeInterpolationType.BEZIER && 
                outInterp === KeyframeInterpolationType.BEZIER && tempContBezier) {
                newProp.setTemporalContinuousAtKey(newKeyIndex, tempContBezier);
                newProp.setTemporalAutoBezierAtKey(newKeyIndex, tempAutoBezier);
            }
            
            if (newProp.propertyValueType === PropertyValueType.TwoD_SPATIAL || 
                newProp.propertyValueType === PropertyValueType.ThreeD_SPATIAL) {
                newProp.setSpatialContinuousAtKey(newKeyIndex, spatContBezier);
                newProp.setSpatialAutoBezierAtKey(newKeyIndex, spatAutoBezier);
                newProp.setSpatialTangentsAtKey(newKeyIndex, inSpatTangent, outSpatTangent);
                newProp.setRovingAtKey(newKeyIndex, roving);
            }
        },
        
        /**
         * Fix expressions referencing thisComp
         */
        fixExpressions: function(propGroup, comp, inputText, outputText) {
            for (var i = 1; i <= propGroup.numProperties; i++) {
                var curProp = propGroup.property(i);
                if (curProp.propertyType === PropertyType.PROPERTY && curProp.expressionEnabled) {
                    var expr = curProp.expression;
                    while (expr.indexOf(inputText) > -1) {
                        expr = expr.replace(inputText, outputText);
                    }
                    curProp.expression = expr;
                } else if (curProp.propertyType === PropertyType.INDEXED_GROUP || 
                           curProp.propertyType === PropertyType.NAMED_GROUP) {
                    this.fixExpressions(curProp, comp, inputText, outputText);
                }
            }
        }
    };

    // =============================================================================
    // PRECOMP CORE FUNCTIONS
    // =============================================================================
    
    var PrecompCore = {
        tempNullSolids: [],
        
        /**
         * Transfer animation and expressions from old layer to new comp layer
         */
        transferAnimationAndExpressions: function(newCompLayer, oldLayer, layerInPoint) {
            for (var i = 1; i <= oldLayer.transform.numProperties; i++) {
                var oldProp = oldLayer.transform(i);
                var newProp = newCompLayer.transform(i);
                
                // Transfer expressions
                if (CONFIG.MOVE_EXPRESSIONS && oldProp.expressionEnabled) {
                    newProp.expression = oldProp.expression;
                    oldProp.expression = "";
                }
                
                // Transfer keyframes
                if (oldProp.numKeys > 0 && CONFIG.MOVE_ANIMATION) {
                    for (var k = 1; k <= oldProp.numKeys; k++) {
                        if (newProp.matchName === "ADBE Position" && oldLayer.position.dimensionsSeparated) {
                            if (k <= oldLayer.transform.xPosition.numKeys) {
                                Utils.copyKeyframe(oldLayer.transform.xPosition, newCompLayer.transform.xPosition, k, layerInPoint);
                            }
                            if (k <= oldLayer.transform.yPosition.numKeys) {
                                Utils.copyKeyframe(oldLayer.transform.yPosition, newCompLayer.transform.yPosition, k, layerInPoint);
                            }
                            if (oldLayer.threeDLayer && k <= oldLayer.transform.zPosition.numKeys) {
                                Utils.copyKeyframe(oldLayer.transform.zPosition, newCompLayer.transform.zPosition, k, layerInPoint);
                            }
                        } else {
                            Utils.copyKeyframe(oldProp, newProp, k, layerInPoint);
                        }
                    }
                    
                    // Remove old keyframes
                    for (var k = oldProp.numKeys; k > 0; k--) {
                        oldProp.removeKey(k);
                    }
                }
            }
        },
        
        /**
         * Crop composition to content bounds (single layer)
         */
        cropSingleLayer: function(newCompLayer, oldLayer, layerScale, comp) {
            var compSize = [comp.width, comp.height];
            
            // Create temporary null layers
            var null2D = comp.layers.addNull();
            var null3D = comp.layers.addNull();
            null3D.threeDLayer = true;
            
            if (null2D.source) this.tempNullSolids.push(null2D.source);
            if (null3D.source) this.tempNullSolids.push(null3D.source);
            
            oldLayer.parent = null;
            
            var position = oldLayer.position.value;
            var anchor = oldLayer.anchorPoint.value;
            
            // Get rotation properties
            var layerRotation, newCompRotation;
            if (!oldLayer.threeDLayer) {
                layerRotation = [[oldLayer.rotation, oldLayer.rotation.value]];
                newCompRotation = [newCompLayer.rotation];
            } else {
                layerRotation = [
                    [oldLayer.orientation, oldLayer.orientation.value],
                    [oldLayer.xRotation, oldLayer.xRotation.value],
                    [oldLayer.yRotation, oldLayer.yRotation.value],
                    [oldLayer.zRotation, oldLayer.zRotation.value]
                ];
                newCompRotation = [
                    newCompLayer.orientation,
                    newCompLayer.xRotation,
                    newCompLayer.yRotation,
                    newCompLayer.zRotation
                ];
            }
            
            var bounds = Utils.getLayerBounds(oldLayer, 0);
            
            Utils.safeSetValue(oldLayer.scale, [100, 100]);
            Utils.safeSetValue(oldLayer.opacity, 100);
            
            oldLayer.parent = oldLayer.threeDLayer ? null3D : null2D;
            
            var anchorCompOffset;
            if (oldLayer.threeDLayer && !oldLayer.position.dimensionsSeparated) {
                anchorCompOffset = [
                    (compSize[0] / 2) - position[0],
                    (compSize[1] / 2) - position[1],
                    0 - position[2]
                ];
            } else {
                anchorCompOffset = [
                    (compSize[0] / 2) - position[0],
                    (compSize[1] / 2) - position[1]
                ];
            }
            
            var reposAnc = [
                bounds.left + bounds.width / 2,
                bounds.top + bounds.height / 2
            ];
            
            var layerSize = Utils.getLayerSize(oldLayer, 0);
            var layerWidth = layerSize[0] || 1;
            var layerHeight = layerSize[1] || 1;
            
            // Resize composition
            comp.width = Math.round(layerWidth);
            comp.height = Math.round(layerHeight);
            
            Utils.safeSetValue(oldLayer.anchorPoint, reposAnc);
            
            if (!oldLayer.position.dimensionsSeparated) {
                if (oldLayer.threeDLayer) {
                    Utils.safeSetValue(oldLayer.position, [0, 0, 0]);
                } else {
                    Utils.safeSetValue(oldLayer.position, [0, 0]);
                }
            } else {
                Utils.safeSetValue(oldLayer.transform.xPosition, 0);
                Utils.safeSetValue(oldLayer.transform.yPosition, 0);
                if (oldLayer.threeDLayer) {
                    Utils.safeSetValue(oldLayer.transform.zPosition, 0);
                }
            }
            
            var offset = [anchor[0] - reposAnc[0], anchor[1] - reposAnc[1]];
            
            if (newCompLayer.anchorPoint.numKeys === 0) {
                newCompLayer.anchorPoint.setValue(newCompLayer.anchorPoint.value);
            }
            
            Utils.safeSetValue(null2D.position, [comp.width / 2, comp.height / 2]);
            null2D.remove();
            null3D.remove();
            
            // Update position
            if (!oldLayer.position.dimensionsSeparated) {
                if (newCompLayer.position.numKeys === 0) {
                    if (oldLayer.threeDLayer) {
                        newCompLayer.position.setValue([
                            newCompLayer.position.value[0] - anchorCompOffset[0],
                            newCompLayer.position.value[1] - anchorCompOffset[1],
                            newCompLayer.position.value[2] - anchorCompOffset[2]
                        ]);
                    } else {
                        newCompLayer.position.setValue([
                            newCompLayer.position.value[0] - anchorCompOffset[0],
                            newCompLayer.position.value[1] - anchorCompOffset[1]
                        ]);
                    }
                }
            } else {
                if (newCompLayer.transform.xPosition.numKeys === 0) {
                    newCompLayer.transform.xPosition.setValue(
                        newCompLayer.transform.xPosition.value - anchorCompOffset[0]
                    );
                }
                if (newCompLayer.transform.yPosition.numKeys === 0) {
                    newCompLayer.transform.yPosition.setValue(
                        newCompLayer.transform.yPosition.value - anchorCompOffset[1]
                    );
                }
            }
            
            // Transfer rotation
            for (var r = 0; r < layerRotation.length; r++) {
                var dimVal = layerRotation[r][1].length === 3 ? [0, 0, 0] : 0;
                Utils.safeSetValue(layerRotation[r][0], dimVal);
                if (newCompRotation[r].numKeys === 0) {
                    Utils.safeSetValue(newCompRotation[r], layerRotation[r][1]);
                }
            }
            
            // Update anchor point
            if (newCompLayer.anchorPoint.numKeys === 0) {
                Utils.safeSetValue(newCompLayer.anchorPoint, [
                    newCompLayer.anchorPoint.value[0] + offset[0],
                    newCompLayer.anchorPoint.value[1] + offset[1]
                ]);
            }
        },
        
        /**
         * Crop multi-layer composition
         */
        cropMultiLayer: function(comp, compLayer) {
            var compSize = [comp.width, comp.height];
            var minL = comp.width, maxR = 0;
            var minT = comp.height, maxB = 0;
            
            // Find bounds across all keyframes
            for (var layerIdx = 1; layerIdx <= comp.numLayers; layerIdx++) {
                var layer = comp.layer(layerIdx);
                var parent = layer.parent;
                layer.parent = null;
                
                var keyTimes = Utils.findKeyTimes(layer, [0]);
                
                for (var t = 0; t < keyTimes.length; t++) {
                    var time = keyTimes[t];
                    comp.time = time;
                    
                    var layerWH = Utils.getLayerSize(layer, time);
                    var position = layer.position.value;
                    var anchor = layer.anchorPoint.value;
                    var bounds = Utils.getLayerBounds(layer, time);
                    var bb = Utils.getBoundingBox(layer, layerWH);
                    
                    var reposPos = [
                        (position[0] - (anchor[0] - bounds.left)) + bounds.width / 2,
                        (position[1] - (anchor[1] - bounds.top)) + bounds.height / 2
                    ];
                    
                    var check = [
                        [reposPos[0] - bb[0] / 2, reposPos[1] - bb[1] / 2],
                        [reposPos[0] + bb[0] / 2, reposPos[1] + bb[1] / 2]
                    ];
                    
                    if (check[0][0] < minL) minL = check[0][0];
                    if (check[1][0] > maxR) maxR = check[1][0];
                    if (check[0][1] < minT) minT = check[0][1];
                    if (check[1][1] > maxB) maxB = check[1][1];
                }
                
                layer.parent = parent;
            }
            
            // Create temp nulls
            var null2D = comp.layers.addNull();
            var null3D = comp.layers.addNull();
            null3D.threeDLayer = true;
            
            if (null2D.source) this.tempNullSolids.push(null2D.source);
            if (null3D.source) this.tempNullSolids.push(null3D.source);
            
            Utils.safeSetValue(null2D.position, [(minL + maxR) / 2, (minT + maxB) / 2]);
            Utils.safeSetValue(null3D.position, [(minL + maxR) / 2, (minT + maxB) / 2]);
            
            // Parent all layers to nulls
            for (var layerIdx = 3; layerIdx <= comp.numLayers; layerIdx++) {
                var layer = comp.layer(layerIdx);
                if (layer.parent === null) {
                    layer.parent = layer.threeDLayer ? null3D : null2D;
                }
            }
            
            // Resize composition
            comp.width = Math.round(maxR - minL) || 1;
            comp.height = Math.round(maxB - minT) || 1;
            
            Utils.safeSetValue(null2D.position, [comp.width / 2, comp.height / 2]);
            Utils.safeSetValue(null3D.position, [compSize[0] / 2, compSize[1] / 2]);
            
            null2D.remove();
            null3D.remove();
            
            // Update compLayer anchor
            var offset = Utils.findCenterOffset(compLayer, 0);
            var nullOffset = [
                (compSize[0] / 2) - ((minL + maxR) / 2),
                (compSize[1] / 2) - ((minT + maxB) / 2)
            ];
            
            if (compLayer.anchorPoint.numKeys > 0) {
                for (var k = 1; k <= compLayer.anchorPoint.numKeys; k++) {
                    compLayer.anchorPoint.setValueAtKey(k, [
                        compLayer.anchorPoint.keyValue(k)[0] + nullOffset[0] + offset[0],
                        compLayer.anchorPoint.keyValue(k)[1] + nullOffset[1] + offset[1]
                    ]);
                }
            } else {
                Utils.safeSetValue(compLayer.anchorPoint, [
                    compLayer.anchorPoint.value[0] + nullOffset[0] + offset[0],
                    compLayer.anchorPoint.value[1] + nullOffset[1] + offset[1]
                ]);
            }
        },
        
        /**
         * Clean up temporary null solids
         */
        cleanupTempSolids: function() {
            for (var i = 0; i < this.tempNullSolids.length; i++) {
                var solid = this.tempNullSolids[i];
                if (solid && solid.remove) {
                    var isUsed = false;
                    
                    for (var j = 1; j <= app.project.numItems; j++) {
                        var item = app.project.item(j);
                        if (item instanceof CompItem) {
                            for (var k = 1; k <= item.numLayers; k++) {
                                try {
                                    if (item.layer(k).source === solid) {
                                        isUsed = true;
                                        break;
                                    }
                                } catch (e) {}
                            }
                        }
                        if (isUsed) break;
                    }
                    
                    if (!isUsed) {
                        try { solid.remove(); } catch (e) {}
                    }
                }
            }
            this.tempNullSolids = [];
        }
    };

    // =============================================================================
    // MAIN PRECOMP FUNCTIONS
    // =============================================================================
    
    /**
     * Precompose single layer with auto-fit
     */
    function precompSingleLayer(comp, layer, precompName) {
        var saveTime = comp.time;
        
        // Store parent relationships
        var parentArr = [];
        var layerIndex = layer.index;
        
        for (var i = 1; i <= comp.numLayers; i++) {
            var checkLayer = comp.layer(i);
            if (checkLayer.parent && checkLayer.parent.index === layerIndex) {
                parentArr.push(checkLayer.index);
                checkLayer.parent = null;
            }
        }
        
        var layerParent = layer.parent;
        layer.parent = null;
        
        var layerScale = layer.scale.value;
        var layerInPoint = layer.inPoint;
        var layerOutPoint = layer.outPoint;
        var isPrecomp = layer.source instanceof CompItem;
        
        var newComp, oldLayer;
        
        if (isPrecomp) {
            // Already a precomp - just crop it
            newComp = layer.source;
            if (newComp.numLayers === 0) return null;
            
            if (newComp.numLayers > 1) {
                if (CONFIG.CROP_MODE) {
                    PrecompCore.cropMultiLayer(newComp, layer);
                }
                // Restore parent relationships
                for (var p = 0; p < parentArr.length; p++) {
                    comp.layer(parentArr[p]).parent = layer;
                }
                return layer;
            }
            oldLayer = newComp.layer(1);
        } else {
            // Create new precomp
            newComp = comp.layers.precompose([layerIndex], precompName, true);
            newComp.workAreaStart = 0;
            oldLayer = newComp.layer(1);
        }
        
        var newCompLayer = comp.layer(layerIndex);
        var lockState = oldLayer.locked;
        if (lockState) oldLayer.locked = false;
        
        // Match 3D and dimension settings
        if (oldLayer.threeDLayer) {
            newCompLayer.threeDLayer = true;
        }
        if (oldLayer.position.dimensionsSeparated) {
            newCompLayer.position.dimensionsSeparated = true;
        }
        
        // Transfer animation and expressions
        PrecompCore.transferAnimationAndExpressions(newCompLayer, oldLayer, layerInPoint);
        
        // Crop if enabled
        if (CONFIG.CROP_MODE) {
            PrecompCore.cropSingleLayer(newCompLayer, oldLayer, layerScale, newComp);
        }
        
        // Finalize
        oldLayer.startTime -= layerInPoint;
        oldLayer.locked = lockState;
        newComp.duration = layerOutPoint - layerInPoint;
        newCompLayer.startTime = layerInPoint;
        newCompLayer.parent = layerParent;
        
        // Restore parent relationships
        for (var p = 0; p < parentArr.length; p++) {
            comp.layer(parentArr[p]).parent = newCompLayer;
        }
        
        // Fix expressions
        if (newComp.layer(1)) {
            Utils.fixExpressions(newComp.layer(1), newComp, "thisComp", "comp(\"" + comp.name + "\")");
        }
        
        comp.time = saveTime;
        return newCompLayer;
    }
    
    /**
     * Precompose multiple layers as a group
     */
    function precompGroupLayers(comp, layers, precompName) {
        var saveTime = comp.time;
        
        // Collect layer info
        var commonParent = layers[0].parent;
        var hasCommonParent = true;
        var hasThreeDLayers = false;
        var hasDimensionsSeparated = false;
        
        for (var i = 0; i < layers.length; i++) {
            if (layers[i].parent !== commonParent) hasCommonParent = false;
            if (layers[i].threeDLayer) hasThreeDLayers = true;
            if (layers[i].position.dimensionsSeparated) hasDimensionsSeparated = true;
        }
        
        // Collect indices
        var layerIndices = [];
        for (var i = 0; i < layers.length; i++) {
            layerIndices.push(layers[i].index);
        }
        
        // Create group precomp
        var newComp = comp.layers.precompose(layerIndices, precompName, true);
        newComp.workAreaStart = 0;
        
        // Find and configure the new layer
        var newCompLayer = null;
        for (var i = 1; i <= comp.numLayers; i++) {
            var layer = comp.layer(i);
            if (layer.source === newComp) {
                newCompLayer = layer;
                break;
            }
        }
        
        if (!newCompLayer) {
            alert("Error: Could not find group precomp layer.", CONFIG.SCRIPT_NAME);
            return null;
        }
        
        if (hasThreeDLayers) newCompLayer.threeDLayer = true;
        if (hasDimensionsSeparated) newCompLayer.position.dimensionsSeparated = true;
        
        // Crop the group precomp
        if (CONFIG.CROP_MODE) {
            PrecompCore.cropMultiLayer(newComp, newCompLayer);
        }
        
        // Restore common parent
        if (hasCommonParent && commonParent) {
            newCompLayer.parent = commonParent;
        }
        
        comp.time = saveTime;
        return newCompLayer;
    }

    // =============================================================================
    // MAIN EXECUTION
    // =============================================================================
    
    function main() {
        // Validate selection
        var selection = validateSelection();
        if (!selection) return;
        
        var comp = selection.comp;
        var layers = selection.layers;
        var isSingleLayer = layers.length === 1;
        
        // Get default name
        var defaultName = isSingleLayer ? layers[0].name : "Group_" + layers[0].name;
        
        // Show name dialog
        var nameResult = showNameDialog("", !isSingleLayer);
        if (!nameResult.confirmed) return;
        
        // Determine final name
        var finalName = Utils.trim(nameResult.name);
        if (!finalName || finalName === "") {
            finalName = defaultName;
        }
        
        // Execute precomp
        app.beginUndoGroup(CONFIG.SCRIPT_NAME);
        
        try {
            PrecompCore.tempNullSolids = [];
            
            var resultLayer;
            if (isSingleLayer) {
                resultLayer = precompSingleLayer(comp, layers[0], finalName);
            } else {
                resultLayer = precompGroupLayers(comp, layers, finalName);
            }
            
            // Select result
            if (resultLayer) {
                for (var i = 1; i <= comp.numLayers; i++) {
                    comp.layer(i).selected = false;
                }
                resultLayer.selected = true;
            }
            
            // Cleanup
            PrecompCore.cleanupTempSolids();
            
        } catch (e) {
            alert("Error: " + e.toString(), CONFIG.SCRIPT_NAME);
        } finally {
            app.endUndoGroup();
        }
    }
    
    // Run the script
    main();
    
})();