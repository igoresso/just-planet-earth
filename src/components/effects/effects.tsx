import { useMemo, useEffect } from "react";
import * as THREE from "three/webgpu";
import * as TSL from "three/tsl";
import { bloom } from "three/examples/jsm/tsl/display/BloomNode.js";
import { smaa } from "three/examples/jsm/tsl/display/SMAANode.js";
import { useThree, useFrame } from "@react-three/fiber";
import { useTweakpane } from "@/hooks/useTweakpane";

export function Effects() {
  const { strength, radius, threshold } = useTweakpane("Bloom", {
    strength: { value: 0.3, min: 0, max: 1, step: 0.01 },
    radius: { value: 0.3, min: 0, max: 1, step: 0.01 },
    threshold: { value: 0.1, min: 0, max: 1, step: 0.01 },
  });

  const { gl, scene, camera } = useThree();

  const { postProcessing, bloomPass } = useMemo(() => {
    const postProcessing = new THREE.PostProcessing(gl);
    const pass = TSL.pass(scene, camera);
    pass.setMRT(TSL.mrt({ output: TSL.output, emissive: TSL.emissive }));

    const smaaPass = smaa(pass.getTextureNode());
    const bloomPass = bloom(
      pass.getTextureNode("emissive"),
      strength,
      radius,
      threshold
    );

    postProcessing.outputNode = smaaPass.add(bloomPass);
    postProcessing.needsUpdate = true;

    return { postProcessing, bloomPass };
  }, [gl, scene, camera]);

  useEffect(() => {
    bloomPass.strength.value = strength;
    bloomPass.radius.value = radius;
    bloomPass.threshold.value = threshold;
    bloomPass.needsUpdate = true;
  }, [strength, radius, threshold, bloomPass, postProcessing]);

  useEffect(() => {
    return () => {
      postProcessing.dispose();
    };
  }, [postProcessing]);

  useFrame(() => postProcessing.render(), 1);

  return null;
}
