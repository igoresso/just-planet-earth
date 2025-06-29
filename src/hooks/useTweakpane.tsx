import { useEffect, useRef, useState } from "react";
import { Pane, FolderApi, TpChangeEvent } from "tweakpane";

let pane: Pane | null = null;

type TweakpaneParam =
  | string
  | number
  | boolean
  | {
      value: string | number | boolean;
      [key: string]: unknown;
    };

type TweakpaneParamsType = {
  [paramName: string]: TweakpaneParam;
};

export function useTweakpane<T extends TweakpaneParamsType>(
  folderNameOrParams: string | T,
  maybeParams?: T
): {
  [K in keyof T]: T[K] extends { value: infer U } ? U : T[K];
} {
  const isSSR = typeof window === "undefined";

  let folderName: string | null = null;
  let params: T;

  if (typeof folderNameOrParams === "string") {
    folderName = folderNameOrParams;
    params = maybeParams || ({} as T);
  } else {
    params = folderNameOrParams;
  }

  const [values, setValues] = useState(() => {
    const initial: Record<string, unknown> = {};
    for (const key in params) {
      const param = params[key];
      if (typeof param === "object" && param !== null && "value" in param) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        initial[key] = (param as any).value;
      } else {
        initial[key] = param;
      }
    }
    return initial;
  });

  const dataRef = useRef({ ...values });

  useEffect(() => {
    if (isSSR) {
      return;
    }

    if (!pane) {
      pane = new Pane();
    }

    const parentApi: FolderApi | Pane = folderName
      ? pane!.addFolder({ title: folderName })
      : pane!;

    Object.keys(params).forEach((key) => {
      const param = params[key];
      let config: Record<string, unknown> = {};

      if (typeof param === "object" && "value" in param) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { value, ...rest } = param as any;
        dataRef.current[key] = value;
        config = rest;
      } else {
        dataRef.current[key] = param;
      }

      const binding = parentApi.addBinding(dataRef.current, key, config);

      binding.on("change", (ev: TpChangeEvent<unknown>) => {
        const newVal = ev.value as string | number | boolean;
        dataRef.current[key] = newVal;
        setValues((prev) => ({ ...prev, [key]: newVal }));
      });
    });

    return () => {
      if (folderName && "dispose" in parentApi) {
        parentApi.dispose();
      }
    };
  }, []);

  return values as {
    [K in keyof T]: T[K] extends { value: infer U } ? U : T[K];
  };
}
