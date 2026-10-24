import 'dotenv/config';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { VOICE_LANGUAGES } from './src/modules/voice/supportedLanguages.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = Number(process.env.PORT || 3000);
const production = process.argv.includes('--production');
const googleTtsApiKey = process.env.GOOGLE_CLOUD_TTS_API_KEY;
const requestWindows = new Map();

app.disable('x-powered-by');
app.use(express.json({ limit: '8kb' }));

app.get('/api/tts/status', (_request, response) => {
  response.set('Cache-Control', 'no-store');
  response.json({ configured: Boolean(googleTtsApiKey) });
});

app.post('/api/tts', async (request, response) => {
  response.set('Cache-Control', 'no-store');

  if (!googleTtsApiKey) {
    response.status(503).json({ error: 'Cloud speech is not configured on the server.' });
    return;
  }

  const { text, language } = request.body ?? {};
  if (
    typeof text !== 'string' ||
    !text.trim() ||
    text.length > 1000 ||
    !VOICE_LANGUAGES.includes(language)
  ) {
    response.status(400).json({ error: 'A supported language and text up to 1000 characters are required.' });
    return;
  }

  const now = Date.now();
  const clientKey = request.ip;
  const windowStart = requestWindows.get(clientKey);
  if (!windowStart || now - windowStart.startedAt >= 60_000) {
    requestWindows.set(clientKey, { startedAt: now, count: 1 });
  } else if (windowStart.count >= 30) {
    response.status(429).json({ error: 'Speech request limit reached. Please wait before trying again.' });
    return;
  } else {
    windowStart.count += 1;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  try {
    const googleResponse = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${encodeURIComponent(googleTtsApiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: { text: text.trim() },
          voice: { languageCode: language },
          audioConfig: { audioEncoding: 'MP3' },
        }),
        signal: controller.signal,
      }
    );

    if (!googleResponse.ok) {
      console.error(`Google Cloud TTS request failed with HTTP ${googleResponse.status}.`);
      response.status(502).json({ error: 'Cloud speech generation failed.' });
      return;
    }

    const result = await googleResponse.json();
    if (typeof result.audioContent !== 'string' || !result.audioContent) {
      console.error('Google Cloud TTS returned no audio content.');
      response.status(502).json({ error: 'Cloud speech returned no audio.' });
      return;
    }

    response.type('audio/mpeg').send(Buffer.from(result.audioContent, 'base64'));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown TTS error';
    console.error('Cloud speech request failed:', message);
    if (!response.headersSent) {
      response.status(502).json({ error: 'Cloud speech service is unavailable.' });
    }
  } finally {
    clearTimeout(timeout);
    if (requestWindows.size > 1000) {
      for (const [key, entry] of requestWindows) {
        if (now - entry.startedAt >= 60_000) requestWindows.delete(key);
      }
    }
  }
});

app.use('/api', (_request, response) => {
  response.status(404).json({ error: 'API endpoint not found.' });
});

app.use((error, _request, response, _next) => {
  if (error instanceof SyntaxError && 'body' in error) {
    response.status(400).json({ error: 'Request body must contain valid JSON.' });
    return;
  }

  if (error?.type === 'entity.too.large') {
    response.status(413).json({ error: 'Request body is too large.' });
    return;
  }

  console.error('Unhandled server request error:', error);
  response.status(500).json({ error: 'An unexpected server error occurred.' });
});

if (production) {
  const distDirectory = path.join(__dirname, 'dist');
  app.use(express.static(distDirectory));
  app.get('*', (_request, response) => {
    response.sendFile(path.join(distDirectory, 'index.html'));
  });
} else {
  const vite = await createViteServer({
    configFile: path.join(__dirname, 'vite.config.ts'),
    server: { middlewareMode: true, host: '0.0.0.0' },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}

app.listen(port, '0.0.0.0', () => {
  console.log(`Margdarshak AI server listening on http://localhost:${port}`);
});
