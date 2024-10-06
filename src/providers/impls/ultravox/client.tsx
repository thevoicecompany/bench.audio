import type { UltravoxProvider } from "./ultravox";

import { createClient } from "~/providers/lib/providerSchema";
import { useEffect } from "react";

export type UltravoxJsxProps = {
    moveToInProgress: () => void;
    finishConvo: () => void;
    setStopCb: (cb: () => void) => void;
};

const clientStartCall = async (details: {
    apiKey: string;
    endpoint: string;
}) => {
    const { UltravoxProviderComponent, useUltravox } = await import(
        "@ultravox/voice-react"
    );

    const Controls = (props: UltravoxJsxProps) => {
        const { disconnect, connect, status } = useUltravox();

        useEffect(() => {
            if (status === "connected") {
                props.moveToInProgress();
            }

            if (status === "disconnected") {
                props.finishConvo();
            }
        }, [status, props]);

        useEffect(() => {
            if (status === "idle") {
                void connect();
            }
        }, [status, connect]);

        useEffect(() => {
            props.setStopCb(() => {
                disconnect();
            });
        }, [disconnect, props]);

        return (
            <div className="flex py-4">
                <button
                    onClick={() => disconnect()}
                    className="px-4 py-2 bg-red-500 text-white rounded"
                >
                    Stop Conversation
                </button>
            </div>
        );
    };

    const Ultravox = (props: UltravoxJsxProps) => {
        return (
            <UltravoxProviderComponent
                apiKey={details.apiKey}
                endpoint={details.endpoint}
            >
                <Controls {...props} />
            </UltravoxProviderComponent>
        );
    };

    return Ultravox;
};

export const ultravox = createClient("Ultravox", clientStartCall, {
    modelSchema,
});

export type UltravoxClient = typeof ultravox;