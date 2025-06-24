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
  interface ThreeElements extends ThreeToJSXElements<typeof THREE> {}
}

extend(THREE as any);

export function WebGPUCanvas({
  children,
  ...canvasProps
}: PropsWithChildren<CanvasProps>) {
  return (
    <Canvas
      {...canvasProps}
      gl={(glProps) => {
        const renderer = new THREE.WebGPURenderer(
          glProps as WebGPURendererParameters
        );
        return renderer.init().then(() => renderer);
      }}
    >
      {children}
    </Canvas>
  );
}
