# Todos

## Backend

- Auth

  - [x] Implement Google OAuth

- Agents
  for voice call agents, a valid US phone number is required.

  - [x] create agents
  - [x] verify business phone number.
  - [ ] make sure business phone number is a whatsapp number

- Knowledge Base

  - [ ] Create a knowledge base

    - [x] pdf
          https://stackoverflow.com/questions/30733690/pdf-to-text-extractor-in-nodejs-without-os-dependencies
      - [x] upload pdf (max 4mb)
      - [x] extract text from pdf.
    - [ ] webpages
      - [ ] scrape webpage data
      - [ ] convert html -> markdown

  - [ ] Embedding
    - [x] Convert each resource to embeddings.

- Twillio Implementation

  - [ ] Send SMS
  - [ ] Voice call (Twiml)
    - [ ] Handle incoming calls
      - [ ] Handle incoming users details.
      - [ ] Change voice call to 11labs custom voice model.
    - [ ] Forward calls to business phone number

- Integrations

  - Whatsapp
    - [ ] Integrate whatsapp API
    - [ ] Send messages to added whatsapp number

## Frontend

- Dashboard

  - [ ] Metrics
    - [ ] Total calls
    - [ ] Total messages
    - [ ] Total appointments
  - [ ] Sentiment analysis
    - [ ] Graph
    - [ ] Filter based on conversation between AI and user (in-call) or chat messages (chatbot)

- Business profile
  - [ ] Prevent any UI element from getting shown if users has not created a business profile
  - [ ] Create business profile

Couples of things to note:

1. A phone number used in one agent ( t / spam call blocker) cannot be used in another agent.
2. For Anti-scam protection, users should be able to add multiple phone numbers to a specific agent. (No knowledge base is required for this feature), (No custom prompt is required for this feature), our platform would use internal AI to detect scam calls based on level of prompt engineering.
