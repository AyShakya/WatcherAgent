// watcher/app/actions/runAgent.ts
"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { spawnAgent } from "@/lib/spawnagent.server";
import { prepareAgentEnv } from "@/lib/prepareEnv.server";
import { getDecryptedEnvVars } from "./envActions";
import { headers } from "next/headers";
import crypto from "crypto";

export async function runAgent(formData: FormData): Promise<void> {
  const instanceId = formData.get("instanceId");

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

  // Derive final prompt server-side: prefer instance-configured PROMPT, otherwise a safe template using instance name
  const configPrompt = (decryptedEnv as any)?.PROMPT;
  const finalPrompt = typeof configPrompt === "string" && configPrompt.trim()
    ? configPrompt.trim()
    : `Inspect and fix issues for ${instance.name}`;

  // Create job in DB
  await prisma.job.create({
    data: {
      id: jobId,
      instanceId: instance.id,
      userId: userId,
      status: "running",
      prompt: finalPrompt,
    },
  });

  const finalEnv = prepareAgentEnv({
    userEnv,
    prompt: finalPrompt,
    jobId,
    userId,
  });

  try {
    const { containerId } = await spawnAgent({
      env: finalEnv,
      jobId,
      userId,
    });

    // Update job with containerId
    await prisma.job.update({
      where: { id: jobId },
      data: { containerId },
    });

    console.log("Started:", { jobId, containerId });
  } catch (error) {
    console.error("Failed to spawn agent:", error);
    await prisma.job.update({
      where: { id: jobId },
      data: { status: "failed", error: String(error) },
    });
    throw error;
  }
}