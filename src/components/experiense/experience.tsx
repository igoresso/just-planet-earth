"use client";

import { Suspense, useMemo } from "react";
import * as THREE from "three/webgpu";
import { Loader, OrbitControls, Stats } from "@react-three/drei";
import { useTweakpane } from "@/hooks/useTweakpane";
import { WebGPUCanvas } from "@/components/canvas";
import { Sun } from "@/components/sun";
import { Earth } from "@/components/earth";
import { Atmosphere } from "@/components/atmosphere";
import { Effects } from "@/components/effects";

export function Experience() {
  const { ambientLight, angle } = useTweakpane("Scene", {
    ambientLight: { value: 0.01, min: 0, max: 5, step: 0.001 },
    angle: { value: 3, min: 0, max: 2 * Math.PI, step: 0.001 },
  });

  const sunDirection = useMemo(() => {
    return new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle));
  }, [angle]);

  return (
    <>
      <WebGPUCanvas
        scene={{ background: new THREE.Color("#00000c") }}
        camera={{ position: [0, 0, 2] }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={ambientLight} />
          <Sun sunDirection={sunDirection} />
          <Earth sunDirection={sunDirection} />
          <Atmosphere sunDirection={sunDirection} />
          <Effects />
          <color attach="background" args={["#00000c"]} />
          <OrbitControls makeDefault minDistance={1.2} maxDistance={2} />
          <Stats />
        </Suspense>
      </WebGPUCanvas>
      <Loader containerStyles={{ background: "#00000c" }} />
    </>
  );
}
