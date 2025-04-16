/**
 * The core server that runs on a Cloudflare worker.
 */

import { AutoRouter } from 'itty-router';
import {
  InteractionResponseFlags,
  InteractionResponseType,
  InteractionType,
  verifyKey,
} from 'discord-interactions';
import { DAYS_COMMAND, TIMES_COMMAND } from './commands.js';

class JsonResponse extends Response {
  constructor(body, init) {
    const jsonBody = JSON.stringify(body);
    init = init || {
      headers: {
        'content-type': 'application/json;charset=UTF-8',
      },
    };
    super(jsonBody, init);
  }
}

const router = AutoRouter();

function formatFriendlyDate(date) {
  const dayNames = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const weekday = dayNames[date.getDay()];
  const day = date.getDate();
  const month = monthNames[date.getMonth()];

  const ordinal = (n) => {
    if (n > 3 && n < 21) return `${n}th`;
    switch (n % 10) {
      case 1:
        return `${n}st`;
      case 2:
        return `${n}nd`;
      case 3:
        return `${n}rd`;
      default:
        return `${n}th`;
    }
  };

  return `${weekday}, ${ordinal(day)} of ${month}`;
}

/**
 * A simple :wave: hello page to verify the worker is working.
 */
router.get('/', (request, env) => {
  return new Response(`👋 ${env.DISCORD_APPLICATION_ID}`);
});

/**
 * Main route for all requests sent from Discord.  All incoming messages will
 * include a JSON payload described here:
 * https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object
 */
router.post('/', async (request, env) => {
  const { isValid, interaction } = await server.verifyDiscordRequest(
    request,
    env,
  );
  if (!isValid || !interaction) {
    return new Response('Bad request signature.', { status: 401 });
  }

  if (interaction.type === InteractionType.PING) {
    // The `PING` message is used during the initial webhook handshake, and is
    // required to configure the webhook in the developer portal.
    return new JsonResponse({
      type: InteractionResponseType.PONG,
    });
  }

  if (interaction.type === InteractionType.APPLICATION_COMMAND) {
    // Most user commands will come as `APPLICATION_COMMAND`.
    switch (interaction.data.name.toLowerCase()) {
      case DAYS_COMMAND.name.toLowerCase(): {
        return new JsonResponse({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            poll: {
              question: {
                text: 'What day(s) should we raid next week?',
              },
              answers: [
                {
                  answer_id: 1,
                  poll_media: { text: 'Tuesday' },
                },
                {
                  answer_id: 2,
                  poll_media: { text: 'Wednesday' },
                },
                {
                  answer_id: 3,
                  poll_media: { text: 'Thursday' },
                },
                {
                  answer_id: 4,
                  poll_media: { text: 'Friday' },
                },
                {
                  answer_id: 5,
                  poll_media: { text: 'Saturday' },
                },
                {
                  answer_id: 6,
                  poll_media: { text: 'Sunday' },
                },
                {
                  answer_id: 7,
                  poll_media: { text: 'Monday' },
                },
              ],
              allow_multiselect: true,
            },
          },
        });
      }
      case TIMES_COMMAND.name.toLowerCase(): {
        const timeOption = interaction.data.options.find(
          (opt) => opt.name === 'time',
        );
        const dateOption = interaction.data.options.find(
          (opt) => opt.name === 'date',
        );
        // Time handling
        const time = timeOption.value;
        let startHour;
        let startMinutes;
        if (time.includes(':')) {
          const [hour, minutes] = time.split(':').map(Number);
          startHour = parseInt(hour, 10);
          startMinutes = parseInt(minutes, 10);
        } else {
          startHour = parseInt(time, 10);
          startMinutes = 0;
        }
        if (
          isNaN(startHour) ||
          isNaN(startMinutes) ||
          startHour < 0 ||
          startHour > 23 ||
          startMinutes < 0 ||
          startMinutes > 59
        ) {
          return new JsonResponse({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: `Invalid time. Please use the format "HH:MM" or "HH".`,
              flags: InteractionResponseFlags.EPHEMERAL,
            },
          });
        }

        // Date handling
        const date = dateOption.value;
        let [day, month, year] = date.split('/').map(Number);
        if (isNaN(year)) {
          year = new Date().getFullYear() - 2000;
        }
        if (
          isNaN(day) ||
          day < 1 ||
          day > 31 ||
          isNaN(month) ||
          month < 1 ||
          month > 12
        ) {
          return new JsonResponse({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: `Invalid date. Please use the format "DD/MM/YY".`,
              flags: InteractionResponseFlags.EPHEMERAL,
            },
          });
        }
        const baseDate = new Date(2000 + year, month - 1, day);
        const formattedDay = formatFriendlyDate(baseDate);

        let timestamps = [];

        let icons = {
          1: '1️⃣',
          2: '2️⃣',
          3: '3️⃣',
          4: '4️⃣',
        };

        for (let i = 0; i < 4; i++) {
          const hour = startHour + i;
          const targetDate = new Date(baseDate);
          targetDate.setHours(hour, startMinutes, 0, 0);

          const unix = Math.floor(targetDate.getTime() / 1000);
          timestamps.push({
            icon: i + 1,
            st: hour,
            localized: `<t:${unix}:t>`,
          });
        }

        return new JsonResponse({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `What time should raid start on **${formattedDay}**?\n
            ${timestamps.map((t) => `\n ${icons[t.icon]} ${t.st}ST   -   ${t.localized} Your Time`).join('')}`,
            poll: {
              question: {
                text: 'What time should raid start?',
              },
              answers: [
                {
                  answer_id: 1,
                  poll_media: {
                    text: `${icons[timestamps[0].icon]} ${timestamps[0].st}ST`,
                  },
                },
                {
                  answer_id: 2,
                  poll_media: {
                    text: `${icons[timestamps[1].icon]} ${timestamps[1].st}ST`,
                  },
                },
                {
                  answer_id: 3,
                  poll_media: {
                    text: `${icons[timestamps[2].icon]} ${timestamps[2].st}ST`,
                  },
                },
                {
                  answer_id: 4,
                  poll_media: {
                    text: `${icons[timestamps[3].icon]} ${timestamps[3].st}ST`,
                  },
                },
              ],
              allow_multiselect: true,
            },
          },
        });
      }
      default:
        return new JsonResponse({ error: 'Unknown Type' }, { status: 400 });
    }
  }

  console.error('Unknown Type');
  return new JsonResponse({ error: 'Unknown Type' }, { status: 400 });
});
router.all('*', () => new Response('Not Found.', { status: 404 }));

async function verifyDiscordRequest(request, env) {
  const signature = request.headers.get('x-signature-ed25519');
  const timestamp = request.headers.get('x-signature-timestamp');
  const body = await request.text();
  const isValidRequest =
    signature &&
    timestamp &&
    (await verifyKey(body, signature, timestamp, env.DISCORD_PUBLIC_KEY));
  if (!isValidRequest) {
    return { isValid: false };
  }

  return { interaction: JSON.parse(body), isValid: true };
}

const server = {
  verifyDiscordRequest,
  fetch: router.fetch,
};

export default server;
