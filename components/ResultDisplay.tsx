import React from 'react';
import { GpaResult, ChartData } from '../types';
import { ChartBarIcon } from './Icons';

interface ResultDisplayProps {
  results: GpaResult;
  chartData: ChartData[];
}

const GpaGauge: React.FC<{ label: string; value: number }> = ({ label, value }) => {
    const size = 160;
    const strokeWidth = 14;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = value / 4.0;
    const offset = circumference * (1 - progress);

    const gradeColor = 
        value >= 3.7 ? 'text-green-500' :
        value >= 3.0 ? 'text-sky-500' :
        value >= 2.0 ? 'text-amber-500' :
        'text-red-500';

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative" style={{ width: size, height: size }}>
                <svg className="absolute inset-0" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        strokeWidth={strokeWidth}
                        className="stroke-slate-200"
                        fill="none"
                    />
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        strokeWidth={strokeWidth}
                        className={`stroke-current ${gradeColor.replace('text-', 'stroke-')}`}
                        fill="none"
                        strokeLinecap="round"
                        transform={`rotate(-90 ${size/2} ${size/2})`}
                        style={{
                            strokeDasharray: circumference,
                            strokeDashoffset: offset,
                            transition: 'stroke-dashoffset 0.5s ease-out'
                        }}
                    />
                </svg>
                <div className={`absolute inset-0 flex flex-col items-center justify-center ${gradeColor}`}>
                    <span className="text-4xl font-bold tracking-tight">{value.toFixed(2)}</span>
                    <span className="text-xs font-semibold">/ 4.00</span>
                </div>
            </div>
            <span className="text-lg font-semibold text-slate-600 uppercase tracking-wider">{label}</span>
        </div>
    );
}

const CourseGradeChart: React.FC<{ data: ChartData[] }> = ({ data }) => {
    if (!data || data.length === 0 || data.every(d => d.point === 0)) {
        return (
             <div className="flex flex-col items-center justify-center h-64 bg-slate-50 rounded-lg p-4 text-center">
                 <ChartBarIcon />
                <p className="mt-2 text-slate-500">Your grade distribution will appear here after calculation.</p>
            </div>
        )
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-700 mb-4 text-center">Current Semester Grade Points</h3>
            <div className="flex justify-around items-end h-64 gap-2 border-b-2 border-slate-300 pb-2">
                {data.map((item, index) => (
                     <div key={index} className="relative flex-1 h-full flex flex-col justify-end items-center group">
                        <div 
                           className="w-3/4 max-w-12 bg-gradient-to-t from-violet-400 to-indigo-400 rounded-t-md transition-all duration-300 ease-out hover:from-violet-500 hover:to-indigo-500"
                           style={{ height: `${(item.point / 4.0) * 100}%` }}
                        />
                        <span className="absolute -bottom-6 text-xs text-slate-500 font-medium text-center truncate w-full">{item.label}</span>
                        <div className="absolute -top-7 opacity-0 group-hover:opacity-100 bg-slate-700 text-white text-xs rounded py-1 px-2 transition-opacity duration-300 pointer-events-none">
                            {item.point.toFixed(2)}
                        </div>
                     </div>
                ))}
            </div>
        </div>
    );
};


export const ResultDisplay: React.FC<ResultDisplayProps> = ({ results, chartData }) => {
  return (
    <div className="space-y-8">
        <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-center justify-items-center">
                <GpaGauge label="Trimester GPA" value={results.trimesterGpa} />
                <GpaGauge label="Overall CGPA" value={results.overallCgpa} />
            </div>
            <div className="mt-6 border-t border-slate-200 pt-4 text-center">
                <span className="text-md font-semibold text-slate-600 uppercase">Total Credits: {results.totalCredits.toFixed(2)}</span>
            </div>
        </div>

        <CourseGradeChart data={chartData} />
    </div>
  );
};