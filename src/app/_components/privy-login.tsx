"use client";

import { useEffect, useRef } from "react";
import { usePrivy } from "@privy-io/react-auth";

export function PrivyLogin() {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  const { ready, authenticated, user, login, logout } = usePrivy();
  const hasAutoOpenedRef = useRef(false);

  useEffect(() => {
    if (!appId || !ready || authenticated || hasAutoOpenedRef.current) {
      return;
    }

    hasAutoOpenedRef.current = true;
    void login();
  }, [appId, ready, authenticated, login]);

  if (!appId) {
    return (
      <div className="od-chip">
        Privy no configurado
      </div>
    );
  }

  const identity = user?.email?.address || user?.wallet?.address || "Sesion activa";

  return (
    <div className="flex items-center gap-2">
      <span className="od-chip max-w-[240px] truncate" title={identity}>
        {authenticated ? identity : ready ? "Conectando..." : "Inicializando Privy..."}
      </span>
      <button
        type="button"
        className="inline-flex items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 py-2 text-xs font-semibold text-[var(--foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-60"
        onClick={authenticated ? logout : login}
        disabled={!ready}
      >
        {authenticated ? "Salir" : "Entrar con Privy"}
      </button>
    </div>
  );
}
