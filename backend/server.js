// =====================================================================
// server.js — Express + Telegram Bot API
// Лендинг IntegroSystems.ai: приём заявок и отправка их в Telegram
// =====================================================================
require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const axios   = require('axios');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID   = process.env.TELEGRAM_CHAT_ID;

// Папка с фронтендом (на уровень выше backend/)
const FRONTEND_DIR = path.join(__dirname, '..', 'frontend');

// ---------- Middleware ----------
app.use(cors());
app.use(express.json());

// Раздача статических файлов лендинга (index.html, css, js)
app.use(express.static(FRONTEND_DIR));

// ---------- Утилиты ----------

/**
 * Экранирование текста для Telegram (parse_mode: HTML)
 */
function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

/**
 * Форматирование текущей даты в человекочитаемый вид (МСК)
 */
function formatDate() {
    const now = new Date();
    return now.toLocaleString('ru-RU', {
        timeZone: 'Asia/Almaty',
        day:    '2-digit',
        month:  '2-digit',
        year:   'numeric',
        hour:   '2-digit',
        minute: '2-digit'
    }) + ' (KZ)';
}

/**
 * Отправка сообщения в Telegram
 */
async function sendToTelegram({ name, phone, message }) {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
        throw new Error('TELEGRAM_BOT_TOKEN или TELEGRAM_CHAT_ID не заданы в .env');
    }

    const text =
        `🔥 <b>Новая заявка с сайта</b>\n\n` +
        `👤 <b>Имя:</b> ${escapeHtml(name)}\n` +
        `📞 <b>Телефон:</b> ${escapeHtml(phone)}\n` +
        `💬 <b>Сообщение:</b> ${escapeHtml(message) || '—'}\n` +
        `🕒 <b>Дата:</b> ${escapeHtml(formatDate())}`;

    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

    const response = await axios.post(url, {
        chat_id:    TELEGRAM_CHAT_ID,
        text:       text,
        parse_mode: 'HTML',
        disable_web_page_preview: true
    }, { timeout: 10000 });

    return response.data;
}

// ---------- API ----------

/**
 * POST /api/send — приём заявки и отправка в Telegram
 * Тело запроса: { name, phone, message }
 */
app.post('/api/send', async (req, res) => {
    try {
        const { name, phone, message } = req.body || {};

        // Валидация: имя и телефон обязательны
        const cleanName  = (name  || '').toString().trim();
        const cleanPhone = (phone || '').toString().trim();
        const cleanMsg   = (message || '').toString().trim();

        if (!cleanName || !cleanPhone) {
            return res.status(400).json({
                success: false,
                message: 'Поля "Имя" и "Телефон" обязательны'
            });
        }

        // Отправка в Telegram (с try/catch внутри)
        try {
            await sendToTelegram({
                name:    cleanName,
                phone:   cleanPhone,
                message: cleanMsg
            });
        } catch (tgErr) {
            // Логируем ошибку Telegram, но не «роняем» сервер
            console.error('[telegram] Ошибка отправки:',
                tgErr.response?.data || tgErr.message);

            return res.status(502).json({
                success: false,
                message: 'Не удалось отправить заявку. Попробуйте позже.'
            });
        }

        console.log(`[api] ✅ Новая заявка от ${cleanName} (${cleanPhone})`);
        return res.json({ success: true });

    } catch (err) {
        console.error('[api] Внутренняя ошибка:', err);
        return res.status(500).json({
            success: false,
            message: 'Внутренняя ошибка сервера'
        });
    }
});

// Совместимость со старым фронтендом (если где-то остался /api/leads)
app.post('/api/leads', (req, res) => {
    // Перенаправляем обработку на основной роут
    app._router.handle(
        Object.assign(req, { url: '/api/send', originalUrl: '/api/send' }),
        res,
        () => {}
    );
});

// Health-check (удобно для Render/Railway)
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        status:  'ok',
        time:    new Date().toISOString(),
        telegram_configured: Boolean(TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID)
    });
});

// SPA fallback — отдаём index.html на все остальные GET-запросы
app.get('*', (req, res) => {
    res.sendFile(path.join(FRONTEND_DIR, 'index.html'));
});

// ---------- Запуск ----------
app.listen(PORT, () => {
    console.log(`\n🚀 Сервер запущен:  http://localhost:${PORT}`);
    console.log(`📨 Endpoint заявок: POST http://localhost:${PORT}/api/send`);

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
        console.warn('\n⚠️  ВНИМАНИЕ: TELEGRAM_BOT_TOKEN или TELEGRAM_CHAT_ID не заданы.');
        console.warn('   Создайте файл .env на основе .env.example и заполните значения.\n');
    } else {
        console.log(`✅ Telegram настроен (chat_id: ${TELEGRAM_CHAT_ID})\n`);
    }
});
