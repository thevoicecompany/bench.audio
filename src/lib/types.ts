import { type ConvoLength } from "@prisma/client";
import { type Result } from "ts-results";

type OnlineConvo = {
  type: "Online";
  length: ConvoLength;
};

type PhoneConvo = {
  type: "Phone";
  phoneNumber: string;
  length: ConvoLength;
};

export type ConvoADT = PhoneConvo | OnlineConvo;

export type ExtendedConvoADT =
  | PhoneConvo
  | (OnlineConvo & {
      mediaStreams: {
        input: MediaStream;
        output: MediaStream;
      };
    });

export const PhoneConvo = (
  length: ConvoLength,
  phoneNumber?: string,
): ConvoADT => {
  if (!phoneNumber) throw new Error("Phone number is required");

  return {
    type: "Phone",
    phoneNumber,
    length,
  };
};

export const OnlineConvo = (length: ConvoLength): ConvoADT => ({
  type: "Online",
  length,
});

export type StartCallSuccess<T = unknown> =
  | {
      type: "Phone";
      details: T;
    }
  | {
      type: "Online";
      details: T;
    };

export type StartCall<T = unknown> = Result<StartCallSuccess<T>, string>;
