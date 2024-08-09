import * as THREE from "three";
import { useMemo, useRef } from "react";

import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";

import sphereFrag from "@shaders/sphere.frag";
import sphereVert from "@shaders/sphere.vert";

const Sphere = ({ position }: { position: [number, number, number] }) => {
  const ref = useRef() as React.MutableRefObject<THREE.Mesh>;

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
    }),
    [],
  );

  useFrame((state) => {
    const { clock } = state;
    (ref.current.material as THREE.ShaderMaterial).uniforms.uTime.value =
      clock.getElapsedTime();
  });

  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[1, 512, 512]} />
      <shaderMaterial
        fragmentShader={sphereFrag}
        vertexShader={sphereVert}
        uniforms={uniforms}
        // side={THREE.BackSide}
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
