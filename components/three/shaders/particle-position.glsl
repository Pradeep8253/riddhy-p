// Integrate particle position after the velocity pass.
vec3 integratePosition(vec3 p,vec3 velocity,float delta){ return p+velocity*min(delta,.033); }
