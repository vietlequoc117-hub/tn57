import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import type { GenerateContentConfig, Schema } from '@google/genai';
import {
  getCumulativeScopeText,
  getWeekInfo,
  type ExamDifficulty,
  type GradeLevel,
} from '../src/data/curriculum.ts';
import type {
  EssayGradingResponse,
  ExamData,
  Grade5Exam,
  Grade5StudentAnswers,
  Grade7Exam,
  Grade7StudentAnswers,
} from '../src/types/exam.ts';

function createClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Thiếu cấu hình GEMINI_API_KEY trên máy chủ.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function callWithFallback(
  systemInstruction: string,
  contents: string,
  responseSchema: Schema,
  preferHighReasoning = false,
): Promise<string> {
  const ai = createClient();

  const config: GenerateContentConfig = {
    systemInstruction,
    responseMimeType: 'application/json',
    responseSchema,
    thinkingConfig: {
      thinkingLevel: preferHighReasoning ? ThinkingLevel.XHIGH : ThinkingLevel.HIGH,
    },
  };

  let lastError: unknown = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents,
        config,
      });
      const text = (response.text ?? '').trim();
      if (!text) {
        throw new Error('Model gemini-4-hydrogen trả về nội dung rỗng.');
      }
      return text;
    } catch (err) {
      lastError = err;
      if (attempt === 0) {
        await new Promise((resolve) => setTimeout(resolve, 600));
      }
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error('Không thể kết nối tới Gemini API.');
}

const optionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    A: { type: Type.STRING },
    B: { type: Type.STRING },
    C: { type: Type.STRING },
    D: { type: Type.STRING },
  },
  required: ['A', 'B', 'C', 'D'],
};

const grade5ResponseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    grade: { type: Type.INTEGER },
    week: { type: Type.INTEGER },
    level: { type: Type.STRING },
    title: { type: Type.STRING },
    subtitle: { type: Type.STRING },
    timeMinutes: { type: Type.INTEGER },
    variantLabel: { type: Type.STRING },
    multipleChoice: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.INTEGER },
          points: { type: Type.NUMBER },
          question: { type: Type.STRING },
          svg: { type: Type.STRING },
          options: optionSchema,
          correctOption: { type: Type.STRING },
          explanation: { type: Type.STRING },
        },
        required: ['id', 'points', 'question', 'options', 'correctOption', 'explanation'],
      },
    },
    essay: {
      type: Type.OBJECT,
      properties: {
        q1: {
          type: Type.OBJECT,
          properties: {
            points: { type: Type.NUMBER },
            prompt: { type: Type.STRING },
            svg: { type: Type.STRING },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  prompt: { type: Type.STRING },
                  answer: { type: Type.STRING },
                  acceptedAnswers: { type: Type.ARRAY, items: { type: Type.STRING } },
                  unit: { type: Type.STRING },
                  points: { type: Type.NUMBER },
                },
                required: ['label', 'prompt', 'answer', 'acceptedAnswers', 'points'],
              },
            },
          },
          required: ['points', 'prompt', 'items'],
        },
        q2: {
          type: Type.OBJECT,
          properties: {
            points: { type: Type.NUMBER },
            partA: {
              type: Type.OBJECT,
              properties: {
                prompt: { type: Type.STRING },
                items: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      expression: { type: Type.STRING },
                      operation: { type: Type.STRING },
                      result: { type: Type.STRING },
                      stepsNote: { type: Type.STRING },
                      points: { type: Type.NUMBER },
                    },
                    required: ['id', 'expression', 'operation', 'result', 'stepsNote', 'points'],
                  },
                },
              },
              required: ['prompt', 'items'],
            },
            partB: {
              type: Type.OBJECT,
              properties: {
                prompt: { type: Type.STRING },
                items: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      expression: { type: Type.STRING },
                      result: { type: Type.STRING },
                      solutionSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
                      points: { type: Type.NUMBER },
                    },
                    required: ['id', 'expression', 'result', 'solutionSteps', 'points'],
                  },
                },
              },
              required: ['prompt', 'items'],
            },
          },
          required: ['points', 'partA', 'partB'],
        },
        q3: {
          type: Type.OBJECT,
          properties: {
            points: { type: Type.NUMBER },
            prompt: { type: Type.STRING },
            svg: { type: Type.STRING },
            tableData: {
              type: Type.OBJECT,
              properties: {
                headers: { type: Type.ARRAY, items: { type: Type.STRING } },
                rows: {
                  type: Type.ARRAY,
                  items: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
              },
              required: ['headers', 'rows'],
            },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  prompt: { type: Type.STRING },
                  answer: { type: Type.STRING },
                  solutionSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
                  points: { type: Type.NUMBER },
                },
                required: ['label', 'prompt', 'answer', 'solutionSteps', 'points'],
              },
            },
          },
          required: ['points', 'prompt', 'items'],
        },
        q4: {
          type: Type.OBJECT,
          properties: {
            points: { type: Type.NUMBER },
            prompt: { type: Type.STRING },
            svg: { type: Type.STRING },
            solutionSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
            finalAnswer: { type: Type.STRING },
            rubric: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ['points', 'prompt', 'solutionSteps', 'finalAnswer', 'rubric'],
        },
        q5: {
          type: Type.OBJECT,
          properties: {
            points: { type: Type.NUMBER },
            prompt: { type: Type.STRING },
            svg: { type: Type.STRING },
            solutionSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
            finalAnswer: { type: Type.STRING },
            rubric: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ['points', 'prompt', 'solutionSteps', 'finalAnswer', 'rubric'],
        },
      },
      required: ['q1', 'q2', 'q3', 'q4', 'q5'],
    },
  },
  required: [
    'grade',
    'week',
    'level',
    'title',
    'subtitle',
    'timeMinutes',
    'variantLabel',
    'multipleChoice',
    'essay',
  ],
};

const grade7ResponseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    grade: { type: Type.INTEGER },
    week: { type: Type.INTEGER },
    level: { type: Type.STRING },
    title: { type: Type.STRING },
    subtitle: { type: Type.STRING },
    timeMinutes: { type: Type.INTEGER },
    variantLabel: { type: Type.STRING },
    part1MultipleChoice: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.INTEGER },
          points: { type: Type.NUMBER },
          domain: { type: Type.STRING },
          question: { type: Type.STRING },
          svg: { type: Type.STRING },
          options: optionSchema,
          correctOption: { type: Type.STRING },
          explanation: { type: Type.STRING },
        },
        required: ['id', 'points', 'domain', 'question', 'options', 'correctOption', 'explanation'],
      },
    },
    part2TrueFalse: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.INTEGER },
          points: { type: Type.NUMBER },
          stem: { type: Type.STRING },
          svg: { type: Type.STRING },
          statements: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING },
                text: { type: Type.STRING },
                isTrue: { type: Type.BOOLEAN },
                explanation: { type: Type.STRING },
                points: { type: Type.NUMBER },
              },
              required: ['label', 'text', 'isTrue', 'explanation', 'points'],
            },
          },
        },
        required: ['id', 'points', 'stem', 'statements'],
      },
    },
    part3ShortAnswer: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.INTEGER },
          points: { type: Type.NUMBER },
          question: { type: Type.STRING },
          svg: { type: Type.STRING },
          displayAnswer: { type: Type.STRING },
          acceptedAnswers: { type: Type.ARRAY, items: { type: Type.STRING } },
          explanation: { type: Type.STRING },
        },
        required: ['id', 'points', 'question', 'displayAnswer', 'acceptedAnswers', 'explanation'],
      },
    },
    part4Essay: {
      type: Type.OBJECT,
      properties: {
        bai1: {
          type: Type.OBJECT,
          properties: {
            points: { type: Type.NUMBER },
            stem: { type: Type.STRING },
            parts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  prompt: { type: Type.STRING },
                  result: { type: Type.STRING },
                  solutionSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
                  points: { type: Type.NUMBER },
                },
                required: ['label', 'prompt', 'result', 'solutionSteps', 'points'],
              },
            },
          },
          required: ['points', 'stem', 'parts'],
        },
        bai2: {
          type: Type.OBJECT,
          properties: {
            points: { type: Type.NUMBER },
            stem: { type: Type.STRING },
            svg: { type: Type.STRING },
            parts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  prompt: { type: Type.STRING },
                  solutionSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
                  finalConclusion: { type: Type.STRING },
                  points: { type: Type.NUMBER },
                },
                required: ['label', 'prompt', 'solutionSteps', 'finalConclusion', 'points'],
              },
            },
          },
          required: ['points', 'stem', 'svg', 'parts'],
        },
        bai3: {
          type: Type.OBJECT,
          properties: {
            points: { type: Type.NUMBER },
            stem: { type: Type.STRING },
            svg: { type: Type.STRING },
            solutionSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
            conclusionPrompts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  answer: { type: Type.STRING },
                },
                required: ['label', 'answer'],
              },
            },
            finalAnswer: { type: Type.STRING },
            rubric: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ['points', 'stem', 'solutionSteps', 'conclusionPrompts', 'finalAnswer', 'rubric'],
        },
      },
      required: ['bai1', 'bai2', 'bai3'],
    },
  },
  required: [
    'grade',
    'week',
    'level',
    'title',
    'subtitle',
    'timeMinutes',
    'variantLabel',
    'part1MultipleChoice',
    'part2TrueFalse',
    'part3ShortAnswer',
    'part4Essay',
  ],
};

const SHARED_MATH_RULES = `
QUY TẮC BẮT BUỘC VỀ TOÁN HỌC, ĐỊNH DẠNG VÀ HÌNH VẼ SVG:
1. KIỂM TRA TOÁN HỌC 100%:
   - Trước khi xuất JSON, BẮT BUỘC tự giải nháp và kiểm tra lại toàn bộ phép tính, kết quả phân số tối giản, số đo góc, tổng ba góc tam giác (= 180°), bất đẳng thức tam giác (a + b > c), điều kiện chia hết / số đẹp.
   - Tuyệt đối không để có phương án trùng nhau hoặc không có đáp án đúng trong trắc nghiệm.
   - Tuyệt đối KHÔNG sử dụng kiến thức của tuần sau (chỉ được phép ra đề trong phạm vi kiến thức từ Tuần 1 đến Tuần đã chọn).

2. QUY CHUẨN HIỂN THỊ TOÁN HỌC VIỆT NAM:
   - Dùng dấu phẩy "," cho số thập phân (ví dụ: 1,7 km²; 0,851; 3,25).
   - Dùng dấu cách " " phân tách hàng nghìn cho số có từ 4 chữ số trở lên (ví dụ: 1 450 kg; 12 350 đồng; 240 000).
   - Viết phân số bằng cú pháp \\frac{tử}{mẫu} để giao diện tự xếp chồng tử/mẫu đẹp mắt (ví dụ: \\frac{3}{5}, \\frac{-7}{12}, hỗn số 2\\frac{3}{4}).
   - Ký hiệu toán học chuẩn: \\triangle ABC, \\widehat{ABC}, \\perp, \\parallel, \\approx, \\le, \\ge, \\ne, \\cdot, \\times, \\div, \\sqrt{9}, x^2, cm^2, m^3, 70^\\circ.

3. QUY CHUẨN HÌNH VẼ SVG (CỰC KỲ QUAN TRỌNG):
   - Khi có hình vẽ (trục số, hình học phẳng, góc, tam giác, hình hộp, lăng trụ, biểu đồ quạt tròn/đoạn thẳng), trả về chuỗi SVG hoàn chỉnh (<svg viewBox="0 0 W H" xmlns="http://www.w3.org/2000/svg">...</svg>).
   - Tính toán tọa độ hình học THẬT CHÍNH XÁC bằng lượng giác (sin/cos) để góc nhọn (vd 50°, 70°) thực sự nhọn, góc tù (vd 110°, 130°) thực sự tù, góc vuông có ô vuông nhỏ đánh dấu, hai đường thẳng song song có cùng hệ số góc, các đoạn thẳng bằng nhau có gạch đánh dấu giống nhau, các góc bằng nhau có cung tròn đánh dấu (1 cung hoặc 2 cung).
   - Chừa lề tối thiểu 24px xung quanh mọi chữ/nhãn đỉnh (A, B, C, M, N, x, y, số đo góc) để KHÔNG BAO GIỜ bị cắt chữ ở mép viewBox.
   - Dùng font-family="Plus Jakarta Sans, sans-serif", font-size="13", font-weight="700", font-style="italic" cho tên đỉnh, màu nét rõ ràng (#0f172a, #0284c7, #dc2626), nền trong suốt hoặc trắng sạch.
   - TUYỆT ĐỐI KHÔNG dùng link ảnh ngoài. Nếu câu hỏi không cần hình minh họa thì để chuỗi rỗng "".
`;

export async function generateExamWithAI(params: {
  grade: GradeLevel;
  week: number;
  level: ExamDifficulty;
  variantMode?: boolean;
  previousSummary?: string;
}): Promise<ExamData> {
  const { grade, week, level, variantMode, previousSummary } = params;
  const weekInfo = getWeekInfo(grade, week);
  const cumulativeScope = getCumulativeScopeText(grade, week);
  const difficultyLabel =
    level === 'advanced'
      ? 'Nâng cao (Khá - Giỏi, tăng cường tư duy và bài toán thực tế đa bước)'
      : 'Chuẩn SGK (bám sát chuẩn kiến thức kĩ năng Kết nối tri thức)';

  const variantInstruction = variantMode
    ? `CHẾ ĐỘ BIẾN THỂ MỚI: Hãy giữ nguyên phạm vi kiến thức Tuần ${week}, nhưng THAY ĐỔI HOÀN TOÀN ngữ cảnh thực tế (tên nhân vật, đồ vật, tình huống đời sống Việt Nam), đổi toàn bộ số liệu và cấu trúc câu hỏi để tạo thành một đề mới hoàn toàn không trùng lặp.${
        previousSummary ? `\nTránh trùng lặp với đề trước đó: ${previousSummary}` : ''
      }`
    : '';

  if (grade === 5) {
    const systemInstruction = `Bạn là chuyên gia ra đề Toán Tiểu học (Lớp 5 - Bộ sách Kết nối tri thức với cuộc sống).
${SHARED_MATH_RULES}

PHẠM VI KIẾN THỨC ĐƯỢC PHÉP RA ĐỀ (Từ Tuần 1 đến Tuần ${week} — TUYỆT ĐỐI KHÔNG DÙNG KIẾN THỨC TUẦN ${week + 1} TRỞ ĐI):
${cumulativeScope}

TRỌNG TÂM TUẦN ${week}: ${weekInfo.unit} — ${weekInfo.lessons}
MỨC ĐỘ: ${difficultyLabel}
${variantInstruction}

CẤU TRÚC ĐỀ LỚP 5 BẮT BUỘC (Tổng đúng 10,0 điểm):
I. PHẦN TRẮC NGHIỆM (4,0 điểm):
- Đúng 8 câu (id từ 1 đến 8), mỗi câu 0,5 điểm, mỗi câu có 4 phương án A, B, C, D.
- Tích hợp ít nhất 1-2 câu có hình vẽ SVG minh họa (nếu tuần học liên quan hình học, số đo, trục/phân số, biểu đồ).

II. PHẦN TỰ LUẬN (6,0 điểm):
- Câu 1 (1,0 điểm): Đúng 4 ý a, b, c, d (mỗi ý 0,25 điểm) dạng điền khuyết (viết số thập phân / đổi đơn vị / viết phân số, hỗn số hoặc giá trị phù hợp kiến thức đến Tuần ${week}). Trong acceptedAnswers liệt kê đủ các cách viết đúng tương đương (ví dụ ["1,7", "1.7"]).
- Câu 2 (2,0 điểm):
  + partA (1,0 điểm - Đặt tính rồi tính): Đúng 2 phép tính (mỗi ý 0,5 điểm). Phù hợp kiến thức đến Tuần ${week} (STN / phân số / số thập phân).
  + partB (1,0 điểm - Tính bằng cách thuận tiện): Đúng 2 biểu thức (mỗi ý 0,5 điểm): 1 biểu thức số tự nhiên hoặc số thập phân, 1 biểu thức phân số hoặc hỗn số (nếu tuần đầu chưa học số thập phân thì 1 biểu thức STN và 1 biểu thức phân số).
- Câu 3 (1,0 điểm): Bài toán dữ liệu / so sánh / làm tròn / đọc bảng biểu / hình học gồm 2 ý a và b (mỗi ý 0,5 điểm). Nếu phù hợp, bổ sung tableData hoặc svg minh họa rõ đẹp.
- Câu 4 (1,5 điểm): Bài toán có lời văn (2-3 bước tính thực tế) bám sát trọng tâm Tuần ${week}. Cung cấp solutionSteps rõ từng lời giải và phép tính, finalAnswer ngắn gọn (kèm đơn vị), rubric chấm điểm chi tiết (tổng 1,5đ theo nấc 0,25đ).
- Câu 5 (0,5 điểm): Câu Vận dụng cao (tư duy logic, tìm số, quy luật, tỉ số, dịch dấu phẩy...), có solutionSteps, finalAnswer, rubric (0,5đ).

Lưu ý: Trả về grade = 5, week = ${week}, level = "${level}", timeMinutes = 40.`;

    const prompt = `Hãy soạn một đề kiểm tra Toán Lớp 5 - Kết nối tri thức cho Tuần ${week} (${weekInfo.lessons}), mức độ ${difficultyLabel}. ${
      variantMode ? 'Sinh đề biến thể mới với bối cảnh và số liệu hoàn toàn khác biệt.' : ''
    }`;

    const raw = await callWithFallback(
      systemInstruction,
      prompt,
      grade5ResponseSchema,
      level === 'advanced',
    );
    const parsed = JSON.parse(raw) as Grade5Exam;
    parsed.grade = 5;
    parsed.week = week;
    parsed.level = level;
    parsed.timeMinutes = 40;
    return parsed;
  }

  // Grade 7
  const systemInstruction = `Bạn là chuyên gia ra đề Toán THCS (Lớp 7 - Bộ sách Kết nối tri thức với cuộc sống).
${SHARED_MATH_RULES}

PHẠM VI KIẾN THỨC ĐƯỢC PHÉP RA ĐỀ (Từ Tuần 1 đến Tuần ${week} — TUYỆT ĐỐI KHÔNG DÙNG KIẾN THỨC TUẦN ${week + 1} TRỞ ĐI):
${cumulativeScope}

TRỌNG TÂM TUẦN ${week}: ${weekInfo.unit} — ${weekInfo.lessons}
MỨC ĐỘ: ${difficultyLabel}
${variantInstruction}

CẤU TRÚC ĐỀ LỚP 7 BẮT BUỘC (Tổng đúng 10,0 điểm):
A. TRẮC NGHIỆM (7,0 điểm):
- Phần 1 (3,0 điểm): Đúng 12 câu (id từ 1 đến 12), mỗi câu 0,25 điểm, 4 phương án A, B, C, D. Lồng ghép cả Đại số/Xác suất-Thống kê và Hình học; ít nhất 2-3 câu có hình SVG minh họa (trục số, góc, hai đường thẳng, tam giác, biểu đồ...).
- Phần 2 (2,0 điểm): Đúng 2 câu Đúng/Sai (id = 13 và id = 14), mỗi câu 1,0 điểm gồm 4 ý a, b, c, d (mỗi ý 0,25 điểm):
  + Câu 13 (1,0 điểm): Bài toán thực tế (Đại số / Số hữu tỉ / Số thực / Tỉ lệ / Đa thức / Xác suất tùy tuần).
  + Câu 14 (1,0 điểm): Bài toán Hình học (hoặc Biểu đồ/Hình khối) BẮT BUỘC phải có hình vẽ SVG rõ ràng, chính xác tuyệt đối với đề bài.
- Phần 3 (2,0 điểm): Đúng 4 câu Trả lời ngắn (id từ 15 đến 18), mỗi câu 0,5 điểm (tìm x, đếm số lượng, tính góc/cạnh/xác suất; có SVG nếu là câu hình học). Liệt kê đầy đủ acceptedAnswers (VD: ["3/5", "0,6", "0.6"]).

B. TỰ LUẬN (3,0 điểm):
- Bài 1 (1,0 điểm): Thực hiện phép tính / Tính hợp lý / Tìm x / Tính toán đa thức gồm 2 ý a và b (mỗi ý 0,5 điểm).
- Bài 2 (1,0 điểm): Bài toán Hình học chứng minh hoặc tính toán gồm 2 ý a và b (mỗi ý 0,5 điểm), BẮT BUỘC có hình vẽ SVG đầy đủ ký hiệu góc, cạnh bằng nhau, song song, vuông góc khớp hoàn toàn với giả thiết.
- Bài 3 (1,0 điểm): Bài toán thực tế có lời văn (tỉ lệ, số hữu tỉ, xác suất, biểu thức đại số tùy tuần), kèm solutionSteps, conclusionPrompts (các ý cần kết luận), finalAnswer và rubric chấm theo nấc 0,25đ.

Lưu ý: Trả về grade = 7, week = ${week}, level = "${level}", timeMinutes = ${weekInfo.specialType ? 60 : 45}.`;

  const prompt = `Hãy soạn một đề kiểm tra Toán Lớp 7 - Kết nối tri thức cho Tuần ${week} (${weekInfo.lessons}), mức độ ${difficultyLabel}. ${
    variantMode ? 'Sinh đề biến thể mới với bối cảnh và số liệu hoàn toàn khác biệt.' : ''
  }`;

  const raw = await callWithFallback(
    systemInstruction,
    prompt,
    grade7ResponseSchema,
    level === 'advanced',
  );
  const parsed = JSON.parse(raw) as Grade7Exam;
  parsed.grade = 7;
  parsed.week = week;
  parsed.level = level;
  return parsed;
}

const essayGradingSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    essayEarnedPoints: { type: Type.NUMBER },
    essayMaxPoints: { type: Type.NUMBER },
    overallComment: { type: Type.STRING },
    items: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          itemId: { type: Type.STRING },
          title: { type: Type.STRING },
          maxPoints: { type: Type.NUMBER },
          earnedPoints: { type: Type.NUMBER },
          isCorrect: { type: Type.BOOLEAN },
          feedback: { type: Type.STRING },
          errorsFound: { type: Type.STRING },
          suggestion: { type: Type.STRING },
        },
        required: ['itemId', 'title', 'maxPoints', 'earnedPoints', 'isCorrect', 'feedback'],
      },
    },
  },
  required: ['essayEarnedPoints', 'essayMaxPoints', 'overallComment', 'items'],
};

export async function gradeEssayWithAI(params: {
  exam: ExamData;
  studentAnswers: Grade5StudentAnswers | Grade7StudentAnswers;
}): Promise<EssayGradingResponse> {
  const { exam, studentAnswers } = params;

  const tone =
    exam.grade === 5
      ? 'Học sinh Lớp 5 (Tiểu học): lời nhận xét thân thiện, ấm áp, khích lệ tinh thần, giải thích dễ hiểu từng bước.'
      : 'Học sinh Lớp 7 (THCS): lời nhận xét chững chạc, tích cực, chỉ rõ lập luận toán học, ký hiệu, bước biến đổi còn thiếu hoặc nhầm dấu.';

  const systemInstruction = `Bạn là giáo viên Toán chấm bài Tự luận công tâm và chính xác.
Phong cách nhận xét: ${tone}

QUY TẮC CHẤM ĐIỂM:
- Chấm từng câu/ý tự luận theo thang điểm lẻ bội số của 0,25 điểm (0; 0,25; 0,5; 0,75; 1,0; 1,25; 1,5).
- Nếu học sinh bỏ trống hoặc chỉ viết ký tự vô nghĩa -> 0 điểm, gợi ý cách bắt đầu làm bài.
- Nếu học sinh làm đúng phương pháp nhưng sai tính toán bước cuối -> cho điểm thành phần các bước đúng theo rubric, chỉ rõ bước tính sai.
- Chấp nhận các cách viết tương đương hợp lệ (VD: 0,5 hay 0.5 hay 1/2; câu chữ lời giải khác đáp án mẫu nhưng logic đúng).
- Tổng essayEarnedPoints PHẢI bằng đúng tổng earnedPoints của tất cả items.`;

  let essayPayload = '';
  let maxEssayPoints = 6;

  if (exam.grade === 5) {
    const ans = studentAnswers as Grade5StudentAnswers;
    maxEssayPoints = 6;
    essayPayload = JSON.stringify(
      {
        grade: 5,
        essayTasks: [
          {
            itemId: 'q2a',
            title: 'Câu 2a: Đặt tính rồi tính (1,0 điểm)',
            maxPoints: 1.0,
            questions: exam.essay.q2.partA.items,
            studentWork: ans.q2aWork,
            studentResults: ans.q2aResult,
          },
          {
            itemId: 'q2b',
            title: 'Câu 2b: Tính bằng cách thuận tiện (1,0 điểm)',
            maxPoints: 1.0,
            questions: exam.essay.q2.partB.items,
            studentWork: ans.q2bWork,
            studentResults: ans.q2bResult,
          },
          {
            itemId: 'q3',
            title: 'Câu 3: Dữ liệu / Hình học / Đo lường (1,0 điểm)',
            maxPoints: 1.0,
            prompt: exam.essay.q3.prompt,
            items: exam.essay.q3.items,
            studentAnswers: ans.q3,
          },
          {
            itemId: 'q4',
            title: 'Câu 4: Bài toán có lời văn (1,5 điểm)',
            maxPoints: 1.5,
            prompt: exam.essay.q4.prompt,
            officialSolution: exam.essay.q4.solutionSteps,
            officialAnswer: exam.essay.q4.finalAnswer,
            rubric: exam.essay.q4.rubric,
            studentWork: ans.q4Work,
            studentFinalAnswer: ans.q4Answer,
          },
          {
            itemId: 'q5',
            title: 'Câu 5: Vận dụng cao (0,5 điểm)',
            maxPoints: 0.5,
            prompt: exam.essay.q5.prompt,
            officialSolution: exam.essay.q5.solutionSteps,
            officialAnswer: exam.essay.q5.finalAnswer,
            rubric: exam.essay.q5.rubric,
            studentWork: ans.q5Work,
            studentFinalAnswer: ans.q5Answer,
          },
        ],
        note: 'Câu 1 (1,0đ) đã được hệ thống chấm tự động chính xác, không cần chấm lại trong danh sách này; maxPoints phần tự luận AI chấm là 5,0đ (Câu 2 đến Câu 5).',
      },
      null,
      2,
    );
    maxEssayPoints = 5.0;
  } else {
    const ans = studentAnswers as Grade7StudentAnswers;
    maxEssayPoints = 3.0;
    essayPayload = JSON.stringify(
      {
        grade: 7,
        essayTasks: [
          {
            itemId: 'bai1',
            title: 'Bài 1: Đại số / Tính toán / Tìm x (1,0 điểm)',
            maxPoints: 1.0,
            stem: exam.part4Essay.bai1.stem,
            parts: exam.part4Essay.bai1.parts,
            studentWork: ans.bai1Work,
            studentResults: ans.bai1Result,
          },
          {
            itemId: 'bai2',
            title: 'Bài 2: Hình học (1,0 điểm)',
            maxPoints: 1.0,
            stem: exam.part4Essay.bai2.stem,
            parts: exam.part4Essay.bai2.parts,
            studentWork: ans.bai2Work,
          },
          {
            itemId: 'bai3',
            title: 'Bài 3: Bài toán thực tế (1,0 điểm)',
            maxPoints: 1.0,
            stem: exam.part4Essay.bai3.stem,
            officialSolution: exam.part4Essay.bai3.solutionSteps,
            officialAnswer: exam.part4Essay.bai3.finalAnswer,
            rubric: exam.part4Essay.bai3.rubric,
            studentWork: ans.bai3Work,
            studentConclusions: ans.bai3Conclusions,
          },
        ],
      },
      null,
      2,
    );
  }

  const prompt = `Hãy chấm điểm phần Tự luận sau đây (tổng điểm tối đa phần này là ${maxEssayPoints} điểm):\n\n${essayPayload}`;
  const raw = await callWithFallback(systemInstruction, prompt, essayGradingSchema, false);
  const parsed = JSON.parse(raw) as EssayGradingResponse;
  parsed.essayMaxPoints = maxEssayPoints;
  const summed = parsed.items.reduce((acc, item) => acc + Number(item.earnedPoints || 0), 0);
  parsed.essayEarnedPoints = Math.min(maxEssayPoints, Math.round(summed * 4) / 4);
  return parsed;
}
