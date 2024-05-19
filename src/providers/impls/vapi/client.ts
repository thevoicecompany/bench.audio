import type { VapiProvider } from "./vapi";
import type { Assistant } from "@vapi-ai/web/dist/api";

import { createClient } from "~/providers/lib/providerSchema";

const vapiStartClientCall = async (data: Assistant, _stream?: MediaStream) => {
  const Vapi = (await import("@vapi-ai/web")).default;

  const { env } = await import("~/env");

  const vapi = new Vapi(`${env.NEXT_PUBLIC_VAPI_API_KEY}`);

  await vapi.start(data.id);

  return vapi;
};

export const vapiClient = createClient<
  VapiProvider,
  ReturnType<typeof vapiStartClientCall>
>(vapiStartClientCall);
