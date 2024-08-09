#pragma glslify: perlin3d = require('./partials/perlin3d');
#pragma glslify: perlin4d = require('./partials/perlin4d');

uniform float uTime;

varying vec3 vNormal;
varying float vPerlinStrength;

void main() {
        float uDistortionFrequency = 2.;
        float uDistortionStrength = 1.;

        float uDisplacementFrequency = 2.;
        float uDisplacementStrength = .2;

        vec3 displacementPosition = position;
        displacementPosition += perlin4d(vec4(displacementPosition * uDistortionFrequency, uTime * 0.12)) * uDistortionStrength;

        float perlinStrength = perlin4d(vec4(displacementPosition * uDisplacementFrequency, uTime * 0.1)) * uDisplacementStrength;

        vec3 newPosition = position;

        newPosition += normal * perlinStrength;

        vec4 viewPosition = viewMatrix * vec4(newPosition, 1.0);
        gl_Position = projectionMatrix * viewPosition;

        vNormal = normal;
        vPerlinStrength = perlinStrength;
}
