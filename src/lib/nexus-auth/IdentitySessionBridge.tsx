import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useNexusAuth } from "./AuthProvider";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8082";

interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  user?: {
    id?: number | string;
    email?: string;
    role?: string;
  };
  profile?: {
    institution?: string;
  };
}

export function IdentitySessionBridge() {
  const { status, user, client, getAccessToken, logout } = useNexusAuth();
  const navigate = useNavigate();
  const syncing = useRef(false);
  const syncedIdentityToken = useRef<string | null>(null);

  useEffect(() => {
    let active = true;
    const sync = async () => {
      if (status !== "authenticated" || !user || syncing.current) {
        return;
      }
      syncing.current = true;
      try {
        const identityToken = await getAccessToken();
        if (!active || !identityToken || syncedIdentityToken.current === identityToken) {
          return;
        }

      const response = await fetch(
        `${API_BASE_URL.replace(/\/+$/, "")}/api/v1/auth/sso`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${identityToken}` },
        },
      );
      const payload = (await response.json().catch(() => null)) as
        | { data?: LoginResponse; message?: string; detail?: string }
        | LoginResponse
        | null;
      const data =
        payload && "data" in payload ? payload.data : payload;
      const errorPayload =
        payload && "data" in payload ? payload : null;
      if (!response.ok || !data?.accessToken || !data.user?.id) {
        const detail =
          errorPayload?.detail
            ? errorPayload.detail
            : errorPayload?.message
              ? errorPayload.message
              : null;
        throw new Error(
          detail ?? `Registrar SSO failed (HTTP ${response.status})`,
        );
      }
      if (!active) return;

      syncedIdentityToken.current = identityToken;
      localStorage.setItem("access_token", data.accessToken);
      if (data.refreshToken) {
        localStorage.setItem("refresh_token", data.refreshToken);
      }
      localStorage.setItem("user_id", String(data.user.id));
      if (data.user.email) localStorage.setItem("user_email", data.user.email);
      if (data.profile?.institution) {
        localStorage.setItem("registrar_college", data.profile.institution);
      }
      navigate("/dashboard", { replace: true });
      } finally {
        syncing.current = false;
      }
    };

    const runSync = () => {
      void sync().catch((error: unknown) => {
        if (!active) return;
        syncedIdentityToken.current = null;
        console.error("Registrar SSO could not be completed", error);
        window.dispatchEvent(
          new CustomEvent("nexus-sso-error", {
            detail: error instanceof Error ? error.message : String(error),
          }),
        );
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        void logout("/auth").catch((logoutError: unknown) =>
          console.error("Nexus Identity logout failed", logoutError),
        );
      });
    };

    runSync();
    const unsubscribe = client.subscribe(runSync);
    const handleSignout = () => {
      void logout("/auth").catch((error: unknown) =>
        console.error("Nexus Identity logout failed", error),
      );
    };
    window.addEventListener("nexus-sso-signout", handleSignout);
    return () => {
      active = false;
      unsubscribe();
      window.removeEventListener("nexus-sso-signout", handleSignout);
    };
  }, [client, getAccessToken, logout, navigate, status, user]);

  return null;
}
