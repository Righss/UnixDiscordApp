// commands/utility/getunixtime.js
const { SlashCommandBuilder } = require('discord.js');
const { DateTime } = require('luxon');

module.exports = {
  // usado pelo deploy-commands.js
  data: new SlashCommandBuilder()
    .setName('getunixtime')
    .setDescription('Tries to make a unix time with the inserted time value')
    .addStringOption(option =>
      option.setName('time')
        .setDescription('HH:MM (24h)')
        .setRequired(true)
        .setMinLength(4)   // ex: 9:30
        .setMaxLength(5)   // ex: 09:30
    ),

  // usado pelo server HTTP (botless)
  async handle({ options, userId }) {
    const time = options?.find(o => o.name === 'time')?.value;

    const regex = /^([0-9]|[01]\d|2[0-3]):([0-5]\d)$/;
    if (!regex.test(time)) {
      return { content: 'Wrong Format (use HH:MM, ex: 09:30 ou 9:30)', ephemeral: true };
    }

    const [hour, minute] = time.split(':').map(Number);

    // ajuste seu mapeamento por usuário aqui
    const tz = (userId === '261987640470011915') ? 'America/Sao_Paulo' : 'Europe/London';

    const todayInTz = DateTime.now().setZone(tz);
    const dt = DateTime.fromObject({
      year: todayInTz.year,
      month: todayInTz.month,
      day: todayInTz.day,
      hour, minute, second: 0, millisecond: 0
    }, { zone: tz });

    if (!dt.isValid) {
      return { content: `Timezone ou data/hora inválidos. TZ usado: ${tz}`, ephemeral: true };
    }

    const unix = Math.floor(dt.toSeconds());
    return { content: `Given time: <t:${unix}:t> (TZ: **${tz}**) || ${unix}`, ephemeral: false };
  },
};
