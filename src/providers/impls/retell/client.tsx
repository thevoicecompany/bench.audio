import type { RetellProvider } from "./retell";
import type Retell from "retell-sdk";

import { createClient } from "~/providers/lib/providerSchema";

const retellStartClientCall = async (
  details: Retell.Call.RegisterCallResponse,
  stream?: MediaStream,
) => {
  const { RetellWebClient } = await import("retell-client-js-sdk");
  const sdk = new RetellWebClient();

  await sdk.startConversation({
    callId: details.call_id,
    customStream: stream,
    sampleRate: details.sample_rate,
    enableUpdate: true, // (Optional) You want to receive the update event such as transcript
  });

  return sdk;
};

export const retellClient = createClient<
  RetellProvider,
  ReturnType<typeof retellStartClientCall>
>(retellStartClientCall);
