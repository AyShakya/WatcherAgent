// watcher/app/actions/runAgent.ts
"use server";

export const runtime = "nodejs";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { spawnAgent } from "@/lib/spawnagent.server";
import { prepareAgentEnv } from "@/lib/prepareEnv.server";
import { getDecryptedEnvVars } from "./envActions";
import { headers } from "next/headers";

export async function runAgent(formData: FormData) {
  const prompt = formData.get("prompt");
  const instanceId = formData.get("instanceId");

  if (typeof prompt !== "string" || !prompt.trim()) {
    throw new Error("Prompt is required");
  }

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const instance =
    typeof instanceId === "string" && instanceId
      ? await prisma.instance.findFirst({
          where: { id: instanceId, userId: session.user.id },
        })
      : await prisma.instance.findFirst({
          where: { userId: session.user.id },
          orderBy: { createdAt: "asc" },
        });

  if (!instance) {
    throw new Error("No instance configuration found for this user");
  }

  const decryptedEnv = await getDecryptedEnvVars(instance.id);
  const userEnv = Object.fromEntries(
    Object.entries(decryptedEnv).filter(
      (entry): entry is [string, string] => typeof entry[1] === "string" && entry[1].length > 0
    )
  );

  const jobId = crypto.randomUUID();
  const userId = session.user.id;

  const finalEnv = prepareAgentEnv({
    userEnv,
    prompt: prompt.trim(),
    jobId,
    userId,
  });

  const { containerId } = await spawnAgent({
    env: finalEnv,
    jobId,
    userId,
  });

  // 🔹 TODO: store job in DB (Supabase)
  console.log("Started:", { jobId, containerId });

  return { jobId };
}