const DEFAULT_ASSET_BASE_URL = "https://cdn-dev.fluent-too.com";

export function assetUrl(path: string) {
  const baseUrl = process.env.NEXT_PUBLIC_ASSET_BASE_URL || DEFAULT_ASSET_BASE_URL;
  return `${baseUrl.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}
