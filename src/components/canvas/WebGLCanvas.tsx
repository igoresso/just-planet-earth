import React, { PropsWithChildren } from "react";
import * as THREE from "three";
import {
  Canvas,
  CanvasProps,
  extend,
  type ThreeToJSXElements,
} from "@react-three/fiber";

declare module "@react-three/fiber" {
  interface ThreeElements extends ThreeToJSXElements<typeof THREE> {}
}

extend(THREE as any);

export function WebGLCanvas({
  children,
  ...canvasProps
}: PropsWithChildren<CanvasProps>) {
  return <Canvas {...canvasProps}>{children}</Canvas>;
}
