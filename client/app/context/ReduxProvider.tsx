// app/providers.tsx
"use client";

import { ReactNode, useRef } from "react";
import { Provider } from "react-redux";
import { makeStore } from "@/lib/store";

export function ReduxProvider({ children }: { children: ReactNode }) {
  const storeRef = useRef(makeStore());

  return <Provider store={storeRef.current}>{children}</Provider>;
}
