"use client";

import * as THREE from "three/webgpu";
import { OrbitControls, Stats } from "@react-three/drei";
import { useTweakpane } from "@/hooks/useTweakpane";
import { Sun } from "@/components/sun";
import { WebGPUCanvas } from "@/components/canvas";

export function Experience() {
  const { ambientLight } = useTweakpane("Scene", {
    ambientLight: { value: 0.01, min: 0, max: 5, step: 0.001 },
  });
  return (
    <WebGPUCanvas
      scene={{ background: new THREE.Color("#00000c") }}
      camera={{ position: [0, 0, 2] }}
    >
      <ambientLight intensity={ambientLight} />
      <Sun />
      <OrbitControls makeDefault />
      <Stats />
    </WebGPUCanvas>
  );
}
