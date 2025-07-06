import { useMemo } from "react";
import * as TSL from "three/tsl";

export type Props = {
  radius?: number;
  depth?: number;
  count?: number;
  factor?: number;
};

export function Stars({
  radius = 100,
  depth = 50,
  count = 5000,
  factor = 4,
}: Props) {
  const { positions, sizes } = useMemo(() => {
    const posArray: number[] = [];
    const sizeArray: number[] = [];
    let r = radius + depth;
    const increment = depth / count;

    for (let i = 0; i < count; i++) {
      r -= increment * Math.random();
      const phi = Math.acos(1 - 2 * Math.random());
      const theta = Math.random() * 2 * Math.PI;
      posArray.push(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi)
      );
      sizeArray.push((0.5 + 0.5 * Math.random()) * factor);
    }

    return {
      positions: new Float32Array(posArray),
      sizes: new Float32Array(sizeArray),
    };
  }, [radius, depth, count, factor]);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
      </bufferGeometry>
      <pointsNodeMaterial
        colorNode={TSL.vec4(1.0)}
        sizeNode={TSL.attribute("size", "float")}
        transparent={false}
        depthWrite={false}
      />
    </points>
  );
}
