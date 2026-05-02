// watcher/lib/docker.server.ts
import "server-only";
import Docker from "dockerode";

export const docker = new Docker({
  socketPath: "/var/run/docker.sock",
});