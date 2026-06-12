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
    edgeFade,
    frontGlow,
    backSideMin,
    backSideMax,
    lightSideMin,
    lightSideMax,
    emissiveColor,
  } = useControls({
    Atmosphere: folder(
      {
        cloudsThreshold: { value: 0.2, min: 0, max: 1, step: 0.01 },
        edgeFade: { value: 0.5, min: 0, max: 1, step: 0.01 },
        frontGlow: { value: 0.4, min: 0, max: 1, step: 0.01 },
        backSideMin: { value: 0.15, min: -1, max: 1, step: 0.01 },
        backSideMax: { value: 0.45, min: 0, max: 1, step: 0.01 },
        lightSideMin: { value: -0.1, min: -0.5, max: 0, step: 0.01 },
        lightSideMax: { value: 0.75, min: 0, max: 1, step: 0.01 },
        emissiveColor: "#4f9df5",
      },
      { collapsed: true },
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
    uEdgeFade,
    uFrontGlow,
    uBackSideMin,
    uBackSideMax,
    uLightSideMin,
    uLightSideMax,
    uEmissiveColor,
  } = useMemo(() => {
    const uSunDirection = TSL.uniform(sunDirection);
    const uCloudsThreshold = TSL.uniform(cloudsThreshold);
    const uEdgeFade = TSL.uniform(edgeFade);
    const uFrontGlow = TSL.uniform(frontGlow);
    const uBackSideMin = TSL.uniform(backSideMin);
    const uBackSideMax = TSL.uniform(backSideMax);
    const uLightSideMin = TSL.uniform(lightSideMin);
    const uLightSideMax = TSL.uniform(lightSideMax);
    const uEmissiveColor = TSL.uniform(new THREE.Color(emissiveColor));

    return {
      uSunDirection,
      uCloudsThreshold,
      uEdgeFade,
      uFrontGlow,
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
    uEdgeFade.value = edgeFade;
  }, [edgeFade]);

  useEffect(() => {
    uFrontGlow.value = frontGlow;
  }, [frontGlow]);

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
      TSL.texture(clouds).r,
    );

    // How directly the surface faces the camera: 1 at the centre of the disc, 0 at the silhouette
    const facingRatio = TSL.dot(TSL.normalView, TSL.positionViewDirection);

    const frontSide = TSL.cbrt(
      TSL.smoothstep(uBackSideMin, uBackSideMax, facingRatio),
    );
    const backSide = TSL.oneMinus(frontSide);

    // Ramps the rim down to zero at the silhouette, so the glow fades into space
    const edgeFadeNode = TSL.smoothstep(TSL.float(0.0), uEdgeFade, facingRatio);

    const lightSide = TSL.smoothstep(
      uLightSideMin,
      uLightSideMax,
      TSL.dot(TSL.normalWorld, uSunDirection),
    );

    // Backscatter (sun behind the camera) is dimmer than forward scatter,
    // so the rim thins out when viewing the fully lit face
    const viewDirWorld = TSL.normalize(
      TSL.sub(TSL.positionWorld, TSL.cameraPosition)
    );
    const scatter = TSL.mix(
      uFrontGlow,
      TSL.float(1.0),
      TSL.smoothstep(
        TSL.float(-1.0),
        TSL.float(0.0),
        TSL.dot(viewDirWorld, uSunDirection)
      )
    );

    const colorNode = TSL.mix(
      TSL.mix(TSL.vec3(0), uEmissiveColor, lightSide),
      TSL.vec3(1),
      frontSide,
    );

    // Rim glow on the lit limb, clouds over the face of the planet
    const opacityNode = TSL.mix(
      TSL.mul(edgeFadeNode, TSL.mul(lightSide, scatter)),
      cloudsTexture,
      TSL.sqrt(frontSide),
    );

    const emissiveNode = TSL.mix(
      TSL.float(0.0),
      uEmissiveColor,
      TSL.mul(backSide, TSL.mul(lightSide, scatter)),
    );

    return { colorNode, opacityNode, emissiveNode };
  }, []);

  return (
    <mesh scale={1.03} receiveShadow={false} castShadow={false} {...props}>
      <icosahedronGeometry args={[1, 16]} />
      <meshStandardNodeMaterial
        side={THREE.FrontSide}
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
