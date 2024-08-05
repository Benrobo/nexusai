# Nexus

## Redefine Efficient and Secure Communication with Nexus

> Built From Scratch with ❤️ by [me](https://github.com/benrobo) | [Video Demo](https://youtu.be/kgVcDrm5Zr4?si=2y0nfz-Aikt1hDSz)

Nexus enables businesses to transform communication by boosting sales with intelligent AI assistants, securing calls from scammers, and offering 24/7 support via chatbots.

![image](https://raw.githubusercontent.com/Benrobo/nexusai/main/screensahots/screenshot-1.png?raw=true)

## Built With

Nexusai was built from scratch with the following technologies:

- [Gemini](https://gemini.google.com/)
- [Firebase](https://firebase.google.com/)
- [Twilio](https://www.twilio.com/)
- [Lemonsqueezy](https://lemonsqueezy.com/)
- [NeonDB](https://neondb.tech/)
- [Postgresql](https://www.postgresql.org/)
- [Elevenlab](https://elevenlabs.io/)
- [Redis](https://redis.io/)
- [Upstash Qstash](https://upstash.com/)
- [Nodejs](https://nodejs.org/en/)
- [React](https://reactjs.org/)
- [Tailwindcss](https://tailwindcss.com/)
- [Typescript](https://www.typescriptlang.org/)
- [Prisma](https://www.prisma.io/)
- [Telegram](https://core.telegram.org/bots)

## Getting Started

Headover to [trynexusai.xyz](https://trynexusai.xyz) to get started.

## Setting up the project locally.

## Prerequisites

- Nodejs (v14 or higher) [install](https://nodejs.org/en/download/)
- Postgresql [install](https://www.postgresql.org/download/)
- Redis (for caching) [install](https://redis.io/download) or [brew (macos)](https://formulae.brew.sh/formula/redis)
- Ngrok (for exposing localhost to the internet) [install](https://ngrok.com/download)
- Twilio Account [create](https://www.twilio.com/try-twilio)
- Lemonsqueezy Account [create](https://lemonsqueezy.com/)

## Installation

### API (SERVER)

1. Clone the repo

```bash
git clone https://github.com/benrobo/nexusai.git
```

2. Install dependencies

```bash
# npm
cd nexusai && npm install

# yarn
cd nexusai && yarn
```

3. Create a `.env` file in the root directory and add all the environment variables in the `.env.example` file. Update the values accordingly.

4. Then run the following command to create the necessary tables and seed data.

```bash
# npm
npm run migrate

# yarn
yarn migrate
```

5. Using pgAdmin or any database client of your choice, headover to `/packages/api/sql/function.sql` and run the sql file to create the necessary functions. Or copy the SQL content below:

```sql
-- Drop function
DROP FUNCTION IF EXISTS match_embeddings;

-- Create function
CREATE OR REPLACE FUNCTION match_embeddings (
  query_embedding text,
  match_threshold float,
  match_count int,
  kb_ids text[]
)
RETURNS TABLE (
  result json
)
LANGUAGE SQL STABLE
AS $$
  SELECT json_build_object(
    'id', public."knowledge_base_data".id,
    'similarity', 1 - (public."knowledge_base_data".embedding <=> query_embedding::vector),
    'content', string_to_array(public."knowledge_base_data".content, '.'),
    'metadata', public."knowledge_base_data".title
  ) AS result
  FROM
    public."knowledge_base_data"
  WHERE
    public."knowledge_base_data".kb_id = ANY(kb_ids) AND
    1 - (public."knowledge_base_data".embedding <=> query_embedding::vector) > match_threshold
  ORDER BY
    1 - (public."knowledge_base_data".embedding <=> query_embedding::vector) DESC
  LIMIT
    match_count;
$$;
```

That should create the necessary function for matching embeddings.

#### Lemonsqueezy

5. Update the `Lemonsqueezy` subscription plan in `/packages/api/src/data/twilio/sub-plan.ts` file, this values can be gotten from your lemonsqueezy store account.

First, headover to [https://app.lemonsqueezy.com/products](https://app.lemonsqueezy.com/products) to create a product and variant for the subscription plan as seen in the image below.

![image](https://raw.githubusercontent.com/Benrobo/nexusai/main/screensahots/screenshot-2.png?raw=true)

Update your webhook URL in the `Webhooks` section of the product to `<ngrok>.ngrok-free.app/api/webhook/tw-phone/subscription`. Make sure you add in your signing secret in the `.env` file and select `subscription_created` and `subscription_updated` events as seen below.

![image](https://raw.githubusercontent.com/Benrobo/nexusai/main/screensahots/screenshot-3.png?raw=true)

Now, update the `TwilioSubPlanInfo` object in the `/packages/api/src/data/twilio/sub-plan.ts` file with the necessary values.

```typescript
const TwilioSubPlanInfo = {
  local: {
    name: "Local",
    description: "Local phone numbers are specific to a city or region.",
    product: {
      test_id: 292219, // IN DEV MODE (update this)
      prod_id: 292219, // IN PROD MODE (update this)
    },
    variant: {
      test_id: 417672, // IN DEV MODE (update this)
      prod_id: 417672, // IN PROD MODE (update this)
    },
  },
} as TwilioSubPlanInfo;
```

##### Trying the Voice Call Feature.

The voice call feature is powered by Twilio, to try it out, you would need to do the following:

- Get a Twilio account [here](https://www.twilio.com/try-twilio)
- Upgrade the account.
- Get a starter ($5) Elevenlab account [here](https://elevenlabs.io/)
- Purchase a twilio phone number.
- Update the `.env` file
  - Make sure `NODE_ENV` is set to `development` otherwise, when purchasing a phone number from Nexus, you would be charged from your twilio balance (even if you've used a test credit card credentials).
  - Top up your account with atleast (min) `$20`.
- On purchasing a specific number from nexus, two records would be updated in the db: `purchased_phone_numbers` and `used_phone_numbers`. With the original twilio number you purchased directly with your twilio balance, copy that number and update the `used_phone_numbers` table with the `phone` fields.

> **Why?** When your purchase a number on nexusai, your original balance `($20)` isn't getting deducted from your twilio account since the number was purchased from nexusai. So, to make sure the number is linked to your account, you would need to update the `used_phone_numbers` table with the `phone` field of the number you purchased directly from twilio. your balance is only getting deducted when you either (1) puchased a number directly from twilio or (2) when you make a voice call or send sms.

- Headover to twilio and update the webhook URL for the phone number with `<ngrok>.ngrok-free.app/api/webhook/tw-phone/voice`. (You would only need to do this everytime your ngrok url get reset with a random new sub-domain).
- Now call that specific number linked to your agent.

5. Start the API server

```bash
# npm
npm run dev

# yarn
yarn dev
```

It should start the API server on `http://localhost:4001` successfully.

### WEB_APP (CLIENT)

1. Install dependencies

```bash
# npm
cd packages/app && npm install

# yarn
cd packages/app && yarn
```

2. Start the APP

```bash
# npm
npm run dev

# yarn
yarn dev
```

It should start the web app on `http://localhost:4000` successfully.

### CHATBOT (CLIENT)

1. Install dependencies

```bash
# npm
cd packages/chatbot && npm install

# yarn
cd packages/chatbot && yarn
```

2. Start the CHATBOT server

```bash
# npm
npm run dev

# yarn
yarn dev
```

It should start the CHATBOT server on `http://localhost:3010` successfully.

### Telegram Bot Server

The telegram bot server can be found in the `/packages/tg-bot` directory. To start the server, run the following commands:

```bash
# npm
cd packages/tg-bot && npm install

# yarn
cd packages/tg-bot && yarn
```

Then create a `.env` file in the root directory and add the following environment variables:

```bash
NODE_ENV="development"

TG_BOT_TOKEN="xxxxxxxxxxxxxxxxxx"

API_URL="http://localhost:4001/api"

DATABASE_URL="postgres://postgres:12345@localhost:5432/nexusai"
```

Replace the `TG_BOT_TOKEN` with your telegram bot token gotten from the [@BotFather](https://core.telegram.org/bots#6-botfather).

Then start the server using the following command:

```bash
# npm
npm run dev

# yarn
yarn dev
```

It should start the telegram bot server on `http://localhost:4005` successfully with the following message printed in the console:

```bash
2024-07-29 18:22:14 PM [info] : ✅ Telegram Bot launched successfully
```

### Embed

In order to view the chatbot widget, start up the embed client located at `/packages/embed/index.html` using `vscode-live-server` or any other server of your choice.

- Create a `CHATBOT` agent then Update the `index.html` with initialized value of your agent id.
- Update the `CLIENT_URL` and `API_URL` found in `/nexus.js` file with the appropriate values.

```js
<script src="./nexus.js" id="<your-agent-id>"></script>
```

After that, you should be able to view the chatbot widget on `http://localhost:5500` successfully as seen below.

![image](https://raw.githubusercontent.com/Benrobo/nexusai/main/screensahots/screenshot-4.png?raw=true)

## Disclaimer

Considering the fact that this project was built within a short period of time (1.5 month), the codebas might not be as clean as expected. I would be working on refactoring the codebase and adding more features in the future (if time permits).
