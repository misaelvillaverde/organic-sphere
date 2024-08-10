import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";
import { Entries } from "./type-utils";

import { OrbitControls, shaderMaterial, Stats } from "@react-three/drei";
import {
  Canvas,
  extend,
  type Object3DNode,
  useFrame,
} from "@react-three/fiber";
import { folder, useControls } from "leva";

import sphereFrag from "@shaders/sphere.frag";
import sphereVert from "@shaders/sphere.vert";

type SphereUniforms = {
  uDistortionFrequency: number;
  uDistortionStrength: number;
  uDisplacementFrequency: number;
  uDisplacementStrength: number;
  uTimeScale: number;
  uTime: number;
  uLightAPosition: THREE.Vector3;
  uLightAColor: THREE.Color;
  uLightAIntensity: number;
  uLightBPosition: THREE.Vector3;
  uLightBColor: THREE.Color;
  uLightBIntensity: number;
};

const SphereShader = shaderMaterial(
  {
    uDistortionFrequency: 2,
    uDistortionStrength: 1,
    uDisplacementFrequency: 2,
    uDisplacementStrength: 0.2,
    uTimeScale: 0.1,
    uTime: 0,
    uLightAPosition: new THREE.Vector3(1.0, 1.0, 0.0),
    uLightAColor: new THREE.Color("#ef9d9d"),
    uLightAIntensity: 1.0,
    uLightBPosition: new THREE.Vector3(-1.0, -1.0, 0.0),
    uLightBColor: new THREE.Color("#4bdebd"),
    uLightBIntensity: 1.0,
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
  const geometryRef = useRef() as React.MutableRefObject<THREE.SphereGeometry>;
  const shaderRef = useRef() as React.MutableRefObject<
    THREE.ShaderMaterial & SphereUniforms
  >;

  const lights = useRef({
    a: new THREE.Spherical(1, 0, 0),
    b: new THREE.Spherical(1, 0, 0),
  });

  const controls = useControls({
    uTimeScale: { value: 0.1, min: 0, max: 10, step: 0.001 },
    Distortion: folder({
      uDistortionFrequency: {
        value: 2,
        min: 0,
        max: 10,
        step: 0.001,
        label: "ω",
      },
      uDistortionStrength: {
        value: 1,
        min: 0,
        max: 10,
        step: 0.001,
        label: "F",
      },
    }),
    Displacement: folder({
      uDisplacementFrequency: {
        value: 2,
        min: 0,
        max: 10,
        step: 0.001,
        label: "ω",
      },
      uDisplacementStrength: {
        value: 0.2,
        min: 0,
        max: 1,
        step: 0.001,
        label: "F",
      },
    }),
    lightA: folder({
      uLightAColor: { value: "#ef9d9d", label: "color" },
      uLightAIntensity: { value: 1.0, label: "intensity" },
      lightAPhi: {
        value: Math.PI / 2,
        min: 0,
        max: Math.PI,
        step: 0.001,
        label: "φ",
        onChange: (v) => {
          lights.current.a.phi = v;
          shaderRef.current.uLightAPosition.setFromSpherical(lights.current.a);
        },
      },
      lightATheta: {
        value: Math.PI / 2,
        min: 0,
        max: Math.PI,
        step: 0.001,
        label: "θ",
        onChange: (v) => {
          lights.current.a.theta = v;
          shaderRef.current.uLightAPosition.setFromSpherical(lights.current.a);
        },
      },
    }),
    lightB: folder({
      uLightBColor: { value: "#4bdebd", label: "color" },
      uLightBIntensity: { value: 1.0, label: "intensity" },
      lightBPhi: {
        value: 0,
        min: 0,
        max: Math.PI,
        step: 0.001,
        label: "φ",
        onChange: (v) => {
          lights.current.b.phi = v;
          shaderRef.current.uLightBPosition.setFromSpherical(lights.current.b);
        },
      },
      lightBTheta: {
        value: 0,
        min: 0,
        max: Math.PI,
        step: 0.001,
        label: "θ",
        onChange: (v) => {
          lights.current.b.theta = v;
          shaderRef.current.uLightBPosition.setFromSpherical(lights.current.b);
        },
      },
    }),
  } as const);

  useFrame(({ clock }) => {
    shaderRef.current.uTime = clock.getElapsedTime();
  });

  useEffect(() => {
    if (geometryRef.current) {
      geometryRef.current.computeTangents();
    }
  }, []);

  const uniforms = useMemo(() => {
    const u = {} as any;

    for (const [k, v] of Object.entries(controls) as Entries<typeof controls>) {
      // if (typeof v === "object" && v.x && v.y && v.z) {
      //   u[k] = new THREE.Vector3(v.x, v.y, v.z);
      //   continue;
      // }

      if (typeof v === "string" && v.startsWith("#")) {
        u[k] = new THREE.Color(v);
        continue;
      }

      u[k] = v;
    }

    return u as SphereUniforms;
  }, [controls]);

  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[1, 512, 512]} ref={geometryRef} />
      <sphereShader
        key={SphereShader.key}
        ref={shaderRef}
        fragmentShader={sphereFrag}
        vertexShader={sphereVert}
        defines={{
          USE_TANGENT: true,
        }}
        {...uniforms}
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
      <Stats />
    </div>
  );
}

export default App;
