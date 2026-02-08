import { randomUUID } from "node:crypto";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { createMcpServer } from "@/lib/mcp/server";

const sessions = new Map<string, WebStandardStreamableHTTPServerTransport>();

async function getOrCreateTransport(
  sessionId: string | null,
): Promise<WebStandardStreamableHTTPServerTransport> {
  if (sessionId) {
    const existing = sessions.get(sessionId);
    if (existing) return existing;
  }

  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: () => randomUUID(),
    onsessioninitialized(id) {
      sessions.set(id, transport);
    },
    onsessionclosed(id) {
      sessions.delete(id);
    },
  });

  const server = createMcpServer();
  await server.connect(transport);

  return transport;
}

async function handleRequest(request: Request): Promise<Response> {
  const sessionId = request.headers.get("mcp-session-id");

  if (request.method === "DELETE") {
    if (!sessionId) return new Response(null, { status: 404 });
    const transport = sessions.get(sessionId);
    if (!transport) return new Response(null, { status: 404 });
    await transport.close();
    sessions.delete(sessionId);
    return new Response(null, { status: 200 });
  }

  const transport = await getOrCreateTransport(sessionId);
  return transport.handleRequest(request);
}

export const GET = handleRequest;
export const POST = handleRequest;
export const DELETE = handleRequest;
