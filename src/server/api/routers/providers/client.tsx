import { type Assistant } from "@vapi-ai/web/api";
import type Retell from "retell-sdk";
import { env } from "~/env";

import { VoiceProvider, VoiceReadyState, useVoice } from "@humeai/voice-react";
import { use, useEffect } from "react";

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

export type HumeJsxProps = {
  moveToInProgress: () => void;
  finishConvo: () => void;
  setStopCb: (cb: () => void) => void;
};

const humeCall = (details: { accessToken: string; configId: string }) => {
  const Controls = (props: HumeJsxProps) => {
    const { disconnect, readyState, connect } = useVoice();

    useEffect(() => {
      if (readyState === VoiceReadyState.OPEN) {
        props.moveToInProgress();
      }

      if (readyState === VoiceReadyState.CLOSED) {
        props.finishConvo();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [readyState]);

    useEffect(() => {
      if (readyState === VoiceReadyState.IDLE) {
        void connect();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [readyState]);

    useEffect(() => {
      props.setStopCb(() => {
        disconnect();
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
      <div className="flex py-4">
        This model needs you to start the conversation, just say hi or whatever
        you'd like
      </div>
    );
  };

  const Hume = (props: HumeJsxProps) => {
    return (
      <VoiceProvider
        auth={{ type: "accessToken", value: details.accessToken }}
        configId={details.configId}
      >
        <Controls {...props} />
      </VoiceProvider>
    );
  };

  return Hume;
};

export const clientCall = {
  vapi: vapiStartClientCall,
  retell: retellStartClientCall,
  hume: humeCall,
};
