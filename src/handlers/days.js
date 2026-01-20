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

  return new JsonResponse({
    type: 4,
    data: {
      poll: {
        question: { text: 'What day(s) should we raid next week?' },
        answers: pollAnswers,
        allow_multiselect: true,
        duration: 48,
      },
    },
  });
}
