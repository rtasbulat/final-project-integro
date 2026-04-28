# IntegroSystems.ai — Лендинг + Telegram

Лендинг с формой заявок, которые отправляются напрямую в **Telegram**.
Backend на Node.js + Express, без баз данных.

---

## 📁 Структура проекта

```
.
├── backend/
│   ├── server.js          # Express + Telegram Bot API
│   ├── package.json
│   ├── .env.example       # Шаблон переменных окружения
│   └── .gitignore
├── frontend/
│   ├── index.html         # Лендинг
│   ├── css/style.css
│   └── js/main.js         # fetch -> POST /api/send
├── package.json           # Корневые скрипты
└── README.md
```

---

## 🔌 API

### `POST /api/send`

Принимает JSON:
```json
{
  "name": "Иван",
  "phone": "+7 999 123-45-67",
  "message": "Хочу консультацию"
}
```

**Успех:**
```json
{ "success": true }
```

**Ошибка:**
```json
{ "success": false, "message": "..." }
```

### `GET /api/health`
Проверка состояния сервера и наличия настроек Telegram.

---

## 📨 Формат сообщения в Telegram

```
🔥 Новая заявка с сайта

👤 Имя: Иван
📞 Телефон: +7 999 123-45-67
💬 Сообщение: Хочу консультацию
🕒 Дата: 28.04.2026 14:35 (МСК)
```

---

## 🚀 Локальный запуск (пошагово)

### 1) Перейти в backend
```bash
cd backend
```

### 2) Установить зависимости
```bash
npm install
```

### 3) Создать `.env` на основе `.env.example`
```bash
cp .env.example .env
```

Открыть `.env` и заполнить:
```
PORT=3000
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
```

### 4) Создать Telegram-бота через [@BotFather](https://t.me/BotFather)
1. Открыть Telegram, найти **@BotFather**
2. Отправить команду `/newbot`
3. Указать имя бота (например: *IntegroSystems Leads*)
4. Указать username (должен заканчиваться на `bot`, например: `integro_leads_bot`)
5. BotFather пришлёт сообщение с **API Token** — это и есть `TELEGRAM_BOT_TOKEN`

### 5) Получить `TELEGRAM_BOT_TOKEN`
Скопировать токен из ответа BotFather, например:
```
7891234567:AAH...xyz
```
И вставить в `.env`.

### 6) Получить `TELEGRAM_CHAT_ID`

**Вариант A — личные сообщения:**
1. Найти своего бота в Telegram, нажать **Start**
2. Отправить ему любое сообщение (например, `привет`)
3. Открыть в браузере:
   ```
   https://api.telegram.org/bot<ВАШ_ТОКЕН>/getUpdates
   ```
4. В JSON-ответе найти `"chat":{"id":123456789,...}` — это и есть `TELEGRAM_CHAT_ID`

**Вариант B — через бота @userinfobot:**
1. Открыть в Telegram **@userinfobot**
2. Нажать Start — он пришлёт ваш `Id` (это и есть chat_id)

**Вариант C — групповой чат:**
1. Добавить вашего бота в группу
2. Отправить любое сообщение в группе
3. Открыть `https://api.telegram.org/bot<ТОКЕН>/getUpdates` — chat_id группы будет отрицательным числом (например `-1001234567890`)

### 7) Запустить сервер
```bash
npm start
```

Или в режиме разработки (с автоперезапуском):
```bash
npm run dev
```

### 8) Открыть сайт
[http://localhost:3000](http://localhost:3000)

Заполните форму на лендинге — заявка должна прийти вам в Telegram.

---

## ☁️ Деплой

### 🔵 Вариант 1 — [Render.com](https://render.com)

1. Загрузить проект на GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/USERNAME/REPO.git
   git push -u origin main
   ```
2. На [render.com](https://render.com) → **New +** → **Web Service**
3. Подключить ваш GitHub-репозиторий
4. Заполнить настройки:
   - **Name:** `integro-systems`
   - **Root Directory:** `backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. В разделе **Environment Variables** добавить:
   - `TELEGRAM_BOT_TOKEN` = ваш токен
   - `TELEGRAM_CHAT_ID`   = ваш chat_id
   - `PORT` = `3000` *(Render сам подставит свой порт через переменную $PORT, наш код это поддерживает)*
6. Нажать **Create Web Service**
7. После сборки получите публичную ссылку вида:
   ```
   https://integro-systems.onrender.com
   ```

---

### 🟣 Вариант 2 — [Railway.app](https://railway.app)

1. Загрузить проект на GitHub (см. шаги выше)
2. На [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**
3. Выбрать ваш репозиторий
4. В **Settings**:
   - **Root Directory:** `backend`
   - **Start Command:** `npm start`
5. В разделе **Variables** добавить:
   - `TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_CHAT_ID`
   - `PORT` *(Railway автоматически подставит)*
6. Открыть **Settings → Networking → Generate Domain**
7. Получите публичный домен:
   ```
   https://your-app.up.railway.app
   ```

---

### 🟢 Вариант 3 — VPS Ubuntu (полный контроль)

#### 3.1. Установить Node.js LTS
```bash
sudo apt update
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v
npm -v
```

#### 3.2. Загрузить проект
```bash
cd /var/www
sudo git clone https://github.com/USERNAME/REPO.git integro
cd integro/backend
```

#### 3.3. Установить зависимости
```bash
sudo npm install --production
```

#### 3.4. Настроить `.env`
```bash
sudo nano .env
```
Вставить:
```
PORT=3000
TELEGRAM_BOT_TOKEN=ваш_токен
TELEGRAM_CHAT_ID=ваш_chat_id
```

#### 3.5. Запуск через PM2 (демон)
```bash
sudo npm install -g pm2
pm2 start server.js --name integro
pm2 save
pm2 startup       # выполнить ту команду, которую выведет pm2
```
Проверка статуса: `pm2 status`
Логи: `pm2 logs integro`

#### 3.6. Установить и настроить Nginx (reverse proxy)
```bash
sudo apt install -y nginx
sudo nano /etc/nginx/sites-available/integro
```
Содержимое:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```
Активировать конфиг:
```bash
sudo ln -s /etc/nginx/sites-available/integro /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 3.7. Подключить домен
В DNS-настройках домена создать A-запись:
```
@   → IP_сервера
www → IP_сервера
```

#### 3.8. Подключить SSL через Let's Encrypt (certbot)
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```
Certbot автоматически:
- получит SSL-сертификат
- настроит редирект HTTP → HTTPS
- настроит автообновление сертификата

Готово — сайт работает по `https://yourdomain.com`.

---

## ⚙️ Стек

- Node.js + Express 4
- axios — для запросов к Telegram Bot API
- dotenv — для чтения `.env`
- cors, express.json, express.static
- **Без** PostgreSQL, **без** SQLite, **без** node-gyp

---

## 🔒 Безопасность и валидация

- Поля `name` и `phone` обязательны (иначе HTTP 400)
- Все пользовательские данные экранируются (HTML escape) перед отправкой в Telegram
- Ошибки Telegram **не ломают** сервер: есть `try/catch`, возвращается JSON-ошибка
- `.env` добавлен в `.gitignore` — токен не попадёт в репозиторий

---

## 🧪 Проверка через curl

```bash
curl -X POST http://localhost:3000/api/send \
  -H "Content-Type: application/json" \
  -d '{"name":"Тест","phone":"+79991234567","message":"Проверка"}'
```

Ожидаемый ответ:
```json
{ "success": true }
```

И сообщение прилетит вам в Telegram. ✅
