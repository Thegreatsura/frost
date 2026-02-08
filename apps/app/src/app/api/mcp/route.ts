import { randomUUID } from "node:crypto";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { createMcpServer } from "@/lib/mcp/server";

const g = globalThis as typeof globalThis & {
  __mcpSessions?: Map<string, WebStandardStreamableHTTPServerTransport>;
};
const sessions = (g.__mcpSessions ??= new Map());

function createTransport(): WebStandardStreamableHTTPServerTransport {
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: () => randomUUID(),
    onsessioninitialized(id) {
      sessions.set(id, transport);
    },
    onsessionclosed(id) {
      sessions.delete(id);
    },
  });
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

  if (sessionId) {
    const existing = sessions.get(sessionId);
    if (!existing) return new Response(null, { status: 404 });
    return existing.handleRequest(request);
  }

  const transport = createTransport();
  const server = createMcpServer();
  await server.connect(transport);
  return transport.handleRequest(request);
}

export const GET = handleRequest;
export const POST = handleRequest;
export const DELETE = handleRequest;
