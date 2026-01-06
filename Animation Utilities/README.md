# Animation Utilities

Utility scripts for animation workflow and keyframe management.

## Scripts

### [Powerful Null](Powerful%20Null.jsx)
Creates a powerful null object that matches the position and rotation of the selected layer, or matches camera orientation if a camera is selected.

**Usage:** Select a layer or camera and run the script.

**Features:**
- Works with cameras and regular layers
- Matches position, rotation, and orientation
- Automatically enables 3D for null object
- Captures keyframe values at last keyframe time
- Special handling for camera Point of Interest

---

### [Set Hold Keyframes](Set%20Hold%20Keyframe.jsx)
Converts selected keyframes to hold interpolation for stepped animation effects.

**Usage:** Select properties with keyframes and run the script. Only the selected keyframes will be converted.

**Features:**
- Works on multiple layers simultaneously
- Converts only selected keyframes
- Supports all property types that allow interpolation

---

### [Set Linear Keyframes](Set%20Linear%20Keyframe.jsx)
Converts selected keyframes to linear interpolation for constant-speed animation.

**Usage:** Select properties with keyframes and run the script. Only the selected keyframes will be converted.

**Features:**
- Works on multiple layers simultaneously
- Converts only selected keyframes
- Supports all property types that allow interpolation


---


### [Wiggle Controller](Wiggle%20Controller/)
Adds a controllable wiggle expression to layer properties with adjustable parameters through an effect controller.

**Usage:** Select a properties layer and run the script.

**Features:**
- Adjustable frequency, amplitude, octaves, and intensity
- Random seed control for reproducible randomness
