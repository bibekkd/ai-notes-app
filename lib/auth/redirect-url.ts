"use client";

type RedirectPath = `/${string}`;

function normalizeBaseUrl(url: string) {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

export function getAuthRedirectUrl(
  callbackPath: RedirectPath = "/auth/callback",
  nextPath: RedirectPath = "/dashboard"
) {
  const configuredBaseUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  const browserBaseUrl =
    typeof window !== "undefined" ? window.location.origin : "";
  const isLocalDevHost =
    typeof window !== "undefined" &&
    ["localhost", "127.0.0.0"].includes(window.location.hostname);
  const baseUrl =
    isLocalDevHost && browserBaseUrl
      ? browserBaseUrl
      : configuredBaseUrl && configuredBaseUrl.length > 0
      ? normalizeBaseUrl(configuredBaseUrl)
      : browserBaseUrl;

  if (!baseUrl) {
    throw new Error("Unable to determine the app URL for OAuth redirect.");
  }

  const redirectUrl = new URL(callbackPath, `${baseUrl}/`);
  redirectUrl.searchParams.set("next", nextPath);

  return redirectUrl.toString();
}
