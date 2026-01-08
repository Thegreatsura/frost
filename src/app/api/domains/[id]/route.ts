import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  getDomain,
  removeDomain,
  syncCaddyConfig,
  updateDomain,
} from "@/lib/domains";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const domain = await getDomain(id);

  if (!domain) {
    return NextResponse.json({ error: "Domain not found" }, { status: 404 });
  }

  return NextResponse.json(domain);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json();

  const domain = await getDomain(id);

  if (!domain) {
    return NextResponse.json({ error: "Domain not found" }, { status: 404 });
  }

  const updates: Parameters<typeof updateDomain>[1] = {};

  if (body.type !== undefined) {
    updates.type = body.type;
  }
  if (body.redirectTarget !== undefined) {
    updates.redirectTarget = body.redirectTarget;
  }
  if (body.redirectCode !== undefined) {
    updates.redirectCode = body.redirectCode;
  }

  const updated = await updateDomain(id, updates);

  if (domain.dns_verified) {
    try {
      await syncCaddyConfig();
    } catch {}
  }

  return NextResponse.json(updated);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const domain = await getDomain(id);

  if (!domain) {
    return NextResponse.json({ error: "Domain not found" }, { status: 404 });
  }

  if (domain.is_system === 1) {
    const otherVerifiedDomains = await db
      .selectFrom("domains")
      .select("id")
      .where("service_id", "=", domain.service_id)
      .where("id", "!=", id)
      .where("dns_verified", "=", 1)
      .execute();

    if (otherVerifiedDomains.length === 0) {
      return NextResponse.json(
        { error: "Cannot delete system domain when no other verified domain exists" },
        { status: 400 },
      );
    }
  }

  await removeDomain(id);

  if (domain.dns_verified) {
    try {
      await syncCaddyConfig();
    } catch {}
  }

  return NextResponse.json({ success: true });
}
