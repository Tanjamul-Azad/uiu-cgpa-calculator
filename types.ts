export interface Course {
  id: number;
  name: string;
  credits: string;
  grade: string;
}

export interface RetakeCourse {
  id: number;
  credits: string;
  oldGrade: string;
  newGrade: string;
}

export interface GpaResult {
  trimesterGpa: number;
  overallCgpa: number;
  totalCredits: number;
}

export interface ChartData {
  label: string;
  point: number;
}

// Assessment Tracker Types
export interface TheoryAssessment {
  attendance: string;
  assignments: string;
  cts: { id: number, mark: string }[];
  ctCountMethod: 'best1' | 'best2' | 'best3' | 'all';
  midTerm: string;
  finalExam: string;
}

export interface TheoryCourse {
  id: number;
  name:string;
  credits: string;
  assessments: TheoryAssessment;
}

export interface LabAssessment {
  attendance: string;
  classPerformance: string;
  teamWork: string;
  midTerm: string;
  project: string;
  report: string;
  projectShow: string;
}

export interface LabCourse {
  id: number;
  name: string;
  credits: string;
  assessments: LabAssessment;
}

export interface ProjectedResult {
  semesterGpa: number;
  overallCgpa: number;
  totalCredits: number;
}
