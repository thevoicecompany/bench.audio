import { z } from "zod";
import { zpp } from "@cryop/zpp";
import { createProvider } from "../../lib/providerSchema";
import { Err, Ok } from "ts-results";
import type { ConvoADT, StartCall } from "~/lib/types";
import type { PromptFunction } from "~/prompts/promptSchema";
import type { Model } from "@prisma/client";

// Define the Ultravox-specific configuration options
const modelSchema = zpp(
    z.object({
        apiKey: z.string(),
        endpoint: z.string().url(),
        timeout: z.number().optional().default(5000),
        // Add additional configuration options as required by Ultravox
    })
);

// Define the type of the response from Ultravox API
type UltravoxResponse = {
    conversationId: string;
    status: string;
    // Add other relevant response fields
};

// Implement the Ultravox-specific server-side call creation logic
const serverCreateCall = async (
    convo: ConvoADT,
    promptFn: PromptFunction,
    model: Model
): Promise<StartCall<UltravoxResponse>> => {
    const configResult = modelSchema.jsonParseSafe(model.config);
    if (!configResult.success) {
        return Err(`Invalid Ultravox config: ${configResult.error.message}`);
    }

    const { apiKey, endpoint, timeout } = configResult.data;

    try {
        const prompt = promptFn(convo.length);
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(`${endpoint}/start-conversation`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                conversationId: convo.id,
                prompt: prompt.text,
                // Include other necessary parameters
            }),
            signal: controller.signal,
        });

        clearTimeout(id);

        if (!response.ok) {
            const error = await response.text();
            return Err(`Ultravox API error: ${error}`);
        }

        const data: UltravoxResponse = await response.json();
        return Ok(data);
    } catch (error: any) {
        if (error.name === 'AbortError') {
            return Err("Ultravox API request timed out");
        }
        return Err(`Network error: ${error.message}`);
    }
};

export const ultravox = createProvider("Ultravox", serverCreateCall, {
    modelSchema,
});

export type UltravoxProvider = typeof ultravox;