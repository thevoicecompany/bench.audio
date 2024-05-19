import type { HumeJsxProps } from "../impls/hume/client";
import type Vapi from "@vapi-ai/web";

import { type RetellWebClient } from "retell-client-js-sdk";

export type ClientStartConvo =
  | { type: "vapi"; sdk: Vapi }
  | { type: "retell"; sdk: RetellWebClient }
  | { type: "hume"; component: (props: HumeJsxProps) => JSX.Element };
