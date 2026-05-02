import Docker from "dockerode";

export async function getDocker(): Promise<Docker> {
  return new Docker({
    socketPath: "/var/run/docker.sock",
  });
}