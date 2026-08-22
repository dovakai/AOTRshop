import 'dotenv/config';
import { Client, GatewayIntentBits, Partials } from 'discord.js';
import { createClient } from '@supabase/supabase-js';

const { DISCORD_BOT_TOKEN, DISCORD_CHANNEL_ID, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;

for (const [name, val] of Object.entries({ DISCORD_BOT_TOKEN, DISCORD_CHANNEL_ID, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY })) {
  if (!val) {
    console.error(`Missing env var: ${name}. Copy .env.example to .env and fill it in.`);
    process.exit(1);
  }
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Message, Partials.Channel],
});

function imageAttachments(message) {
  return [...message.attachments.values()].filter(a =>
    (a.contentType && a.contentType.startsWith('image/')) ||
    /\.(png|jpe?g|webp|gif)$/i.test(a.name || '')
  );
}

async function uploadAttachment(attachment, key) {
  const res = await fetch(attachment.url);
  if (!res.ok) throw new Error(`Failed to download attachment: ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  const ext = (attachment.name || 'image.png').split('.').pop().toLowerCase();
  const path = `discord-${key}.${ext}`;

  const { error: uploadErr } = await supabase.storage
    .from('proofs')
    .upload(path, buffer, { contentType: attachment.contentType || 'image/png', upsert: false });
  if (uploadErr) throw uploadErr;

  const { data } = supabase.storage.from('proofs').getPublicUrl(path);
  return data.publicUrl;
}

// Matches messages like: We hope you enjoy your `BLACK FLASH +10`:heart: [$1.20]
function parseReviewMessage(content) {
  if (!content) return { item: null, price: null };
  const itemMatch = content.match(/`([^`]+)`/);
  const priceMatch = content.match(/\[\$(\d+(?:\.\d+)?)\]/);
  return {
    item: itemMatch ? itemMatch[1].trim() : null,
    price: priceMatch ? parseFloat(priceMatch[1]) : null,
  };
}

async function storeReview({ discordMessageId, item, price, imageUrl, createdAt }) {
  const { error } = await supabase.from('trades').insert({
    game: 'AOTR',
    item,
    price,
    image_url: imageUrl,
    discord_message_id: discordMessageId,
    created_at: createdAt,
  });

  if (error) {
    if (error.code === '23505') return; // already stored, skip
    console.error(`Failed to insert trade for message ${discordMessageId}:`, error.message);
    return;
  }
  console.log(`Stored review from message ${discordMessageId}: ${item} ${price ? '$' + price : ''}`);
}

async function processMessage(message) {
  if (message.channelId !== DISCORD_CHANNEL_ID) return;
  if (message.author?.bot) return;

  const images = imageAttachments(message);
  if (!images.length) return;

  const { item: parsedItem, price } = parseReviewMessage(message.content);
  const authorName = message.member?.displayName || message.author?.username || 'Player';
  const item = parsedItem || (message.content?.trim() ? message.content.trim().slice(0, 80) : `Review from ${authorName}`);
  const createdAt = message.createdAt.toISOString();

  for (let i = 0; i < images.length; i++) {
    const discordMessageId = images.length > 1 ? `${message.id}:${i}` : message.id;
    try {
      const imageUrl = await uploadAttachment(images[i], discordMessageId);
      await storeReview({ discordMessageId, item, price, imageUrl, createdAt });
    } catch (err) {
      console.error(`Failed to process attachment from message ${message.id}:`, err.message || err);
    }
  }
}

async function catchUp() {
  const channel = await client.channels.fetch(DISCORD_CHANNEL_ID);
  if (!channel?.isTextBased()) {
    console.error('DISCORD_CHANNEL_ID does not point to a text channel the bot can read.');
    return;
  }

  const { data: existing } = await supabase
    .from('trades')
    .select('discord_message_id')
    .not('discord_message_id', 'is', null);
  const known = new Set((existing || []).map(r => r.discord_message_id));

  const messages = await channel.messages.fetch({ limit: 50 });
  const sorted = [...messages.values()].sort((a, b) => a.createdTimestamp - b.createdTimestamp);

  for (const message of sorted) {
    const images = imageAttachments(message);
    const alreadyKnown = images.length <= 1
      ? known.has(message.id)
      : images.every((_, i) => known.has(`${message.id}:${i}`));
    if (alreadyKnown) continue;
    await processMessage(message);
  }
  console.log('Catch-up sync complete.');
}

client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}. Watching channel ${DISCORD_CHANNEL_ID}.`);
  try {
    await catchUp();
  } catch (err) {
    console.error('Catch-up sync failed:', err.message || err);
  }
});

client.on('messageCreate', message => {
  processMessage(message).catch(err => console.error('processMessage error:', err));
});

client.login(DISCORD_BOT_TOKEN);
