/**
 * @name Elastic_Controller
 * @version 1.0
 * ================================
 * Adds or removes an elastic controller to/from properties with customizable parameters
 * 
 * Usage: 
 *   - To add: Select layer properties and run the script
 *   - To remove: Select properties with elastic expressions, or select layers to remove all elastic effects
 * 
 * @author ©RadityaArts
 */

(function() {
    //==========================================================================
    // CONSTANTS
    //==========================================================================
    var SCRIPT_NAME = "Elastic Controller";
    var ELASTIC_NULL_NAME = "ELASTIC";
    var ELASTIC_PREFIX = "Elastic - ";
    var ANCHOR_POINT_VALUE = [50, 50, 0];
    var PRESET_FILE_NAME = "Elastic Control.ffx";
    var APPDATA_FOLDER_NAME = "RadityaArts";
    var MAX_RECURSION_DEPTH = 10;

    var PRESET_BASE64 = "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MDA8L3htcDpNZXRhZGF0YURhdGU+CiAgICAgICAgIDx4bXA6TW9kaWZ5RGF0ZT4yMDI2LTAxLTA3VDIwOjIwOjI0KzA3OjAwPC94bXA6TW9kaWZ5RGF0ZT4KICAgICAgICAgPHhtcE1NOkluc3RhbmNlSUQ+eG1wLmlpZDo5MmI2ZmFkYi0wMTA0LTMxNGMtOWNlNy0xMTNhNDY1MTQ4YzY8L3htcE1NOkluc3RhbmNlSUQ+CiAgICAgICAgIDx4bXBNTTpEb2N1bWVudElEPnhtcC5kaWQ6OTJiNmZhZGItMDEwNC0zMTRjLTljZTctMTEzYTQ2NTE0OGM2PC94bXBNTTpEb2N1bWVudElEPgogICAgICAgICA8eG1wTU06T3JpZ2luYWxEb2N1bWVudElEPnhtcC5kaWQ6OTJiNmZhZGItMDEwNC0zMTRjLTljZTctMTEzYTQ2NTE0OGM2PC94bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ+CiAgICAgICAgIDx4bXBNTTpIaXN0b3J5PgogICAgICAgICAgICA8cmRmOlNlcT4KICAgICAgICAgICAgICAgPHJkZjpsaSByZGY6cGFyc2VUeXBlPSJSZXNvdXJjZSI+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDphY3Rpb24+Y3JlYXRlZDwvc3RFdnQ6YWN0aW9uPgogICAgICAgICAgICAgICAgICA8c3RFdnQ6aW5zdGFuY2VJRD54bXAuaWlkOjkyYjZmYWRiLTAxMDQtMzE0Yy05Y2U3LTExM2E0NjUxNDhjNjwvc3RFdnQ6aW5zdGFuY2VJRD4KICAgICAgICAgICAgICAgICAgPHN0RXZ0OndoZW4+MjAyNi0wMS0wN1QyMDoyMDoyNCswNzowMDwvc3RFdnQ6d2hlbj4KICAgICAgICAgICAgICAgPC9yZGY6bGk+CiAgICAgICAgICAgIDwvcmRmOlNlcT4KICAgICAgICAgPC94bXBNTTpIaXN0b3J5PgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAgPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgIAo8P3hwYWNrZXQgZW5kPSJ3Ij8+";
    // Regex patterns for expression parsing
    var LAYER_PATTERN = /thisComp\.layer\("([^"]+)"\)/;
    var EFFECT_PATTERN = /effect\("([^"]+)"\)/;

    //==========================================================================
    // HELPER UTILITIES
    //==========================================================================
    
    /**
     * Safe wrapper for operations that may throw
     */
    function safeExecute(fn, fallback) {
        try { return fn(); } 
        catch (e) { return fallback; }
    }

    /**
     * Checks if a property name is an elastic effect
     */
    function isElasticEffectName(name) {
        return name && name.indexOf(ELASTIC_PREFIX) === 0;
    }

    /**
     * Checks if expression contains elastic reference
     */
    function hasElasticExpression(prop) {
        return safeExecute(function() {
            return prop.canSetExpression && 
                   prop.expression && 
                   prop.expression.length > 0 && 
                   prop.expression.indexOf("Elastic") !== -1;
        }, false);
    }

    /**
     * Decodes BASE64 string to binary data (ExtendScript compatible)
     */
    function base64Decode(input) {
        var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        var clean = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
        var output = "";
        
        for (var i = 0; i < clean.length; i += 4) {
            var e1 = chars.indexOf(clean.charAt(i));
            var e2 = chars.indexOf(clean.charAt(i + 1));
            var e3 = chars.indexOf(clean.charAt(i + 2));
            var e4 = chars.indexOf(clean.charAt(i + 3));
            
            output += String.fromCharCode((e1 << 2) | (e2 >> 4));
            if (e3 !== -1) output += String.fromCharCode(((e2 & 15) << 4) | (e3 >> 2));
            if (e4 !== -1) output += String.fromCharCode(((e3 & 3) << 6) | e4);
        }
        
        return output;
    }

    //==========================================================================
    // FILE OPERATIONS
    //==========================================================================
    
    /**
     * Gets or creates the AppData preset folder
     */
    function getPresetFolder() {
        var folder = new Folder(Folder.userData.fsName + "/" + APPDATA_FOLDER_NAME);
        if (!folder.exists) folder.create();
        return folder;
    }

    /**
     * Gets the preset file, extracting from BASE64 if needed
     */
    function getPresetFile() {
        var presetFile = new File(getPresetFolder().absoluteURI + "/" + PRESET_FILE_NAME);
        
        // Return existing file
        if (presetFile.exists) return presetFile;
        
        // No BASE64 data available
        if (!PRESET_BASE64 || PRESET_BASE64.length === 0) return null;
        
        // Extract from BASE64
        return safeExecute(function() {
            presetFile.open("w");
            presetFile.encoding = "BINARY";
            presetFile.write(base64Decode(PRESET_BASE64));
            presetFile.close();
            return presetFile;
        }, null);
    }

    //==========================================================================
    // LAYER UTILITIES
    //==========================================================================
    
    /**
     * Finds a layer by name in composition
     */
    function findLayerByName(comp, name) {
        for (var i = 1; i <= comp.numLayers; i++) {
            if (comp.layer(i).name === name) return comp.layer(i);
        }
        return null;
    }

    /**
     * Finds existing elastic null layer in composition
     */
    function findElasticNull(comp) {
        for (var i = 1; i <= comp.numLayers; i++) {
            var layer = comp.layer(i);
            if (layer.name === ELASTIC_NULL_NAME && layer.nullLayer) return layer;
        }
        return null;
    }

    /**
     * Checks if a layer can have effects applied
     */
    function canLayerHaveEffects(layer) {
        if (!layer || layer instanceof CameraLayer || layer instanceof LightLayer) return false;
        return safeExecute(function() { return layer.property("Effects") !== null; }, false);
    }

    /**
     * Creates or retrieves the elastic null controller
     */
    function getOrCreateElasticNull(comp) {
        var elasticNull = findElasticNull(comp);
        if (elasticNull) return elasticNull;
        
        elasticNull = comp.layers.addNull(comp.duration);
        elasticNull.name = ELASTIC_NULL_NAME;
        
        return elasticNull;
    }

    //==========================================================================
    // PROPERTY UTILITIES
    //==========================================================================
    
    /**
     * Gets property path for later retrieval
     */
    function getPropertyPath(property) {
        var path = [];
        var current = property;
        while (current && current.parentProperty) {
            path.unshift(current.name);
            current = current.parentProperty;
        }
        return path;
    }

    /**
     * Retrieves property from layer using property path
     */
    function getPropertyFromPath(layer, path) {
        var current = layer;
        for (var i = 0; i < path.length; i++) {
            current = safeExecute(function() { return current.property(path[i]); }, null);
            if (!current) return null;
        }
        return current;
    }

    /**
     * Recursively searches all properties for elastic expressions
     */
    function findElasticProperties(groupOrLayer) {
        var results = [];
        
        function search(group, depth) {
            if (!group || depth > MAX_RECURSION_DEPTH) return;
            
            var numProps = safeExecute(function() { return group.numProperties; }, 0);
            
            for (var i = 1; i <= numProps; i++) {
                var prop = safeExecute(function() { return group.property(i); }, null);
                if (!prop) continue;
                
                if (hasElasticExpression(prop)) results.push(prop);
                
                // Recurse into nested properties
                if (safeExecute(function() { return prop.numProperties > 0; }, false)) {
                    search(prop, depth + 1);
                }
            }
        }
        
        search(groupOrLayer, 0);
        return results;
    }

    /**
     * Extracts control layer and effect name from expression
     */
    function parseElasticExpression(expression) {
        var layerMatch = expression.match(LAYER_PATTERN);
        var effectMatch = expression.match(EFFECT_PATTERN);
        
        if (layerMatch && effectMatch) {
            return { layerName: layerMatch[1], effectName: effectMatch[1] };
        }
        return null;
    }

    //==========================================================================
    // EXPRESSION UTILITIES
    //==========================================================================
    
    /**
     * Creates elastic expression for a specific property
     */
    function createElasticExpression(propertyName, controlLayerName) {
        var effectRef = 'thisComp.layer("' + controlLayerName + '").effect("' + ELASTIC_PREFIX + propertyName + '")';
        return [
            '// Elastic Controller Expression',
            'var fx = ' + effectRef + ';',
            '',
            'if (fx.enabled) {',
            '    var amplitude = fx(3).value;',
            '    var frequency = fx(4).value;',
            '    var decay = fx(5).value;',
            '',
            '    var TWO_PI = 6.283185307179586;',
            '    var INV_TWO_PI = 0.1591549430918953;',
            '',
            '    function elasticEasing(elapsed, startVal, change, duration) {',
            '        if (elapsed <= 0) return startVal;',
            '        var progress = elapsed / duration;',
            '        if (progress >= 1) return startVal + change;',
            '',
            '        var period = 1 / frequency;',
            '        var absChange = Math.abs(change) || 0.0001;',
            '        var effectiveAmp = amplitude * Math.max(0.5, absChange * 0.01);',
            '        var phaseShift;',
            '',
            '        if (effectiveAmp < absChange * 0.1) {',
            '            effectiveAmp = absChange * 0.1;',
            '            phaseShift = period * 0.25;',
            '        } else {',
            '            phaseShift = period * INV_TWO_PI * Math.asin(Math.max(-1, Math.min(1, change / effectiveAmp)));',
            '        }',
            '',
            '        return effectiveAmp * Math.pow(2, -decay * progress) * Math.sin((elapsed - phaseShift) * TWO_PI / period) + change + startVal;',
            '    }',
            '',
            '    function interpolateKeyframes() {',
            '        var keyIndex = 0;',
            '        if (numKeys > 0) {',
            '            keyIndex = nearestKey(time).index;',
            '            if (key(keyIndex).time > time) keyIndex--;',
            '        }',
            '',
            '        try {',
            '            var keyStart = key(keyIndex);',
            '            var keyEnd = key(keyIndex + 1);',
            '        } catch(e) {',
            '            return null;',
            '        }',
            '',
            '        if (time < keyStart.time || time > keyEnd.time) return value;',
            '',
            '        var elapsed = time - keyStart.time;',
            '        var duration = keyEnd.time - keyStart.time;',
            '',
            '        var dimensions = 1;',
            '        try { key(1)[1]; dimensions = 2; key(1)[2]; dimensions = 3; } catch(e) {}',
            '',
            '        if (dimensions === 1) return elasticEasing(elapsed, keyStart[0], keyEnd[0] - keyStart[0], duration);',
            '        if (dimensions === 2) return [elasticEasing(elapsed, keyStart[0], keyEnd[0] - keyStart[0], duration), elasticEasing(elapsed, keyStart[1], keyEnd[1] - keyStart[1], duration)];',
            '        return [elasticEasing(elapsed, keyStart[0], keyEnd[0] - keyStart[0], duration), elasticEasing(elapsed, keyStart[1], keyEnd[1] - keyStart[1], duration), elasticEasing(elapsed, keyStart[2], keyEnd[2] - keyStart[2], duration)];',
            '    }',
            '',
            '    (interpolateKeyframes() || value);',
            '} else {',
            '    value;',
            '}'
        ].join('\n');
    }

    /**
     * Removes expression from a property
     */
    function clearExpression(property) {
        return safeExecute(function() {
            if (property.canSetExpression) {
                property.expression = "";
                return true;
            }
            return false;
        }, false);
    }

    //==========================================================================
    // EFFECT UTILITIES
    //==========================================================================
    
    /**
     * Removes an elastic effect from a layer by name
     */
    function removeEffectByName(layer, effectName) {
        return safeExecute(function() {
            var effects = layer.property("Effects");
            if (!effects) return false;
            
            for (var i = 1; i <= effects.numProperties; i++) {
                if (effects.property(i).name === effectName) {
                    effects.property(i).remove();
                    return true;
                }
            }
            return false;
        }, false);
    }

    /**
     * Removes all elastic effects from a layer
     */
    function removeAllElasticEffects(layer) {
        var count = 0;
        safeExecute(function() {
            var effects = layer.property("Effects");
            if (!effects) return;
            
            // Iterate backwards to safely remove
            for (var i = effects.numProperties; i >= 1; i--) {
                if (isElasticEffectName(effects.property(i).name)) {
                    effects.property(i).remove();
                    count++;
                }
            }
        });
        return count;
    }

    /**
     * Checks if layer has any elastic effects
     */
    function hasElasticEffects(layer) {
        return safeExecute(function() {
            var effects = layer.property("Effects");
            if (!effects) return false;
            
            for (var i = 1; i <= effects.numProperties; i++) {
                if (isElasticEffectName(effects.property(i).name)) return true;
            }
            return false;
        }, false);
    }

    /**
     * Configures the elastic control layer with effect preset
     */
    function applyElasticEffect(controlLayer, effectName) {
        // Set anchor point for null layers
        if (controlLayer.nullLayer) {
            controlLayer.property("Anchor Point").setValue(ANCHOR_POINT_VALUE);
        }
        
        // Skip if effect already exists
        if (controlLayer.effect(effectName)) return true;
        
        var presetFile = getPresetFile();
        if (!presetFile || !presetFile.exists) {
            alert("Preset file not found. Please ensure the 'Elastic Control.ffx' preset is placed in:\n" + 
                  getPresetFolder().fsName + "\n\n" +
                  "Or embed the BASE64 encoded preset in the script.");
            return false;
        }
        
        return safeExecute(function() {
            var effects = controlLayer.property("Effects");
            var countBefore = effects.numProperties;
            var comp = controlLayer.containingComp;
            
            // Deselect all layers, select only control layer
            var selected = comp.selectedLayers.slice();
            for (var i = 0; i < selected.length; i++) selected[i].selected = false;
            controlLayer.selected = true;
            
            // Apply preset and rename new effect
            controlLayer.applyPreset(presetFile);
            var newEffect = effects.property(countBefore + 1);
            if (newEffect) newEffect.name = effectName;
            
            controlLayer.selected = false;
            return true;
        }, false);
    }

    //==========================================================================
    // CORE LOGIC - DETECTION
    //==========================================================================
    
    /**
     * Validates the current composition and selection
     */
    function validateSelection(comp) {
        if (!comp || !(comp instanceof CompItem)) {
            alert("Please select a composition.");
            return false;
        }
        if (comp.selectedLayers.length === 0 && comp.selectedProperties.length === 0) {
            alert("Please select a layer or property.");
            return false;
        }
        return true;
    }

    /**
     * Detects whether user wants to remove elastic effects
     */
    function shouldRemoveElastic(comp) {
        var props = comp.selectedProperties;
        var layers = comp.selectedLayers;

        // If properties are selected, only enter remove mode when all selected
        // properties are elastic-related (effect itself or an elastic expression).
        if (props.length > 0) {
            var foundElastic = false;
            for (var i = 0; i < props.length; i++) {
                var prop = props[i];
                var isElasticProp = isElasticEffectName(prop.name) || hasElasticExpression(prop);
                if (!isElasticProp) return false;
                foundElastic = true;
            }
            return foundElastic;
        }

        // If layers are selected (and no properties), only enter remove mode when
        // every selected layer has elastic effects/expressions.
        if (layers.length > 0) {
            var hasAny = false;
            for (var j = 0; j < layers.length; j++) {
                var hasElastic = hasElasticEffects(layers[j]) || findElasticProperties(layers[j]).length > 0;
                if (!hasElastic) return false;
                hasAny = true;
            }
            return hasAny;
        }

        return false;
    }

    /**
     * Gets selected properties for elastic effect
     */
    function getTargetProperties(comp) {
        var targets = [];
        var props = comp.selectedProperties;
        
        if (props.length > 0) {
            for (var i = 0; i < props.length; i++) {
                if (props[i].canSetExpression) {
                    targets.push({
                        path: getPropertyPath(props[i]),
                        name: props[i].name,
                        layer: props[i].propertyGroup(props[i].propertyDepth)
                    });
                }
            }
        } else {
            alert("Please select specific properties to apply elastic effect.");
        }
        
        return targets;
    }

    //==========================================================================
    // CORE LOGIC - ADD ELASTIC
    //==========================================================================
    
    /**
     * Applies elastic to a single property
     */
    function addElasticToProperty(propInfo, comp) {
        var effectName = ELASTIC_PREFIX + propInfo.name;
        var controlLayer, controlLayerName;
        
        if (canLayerHaveEffects(propInfo.layer)) {
            controlLayer = propInfo.layer;
            controlLayerName = controlLayer.name;
        } else {
            controlLayer = getOrCreateElasticNull(comp);
            controlLayerName = ELASTIC_NULL_NAME;
        }
        
        if (!applyElasticEffect(controlLayer, effectName)) return false;
        
        var property = getPropertyFromPath(propInfo.layer, propInfo.path);
        if (!property) {
            alert("Error: Could not find property " + propInfo.name);
            return false;
        }
        
        if (!property.canSetExpression) {
            alert("Property " + propInfo.name + " cannot have expressions applied.");
            return false;
        }
        
        return safeExecute(function() {
            property.expression = createElasticExpression(propInfo.name, controlLayerName);
            return true;
        }, false);
    }

    /**
     * Adds elastic effects to all target properties
     */
    function addElasticEffects(comp) {
        var targets = getTargetProperties(comp);
        if (targets.length === 0) {
            alert("No valid properties selected.");
            return;
        }
        
        for (var i = 0; i < targets.length; i++) {
            addElasticToProperty(targets[i], comp);
        }
    }

    //==========================================================================
    // CORE LOGIC - REMOVE ELASTIC
    //==========================================================================
    
    /**
     * Removes elastic from a property and its associated effect
     */
    function removeElasticFromProperty(prop, comp) {
        var info = parseElasticExpression(prop.expression);
        if (!info) return false;
        
        clearExpression(prop);
        
        var controlLayer = findLayerByName(comp, info.layerName);
        if (controlLayer) removeEffectByName(controlLayer, info.effectName);
        
        return true;
    }

    /**
     * Removes elastic effect and all expressions referencing it
     */
    function removeElasticEffectAndExpressions(effectName, comp) {
        // Remove all expressions referencing this effect
        for (var i = 1; i <= comp.numLayers; i++) {
            var props = findElasticProperties(comp.layer(i));
            for (var j = 0; j < props.length; j++) {
                if (props[j].expression.indexOf(effectName) !== -1) {
                    clearExpression(props[j]);
                }
            }
        }
    }

    /**
     * Removes elastic effects from selected properties/layers
     */
    function removeElasticEffects(comp) {
        var props = comp.selectedProperties;
        var layers = comp.selectedLayers;
        
        // Handle selected properties
        if (props.length > 0) {
            for (var i = 0; i < props.length; i++) {
                var prop = props[i];
                
                if (isElasticEffectName(prop.name)) {
                    // Selected property is the effect itself
                    removeElasticEffectAndExpressions(prop.name, comp);
                    safeExecute(function() { prop.remove(); });
                } else if (hasElasticExpression(prop)) {
                    // Selected property has elastic expression
                    removeElasticFromProperty(prop, comp);
                }
            }
            return;
        }
        
        // Handle selected layers
        for (var j = 0; j < layers.length; j++) {
            var layer = layers[j];
            
            // Remove expressions from this layer
            var elasticProps = findElasticProperties(layer);
            for (var k = 0; k < elasticProps.length; k++) {
                removeElasticFromProperty(elasticProps[k], comp);
            }
            
            // Remove effects from this layer
            removeAllElasticEffects(layer);
        }
    }

    //==========================================================================
    // MAIN EXECUTION
    //==========================================================================
    
    function main() {
        var comp = app.project.activeItem;
        if (!validateSelection(comp)) return;
        
        if (shouldRemoveElastic(comp)) {
            removeElasticEffects(comp);
        } else {
            addElasticEffects(comp);
        }
    }

    // Execute with undo group
    app.beginUndoGroup(SCRIPT_NAME);
    try {
        main();
    } catch (e) {
        alert("Error: " + e.toString());
    } finally {
        app.endUndoGroup();
    }

})();