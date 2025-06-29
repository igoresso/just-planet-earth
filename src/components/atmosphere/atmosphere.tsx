import { useMemo, useEffect } from "react";
import * as THREE from "three/webgpu";
import * as TSL from "three/tsl";
import { ThreeElements } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { useTweakpane } from "@/hooks/useTweakpane";

type PropsType = {
  sunDirection: THREE.Vector3;
} & ThreeElements["mesh"];

export function Atmosphere({ sunDirection, ...props }: PropsType) {
  const {
    backSideMin,
    backSideMax,
    lightSideMin,
    lightSideMax,
    emissiveColor,
  } = useTweakpane("Atmosphere", {
    backSideMin: { value: -0.1, min: -0.5, max: 0.5, step: 0.01 },
    backSideMax: { value: 0.5, min: 0, max: 1, step: 0.01 },
    lightSideMin: { value: -0.15, min: -1, max: 0, step: 0.01 },
    lightSideMax: { value: 0.3, min: 0, max: 1, step: 0.01 },
    emissiveColor: "#72c2ff",
  });

  const [cloudsMap] = useTexture(["earth/clouds_8k.png"]);

  const {
    sunDirectionUniform,
    emissiveColorUniform,
    backSideMinUniform,
    backSideMaxUniform,
    lightSideMinUniform,
    lightSideMaxUniform,
    color,
  } = useMemo(() => {
    const sunDirectionUniform = TSL.uniform(sunDirection);
    const emissiveColorUniform = TSL.uniform(new THREE.Color(emissiveColor));
    const backSideMinUniform = TSL.uniform(backSideMin);
    const backSideMaxUniform = TSL.uniform(backSideMax);
    const lightSideMinUniform = TSL.uniform(lightSideMin);
    const lightSideMaxUniform = TSL.uniform(lightSideMax);

    const clouds = TSL.vec4(
      TSL.smoothstep(0.3, 1.0, TSL.texture(cloudsMap).rgb),
      TSL.texture(cloudsMap).r
    );

    const backSide = TSL.smoothstep(
      backSideMinUniform,
      backSideMaxUniform,
      TSL.dot(TSL.normalView, TSL.negate(TSL.positionViewDirection))
    );

    const lightSide = TSL.smoothstep(
      lightSideMinUniform,
      lightSideMaxUniform,
      TSL.dot(TSL.normalWorld, sunDirectionUniform)
    );

    const colorback = TSL.mul(clouds, lightSide);
    const colorBack = TSL.vec4(
      emissiveColorUniform,
      TSL.mul(lightSide, backSide)
    );

    const color = TSL.select(TSL.frontFacing, colorback, colorBack);

    return {
      sunDirectionUniform,
      emissiveColorUniform,
      backSideMinUniform,
      backSideMaxUniform,
      lightSideMinUniform,
      lightSideMaxUniform,
      color,
    };
  }, []);

  useEffect(() => {
    sunDirectionUniform.value.copy(sunDirection);
  }, [sunDirection]);

  useEffect(() => {
    emissiveColorUniform.value.set(emissiveColor);
  }, [emissiveColor]);

  useEffect(() => {
    backSideMinUniform.value = backSideMin;
    backSideMaxUniform.value = backSideMax;
  }, [backSideMin, backSideMax]);

  useEffect(() => {
    lightSideMinUniform.value = lightSideMin;
    lightSideMaxUniform.value = lightSideMax;
  }, [lightSideMin, lightSideMax]);

  return (
    <mesh scale={1.015} receiveShadow={false} castShadow={false} {...props}>
      <icosahedronGeometry args={[1, 16]} />
      <meshBasicNodeMaterial
        side={THREE.DoubleSide}
        depthWrite={false}
        blending={THREE.NormalBlending}
        transparent
        colorNode={color}
      />
    </mesh>
  );
}
