import 'dotenv/config';
import express from 'express';
import type { Request, Response } from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer as createViteServer } from 'vite';
import { generateExamWithAI, gradeEssayWithAI } from './server/geminiService.ts';
import type { ExamDifficulty, GradeLevel } from './src/data/curriculum.ts';
import type { ExamData, Grade5StudentAnswers, Grade7StudentAnswers } from './src/types/exam.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const port = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '2mb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ ok: true });
  });

  app.post('/api/generate-exam', async (req: Request, res: Response) => {
    try {
      const body = req.body as {
        grade?: number;
        week?: number;
        level?: string;
        variantMode?: boolean;
        previousSummary?: string;
      };

      const grade = (body.grade === 7 ? 7 : 5) as GradeLevel;
      const week = Math.min(35, Math.max(1, Number(body.week) || 1));
      const level = (body.level === 'advanced' ? 'advanced' : 'standard') as ExamDifficulty;

      const exam = await generateExamWithAI({
        grade,
        week,
        level,
        variantMode: Boolean(body.variantMode),
        previousSummary: typeof body.previousSummary === 'string' ? body.previousSummary : undefined,
      });

      res.json({ exam });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Lỗi không xác định khi tạo đề với Gemini AI.';
      console.error('[POST /api/generate-exam]', error);
      res.status(500).json({ error: message });
    }
  });

  app.post('/api/grade-essay', async (req: Request, res: Response) => {
    try {
      const body = req.body as {
        exam?: ExamData;
        studentAnswers?: Grade5StudentAnswers | Grade7StudentAnswers;
      };

      if (!body.exam || !body.studentAnswers) {
        res.status(400).json({ error: 'Thiếu dữ liệu đề thi hoặc bài làm của học sinh.' });
        return;
      }

      const result = await gradeEssayWithAI({
        exam: body.exam,
        studentAnswers: body.studentAnswers,
      });

      res.json(result);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Lỗi không xác định khi chấm bài bằng AI.';
      console.error('[POST /api/grade-essay]', error);
      res.status(500).json({ error: message });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR === 'true' ? false : undefined,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
