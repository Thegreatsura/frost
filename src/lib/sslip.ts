function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
}

export function buildSslipDomain(
  serviceName: string,
  projectName: string,
  serverIp: string,
  suffix?: number,
): string {
  const serviceSlug = slugify(serviceName);
  const projectSlug = slugify(projectName);
  const base = `${serviceSlug}-${projectSlug}`;
  const withSuffix = suffix ? `${base}-${suffix}` : base;
  return `${withSuffix}.${serverIp}.sslip.io`;
}
