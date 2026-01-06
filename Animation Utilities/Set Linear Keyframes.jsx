/**
 * @name Linear_Keyframes
 * @version 1.0
 * ================================
 * Sets selected keyframes of selected properties to Linear interpolation
 * 
 * Usage: Select keyframe(s) and run the script
 * 
 * @author RadityaArts
 */

function setLinear() {
  var comp = app.project.activeItem;
  
  if (!(comp instanceof CompItem)) {
    alert("Please select a composition.");
    return;
  }
  
  if (comp.selectedLayers.length === 0) {
    alert("Please select at least one layer.");
    return;
  }
  
  app.beginUndoGroup("Linear");
  
  for (var i = 0; i < comp.selectedLayers.length; i++) {
    var properties = comp.selectedLayers[i].selectedProperties;
    
    for (var j = 0; j < properties.length; j++) {
      var keys = properties[j].selectedKeys;
      
      for (var k = 0; k < keys.length; k++) {
        properties[j].setInterpolationTypeAtKey(keys[k], KeyframeInterpolationType.LINEAR);
      }
    }
  }
  
  app.endUndoGroup();
}

setLinear();