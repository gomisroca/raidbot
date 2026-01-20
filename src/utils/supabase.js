import { createClient } from '@supabase/supabase-js';

export function createSupabaseClient(env) {
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY);
}

export async function insertPollOnCreation({
  supabase,
  guildId,
  channelId,
  messageId,
  pollType,
  footerData,
}) {
  const { data, error } = await supabase
    .from('raids')
    .insert([
      {
        guild_id: guildId,
        channel_id: channelId,
        message_id: messageId,
        poll_type: pollType,
        status: 'open',
        footer_data: footerData || {},
      },
    ])
    .select();
  if (error) console.error('Supabase insertPollOnCreation error:', error);
  return data?.[0];
}

export async function markPollFinalized({ supabase, messageId, startTime }) {
  const { error } = await supabase
    .from('raids')
    .update({ status: 'finalized', start_time: startTime })
    .eq('message_id', messageId);
  if (error) console.error('Supabase markPollFinalized error:', error);
}
