import React, { useState, useCallback } from 'react';
import { Course, RetakeCourse, GpaResult, ChartData } from '../types';
import { GRADE_POINTS, CREDIT_OPTIONS, GRADE_OPTIONS } from '../constants';
import { PlusIcon, TrashIcon, CalculatorIcon, ChevronDownIcon } from './Icons';

interface CalculatorFormProps {
  onCalculate: (payload: { gpaResult: GpaResult; chartData: ChartData[] }) => void;
  onReset: () => void;
}

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input {...props} className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg shadow-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition" />
);

const Select = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
    <select {...props} className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg shadow-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition" />
);

const Accordion: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="border border-slate-200 rounded-lg transition-all duration-300">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-4 bg-slate-50 rounded-t-lg hover:bg-slate-100"
                aria-expanded={isOpen}
            >
                <h3 className="text-lg font-semibold text-slate-700">{title}</h3>
                <span className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                    <ChevronDownIcon />
                </span>
            </button>
            <div className={`grid transition-all duration-500 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                    <div className="p-4 space-y-4 bg-white rounded-b-lg">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

export const CalculatorForm: React.FC<CalculatorFormProps> = ({ onCalculate, onReset }) => {
  const [previousCgpa, setPreviousCgpa] = useState('');
  const [previousCredits, setPreviousCredits] = useState('');
  const [currentCourses, setCurrentCourses] = useState<Course[]>([
    { id: 1, name: 'Course 1', credits: '3.0', grade: 'A' },
    { id: 2, name: 'Course 2', credits: '3.0', grade: 'A' },
    { id: 3, name: 'Course 3', credits: '3.0', grade: 'A' },
    { id: 4, name: 'Course 4', credits: '1.0', grade: 'A' },
  ]);
  const [retakeCourses, setRetakeCourses] = useState<RetakeCourse[]>([]);
  
  const handleAddCourse = () => {
    const newCourseName = `Course ${currentCourses.length + 1}`;
    setCurrentCourses([...currentCourses, { id: Date.now(), name: newCourseName, credits: '3.0', grade: 'A' }]);
  };

  const handleRemoveCourse = (id: number) => {
    setCurrentCourses(currentCourses.filter(course => course.id !== id));
  };

  const handleCourseChange = (id: number, field: keyof Omit<Course, 'id'>, value: string) => {
    setCurrentCourses(currentCourses.map(course => course.id === id ? { ...course, [field]: value } : course));
  };

  const handleAddRetakeCourse = () => {
    setRetakeCourses([...retakeCourses, { id: Date.now(), credits: '3.0', oldGrade: 'F', newGrade: 'A' }]);
  };

  const handleRemoveRetakeCourse = (id: number) => {
    setRetakeCourses(retakeCourses.filter(course => course.id !== id));
  };

  const handleRetakeCourseChange = (id: number, field: keyof Omit<RetakeCourse, 'id'>, value: string) => {
    setRetakeCourses(retakeCourses.map(course => course.id === id ? { ...course, [field]: value } : course));
  };

  const handleReset = () => {
    setPreviousCgpa('');
    setPreviousCredits('');
    setCurrentCourses([
        { id: 1, name: 'Course 1', credits: '3.0', grade: 'A' },
        { id: 2, name: 'Course 2', credits: '3.0', grade: 'A' },
        { id: 3, name: 'Course 3', credits: '3.0', grade: 'A' },
        { id: 4, name: 'Course 4', credits: '1.0', grade: 'A' },
    ]);
    setRetakeCourses([]);
    onReset();
  };

  const calculateAndPassResults = useCallback(() => {
      const gradeToPoint = (grade: string): number | null => GRADE_POINTS[grade];
    
      const prevCGPA = parseFloat(previousCgpa) || 0;
      const prevCredits = parseFloat(previousCredits) || 0;
      const prevTotalPoints = prevCGPA * prevCredits;
  
      let currentSemesterPoints = 0;
      let currentSemesterCredits = 0;
      const chartData = currentCourses.map(course => {
          const credits = parseFloat(course.credits);
          const point = gradeToPoint(course.grade);
          if (point !== null && credits > 0) {
              currentSemesterPoints += credits * point;
              currentSemesterCredits += credits;
          }
          return { label: course.name, point: point ?? 0 };
      });
  
      const trimesterGpa = currentSemesterCredits > 0 ? currentSemesterPoints / currentSemesterCredits : 0;
  
      let retakePointAdjustment = 0;
      retakeCourses.forEach(retake => {
          const credits = parseFloat(retake.credits);
          const oldPoint = gradeToPoint(retake.oldGrade);
          const newPoint = gradeToPoint(retake.newGrade);
          if (credits > 0 && oldPoint !== null && newPoint !== null) {
              retakePointAdjustment += (newPoint - oldPoint) * credits;
          }
      });
  
      const newTotalPoints = prevTotalPoints + currentSemesterPoints + retakePointAdjustment;
      const newTotalCredits = prevCredits + currentSemesterCredits;
      const overallCgpa = newTotalCredits > 0 ? newTotalPoints / newTotalCredits : 0;
      
      onCalculate({
          gpaResult: { trimesterGpa, overallCgpa, totalCredits: newTotalCredits },
          chartData: chartData,
      });

  }, [previousCgpa, previousCredits, currentCourses, retakeCourses, onCalculate]);

  return (
    <div className="space-y-6">
      <Accordion title="Previous Semester Data (Optional)" defaultOpen>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Previous CGPA</label>
              <Input type="number" placeholder="e.g. 3.50" value={previousCgpa} onChange={e => setPreviousCgpa(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Completed Credits</label>
              <Input type="number" placeholder="e.g. 60" value={previousCredits} onChange={e => setPreviousCredits(e.target.value)} />
            </div>
          </div>
      </Accordion>

      <Accordion title="Current Semester Courses" defaultOpen>
        <div className="space-y-4">
          <div className="grid grid-cols-[2fr_1fr_1fr_auto] gap-3 items-center px-4 font-semibold text-sm text-slate-500">
            <span>Course Name (Optional)</span>
            <span>Credits</span>
            <span>Grade</span>
            <span></span>
          </div>
          {currentCourses.map((course) => (
            <div key={course.id} className="grid grid-cols-[2fr_1fr_1fr_auto] gap-3 items-center bg-slate-50 p-2 rounded-lg">
              <div>
                <Input type="text" placeholder={`e.g. CSE101`} value={course.name} onChange={e => handleCourseChange(course.id, 'name', e.target.value)} />
              </div>
              <div>
                <Select value={course.credits} onChange={e => handleCourseChange(course.id, 'credits', e.target.value)}>
                    {CREDIT_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                </Select>
              </div>
               <div>
                <Select value={course.grade} onChange={e => handleCourseChange(course.id, 'grade', e.target.value)}>
                    {GRADE_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
                </Select>
              </div>
              <button onClick={() => handleRemoveCourse(course.id)} className="text-slate-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-100"><TrashIcon /></button>
            </div>
          ))}
        </div>
        <button onClick={handleAddCourse} className="mt-4 flex items-center gap-2 w-full justify-center px-4 py-2 border-2 border-dashed border-slate-300 rounded-lg text-slate-600 hover:bg-slate-100 hover:border-slate-400 transition font-semibold">
          <PlusIcon /> Add Course
        </button>
      </Accordion>
      
      <Accordion title="Retake Courses (Optional)">
         {retakeCourses.length > 0 && (
          <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-3 items-center mb-2 font-medium text-slate-600 text-sm px-10">
              <span>Credits</span>
              <span>Old Grade</span>
              <span>New Grade</span>
              <span></span>
          </div>
        )}
        <div className="space-y-3">
          {retakeCourses.map((course) => (
            <div key={course.id} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-3 items-center">
              <div>
                 <Select value={course.credits} onChange={e => handleRetakeCourseChange(course.id, 'credits', e.target.value)}>
                    {CREDIT_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                </Select>
              </div>
              <div>
                <Select value={course.oldGrade} onChange={e => handleRetakeCourseChange(course.id, 'oldGrade', e.target.value)}>
                    {GRADE_OPTIONS.filter(g => g !== 'I' && g !== 'W').map(g => <option key={g} value={g}>{g}</option>)}
                </Select>
              </div>
              <div>
                <Select value={course.newGrade} onChange={e => handleRetakeCourseChange(course.id, 'newGrade', e.target.value)}>
                    {GRADE_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
                </Select>
              </div>
              <button onClick={() => handleRemoveRetakeCourse(course.id)} className="text-slate-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-100"><TrashIcon /></button>
            </div>
          ))}
        </div>
        <button onClick={handleAddRetakeCourse} className="mt-4 flex items-center gap-2 w-full justify-center px-4 py-2 border-2 border-dashed border-slate-300 rounded-lg text-slate-600 hover:bg-slate-100 hover:border-slate-400 transition font-semibold">
          <PlusIcon /> Add Retake Course
        </button>
      </Accordion>

      <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-200">
        <button onClick={calculateAndPassResults} className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-violet-600 text-white font-bold rounded-lg shadow-md hover:bg-violet-700 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500">
          <CalculatorIcon /> Calculate
        </button>
        <button onClick={handleReset} className="flex-1 px-6 py-3 bg-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-300 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400">
          Reset
        </button>
      </div>
    </div>
  );
};