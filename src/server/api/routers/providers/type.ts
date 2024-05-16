import type Vapi from "@vapi-ai/web";
import { type RetellWebClient } from "retell-client-js-sdk";
import { type HumeJsxProps } from "./client";

export type ClientStartConvo =
  | { type: "vapi"; sdk: Vapi }
  | { type: "retell"; sdk: RetellWebClient }
  | { type: "hume"; component: (props: HumeJsxProps) => JSX.Element };
