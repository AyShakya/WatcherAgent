import "server-only";
import type DockerType from "dockerode";

type SpawnAgentInput = {
  env: Record<string, string>;
  prompt: string;
  jobId: string;
  userId: string;
};

export async function spawnAgent({
  env,
  prompt,
  jobId,
  userId,
}: SpawnAgentInput) {
  // 1. Dynamically import Docker (avoids Next.js bundling issues)
  const Docker = (await import("dockerode")).default as unknown as typeof DockerType;

  // 2. Connect to Docker Engine (via socket)
  const docker = new Docker({
    socketPath: "/var/run/docker.sock",
  });

  // 3. Convert env object → ["KEY=value"]
  const envArray = Object.entries(env).map(
    ([key, value]) => `${key}=${value}`
  );

  // 4. Create container
  const container = await docker.createContainer({
    Image: "watcherai-image",

    Env: [
      ...envArray,
      `PROMPT=${prompt}`,
      `JOB_ID=${jobId}`,
      `USER_ID=${userId}`,
    ],

    name: `agent_${userId}_${jobId}`,

    HostConfig: {
      Memory: 512 * 1024 * 1024, // 512MB
      NanoCpus: 500000000, // 0.5 CPU
      AutoRemove: true, // auto delete after finish
    },
  }) as unknown as {
    start(): Promise<void>;
    id: string;
  };

  // 5. Start container
  await container.start();

  return {
    containerId: container.id,
  };
}