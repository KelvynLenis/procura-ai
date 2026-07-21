export const GOVBR_CALLBACK_PATH = "/api/login-gov/callback";

const DEFAULT_BASE_URL = "https://procuraai-homolog.secties.pb.gov.br";

export function normalizeBaseUrl(url: string): string {
  const trimmed = url.trim().replace(/\/$/, "");
  if (!trimmed) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function isLocalhostHost(host: string): boolean {
  const normalizedHost = host.split(":")[0]?.toLowerCase() ?? host;
  return normalizedHost === "localhost" || normalizedHost === "127.0.0.1";
}

function isLocalhostUrl(url: string): boolean {
  try {
    return isLocalhostHost(new URL(normalizeBaseUrl(url)).hostname);
  } catch {
    return url.includes("localhost") || url.includes("127.0.0.1");
  }
}

function getEnvBaseUrl(): string | undefined {
  const fromEnv = process.env.NEXT_PUBLIC_BASE_URL?.trim();
  if (!fromEnv || isLocalhostUrl(fromEnv)) return undefined;
  return normalizeBaseUrl(fromEnv);
}

function getEnvRedirectUri(): string | undefined {
  const fromEnv = process.env.NEXT_PUBLIC_GOVBR_REDIRECT_URI?.trim();
  if (!fromEnv || isLocalhostUrl(fromEnv)) return undefined;
  return fromEnv;
}

function getHeaderValue(request: Request, name: string): string | undefined {
  return request.headers.get(name)?.split(",")[0]?.trim() || undefined;
}

export function getRequestOrigin(request: Request): string {
  const forwardedHost = getHeaderValue(request, "x-forwarded-host");
  const hostHeader = getHeaderValue(request, "host");
  const forwardedProto = getHeaderValue(request, "x-forwarded-proto");

  const publicHost = forwardedHost || hostHeader;
  if (publicHost && !isLocalhostHost(publicHost)) {
    const protocol =
      forwardedProto ||
      (publicHost.includes("localhost") ? "http" : "https");
    return `${protocol}://${publicHost}`;
  }

  const requestOrigin = new URL(request.url).origin;
  if (!isLocalhostHost(new URL(request.url).hostname)) {
    return requestOrigin;
  }

  return getEnvBaseUrl() || DEFAULT_BASE_URL;
}

export function resolveBaseUrl(request?: Request): string {
  if (request) {
    return getRequestOrigin(request);
  }

  return getEnvBaseUrl() || DEFAULT_BASE_URL;
}

export function resolveGovBrRedirectUri(request?: Request): string {
  if (request) {
    return `${getRequestOrigin(request)}${GOVBR_CALLBACK_PATH}`;
  }

  return getEnvRedirectUri() || `${resolveBaseUrl()}${GOVBR_CALLBACK_PATH}`;
}

export function getPublicBaseUrl(): string {
  if (typeof window !== "undefined") return window.location.origin;

  return getEnvBaseUrl() || DEFAULT_BASE_URL;
}

export function buildAppPath(path: string): string {
  if (!path) return "/";
  return path.startsWith("/") ? path : `/${path}`;
}
