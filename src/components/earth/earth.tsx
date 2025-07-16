import { useMemo, useEffect } from "react";
import * as THREE from "three/webgpu";
import * as TSL from "three/tsl";
import { ThreeElements } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { useControls, folder } from "leva";

type PropsType = {
  sunDirection: THREE.Vector3;
} & ThreeElements["mesh"];

export function Earth({ sunDirection, ...props }: PropsType) {
  const { heightScale, normalScale, roughnessWater, emissiveColor } =
    useControls({
      Earth: folder(
        {
          heightScale: { value: 0.01, min: 0, max: 0.05, step: 0.001 },
          normalScale: { value: 0.5, min: 0, max: 2, step: 0.01 },
          roughnessWater: { value: 0.15, min: 0, max: 1, step: 0.01 },
          emissiveColor: "#ddbb99",
        },
        { collapsed: true }
      ),
    });

  // Textures
  const [colorEmissive, normalHeightWater] = useTexture([
    "earth/texture_emissive_4k.png",
    "earth/normal_height_water_4k.png",
  ]);

  const {
    uSunDirection,
    uHeightScale,
    uNormalScale,
    uEmissiveColor,
    uRoughnessWater,
  } = useMemo(() => {
    const uSunDirection = TSL.uniform(sunDirection);
    const uHeightScale = TSL.uniform(heightScale);
    const uNormalScale = TSL.uniform(normalScale);
    const uEmissiveColor = TSL.uniform(new THREE.Color(emissiveColor));
    const uRoughnessWater = TSL.uniform(roughnessWater);

    return {
      uSunDirection,
      uHeightScale,
      uNormalScale,
      uEmissiveColor,
      uRoughnessWater,
    };
  }, []);

  useEffect(() => {
    uSunDirection.value.copy(sunDirection);
  }, [sunDirection]);

  useEffect(() => {
    uHeightScale.value = heightScale;
  }, [heightScale]);

  useEffect(() => {
    uNormalScale.value = normalScale;
  }, [normalScale]);

  useEffect(() => {
    uEmissiveColor.value.set(emissiveColor);
  }, [emissiveColor]);

  useEffect(() => {
    uRoughnessWater.value = roughnessWater;
  }, [roughnessWater]);

  // Shader nodes
  const { colorNode, positionNode, emissiveNode, normalNode, roughnessNode } =
    useMemo(() => {
      const colorEmissiveTexture = TSL.texture(colorEmissive);
      const normalHeightWaterTexture = TSL.texture(normalHeightWater);

      // Color
      const colorNode = TSL.sRGBTransferEOTF(colorEmissiveTexture.rgb);

      // Displacement
      const displacement = TSL.mul(normalHeightWaterTexture.b, uHeightScale);
      const positionNode = TSL.add(
        TSL.positionLocal,
        TSL.mul(TSL.normalLocal, displacement)
      );

      // Normals
      const normalNode = TSL.normalMap(
        TSL.vec4(normalHeightWaterTexture.rg, 1, 1),
        uNormalScale
      );

      // Emissive
      const darkSide = TSL.smoothstep(
        -0.05,
        0.15,
        TSL.dot(TSL.normalWorld, TSL.negate(uSunDirection))
      );
      const emissiveNode = TSL.mix(TSL.vec3(0), uEmissiveColor, darkSide).mul(
        colorEmissiveTexture.a
      );

      // Roughness
      const roughnessNode = TSL.mix(
        1,
        uRoughnessWater,
        normalHeightWaterTexture.a
      );

      return {
        colorNode,
        positionNode,
        normalNode,
        emissiveNode,
        roughnessNode,
      };
    }, []);

  return (
    <mesh receiveShadow={false} castShadow={false} {...props}>
      <icosahedronGeometry args={[1, 64]} />
      <meshStandardNodeMaterial
        colorNode={colorNode}
        positionNode={positionNode}
        normalNode={normalNode}
        emissiveNode={emissiveNode}
        roughnessNode={roughnessNode}
      />
    </mesh>
  );
}
