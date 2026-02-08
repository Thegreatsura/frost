import { oc } from "@orpc/contract";
import { z } from "zod";

export const mcpTokensContract = {
  list: oc.route({ method: "GET", path: "/settings/mcp-tokens" }).output(
    z.array(
      z.object({
        id: z.string(),
        clientName: z.string().nullable(),
        expiresAt: z.string(),
        createdAt: z.string(),
      }),
    ),
  ),

  delete: oc
    .route({ method: "DELETE", path: "/settings/mcp-tokens/{id}" })
    .input(z.object({ id: z.string() }))
    .output(z.object({ success: z.boolean() })),
};
