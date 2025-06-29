"use client";

import { useMemo } from "react";
import * as THREE from "three/webgpu";
import { OrbitControls, Stats } from "@react-three/drei";
import { useTweakpane } from "@/hooks/useTweakpane";
import { WebGPUCanvas } from "@/components/canvas";
import { Sun } from "@/components/sun";
import { Earth } from "@/components/earth";

export function Experience() {
  const { ambientLight, angle } = useTweakpane("Scene", {
    ambientLight: { value: 0.01, min: 0, max: 5, step: 0.001 },
    angle: { value: 4.5, min: 0, max: 2 * Math.PI, step: 0.001 },
  });

  const sunDirection = useMemo(() => {
    return new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle));
  }, [angle]);

  return (
    <WebGPUCanvas
      scene={{ background: new THREE.Color("#00000c") }}
      camera={{ position: [0, 0, 2] }}
    >
      <ambientLight intensity={ambientLight} />
      <Sun sunDirection={sunDirection} />
      <Earth sunDirection={sunDirection} />
      <OrbitControls makeDefault minDistance={1.2} maxDistance={2} />
      <Stats />
    </WebGPUCanvas>
  );
}
