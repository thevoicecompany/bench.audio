/* eslint-disable @typescript-eslint/ban-ts-comment */
import { db } from "~/server/db";

const models = await db.model.findMany({
  select: {
    llmConfig: true,
    asrConfig: true,
    ttsConfig: true,
    provider: true,
    label: true,
  },
});

const groupedModels = models.reduce(
  (acc, model) => {
    if (!acc[model.provider]) {
      acc[model.provider] = [];
    }
    if (model.llmConfig) {
      // @ts-expect-error
      model.llmConfig = JSON.parse(model.llmConfig);
    }
    if (model.asrConfig) {
      // @ts-expect-error
      model.asrConfig = JSON.parse(model.asrConfig);
    }
    if (model.ttsConfig) {
      // @ts-expect-error
      model.ttsConfig = JSON.parse(model.ttsConfig);
    }

    acc[model.provider]?.push(model);
    return acc;
  },
  {} as Record<string, typeof models>,
);

await Bun.write(
  "./src/providers/config/config.json",
  JSON.stringify(groupedModels),
);
