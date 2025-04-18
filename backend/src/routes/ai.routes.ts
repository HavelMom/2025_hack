// backend/src/routes/ai.routes.ts
import express from 'express';
import { spawn } from 'child_process';

const router = express.Router();

router.post('/diagnose', (req, res) => {
  const { prompt } = req.body as { prompt: string };
  // adjust the path so it points at your trained model script
  const py = spawn('python3', [
    '../ai-assistant/Model.py',       // or wherever you actually moved it
    'predict',
    '--model-dir', 'code/saved_model',
    '--prompt', prompt,
    '--k', '3',
  ]);

  let out = '';
  let err = '';
  py.stdout.on('data', (data) => (out += data.toString()));
  py.stderr.on('data', (data) => (err += data.toString()));
  py.on('close', (code) => {
    if (code !== 0) {
      console.error('Python error:', err);
      return res.status(500).json({ error: 'AI service failed', details: err });
    }
    // parse each line "Disease (xx.x%)" into just the disease name
    const diseases = out
      .trim()
      .split('\n')
      .map((line) => line.split(' (')[0]);
    res.json({ diseases });
  });
});

export default router;