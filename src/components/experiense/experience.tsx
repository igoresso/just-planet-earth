import { Suspense, useState, useMemo, useEffect } from "react";
import * as THREE from "three/webgpu";
import { Loader, OrbitControls, Stats, useProgress } from "@react-three/drei";
import { Leva, useControls, folder } from "leva";
import { WebGPUCanvas } from "@/components/canvas";
import { Sun } from "@/components/sun";
import { Earth } from "@/components/earth";
import { Atmosphere } from "@/components/atmosphere";
import { Effects } from "@/components/effects";

export function Experience() {
  const [constrolsHidden, setConstrolsHidden] = useState(true);

  const { ambientLight, angle } = useControls({
    Scene: folder(
      {
        ambientLight: { value: 0.01, min: 0, max: 5, step: 0.001 },
        angle: { value: 3, min: 0, max: 2 * Math.PI, step: 0.001 },
      },
      { collapsed: true }
    ),
  });

  const sunDirection = useMemo(() => {
    return new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle));
  }, [angle]);

  const { progress } = useProgress();

  useEffect(() => {
    if (progress == 100) {
      setConstrolsHidden(false);
    }
  }, [progress]);

  return (
    <>
      <Leva hidden={constrolsHidden} />
      <WebGPUCanvas
        scene={{ background: new THREE.Color("#00000c") }}
        camera={{ position: [0, 0, 1.75] }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={ambientLight} />
          <Sun sunDirection={sunDirection} />
          <Earth sunDirection={sunDirection} />
          <Atmosphere sunDirection={sunDirection} />
          <Effects />
          <color attach="background" args={["#00000c"]} />
          <OrbitControls makeDefault enablePan={false} enableZoom={true} />
          <Stats />
        </Suspense>
      </WebGPUCanvas>
      <Loader containerStyles={{ background: "#00000c" }} />
    </>
  );
}
