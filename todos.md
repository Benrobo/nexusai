# Todos

## Backend

- Auth

  - [x] Implement Google OAuth

- Space

  - [x] Create space
  - [ ] Prevent any API endpoint from getting called if users has not created a space

- Agents

  - [ ] create agents
  - [ ] verify business phone number.
  - [ ] make sure business phone number is a whatsapp number

- Knowledge Base

  - [ ] Create a knowledge base

    - [ ] pdf
      - [ ] upload pdf (max 4mb)
      - [ ] extract text from pdf.
    - [ ] webpages
      - [ ] scrape webpage data
      - [ ] convert html -> markdown

  - [ ] Embedding
    - [ ] Convert each resource to embeddings.

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
