import React, { useState, useMemo, useCallback } from 'react';
import { TheoryCourse, LabCourse, ProjectedResult } from '../types';
import { getGradeFromMarks, GRADE_POINTS, CREDIT_OPTIONS, getGradeColor } from '../constants';
import { PlusIcon, TrashIcon, ChevronDownIcon, PlusCircleIcon, CalculatorIcon } from './Icons';

const defaultTheoryCourse: Omit<TheoryCourse, 'id' | 'name'> = {
  credits: '3.0',
  assessments: {
    attendance: '', assignments: '', cts: [], ctCountMethod: 'best2', midTerm: '', finalExam: '',
  },
};

const defaultLabCourse: Omit<LabCourse, 'id' | 'name'> = {
  credits: '1.0',
  assessments: {
    attendance: '', classPerformance: '', teamWork: '', midTerm: '', project: '', report: '', projectShow: '',
  },
};

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input {...props} className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg shadow-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition" />
);

const Accordion: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="border border-slate-200 rounded-lg transition-all duration-300 bg-white shadow-sm">
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
                    <div className="p-4 space-y-4">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

const ProjectedResultDisplay: React.FC<{ results: ProjectedResult }> = ({ results }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-white bg-indigo-600 p-6 rounded-xl shadow-lg">
        {([
            { label: 'Projected Semester GPA', value: results.semesterGpa.toFixed(2) },
            { label: 'Projected Overall CGPA', value: results.overallCgpa.toFixed(2) },
            { label: 'Total Credits', value: results.totalCredits.toFixed(2) }
        ]).map(item => (
            <div key={item.label} className="text-center">
                <div className="text-4xl font-bold tracking-tight">{item.value}</div>
                <div className="text-sm uppercase tracking-wider opacity-90 mt-1">{item.label}</div>
            </div>
        ))}
    </div>
);

export const AssessmentTracker: React.FC = () => {
    const [previousCgpa, setPreviousCgpa] = useState('');
    const [previousCredits, setPreviousCredits] = useState('');
    const [theoryCourses, setTheoryCourses] = useState<TheoryCourse[]>([]);
    const [labCourses, setLabCourses] = useState<LabCourse[]>([]);
    const [activeCourseType, setActiveCourseType] = useState<'theory' | 'lab'>('theory');
    const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);

    const calculations = useMemo(() => {
        const calculateCourse = (course: TheoryCourse | LabCourse) => {
            let totalMarks = 0;
            if ('ctCountMethod' in course.assessments) {
                const { attendance, assignments, cts, ctCountMethod, midTerm, finalExam } = course.assessments;
                totalMarks += parseFloat(attendance) || 0;
                totalMarks += parseFloat(assignments) || 0;
                
                const ctMarks = cts.map(ct => parseFloat(ct.mark) || 0).sort((a, b) => b - a);
                const numToCount = ctCountMethod === 'best1' ? 1 : ctCountMethod === 'best2' ? 2 : ctCountMethod === 'best3' ? 3 : ctMarks.length;
                
                const marksToAverage = ctMarks.slice(0, numToCount);
                const averageCtMark = marksToAverage.length > 0
                    ? marksToAverage.reduce((sum, mark) => sum + mark, 0) / marksToAverage.length
                    : 0;
                totalMarks += averageCtMark;

                totalMarks += parseFloat(midTerm) || 0;
                totalMarks += parseFloat(finalExam) || 0;
            } else {
                const { attendance, classPerformance, teamWork, midTerm, project, report, projectShow } = course.assessments;
                totalMarks += parseFloat(attendance) || 0;
                totalMarks += parseFloat(classPerformance) || 0;
                totalMarks += parseFloat(teamWork) || 0;
                totalMarks += parseFloat(midTerm) || 0;
                totalMarks += parseFloat(project) || 0;
                totalMarks += parseFloat(report) || 0;
                totalMarks += parseFloat(projectShow) || 0;
            }
            totalMarks = Math.min(100, totalMarks);
            const { grade, point } = getGradeFromMarks(totalMarks);
            return { totalMarks, grade, point };
        };

        const allCourses = [...theoryCourses, ...labCourses];
        const courseData = allCourses.map(c => ({...c, ...calculateCourse(c)}));

        const currentSemesterCredits = courseData.reduce((sum, c) => sum + (parseFloat(c.credits) || 0), 0);
        const currentSemesterPoints = courseData.reduce((sum, c) => sum + (parseFloat(c.credits) || 0) * c.point, 0);
        
        const semesterGpa = currentSemesterCredits > 0 ? currentSemesterPoints / currentSemesterCredits : 0;

        const prevCGPA = parseFloat(previousCgpa) || 0;
        const prevCredits = parseFloat(previousCredits) || 0;
        const prevTotalPoints = prevCGPA * prevCredits;

        const newTotalCredits = prevCredits + currentSemesterCredits;
        const newTotalPoints = prevTotalPoints + currentSemesterPoints;
        const overallCgpa = newTotalCredits > 0 ? newTotalPoints / newTotalCredits : 0;

        return {
            courseData,
            projectedResult: { semesterGpa, overallCgpa, totalCredits: newTotalCredits }
        };

    }, [theoryCourses, labCourses, previousCgpa, previousCredits]);
    
    const handleAddCourse = (type: 'theory' | 'lab') => {
        const newId = Date.now();
        if (type === 'theory') {
            const newCourse: TheoryCourse = { id: newId, name: `Theory Course ${theoryCourses.length + 1}`, ...defaultTheoryCourse };
            setTheoryCourses([...theoryCourses, newCourse]);
        } else {
            const newCourse: LabCourse = { id: newId, name: `Lab Course ${labCourses.length + 1}`, ...defaultLabCourse };
            setLabCourses([...labCourses, newCourse]);
        }
        setSelectedCourseId(newId);
        setActiveCourseType(type);
    };

    const handleRemoveCourse = (id: number, type: 'theory' | 'lab') => {
        if (type === 'theory') setTheoryCourses(theoryCourses.filter(c => c.id !== id));
        else setLabCourses(labCourses.filter(c => c.id !== id));
        if (selectedCourseId === id) setSelectedCourseId(null);
    };

    const handleCourseChange = (id: number, type: 'theory' | 'lab', field: 'name' | 'credits', value: string) => {
        if (type === 'theory') {
            setTheoryCourses(theoryCourses.map(c => c.id === id ? { ...c, [field]: value } : c));
        } else {
            setLabCourses(labCourses.map(c => c.id === id ? { ...c, [field]: value } : c));
        }
    };

    const handleAssessmentChange = (id: number, type: 'theory' | 'lab', field: string, value: any) => {
        if (type === 'theory') {
            setTheoryCourses(theoryCourses.map(c => c.id === id ? { ...c, assessments: { ...c.assessments, [field]: value } } : c));
        } else {
            setLabCourses(labCourses.map(c => c.id === id ? { ...c, assessments: { ...c.assessments, [field]: value } } : c));
        }
    };
    
    const handleAddCt = (courseId: number) => {
        setTheoryCourses(theoryCourses.map(c => c.id === courseId ? { ...c, assessments: {...c.assessments, cts: [...c.assessments.cts, {id: Date.now(), mark: ''}]}} : c));
    };

    const handleCtChange = (courseId: number, ctId: number, value: string) => {
        setTheoryCourses(theoryCourses.map(c => c.id === courseId ? { ...c, assessments: {...c.assessments, cts: c.assessments.cts.map(ct => ct.id === ctId ? {...ct, mark: value} : ct)}} : c));
    };

    const handleRemoveCt = (courseId: number, ctId: number) => {
        setTheoryCourses(theoryCourses.map(c => c.id === courseId ? { ...c, assessments: {...c.assessments, cts: c.assessments.cts.filter(ct => ct.id !== ctId)}} : c));
    };

    const selectedCourse = useMemo(() => {
        return calculations.courseData.find(c => c.id === selectedCourseId);
    }, [selectedCourseId, calculations.courseData]);
    
    const CourseList: React.FC<{
        type: 'theory' | 'lab';
        courses: (TheoryCourse[] | LabCourse[]);
    }> = ({ type, courses }) => (
        <div className="space-y-2">
            {courses.map(course => {
                const courseInfo = calculations.courseData.find(c => c.id === course.id);
                const totalMarks = courseInfo?.totalMarks || 0;

                return (
                    <div key={course.id} 
                         onClick={() => { setSelectedCourseId(course.id); setActiveCourseType(type); }}
                         className={`p-3 rounded-lg cursor-pointer transition-all border ${selectedCourseId === course.id ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500' : 'bg-slate-50 hover:bg-slate-100 border-transparent'}`}>
                        <div className="flex justify-between items-start">
                            <div className="flex-1 pr-2">
                                <p className="font-semibold text-slate-800 truncate">{course.name}</p>
                                <p className="text-xs text-slate-500">{parseFloat(course.credits).toFixed(1)} Credits</p>
                            </div>
                            <div className="flex items-center gap-2">
                                {courseInfo && <span className={`px-2 py-1 text-xs font-bold rounded-full ${getGradeColor(courseInfo.grade)}`}>{courseInfo.grade}</span>}
                                <button onClick={(e) => { e.stopPropagation(); handleRemoveCourse(course.id, type); }} className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded-full"><TrashIcon /></button>
                            </div>
                        </div>
                        <div className="mt-2">
                           <div className="flex justify-between items-center text-xs text-slate-500 mb-1">
                               <span>Progress</span>
                               <span>{totalMarks.toFixed(1)}/100 ({totalMarks.toFixed(0)}%)</span>
                           </div>
                           <div className="w-full bg-slate-200 rounded-full h-2">
                                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${totalMarks}%`, transition: 'width 0.5s ease-in-out' }}></div>
                           </div>
                        </div>
                    </div>
                );
            })}
            <button onClick={() => handleAddCourse(type)} className="mt-2 flex items-center gap-2 w-full justify-center px-4 py-2 border-2 border-dashed border-slate-300 rounded-lg text-slate-600 hover:bg-slate-100 hover:border-slate-400 transition font-semibold">
                <PlusIcon /> Add {type === 'theory' ? 'Theory' : 'Lab'} Course
            </button>
        </div>
    );
    
    return (
        <div className="space-y-6">
            <Accordion title="Previous Academic Data (Optional)" defaultOpen>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Previous CGPA</label>
                        <Input type="number" placeholder="e.g. 3.70" value={previousCgpa} onChange={e => setPreviousCgpa(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Completed Credits</label>
                        <Input type="number" placeholder="e.g. 77" value={previousCredits} onChange={e => setPreviousCredits(e.target.value)} />
                    </div>
                </div>
            </Accordion>

            <ProjectedResultDisplay results={calculations.projectedResult} />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 bg-white p-4 border border-slate-200 rounded-lg shadow-sm space-y-4">
                     <div className="flex bg-slate-100 rounded-lg p-1">
                        <button onClick={() => setActiveCourseType('theory')} className={`flex-1 p-2 rounded-md font-semibold transition ${activeCourseType === 'theory' ? 'bg-white shadow text-indigo-600' : 'text-slate-600'}`}>Theory</button>
                        <button onClick={() => setActiveCourseType('lab')} className={`flex-1 p-2 rounded-md font-semibold transition ${activeCourseType === 'lab' ? 'bg-white shadow text-indigo-600' : 'text-slate-600'}`}>Lab</button>
                    </div>
                    {activeCourseType === 'theory' ? <CourseList type="theory" courses={theoryCourses} /> : <CourseList type="lab" courses={labCourses} />}
                </div>

                <div className="lg:col-span-2 bg-white p-6 border border-slate-200 rounded-lg shadow-sm">
                    {!selectedCourse ? (
                        <div className="flex flex-col items-center justify-center h-full text-center text-slate-500">
                           <CalculatorIcon/>
                            <p className="mt-2 font-semibold">Select a course to see its assessment details</p>
                            <p className="text-sm">Add a new course or click on an existing one from the list.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                           <h2 className="text-2xl font-bold text-slate-800">{selectedCourse.name} Assessment</h2>
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-1">Course Name</label>
                                    <Input type="text" value={selectedCourse.name} onChange={e => handleCourseChange(selectedCourse.id, activeCourseType, 'name', e.target.value)} />
                                </div>
                                <div>
                                     <label className="block text-sm font-medium text-slate-600 mb-1">Credits</label>
                                    <select value={selectedCourse.credits} onChange={e => handleCourseChange(selectedCourse.id, activeCourseType, 'credits', e.target.value)} className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg shadow-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                        {CREDIT_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                           </div>
                           <hr/>
                           {activeCourseType === 'theory' && selectedCourse.assessments && 'ctCountMethod' in selectedCourse.assessments && (
                               <div className="space-y-3">
                                   <div className="grid grid-cols-2 gap-4">
                                        <div><label className="font-semibold text-sm text-slate-600">Attendance (out of 5)</label><Input type="number" max="5" value={selectedCourse.assessments.attendance} onChange={e => handleAssessmentChange(selectedCourse.id, 'theory', 'attendance', e.target.value)} /></div>
                                        <div><label className="font-semibold text-sm text-slate-600">Assignments (out of 5)</label><Input type="number" max="5" value={selectedCourse.assessments.assignments} onChange={e => handleAssessmentChange(selectedCourse.id, 'theory', 'assignments', e.target.value)} /></div>
                                   </div>
                                   <div>
                                       <label className="font-semibold text-sm text-slate-600">Class Tests (20 marks)</label>
                                       <div className="bg-slate-50 p-3 rounded-lg space-y-2 mt-1">
                                            <select value={selectedCourse.assessments.ctCountMethod} onChange={e => handleAssessmentChange(selectedCourse.id, 'theory', 'ctCountMethod', e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800">
                                               <option value="best1">Count Best 1 CT</option>
                                               <option value="best2">Count Best 2 CTs</option>
                                               <option value="best3">Count Best 3 CTs</option>
                                               <option value="all">Count All CTs</option>
                                           </select>
                                           {selectedCourse.assessments.cts.map((ct, index) => (
                                               <div key={ct.id} className="flex items-center gap-2">
                                                   <label className="w-20 text-sm text-slate-500">CT {index+1} / 20</label>
                                                   <Input type="number" max="20" placeholder="mark" value={ct.mark} onChange={e => handleCtChange(selectedCourse!.id, ct.id, e.target.value)} />
                                                   <button onClick={() => handleRemoveCt(selectedCourse!.id, ct.id)} className="text-slate-400 hover:text-red-500"><TrashIcon/></button>
                                               </div>
                                           ))}
                                           <button onClick={() => handleAddCt(selectedCourse!.id)} className="flex items-center gap-2 text-indigo-600 font-semibold text-sm pt-1"><PlusCircleIcon/> Add CT Mark</button>
                                       </div>
                                   </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div><label className="font-semibold text-sm text-slate-600">Mid Term (out of 30)</label><Input type="number" max="30" value={selectedCourse.assessments.midTerm} onChange={e => handleAssessmentChange(selectedCourse.id, 'theory', 'midTerm', e.target.value)} /></div>
                                        <div><label className="font-semibold text-sm text-slate-600">Final Exam (out of 40)</label><Input type="number" max="40" value={selectedCourse.assessments.finalExam} onChange={e => handleAssessmentChange(selectedCourse.id, 'theory', 'finalExam', e.target.value)} /></div>
                                   </div>
                               </div>
                           )}
                           {activeCourseType === 'lab' && selectedCourse.assessments && !('ctCountMethod' in selectedCourse.assessments) && (
                               <div className="grid grid-cols-2 gap-4">
                                    <div><label className="font-semibold text-sm text-slate-600">Attendance (5%)</label><Input type="number" max="5" value={selectedCourse.assessments.attendance} onChange={e => handleAssessmentChange(selectedCourse.id, 'lab', 'attendance', e.target.value)} /></div>
                                    <div><label className="font-semibold text-sm text-slate-600">Performance (20%)</label><Input type="number" max="20" value={selectedCourse.assessments.classPerformance} onChange={e => handleAssessmentChange(selectedCourse.id, 'lab', 'classPerformance', e.target.value)} /></div>
                                    <div><label className="font-semibold text-sm text-slate-600">Team Work (10%)</label><Input type="number" max="10" value={selectedCourse.assessments.teamWork} onChange={e => handleAssessmentChange(selectedCourse.id, 'lab', 'teamWork', e.target.value)} /></div>
                                    <div><label className="font-semibold text-sm text-slate-600">Mid Term (20%)</label><Input type="number" max="20" value={selectedCourse.assessments.midTerm} onChange={e => handleAssessmentChange(selectedCourse.id, 'lab', 'midTerm', e.target.value)} /></div>
                                    <div><label className="font-semibold text-sm text-slate-600">Project (15%)</label><Input type="number" max="15" value={selectedCourse.assessments.project} onChange={e => handleAssessmentChange(selectedCourse.id, 'lab', 'project', e.target.value)} /></div>
                                    <div><label className="font-semibold text-sm text-slate-600">Report (15%)</label><Input type="number" max="15" value={selectedCourse.assessments.report} onChange={e => handleAssessmentChange(selectedCourse.id, 'lab', 'report', e.target.value)} /></div>
                                    <div><label className="font-semibold text-sm text-slate-600">Project Show (15%)</label><Input type="number" max="15" value={selectedCourse.assessments.projectShow} onChange={e => handleAssessmentChange(selectedCourse.id, 'lab', 'projectShow', e.target.value)} /></div>
                               </div>
                           )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};