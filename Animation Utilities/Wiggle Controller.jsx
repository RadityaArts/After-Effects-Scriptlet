/**
 * @name Wiggle_Controller
 * @version 3.0
 * ================================
 * Adds or removes a wiggle controller to/from properties with customizable parameters
 * 
 * Usage: 
 *   - To add: Select layer properties or camera and run the script
 *   - To remove: Select properties with wiggle expressions, or select layers to remove all wiggle effects
 * 
 * @author ©RadityaArts
 */

(function() {
    //==========================================================================
    // CONSTANTS
    //==========================================================================
    var SCRIPT_NAME = "Wiggle Controller";
    var WIGGLE_NULL_NAME = "WIGGLE";
    var WIGGLE_PREFIX = "Wiggle - ";
    var ANCHOR_POINT_VALUE = [50, 50, 0];
    var PRESET_FILE_NAME = "Wiggle Control.ffx";
    var APPDATA_FOLDER_NAME = "RadityaArts";
    var MAX_RECURSION_DEPTH = 10;
    
    var PRESET_BASE64 = "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eDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNi4wLWMwMDMgNzkuMTY0NTI3LCAyMDIwLzEwLzE1LTE3OjQ4OjMyICAgICAgICAiPgogICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iCiAgICAgICAgICAgIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIKICAgICAgICAgICAgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iCiAgICAgICAgICAgIHhtbG5zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VFdmVudCMiPgogICAgICAgICA8ZGM6Zm9ybWF0PmFwcGxpY2F0aW9uL3ZuZC5hZG9iZS5hZnRlcmVmZmVjdHMucHJlc2V0LWFuaW1hdGlvbjwvZGM6Zm9ybWF0PgogICAgICAgICA8eG1wOkNyZWF0ZURhdGU+MjAyNi0wMS0wN1QyMDoxMzoyNyswNzowMDwveG1wOkNyZWF0ZURhdGU+CiAgICAgICAgIDx4bXA6TWV0YWRhdGFEYXRlPjIwMjYtMDEtMDdUMjA6MTM6MjcrMDc6MDA8L3htcDpNZXRhZGF0YURhdGU+CiAgICAgICAgIDx4bXA6TW9kaWZ5RGF0ZT4yMDI2LTAxLTA3VDIwOjEzOjI3KzA3OjAwPC94bXA6TW9kaWZ5RGF0ZT4KICAgICAgICAgPHhtcE1NOkluc3RhbmNlSUQ+eG1wLmlpZDowOWNiMTQ1Yy04NTZmLWIxNGMtOTExYi1lY2FkZDM1OWFkZDI8L3htcE1NOkluc3RhbmNlSUQ+CiAgICAgICAgIDx4bXBNTTpEb2N1bWVudElEPnhtcC5kaWQ6MDljYjE0NWMtODU2Zi1iMTRjLTkxMWItZWNhZGQzNTlhZGQyPC94bXBNTTpEb2N1bWVudElEPgogICAgICAgICA8eG1wTU06T3JpZ2luYWxEb2N1bWVudElEPnhtcC5kaWQ6MDljYjE0NWMtODU2Zi1iMTRjLTkxMWItZWNhZGQzNTlhZGQyPC94bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ+CiAgICAgICAgIDx4bXBNTTpIaXN0b3J5PgogICAgICAgICAgICA8cmRmOlNlcT4KICAgICAgICAgICAgICAgPHJkZjpsaSByZGY6cGFyc2VUeXBlPSJSZXNvdXJjZSI+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDphY3Rpb24+Y3JlYXRlZDwvc3RFdnQ6YWN0aW9uPgogICAgICAgICAgICAgICAgICA8c3RFdnQ6aW5zdGFuY2VJRD54bXAuaWlkOjA5Y2IxNDVjLTg1NmYtYjE0Yy05MTFiLWVjYWRkMzU5YWRkMjwvc3RFdnQ6aW5zdGFuY2VJRD4KICAgICAgICAgICAgICAgICAgPHN0RXZ0OndoZW4+MjAyNi0wMS0wN1QyMDoxMzoyNyswNzowMDwvc3RFdnQ6d2hlbj4KICAgICAgICAgICAgICAgPC9yZGY6bGk+CiAgICAgICAgICAgIDwvcmRmOlNlcT4KICAgICAgICAgPC94bXBNTTpIaXN0b3J5PgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAgPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgIAo8P3hwYWNrZXQgZW5kPSJ3Ij8+";

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
     * Checks if a property name is a wiggle effect
     */
    function isWiggleEffectName(name) {
        return name && name.indexOf(WIGGLE_PREFIX) === 0;
    }

    /**
     * Checks if expression contains wiggle reference
     */
    function hasWiggleExpression(prop) {
        return safeExecute(function() {
            return prop.canSetExpression && 
                   prop.expression && 
                   prop.expression.length > 0 && 
                   prop.expression.indexOf("Wiggle") !== -1;
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
     * Finds existing wiggle null layer in composition
     */
    function findWiggleNull(comp) {
        for (var i = 1; i <= comp.numLayers; i++) {
            var layer = comp.layer(i);
            if (layer.name === WIGGLE_NULL_NAME && layer.nullLayer) return layer;
        }
        return null;
    }

    /**
     * Finds the first camera layer in composition
     */
    function findCameraLayer(comp) {
        for (var i = 1; i <= comp.numLayers; i++) {
            if (comp.layer(i) instanceof CameraLayer) return comp.layer(i);
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
     * Creates or retrieves the wiggle null controller
     */
    function getOrCreateWiggleNull(comp) {
        var wiggleNull = findWiggleNull(comp);
        if (wiggleNull) return wiggleNull;
        
        wiggleNull = comp.layers.addNull(comp.duration);
        wiggleNull.name = WIGGLE_NULL_NAME;
        
        var camera = findCameraLayer(comp);
        if (camera) wiggleNull.moveBefore(camera);
        
        return wiggleNull;
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
     * Recursively searches all properties for wiggle expressions
     */
    function findWiggleProperties(groupOrLayer) {
        var results = [];
        
        function search(group, depth) {
            if (!group || depth > MAX_RECURSION_DEPTH) return;
            
            var numProps = safeExecute(function() { return group.numProperties; }, 0);
            
            for (var i = 1; i <= numProps; i++) {
                var prop = safeExecute(function() { return group.property(i); }, null);
                if (!prop) continue;
                
                if (hasWiggleExpression(prop)) results.push(prop);
                
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
    function parseWiggleExpression(expression) {
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
     * Creates wiggle expression for a specific property
     */
    function createWiggleExpression(propertyName, controlLayerName) {
        var effectRef = 'thisComp.layer("' + controlLayerName + '").effect("' + WIGGLE_PREFIX + propertyName + '")';
        return [
            'var fx = ' + effectRef + ';',
            'if (fx.enabled) {',
            '    seedRandom(fx(8));',
            '    if (fx(3).value == 1) {',
            '        // Loopable wiggle',
            '        var loopTime = thisComp.duration;',
            '        var t = time % loopTime;',
            '        ',
            '        var wiggle1 = wiggle(fx(4), fx(5), fx(6), fx(7), t);',
            '        var wiggle2 = wiggle(fx(4), fx(5), fx(6), fx(7), t - loopTime);',
            '        ',
            '        linear(t, 0, loopTime, wiggle1, wiggle2);',
            '    } else {',
            '        // Normal wiggle',
            '        wiggle(fx(4), fx(5), fx(6), fx(7));',
            '    }',
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
     * Removes a wiggle effect from a layer by name
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
     * Removes all wiggle effects from a layer
     */
    function removeAllWiggleEffects(layer) {
        var count = 0;
        safeExecute(function() {
            var effects = layer.property("Effects");
            if (!effects) return;
            
            // Iterate backwards to safely remove
            for (var i = effects.numProperties; i >= 1; i--) {
                if (isWiggleEffectName(effects.property(i).name)) {
                    effects.property(i).remove();
                    count++;
                }
            }
        });
        return count;
    }

    /**
     * Checks if layer has any wiggle effects
     */
    function hasWiggleEffects(layer) {
        return safeExecute(function() {
            var effects = layer.property("Effects");
            if (!effects) return false;
            
            for (var i = 1; i <= effects.numProperties; i++) {
                if (isWiggleEffectName(effects.property(i).name)) return true;
            }
            return false;
        }, false);
    }

    /**
     * Configures the wiggle control layer with effect preset
     */
    function applyWiggleEffect(controlLayer, effectName) {
        // Set anchor point for null layers
        if (controlLayer.nullLayer) {
            controlLayer.property("Anchor Point").setValue(ANCHOR_POINT_VALUE);
        }
        
        // Skip if effect already exists
        if (controlLayer.effect(effectName)) return true;
        
        var presetFile = getPresetFile();
        if (!presetFile || !presetFile.exists) {
            alert("Preset file not found. Please ensure the script is properly configured.");
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
     * Detects whether user wants to remove wiggle effects
     */
    function shouldRemoveWiggle(comp) {
        var props = comp.selectedProperties;
        var layers = comp.selectedLayers;

        // If properties are selected, only enter remove mode when all selected
        // properties are wiggle-related (effect itself or a wiggle expression).
        if (props.length > 0) {
            var foundWiggle = false;
            for (var i = 0; i < props.length; i++) {
                var prop = props[i];
                var isWiggleProp = isWiggleEffectName(prop.name) || hasWiggleExpression(prop);
                if (!isWiggleProp) return false;
                foundWiggle = true;
            }
            return foundWiggle;
        }

        // If layers are selected (and no properties), only enter remove mode when
        // every selected layer has wiggle effects/expressions.
        if (layers.length > 0) {
            var hasAny = false;
            for (var j = 0; j < layers.length; j++) {
                var hasWiggle = hasWiggleEffects(layers[j]) || findWiggleProperties(layers[j]).length > 0;
                if (!hasWiggle) return false;
                hasAny = true;
            }
            return hasAny;
        }

        return false;
    }

    /**
     * Gets selected properties or default camera property for wiggle
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
        } else if (comp.selectedLayers.length > 0) {
            var layer = comp.selectedLayers[0];
            if (layer instanceof CameraLayer) {
                var poi = layer.property("Point of Interest");
                if (poi) {
                    targets.push({
                        path: getPropertyPath(poi),
                        name: "Point of Interest",
                        layer: layer
                    });
                }
            } else {
                alert("Please select specific properties or a camera layer.");
            }
        }
        
        return targets;
    }

    //==========================================================================
    // CORE LOGIC - ADD WIGGLE
    //==========================================================================
    
    /**
     * Applies wiggle to a single property
     */
    function addWiggleToProperty(propInfo, comp) {
        var effectName = WIGGLE_PREFIX + propInfo.name;
        var controlLayer, controlLayerName;
        
        if (canLayerHaveEffects(propInfo.layer)) {
            controlLayer = propInfo.layer;
            controlLayerName = controlLayer.name;
        } else {
            controlLayer = getOrCreateWiggleNull(comp);
            controlLayerName = WIGGLE_NULL_NAME;
        }
        
        if (!applyWiggleEffect(controlLayer, effectName)) return false;
        
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
            property.expression = createWiggleExpression(propInfo.name, controlLayerName);
            return true;
        }, false);
    }

    /**
     * Adds wiggle effects to all target properties
     */
    function addWiggleEffects(comp) {
        var targets = getTargetProperties(comp);
        if (targets.length === 0) {
            alert("No valid properties selected.");
            return;
        }
        
        for (var i = 0; i < targets.length; i++) {
            addWiggleToProperty(targets[i], comp);
        }
    }

    //==========================================================================
    // CORE LOGIC - REMOVE WIGGLE
    //==========================================================================
    
    /**
     * Removes wiggle from a property and its associated effect
     */
    function removeWiggleFromProperty(prop, comp) {
        var info = parseWiggleExpression(prop.expression);
        if (!info) return false;
        
        clearExpression(prop);
        
        var controlLayer = findLayerByName(comp, info.layerName);
        if (controlLayer) removeEffectByName(controlLayer, info.effectName);
        
        return true;
    }

    /**
     * Removes wiggle effect and all expressions referencing it
     */
    function removeWiggleEffectAndExpressions(effectName, comp) {
        // Remove all expressions referencing this effect
        for (var i = 1; i <= comp.numLayers; i++) {
            var props = findWiggleProperties(comp.layer(i));
            for (var j = 0; j < props.length; j++) {
                if (props[j].expression.indexOf(effectName) !== -1) {
                    clearExpression(props[j]);
                }
            }
        }
    }

    /**
     * Removes wiggle effects from selected properties/layers
     */
    function removeWiggleEffects(comp) {
        var props = comp.selectedProperties;
        var layers = comp.selectedLayers;
        
        // Handle selected properties
        if (props.length > 0) {
            for (var i = 0; i < props.length; i++) {
                var prop = props[i];
                
                if (isWiggleEffectName(prop.name)) {
                    // Selected property is the effect itself
                    removeWiggleEffectAndExpressions(prop.name, comp);
                    safeExecute(function() { prop.remove(); });
                } else if (hasWiggleExpression(prop)) {
                    // Selected property has wiggle expression
                    removeWiggleFromProperty(prop, comp);
                }
            }
            return;
        }
        
        // Handle selected layers
        for (var j = 0; j < layers.length; j++) {
            var layer = layers[j];
            
            // Remove expressions from this layer
            var wiggleProps = findWiggleProperties(layer);
            for (var k = 0; k < wiggleProps.length; k++) {
                removeWiggleFromProperty(wiggleProps[k], comp);
            }
            
            // Remove effects from this layer
            removeAllWiggleEffects(layer);
        }
    }

    //==========================================================================
    // MAIN EXECUTION
    //==========================================================================
    
    function main() {
        var comp = app.project.activeItem;
        if (!validateSelection(comp)) return;
        
        if (shouldRemoveWiggle(comp)) {
            removeWiggleEffects(comp);
        } else {
            addWiggleEffects(comp);
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