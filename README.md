# Nova AI Chat — Node.js (Powered by Groq — 100% Free)

A ChatGPT-style AI chatbot using Groq's FREE API.
No credit card. No quota issues. Super fast responses.

---

## Setup (3 steps)

### 1. Install dependencies
```
npm install
```

### 2. Get your FREE Groq API key
- Go to https://console.groq.com
- Sign up (free, no credit card)
- Click "API Keys" → "Create API Key"
- Copy the key

### 3. Add key to .env file
Open `.env` and replace the placeholder:
```
GROQ_API_KEY=paste_your_key_here
```

### 4. Start the server
```
node server.js
```

Open browser at: http://localhost:3000

---

## Why Groq is better than Gemini free tier

| | Gemini Free | Groq Free |
|---|---|---|
| Rate limit | 15 req/min | 250+ req/min |
| Daily limit | 1500 req | Very generous |
| Credit card | No | No |
| Speed | Normal | Very fast |

---

## Project Structure

```
nova-chat/
  server.js        <- Express server (API key lives here safely)
  .env             <- Your secret key (never share this!)
  .gitignore       <- Keeps .env out of GitHub
  package.json
  public/
    index.html     <- Chat UI
```
