import { env } from "bun";

import { confirm, input } from "@inquirer/prompts";
import { Provider } from "@prisma/client";

import { hume } from "../impls/hume/hume";

import { prompts } from "~/prompts/promptSchema";
import { db } from "~/server/db";

const promptKey = await input({
  message: "Enter a prompt key",
});

const promptFn = prompts[promptKey as keyof typeof prompts];

if (!promptFn) {
  throw new Error("Invalid prompt key");
}

const prompt = promptFn("Medium");

const promptConfigResponse = await fetch("https://api.hume.ai/v0/evi/prompts", {
  method: "POST",
  headers: {
    "X-Hume-Api-Key": env.HUME_API_KEY ?? "",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    name: `${prompt.key}-${prompt.fullKey}`,
    text: prompt.generalPrompt,
  }),
});

if (!promptConfigResponse.ok) {
  throw new Error("Error creating prompt");
}

const promptConfig = await promptConfigResponse.json();

console.log("Your prompt has been created and added to the pool");

if (!promptConfig) throw new Error("Error creating prompt");

const configResponse = await fetch("https://api.hume.ai/v0/evi/configs", {
  method: "POST",
  headers: {
    "X-Hume-Api-Key": env.HUME_API_KEY ?? "",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    name: `${prompt.key}-${prompt.fullKey}`,
  }),
});

if (!configResponse.ok) {
  throw new Error("Error creating config");
}

const config = await configResponse.json();

if (!config) throw new Error("Error creating config");

const label = await input({
  message: "Enter a model label, hume- will be added to the front",
});

const createConfirm = await confirm({
  message: "Do you want to create a new model configuration?",
});

const llmConfig = hume.schemas.modelSchema.new({
  promptsConfigId: {
    [`${prompt.fullKey}`]: config.id!,
  },
});

if (createConfirm) {
  const model = await db.model.create({
    data: {
      label: `hume-${label}`,
      provider: Provider.Hume,
      llmConfig: JSON.stringify(llmConfig),
    },
  });

  console.log(
    "Your model configuration has been created and added to the pool",
  );

  console.dir(model, { depth: null });
}
