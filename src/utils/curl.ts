export default async function curl(url: string) {
  const decoder = new TextDecoder();
  const execResponse = Deno.run({
    cmd: ["curl", url],
    stdout: "piped",
    stderr: "piped"
  });

  const output = await execResponse.output();

  return decoder.decode(output);
}