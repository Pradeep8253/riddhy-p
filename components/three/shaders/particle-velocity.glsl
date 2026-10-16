// Lightweight curl-like acceleration pass; used by the optional high-tier GPGPU extension.
vec3 particleVelocity(vec3 p,vec3 pointer,float time){ vec3 curl=vec3(sin(p.y*1.7+time),cos(p.z*1.5-time*.8),sin(p.x*1.9+time*.6)); vec3 repel=p-pointer; return curl*.018+repel/(.12+dot(repel,repel))*.002; }
