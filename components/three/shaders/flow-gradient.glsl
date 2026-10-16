// Scroll a warm gold-to-sage flow along the monogram orbit.
vec3 flowGradient(float u,float time){ float t=fract(u-time*.08); return mix(vec3(.93,.63,.21),vec3(.16,.39,.22),smoothstep(.26,.9,t)); }
