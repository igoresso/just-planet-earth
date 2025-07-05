"use client";

import { Leva } from "leva";
import { Experience } from "@/components/experiense";

export default function Home() {
  return (
    <>
      <Leva
        isRoot
        titleBar={{
          title: "Controls", // the text you want to show
          filter: true, // optionally hide the filter input
          drag: true, // whether you can drag the panel by the title
        }}
      />
      <Experience />
    </>
  );
}
