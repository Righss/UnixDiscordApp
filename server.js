// server.js
require('dotenv').config();
const express = require('express');
const fs = require('node:fs');
const path = require('node:path');
const { verifyKeyMiddleware, InteractionType, InteractionResponseType } = require('discord-interactions');

const app = express();
const PUBLIC_KEY = process.env.DISCORD_PUBLIC_KEY;

// carrega comandos da pasta commands (suporta subpastas)
const commands = new Map();
const base = path.join(__dirname, 'commands');
for (const entry of fs.readdirSync(base, { withFileTypes: true })) {
  if (entry.isDirectory()) {
    const dir = path.join(base, entry.name);
    for (const f of fs.readdirSync(dir).filter(n => n.endsWith('.js'))) {
      const cmd = require(path.join(dir, f));
      if (cmd?.data?.name && typeof cmd.handle === 'function') {
        commands.set(cmd.data.name, cmd);
      }
    }
  } else if (entry.isFile() && entry.name.endsWith('.js')) {
    const cmd = require(path.join(base, entry.name));
    if (cmd?.data?.name && typeof cmd.handle === 'function') {
      commands.set(cmd.data.name, cmd);
    }
  }
}

app.post('/interactions', verifyKeyMiddleware(PUBLIC_KEY), async (req, res) => {
  const { type, data, member, user } = req.body;

  // handshake do Discord
  if (type === InteractionType.PING) {
    return res.send({ type: InteractionResponseType.PONG });
  }

  if (type === InteractionType.APPLICATION_COMMAND) {
    const name = data?.name;
    const cmd = commands.get(name);
    if (!cmd) {
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: { content: 'Unknown command', flags: 64 }
      });
    }

    try {
      const userId = (member?.user?.id) || (user?.id) || '';
      const options = data?.options || [];
      const out = await cmd.handle({ options, userId });

      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: out.content ?? 'OK',
          flags: out.ephemeral ? 64 : 0
        }
      });
    } catch (e) {
      console.error(e);
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: { content: 'Internal error', flags: 64 }
      });
    }
  }

  return res.sendStatus(400);
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Listening on :3000');
});
