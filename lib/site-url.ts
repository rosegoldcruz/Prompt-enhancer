const DEFAULT_SITE_URL = "http://localhost:3000";

function normalizeSiteUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const parsed = new URL(withProtocol);
    parsed.pathname = "";
    parsed.search = "";
    parsed.hash = "";
    return parsed.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

export function getSiteUrl(): string {
  const configured = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL || "");
  if (configured) return configured;

  const vercelProduction = normalizeSiteUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL || "");
  if (vercelProduction) return vercelProduction;

  const vercelPreview = normalizeSiteUrl(process.env.VERCEL_URL || "");
  if (vercelPreview) return vercelPreview;

  return DEFAULT_SITE_URL;
}