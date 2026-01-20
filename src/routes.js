import { AutoRouter } from 'itty-router';
import { InteractionType, InteractionResponseType } from 'discord-interactions';
import { verifyDiscordRequest, JsonResponse } from './utils/discord.js';
import { DAYS_COMMAND, TIMES_COMMAND } from './commands.js';
import { handleDays } from './handlers/days.js';
import { handleTimes } from './handlers/times.js';

export const router = AutoRouter();

router.get('/', (req, env) => new Response(`👋 ${env.DISCORD_APPLICATION_ID}`));

router.post('/', async (request, env) => {
  const { isValid, interaction } = await verifyDiscordRequest(request, env);
  if (!isValid || !interaction)
    return new Response('Bad request signature.', { status: 401 });

  if (interaction.type === InteractionType.PING) {
    return new JsonResponse({ type: InteractionResponseType.PONG });
  }

  if (interaction.type === InteractionType.APPLICATION_COMMAND) {
    const cmd = interaction.data.name.toLowerCase();
    switch (cmd) {
      case DAYS_COMMAND.name.toLowerCase():
        return handleDays(interaction, env);
      case TIMES_COMMAND.name.toLowerCase():
        return handleTimes(interaction, env);
      default:
        return new JsonResponse({ error: 'Unknown Command' }, { status: 400 });
    }
  }

  return new JsonResponse({ error: 'Unknown Type' }, { status: 400 });
});

router.all('*', () => new Response('Not Found', { status: 404 }));
