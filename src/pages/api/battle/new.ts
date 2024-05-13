/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import { type NextApiHandler } from "next";
import { clientApi } from "~/utils/api";

const handler: NextApiHandler = async (req, res) => {
  try {
    const type = req.query.type || "Online";
    const len = (req.query.length as string | undefined)?.toLowerCase();

    const length =
      len === "short"
        ? "short"
        : len === "medium"
          ? "medium"
          : len === "unbounded"
            ? "unbounded"
            : "medium";

    const fingerprint = req.query.fingerprint as string;

    const data = await clientApi.battle.create.mutate({
      type: type as "Online" | "Phone",
      length: length,
      fingerprint: fingerprint ?? "random-user",
    });

    const id = data.battle.id;
    const modelA = data.modelA.id;
    const modelB = data.modelB.id;

    const url = `/battles/${id}?modelA=${modelA}&modelB=${modelB}`;

    res.redirect(url);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error", e });
  }
};

export default handler;
