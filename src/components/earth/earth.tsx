import { useMemo, useEffect } from "react";
import * as THREE from "three/webgpu";
import * as TSL from "three/tsl";
import { ThreeElements } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { useTweakpane } from "@/hooks/useTweakpane";

type PropsType = {
  sunDirection: THREE.Vector3;
} & ThreeElements["mesh"];

export function Earth({ sunDirection, ...props }: PropsType) {
  const { heightScale, normalScale, roughnessWater, emissiveColor } =
    useTweakpane("Earth", {
      heightScale: { value: 0.01, min: 0, max: 0.05, step: 0.001 },
      normalScale: { value: 1, min: 0, max: 2, step: 0.01 },
      roughnessWater: { value: 0.15, min: 0, max: 1, step: 0.01 },
      emissiveColor: "#ddbb99",
    });

  const [textureNightMap, normalHeightWaterMap] = useTexture([
    "/earth/texture_night_8k.png",
    "/earth/normal_height_water_8k.png",
  ]);

  const {
    sunDirectionUniform,
    heightScaleUniform,
    normalScaleUniform,
    emissiveColorUniform,
    rourhnessWaterUniform,
    position,
    emissive,
    normal,
    roughness,
  } = useMemo(() => {
    const textureNightNode = TSL.texture(textureNightMap);
    const normalHeightWaterNode = TSL.texture(normalHeightWaterMap);
    const sunDirectionUniform = TSL.uniform(sunDirection);

    // Displacement
    const heightScaleUniform = TSL.uniform(heightScale);
    const displacement = TSL.mul(normalHeightWaterNode.b, heightScaleUniform);
    const position = TSL.add(
      TSL.positionLocal,
      TSL.mul(TSL.normalLocal, displacement)
    );

    // Normals
    const normalScaleUniform = TSL.uniform(normalScale);
    const normal = TSL.normalMap(
      TSL.vec4(normalHeightWaterNode.rg, 1, 1),
      normalScaleUniform
    );

    // Night texture
    const emissiveColorUniform = TSL.uniform(new THREE.Color(emissiveColor));
    const darkSide = TSL.smoothstep(
      -0.05,
      0.15,
      TSL.dot(TSL.normalWorld, TSL.negate(sunDirectionUniform))
    );
    const emissive = TSL.mix(TSL.vec3(0), emissiveColorUniform, darkSide).mul(
      textureNightNode.a
    );

    // Roughness
    const rourhnessWaterUniform = TSL.uniform(roughnessWater);
    const roughness = TSL.mix(
      1,
      rourhnessWaterUniform,
      normalHeightWaterNode.a
    );

    return {
      sunDirectionUniform,
      heightScaleUniform,
      normalScaleUniform,
      emissiveColorUniform,
      rourhnessWaterUniform,
      position,
      normal,
      emissive,
      roughness,
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
    rourhnessWaterUniform.value = roughnessWater;
  }, [roughnessWater]);

  return (
    <mesh receiveShadow={false} castShadow={false} {...props}>
      <icosahedronGeometry args={[1, 252]} />
      <meshStandardNodeMaterial
        map={textureNightMap}
        positionNode={position}
        normalNode={normal}
        emissiveNode={emissive}
        roughnessNode={roughness}
      />
    </mesh>
  );
}
