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
import { getSunDirectionECEF, ecef2three } from "@/utilities";

type Props = {
  onLoad: () => void;
};

export function Experience({ onLoad }: Props) {
  const { ambientLight, timeOffset } = useControls({
    Scene: folder(
      {
        ambientLight: { value: 0.01, min: 0, max: 5, step: 0.001 },
        timeOffset: { value: 0, min: -12, max: 12, step: 0.01 },
      },
      { collapsed: true }
    ),
  });

  const sunDirection = useMemo(() => {
    const now = new Date();
    const ecef = getSunDirectionECEF(
      new Date(now.getTime() + timeOffset * 3600 * 1000)
    );
    return ecef2three(ecef);
  }, [timeOffset]);

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
