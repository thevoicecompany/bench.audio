/* eslint-disable @typescript-eslint/no-explicit-any */

import type { ExtendedZodType } from "@cryop/zpp";
import type { Model, Provider } from "@prisma/client";
import type { ConvoADT, StartCall } from "~/lib/types";
import type { PromptFunction } from "~/prompts/promptSchema";
import type { z } from "zod";

export type ProviderSchema<
  T,
  Ms extends z.ZodType<any, any> = z.ZodType<any, any>,
  TTs extends z.ZodType<any, any> = z.ZodType<any, any>,
  TRs extends z.ZodType<any, any> = z.ZodType<any, any>,
  Es extends z.ZodType<any, any> = z.ZodType<any, any>,
> = {
  type: Provider;

  serverCreateCall: (
    convo: ConvoADT,
    promptFn: PromptFunction,
    model: Model,
  ) => Promise<StartCall<T>>;
  schemas: {
    modelSchema: ExtendedZodType<Ms>;
    ttsSchema?: ExtendedZodType<TTs>;
    transcriberSchema?: ExtendedZodType<TRs>;
    extraConfigSchema?: ExtendedZodType<Es>;
  };
};

export type ExtractDetails<P extends ProviderSchema<any, any, any, any, any>> =
  P extends ProviderSchema<infer T> ? { details: T } : never;

export const createProvider = <
  T,
  Ms extends z.ZodType<any, any> = z.ZodType<any, any>,
  TTs extends z.ZodType<any, any> = z.ZodType<any, any>,
  TRs extends z.ZodType<any, any> = z.ZodType<any, any>,
  Es extends z.ZodType<any, any> = z.ZodType<any, any>,
>(
  provider: Provider,
  serverCreateCall: (
    convo: ConvoADT,
    promptFn: PromptFunction,
    model: Model,
  ) => Promise<StartCall<T>>,
  schemas: {
    modelSchema: ExtendedZodType<Ms>;
    ttsSchema?: ExtendedZodType<TTs>;
    transcriberSchema?: ExtendedZodType<TRs>;
    extraConfigSchema?: ExtendedZodType<Es>;
  },
): ProviderSchema<T, Ms, TTs, TRs, Es> => {
  return {
    type: provider,
    serverCreateCall,
    schemas,
  };
};

export const createClient = <
  T extends ProviderSchema<any, any, any, any, any>,
  U,
>(
  func: (details: ExtractDetails<T>["details"]) => U,
) => ({
  clientStartCall: func,
});
