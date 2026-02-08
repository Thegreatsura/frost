export function getRequestOrigin(request: Request): string {
  const proto =
    request.headers.get("x-forwarded-proto") ??
    (request.url.startsWith("https") ? "https" : "http");
  const host = request.headers.get("host");
  if (host) {
    return `${proto}://${host}`;
  }
  return new URL(request.url).origin;
}
