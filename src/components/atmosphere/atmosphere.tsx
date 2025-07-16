import { useMemo, useEffect } from "react";
import * as THREE from "three/webgpu";
import * as TSL from "three/tsl";
import { ThreeElements } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { useControls, folder } from "leva";

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
  } = useControls({
    Atmosphere: folder(
      {
        cloudsThreshold: { value: 0.2, min: 0, max: 1, step: 0.01 },
        backSideMin: { value: 0.15, min: -1, max: 1, step: 0.01 },
        backSideMax: { value: 0.35, min: 0, max: 1, step: 0.01 },
        lightSideMin: { value: -0.1, min: -0.5, max: 0, step: 0.01 },
        lightSideMax: { value: 0.75, min: 0, max: 1, step: 0.01 },
        emissiveColor: "#21aaff",
      },
      { collapsed: true }
    ),
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
    uSunDirection,
    uCloudsThreshold,
    uBackSideMin,
    uBackSideMax,
    uLightSideMin,
    uLightSideMax,
    uEmissiveColor,
  } = useMemo(() => {
    const uSunDirection = TSL.uniform(sunDirection);
    const uCloudsThreshold = TSL.uniform(cloudsThreshold);
    const uBackSideMin = TSL.uniform(backSideMin);
    const uBackSideMax = TSL.uniform(backSideMax);
    const uLightSideMin = TSL.uniform(lightSideMin);
    const uLightSideMax = TSL.uniform(lightSideMax);
    const uEmissiveColor = TSL.uniform(new THREE.Color(emissiveColor));

    return {
      uSunDirection,
      uCloudsThreshold,
      uBackSideMin,
      uBackSideMax,
      uLightSideMin,
      uLightSideMax,
      uEmissiveColor,
    };
  }, []);

  useEffect(() => {
    uSunDirection.value.copy(sunDirection);
  }, [sunDirection]);

  useEffect(() => {
    uCloudsThreshold.value = cloudsThreshold;
  }, [cloudsThreshold]);

  useEffect(() => {
    uBackSideMin.value = backSideMin;
  }, [backSideMin]);

  useEffect(() => {
    uBackSideMax.value = backSideMax;
  }, [backSideMax]);

  useEffect(() => {
    uLightSideMin.value = lightSideMin;
  }, [lightSideMin]);

  useEffect(() => {
    uLightSideMax.value = lightSideMax;
  }, [lightSideMax]);

  useEffect(() => {
    uEmissiveColor.value.set(emissiveColor);
  }, [emissiveColor]);

  // Shader nodes
  const { colorNode, opacityNode, emissiveNode } = useMemo(() => {
    const cloudsTexture = TSL.smoothstep(
      TSL.float(uCloudsThreshold),
      TSL.float(1.0),
      TSL.texture(clouds).r
    );

    const frontSide = TSL.cbrt(
      TSL.smoothstep(
        uBackSideMin,
        uBackSideMax,
        TSL.dot(TSL.normalView, TSL.positionViewDirection)
      )
    );
    const backSide = TSL.oneMinus(frontSide);

    const lightSide = TSL.smoothstep(
      uLightSideMin,
      uLightSideMax,
      TSL.dot(TSL.normalWorld, uSunDirection)
    );

    const colorNode = TSL.mix(
      TSL.mix(TSL.vec3(0), uEmissiveColor, lightSide),
      TSL.vec3(1),
      frontSide
    );

    const opacityNode = TSL.mix(
      TSL.float(1.0),
      cloudsTexture,
      TSL.sqrt(frontSide)
    );

    const emissiveNode = TSL.mix(
      TSL.float(0.0),
      uEmissiveColor,
      TSL.mul(backSide, lightSide)
    );

    return { colorNode, opacityNode, emissiveNode };
  }, []);

  return (
    <mesh scale={1.01} receiveShadow={false} castShadow={false} {...props}>
      <icosahedronGeometry args={[1, 16]} />
      <meshStandardNodeMaterial
        side={THREE.DoubleSide}
        depthWrite={false}
        blending={THREE.NormalBlending}
        transparent
        colorNode={colorNode}
        opacityNode={opacityNode}
        emissiveNode={emissiveNode}
      />
    </mesh>
  );
}
