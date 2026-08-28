"use client";

import { createContext, useContext, type ReactNode } from "react";

const AuthFormHeaderContext = createContext<ReactNode>(null);

/**
 * Composition seam that lets a screen (e.g. the register profile chooser)
 * inject content at the top of the auth card rendered by `AuthForm`/
 * `TeacherRegisterForm`, without those form components needing extra props.
 */
export function AuthFormHeaderProvider({ value, children }: { value: ReactNode; children: ReactNode }) {
  return <AuthFormHeaderContext.Provider value={value}>{children}</AuthFormHeaderContext.Provider>;
}

export function useAuthFormHeader(): ReactNode {
  return useContext(AuthFormHeaderContext);
}
