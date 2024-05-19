/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { confirm, input, select } from "@inquirer/prompts";
import { Provider } from "@prisma/client";

import { hume } from "../impls/hume/hume";
import { retell } from "../impls/retell/retell";
import { vapi } from "../impls/vapi/vapi";

import { db } from "~/server/db";

const provider: Provider = (await select({
  message: "Select a provider",
  choices: Object.keys(Provider).map((key) => ({
    name: key,
    value: key,
  })),
})) as Provider;

const schemas =
  provider === "Vapi"
    ? vapi.schemas
    : provider === "Retell"
      ? retell.schemas
      : provider === "Hume"
        ? hume.schemas
        : null;

if (!schemas) {
  throw new Error(`Invalid provider: ${provider}`);
}

if (provider === "Hume") {
  throw new Error("Not implemented here use generateHumeConfig.ts");
}

const llmConfig: Record<string, string | number> = {};

let modelProvider = "openai";

if ("provider" in schemas.modelSchema.shape) {
  // console.log(schemas.modelSchema.shape);

  modelProvider = await select({
    message: "Select a model provider",
    choices: schemas.modelSchema.shape.provider._def.values.map((key) => ({
      name: key,
      value: key,
    })),
  });
}

const model = await input({
  message: `Enter a model name for ${modelProvider}`,
});

const editTemperature = await confirm({
  message: "Do you want to edit temperature first?",
});

if (editTemperature) {
  const temperature = await input({
    message: `Enter a temperature for ${model}`,
    default: "0.7",
  });
  llmConfig.temperature = temperature;
}

llmConfig.provider = modelProvider;
llmConfig.model = model;

let ttsConfig = {};

if ("ttsSchema" in schemas) {
  const ttsProvider = await select({
    message: "Select a TTS provider",
    // @ts-expect-error
    choices: schemas.ttsSchema?.shape.provider._def.values.map((key) => ({
      name: key,
      value: key,
    })),
  });

  const voiceId = await input({
    message: `Enter a voiceId for ${ttsProvider}`,
  });

  ttsConfig = schemas.ttsSchema?.new({
    provider: ttsProvider,
    voiceId,
  });

  if (provider === "Retell") {
    const editSampleRate = await confirm({
      message: "Do you want to edit sample rate?",
    });

    if (editSampleRate) {
      const sampleRate = await input({
        message: "Enter a sample rate",
      });

      // @ts-expect-error
      ttsConfig.sample_rate = sampleRate;
    }
  }
}

const transcriberConfig: Record<string, string | number> = {};

if ("transcriberSchema" in schemas) {
  const transcriberProvider = await select({
    message: "Select a transcriber provider",
    // @ts-expect-error
    choices: schemas.transcriberSchema?.shape.provider._def.values.map(
      // @ts-expect-error
      (key) => ({
        name: key,
        value: key,
      }),
    ),
  });

  const transcriberModel = await input({
    message: `Enter a model f or ${transcriberProvider}`,
  });

  transcriberConfig.provider = transcriberProvider as string;
  transcriberConfig.model = transcriberModel;
}

const addCustomProperties = await confirm({
  message: "Do you want to add custom properties?",
});

const customProperties: Record<string, string | number> = {};

if (addCustomProperties) {
  while (true) {
    const key = await input({
      message: "Enter a key",
    });

    const value = await input({
      message: `Enter a value for ${key}`,
    });

    customProperties[key] = value;

    const addCustomProperties = await confirm({
      message: "Do you want to add more custom properties?",
    });
    if (!addCustomProperties) break;
  }
}

const labelSuffix = await input({
  message: `Label your model. ${provider.toLowerCase()}-${model}- will be added to the front`,
});

const label = `${provider.toLowerCase()}-${model}-${labelSuffix}`.toLowerCase();

console.log("Your model will be labeled as", label);

const createConfirm = await confirm({
  message: "Do you want to create a new model configuration?",
});

if (createConfirm) {
  const model = await db.model.create({
    data: {
      label,
      provider,
      llmConfig: JSON.stringify(llmConfig),
      asrConfig: JSON.stringify(transcriberConfig),
      ttsConfig: JSON.stringify(ttsConfig),
      extraConfig: JSON.stringify(customProperties),
    },
  });

  console.log(
    "Your model configuration has been created and added to the pool",
  );

  console.dir(model, { depth: null });
}
