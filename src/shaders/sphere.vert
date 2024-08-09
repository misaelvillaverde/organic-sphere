#pragma glslify: perlin3d = require('./partials/perlin3d');
#pragma glslify: perlin4d = require('./partials/perlin4d');

uniform float uTime;
uniform float uDistortionFrequency;
uniform float uDistortionStrength;
uniform float uDisplacementFrequency;
uniform float uDisplacementStrength;
uniform float uTimeScale;

varying vec3 vNormal;
varying float vPerlinStrength;

void main() {
        vec3 displacementPosition = position;
        displacementPosition += perlin4d(vec4(displacementPosition * uDistortionFrequency, uTime * uTimeScale)) * uDistortionStrength;

        float perlinStrength = perlin4d(vec4(displacementPosition * uDisplacementFrequency, uTime * uTimeScale)) * uDisplacementStrength;

        vec3 newPosition = position;

        newPosition += normal * perlinStrength;

        vec4 viewPosition = viewMatrix * vec4(newPosition, 1.0);
        gl_Position = projectionMatrix * viewPosition;

        vNormal = normal;
        vPerlinStrength = perlinStrength;
}
