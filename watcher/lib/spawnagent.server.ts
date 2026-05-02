// watcher/lib/spawnAgent.server.ts
import "server-only";
import { docker } from "./docker.server";

type SpawnAgentInput = {
  env: Record<string, string>;
  jobId: string;
  userId: string;
};

export async function spawnAgent({ env, jobId, userId }: SpawnAgentInput) {
  const envArray = Object.entries(env).map(
    ([k, v]) => `${k}=${v}`
  );

  const container = (await docker.createContainer({
    Image: "watcherai-image",
    Env: envArray,
    name: `agent_${userId}_${jobId}`,

    HostConfig: {
      Memory: 512 * 1024 * 1024,
      NanoCpus: 500000000,
      AutoRemove: true,
    },
  })) as unknown as {
    start(): Promise<void>;
    id: string;
  };

  await container.start();

  return { containerId: container.id };
}