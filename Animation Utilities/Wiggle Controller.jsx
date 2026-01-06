/**
 * @name Wiggle_Controller
 * @version 2.0
 * ================================
 * Adds a wiggle controller to properties with customizable parameters
 * 
 * Usage: Select layer properties or camera and run the script
 * 
 * @author ©RadityaArts
 */

(function() {
    // Constants
    var SCRIPT_NAME = "Add Wiggle Controller";
    var WIGGLE_NULL_NAME = "WIGGLE";
    var ANCHOR_POINT_VALUE = [50, 50, 0];
    var PRESET_FILE_NAME = "Wiggle Control.ffx";
    var APPDATA_FOLDER_NAME = "RadityaArts";
    
    var PRESET_BASE64 = "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AAAACMCPQAAAAAAAdGR1TQAAAAhAj0AAAAAAAHRkbW4AAAAoQURCRSBHcm91cCBFbmQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHsiY29udHJvbE5hbWUiOiJXaWdnbGUiLCJtYXRjaG5hbWUiOiJQc2V1ZG8vUEVNIE1hdGNobmFtZSIsImNvbnRyb2xBcnJheSI6W3sibmFtZSI6IkNyZWF0ZWQgYnkgUmFkaXR5YUFydHMiLCJ0eXBlIjoibGFiZWwiLCJjYW5IYXZlS2V5ZnJhbWVzIjpmYWxzZSwiY2FuQmVJbnZpc2libGUiOmZhbHNlLCJpbnZpc2libGUiOmZhbHNlLCJrZXlmcmFtZXMiOmZhbHNlLCJpZCI6MTk4ODg4MjY4OSwiaG9sZCI6ZmFsc2UsImRpbSI6dHJ1ZSwiZXJyb3IiOlsKCl19LHsibmFtZSI6IkVuZEdyb3VwIiwidHlwZSI6ImVuZExhYmVsIiwiY2FuQmVJbnZpc2libGUiOmZhbHNlLCJjYW5IYXZlS2V5ZnJhbWVzIjpmYWxzZSwia2V5ZnJhbWVzIjpmYWxzZSwiaG9sZCI6ZmFsc2UsImlkIjo2MTcwMzAzMjE0LCJsYWJlbElkIjowLCJlcnJvciI6WwoKXX0seyJuYW1lIjoiRnJlcXVlbmN5IiwidHlwZSI6InNsaWRlciIsImNhbkhhdmVLZXlmcmFtZXMiOnRydWUsImNhbkJlSW52aXNpYmxlIjp0cnVlLCJpbnZpc2libGUiOmZhbHNlLCJrZXlmcmFtZXMiOnRydWUsImlkIjo3MDIwOTI5NjA3LCJob2xkIjpmYWxzZSwiZGVmYXVsdCI6MS41LCJzbGlkZXJNYXgiOjEwMCwic2xpZGVyTWluIjotMTAwLCJ2YWxpZE1heCI6MTAwMDAwLCJ2YWxpZE1pbiI6LTEwMDAwMCwicHJlY2lzaW9uIjoyLCJwZXJjZW50IjpmYWxzZSwicGl4ZWwiOmZhbHNlLCJvcGVuIjpmYWxzZSwiZXJyb3JzIjpbCgpdLCJlcnJvciI6WwoKXX0seyJuYW1lIjoiQW1wbGl0dWRlIiwidHlwZSI6InNsaWRlciIsImNhbkhhdmVLZXlmcmFtZXMiOnRydWUsImNhbkJlSW52aXNpYmxlIjp0cnVlLCJpbnZpc2libGUiOmZhbHNlLCJrZXlmcmFtZXMiOnRydWUsImlkIjo3NzY3OTAzMTc3LCJob2xkIjpmYWxzZSwiZGVmYXVsdCI6MTAsInNsaWRlck1heCI6MTAwLCJzbGlkZXJNaW4iOi0xMDAsInZhbGlkTWF4IjoxMDAwMDAsInZhbGlkTWluIjotMTAwMDAwLCJwcmVjaXNpb24iOjIsInBlcmNlbnQiOmZhbHNlLCJwaXhlbCI6ZmFsc2UsIm9wZW4iOmZhbHNlLCJlcnJvcnMiOlsKCl0sImVycm9yIjpbCgpdfSx7Im5hbWUiOiJPY3RhdmVzIiwidHlwZSI6InNsaWRlciIsImNhbkhhdmVLZXlmcmFtZXMiOnRydWUsImNhbkJlSW52aXNpYmxlIjp0cnVlLCJpbnZpc2libGUiOmZhbHNlLCJrZXlmcmFtZXMiOnRydWUsImlkIjo5MDQwMjc1MTAxLCJob2xkIjpmYWxzZSwiZGVmYXVsdCI6MSwic2xpZGVyTWF4IjoxMDAsInNsaWRlck1pbiI6LTEwMCwidmFsaWRNYXgiOjEwMDAwMCwidmFsaWRNaW4iOi0xMDAwMDAsInByZWNpc2lvbiI6MiwicGVyY2VudCI6ZmFsc2UsInBpeGVsIjpmYWxzZSwib3BlbiI6ZmFsc2UsImVycm9ycyI6WwoKXSwiZXJyb3IiOlsKCl19LHsibmFtZSI6IkludGVuc2l0eSIsInR5cGUiOiJzbGlkZXIiLCJjYW5IYXZlS2V5ZnJhbWVzIjp0cnVlLCJjYW5CZUludmlzaWJsZSI6dHJ1ZSwiaW52aXNpYmxlIjpmYWxzZSwia2V5ZnJhbWVzIjp0cnVlLCJpZCI6OTI0NDcyNzI4NCwiaG9sZCI6ZmFsc2UsImRlZmF1bHQiOjAuMjUsInNsaWRlck1heCI6MTAwLCJzbGlkZXJNaW4iOi0xMDAsInZhbGlkTWF4IjoxMDAwMDAsInZhbGlkTWluIjotMTAwMDAwLCJwcmVjaXNpb24iOjIsInBlcmNlbnQiOmZhbHNlLCJwaXhlbCI6ZmFsc2UsIm9wZW4iOmZhbHNlLCJlcnJvcnMiOlsKCl0sImVycm9yIjpbCgpdfSx7Im5hbWUiOiJSYW5kb20gU2VlZCIsInR5cGUiOiJzbGlkZXIiLCJjYW5IYXZlS2V5ZnJhbWVzIjp0cnVlLCJjYW5CZUludmlzaWJsZSI6dHJ1ZSwiaW52aXNpYmxlIjpmYWxzZSwia2V5ZnJhbWVzIjp0cnVlLCJpZCI6Nzg0ODgzMjc1MCwiaG9sZCI6ZmFsc2UsImRlZmF1bHQiOjAuMjUsInNsaWRlck1heCI6MTAwMCwic2xpZGVyTWluIjotMTAwMCwidmFsaWRNYXgiOjEwMDAwMCwidmFsaWRNaW4iOi0xMDAwMDAsInByZWNpc2lvbiI6MCwicGVyY2VudCI6ZmFsc2UsInBpeGVsIjpmYWxzZSwib3BlbiI6ZmFsc2UsImVycm9ycyI6WwoKXSwiZXJyb3IiOlsKCl19XSwidmVyc2lvbiI6M30=";
    
    /**
     * Creates wiggle expression for a specific property
     */
    function createWiggleExpression(propertyName, controlLayerName) {
        return 'var fx = thisComp.layer("' + controlLayerName + '").effect("Wiggle - ' + propertyName + '");\n' +
               'seedRandom(fx("Random Seed"));\n' +
               'wiggle(fx("Frequency"), fx("Amplitude"), fx("Octaves"), fx("Intensity"));';
    }

    /**
     * Decodes BASE64 string to binary data
     * ExtendScript compatible BASE64 decoder
     */
    function base64Decode(base64String) {
        var base64chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        var decoded = "";
        var c1, c2, c3, e1, e2, e3, e4;
        
        // Remove any characters that are not A-Z, a-z, 0-9, +, /, or =
        base64String = base64String.replace(/[^A-Za-z0-9\+\/\=]/g, "");
        
        for (var i = 0; i < base64String.length;) {
            e1 = base64chars.indexOf(base64String.charAt(i++));
            e2 = base64chars.indexOf(base64String.charAt(i++));
            e3 = base64chars.indexOf(base64String.charAt(i++));
            e4 = base64chars.indexOf(base64String.charAt(i++));
            
            c1 = (e1 << 2) | (e2 >> 4);
            c2 = ((e2 & 15) << 4) | (e3 >> 2);
            c3 = ((e3 & 3) << 6) | e4;
            
            decoded += String.fromCharCode(c1);
            
            if (e3 != -1) {
                decoded += String.fromCharCode(c2);
            }
            if (e4 != -1) {
                decoded += String.fromCharCode(c3);
            }
        }
        
        return decoded;
    }

    /**
     * Gets or creates the AppData preset folder
     */
    function getPresetFolder() {
        var appDataPath;
        
        // Handle different OS paths
        if ($.os.match(/windows/i)) {
            appDataPath = Folder.userData.fsName + "/" + APPDATA_FOLDER_NAME;
        } else {
            appDataPath = Folder.userData.fsName + "/" + APPDATA_FOLDER_NAME;
        }
        
        var presetFolder = new Folder(appDataPath);
        if (!presetFolder.exists) {
            presetFolder.create();
        }
        
        return presetFolder;
    }

    /**
     * Extracts preset from BASE64 and saves to AppData
     */
    function extractPresetFromBase64() {
        if (!PRESET_BASE64 || PRESET_BASE64.length === 0 || PRESET_BASE64 === "PASTE_YOUR_BASE64_ENCODED_PRESET_DATA_HERE") {
            return null; // Silently return null if no preset data
        }
        
        try {
            var presetFolder = getPresetFolder();
            var presetFile = new File(presetFolder.absoluteURI + "/" + PRESET_FILE_NAME);
            
            // If preset already exists, use it
            if (presetFile.exists) {
                return presetFile;
            }
            
            // Decode BASE64 and write to file
            presetFile.open("w");
            presetFile.encoding = "BINARY";
            presetFile.write(base64Decode(PRESET_BASE64));
            presetFile.close();
            
            return presetFile;
        } catch (e) {
            alert("Error extracting preset: " + e.toString());
            return null;
        }
    }

    /**
     * Gets the preset file path
     */
    function getPresetFile() {
        var presetFolder = getPresetFolder();
        var presetFile = new File(presetFolder.absoluteURI + "/" + PRESET_FILE_NAME);
        return presetFile;
    }

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
     * Finds existing wiggle null layer in composition
     */
    function findWiggleNull(comp) {
        for (var i = 1; i <= comp.numLayers; i++) {
            var layer = comp.layer(i);
            if (layer.name === WIGGLE_NULL_NAME && layer.nullLayer) {
                return layer;
            }
        }
        return null;
    }

    /**
     * Finds the first camera layer in composition
     */
    function findCameraLayer(comp) {
        for (var i = 1; i <= comp.numLayers; i++) {
            var layer = comp.layer(i);
            if (layer instanceof CameraLayer) {
                return layer;
            }
        }
        return null;
    }

    /**
     * Creates or retrieves the wiggle null controller
     */
    function getOrCreateWiggleNull(comp) {
        var wiggleNull = findWiggleNull(comp);
        
        if (!wiggleNull) {
            wiggleNull = comp.layers.addNull(comp.duration);
            wiggleNull.name = WIGGLE_NULL_NAME;
            
            // Position null above camera layer
            var cameraLayer = findCameraLayer(comp);
            if (cameraLayer) {
                wiggleNull.moveBefore(cameraLayer);
            }
        }
        
        return wiggleNull;
    }

    /**
     * Checks if a layer can have effects applied to it
     */
    function canLayerHaveEffects(layer) {
        if (!layer) return false;
        
        // Camera and Light layers cannot have effects
        if (layer instanceof CameraLayer) return false;
        if (layer instanceof LightLayer) return false;
        
        // Check if layer has Effects property
        try {
            var effects = layer.property("Effects");
            return effects !== null;
        } catch (e) {
            return false;
        }
    }

    /**
     * Configures the wiggle control layer with effect
     */
    function configureWiggleController(controlLayer, effectName) {
        // Set anchor point if it's a null layer
        if (controlLayer.nullLayer) {
            controlLayer.property("Anchor Point").setValue(ANCHOR_POINT_VALUE);
        }
        
        // Apply preset if not already applied
        if (!controlLayer.effect(effectName)) {
            // Extract preset from BASE64 if needed
            var presetFile = extractPresetFromBase64();
            
            if (!presetFile) {
                presetFile = getPresetFile();
            }
            
            if (presetFile && presetFile.exists) {
                try {
                    controlLayer.applyPreset(presetFile);
                    // Rename the effect to match the property
                    var lastEffect = controlLayer.property("Effects").property(controlLayer.property("Effects").numProperties);
                    if (lastEffect) {
                        lastEffect.name = effectName;
                    }
                } catch (e) {
                    alert("Error applying preset: " + e.toString());
                }
            } else {
                alert("Preset file not found. Please ensure the script is properly configured.");
            }
        }
    }

    /**
     * Gets the property name for display
     */
    function getPropertyDisplayName(property) {
        return property.name;
    }

    /**
     * Applies wiggle expression to a property
     */
    function applyWiggleToProperty(property, propertyName, controlLayerName) {
        try {
            if (property.canSetExpression) {
                property.expression = createWiggleExpression(propertyName, controlLayerName);
                return true;
            }
        } catch (e) {
            alert("Error applying expression to " + propertyName + ": " + e.toString());
        }
        return false;
    }

    /**
     * Gets selected properties or default camera property
     */
    function getPropertiesToWiggle(comp) {
        var properties = [];
        
        // Check if specific properties are selected
        if (comp.selectedProperties.length > 0) {
            for (var i = 0; i < comp.selectedProperties.length; i++) {
                var prop = comp.selectedProperties[i];
                if (prop.canSetExpression) {
                    properties.push({
                        property: prop,
                        name: getPropertyDisplayName(prop),
                        layer: prop.propertyGroup(prop.propertyDepth)
                    });
                }
            }
        } 
        // If no properties selected but layer is camera, default to Point of Interest
        else if (comp.selectedLayers.length > 0) {
            var selectedLayer = comp.selectedLayers[0];
            if (selectedLayer instanceof CameraLayer) {
                var pointOfInterest = selectedLayer.property("Point of Interest");
                if (pointOfInterest) {
                    properties.push({
                        property: pointOfInterest,
                        name: "Point of Interest",
                        layer: selectedLayer
                    });
                }
            } else {
                alert("Please select specific properties or a camera layer.");
            }
        }
        
        return properties;
    }

    /**
     * Main execution function
     */
    function main() {
        var comp = app.project.activeItem;
        
        if (!validateSelection(comp)) {
            return;
        }
        
        // Get properties to apply wiggle to
        var propertiesToWiggle = getPropertiesToWiggle(comp);
        
        if (propertiesToWiggle.length === 0) {
            alert("No valid properties selected.");
            return;
        }
        
        // Apply wiggle to each property
        for (var i = 0; i < propertiesToWiggle.length; i++) {
            var propInfo = propertiesToWiggle[i];
            var effectName = "Wiggle - " + propInfo.name;
            var controlLayer;
            var controlLayerName;
            
            // Determine if we should use the layer itself or create a null
            if (canLayerHaveEffects(propInfo.layer)) {
                // Use the layer itself as the controller
                controlLayer = propInfo.layer;
                controlLayerName = controlLayer.name;
            } else {
                // Create or get WIGGLE null layer
                controlLayer = getOrCreateWiggleNull(comp);
                controlLayerName = WIGGLE_NULL_NAME;
            }
            
            // Configure the control layer with the effect
            configureWiggleController(controlLayer, effectName);
            
            // Apply wiggle expression to the property
            applyWiggleToProperty(propInfo.property, propInfo.name, controlLayerName);
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