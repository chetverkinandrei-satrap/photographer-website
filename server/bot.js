const TelegramBot = require('node-telegram-bot-api');
const db = require('./db');

const SHOOT_TYPES = [
  { id: 'portrait', label: 'Портрет' },
  { id: 'family', label: 'Семейная' },
  { id: 'wedding', label: 'Свадебная' },
  { id: 'other', label: 'Другое' },
];

// In-memory state per chat
const sessions = new Map();

function getSession(chatId) {
  if (!sessions.has(chatId)) {
    sessions.set(chatId, { step: null });
  }
  return sessions.get(chatId);
}

function clearSession(chatId) {
  sessions.delete(chatId);
}

function formatDate(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function getAvailableDates() {
  const bookedRows = db.all("SELECT DISTINCT date FROM bookings WHERE status != 'cancelled'");
  const bookedSet = new Set(bookedRows.map((r) => r.date));

  const dates = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 1; i <= 30; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const str = formatDate(d);
    if (!bookedSet.has(str)) {
      dates.push(str);
    }
  }
  return dates;
}

function startBot() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token || token === 'your_bot_token_here') {
    console.log('Telegram bot: no token, skipping');
    return;
  }

  try {
    const bot = new TelegramBot(token, {
      polling: { interval: 1000, autoStart: true, params: { timeout: 10 } }
    });
    const photographerChatId = process.env.TELEGRAM_CHAT_ID;

    console.log('Telegram bot started (polling)');

  bot.onText(/\/start/, (msg) => {
    clearSession(msg.chat.id);
    bot.sendMessage(
      msg.chat.id,
      'Привет! Я бот фотографа.\n\n' +
        'Здесь вы можете записаться на фотосессию прямо в чате.\n\n' +
        'Нажмите /book чтобы начать запись.'
    );
  });

  bot.onText(/\/book/, (msg) => {
    const session = getSession(msg.chat.id);
    session.step = 'name';
    session.data = {};
    bot.sendMessage(msg.chat.id, 'Давайте запишем вас на съёмку!\n\nКак вас зовут?');
  });

  bot.on('message', (msg) => {
    if (!msg.text || msg.text.startsWith('/')) return;
    const session = getSession(msg.chat.id);

    if (session.step === 'name') {
      session.data.name = msg.text.trim();
      session.step = 'phone';
      bot.sendMessage(msg.chat.id, 'Отлично! Введите ваш номер телефона:');
      return;
    }

    if (session.step === 'phone') {
      session.data.phone = msg.text.trim();
      session.step = 'type';

      const keyboard = SHOOT_TYPES.map((t) => [
        { text: t.label, callback_data: `type_${t.id}` },
      ]);

      bot.sendMessage(msg.chat.id, 'Выберите тип съёмки:', {
        reply_markup: { inline_keyboard: keyboard },
      });
      return;
    }
  });

  bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;
    const session = getSession(chatId);
    const data = query.data;

    bot.answerCallbackQuery(query.id);

    // Type selection
    if (data.startsWith('type_') && session.step === 'type') {
      const typeId = data.replace('type_', '');
      const typeObj = SHOOT_TYPES.find((t) => t.id === typeId);
      session.data.type = typeObj ? typeObj.label : typeId;
      session.step = 'date';

      const dates = getAvailableDates();
      if (dates.length === 0) {
        bot.sendMessage(chatId, 'К сожалению, нет свободных дат на ближайший месяц. Попробуйте позже.');
        clearSession(chatId);
        return;
      }

      // Show dates in rows of 3
      const keyboard = [];
      for (let i = 0; i < dates.length; i += 3) {
        const row = dates.slice(i, i + 3).map((d) => ({
          text: d,
          callback_data: `date_${d}`,
        }));
        keyboard.push(row);
      }

      bot.sendMessage(chatId, 'Выберите дату:', {
        reply_markup: { inline_keyboard: keyboard },
      });
      return;
    }

    // Date selection
    if (data.startsWith('date_') && session.step === 'date') {
      session.data.date = data.replace('date_', '');
      session.step = 'confirm';

      const summary =
        `Проверьте данные:\n\n` +
        `Имя: ${session.data.name}\n` +
        `Телефон: ${session.data.phone}\n` +
        `Тип съёмки: ${session.data.type}\n` +
        `Дата: ${session.data.date}`;

      bot.sendMessage(chatId, summary, {
        reply_markup: {
          inline_keyboard: [
            [
              { text: 'Подтвердить', callback_data: 'confirm_yes' },
              { text: 'Отменить', callback_data: 'confirm_no' },
            ],
          ],
        },
      });
      return;
    }

    // Confirmation
    if (data === 'confirm_yes' && session.step === 'confirm') {
      const { name, phone, type, date } = session.data;

      try {
        db.run(
          'INSERT INTO bookings (client_name, client_phone, series_type, date) VALUES (?, ?, ?, ?)',
          [name, phone, type, date]
        );

        bot.sendMessage(
          chatId,
          'Заявка принята! Фотограф свяжется с вами для подтверждения.\n\nСпасибо!'
        );

        // Notify photographer
        if (photographerChatId) {
          const notification =
            `📸 Новая заявка через бота!\n\n` +
            `Имя: ${name}\n` +
            `Телефон: ${phone}\n` +
            `Тип съёмки: ${type}\n` +
            `Дата: ${date}`;
          bot.sendMessage(photographerChatId, notification).catch(() => {});
        }
      } catch (err) {
        console.error('Bot booking error:', err);
        bot.sendMessage(chatId, 'Произошла ошибка. Попробуйте позже.');
      }

      clearSession(chatId);
      return;
    }

    if (data === 'confirm_no' && session.step === 'confirm') {
      clearSession(chatId);
      bot.sendMessage(chatId, 'Запись отменена. Нажмите /book чтобы начать заново.');
      return;
    }
  });

  bot.on('polling_error', (err) => {
    console.error('Bot polling error:', err.message);
  });

  } catch (err) {
    console.error('Telegram bot failed to start:', err.message);
  }
}

module.exports = { startBot };
