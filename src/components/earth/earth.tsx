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
          normalScale: { value: 1, min: 0, max: 2, step: 0.01 },
          roughnessWater: { value: 0.15, min: 0, max: 1, step: 0.01 },
          emissiveColor: "#ddbb99",
        },
        {
          collapsed: true,
        }
      ),
    });

  // Textures
  const [colorEmissive, normalHeightWater] = useTexture([
    "earth/texture_emissive_4k.png",
    "earth/normal_height_water_4k.png",
  ]);

  const {
    sunDirectionUniform,
    heightScaleUniform,
    normalScaleUniform,
    emissiveColorUniform,
    roughnessWaterUniform,
  } = useMemo(() => {
    const sunDirectionUniform = TSL.uniform(sunDirection);
    const heightScaleUniform = TSL.uniform(heightScale);
    const normalScaleUniform = TSL.uniform(normalScale);
    const emissiveColorUniform = TSL.uniform(new THREE.Color(emissiveColor));
    const roughnessWaterUniform = TSL.uniform(roughnessWater);

    return {
      sunDirectionUniform,
      heightScaleUniform,
      normalScaleUniform,
      emissiveColorUniform,
      roughnessWaterUniform,
    };
  }, []);

  useEffect(() => {
    sunDirectionUniform.value.copy(sunDirection);
  }, [sunDirection]);

  useEffect(() => {
    heightScaleUniform.value = heightScale;
  }, [heightScale]);

  useEffect(() => {
    normalScaleUniform.value = normalScale;
  }, [normalScale]);

  useEffect(() => {
    emissiveColorUniform.value.set(emissiveColor);
  }, [emissiveColor]);

  useEffect(() => {
    roughnessWaterUniform.value = roughnessWater;
  }, [roughnessWater]);

  // Shader nodes
  const { colorNode, positionNode, emissiveNode, normalNode, roughnessNode } =
    useMemo(() => {
      const colorEmissiveTexture = TSL.texture(colorEmissive);
      const normalHeightWaterTexture = TSL.texture(normalHeightWater);

      // Color
      const colorNode = TSL.sRGBTransferEOTF(colorEmissiveTexture.rgb);

      // Displacement
      const displacement = TSL.mul(
        normalHeightWaterTexture.b,
        heightScaleUniform
      );
      const positionNode = TSL.add(
        TSL.positionLocal,
        TSL.mul(TSL.normalLocal, displacement)
      );

      // Normals
      const normalNode = TSL.normalMap(
        TSL.vec4(normalHeightWaterTexture.rg, 1, 1),
        normalScaleUniform
      );

      // Emissive
      const darkSide = TSL.smoothstep(
        -0.05,
        0.15,
        TSL.dot(TSL.normalWorld, TSL.negate(sunDirectionUniform))
      );
      const emissiveNode = TSL.mix(
        TSL.vec3(0),
        emissiveColorUniform,
        darkSide
      ).mul(colorEmissiveTexture.a);

      // Roughness
      const roughnessNode = TSL.mix(
        1,
        roughnessWaterUniform,
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
