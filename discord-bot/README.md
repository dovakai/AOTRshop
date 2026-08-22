# AOTR Review Bot

Слушает канал в Discord, забирает скриншоты из новых сообщений и добавляет их
в таблицу `trades` в Supabase (те же Live Proofs, что и на `proofs.html` / главной).
Отзывы отображаются с меткой "★ Review" вместо цены.

## Настройка

1. `cp .env.example .env` и заполнить:
   - `DISCORD_BOT_TOKEN` — токен бота (Discord Developer Portal → Bot → Reset Token)
   - `DISCORD_CHANNEL_ID` — ID канала с отзывами
   - `SUPABASE_URL` — тот же, что в `js/config.js`
   - `SUPABASE_SERVICE_ROLE_KEY` — Supabase Dashboard → Project Settings → API → service_role key
     (не anon key — нужен доступ на запись в обход RLS)

2. В Discord Developer Portal → твой бот → Bot → **Privileged Gateway Intents**
   включить **MESSAGE CONTENT INTENT**. Без него бот не увидит вложения в чужих сообщениях.

3. В Supabase SQL Editor выполнить один раз:
   ```sql
   alter table trades add column if not exists discord_message_id text unique;
   alter table trades alter column price drop not null;
   ```

4. `npm install`
5. `npm start`

## Запуск 24/7

Процесс должен работать постоянно, иначе новые отзывы не будут подхватываться
(при перезапуске бот один раз "досинхронизирует" последние 50 сообщений канала,
но пока он выключен — новые отзывы не появятся).

Варианты:
- Оставить окно терминала открытым (`npm start`) — проще всего для теста.
- `npm install -g pm2` → `pm2 start index.js --name aotr-review-bot` — процесс
  переживёт закрытие терминала и автоматически перезапустится при падении.
- Перенести на дешёвый VPS/Railway/Render и держать там постоянно.
