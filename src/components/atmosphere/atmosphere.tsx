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
    cloudsThreshold,
    backSideMin,
    backSideMax,
    lightSideMin,
    lightSideMax,
    emissiveColor,
  } = useTweakpane("Atmosphere", {
    cloudsThreshold: { value: 0.3, min: 0, max: 1, step: 0.01 },
    backSideMin: { value: 0, min: -0.5, max: 0.5, step: 0.01 },
    backSideMax: { value: 0.65, min: 0, max: 1, step: 0.01 },
    lightSideMin: { value: 0, min: -0.5, max: 0.5, step: 0.01 },
    lightSideMax: { value: 0.35, min: 0, max: 1, step: 0.01 },
    emissiveColor: "#72c2ff",
  });

  // Textures
  const [clouds] = useTexture(["earth/clouds_4k.png"]);

  useEffect(() => {
    clouds.format = THREE.RedFormat;
    clouds.type = THREE.UnsignedByteType;
    clouds.unpackAlignment = 1;
    clouds.needsUpdate = true;
  }, [clouds]);

  // Uniforms
  const {
    sunDirectionUniform,
    emissiveColorUniform,
    cloudsThresholdUniform,
    backSideMinUniform,
    backSideMaxUniform,
    lightSideMinUniform,
    lightSideMaxUniform,
  } = useMemo(() => {
    const sunDirectionUniform = TSL.uniform(sunDirection);
    const cloudsThresholdUniform = TSL.uniform(cloudsThreshold);
    const backSideMinUniform = TSL.uniform(backSideMin);
    const backSideMaxUniform = TSL.uniform(backSideMax);
    const lightSideMinUniform = TSL.uniform(lightSideMin);
    const lightSideMaxUniform = TSL.uniform(lightSideMax);
    const emissiveColorUniform = TSL.uniform(new THREE.Color(emissiveColor));

    return {
      sunDirectionUniform,
      cloudsThresholdUniform,
      backSideMinUniform,
      backSideMaxUniform,
      lightSideMinUniform,
      lightSideMaxUniform,
      emissiveColorUniform,
    };
  }, []);

  useEffect(() => {
    sunDirectionUniform.value.copy(sunDirection);
  }, [sunDirection]);

  useEffect(() => {
    cloudsThresholdUniform.value = cloudsThreshold;
  }, [cloudsThreshold]);

  useEffect(() => {
    backSideMinUniform.value = backSideMin;
  }, [backSideMin]);

  useEffect(() => {
    backSideMaxUniform.value = backSideMax;
  }, [backSideMax]);

  useEffect(() => {
    lightSideMinUniform.value = lightSideMin;
  }, [lightSideMin]);

  useEffect(() => {
    lightSideMaxUniform.value = lightSideMax;
  }, [lightSideMax]);

  useEffect(() => {
    emissiveColorUniform.value.set(emissiveColor);
  }, [emissiveColor]);

  // Shader nodes
  const { colorNode } = useMemo(() => {
    const opacity = TSL.smoothstep(
      TSL.float(cloudsThresholdUniform),
      TSL.float(1.0),
      TSL.texture(clouds).r
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

    const colorFront = TSL.vec4(TSL.vec3(1.0), TSL.mul(opacity, lightSide));
    const colorBack = TSL.vec4(
      emissiveColorUniform,
      TSL.mul(lightSide, backSide)
    );

    const colorNode = TSL.select(TSL.frontFacing, colorFront, colorBack);

    return { colorNode };
  }, []);

  return (
    <mesh scale={1.015} receiveShadow={false} castShadow={false} {...props}>
      <icosahedronGeometry args={[1, 16]} />
      <meshBasicNodeMaterial
        side={THREE.DoubleSide}
        depthWrite={false}
        blending={THREE.NormalBlending}
        transparent
        colorNode={colorNode}
      />
    </mesh>
  );
}
