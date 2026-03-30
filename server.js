require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// Groq free tier models (fallback order)
// 100% free — no credit card needed at console.groq.com
const MODELS = [
  'llama-3.3-70b-versatile',  // Best quality, 6000 tokens/min free
  'llama-3.1-8b-instant',     // Fastest, 20000 tokens/min free
  'gemma2-9b-it',             // Google Gemma, 15000 tokens/min free
];

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Health check
app.get('/api/health', (req, res) => {
  if (!GROQ_API_KEY || GROQ_API_KEY === 'your_groq_api_key_here') {
    return res.json({ ok: false, message: 'Groq API key not set. Get a FREE key at https://console.groq.com (no credit card needed)' });
  }
  res.json({ ok: true });
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  if (!GROQ_API_KEY || GROQ_API_KEY === 'your_groq_api_key_here') {
    return res.status(500).json({ error: 'Groq API key not set. Add GROQ_API_KEY to your .env file. Get a FREE key at https://console.groq.com' });
  }

  const { history } = req.body;
  if (!history || !Array.isArray(history)) {
    return res.status(400).json({ error: 'Invalid request.' });
  }

  // Convert history format to OpenAI style that Groq uses
  const messages = [
    {
      role: 'system',
      content: 'You are Nova, a helpful, brilliant, and friendly AI assistant. Be concise, clear, and engaging. Use markdown like **bold**, `code`, and code blocks when helpful.'
    },
    ...history.map(m => ({
      role: m.role === 'model' ? 'assistant' : 'user',
      content: m.parts?.[0]?.text || ''
    }))
  ];

  let lastError = '';
  for (const model of MODELS) {
    try {
      const response = await fetch(GROQ_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({ model, messages, max_tokens: 1024 })
      });

      const data = await response.json();

      if (data.error) {
        const msg = data.error.message || JSON.stringify(data.error);
        if (response.status === 429 || msg.includes('rate') || msg.includes('quota')) {
          console.log(`Rate limit on ${model}, trying next...`);
          lastError = msg;
          continue;
        }
        return res.status(400).json({ error: msg });
      }

      const reply = data.choices?.[0]?.message?.content || 'Sorry, no response generated.';
      console.log(`Response from: ${model}`);
      return res.json({ reply, model });

    } catch (err) {
      console.error(`Error with ${model}:`, err.message);
      lastError = err.message;
      continue;
    }
  }

  res.status(429).json({ error: 'Rate limit hit on all models. Wait a moment and try again.' });
});

app.listen(PORT, () => {
  console.log('');
  console.log('  Nova AI Chat running!');
  console.log(`  Open: http://localhost:${PORT}`);
  console.log('');
  if (!GROQ_API_KEY || GROQ_API_KEY === 'your_groq_api_key_here') {
    console.log('  WARNING: Add your FREE Groq key to .env');
    console.log('  Get it at: https://console.groq.com (no credit card!)');
  } else {
    console.log('  Groq API key loaded OK');
  }
  console.log('');
});
