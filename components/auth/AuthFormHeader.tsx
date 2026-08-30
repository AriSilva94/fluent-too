"use client";

import { createContext, useContext, type ReactNode } from "react";

const AuthFormHeaderContext = createContext<ReactNode>(null);

export function AuthFormHeaderProvider({ value, children }: { value: ReactNode; children: ReactNode }) {
  return <AuthFormHeaderContext.Provider value={value}>{children}</AuthFormHeaderContext.Provider>;
}

export function useAuthFormHeader(): ReactNode {
  return useContext(AuthFormHeaderContext);
}
