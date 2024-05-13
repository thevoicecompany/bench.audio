import { type Assistant } from "@vapi-ai/web/api";
import type Retell from "retell-sdk";
import { env } from "~/env";

const vapiStartClientCall = async (data: Assistant, stream?: MediaStream) => {
  const Vapi = (await import("@vapi-ai/web")).default;

  const vapi = new Vapi(`${env.NEXT_PUBLIC_VAPI_API_KEY}`);

  await vapi.start(data.id);

  return vapi;
};

const retellStartClientCall = async (
  details: Retell.Call.RegisterCallResponse,
  stream?: MediaStream,
) => {
  const RetellWebClient = (await import("retell-client-js-sdk"))
    .RetellWebClient;

  const sdk = new RetellWebClient();

  await sdk.startConversation({
    callId: details.call_id,
    customStream: stream,
    sampleRate: details.sample_rate,
    enableUpdate: true, // (Optional) You want to receive the update event such as transcript
  });

  return sdk;
};

export const clientCall = {
  vapi: vapiStartClientCall,
  retell: retellStartClientCall,
};
