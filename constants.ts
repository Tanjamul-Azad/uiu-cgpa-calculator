export const GRADE_POINTS: { [key: string]: number | null } = {
  'A': 4.00,
  'A-': 3.67,
  'B+': 3.33,
  'B': 3.00,
  'B-': 2.67,
  'C+': 2.33,
  'C': 2.00,
  'C-': 1.67,
  'D+': 1.33,
  'D': 1.00,
  'F': 0.00,
  'I': null,
  'W': null,
};

export const CREDIT_OPTIONS = ['4.0', '3.0', '2.0', '1.5', '1.0', '0.5'];

export const GRADE_OPTIONS = Object.keys(GRADE_POINTS);

export const GRADING_SCALE = [
    { range: '90 - 100', name: 'A (Plain)', grade: 'A', point: 4.0, minMarks: 90 },
    { range: '86 - 89', name: 'A- (Minus)', grade: 'A-', point: 3.67, minMarks: 86 },
    { range: '82 - 85', name: 'B+ (Plus)', grade: 'B+', point: 3.33, minMarks: 82 },
    { range: '78 - 81', name: 'B (Plain)', grade: 'B', point: 3.0, minMarks: 78 },
    { range: '74 - 77', name: 'B- (Minus)', grade: 'B-', point: 2.67, minMarks: 74 },
    { range: '70 - 73', name: 'C+ (Plus)', grade: 'C+', point: 2.33, minMarks: 70 },
    { range: '66 - 69', name: 'C (Plain)', grade: 'C', point: 2.0, minMarks: 66 },
    { range: '62 - 65', name: 'C- (Minus)', grade: 'C-', point: 1.67, minMarks: 62 },
    { range: '58 - 61', name: 'D+ (Plus)', grade: 'D+', point: 1.33, minMarks: 58 },
    { range: '55 - 57', name: 'D (Plain)', grade: 'D', point: 1.0, minMarks: 55 },
    { range: 'Below 55', name: 'F', grade: 'F', point: 0.0, minMarks: 0 },
];

export const getGradeFromMarks = (marks: number): { grade: string, point: number } => {
    for (const scale of GRADING_SCALE) {
        if (marks >= scale.minMarks) {
            return { grade: scale.grade, point: scale.point };
        }
    }
    // This case should not be reached if marks are >= 0
    return { grade: 'F', point: 0.0 };
};

export const getGradeColor = (grade: string) => {
    switch (grade) {
        case 'A':
        case 'A-':
            return 'bg-green-100 text-green-800';
        case 'B+':
        case 'B':
        case 'B-':
            return 'bg-sky-100 text-sky-800';
        case 'C+':
        case 'C':
        case 'C-':
            return 'bg-amber-100 text-amber-800';
        case 'D+':
        case 'D':
            return 'bg-orange-100 text-orange-800';
        case 'F':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-slate-100 text-slate-800';
    }
};
