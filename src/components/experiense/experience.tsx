import { Suspense, useMemo, useEffect } from "react";
import * as THREE from "three/webgpu";
import { Loader, OrbitControls, Stats, useProgress } from "@react-three/drei";
import { useControls, folder } from "leva";
import { WebGPUCanvas } from "@/components/canvas";
import { Sun } from "@/components/sun";
import { Earth } from "@/components/earth";
import { Atmosphere } from "@/components/atmosphere";
import { Stars } from "@/components/stars";
import { Effects } from "@/components/effects";

type Props = {
  onLoad: () => void;
};

export function Experience({ onLoad }: Props) {
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
      onLoad();
    }
  }, [progress]);

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
          <Stars radius={100} depth={50} count={5000} factor={5} />
          <Effects />
          <color attach="background" args={["#00000c"]} />
          <OrbitControls makeDefault enablePan={false} enableZoom={false} />
          <Stats />
        </Suspense>
      </WebGPUCanvas>
      <Loader containerStyles={{ background: "#00000c" }} />
    </>
  );
}
