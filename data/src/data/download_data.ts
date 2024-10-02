import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();


const battles = await prisma.battle.findMany({
    include: {
        modelA: true,
        modelB: true,
    },
    where: {
        AND: [
            {
                NOT: {
                    outcome: null,
                },
            },
            {
                state: "Done"
            }
        ],
    },
});

const outputPath = `${import.meta.dir}/.data/battles.json`;
await Bun.write(outputPath, JSON.stringify(battles, null, 2));
console.log(`Battles written to ${outputPath}`);