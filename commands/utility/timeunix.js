// commands/utility/getunixtime.js
const { SlashCommandBuilder } = require('discord.js');
const { DateTime } = require('luxon');

module.exports = {
  //deploy-commands.js
  data: new SlashCommandBuilder()
    .setName('getunixtime')
    .setDescription('Tries to make a unix time with the inserted time value')
    .addStringOption(option =>
      option.setName('time')
        .setDescription('HH:MM (24h)')
        .setRequired(true)
        .setMinLength(4)
        .setMaxLength(5)
    )
    .addStringOption(option =>
      option.setName('timezone')
      .setDescription('Selecione a timezone')
        .setRequired(true)
        .addChoices(
          // América
          { name: 'Brazil (GMT-3)', value: 'America/Sao_Paulo' },
          { name: 'London (GMT+0)', value: 'Europe/London' },
          { name: 'New York (GMT-5)', value: 'America/New_York' },
          { name: 'Chicago (GMT-6)', value: 'America/Chicago' },
          { name: 'Denver (GMT-7)', value: 'America/Denver' },
          { name: 'Los Angeles (GMT-8)', value: 'America/Los_Angeles' },
          { name: 'Anchorage (GMT-9)', value: 'America/Anchorage' },
          { name: 'Honolulu (GMT-10)', value: 'Pacific/Honolulu' },

          // Europa
          { name: 'Berlin (GMT+1)', value: 'Europe/Berlin' },
          { name: 'Moscow (GMT+3)', value: 'Europe/Moscow' },

          // Ásia
          { name: 'Dubai (GMT+4)', value: 'Asia/Dubai' },
          { name: 'New Delhi (GMT+5:30)', value: 'Asia/Kolkata' },
          { name: 'Shanghai (GMT+8)', value: 'Asia/Shanghai' },
          { name: 'Tokyo (GMT+9)', value: 'Asia/Tokyo' },

          // Oceania
          { name: 'Sydney (GMT+10)', value: 'Australia/Sydney' },
          { name: 'Auckland (GMT+12)', value: 'Pacific/Auckland' },

          // África
          { name: 'Cairo (GMT+2)', value: 'Africa/Cairo' },
          { name: 'Johannesburg (GMT+2)', value: 'Africa/Johannesburg' }
            )
        
    ),  

  async handle({ options, userId }) {
    const time = options?.find(o => o.name === 'time')?.value;
    const tz = options?.find(o => o.name === 'timezone')?.value;

    const regex = /^([0-9]|[01]\d|2[0-3]):([0-5]\d)$/;
    if (!regex.test(time)) {
      return { content: 'Wrong Format (use HH:MM)', ephemeral: true };
    }

    const [hour, minute] = time.split(':').map(Number);

    //const tz = (userId === '261987640470011915') ? 'America/Sao_Paulo' : 'Europe/London';

    const todayInTz = DateTime.now().setZone(tz);
    const dt = DateTime.fromObject({
      year: todayInTz.year,
      month: todayInTz.month,
      day: todayInTz.day,
      hour, minute, second: 0, millisecond: 0
    }, { zone: tz });

    if (!dt.isValid) {
      return { content: `Timezone or Date invalid. TZ used: ${tz}`, ephemeral: true };
    }

    const unix = Math.floor(dt.toSeconds());
    return { content: `Given time: <t:${unix}:t> (TZ: **${tz}**) || ${unix}`, ephemeral: false };
  },
};
