import { verifyKey } from 'discord-interactions';

export class JsonResponse extends Response {
  constructor(body, init) {
    super(JSON.stringify(body), {
      headers: { 'content-type': 'application/json;charset=UTF-8' },
      ...init,
    });
  }
}

export async function verifyDiscordRequest(request, env) {
  const signature = request.headers.get('x-signature-ed25519');
  const timestamp = request.headers.get('x-signature-timestamp');
  const body = await request.text();
  const isValid =
    signature &&
    timestamp &&
    (await verifyKey(body, signature, timestamp, env.DISCORD_PUBLIC_KEY));
  return { isValid, interaction: isValid ? JSON.parse(body) : null };
}
