import React, { PropsWithChildren } from "react";
import { Canvas, CanvasProps } from "@react-three/fiber";

export function WebGLCanvas({
  children,
  ...canvasProps
}: PropsWithChildren<CanvasProps>) {
  return <Canvas {...canvasProps}>{children}</Canvas>;
}
