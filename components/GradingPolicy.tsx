import React from 'react';
import { GRADING_SCALE } from '../constants';

// Keyframe animation for fade-in effect
const animationStyle = `
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}
`;

export const GradingPolicy: React.FC = () => {
    return (
        <>
            <style>{animationStyle}</style>
            <div className="p-2 sm:p-4 fade-in">
                <h2 className="text-center text-2xl sm:text-3xl font-bold text-slate-800 mb-8">
                    United International University Grading Policy
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* Grade Scale Section */}
                    <div>
                        <h3 className="text-xl font-semibold text-slate-700 mb-4">Grade Scale</h3>
                        <div className="border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-100 border-b border-slate-200">
                                        <th className="p-4 font-semibold text-sm text-slate-600 uppercase">Numerical Grade (%)</th>
                                        <th className="p-4 font-semibold text-sm text-slate-600 uppercase">Grade</th>
                                        <th className="p-4 font-semibold text-sm text-slate-600 uppercase">Grade Point</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 bg-white">
                                    {GRADING_SCALE.map((item, index) => (
                                        <tr key={index} className="hover:bg-slate-50 transition-colors">
                                            <td className="p-4 text-slate-700 font-medium">{item.range}</td>
                                            <td className="p-4 text-slate-700">{item.name}</td>
                                            <td className="p-4 text-slate-700 font-bold text-violet-600">{item.point.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Assessment Methods Section */}
                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold text-slate-700 mb-4">Assessment Methods</h3>
                        <div className="bg-violet-50 border border-violet-200 p-6 rounded-lg shadow-sm transition-all hover:shadow-md hover:border-violet-300">
                            <h4 className="text-lg font-bold text-violet-800 mb-3">Theory Courses (3 Credits)</h4>
                            <ul className="list-disc list-inside space-y-2 text-violet-700">
                                <li><span className="font-semibold">Attendance:</span> 5%</li>
                                <li><span className="font-semibold">Assignments:</span> 5%</li>
                                <li><span className="font-semibold">Class Tests:</span> 20% (Best 2-3 CTs)</li>
                                <li><span className="font-semibold">Mid Term:</span> 30%</li>
                                <li><span className="font-semibold">Final Exam:</span> 40%</li>
                            </ul>
                        </div>

                        <div className="bg-rose-50 border border-rose-200 p-6 rounded-lg shadow-sm transition-all hover:shadow-md hover:border-rose-300">
                             <h4 className="text-lg font-bold text-rose-800 mb-3">Lab Courses (1 Credit)</h4>
                             <ul className="list-disc list-inside space-y-2 text-rose-700">
                                <li><span className="font-semibold">Attendance:</span> 5%</li>
                                <li><span className="font-semibold">Class Performance:</span> 20%</li>
                                <li><span className="font-semibold">Team Work:</span> 10%</li>
                                <li><span className="font-semibold">Mid Term:</span> 20%</li>
                                <li><span className="font-semibold">Project/Report/Show:</span> Variable</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Note Section */}
                <div className="mt-10 p-4 bg-slate-100 border-l-4 border-slate-400 rounded-r-lg">
                    <p className="text-sm text-slate-600">
                        <span className="font-semibold">Note:</span> This calculator follows the official grading policy of United International University. CGPA is calculated using the weighted average method based on credit hours. Use the Assessment Tracker to monitor your daily progress and predict final grades.
                    </p>
                </div>
            </div>
        </>
    );
};
