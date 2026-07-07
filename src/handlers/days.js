import { JsonResponse } from '../utils/discord.js';
import {
  createSupabaseClient,
  insertPollOnCreation,
} from '../utils/supabase.js';

export async function handleDays(interaction, env) {
  const supabase = createSupabaseClient(env);

  // Build footer metadata for the poll
  const footerData = {
    type: 'days',
    options: [
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
      'Monday',
    ],
  };

  // Insert poll into Supabase
  await insertPollOnCreation({
    supabase,
    guildId: interaction.guild_id,
    channelId: interaction.channel_id,
    messageId: interaction.id, // temporary; update with actual message ID if needed
    pollType: 'days',
    footerData,
  });

  // Build poll response
  const pollAnswers = footerData.options.map((day, idx) => ({
    answer_id: idx + 1,
    poll_media: { text: day },
  }));

  const RAIDERS_ROLE_ID = '1269013353926496289';
  const FARM_ROLE_ID = '1507491921235411034';
  const FARM_CHANNEL_ID = '1507491721397796984';

  const roleId =
    interaction.channel_id === FARM_CHANNEL_ID ? FARM_ROLE_ID : RAIDERS_ROLE_ID;

  return new JsonResponse({
    type: 4,
    data: {
      content: `<@&${roleId}>`,
      allowed_mentions: {
        roles: [roleId],
      },
      poll: {
        question: {
          text: `What day(s) should we raid next week?`,
        },
        answers: pollAnswers,
        allow_multiselect: true,
        duration: 48,
      },
    },
  });
}
