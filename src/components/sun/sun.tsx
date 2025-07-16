import { useRef, useMemo, useEffect } from "react";
import * as THREE from "three/webgpu";
import * as TSL from "three/tsl";
import { ThreeElements } from "@react-three/fiber";
import { useControls, folder } from "leva";

type PropsType = {
  sunDirection: THREE.Vector3;
} & ThreeElements["mesh"];

export function Sun({ sunDirection, ...props }: PropsType) {
  const { scale, distance, intensity, color } = useControls({
    Sun: folder(
      {
        scale: { value: 0.074, min: 0.01, max: 0.2, step: 0.001 },
        distance: { value: 10, min: 2, max: 10, step: 0.1 },
        intensity: { value: 5, min: 0, max: 10, step: 0.01 },
        color: "#ffffff",
      },
      { collapsed: true }
    ),
  });

  const lightRef = useRef<THREE.DirectionalLight>(null!);
  const meshRef = useRef<THREE.Mesh>(null!);

  const { uColor } = useMemo(
    () => ({
      uColor: TSL.uniform(new THREE.Color(color)),
    }),
    []
  );

  useEffect(() => {
    lightRef.current.color.set(color);
    uColor.value.set(color);
  }, [color]);

  useEffect(() => {
    const position = sunDirection.clone().multiplyScalar(distance);
    lightRef.current.position.copy(position);
    meshRef.current.position.copy(position);
  }, [sunDirection, distance]);

  return (
    <>
      <directionalLight
        ref={lightRef}
        position={sunDirection.clone().multiplyScalar(distance)}
        intensity={intensity}
      />
      <mesh
        ref={meshRef}
        scale={scale}
        position={sunDirection.clone().multiplyScalar(distance)}
        castShadow={false}
        receiveShadow={false}
        {...props}
      >
        <icosahedronGeometry args={[1, 2]} />
        <meshStandardNodeMaterial
          colorNode={uColor}
          emissiveNode={uColor}
          toneMapped={false}
          lights={false}
        />
      </mesh>
    </>
  );
}
