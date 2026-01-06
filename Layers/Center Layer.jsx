/**
 * @name Center_Layer
 * @version 1.2
 * ================================
 * Centers the anchor point and position of selected layers within the composition
 * 
 * Usage: Select layer(s) and run the script
 * 
 * @author RadityaArts
 */

(function centerAnchorAndPosition() {
    "use strict";

    // Constants
    var SCRIPT_NAME = "Center Anchor Point and Position";
    var PROPERTY_ANCHOR_POINT = "Anchor Point";
    var PROPERTY_POSITION = "Position";
    var Z_POSITION_INDEX = 2;

    /**
     * Validates the current After Effects environment
     */
    function validateEnvironment() {
        if (app.project === null) {
            alert("Please open a project first.");
            return null;
        }

        var comp = app.project.activeItem;
        if (!(comp instanceof CompItem)) {
            alert("Please select a composition.");
            return null;
        }

        if (comp.selectedLayers.length === 0) {
            alert("Please select one or more layers.");
            return null;
        }

        return comp;
    }

    /**
     * Checks if a layer has the required properties for centering
     */
    function hasRequiredProperties(layer) {
        return layer.property(PROPERTY_ANCHOR_POINT) && layer.property(PROPERTY_POSITION);
    }

    /**
     * Calculates the center point of a layer in its own coordinate space
     */
    function calculateLayerCenter(layer, time) {
        var rect = layer.sourceRectAtTime(time, false);
        return [
            rect.left + rect.width / 2,
            rect.top + rect.height / 2
        ];
    }

    /**
     * Centers a single layer's anchor point and position
     */
    function centerLayer(layer, comp) {
        if (!hasRequiredProperties(layer)) {
            return;
        }

        // Calculate and set anchor point to layer center
        var layerCenter = calculateLayerCenter(layer, comp.time);
        layer.property(PROPERTY_ANCHOR_POINT).setValue(layerCenter);

        // Get current position to preserve Z-axis value
        var currentPosition = layer.property(PROPERTY_POSITION).value;

        // Set position to composition center (preserve Z position for 3D layers)
        layer.property(PROPERTY_POSITION).setValue([
            comp.width / 2,
            comp.height / 2,
            currentPosition[Z_POSITION_INDEX]
        ]);
    }

    /**
     * Main execution function
     */
    function main() {
        var comp = validateEnvironment();
        if (!comp) {
            return;
        }

        app.beginUndoGroup(SCRIPT_NAME);

        try {
            var selectedLayers = comp.selectedLayers;
            for (var i = 0; i < selectedLayers.length; i++) {
                centerLayer(selectedLayers[i], comp);
            }
        } finally {
            app.endUndoGroup();
        }
    }

    // Execute script
    main();
})();