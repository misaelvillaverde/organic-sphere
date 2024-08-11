declare module '@shaders/sphere.vert' {
    namespace THREE {
        export type Vector3 = { x: number, y: number, z: number, isVector3: true };
        export type Color = { r: number, g: number, b: number, isColor: true };
    }

    const sphere: string;

    type Uniforms = {
        uTime: number,
        uDistortionFrequency: number,
        uDistortionStrength: number,
        uDisplacementFrequency: number,
        uDisplacementStrength: number,
        uTimeScale: number,
        uSubdivisions: number,
        uFresnelOffset: number,
        uFresnelMultiplier: number,
        uFresnelPower: number,
        uLightAPosition: [number, number, number] | Float32Array | THREE.Vector3 | THREE.Color,
        uLightAColor: [number, number, number] | Float32Array | THREE.Vector3 | THREE.Color,
        uLightAIntensity: number,
        uLightBPosition: [number, number, number] | Float32Array | THREE.Vector3 | THREE.Color,
        uLightBColor: [number, number, number] | Float32Array | THREE.Vector3 | THREE.Color,
        uLightBIntensity: number
    };

    export {
        sphere as default,
        sphere as glsl,
        sphere,
        Uniforms,
        Uniforms as SphereUniforms
    };
}