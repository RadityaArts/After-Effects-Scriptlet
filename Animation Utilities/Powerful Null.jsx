/**
 * @name Powerful_Null
 * @version 2.0
 * ================================
 * Creates a control null object for the selected layer
 * 
 * Usage: Select layer(s) and run the script
 * 
 * @author ©RadityaArts
 */

(function() {
    'use strict';
    
    // ============================================================================
    // HELPER FUNCTIONS
    // ============================================================================
    
    /**
     * Get property value at last keyframe or current value
     */
    function getPropertyValue(property, lastKeyframeTime) {
        if (lastKeyframeTime > 0) {
            return property.valueAtTime(lastKeyframeTime, false);
        }
        return property.value;
    }
    
    /**
     * Find the last keyframe time from multiple properties
     */
    function getLastKeyframeTime(properties) {
        var maxTime = 0;
        
        for (var i = 0; i < properties.length; i++) {
            if (properties[i].numKeys > 0) {
                var keyTime = properties[i].keyTime(properties[i].numKeys);
                if (keyTime > maxTime) {
                    maxTime = keyTime;
                }
            }
        }
        
        return maxTime;
    }
    
    /**
     * Calculate rotation from camera direction vector
     */
    function calculateCameraRotation(cameraPosition, pointOfInterest) {
        var directionVector = [
            pointOfInterest[0] - cameraPosition[0],
            pointOfInterest[1] - cameraPosition[1],
            pointOfInterest[2] - cameraPosition[2]
        ];
        
        var rotationX = -Math.atan2(directionVector[1], directionVector[2]) * (180 / Math.PI);
        var rotationY = Math.atan2(
            directionVector[0],
            Math.sqrt(Math.pow(directionVector[1], 2) + Math.pow(directionVector[2], 2))
        ) * (180 / Math.PI);
        
        return {
            x: rotationX,
            y: rotationY
        };
    }
    
    /**
     * Set up null control for camera layer
     */
    function setupCameraNull(targetLayer, cameraLayer) {
        var cameraPosition = cameraLayer.property("Position").value;
        var pointOfInterest = cameraLayer.property("Point of Interest").value;
        var rotation = calculateCameraRotation(cameraPosition, pointOfInterest);
        
        // Set position to camera's Point of Interest
        targetLayer.property("Position").setValue(pointOfInterest);
        
        // Apply calculated rotation
        targetLayer.property("X Rotation").setValue(rotation.x);
        targetLayer.property("Y Rotation").setValue(rotation.y);
        targetLayer.property("Z Rotation").setValue(cameraLayer.property("Z Rotation").value);
    }
    
    /**
     * Set up null control for regular layer
     */
    function setupRegularNull(targetLayer, sourceLayer) {
        var props = {
            position: sourceLayer.property("Position"),
            rotationX: sourceLayer.property("X Rotation"),
            rotationY: sourceLayer.property("Y Rotation"),
            rotationZ: sourceLayer.property("Z Rotation"),
            orientation: sourceLayer.property("Orientation")
        };
        
        // Find last keyframe time
        var lastKeyframeTime = getLastKeyframeTime([
            props.position,
            props.rotationX,
            props.rotationY,
            props.rotationZ,
            props.orientation
        ]);
        
        // Get property values at last keyframe or current time
        var positionValue = getPropertyValue(props.position, lastKeyframeTime);
        var rotationXValue = getPropertyValue(props.rotationX, lastKeyframeTime);
        var rotationYValue = getPropertyValue(props.rotationY, lastKeyframeTime);
        var rotationZValue = getPropertyValue(props.rotationZ, lastKeyframeTime);
        var orientationValue = getPropertyValue(props.orientation, lastKeyframeTime);
        
        // Apply values to target null
        targetLayer.property("Position").setValue([
            positionValue[0],
            positionValue[1],
            positionValue[2]
        ]);
        targetLayer.property("X Rotation").setValue(rotationXValue);
        targetLayer.property("Y Rotation").setValue(rotationYValue);
        targetLayer.property("Z Rotation").setValue(rotationZValue);
        targetLayer.property("Orientation").setValue(orientationValue);
    }
    
    /**
     * Create and configure null control layer
     */
    function createNullControl(sourceLayer) {
        var comp = app.project.activeItem;
        var nullLayer = comp.layers.addNull();
        
        // Configure null layer
        nullLayer.threeDLayer = true;
        nullLayer.name = "NULL CONTROL";
        nullLayer.property("Anchor Point").setValue([50, 50, 0]);
        
        // Set up null based on source layer type
        if (sourceLayer instanceof CameraLayer) {
            setupCameraNull(nullLayer, sourceLayer);
        } else {
            setupRegularNull(nullLayer, sourceLayer);
        }
        
        // Position null in layer stack and parent source layer
        nullLayer.moveBefore(sourceLayer);
        sourceLayer.parent = nullLayer;
        
        return nullLayer;
    }
    
    // ============================================================================
    // MAIN EXECUTION
    // ============================================================================
    
    app.beginUndoGroup("Add Powerful Camera Null");
    
    try {
        var activeComp = app.project.activeItem;
        
        if (!activeComp || !(activeComp instanceof CompItem)) {
            alert("Please select a composition.");
            return;
        }
        
        if (activeComp.selectedLayers.length === 0) {
            alert("Please select a layer.");
            return;
        }
        
        var selectedLayer = activeComp.selectedLayers[0];
        createNullControl(selectedLayer);
        
    } catch (error) {
        alert("Error: " + error.toString());
    } finally {
        app.endUndoGroup();
    }
    
})();