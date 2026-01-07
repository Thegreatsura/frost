import https from "node:https";
import { NextResponse } from "next/server";
import { getSetting } from "@/lib/auth";
import { getDomain, updateDomain } from "@/lib/domains";

function checkHttps(
  domain: string,
  rejectUnauthorized: boolean,
): Promise<{ ok: boolean; status?: number; error?: string }> {
  return new Promise((resolve) => {
    const req = https.request(
      {
        hostname: domain,
        port: 443,
        method: "HEAD",
        timeout: 10000,
        rejectUnauthorized,
      },
      (res) => {
        resolve({ ok: (res.statusCode ?? 500) < 500, status: res.statusCode });
      },
    );

    req.on("error", (err) => {
      resolve({ ok: false, error: err.message });
    });

    req.on("timeout", () => {
      req.destroy();
      resolve({ ok: false, error: "Connection timeout" });
    });

    req.end();
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const domain = await getDomain(id);
  if (!domain) {
    return NextResponse.json({ error: "Domain not found" }, { status: 404 });
  }

  if (!domain.dns_verified) {
    return NextResponse.json({ error: "DNS not verified" }, { status: 400 });
  }

  if (domain.ssl_status === "active") {
    return NextResponse.json({ working: true, status: "active" });
  }

  try {
    const staging = (await getSetting("ssl_staging")) === "true";
    const result = await checkHttps(domain.domain, !staging);

    if (result.ok) {
      await updateDomain(id, { sslStatus: "active" });
      return NextResponse.json({ working: true, status: "active" });
    }

    return NextResponse.json({
      working: false,
      status: "pending",
      error: result.error,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "SSL verification failed",
      },
      { status: 500 },
    );
  }
}
