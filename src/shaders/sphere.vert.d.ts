declare module '@shaders/sphere.vert' {
    const sphere: string;

    type Uniforms = {
        uTime: number,
        uDistortionFrequency: number,
        uDistortionStrength: number,
        uDisplacementFrequency: number,
        uDisplacementStrength: number,
        uTimeScale: number
    };

    export {
        sphere as default,
        sphere as glsl,
        sphere,
        Uniforms,
        Uniforms as SphereUniforms
    };
}