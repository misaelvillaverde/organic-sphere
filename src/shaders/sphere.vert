#pragma glslify: perlin3d = require('./partials/perlin3d');
#pragma glslify: perlin4d = require('./partials/perlin4d');

#define M_PI 3.1415926535897932384626433832795

uniform float uTime;
uniform float uDistortionFrequency;
uniform float uDistortionStrength;
uniform float uDisplacementFrequency;
uniform float uDisplacementStrength;
uniform float uTimeScale;

uniform vec3 uLightAPosition;
uniform vec3 uLightAColor;
uniform float uLightAIntensity;
uniform vec3 uLightBPosition;
uniform vec3 uLightBColor;
uniform float uLightBIntensity;

varying vec3 vNormal;
varying vec3 vColor;
varying float vPerlinStrength;

vec3 getDisplacedPosition(vec3 _position, out float perlinStrength) {
        vec3 displacementPosition = _position;
        displacementPosition += perlin4d(vec4(displacementPosition * uDistortionFrequency, uTime * uTimeScale)) * uDistortionStrength;
        perlinStrength = perlin4d(vec4(displacementPosition * uDisplacementFrequency, uTime * uTimeScale));

        vec3 displacedPosition = _position;
        displacedPosition += normalize(_position) * perlinStrength * uDisplacementStrength;
        return displacedPosition;
}

void main() {
        // position
        float perlinStrength = 0.;
        vec3 displacedPosition = getDisplacedPosition(position, perlinStrength);
        vec4 viewPosition = viewMatrix * vec4(displacedPosition.xyz, 1.);
        gl_Position = projectionMatrix * viewPosition;

        // bi tangents
        float circunference = 2. * M_PI;
        float subdivisions = 512.;
        float neighborTangentDistance = circunference / subdivisions;

        vec3 biTangent = cross(normal, tangent.xyz);
        vec3 neighborTangent = position + tangent.xyz * neighborTangentDistance;

        // color
        float lightAIntensity = max(0., -dot(normal, normalize(-uLightAPosition))) * uLightAIntensity;
        float lightBIntensity = max(0., -dot(normal, normalize(-uLightBPosition))) * uLightBIntensity;

        vec3 color = vec3(0.);
        color = mix(color, uLightAColor, lightAIntensity);
        color = mix(color, uLightBColor, lightBIntensity);

        // varying
        vNormal = normal;
        vPerlinStrength = perlinStrength;
        vColor = color;
}
