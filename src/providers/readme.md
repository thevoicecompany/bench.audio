# Everything about Providers


The first section is on understanding [providers](#providers). if you want to skip to configuring them, go to [configuring providers](#configuring-providers) or if you want to add a new provider, go to [adding a new provider](#adding-a-new-provider).



## Providers 

1. We set the types of the providers in the `db` using `schema.prisma` as an enum.
```
enum Provider {
    Retell
    Vapi
    Bland
    Hume
}
```
2. All the implementations of the providers are in `impls` folder.
3. Each provider has the following shape:
```ts
export type StartCallSuccess<T = unknown> =
  | {
      type: "Phone";
      details: T;
    }
  | {
      type: "Online";
      details: T;
    };

// Result is from `ts-results` which gives an Ok and Err ADT for returns
export type StartCall<T = unknown> = Result<StartCallSuccess<T>, string>;


export type ProviderSchema<T, U> = {
  type: Provider;
  clientStartCall: (details: T) => U;
  serverStartCall: (
  convo: ConvoADT,
  promptFn: PromptFunction,
  model: Model,
) => Promise<StartCall<T>>;
  schemas: {
    // The extended zod type is from `@cryop/zpp` which is a wrapper around zod, just use zpp(z.object({})) to get the extended zod type
    modelSchema: ExtendedZodType<z.ZodType<any, any>>;
    ttsSchema?: ExtendedZodType<z.ZodType<any, any>>;
    transcriberSchema?: ExtendedZodType<z.ZodType<any, any>>;
    extraConfigSchema?: ExtendedZodType<z.ZodType<any, any>>;
  };
};

```


There some shared code for all providers, generally switching between the different providers.

There are two versions of this, one for the client and one for the server.

server is in `providers/lib/commonServer.ts` here you will find the `switchCreateCall` function which is very simple

client is in `providers/lib/commonClient.tsx` here you will find two functions, `switchStartConvo` which is fairly straightforward and `useStartConvo` which is a bit more jank.

`useStartConvo` is setting up the specific event listeners for each provider inside the react lifecycle.



## Configuring Providers

There will be a `config.json` file which is periodically updated which is a clone of the model config from the database.

This config file is just a mirror but can show you what the database looks like.

The `generateConfig.ts` script is a bit jank will update it.


## Adding a new provider

1. Add a new value to the `enum` in `db/schema.prisma`
2. Add a new folder in `impls` with the name of the provider
3. Add whatever code you need server side to start the provider


You should export both this provider and the type of the provider
```ts
export const hume = createProvider("Hume", serverCreateCall, {
  // these are the schemas for what json object will be sorted as the model config 
  modelSchema: zpp(z.object({})),
  ttsSchema: zpp(z.object({})),
  transcriberSchema: zpp(z.object({})),
  extraConfigSchema: zpp(z.object({})),
});

export type HumeType = typeof hume;

```

4. Create the `client` side code in another file
```ts
import type { VapieProvider } from "./vapi";

const vapiStartClientCall = async (data: Assistant, _stream?: MediaStream) => {
 // do stuff
};

export const vapiClient = createClient<
  VapiProvider,
  ReturnType<typeof vapiStartClientCall>
>(vapiStartClientCall);
```

This client side code enforces the type for the client call based on what is given in the server side code.



5. Add the server side call to the `commonServer.ts` file inside the `switchCreateCall` switch statement
```ts
case "Hume": {
  return hume.serverCreateCall(convo, promptFn, model);
}
```

6. Add the client side call to the `commonClient.tsx` file inside the `switchStartConvo` switch statement
```ts

 case "Hume": {
      const component = await humeClient.clientStartCall(
        state.details as ExtractDetails<HumeProvider>["details"],
      );

      return Ok({ type: "hume", component: component });
    }

```

7. Add the required callbacks based on the sdks events in the `useStartConvo` function switch statement.


if you want help with this, reach out in our [discord](https://sfvoice.company/discord) ping me (@cryogenicplanet)