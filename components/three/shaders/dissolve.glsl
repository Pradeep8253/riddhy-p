// Thresholded dissolve used for procedural material transitions.
float dissolveMask(float noiseValue,float progress,float feather){ return smoothstep(progress-feather,progress+feather,noiseValue); }
