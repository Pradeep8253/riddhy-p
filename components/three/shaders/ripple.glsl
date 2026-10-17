// Gentle radial ripple for a hovered product image plane.
float ripple(vec2 uv,vec2 center,float time){ float d=length(uv-center); return sin(d*34.0-time*5.0)*exp(-d*7.0); }
