# NEON HEROES — Telegram Mini App

## Included
- FastAPI backend + SQLite
- Telegram-compatible mobile frontend
- RU/EN switch
- 8 full hero card artworks (SVG, self-contained)
- Hero collection and detail cards
- 4 Chest tiers and server-side weighted drops
- Gems / Coins / Energy economy
- World missions + server-side battle rewards
- Profile and leaderboard
- Responsive neon UI

## Run locally
1. `cd backend && python -m venv .venv && source .venv/bin/activate`
2. `pip install -r requirements.txt`
3. `uvicorn main:app --host 0.0.0.0 --port 8000`
4. Serve `frontend/` with any static server, e.g. `python -m http.server 8080 -d ../frontend`
5. Open the frontend. For Telegram Mini App, host the frontend over HTTPS and set the URL in BotFather.

## Production notes
Set `API` in `frontend/app.js` to the HTTPS API URL. For production, put FastAPI behind HTTPS/reverse proxy and move SQLite to PostgreSQL when concurrency grows.
