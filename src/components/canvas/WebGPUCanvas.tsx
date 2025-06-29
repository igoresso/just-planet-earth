import React, { PropsWithChildren } from "react";
import * as THREE from "three/webgpu";
import {
  Canvas,
  CanvasProps,
  extend,
  type ThreeToJSXElements,
} from "@react-three/fiber";
import { type WebGPURendererParameters } from "three/src/renderers/webgpu/WebGPURenderer.js";

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
