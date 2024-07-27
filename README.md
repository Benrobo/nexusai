# Nexus

## Redefine Efficient and Secure Communication with Nexus

Nexus enables businesses to transform communication by boosting sales with intelligent AI assistants, securing calls from scammers, and offering 24/7 support via chatbots.

![image](https://raw.githubusercontent.com/Benrobo/nexusai/main/screensahots/screenshot-1.png?raw=true)

## Getting Started

Headover to [Nexus](https://nexusai.vercel.app) to get started.

## Setting up the project locally.

## Prerequisites

- Nodejs (v14 or higher) [install](https://nodejs.org/en/download/)
- Postgresql [install](https://www.postgresql.org/download/)
- Redis (for caching) [install](https://redis.io/download) or [brew (macos)](https://formulae.brew.sh/formula/redis)
- Ngrok (for exposing localhost to the internet) [install](https://ngrok.com/download)

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

4. Using pgAdmin or any database client of your choice, headover to `/packages/api/sql/function.sql` and run the sql file to create the necessary functions. Or copy the SQL content below:

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

That should create the necessary function for matching embeddings.

5. Start the API server

```bash
# npm
npm run dev

# yarn
yarn dev
```

It should start the API server on `http://localhost:4001` successfully.

### APP (CLIENT)

1. Install dependencies

```bash
# npm
cd packages/app && npm install

# yarn
cd packages/app && yarn
```

2. Start the APP server

```bash
# npm
npm run dev

# yarn
yarn dev
```

It should start the APP server on `http://localhost:4000` successfully.

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

### Embed

In order to view the chatbot widget, start up the embed client located at `/packages/embed/index.html` using `vscode-live-server` or any other server of your choice.

- Update the `index.html` with initialized value of your agent id.
- Update the `CLIENT_URL` and `API_URL` found in `/nexus.js` file with the appropriate values.

```js
// Create a new instance of NexusAI
// Replace <agent-id> with your agent id by creating an agent.
nexusai.init("<agent-id>");
```

After that, you should be able to view the chatbot widget on `http://localhost:5500` successfully as seen below.

![image](https://raw.githubusercontent.com/Benrobo/nexusai/main/screensahots/screenshot-4.png?raw=true)
