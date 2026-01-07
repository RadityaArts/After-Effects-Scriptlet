/**
 * @name Hold_Keyframes
 * @version 1.0
 * ================================
 * Sets selected keyframes of selected properties to Hold interpolation
 * 
 * Usage: Select keyframe(s) and run the script
 * 
 * @author RadityaArts
 */

function setHold() {
  var comp = app.project.activeItem;
  
  if (!(comp instanceof CompItem)) {
    alert("Please select a composition.");
    return;
  }
  
  if (comp.selectedLayers.length === 0) {
    alert("Please select at least one layer.");
    return;
  }
  
  app.beginUndoGroup("Hold");
  
  for (var i = 0; i < comp.selectedLayers.length; i++) {
    var properties = comp.selectedLayers[i].selectedProperties;
    
    for (var j = 0; j < properties.length; j++) {
      var prop = properties[j];

      if (prop.canVaryOverTime && prop.numKeys > 0) {
        var keys = prop.selectedKeys;
        
        for (var k = 0; k < keys.length; k++) {
          prop.setInterpolationTypeAtKey(keys[k], KeyframeInterpolationType.HOLD);
        }
      }
    }
  }
  
  app.endUndoGroup();
}

setHold();