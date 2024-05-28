# NexusAI

A platform which provides 24/7 availability customer supports, act as a spam/scam blocker for businesses or individual, acts as your AI receptionist or sales representative / call centre.

A platform which enables businesses integrate their business and provides a way to automate the process of either:

- Booking an appointment
- Answer questions and answers based on the resources uploaded from the business or used the data provided by the businesses
- Provides a chatbot embaddable widget
- Set available time ( necessary especially if businesses need to prevent user from scheduling a meet on a day they aren’t available )

It also Provides a sell phone number users could call to perform some of the functions above.

Businesses could set some configurations as well which tells the AI if a caller or user could attempt an action. (still giving this a thought)

## Frontend

- Web ( Main App )
  - React + vite
  - Chartjs ( document / graph out the intent of each calls or message made ) or Nivo [https://github.com/plouc/nivo](https://github.com/plouc/nivo)
- Chatbot widget
  - React + vite ( would be accessible via an iframe using app deployed url )

## Backend

- Nodejs / Expressjs ( core backend api )
- Postgresql ( supabase )
- Inngest ( background jobs )
- Gemini AI API
- I dont think this are needed but would leave them here.
  - TTS ( google )
  - STT ( google / openai whisper )
- Integrations
  - meet
  - calendar
  - whatsapp
- Twillio
  - sending sms
  -

## Features ( UI )

## Workflow

### Auth

On signing up users are redirected to onboarding screen (if they dont have any business created) which asks for the following:

- name
- type
- phone number
- email (optional)
- opening days
- opening hours
- closing hours
- country

### Dashboard

- Metrics
  - Total calls
  - Total messages
  - Total appointments
- Sentiment analysis ( Graph )
  This could be filtered based on either (conversation between AI and user (in-call) ) or chat messages (chatbot)

### Chatbot

User could choose to either use the chatbot or call the phone number provided.

- Chatbot widget

### Bucket

!update: So no more bucket for now, right now the knowledge base should provide the option to upload resources. if they want to upload or add more, they could choose to create a new business profile.

User could upload resources which would be used by the AI to answer questions asked by extrernal users. each bucket provides a way to group resources together. (website, docs, pdfs, etc)

- name
- description
- Data
  - pdf
  - web url
  - custom data (txt)

### Conversations (Messages)

This includes both chat messages and call messages (messages extracted from the call btw the AI and the user)

- Sentiment Analysis Graph ( Still giving this a thought )
  - provide sentiment analysis of the conversation of the customers response messages.
- Type
  - chat (chatbot)
  - call (phone call)

### Appointments (sync with calendar)

As for appointment, we would need user to create a google booking page which would be sent to the user to book an appointment. This would be used to sync with the calendar.

Contains all the appointments made by the customers.

- date
- time
- user
- status (pending, completed, canceled)

### Integrations

Add third party integrations.

- Calendar
  resources:
  [Link1](https://stackoverflow.com/questions/75785196/create-a-google-calendar-event-with-a-specified-google-meet-id-conferencedata-c)
  [Link2](https://chatgpt.com/share/bbbe4e27-6e20-457b-9f85-057cba444cba)

- Whatsapp (still giving this a thought)
  provides a way to send messages to the user via whatsapp since sms could be expensive.

For converting site content into valid markdown, we could use [html-to-markdown](https://github.com/mixmark-io/turndown) npm package. Or perhaps using a small cloudflare LLM worker to convert the content into markdown [cloudflare LLM](https://developers.cloudflare.com/workers-ai/models/qwen1.5-14b-chat-awq/)

## UI

Note, the main feature isn't based on chatbot but on automated voice calls assistant for businesses. chatbot is just an additional feature. So focus more on that.

- Dashboard

  - Metrics
  - Sentiment Analysis

- Knowledge Base
  - Sources
    This would be a horizontal tab which contains the following:
    - pdf (multiple pdf) 4mb max
    - webpages (multiple url)
    - youtube (multiple youtube url) - < 1hr content
- Conversations

  - Chat
  - Call

- Chatbot

  - Chatbot widget

- Appointments

  - List of appointments

- Integrations
  - Calendar
  - Whatsapp
-
