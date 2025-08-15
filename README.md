# Kinenbi Orochi Bot

This bot posts a list of today's anniversaries to a specified Discord channel every day.

## Features

- Posts a list of today's anniversaries at a scheduled time.
- Can manually post the list with the `/today` slash command.
- Can clear the anniversary cache with the `/reload` slash command.

## .env Variables

- `DISCORD_TOKEN`: Your Discord bot token.
- `DISCORD_CLIENT_ID`: Your Discord bot's client ID.
- `POST_CHANNEL_ID`: The ID of the channel to post the anniversary list to.
- `GUILD_ID`: The ID of the guild to register the slash commands in.
- `POST_HOUR_JST`: The hour (in JST) to post the daily anniversary list (defaults to 6).
- `TZ`: The timezone to use for the cron job (e.g., `Asia/Tokyo`).

## Usage

1.  **Install dependencies:**

    ```bash
    npm install
    ```

2.  **Create a `.env` file** from the `.env.example` and fill in the values.

3.  **Build the code:**

    ```bash
    npm run build
    ```

4.  **Start the bot:**

    ```bash
    npm start
    ```

## Development

For development, you can run the bot directly with `ts-node` to enable hot-reloading.

```bash
npm install -D ts-node
# You might want to add a "dev" script to your package.json:
# "dev": "ts-node src/index.ts"
npm run dev
```

## Docker Usage

1.  Build the Docker image:

    ```bash
    docker-compose build
    ```

2.  Run the bot:

    ```bash
    docker-compose up -d
    ```
