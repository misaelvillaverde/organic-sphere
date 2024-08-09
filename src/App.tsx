import * as THREE from "three";
import { useMemo, useRef } from "react";

import { OrbitControls, shaderMaterial } from "@react-three/drei";
import {
  Canvas,
  extend,
  type Object3DNode,
  useFrame,
} from "@react-three/fiber";
import { useControls } from "leva";

import sphereFrag from "@shaders/sphere.frag";
import sphereVert from "@shaders/sphere.vert";

type SphereUniforms = {
  uDistortionFrequency: number;
  uDistortionStrength: number;
  uDisplacementFrequency: number;
  uDisplacementStrength: number;
  uTimeScale: number;
  uTime: number;
};

const SphereShader = shaderMaterial(
  {
    uDistortionFrequency: 2,
    uDistortionStrength: 1,
    uDisplacementFrequency: 2,
    uDisplacementStrength: 0.2,
    uTimeScale: 0.1,
    uTime: 0,
  } as SphereUniforms,
  sphereFrag,
  sphereVert,
);

extend({ SphereShader });

declare module "@react-three/fiber" {
  interface ThreeElements {
    sphereShader: Object3DNode<THREE.ShaderMaterial & SphereUniforms, any>;
  }
}

const Sphere = ({ position }: { position: [number, number, number] }) => {
  const ref = useRef() as React.MutableRefObject<THREE.Mesh>;
  const shaderRef = useRef() as React.MutableRefObject<
    THREE.ShaderMaterial & SphereUniforms
  >;

  const controls = useControls("Sphere", {
    uDistortionFrequency: { value: 2, min: 0, max: 10, step: 0.001 },
    uDistortionStrength: { value: 1, min: 0, max: 10, step: 0.001 },
    uDisplacementFrequency: { value: 2, min: 0, max: 10, step: 0.001 },
    uDisplacementStrength: { value: 0.2, min: 0, max: 10, step: 0.001 },
    uTimeScale: { value: 0.1, min: 0, max: 10, step: 0.001 },
  } as {
    [key in keyof SphereUniforms]: { value: SphereUniforms[key] } & any;
  });

  useFrame(({ clock }) => {
    shaderRef.current.uTime = clock.getElapsedTime();
  });

  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[1, 512, 512]} />
      <sphereShader
        key={SphereShader.key}
        ref={shaderRef}
        fragmentShader={sphereFrag}
        vertexShader={sphereVert}
        {...controls}
      />
    </mesh>
  );
};

function App() {
  return (
    <div className="h-full">
      <Canvas
        camera={{
          position: [0, 0, 3],
          fov: 70,
          aspect: window.innerWidth / window.innerHeight,
          near: 0.001,
          far: 1000,
        }}
      >
        <ambientLight intensity={Math.PI / 2} />
        <spotLight
          position={[10, 10, 10]}
          angle={0.15}
          penumbra={1}
          decay={0}
          intensity={Math.PI}
        />
        <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
        <Sphere position={[0, 0, 0]} />
        <OrbitControls />
      </Canvas>
    </div>
  );
}

export default App;
