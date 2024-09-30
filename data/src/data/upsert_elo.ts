/* eslint-disable @typescript-eslint/no-unused-vars */
import { env } from "bun";

import { PrismaClient } from "@prisma/client";



type JsonData = Record<string, number>

const data: JsonData = await Bun.file(`${import.meta.dir}/.data/final_elo_scores.json`).json();

const prisma = new PrismaClient();


for (const [id, elo] of Object.entries(data)) {
    await prisma.elo.upsert({
        where: {
            modelId: id
        },
        update: {
            score: elo
        },
        create: {
            score: elo,
            model: {
                connect: {
                    id
                }
            }
        }
    })
}

console.log("updated elo scores to prisma")

import { UTApi } from "uploadthing/server";


const utapi = new UTApi({
    token: env.UPLOADTHING_TOKEN
});

const IMAGES: Record<string, { local_src: string, global_src: string | null }> = {
    "avg_win_rate": {
        local_src: `${import.meta.dir}/.data/average_win_rate_bar_chart.png`,
        global_src: null
    },
    "bootstrap_elo": {
        local_src: `${import.meta.dir}/.data/average_win_rate_bar_chart.png`,
        global_src: null
    },
    "predicted_win_rate": {
        local_src: `${import.meta.dir}/.data/predicted_win_rate_elo_ratings.png`,
        global_src: null
    }
}

for (const [_, image] of Object.entries(IMAGES)) {

    const file = Bun.file(image.local_src);

    const jsFile = new File([await file.arrayBuffer()], image.local_src, { type: file.type })

    const res = await utapi.uploadFiles([jsFile])

    image.global_src = res[0]?.data?.url ?? null
}

if (!IMAGES.avg_win_rate?.global_src || !IMAGES.bootstrap_elo?.global_src || !IMAGES.predicted_win_rate?.global_src) {
    throw new Error("Missing image src")
}


await prisma.images.upsert({
    where: {
        id: "1"
    },
    update: {
        avg_win_rate_src: IMAGES.avg_win_rate.global_src,
        bootstrap_elo_src: IMAGES.bootstrap_elo.global_src,
        predicted_win_rate_src: IMAGES.predicted_win_rate.global_src
    },
    create: {
        avg_win_rate_src: IMAGES.avg_win_rate.global_src,
        bootstrap_elo_src: IMAGES.bootstrap_elo.global_src,
        predicted_win_rate_src: IMAGES.predicted_win_rate.global_src
    }
})