import { randomBytes } from "node:crypto";
import { nanoid } from "nanoid";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const clientName =
    typeof body.client_name === "string" ? body.client_name : null;
  const redirectUris = Array.isArray(body.redirect_uris)
    ? body.redirect_uris.filter((u): u is string => typeof u === "string")
    : [];

  if (redirectUris.length === 0) {
    return NextResponse.json(
      {
        error: "invalid_client_metadata",
        error_description: "redirect_uris required",
      },
      { status: 400 },
    );
  }

  const id = nanoid();
  const clientId = `frost_client_${randomBytes(16).toString("hex")}`;

  await db
    .insertInto("oauthClients")
    .values({
      id,
      clientId,
      clientName,
      redirectUris: JSON.stringify(redirectUris),
    })
    .execute();

  return NextResponse.json(
    {
      client_id: clientId,
      client_name: clientName,
      redirect_uris: redirectUris,
      grant_types: ["authorization_code", "refresh_token"],
      response_types: ["code"],
      token_endpoint_auth_method: "none",
    },
    { status: 201 },
  );
}
