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
  uSubdivisions: number;
  uFresnelOffset: number;
  uFresnelMultiplier: number;
  uFresnelPower: number;
};

const defaultUniforms = {
  uDistortionFrequency: 0.72,
  uDistortionStrength: 2.4,
  uDisplacementFrequency: 1.2,
  uDisplacementStrength: 0.23,
  uTimeScale: 0.6,
  uTime: 0,
  uLightAPosition: new THREE.Vector3(1.0, 1.0, 0.0),
  uLightAColor: new THREE.Color("#a364e3"),
  uLightAIntensity: 3.0,
  uLightBPosition: new THREE.Vector3(-1.0, -1.0, 0.0),
  uLightBColor: new THREE.Color("#3490c7"),
  uLightBIntensity: 1.5,
  uSubdivisions: 512,
  uFresnelOffset: 0.35,
  uFresnelMultiplier: 0.71,
  uFresnelPower: 10,
} as SphereUniforms;

const SphereShader = shaderMaterial(defaultUniforms, sphereFrag, sphereVert);

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
    uTimeScale: {
      value: defaultUniforms.uTimeScale,
      min: 0,
      max: 10,
      step: 0.001,
    },
    uSubdivisions: {
      value: defaultUniforms.uSubdivisions,
      min: 0,
      max: 512,
      step: 1,
    },
    Distortion: folder({
      uDistortionFrequency: {
        value: defaultUniforms.uDistortionFrequency,
        min: 0,
        max: 10,
        step: 0.001,
        label: "ω",
      },
      uDistortionStrength: {
        value: defaultUniforms.uDistortionStrength,
        min: 0,
        max: 10,
        step: 0.001,
        label: "F",
      },
    }),
    Displacement: folder({
      uDisplacementFrequency: {
        value: defaultUniforms.uDisplacementFrequency,
        min: 0,
        max: 10,
        step: 0.001,
        label: "ω",
      },
      uDisplacementStrength: {
        value: defaultUniforms.uDisplacementStrength,
        min: 0,
        max: 1,
        step: 0.001,
        label: "F",
      },
    }),
    lightA: folder({
      uLightAColor: {
        value: "#" + defaultUniforms.uLightAColor.getHexString(),
        label: "color",
      },
      uLightAIntensity: {
        value: defaultUniforms.uLightAIntensity,
        label: "intensity",
      },
      lightAPhi: {
        value: 1.57,
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
        value: 0,
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
      uLightBColor: {
        value: "#" + defaultUniforms.uLightBColor.getHexString(),
        label: "color",
      },
      uLightBIntensity: {
        value: defaultUniforms.uLightBIntensity,
        label: "intensity",
      },
      lightBPhi: {
        value: 2.68,
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
        value: 2.13,
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
    fresnel: folder({
      uFresnelOffset: {
        value: defaultUniforms.uFresnelOffset,
        min: -1,
        max: 5,
        step: 0.001,
        label: "offset",
      },
      uFresnelMultiplier: {
        value: defaultUniforms.uFresnelMultiplier,
        min: 0,
        max: 10,
        step: 0.001,
        label: "multiplier",
      },
      uFresnelPower: {
        value: defaultUniforms.uFresnelPower,
        min: 0,
        max: 10,
        step: 0.001,
        label: "power",
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
