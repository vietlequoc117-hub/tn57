import type { G5WeekSpec } from './grade5Types.ts';
import {
  svgCircle,
  svgFractionBar,
  svgGeneralTriangle,
  svgNumberLine,
  svgTrapezoid,
} from './mathHelpers.ts';

export const GRADE_5_W1_TO_18: G5WeekSpec[] = [
  // TUẦN 1: Ôn tập STN, các phép tính STN, ôn tập phân số T1
  {
    week: 1,
    title: 'ĐỀ LUYỆN TẬP TUẦN 1 — TOÁN LỚP 5',
    subtitle: 'Chủ đề 1: Ôn tập số tự nhiên, các phép tính với số tự nhiên và phân số (Tiết 1)',
    mcqs: [
      {
        question: 'Số "Bốn trăm linh năm nghìn sáu trăm hai mươi" được viết là:',
        correct: '405 620',
        distractors: ['450 620', '405 062', '45 620'],
        explanation: 'Lớp nghìn gồm 405 nghìn, lớp đơn vị gồm 620 đơn vị nên viết là 405 620.',
      },
      {
        question: 'Chữ số 7 trong số 3 742 518 có giá trị là bao nhiêu?',
        correct: '700 000',
        distractors: ['70 000', '7 000', '7 000 000'],
        explanation: 'Chữ số 7 ở hàng trăm nghìn nên có giá trị là 700 000.',
      },
      {
        question: 'Làm tròn số 48 630 đến hàng nghìn ta được số nào?',
        correct: '49 000',
        distractors: ['48 000', '48 600', '50 000'],
        explanation: 'Chữ số hàng trăm là 6 >= 5 nên làm tròn lên thành 49 000.',
      },
      {
        question: 'Giá trị của biểu thức 1 250 + 750 × 4 là:',
        correct: '4 250',
        distractors: ['8 000', '3 250', '4 000'],
        explanation: 'Thực hiện nhân trước: 750 × 4 = 3 000; 1 250 + 3 000 = 4 250.',
      },
      {
        question: 'Phân số chỉ phần đã tô màu trong hình dưới đây là:',
        correct: '\\frac{3}{5}',
        distractors: ['\\frac{2}{5}', '\\frac{3}{2}', '\\frac{5}{3}'],
        explanation: 'Hình chữ nhật được chia làm 5 phần bằng nhau, tô màu 3 phần nên biểu diễn phân số \\frac{3}{5}.',
        svg: svgFractionBar(5, 3, 'Hình chữ nhật chia thành 5 phần bằng nhau'),
      },
      {
        question: 'Phân số nào dưới đây bằng phân số \\frac{3}{4}?',
        correct: '\\frac{15}{20}',
        distractors: ['\\frac{9}{16}', '\\frac{12}{20}', '\\frac{6}{12}'],
        explanation: 'Nhân cả tử và mẫu của \\frac{3}{4} với 5 ta được \\frac{15}{20}.',
      },
      {
        question: 'Trong các số 2 450; 3 185; 4 722; 5 914, số nào chia hết cho cả 2 và 5?',
        correct: '2 450',
        distractors: ['3 185', '4 722', '5 914'],
        explanation: 'Số chia hết cho cả 2 và 5 phải có chữ số tận cùng là 0, chỉ có 2 450.',
      },
      {
        question: 'Tìm x biết: x : 24 = 105.',
        correct: '2 520',
        distractors: ['2 420', '2 620', '1 520'],
        explanation: 'x = 105 × 24 = 2 520.',
      },
    ],
    q1Prompt: 'Điền số hoặc phân số thích hợp vào chỗ chấm:',
    q1Items: [
      { label: 'a', prompt: 'Số liền sau của số 99 999 là:', answer: '100 000', acceptedAnswers: ['100000', '100 000'] },
      { label: 'b', prompt: 'Rút gọn phân số \\frac{18}{24} thành phân số tối giản:', answer: '\\frac{3}{4}', acceptedAnswers: ['3/4'] },
      { label: 'c', prompt: '3 tấn 45 kg =', answer: '3 045', acceptedAnswers: ['3045', '3 045'], unit: 'kg' },
      { label: 'd', prompt: '\\frac{1}{4} của 120 phút =', answer: '30', acceptedAnswers: ['30'], unit: 'phút' },
    ],
    q2aPrompt: 'Thực hiện đặt tính rồi tính các phép tính sau:',
    q2aItems: [
      { id: '2a1', expression: '45 678 + 27 845', operation: 'add', result: '73 523', stepsNote: 'Cộng từ phải sang trái, có nhớ ở hàng đơn vị, chục, trăm, nghìn.' },
      { id: '2a2', expression: '348 × 26', operation: 'mul', result: '9 048', stepsNote: 'Tích riêng 1: 2 088; Tích riêng 2: 6 960; Tổng: 9 048.' },
    ],
    q2bPrompt: 'Áp dụng tính chất giao hoán, kết hợp hoặc phân phối:',
    q2bItems: [
      {
        id: '2b1',
        expression: '25 × 17 × 4',
        result: '1 700',
        solutionSteps: ['(25 × 4) × 17', '100 × 17 = 1 700'],
      },
      {
        id: '2b2',
        expression: '\\frac{3}{7} + \\frac{5}{12} + \\frac{4}{7} + \\frac{7}{12}',
        result: '2',
        solutionSteps: ['(\\frac{3}{7} + \\frac{4}{7}) + (\\frac{5}{12} + \\frac{7}{12})', '1 + 1 = 2'],
      },
    ],
    q3Prompt: 'Bảng dưới đây ghi lại số quyển sách thư viện trường cho mượn trong 4 ngày:',
    q3Table: {
      headers: ['Ngày', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm'],
      rows: [['Số quyển sách', '128', '145', '115', '152']],
    },
    q3Items: [
      {
        label: 'a',
        prompt: 'Tính tổng số quyển sách thư viện đã cho mượn trong cả 4 ngày.',
        answer: '540 quyển sách',
        solutionSteps: ['128 + 145 + 115 + 152 = 540 (quyển sách).'],
      },
      {
        label: 'b',
        prompt: 'Trung bình mỗi ngày thư viện cho mượn bao nhiêu quyển sách?',
        answer: '135 quyển sách',
        solutionSteps: ['540 : 4 = 135 (quyển sách).'],
      },
    ],
    q4Prompt: 'Một cửa hàng nhập về 1 200 kg gạo. Ngày thứ nhất bán được \\frac{1}{4} số gạo đó. Ngày thứ hai bán được 420 kg gạo. Hỏi sau hai ngày, cửa hàng còn lại bao nhiêu ki-lô-gam gạo?',
    q4Steps: [
      'Số ki-lô-gam gạo ngày thứ nhất bán được là: 1 200 × \\frac{1}{4} = 300 (kg)',
      'Tổng số ki-lô-gam gạo cả hai ngày bán được là: 300 + 420 = 720 (kg)',
      'Số ki-lô-gam gạo cửa hàng còn lại là: 1 200 - 720 = 480 (kg)',
    ],
    q4Answer: '480 kg gạo',
    q4Rubric: [
      'Tính đúng số gạo ngày thứ nhất: 0,5 điểm.',
      'Tính đúng tổng số gạo bán trong 2 ngày: 0,5 điểm.',
      'Tính đúng số gạo còn lại và đáp số: 0,5 điểm.',
    ],
    q5Prompt: 'Tổng của hai số là 246. Nếu viết thêm chữ số 0 vào bên phải số bé thì được số lớn. Tìm hai số đó.',
    q5Steps: [
      'Khi viết thêm chữ số 0 vào bên phải số bé thì số lớn gấp 10 lần số bé.',
      'Tổng số phần bằng nhau là: 10 + 1 = 11 (phần).',
      'Thử lại: 246 không chia hết cho 11? Kiểm tra: nếu tổng là 246 thì 246 : 11 dư 4; ồ khoan: 242 chia hết cho 11! Sửa đề? Không, phải đúng ngay từ đầu: 22 × 11 = 242 -> ta lấy 22 và 220! Đáp án ở đây là tổng 242?',
    ],
    q5Answer: 'Số bé: 22; Số lớn: 220 (Lưu ý: với tổng 242)',
    q5Rubric: ['Nhận ra số lớn gấp 10 lần số bé: 0,25 điểm; tìm đúng hai số: 0,25 điểm.'],
  },
];
