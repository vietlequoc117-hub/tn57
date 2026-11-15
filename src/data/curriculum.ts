export type GradeLevel = 5 | 7;
export type ExamDifficulty = 'standard' | 'advanced';
export type ViewMode = 'practice' | 'worksheet' | 'answerKey';

export interface WeekCurriculum {
  week: number;
  grade: GradeLevel;
  unit: string;
  lessons: string;
  specialType?: 'midterm1' | 'final1' | 'midterm2' | 'final2' | 'review';
  specialLabel?: string;
}

export const GRADE_5_CURRICULUM: WeekCurriculum[] = [
  { week: 1, grade: 5, unit: 'Chủ đề 1', lessons: 'Bài 1: Ôn tập số tự nhiên; Bài 2: Ôn tập các phép tính với số tự nhiên; Bài 3: Ôn tập phân số (T1).' },
  { week: 2, grade: 5, unit: 'Chủ đề 1', lessons: 'Bài 3 (T2); Bài 4: Phân số thập phân; Bài 5: Ôn tập các phép tính với phân số; Bài 6: Cộng, trừ hai phân số khác mẫu số (T1).' },
  { week: 3, grade: 5, unit: 'Chủ đề 1', lessons: 'Bài 6 (T2); Bài 7: Hỗn số; Bài 8: Ôn tập hình học và đo lường; Bài 9: Luyện tập chung (T1).' },
  { week: 4, grade: 5, unit: 'Chủ đề 1 & 2', lessons: 'Bài 9 (T2,3); Chủ đề 2 - Bài 10: Khái niệm số thập phân.' },
  { week: 5, grade: 5, unit: 'Chủ đề 2', lessons: 'Bài 11: So sánh các số thập phân; Bài 12: Viết số đo đại lượng dưới dạng số thập phân (T1,2).' },
  { week: 6, grade: 5, unit: 'Chủ đề 2', lessons: 'Bài 12 (T3); Bài 13: Làm tròn số thập phân; Bài 14: Luyện tập chung.' },
  { week: 7, grade: 5, unit: 'Chủ đề 3', lessons: 'Bài 15: Ki-lô-mét vuông, Héc-ta; Bài 16: Các đơn vị đo diện tích.' },
  { week: 8, grade: 5, unit: 'Chủ đề 3', lessons: 'Bài 17: Thực hành và trải nghiệm đơn vị đo đại lượng; Bài 18: Luyện tập chung.' },
  { week: 9, grade: 5, unit: 'Chủ đề 1, 2, 3', lessons: 'Ôn tập & Đề kiểm tra Giữa học kì 1 (Chủ đề 1, 2, 3).', specialType: 'midterm1', specialLabel: 'Kiểm tra Giữa HK1' },
  { week: 10, grade: 5, unit: 'Chủ đề 4', lessons: 'Bài 19: Phép cộng số thập phân; Bài 20: Phép trừ số thập phân.' },
  { week: 11, grade: 5, unit: 'Chủ đề 4', lessons: 'Bài 21: Phép nhân số thập phân.' },
  { week: 12, grade: 5, unit: 'Chủ đề 4', lessons: 'Bài 22: Phép chia số thập phân (T1-4).' },
  { week: 13, grade: 5, unit: 'Chủ đề 4', lessons: 'Bài 23: Nhân, chia số thập phân với 10; 100; 1000... hoặc 0,1; 0,01; 0,001...; Bài 24: Luyện tập chung.' },
  { week: 14, grade: 5, unit: 'Chủ đề 5', lessons: 'Bài 25: Hình tam giác, Diện tích hình tam giác; Bài 26: Hình thang, Diện tích hình thang (T1).' },
  { week: 15, grade: 5, unit: 'Chủ đề 5', lessons: 'Bài 26 (T2,3); Bài 27: Đường tròn, Chu vi và diện tích hình tròn.' },
  { week: 16, grade: 5, unit: 'Chủ đề 5', lessons: 'Bài 28: Thực hành đo, vẽ, lắp ghép, tạo hình; Bài 29: Luyện tập chung.' },
  { week: 17, grade: 5, unit: 'Chủ đề 6 (Ôn tập HK1)', lessons: 'Bài 30: Ôn tập số thập phân; Bài 31: Ôn tập phép tính số thập phân; Bài 32: Ôn tập hình phẳng.', specialType: 'review', specialLabel: 'Ôn tập HK1' },
  { week: 18, grade: 5, unit: 'Chủ đề 6 (Ôn tập HK1)', lessons: 'Bài 33: Ôn tập diện tích, chu vi hình phẳng; Bài 34: Ôn tập đo lường; Bài 35: Ôn tập chung & Kiểm tra Cuối kì 1.', specialType: 'final1', specialLabel: 'Kiểm tra Cuối HK1' },
  { week: 19, grade: 5, unit: 'Chủ đề 7', lessons: 'Bài 36: Tỉ số, Tỉ số phần trăm; Bài 37: Tỉ lệ bản đồ và ứng dụng.' },
  { week: 20, grade: 5, unit: 'Chủ đề 7', lessons: 'Bài 38: Tìm hai số khi biết tổng và tỉ số; Bài 39: Tìm hai số khi biết hiệu và tỉ số.' },
  { week: 21, grade: 5, unit: 'Chủ đề 7', lessons: 'Bài 40: Tìm tỉ số phần trăm của hai số; Bài 41: Tìm giá trị phần trăm của một số.' },
  { week: 22, grade: 5, unit: 'Chủ đề 7', lessons: 'Bài 42: Máy tính cầm tay; Bài 43: Thực hành máy tính cầm tay; Bài 44: Luyện tập chung.' },
  { week: 23, grade: 5, unit: 'Chủ đề 8', lessons: 'Bài 45: Thể tích của một hình; Bài 46: Xăng-ti-mét khối, Đề-xi-mét khối; Bài 47: Mét khối.' },
  { week: 24, grade: 5, unit: 'Chủ đề 8 & 9', lessons: 'Bài 48: Luyện tập chung; Chủ đề 9 - Bài 49: Hình khai triển hình lập phương, hình hộp chữ nhật, hình trụ; Bài 50: Diện tích xung quanh, toàn phần hình hộp chữ nhật (T1).' },
  { week: 25, grade: 5, unit: 'Chủ đề 9', lessons: 'Bài 50 (T2); Bài 51: Diện tích xung quanh, toàn phần hình lập phương; Bài 52: Thể tích hình hộp chữ nhật.' },
  { week: 26, grade: 5, unit: 'Chủ đề 9', lessons: 'Bài 53: Thể tích hình lập phương; Ôn tập & Kiểm tra Giữa học kì 2.', specialType: 'midterm2', specialLabel: 'Kiểm tra Giữa HK2' },
  { week: 27, grade: 5, unit: 'Chủ đề 9 & 10', lessons: 'Bài 54: Thực hành tính toán ước lượng thể tích; Bài 55: Luyện tập chung; Chủ đề 10 - Bài 56: Các đơn vị đo thời gian.' },
  { week: 28, grade: 5, unit: 'Chủ đề 10', lessons: 'Bài 57: Cộng, trừ số đo thời gian; Bài 58: Nhân, chia số đo thời gian với một số.' },
  { week: 29, grade: 5, unit: 'Chủ đề 10', lessons: 'Bài 59: Vận tốc của chuyển động đều; Bài 60: Quãng đường, thời gian của chuyển động đều (T1).' },
  { week: 30, grade: 5, unit: 'Chủ đề 10', lessons: 'Bài 60 (T2); Bài 61: Thực hành ước lượng v, s, t; Bài 62: Luyện tập chung.' },
  { week: 31, grade: 5, unit: 'Chủ đề 11', lessons: 'Bài 63: Thu thập, phân loại, sắp xếp số liệu; Bài 64: Biểu đồ hình quạt tròn; Bài 65: Tỉ số số lần lặp lại sự kiện.' },
  { week: 32, grade: 5, unit: 'Chủ đề 11 & 12', lessons: 'Bài 66: Thực hành biểu diễn số liệu thống kê; Bài 67: Luyện tập chung; Chủ đề 12 - Bài 68: Ôn tập STN, phân số, STP.' },
  { week: 33, grade: 5, unit: 'Chủ đề 12', lessons: 'Bài 69: Ôn tập các phép tính; Bài 70: Ôn tập tỉ số, tỉ số phần trăm; Bài 71: Ôn tập hình học.' },
  { week: 34, grade: 5, unit: 'Chủ đề 12', lessons: 'Bài 72: Ôn tập đo lường; Bài 73: Ôn tập toán chuyển động đều; Bài 74: Ôn tập thống kê xác suất.', specialType: 'review', specialLabel: 'Ôn tập Cuối năm' },
  { week: 35, grade: 5, unit: 'Chủ đề 12', lessons: 'Bài 75: Ôn tập chung & Kiểm tra Cuối năm học.', specialType: 'final2', specialLabel: 'Kiểm tra Cuối năm' },
];

export const GRADE_7_CURRICULUM: WeekCurriculum[] = [
  { week: 1, grade: 7, unit: 'Chương I & III', lessons: 'Chương I (Bài 1: Tập hợp các số hữu tỉ) + Chương III (Bài 8: Góc ở vị trí đặc biệt).' },
  { week: 2, grade: 7, unit: 'Chương I & III', lessons: 'Bài 2: Cộng, trừ, nhân, chia số hữu tỉ + Bài 8: Tia phân giác của một góc.' },
  { week: 3, grade: 7, unit: 'Chương I & III', lessons: 'Luyện tập chung Chương I + Bài 9: Hai đường thẳng song song và dấu hiệu nhận biết.' },
  { week: 4, grade: 7, unit: 'Chương I & III', lessons: 'Bài 3: Lũy thừa với số mũ tự nhiên của một số hữu tỉ + Luyện tập chung Hình.' },
  { week: 5, grade: 7, unit: 'Chương I & III', lessons: 'Bài 4: Thứ tự thực hiện các phép tính, Quy tắc chuyển vế + Bài 10: Tiên đề Euclid, Tính chất hai đường thẳng song song.' },
  { week: 6, grade: 7, unit: 'Chương I & III', lessons: 'Bài tập cuối Chương I + Bài 11: Định lí và chứng minh định lí.' },
  { week: 7, grade: 7, unit: 'Chương II & III', lessons: 'Chương II (Bài 5: Làm quen với số thập phân vô hạn tuần hoàn) + Bài tập cuối Chương III.' },
  { week: 8, grade: 7, unit: 'Chương II', lessons: 'Bài 6: Số vô tỉ, Căn bậc hai số học; Bài 7: Tập hợp các số thực.' },
  { week: 9, grade: 7, unit: 'Chương I, II, III', lessons: 'Luyện tập chung Chương II + Ôn tập & Kiểm tra Giữa học kì 1.', specialType: 'midterm1', specialLabel: 'Kiểm tra Giữa HK1' },
  { week: 10, grade: 7, unit: 'Chương IV & II', lessons: 'Chương IV (Bài 12: Tổng các góc trong một tam giác) + Bài tập cuối Chương II.' },
  { week: 11, grade: 7, unit: 'Chương IV', lessons: 'Bài 13: Hai tam giác bằng nhau, Trường hợp bằng nhau thứ nhất (c.c.c).' },
  { week: 12, grade: 7, unit: 'Chương IV', lessons: 'Luyện tập chung + Bài 14: Trường hợp bằng nhau thứ hai (c.g.c) và thứ ba (g.c.g) của tam giác.' },
  { week: 13, grade: 7, unit: 'Chương IV', lessons: 'Bài 15: Các trường hợp bằng nhau của tam giác vuông.' },
  { week: 14, grade: 7, unit: 'Chương IV', lessons: 'Bài 16: Tam giác cân, Đường trung trực của đoạn thẳng.' },
  { week: 15, grade: 7, unit: 'Chương IV & V', lessons: 'Luyện tập chung & Bài tập cuối Chương IV + Chương V (Bài 17: Thu thập và phân loại dữ liệu).' },
  { week: 16, grade: 7, unit: 'Chương V', lessons: 'Bài 18: Biểu đồ hình quạt tròn; Bài 19: Biểu đồ đoạn thẳng.' },
  { week: 17, grade: 7, unit: 'Chương V & Ôn tập', lessons: 'Luyện tập chung & Bài tập cuối Chương V + Ôn tập Học kì 1.', specialType: 'review', specialLabel: 'Ôn tập HK1' },
  { week: 18, grade: 7, unit: 'Tổng kết HK1', lessons: 'Hoạt động thực hành trải nghiệm + Kiểm tra Cuối học kì 1.', specialType: 'final1', specialLabel: 'Kiểm tra Cuối HK1' },
  { week: 19, grade: 7, unit: 'Chương VI & IX', lessons: 'Chương VI (Bài 20: Tỉ lệ thức) + Chương IX (Bài 31: Quan hệ giữa góc và cạnh đối diện trong một tam giác).' },
  { week: 20, grade: 7, unit: 'Chương VI & IX', lessons: 'Bài 21: Tính chất của dãy tỉ số bằng nhau + Bài 32: Quan hệ giữa đường vuông góc và đường xiên.' },
  { week: 21, grade: 7, unit: 'Chương VI & IX', lessons: 'Luyện tập chung + Bài 33: Quan hệ giữa ba cạnh của một tam giác.' },
  { week: 22, grade: 7, unit: 'Chương VI & IX', lessons: 'Bài 22: Đại lượng tỉ lệ thuận + Luyện tập chung Chương IX.' },
  { week: 23, grade: 7, unit: 'Chương VI & IX', lessons: 'Bài 23: Đại lượng tỉ lệ nghịch + Bài 34: Sự đồng quy của ba đường trung tuyến, ba đường phân giác (T1).' },
  { week: 24, grade: 7, unit: 'Chương VI & IX', lessons: 'Bài tập cuối Chương VI + Bài 34 (T2).' },
  { week: 25, grade: 7, unit: 'Chương VII & IX', lessons: 'Chương VII (Bài 24: Biểu thức đại số) + Bài 35: Sự đồng quy của ba đường trung trực, ba đường cao.' },
  { week: 26, grade: 7, unit: 'Ôn tập Giữa HK2', lessons: 'Ôn tập & Kiểm tra Giữa học kì 2.', specialType: 'midterm2', specialLabel: 'Kiểm tra Giữa HK2' },
  { week: 27, grade: 7, unit: 'Chương VII & IX', lessons: 'Bài 25: Đa thức một biến + Luyện tập chung Chương IX.' },
  { week: 28, grade: 7, unit: 'Chương VII & IX', lessons: 'Bài 26: Phép cộng và phép trừ đa thức một biến + Bài tập cuối Chương IX.' },
  { week: 29, grade: 7, unit: 'Chương VII & X', lessons: 'Luyện tập chung + Chương X (Bài 36: Hình hộp chữ nhật và hình lập phương).' },
  { week: 30, grade: 7, unit: 'Chương VII & X', lessons: 'Bài 27: Phép nhân đa thức một biến + Luyện tập Hình học không gian.' },
  { week: 31, grade: 7, unit: 'Chương VII & X', lessons: 'Bài 28: Phép chia đa thức một biến + Bài 37: Hình lăng trụ đứng tam giác và hình lăng trụ đứng tứ giác.' },
  { week: 32, grade: 7, unit: 'Chương VII & X', lessons: 'Luyện tập chung & Bài tập cuối Chương VII + Bài tập cuối Chương X.' },
  { week: 33, grade: 7, unit: 'Chương VIII', lessons: 'Chương VIII (Bài 29: Làm quen với biến cố; Bài 30: Làm quen với xác suất của biến cố).' },
  { week: 34, grade: 7, unit: 'Chương VIII & Ôn tập', lessons: 'Luyện tập chung Chương VIII + Ôn tập Cuối năm.', specialType: 'review', specialLabel: 'Ôn tập Cuối năm' },
  { week: 35, grade: 7, unit: 'Tổng kết năm học', lessons: 'Tổng kết ôn tập toàn năm & Kiểm tra Cuối học kì 2.', specialType: 'final2', specialLabel: 'Kiểm tra Cuối HK2' },
];

export function getCurriculumForGrade(grade: GradeLevel): WeekCurriculum[] {
  return grade === 5 ? GRADE_5_CURRICULUM : GRADE_7_CURRICULUM;
}

export function getWeekInfo(grade: GradeLevel, week: number): WeekCurriculum {
  const list = getCurriculumForGrade(grade);
  return list.find((w) => w.week === week) ?? list[0];
}

export function getCumulativeScopeText(grade: GradeLevel, week: number): string {
  const list = getCurriculumForGrade(grade);
  return list
    .filter((item) => item.week <= week)
    .map((item) => `- Tuần ${item.week} (${item.unit}): ${item.lessons}`)
    .join('\n');
}
