# NexusAI

A platform which enables businesses integrate their business and provides a way to automate the process of either:

- Integrate third parties platforms
- Booking an appointment
- scheduling a meeting
- ~~Placing an order ( a node base UI would be use to plan the automation. )~~
- Answer questions and answers based on the resources uploaded from the business or used the data provided by the businesses
- Provides a chatbot embaddable widget
- Set available time ( necessary especially if businesses need to prevent user from scheduling a meet on a day they aren’t available )

It also Provides a sell phone number users could call to perform some of the functions above.

Businesses could set some configurations as well which tells the AI if a caller or user could attempt an action

### Frontend

- Web ( Main App )
  - React + vite
  - Chartjs ( document / graph out the intent of each calls or message made )
- Chatbot widget
  - React + vite ( would be accessible via an iframe using app deployed url )

### Backend

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

### Features ( UI )

### Workflow

##### Auth

On signing up users are redirected to onboarding screen which asks for the following:

- Business name
- Business type
- Business location
- Business phone number
- Business email
-
