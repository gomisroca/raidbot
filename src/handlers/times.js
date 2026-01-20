import { JsonResponse } from '../utils/discord.js';
import { formatFriendlyDate } from '../utils/date.js';
import {
  createSupabaseClient,
  insertPollOnCreation,
} from '../utils/supabase.js';

export async function handleTimes(interaction, env) {
  const supabase = createSupabaseClient(env);

  const timeOption = interaction.data.options.find(
    (opt) => opt.name === 'time',
  );
  const dateOption = interaction.data.options.find(
    (opt) => opt.name === 'date',
  );

  if (!timeOption || !dateOption) {
    return new JsonResponse({
      type: 4,
      data: {
        content: 'Please provide both a date and time.',
        flags: 64, // ephemeral
      },
    });
  }

  // Parse time
  const time = timeOption.value;
  let startHour, startMinutes;
  if (time.includes(':')) {
    const [hour, minutes] = time.split(':').map(Number);
    startHour = hour;
    startMinutes = minutes;
  } else {
    startHour = parseInt(time, 10);
    startMinutes = 0;
  }
  if (
    isNaN(startHour) ||
    startHour < 0 ||
    startHour > 23 ||
    isNaN(startMinutes) ||
    startMinutes < 0 ||
    startMinutes > 59
  ) {
    return new JsonResponse({
      type: 4,
      data: { content: 'Invalid time. Use HH:MM or HH.', flags: 64 },
    });
  }

  // Parse date
  let [day, month, year] = dateOption.value.split('/').map(Number);
  if (isNaN(year)) year = new Date().getFullYear() - 2000;
  if (
    isNaN(day) ||
    isNaN(month) ||
    day < 1 ||
    day > 31 ||
    month < 1 ||
    month > 12
  ) {
    return new JsonResponse({
      type: 4,
      data: { content: 'Invalid date. Use DD/MM/YY.', flags: 64 },
    });
  }

  const baseDate = new Date(2000 + year, month - 1, day);
  const formattedDay = formatFriendlyDate(baseDate);

  // Generate 4 hour options
  const timestamps = [];
  const icons = ['1️⃣', '2️⃣', '3️⃣', '4️⃣'];

  for (let i = 0; i < 4; i++) {
    const hour = startHour + i;
    const targetDate = new Date(baseDate);
    targetDate.setHours(hour, startMinutes, 0, 0);
    const unix = Math.floor(targetDate.getTime() / 1000);
    timestamps.push({ icon: icons[i], hour, unix });
  }

  // Create footer metadata
  const footerData = {
    type: 'times',
    date: dateOption.value,
    startHour,
    startMinutes,
    options: timestamps.map(
      (t) => `${t.hour}:${startMinutes.toString().padStart(2, '0')}`,
    ),
  };

  // Insert poll into Supabase
  await insertPollOnCreation({
    supabase,
    guildId: interaction.guild_id,
    channelId: interaction.channel_id,
    messageId: interaction.id, // use interaction ID temporarily; will update with actual message ID if needed
    pollType: 'times',
    footerData,
  });

  // Build poll response
  const pollAnswers = timestamps.map((t, idx) => ({
    answer_id: idx + 1,
    poll_media: { text: `${t.icon} ${t.hour}ST` },
  }));

  return new JsonResponse({
    type: 4,
    data: {
      content:
        `What time should raid start on **${formattedDay}**?\n` +
        timestamps
          .map((t) => `\n ${t.icon} ${t.hour}ST - <t:${t.unix}:t>`)
          .join(''),
      poll: {
        question: { text: 'What time should raid start?' },
        answers: pollAnswers,
        allow_multiselect: true,
        duration: 48,
      },
    },
  });
}
