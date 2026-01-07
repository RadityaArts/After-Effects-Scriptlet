# Animation Utilities

Utility scripts for animation workflow and keyframe management.

## Scripts

### [Elastic Controller](Elastic%20Controller/)
Adds or removes an elastic controller on selected properties, wiring expressions to an auto-applied effect preset for per-property control.

**Usage:** 
- Add: select one or more properties and run the script.
- Remove: select elastic-driven properties/effects or layers that already have elastic controllers, then run the script.

**Features:**
- Per-property controls: Frequency, Amplitude, Decay
- Safely detects and removes linked elastic effects/expressions
- Auto-creates an “ELASTIC” null when the target layer can’t host effects
- Preset auto-installed

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
Adds or removes a wiggle controller on selected properties (or a camera’s Point of Interest), wiring expressions to an auto-applied effect preset for per-property control.

**Usage:** 
- Add: select one or more properties (or a camera layer) and run the script.
- Remove: select wiggle-driven properties/effects or layers that already have wiggles, then run the script.

**Features:**
- Per-property controls: Frequency, Amplitude, Octaves, Intensity, Seed
- Loopable wiggle toggle
- Auto-creates a “WIGGLE” null when the target layer can’t host effects
- Safely detects and removes linked wiggle effects/expressions
- Preset auto-installed
