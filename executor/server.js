import express from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';

const asyncExecute = promisify(exec);
const app = express();
app.use(express.json());

app.post('/execute', async (req, res) => {
  const { command } = req.body || {};
  if (!command) return res.status(400).json({ error: 'command required' });

  try {
    const { stdout, stderr } = await asyncExecute(command);
    return res.json({ success: true, result: `Success:\n${stdout}\nLogs/Warnings:\n${stderr}` });
  } catch (err) {
    return res.json({ success: false, result: `Error: ${err.message}` });
  }
});

app.get('/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Executor service listening on port ${PORT}`));

export default app;
