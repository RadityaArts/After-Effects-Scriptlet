/**
 * @name Fit_to_Comp_Width
 * @version 1.0
 * ================================
 * Scales selected layers to fit the composition width while maintaining aspect ratio
 * Handles rotation and mask bounds automatically
 * 
 * Usage: Select layer(s) and run the script
 * 
 * @author ©RadityaArts
 */
(function fitToCompWidth() {
    'use strict';

    // ========== HELPER FUNCTIONS ==========

    /**
     * Calculate mask bounds for a layer
     */
    function getMaskBounds(layer) {
        var maskGroup = layer.property("Masks");
        var pixelAspect = layer.containingComp.pixelAspect;
        var minX = Number.MAX_VALUE;
        var minY = Number.MAX_VALUE;
        var maxX = Number.MIN_VALUE;
        var maxY = Number.MIN_VALUE;

        for (var j = 1; j <= maskGroup.numProperties; j++) {
            var maskShape = maskGroup.property(j).property("maskShape").value;

            for (var k = 0; k < maskShape.vertices.length; k++) {
                var vertex = maskShape.vertices[k];
                minX = Math.min(minX, vertex[0]);
                minY = Math.min(minY, vertex[1]);
                maxX = Math.max(maxX, vertex[0]);
                maxY = Math.max(maxY, vertex[1]);
            }
        }

        return {
            width: (maxX - minX) * pixelAspect,
            height: (maxY - minY) * pixelAspect
        };
    }

    /**
     * Set property value, respecting existing keyframes
     */
    function setPropertyValue(prop, value, time) {
        if (prop.isTimeVarying) {
            prop.setValueAtTime(time, value);
        } else {
            prop.setValue(value);
        }
    }

    /**
     * Calculate adjusted width accounting for rotation
     */
    function getAdjustedWidth(bounds, rotation) {
        var angleInRadians = rotation * (Math.PI / 180);
        return Math.abs(bounds.width * Math.cos(angleInRadians)) +
               Math.abs(bounds.height * Math.sin(angleInRadians));
    }

    /**
     * Get layer bounds (uses mask bounds if masks exist)
     */
    function getLayerBounds(layer, time) {
        var masks = layer.property("Masks");
        if (masks && masks.numProperties > 0) {
            return getMaskBounds(layer);
        }
        return layer.sourceRectAtTime(time, false);
    }

    // ========== MAIN SCRIPT ==========

    // Validate active composition
    var comp = app.project.activeItem;
    if (!(comp && comp instanceof CompItem)) {
        alert("Please select a composition.");
        return;
    }

    // Validate layer selection
    var selectedLayers = comp.selectedLayers;
    if (selectedLayers.length === 0) {
        alert("Please select at least one layer.");
        return;
    }

    app.beginUndoGroup("Fit to Comp Width");

    try {
        // Process each selected layer
        for (var i = 0; i < selectedLayers.length; i++) {
            var layer = selectedLayers[i];
            var centerPosition = [comp.width / 2, comp.height / 2];

            // Center layer in composition
            setPropertyValue(
                layer.property("Position"),
                centerPosition,
                comp.time
            );

            // Get layer dimensions
            var bounds = getLayerBounds(layer, comp.time);
            var rotation = layer.property("Rotation").value;
            var adjustedWidth = getAdjustedWidth(bounds, rotation);

            // Calculate and apply scale to fit comp width
            var scaleFactor = (comp.width / adjustedWidth) * 100;
            setPropertyValue(
                layer.property("Scale"),
                [scaleFactor, scaleFactor],
                comp.time
            );
        }
    } catch (error) {
        alert("Error: " + error.toString());
    } finally {
        app.endUndoGroup();
    }
})();