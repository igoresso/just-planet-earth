import { useState, useLayoutEffect, PropsWithChildren } from "react";
import * as THREE from "three/webgpu";
import {
  Canvas,
  CanvasProps,
  extend,
  type ThreeToJSXElements,
} from "@react-three/fiber";
import WebGPU from "three/examples/jsm/capabilities/WebGPU.js";
import { type WebGPURendererParameters } from "three/src/renderers/webgpu/WebGPURenderer.js";
import { Unsupported } from "../unsupported";

declare module "@react-three/fiber" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface ThreeElements extends ThreeToJSXElements<typeof THREE> {}
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
extend(THREE as any);

export function WebGPUCanvas({
  children,
  ...canvasProps
}: PropsWithChildren<CanvasProps>) {
  const [isSupported, setIsSupported] = useState<boolean | null>(null);

  useLayoutEffect(() => {
    setIsSupported(WebGPU.isAvailable());
  }, []);

  if (isSupported === null) return null;
  if (!isSupported) return <Unsupported />;

  return (
    <Canvas
      {...canvasProps}
      gl={async (props) => {
        const renderer = new THREE.WebGPURenderer(
          props as WebGPURendererParameters
        );
        await renderer.init();
        return renderer;
      }}
    >
      {children}
    </Canvas>
  );
}
