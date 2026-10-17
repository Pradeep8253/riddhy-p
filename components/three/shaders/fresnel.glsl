// Gold edge light for beveled RF geometry.
float fresnelTerm(vec3 normal, vec3 viewDir){ return pow(1.0-max(dot(normalize(normal),normalize(viewDir)),0.0),3.2); }
