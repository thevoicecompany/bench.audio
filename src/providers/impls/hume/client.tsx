import type { HumeProvider } from "./hume";

import { createClient } from "~/providers/lib/providerSchema";

export type HumeJsxProps = {
  moveToInProgress: () => void;
  finishConvo: () => void;
  setStopCb: (cb: () => void) => void;
};

const clientStartCall = async (details: {
  accessToken: string;
  configId: string;
}) => {
  // import { VoiceProvider, VoiceReadyState, useVoice } from "@humeai/voice-react";

  const { VoiceProvider, VoiceReadyState, useVoice } = await import(
    "@humeai/voice-react"
  );

  const { useEffect } = await import("react");

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
        {`you'd`} like
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

export const humeClient = createClient<
  HumeProvider,
  ReturnType<typeof clientStartCall>
>(clientStartCall);
