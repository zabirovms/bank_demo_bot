require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');

// Load bot token from environment
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// Simple multilingual messages
const messages = {
  greet: {
    tj: "Салом! Ман ёвари бонки шумо ҳастам. Бо чӣ кӯмак кунам?",
    ru: "Привет! Я ваш банковский помощник. Чем могу помочь?",
    en: "Hello! I’m your bank assistant. How can I help you?"
  },
  connect_agent: {
    tj: "Лутфан маро бо оператор пайваст кунед",
    ru: "Пожалуйста, соедините меня с оператором",
    en: "Please connect me to an agent"
  },
  fallback: {
    tj: "Маъзуред, ман намефаҳмам. Мехоҳед бо оператор сӯҳбат кунед?",
    ru: "Извините, я не понимаю. Хотите поговорить с оператором?",
    en: "Sorry, I don’t understand. Do you want to talk to an agent?"
  }
};

// Helper: detect language (fallback to Tajik)
function getLang(ctx) {
  const code = ctx.from?.language_code;
  if (code?.startsWith('ru')) return 'ru';
  if (code?.startsWith('en')) return 'en';
  return 'tj';
}

// Start command
bot.start((ctx) => {
  const lang = getLang(ctx);
  ctx.reply(messages.greet[lang], Markup.inlineKeyboard([
    [Markup.button.callback('Talk to Agent', 'CONNECT_AGENT')]
  ]));
});

// Inline button callback
bot.action('CONNECT_AGENT', (ctx) => {
  const lang = getLang(ctx);
  ctx.reply(messages.connect_agent[lang]);
  // TODO: handoff logic to human agent
});

// Handle text messages
bot.on('text', (ctx) => {
  const lang = getLang(ctx);
  const text = ctx.message.text.toLowerCase();

  if (text.includes('branch') || text.includes('шӯъба') || text.includes('отделение')) {
    ctx.reply({
      tj: 'Шӯъбаи марказӣ аз соати 8:00 то 17:00 фаъол аст',
      ru: 'Центральное отделение работает с 8:00 до 17:00',
      en: 'Main branch is open 8:00–17:00'
    }[lang]);
  } else if (text.includes('agent') || text.includes('оператор')) {
    ctx.reply(messages.connect_agent[lang]);
  } else {
    ctx.reply(messages.fallback[lang]);
  }
});

// Launch bot
bot.launch().then(() => console.log('Bot running...'));

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
