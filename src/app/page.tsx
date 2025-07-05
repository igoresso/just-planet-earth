"use client";

import { useState } from "react";
import { Leva } from "leva";
import { Experience } from "@/components/experiense";

export default function Home() {
  const [controlsHidden, setControlsHidden] = useState(true);

  return (
    <>
      <Leva
        isRoot
        hidden={controlsHidden}
        titleBar={{
          title: "Controls",
          filter: false,
          drag: true,
        }}
      />
      <Experience onLoad={() => setControlsHidden(false)} />
    </>
  );
}
