
export interface Student {
  id: string;
  name: string;
  class: string;
  number?: string;
  furigana?: string;
}

export type CompetencyType = 'none' | 'knowledge' | 'thinking' | 'attitude';

export const COMPETENCY_LABELS: Record<CompetencyType, string> = {
  none: 'なし',
  knowledge: '知識・技能',
  thinking: '思考・判断・表現',
  attitude: '主体的に学習に取り組む態度'
};

export interface Question {
  number: number;
  correctAnswer: string;
  point: number;
  group: string; // 大問番号 (1, 2, 3...)
  competency: CompetencyType;
}

export interface CompetencyResult {
  label: string;
  score: number;
  total: number;
  percentage: number;
}

export interface StudentAnswer {
  studentId: string;
  answers: Record<number, string>;
}

export interface ScoringResult {
  student: Student;
  score: number;
  totalPoints: number;
  accuracy: number;
  competencyResults: Record<CompetencyType, CompetencyResult>;
  details: {
    questionNumber: number;
    correctAnswer: string;
    studentAnswer: string;
    isCorrect: boolean;
    point: number;
    group: string;
    competency: CompetencyType;
    overallAccuracy?: number;
  }[];
}

export interface ArchiveData {
  id: string;
  timestamp: string;
  name: string;
  results: ScoringResult[];
  questions: Question[];
  students: Student[];
  rawAnswers: StudentAnswer[]; // 再開時の個票生成に必要
  isArchived?: boolean; // アーカイブされたかどうかのフラグ
  rangeSlots?: RangeSlot[]; // 大問設定
}

export interface RangeSlot {
  group: string;
  start: number;
  end: number;
  selected: boolean;
}
