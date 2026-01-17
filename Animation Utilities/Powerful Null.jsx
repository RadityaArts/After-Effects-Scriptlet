/**
 * @name Powerful_Null
 * @version 2.1
 * ================================
 * Creates a control null object for the selected layer(s)
 * 
 * Features:
 * - Single layer: Creates null at layer position and parents it
 * - Multiple layers: Creates null at center of bounding box of all layers
 * - Supports masked layers (uses mask bounds)
 * - Supports 3D layers
 * - Accounts for rotation, scale, and anchor point transforms
 * 
 * @author ©RadityaArts
 */

(function() {
    'use strict';
    
    // ============================================================================
    // HELPER FUNCTIONS
    // ============================================================================
    
    /**
     * Transform a point from layer space to composition space
     */
    function transformPoint(point, position, anchorPoint, scale, rotationZ) {
        // Translate by anchor point
        var x = point[0] - anchorPoint[0];
        var y = point[1] - anchorPoint[1];
        
        // Apply scale
        x = x * scale[0] / 100;
        y = y * scale[1] / 100;
        
        // Apply rotation (Z rotation in 2D)
        var angle = rotationZ * Math.PI / 180;
        var cos = Math.cos(angle);
        var sin = Math.sin(angle);
        var rotX = x * cos - y * sin;
        var rotY = x * sin + y * cos;
        
        // Translate to position
        return [position[0] + rotX, position[1] + rotY];
    }
    
    /**
     * Calculate bounds of mask vertices (simple approach for mask bounds)
     */
    function getMaskBounds(maskPath) {
        if (!maskPath.vertices || maskPath.vertices.length === 0) {
            return null;
        }
        
        var vertices = maskPath.vertices;
        var minX = vertices[0][0];
        var maxX = vertices[0][0];
        var minY = vertices[0][1];
        var maxY = vertices[0][1];
        
        for (var i = 1; i < vertices.length; i++) {
            if (vertices[i][0] < minX) minX = vertices[i][0];
            if (vertices[i][0] > maxX) maxX = vertices[i][0];
            if (vertices[i][1] < minY) minY = vertices[i][1];
            if (vertices[i][1] > maxY) maxY = vertices[i][1];
        }
        
        return {
            left: minX,
            right: maxX,
            top: minY,
            bottom: maxY
        };
    }
    
    /**
     * Get the visual bounding box of a layer, accounting for all transformations
     */
    function getLayerBoundsWithMasks(layer, time) {
        var sourceRect = layer.sourceRectAtTime(time, false);
        
        var layerLeft = sourceRect.left;
        var layerTop = sourceRect.top;
        var layerRight = sourceRect.left + sourceRect.width;
        var layerBottom = sourceRect.top + sourceRect.height;
        
        // Check for masks and use mask bounds instead of source bounds
        if (layer.property("ADBE Mask Parade") && layer.property("ADBE Mask Parade").numProperties > 0) {
            var masks = layer.property("ADBE Mask Parade");
            var hasMask = false;
            var combinedLeft = Infinity;
            var combinedRight = -Infinity;
            var combinedTop = Infinity;
            var combinedBottom = -Infinity;
            
            for (var m = 1; m <= masks.numProperties; m++) {
                var mask = masks.property(m);
                if (mask.property("ADBE Mask Shape").enabled) {
                    var maskPath = mask.property("ADBE Mask Shape").valueAtTime(time, false);
                    var maskBounds = getMaskBounds(maskPath);
                    
                    if (maskBounds) {
                        hasMask = true;
                        combinedLeft = Math.min(combinedLeft, maskBounds.left);
                        combinedRight = Math.max(combinedRight, maskBounds.right);
                        combinedTop = Math.min(combinedTop, maskBounds.top);
                        combinedBottom = Math.max(combinedBottom, maskBounds.bottom);
                    }
                }
            }
            
            // Use mask bounds if we found any
            if (hasMask) {
                layerLeft = combinedLeft;
                layerRight = combinedRight;
                layerTop = combinedTop;
                layerBottom = combinedBottom;
            }
        }
        
        return {
            layerLeft: layerLeft,
            layerTop: layerTop,
            layerRight: layerRight,
            layerBottom: layerBottom
        };
    }
    
    /**
     * Get the visual bounding box of a layer in composition space
     * Returns { left, right, top, bottom, front, back } for 3D support
     */
    function getLayerBounds(layer, comp) {
        var time = comp.time;
        
        // Get transform properties
        var position = layer.property("Position").valueAtTime(time, false);
        var anchorPoint = layer.property("Anchor Point").valueAtTime(time, false);
        var scale = layer.property("Scale").valueAtTime(time, false);
        var rotationZ = layer.property("Z Rotation").valueAtTime(time, false);
        
        // Get layer bounds (accounting for masks)
        var layerBounds = getLayerBoundsWithMasks(layer, time);
        var layerLeft = layerBounds.layerLeft;
        var layerTop = layerBounds.layerTop;
        var layerRight = layerBounds.layerRight;
        var layerBottom = layerBounds.layerBottom;
        
        // Transform all four corners from layer space to composition space
        var topLeft = transformPoint([layerLeft, layerTop], position, anchorPoint, scale, rotationZ);
        var topRight = transformPoint([layerRight, layerTop], position, anchorPoint, scale, rotationZ);
        var bottomLeft = transformPoint([layerLeft, layerBottom], position, anchorPoint, scale, rotationZ);
        var bottomRight = transformPoint([layerRight, layerBottom], position, anchorPoint, scale, rotationZ);
        
        // Find bounding box of transformed corners
        var compLeft = Math.min(topLeft[0], topRight[0], bottomLeft[0], bottomRight[0]);
        var compRight = Math.max(topLeft[0], topRight[0], bottomLeft[0], bottomRight[0]);
        var compTop = Math.min(topLeft[1], topRight[1], bottomLeft[1], bottomRight[1]);
        var compBottom = Math.max(topLeft[1], topRight[1], bottomLeft[1], bottomRight[1]);
        
        var bounds = {
            left: compLeft,
            right: compRight,
            top: compTop,
            bottom: compBottom,
            front: 0,
            back: 0
        };
        
        // Handle 3D layers
        if (layer.threeDLayer) {
            var posZ = position.length > 2 ? position[2] : 0;
            bounds.front = posZ;
            bounds.back = posZ;
        }
        
        return bounds;
    }
    
    /**
     * Calculate the combined bounding box of multiple layers
     */
    function getCombinedBounds(layers, comp) {
        if (layers.length === 0) return null;
        
        var firstBounds = getLayerBounds(layers[0], comp);
        var combined = {
            left: firstBounds.left,
            right: firstBounds.right,
            top: firstBounds.top,
            bottom: firstBounds.bottom,
            front: firstBounds.front,
            back: firstBounds.back
        };
        
        // Expand bounds to include all layers
        for (var i = 1; i < layers.length; i++) {
            var bounds = getLayerBounds(layers[i], comp);
            
            combined.left = Math.min(combined.left, bounds.left);
            combined.right = Math.max(combined.right, bounds.right);
            combined.top = Math.min(combined.top, bounds.top);
            combined.bottom = Math.max(combined.bottom, bounds.bottom);
            combined.front = Math.min(combined.front, bounds.front);
            combined.back = Math.max(combined.back, bounds.back);
        }
        
        return combined;
    }
    
    /**
     * Check if any of the selected layers is a 3D layer
     */
    function hasAny3DLayer(layers) {
        for (var i = 0; i < layers.length; i++) {
            if (layers[i].threeDLayer) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * Create null at center of bounding box for multiple layers
     */
    function createBoundingBoxNull(layers, comp) {
        var bounds = getCombinedBounds(layers, comp);
        
        if (!bounds) {
            alert("Could not calculate bounding box.");
            return null;
        }
        
        // Calculate center position
        var centerX = (bounds.left + bounds.right) / 2;
        var centerY = (bounds.top + bounds.bottom) / 2;
        var centerZ = (bounds.front + bounds.back) / 2;
        
        // Create null layer
        var nullLayer = comp.layers.addNull();
        nullLayer.name = "NULL CONTROL";
        nullLayer.property("Anchor Point").setValue([50, 50, 0]);
        
        // Check if we need 3D
        var is3D = hasAny3DLayer(layers);
        nullLayer.threeDLayer = is3D;
        
        // Set position at center of bounding box
        if (is3D) {
            nullLayer.property("Position").setValue([centerX, centerY, centerZ]);
        } else {
            nullLayer.property("Position").setValue([centerX, centerY]);
        }
        
        // Find the topmost selected layer (lowest index = highest in stack)
        var topmostLayer = layers[0];
        for (var i = 1; i < layers.length; i++) {
            if (layers[i].index < topmostLayer.index) {
                topmostLayer = layers[i];
            }
        }
        
        // Move null just above the topmost selected layer
        nullLayer.moveBefore(topmostLayer);
        
        // Parent all selected layers to the null
        for (var j = 0; j < layers.length; j++) {
            layers[j].parent = nullLayer;
        }
        
        return nullLayer;
    }
    
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
    
    app.beginUndoGroup("Add Powerful Null Control");
    
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
        
        var selectedLayers = activeComp.selectedLayers;
        
        // Check if multiple layers are selected
        if (selectedLayers.length > 1) {
            // Create null at center of bounding box for multiple layers
            createBoundingBoxNull(selectedLayers, activeComp);
        } else {
            // Single layer - use original behavior
            var selectedLayer = selectedLayers[0];
            createNullControl(selectedLayer);
        }
        
    } catch (error) {
        alert("Error: " + error.toString());
    } finally {
        app.endUndoGroup();
    }
    
})();
