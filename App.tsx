import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { ResultDisplay } from './components/ResultDisplay';
import { CalculatorForm } from './components/CalculatorForm';
import { GradingPolicy } from './components/GradingPolicy';
import { AssessmentTracker } from './components/AssessmentTracker';
import { GpaResult, ChartData } from './types';

type ActiveTab = 'calculator' | 'assessment' | 'policy';

function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('calculator');
  const [results, setResults] = useState<GpaResult>({
    trimesterGpa: 0,
    overallCgpa: 0,
    totalCredits: 0,
  });
  const [chartData, setChartData] = useState<ChartData[]>([]);

  const handleCalculate = useCallback((payload: { gpaResult: GpaResult; chartData: ChartData[] }) => {
    setResults(payload.gpaResult);
    setChartData(payload.chartData);
  }, []);

  const handleReset = useCallback(() => {
    setResults({
      trimesterGpa: 0,
      overallCgpa: 0,
      totalCredits: 0,
    });
    setChartData([]);
  }, []);

  const TabButton: React.FC<{ tabName: ActiveTab; label: string }> = ({ tabName, label }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`px-6 py-3 text-lg font-semibold rounded-t-lg transition-colors duration-300 focus:outline-none ${
        activeTab === tabName
          ? 'bg-white text-violet-600 shadow-sm'
          : 'bg-transparent text-slate-500 hover:text-slate-700'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen font-sans antialiased text-slate-800 bg-slate-50">
      <Header />
      <main className="container mx-auto max-w-7xl p-4 sm:p-6 md:p-8">
        
        <div className="flex justify-center border-b border-slate-200">
            <TabButton tabName="calculator" label="CGPA Calculator" />
            <TabButton tabName="assessment" label="Assessment Tracker" />
            <TabButton tabName="policy" label="Grading Policy" />
        </div>
        
        <div className="mt-[-1px] bg-white rounded-b-xl rounded-tr-xl shadow-lg p-6 sm:p-8">
            {activeTab === 'calculator' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                  <div className="lg:pr-8">
                    <CalculatorForm onCalculate={handleCalculate} onReset={handleReset} />
                  </div>
                  <div className="lg:border-l lg:pl-12 border-slate-200">
                    <ResultDisplay results={results} chartData={chartData} />
                  </div>
              </div>
            )}
            {activeTab === 'assessment' && (
              <AssessmentTracker />
            )}
            {activeTab === 'policy' && (
              <GradingPolicy />
            )}
        </div>

      </main>
      <footer className="py-6 text-center text-slate-500 text-sm">
        <p>Crafted with ❤️ for UIU students by Md.Tanzamul Azad</p>
      </footer>
    </div>
  );
}

export default App;