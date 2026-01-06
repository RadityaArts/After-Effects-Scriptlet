/**
 * @name Camera_Focus_Controller
 * @version 1.2
 * ================================
 * Adds a focus controller to the selected camera layer
 * 
 * Usage: Select camera layer and run the script
 * 
 * @author ©RadityaArts
 */

(function() {
    'use strict';
    
    // Constants
    var SCRIPT_NAME = "Add Camera Focus Controller";
    var FOCUS_CONTROL_NAME = "FOCUS CONTROL";
    var ANCHOR_POINT = [50, 50, 0];
    
    /**
     * Validates the composition and selected layer
     */
    function validateSelection() {
        var comp = app.project.activeItem;
        
        if (!comp || !(comp instanceof CompItem)) {
            alert("Please select a composition.");
            return null;
        }
        
        if (comp.selectedLayers.length === 0) {
            alert("Please select a camera layer.");
            return null;
        }
        
        var selectedLayer = comp.selectedLayers[0];
        
        if (!(selectedLayer instanceof CameraLayer)) {
            alert("The selected layer must be a camera.");
            return null;
        }
        
        return {
            comp: comp,
            selectedLayer: selectedLayer
        };
    }
    
    /**
     * Enables Depth of Field on the camera if not already enabled
     */
    function enableDepthOfField(cameraLayer) {
        var depthOfFieldProp = cameraLayer.property("Camera Options").property("Depth of Field");
        
        if (!depthOfFieldProp.value) {
            depthOfFieldProp.setValue(true);
        }
    }
    
    /**
     * Creates and configures the focus control null object
     */
    function createFocusControl(comp, cameraLayer) {
        var nullLayer = comp.layers.addNull();
        nullLayer.name = FOCUS_CONTROL_NAME;
        nullLayer.threeDLayer = true;
        
        // Set anchor point
        nullLayer.property("Anchor Point").setValue(ANCHOR_POINT);
        
        // Center the null in the composition
        var centerPosition = [
            comp.width / 2,
            comp.height / 2,
            0
        ];
        nullLayer.property("Position").setValue(centerPosition);
        
        // Move null above the camera layer
        nullLayer.moveBefore(cameraLayer);
        
        return nullLayer;
    }
    
    /**
     * Returns the expression string for focus distance calculation
     */
    function getFocusDistanceExpression() {
        return [
            "// Automatically calculates Focus Distance to follow the layer 'FOCUS CONTROL'",
            "var usingLegacyEngine = !!$.version;",
            "",
            "try {",
            "    thisLayer('ADBE Transform Group')('ADBE Anchor Point').value;",
            "} catch(err) {",
            "    var quote = String.fromCharCode(34);",
            "    if (usingLegacyEngine) {",
            "        $.error = '' + quote + 'CAMERA' + quote + ' cannot be a One-Node camera';",
            "    } else {",
            "        throw '' + quote + 'CAMERA' + quote + ' cannot be a One-Node camera';",
            "    }",
            "}",
            "",
            "var targetLayer = thisComp.layer('FOCUS CONTROL');",
            "",
            "try {",
            "    targetLayer.transform.position[2];",
            "} catch(err) {",
            "    var quote = String.fromCharCode(34);",
            "    if (usingLegacyEngine) {",
            "        $.error = '' + quote + 'FOCUS CONTROL' + quote + ' cannot be a 2D layer. The Focus Distance of ' + quote + 'CAMERA' + quote + ' can only be set to follow 3D layers.';",
            "    } else {",
            "        throw '' + quote + 'FOCUS CONTROL' + quote + ' cannot be a 2D layer. The Focus Distance of ' + quote + 'CAMERA' + quote + ' can only be set to follow 3D layers.';",
            "    }",
            "}",
            "",
            "var cameraPosition = [transform.position[0] * thisComp.pixelAspect, transform.position[1], transform.position[2]];",
            "var cameraPoi = [transform.pointOfInterest[0] * thisComp.pixelAspect, transform.pointOfInterest[1], transform.pointOfInterest[2]];",
            "",
            "if (thisLayer.hasParent) {",
            "    cameraPosition = thisLayer.parent.toWorld(cameraPosition);",
            "    cameraPoi = thisLayer.parent.toWorld(cameraPoi);",
            "}",
            "",
            "var targetPosition = [targetLayer.transform.position[0] * thisComp.pixelAspect, targetLayer.transform.position[1], targetLayer.transform.position[2]];",
            "",
            "if (targetLayer.hasParent) {",
            "    targetPosition = targetLayer.parent.toWorld(targetLayer.transform.position);",
            "}",
            "",
            "var cameraVector = sub(cameraPoi, cameraPosition);",
            "",
            "if (length(cameraVector) != 0) {",
            "    cameraVector = normalize(cameraVector);",
            "}",
            "",
            "var targetVector = sub(targetPosition, cameraPosition);",
            "dot(targetVector, cameraVector);"
        ].join("\n");
    }
    
    /**
     * Links the camera's focus distance to the focus control null
     */
    function linkFocusDistance(cameraLayer) {
        var focusDistanceProp = cameraLayer.property("Camera Options").property("Focus Distance");
        focusDistanceProp.expression = getFocusDistanceExpression();
    }
    
    /**
     * Main execution function
     */
    function main() {
        app.beginUndoGroup(SCRIPT_NAME);
        
        try {
            var selection = validateSelection();
            if (!selection) {
                return;
            }
            
            var comp = selection.comp;
            var cameraLayer = selection.selectedLayer;
            
            enableDepthOfField(cameraLayer);
            createFocusControl(comp, cameraLayer);
            linkFocusDistance(cameraLayer);
            
        } catch (error) {
            alert("Error: " + error.toString());
        } finally {
            app.endUndoGroup();
        }
    }
    
    // Execute
    main();
    
})();