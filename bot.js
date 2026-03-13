const TelegramBot = require('node-telegram-bot-api');
const { analyzeFeedback, analyzeAudioFeedback } = require('./ai');
const db = require('./database');
require('dotenv').config();

const token = process.env.TELEGRAM_BOT_TOKEN;

let bot = null;

if (token && token !== 'your_telegram_bot_token_here') {
  bot = new TelegramBot(token, { polling: true });

  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, `👋 Welcome 

🎯 We'd love to hear your feedback about our service.

You can either:
📝 Text Feedback - Just type to start the survey
🎤 Audio Feedback - Send an audio message for analysis

Please rate your experience on a scale of 0-10:
• 9-10 = Promoter (You love us!)
• 7-8 = Passive (Good, but room to improve)
• 0-6 = Detractor (We need to do better)

👉 Type a number (0-10) or send an audio message`);
  });

  bot.onText(/\/nps/, (msg) => {
    const chatId = msg.chat.id;
    const opts = {
      reply_markup: {
        inline_keyboard: [
          [{ text: '0', callback_data: 'nps_0' }, { text: '1', callback_data: 'nps_1' }, { text: '2', callback_data: 'nps_2' }],
          [{ text: '3', callback_data: 'nps_3' }, { text: '4', callback_data: 'nps_4' }, { text: '5', callback_data: 'nps_5' }],
          [{ text: '6', callback_data: 'nps_6' }, { text: '7', callback_data: 'nps_7' }, { text: '8', callback_data: 'nps_8' }],
          [{ text: '9', callback_data: 'nps_9' }, { text: '10', callback_data: 'nps_10' }]
        ]
      }
    };
    bot.sendMessage(chatId, "Based on your recent visit, how likely are you to recommend our hospital to your friends and family? (0 = Not likely at all, 10 = Extremely likely)", opts);
  });

  bot.on('callback_query', (callbackQuery) => {
    const msg = callbackQuery.message;
    const data = callbackQuery.data;
    const patientName = callbackQuery.from.first_name || 'Anonymous';
    
    if (data.startsWith('nps_')) {
      const score = parseInt(data.split('_')[1], 10);
      let nps_category = 'Passive';
      if (score >= 9) nps_category = 'Promoter';
      else if (score <= 6) nps_category = 'Detractor';
      
      const insight = `User explicitly rated ${score} via NPS form.`;
      const feedback_text = `Explicit NPS Score: ${score}/10`;
      
      db.run(
        `INSERT INTO feedback (patient_name, feedback_text, sentiment_score, nps_category, actionable_insight) 
         VALUES (?, ?, ?, ?, ?)`,
        [patientName, feedback_text, score, nps_category, insight],
        function(err) {
          if (err) {
            console.error('Error inserting NPS to DB:', err);
            bot.sendMessage(msg.chat.id, "Sorry, there was an error saving your score.");
          } else {
            bot.sendMessage(msg.chat.id, `Thank you! You rated us a ${score}/10.`);
            bot.answerCallbackQuery(callbackQuery.id);
          }
        }
      );
    }
  });

  bot.on('voice', async (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, "Thank you! We're analyzing your audio feedback...");
    
    try {
      const fileId = msg.voice.file_id;
      const fileUrl = await bot.getFileLink(fileId);
      
      const response = await fetch(fileUrl);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64Audio = buffer.toString('base64');
      
      const aiResult = await analyzeAudioFeedback(base64Audio, msg.voice.mime_type || 'audio/ogg');
      const patientName = msg.from.first_name || 'Anonymous';
      
      db.run(
        `INSERT INTO feedback (patient_name, feedback_text, sentiment_score, nps_category, actionable_insight) 
         VALUES (?, ?, ?, ?, ?)`,
        [patientName, aiResult.feedback_text, aiResult.sentiment_score, aiResult.nps_category, aiResult.actionable_insight],
        function(err) {
          if (err) {
            console.error('Error inserting audio to DB:', err);
            bot.sendMessage(chatId, "Sorry, there was an error saving your audio feedback.");
          } else {
            bot.sendMessage(chatId, `Your voice feedback has been recorded!\n\nTranscription: "${aiResult.feedback_text}"`);
          }
        }
      );

    } catch (err) {
      console.error('Error processing voice message:', err);
      bot.sendMessage(chatId, "Sorry, something went wrong processing your voice message.");
    }
  });

  bot.on('message', async (msg) => {
    // Only process text messages here
    if (!msg.text) return;
    const chatId = msg.chat.id;
    
    // Ignore commands
    if (msg.text.startsWith('/')) return;

    if (msg.text) {
      bot.sendMessage(chatId, "Thank you! We're analyzing your feedback...");
      
      try {
        const aiResult = await analyzeFeedback(msg.text);
        const patientName = msg.from.first_name || 'Anonymous';
        
        db.run(
          `INSERT INTO feedback (patient_name, feedback_text, sentiment_score, nps_category, actionable_insight) 
           VALUES (?, ?, ?, ?, ?)`,
          [patientName, msg.text, aiResult.sentiment_score, aiResult.nps_category, aiResult.actionable_insight],
          function(err) {
            if (err) {
              console.error('Error inserting to DB:', err);
              bot.sendMessage(chatId, "Sorry, there was an error saving your feedback.");
            } else {
              bot.sendMessage(chatId, "Your feedback has been recorded successfully. Have a great day!");
            }
          }
        );
      } catch (err) {
         console.error(err);
         bot.sendMessage(chatId, "Sorry, something went wrong processing your feedback.");
      }
    }
  });
  console.log('Telegram Bot initialized.');
} else {
  console.log('Telegram Bot Token not configured. Skipping bot initialization.');
}

module.exports = bot;
