import { NextResponse } from "next/server";
import { hasGitHubApp, listInstallationRepos } from "@/lib/github";

export async function GET() {
  const connected = await hasGitHubApp();
  if (!connected) {
    return NextResponse.json(
      { error: "GitHub App not connected" },
      { status: 400 },
    );
  }

  try {
    const { owners, repos } = await listInstallationRepos();
    return NextResponse.json({ owners, repos });
  } catch (err: any) {
    console.error("Failed to list GitHub repos:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
