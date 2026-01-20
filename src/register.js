import dotenv from 'dotenv';
import { DAYS_COMMAND, TIMES_COMMAND } from './commands.js';
import process from 'node:process';
dotenv.config({ path: '.dev.vars' });

const token = process.env.DISCORD_TOKEN;
const applicationId = process.env.DISCORD_APPLICATION_ID;

if (!token || !applicationId) {
  throw new Error('DISCORD_TOKEN and DISCORD_APPLICATION_ID are required.');
}

const commands = [DAYS_COMMAND, TIMES_COMMAND];

const url = `https://discord.com/api/v10/applications/${applicationId}/commands`;

try {
  const response = await fetch(url, {
    method: 'PUT', // replace all commands
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bot ${token}`,
    },
    body: JSON.stringify(commands),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Failed to register commands: ${response.status} ${response.statusText}\n${text}`,
    );
  }

  const data = await response.json();
  console.log('Registered commands successfully:');
  console.log(JSON.stringify(data, null, 2));
} catch (err) {
  console.error(err);
}
