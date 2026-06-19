import React from 'react';
import { ScoringResult, COMPETENCY_LABELS, CompetencyType } from '../types';

interface ResultReportProps {
  result: ScoringResult;
  sessionTitle?: string;
}

// TableHeader functional component
interface TableHeaderProps {
  pyHeader: string;
  fontSizeHeader: string;
  isCompact?: boolean;
}

const TableHeader: React.FC<TableHeaderProps> = ({ pyHeader, fontSizeHeader, isCompact }) => (
  <tr className="border-b-2 border-slate-200" style={{ backgroundColor: '#ffffff', pageBreakInside: 'avoid' }}>
    <th className="font-semibold text-slate-500 display-font uppercase tracking-wider text-left" style={{ width: '16%', paddingTop: pyHeader, paddingBottom: pyHeader, fontSize: fontSizeHeader }}>No</th>
    <th className="font-semibold text-slate-500 display-font uppercase tracking-wider text-left" style={{ width: '11%', paddingTop: pyHeader, paddingBottom: pyHeader, fontSize: fontSizeHeader }}>{isCompact ? "配" : "配点"}</th>
    <th className="font-semibold text-slate-500 display-font uppercase tracking-wider text-left" style={{ width: '11%', paddingTop: pyHeader, paddingBottom: pyHeader, fontSize: fontSizeHeader }}>{isCompact ? "正" : "正解"}</th>
    <th className="font-semibold text-slate-500 display-font uppercase tracking-wider text-left" style={{ width: '11%', paddingTop: pyHeader, paddingBottom: pyHeader, fontSize: fontSizeHeader }}>{isCompact ? "答" : "解答"}</th>
    <th className="font-semibold text-slate-500 text-center display-font uppercase tracking-wider" style={{ width: '13%', paddingTop: pyHeader, paddingBottom: pyHeader, fontSize: fontSizeHeader }}>{isCompact ? "判" : "判定"}</th>
    <th className="font-semibold text-slate-500 text-right display-font uppercase tracking-wider" style={{ width: '38%', paddingTop: pyHeader, paddingBottom: pyHeader, fontSize: fontSizeHeader }}>正答率</th>
  </tr>
);

// TableRow functional component
interface TableRowProps {
  d: any;
  pyTable: string;
  fontSizeMain: string;
  fontSizeSub: string;
}

const TableRow: React.FC<TableRowProps> = ({ d, pyTable, fontSizeMain, fontSizeSub }) => (
  <tr className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors" style={{ backgroundColor: '#ffffff', pageBreakInside: 'avoid' }}>
    <td className="font-bold text-slate-700 display-font text-left" style={{ paddingTop: pyTable, paddingBottom: pyTable, fontSize: fontSizeMain }}>Q{d.questionNumber.toString().padStart(2, '0')}</td>
    <td className="font-medium text-slate-400 text-left" style={{ paddingTop: pyTable, paddingBottom: pyTable, fontSize: fontSizeSub }}>{d.point}</td>
    <td className="font-bold text-indigo-600 text-left" style={{ paddingTop: pyTable, paddingBottom: pyTable, fontSize: fontSizeMain }}>{d.correctAnswer}</td>
    <td className={`font-bold ${d.isCorrect ? 'text-slate-800' : 'text-rose-500 font-black'} text-left`} style={{ paddingTop: pyTable, paddingBottom: pyTable, fontSize: fontSizeMain }}>
      {d.studentAnswer || "-"}
    </td>
    <td className="text-center" style={{ paddingTop: pyTable, paddingBottom: pyTable }}>
      {d.isCorrect ? (
        <span className="text-emerald-500 font-bold bg-emerald-50 rounded" style={{ padding: '1px 3px', fontSize: fontSizeSub }}>○</span>
      ) : (
        <span className="text-rose-500 font-bold bg-rose-50 rounded" style={{ padding: '1px 3px', fontSize: fontSizeSub }}>×</span>
      )}
    </td>
    <td className="text-right text-slate-400 font-medium mono-font" style={{ paddingTop: pyTable, paddingBottom: pyTable, fontSize: fontSizeSub }}>
      {d.overallAccuracy !== undefined ? `${d.overallAccuracy.toFixed(0)}%` : "-"}
    </td>
  </tr>
);

const formatClassAndNumber = (student: { id: string; class: string }) => {
  const cls = student.class && student.class !== '-' ? student.class : '';
  const num = student.id || '';
  const numStr = num.includes('番') ? num : (num ? `${num}番` : '');
  return `${cls} ${numStr}`.trim() || 'ー年ー組ー番';
};

export const ResultReport: React.FC<ResultReportProps> = ({ result, sessionTitle }) => {
  const competencyColors: Record<CompetencyType, string> = {
    none: 'text-slate-400',
    knowledge: 'text-indigo-600',
    thinking: 'text-emerald-600',
    attitude: 'text-amber-600'
  };

  const competencyBg: Record<CompetencyType, string> = {
    none: '#f8fafc',
    knowledge: '#f5f3ff', // very light indigo
    thinking: '#f0fdf4', // very light emerald
    attitude: '#fffbeb'  // very light amber
  };

  const barColors: Record<CompetencyType, string> = {
    none: 'bg-slate-300',
    knowledge: 'bg-indigo-600',
    thinking: 'bg-emerald-500',
    attitude: 'bg-amber-500'
  };

  const activeCompetencies = (Object.keys(result.competencyResults) as CompetencyType[]).filter(
    key => key !== 'none' && result.competencyResults[key].total > 0
  );

  const details = result.details;
  const totalQs = details.length;

  let colCount = 2;
  let pyTable = '6px';
  let pyHeader = '8px';
  let fontSizeMain = '11px';
  let fontSizeSub = '10px';
  let fontSizeHeader = '10px';
  
  // Outer margin / paddings and gaps
  let pHeader = 'p-8';
  let pContent = 'p-8';
  let mbStats = 'mb-8';
  let mbSpecs = 'mb-8';
  let mbTableTitle = 'mb-4 pb-2';
  let mtVisualMap = 'mt-6 mb-4';
  let pyVisualMap = 'p-3';
  let gapClass = 'gap-8';
  let gridClass = 'grid-cols-2';
  let cardPadding = 'p-3';
  let compCardPadding = 'p-4';

  if (totalQs > 160) {
    colCount = 5;
    pyTable = '1.5px';
    pyHeader = '3px';
    fontSizeMain = '8px';
    fontSizeSub = '7.5px';
    fontSizeHeader = '8px';
    pHeader = 'py-4 px-6';
    pContent = 'py-4 px-6';
    mbStats = 'mb-3';
    mbSpecs = 'mb-3';
    mbTableTitle = 'mb-2 pb-1';
    mtVisualMap = 'mt-3 mb-2';
    pyVisualMap = 'p-2';
    gapClass = 'gap-3';
    gridClass = 'grid-cols-5';
    cardPadding = 'p-2';
    compCardPadding = 'p-2.5';
  } else if (totalQs > 100) {
    colCount = 4;
    pyTable = '2.5px';
    pyHeader = '4px';
    fontSizeMain = '9.5px';
    fontSizeSub = '8.5px';
    fontSizeHeader = '9px';
    pHeader = 'py-5 px-6';
    pContent = 'py-5 px-6';
    mbStats = 'mb-4';
    mbSpecs = 'mb-4';
    mbTableTitle = 'mb-2.5 pb-1.5';
    mtVisualMap = 'mt-4 mb-3';
    pyVisualMap = 'p-2.5';
    gapClass = 'gap-4';
    gridClass = 'grid-cols-4';
    cardPadding = 'p-2.5';
    compCardPadding = 'p-3';
  } else if (totalQs > 50) {
    colCount = 3;
    pyTable = '4px';
    pyHeader = '5px';
    fontSizeMain = '10.5px';
    fontSizeSub = '9.5px';
    fontSizeHeader = '9.5px';
    pHeader = 'p-6';
    pContent = 'p-6';
    mbStats = 'mb-5';
    mbSpecs = 'mb-5';
    mbTableTitle = 'mb-3 pb-1.5';
    mtVisualMap = 'mt-5 mb-3';
    pyVisualMap = 'p-3';
    gapClass = 'gap-6';
    gridClass = 'grid-cols-3';
    cardPadding = 'p-3';
    compCardPadding = 'p-3.5';
  }

  // Determine items per column
  const itemsPerCol = Math.ceil(details.length / colCount);
  const columns = Array.from({ length: colCount }, (_, i) => 
    details.slice(i * itemsPerCol, (i + 1) * itemsPerCol)
  );

  if (totalQs > 100) {
    const cohort1 = details.slice(0, 100);
    const cohort2 = details.slice(100);

    const colCount1 = 3;
    const itemsPerCol1 = Math.ceil(cohort1.length / colCount1);
    const columns1 = Array.from({ length: colCount1 }, (_, i) => 
      cohort1.slice(i * itemsPerCol1, (i + 1) * itemsPerCol1)
    );

    const colCount2 = 3;
    const itemsPerCol2 = Math.ceil(cohort2.length / colCount2);
    const columns2 = Array.from({ length: colCount2 }, (_, i) => 
      cohort2.slice(i * itemsPerCol2, (i + 1) * itemsPerCol2)
    );

    return (
      <div 
        className="bg-white text-slate-800 shadow-none p-0" 
        style={{ 
          width: '100%', 
          backgroundColor: '#ffffff',
          boxSizing: 'border-box',
          WebkitPrintColorAdjust: 'exact',
        }}
      >
        <style>{`
          @media print {
            @page { size: A4; margin: 0; }
            body { -webkit-print-color-adjust: exact; background: white !important; }
            .page-break-before { page-break-before: always; }
            .avoid-break { page-break-inside: avoid; }
          }
        `}</style>

        {/* PAGE 1: FRONT (1-100) */}
        <div 
          style={{
            minHeight: '277mm',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#ffffff',
            borderBottom: '8px solid #4f46e5',
            padding: '24px'
          }}
          className="bg-white border-b-8 border-indigo-600 Page1"
        >
          {/* Header - Academic Elegance */}
          <div className="bg-[#0f172a] p-5 flex items-center shrink-0 rounded-t-sm" style={{ backgroundColor: '#0f172a' }}>
             <div className="bg-indigo-600 text-white px-4 py-2 font-bold text-sm rounded-sm mr-6 display-font tracking-wide shrink-0" style={{ backgroundColor: '#4f46e5', color: '#ffffff' }}>
                {formatClassAndNumber(result.student)}
             </div>
             <div className="flex-1 min-w-0">
                <div className="text-white font-bold text-base tracking-wide mb-1 display-font truncate" style={{ color: '#ffffff' }}>
                  {sessionTitle || "ASSESSMENT REPORT"}
                </div>
                <h2 className="text-2xl font-bold text-white mb-0.5 tracking-tight display-font truncate" style={{ color: '#ffffff' }}>
                  {result.student.name}
                </h2>
                <div className="text-indigo-400 font-semibold text-[10px] tracking-widest uppercase truncate" style={{ color: '#818cf8' }}>
                  表面 (1〜100問)
                </div>
             </div>
             <div className="text-right shrink-0">
                <div className="display-font text-lg font-bold tracking-wider px-3 py-1 bg-white/10 text-white rounded-sm border border-white/10" style={{ color: '#ffffff' }}>
                  {result.accuracy >= 80 ? 'EXCELLENT' : result.accuracy >= 60 ? 'PASS' : 'RETRY'}
                </div>
             </div>
          </div>

          <div className="flex-1 flex flex-col justify-between pt-6 bg-white" style={{ backgroundColor: '#ffffff' }}>
            {/* Statistics Cards */}
            <div className="grid grid-cols-4 gap-4 mb-5" style={{ backgroundColor: '#ffffff' }}>
               {[
                 { label: '総合得点', val: `${result.score} / ${result.totalPoints}`, sub: 'SCORE', color: 'text-slate-900' },
                 { label: '正答率', val: `${result.accuracy.toFixed(1)}%`, sub: 'ACCURACY', color: 'text-indigo-600' },
                 { label: '正解問題数', val: `${result.details.filter(d => d.isCorrect).length}`, sub: `OF ${result.details.length} ITEMS`, color: 'text-slate-900' },
                 { label: 'テスト平均正答率', val: `${(result.details.reduce((acc, d) => acc + (d.overallAccuracy || 0), 0) / result.details.length).toFixed(1)}%`, sub: 'AVERAGE', color: 'text-slate-400' }
               ].map((stat, i) => (
                 <div key={i} className="p-2 border-l-4 border-slate-200 bg-slate-50 rounded-r shadow-xs" style={{ backgroundColor: '#f8fafc' }}>
                    <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-widest mb-1" style={{ color: '#64748b' }}>{stat.label}</p>
                    <p className={`display-font font-bold text-sm leading-none ${stat.color}`}>{stat.val}</p>
                    {stat.sub && <p className="text-[8px] font-bold text-slate-400 mt-1 uppercase tracking-wider" style={{ color: '#94a3b8' }}>{stat.sub}</p>}
                 </div>
               ))}
            </div>

            {/* Competency Balanced Scorecard */}
            {activeCompetencies.length > 0 && (
              <div className="grid grid-cols-3 gap-4 mb-5" style={{ backgroundColor: '#ffffff' }}>
                 {activeCompetencies.map((key) => {
                   const comp = result.competencyResults[key];
                   return (
                     <div key={key} className="p-3 border border-slate-100 rounded-lg relative" style={{ backgroundColor: competencyBg[key] }}>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1" style={{ color: '#64748b' }}>{comp.label}</p>
                        <div className="flex justify-between items-baseline">
                           <span className={`display-font text-sm font-bold ${competencyColors[key]}`}>{comp.percentage.toFixed(0)}%</span>
                           <span className="text-[9px] font-semibold text-slate-400" style={{ color: '#94a3b8' }}>{comp.score} / {comp.total} 点</span>
                        </div>
                        <div className="w-full bg-slate-200 h-1 mt-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#e2e8f0' }}>
                           <div className={`h-full ${barColors[key]} transition-all`} style={{ width: `${comp.percentage}%` }}></div>
                        </div>
                     </div>
                   );
                 })}
              </div>
            )}

            {/* Detailed Score Table */}
            <div className="flex-1" style={{ backgroundColor: '#ffffff' }}>
              <div className="flex items-center space-x-3 border-b border-slate-200 mb-3 pb-1.5">
                <span className="display-font font-semibold text-[9px] uppercase text-slate-400 tracking-widest" style={{ color: '#94a3b8' }}>Detailed Scoring Matrix (1〜100問)</span>
                <div className="flex-1 h-px bg-slate-100" style={{ backgroundColor: '#f1f5f9' }}></div>
              </div>
              <div className="grid grid-cols-3 gap-5" style={{ backgroundColor: '#ffffff' }}>
                {columns1.map((colItems, idx) => (
                   <div key={idx} className="" style={{ backgroundColor: '#ffffff' }}>
                     <table className="w-full text-left table-fixed border-collapse">
                       <thead>
                         <TableHeader pyHeader="4px" fontSizeHeader="9px" isCompact={true} />
                       </thead>
                       <tbody style={{ backgroundColor: '#ffffff' }}>
                         {colItems.map((d) => (
                           <TableRow 
                             key={d.questionNumber} 
                             d={d} 
                             pyTable="3.5px" 
                             fontSizeMain="9.5px" 
                             fontSizeSub="8.5px" 
                           />
                         ))}
                       </tbody>
                     </table>
                   </div>
                ))}
              </div>
            </div>

            {/* Report Footer */}
            <div className="flex justify-between items-end pt-3 border-t border-slate-100 mt-4 shrink-0" style={{ backgroundColor: '#ffffff' }}>
               <div className="text-[8px] text-slate-400 font-semibold uppercase tracking-wider" style={{ color: '#94a3b8' }}>
                 Report issued by MarkGrade System • Accurate Grading Logs
               </div>
               <div className="bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-sm display-font font-bold text-[9px] uppercase tracking-wide border border-slate-200" style={{ backgroundColor: '#f1f5f9', color: '#475569' }}>
                 1 / 2 ページ (表面)
               </div>
            </div>
          </div>
        </div>

        {/* PAGE 2: BACK (101-200) */}
        <div 
          style={{
            pageBreakBefore: 'always',
            minHeight: '277mm',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#ffffff',
            borderBottom: '8px solid #4f46e5',
            padding: '24px'
          }}
          className="bg-white border-b-8 border-indigo-600 Page2 page-break-before"
        >
          {/* Header - Academic Elegance */}
          <div className="bg-[#1e293b] p-4 flex items-center shrink-0 rounded-t-sm" style={{ backgroundColor: '#1e293b' }}>
             <div className="bg-indigo-500 text-white px-3 py-1 font-bold text-xs rounded-sm mr-5 display-font tracking-wide shrink-0" style={{ backgroundColor: '#6366f1', color: '#ffffff' }}>
                {formatClassAndNumber(result.student)}
             </div>
             <div className="flex-1 min-w-0">
                <div className="text-white font-bold text-base tracking-wide mb-1 display-font truncate" style={{ color: '#ffffff' }}>
                  {sessionTitle || "ASSESSMENT REPORT"}
                </div>
                <h3 className="text-xl font-bold text-white mb-0.5 tracking-tight display-font truncate" style={{ color: '#ffffff' }}>
                  {result.student.name}
                </h3>
                <div className="text-indigo-300 font-semibold text-[10px] tracking-widest uppercase truncate" style={{ color: '#a5b4fc' }}>
                  裏面 (101問以降)
                </div>
             </div>
             <div className="text-right shrink-0">
                <div className="display-font text-xs font-semibold tracking-wider text-slate-300">
                  MarkGrade Analysis Logs
                </div>
             </div>
          </div>

          <div className="flex-1 flex flex-col justify-between pt-6 bg-white" style={{ backgroundColor: '#ffffff' }}>
            
            {/* Detailed Score Table */}
            <div className="flex-1" style={{ backgroundColor: '#ffffff' }}>
              <div className="flex items-center space-x-3 border-b border-slate-200 mb-3 pb-1.5">
                <span className="display-font font-semibold text-[9px] uppercase text-slate-400 tracking-widest" style={{ color: '#94a3b8' }}>Detailed Scoring Matrix (101問〜)</span>
                <div className="flex-1 h-px bg-slate-100" style={{ backgroundColor: '#f1f5f9' }}></div>
              </div>
              <div className="grid grid-cols-3 gap-5" style={{ backgroundColor: '#ffffff' }}>
                {columns2.map((colItems, idx) => (
                   <div key={idx} className="" style={{ backgroundColor: '#ffffff' }}>
                     <table className="w-full text-left table-fixed border-collapse">
                       <thead>
                         <TableHeader pyHeader="4px" fontSizeHeader="9px" isCompact={true} />
                       </thead>
                       <tbody style={{ backgroundColor: '#ffffff' }}>
                         {colItems.map((d) => (
                           <TableRow 
                             key={d.questionNumber} 
                             d={d} 
                             pyTable="3.5px" 
                             fontSizeMain="9.5px" 
                             fontSizeSub="8.5px" 
                           />
                         ))}
                       </tbody>
                     </table>
                   </div>
                ))}
              </div>
            </div>

            {/* Visual Score Map */}
            <div className="bg-slate-50 p-3 rounded border border-slate-100 mt-4 shrink-0" style={{ backgroundColor: '#f8fafc' }}>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2">設問ごとの正誤分布マップ (全 {details.length} 問)</p>
              <div className="flex h-3 gap-1">
                {result.details.map((d, i) => (
                  <div 
                    key={i} 
                    className="flex-1 rounded-xs transition-all hover:scale-115" 
                    title={`Q${d.questionNumber}: ${d.isCorrect ? '正解' : '不正解'}`}
                    style={{ backgroundColor: d.isCorrect ? '#10b981' : '#f43f5e' }} 
                  />
                ))}
              </div>
            </div>

            {/* Report Footer */}
            <div className="flex justify-between items-end pt-3 border-t border-slate-100 mt-4 shrink-0" style={{ backgroundColor: '#ffffff' }}>
               <div className="text-[8px] text-slate-400 font-semibold uppercase tracking-wider" style={{ color: '#94a3b8' }}>
                 Report issued by MarkGrade System • Accurate Grading Logs
               </div>
               <div className="bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-sm display-font font-bold text-[9px] uppercase tracking-wide border border-slate-200" style={{ backgroundColor: '#f1f5f9', color: '#475569' }}>
                 2 / 2 ページ (裏面)
               </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="bg-white text-slate-800 shadow-none p-0 border-b-8 border-indigo-600" 
      style={{ 
        width: '100%', 
        minHeight: '277mm',
        height: 'auto',
        backgroundColor: '#ffffff',
        position: 'relative',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        margin: '0 auto',
        fontSize: '13px', 
        lineHeight: 'normal',
        color: '#1e293b',
        WebkitPrintColorAdjust: 'exact',
      }}
    >
      <style>{`
        @media print {
          @page { size: A4; margin: 0; }
          body { -webkit-print-color-adjust: exact; background: white !important; }
          .page-break-before { page-break-before: always; }
          .avoid-break { page-break-inside: avoid; }
        }
      `}</style>

      {/* Header - Academic Elegance */}
      <div className={`bg-[#0f172a] ${pHeader} flex items-center shrink-0 avoid-break`} style={{ backgroundColor: '#0f172a' }}>
         <div className="bg-indigo-600 text-white px-4 py-2 font-bold text-sm rounded-sm mr-6 display-font tracking-wide" style={{ backgroundColor: '#4f46e5', color: '#ffffff' }}>
            {formatClassAndNumber(result.student)}
         </div>
         <div className="flex-1">
            <div className="text-white font-bold text-base tracking-wide mb-1 display-font truncate" style={{ color: '#ffffff' }}>
              {sessionTitle || "ASSESSMENT REPORT"}
            </div>
            <h2 className="text-2xl font-bold text-white mb-0.5 tracking-tight display-font" style={{ color: '#ffffff' }}>
              {result.student.name}
            </h2>
         </div>
         <div className="text-right">
            <div className="display-font text-xl font-bold tracking-wider px-3 py-1 bg-white/10 text-white rounded-sm border border-white/10" style={{ color: '#ffffff' }}>
              {result.accuracy >= 80 ? 'EXCELLENT' : result.accuracy >= 60 ? 'PASS' : 'RETRY'}
            </div>
         </div>
      </div>

      <div className={`${pContent} flex-1 flex flex-col bg-white`} style={{ backgroundColor: '#ffffff' }}>
        
        {/* Statistics Cards */}
        <div className={`grid grid-cols-4 gap-4 ${mbStats} avoid-break`} style={{ backgroundColor: '#ffffff' }}>
           {[
             { label: '総合得点', val: `${result.score} / ${result.totalPoints}`, sub: 'SCORE', color: 'text-slate-900' },
             { label: '正答率', val: `${result.accuracy.toFixed(1)}%`, sub: 'ACCURACY', color: 'text-indigo-600' },
             { label: '正解問題数', val: `${result.details.filter(d => d.isCorrect).length}`, sub: `OF ${result.details.length} ITEMS`, color: 'text-slate-900' },
             { label: 'テスト平均正答率', val: `${(result.details.reduce((acc, d) => acc + (d.overallAccuracy || 0), 0) / result.details.length).toFixed(1)}%`, sub: 'AVERAGE', color: 'text-slate-400' }
           ].map((stat, i) => (
             <div key={i} className={`${cardPadding} border-l-4 border-slate-200 bg-slate-50 rounded-r shadow-xs`} style={{ backgroundColor: '#f8fafc' }}>
                <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-widest mb-1" style={{ color: '#64748b' }}>{stat.label}</p>
                <p className={`display-font font-bold text-base leading-none ${stat.color}`}>{stat.val}</p>
                {stat.sub && <p className="text-[8px] font-bold text-slate-400 mt-1 uppercase tracking-wider" style={{ color: '#94a3b8' }}>{stat.sub}</p>}
             </div>
           ))}
        </div>

        {/* Competency Balanced Scorecard */}
        {activeCompetencies.length > 0 && (
          <div className={`grid grid-cols-3 gap-4 ${mbSpecs} avoid-break`} style={{ backgroundColor: '#ffffff' }}>
             {activeCompetencies.map((key) => {
               const comp = result.competencyResults[key];
               return (
                 <div key={key} className={`${compCardPadding} border border-slate-100 rounded-lg relative`} style={{ backgroundColor: competencyBg[key] }}>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1" style={{ color: '#64748b' }}>{comp.label}</p>
                    <div className="flex justify-between items-baseline">
                       <span className={`display-font text-base font-bold ${competencyColors[key]}`}>{comp.percentage.toFixed(0)}%</span>
                       <span className="text-[9px] font-semibold text-slate-400" style={{ color: '#94a3b8' }}>{comp.score} / {comp.total} 点</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 mt-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#e2e8f0' }}>
                       <div className={`h-full ${barColors[key]} transition-all`} style={{ width: `${comp.percentage}%` }}></div>
                    </div>
                 </div>
               );
             })}
          </div>
        )}

        {/* Detailed Score Table */}
        <div className="flex-1" style={{ backgroundColor: '#ffffff' }}>
          <div className={`flex items-center space-x-3 border-b border-slate-200 ${mbTableTitle} avoid-break`}>
            <span className="display-font font-semibold text-[10px] uppercase text-slate-400 tracking-widest" style={{ color: '#94a3b8' }}>Detailed Scoring Matrix</span>
            <div className="flex-1 h-px bg-slate-100" style={{ backgroundColor: '#f1f5f9' }}></div>
          </div>
          <div className={`grid ${gridClass} ${gapClass}`} style={{ backgroundColor: '#ffffff' }}>
            {columns.map((colItems, idx) => (
               <div key={idx} className="" style={{ backgroundColor: '#ffffff' }}>
                 <table className="w-full text-left table-fixed border-collapse">
                   <thead>
                     <TableHeader pyHeader={pyHeader} fontSizeHeader={fontSizeHeader} isCompact={totalQs > 100} />
                   </thead>
                   <tbody style={{ backgroundColor: '#ffffff' }}>
                     {colItems.map((d) => (
                       <TableRow 
                         key={d.questionNumber} 
                         d={d} 
                         pyTable={pyTable} 
                         fontSizeMain={fontSizeMain} 
                         fontSizeSub={fontSizeSub} 
                       />
                     ))}
                   </tbody>
                 </table>
               </div>
            ))}
          </div>
        </div>

        {/* Visual Score Map */}
        <div className={`bg-slate-50 ${pyVisualMap} rounded border border-slate-100 ${mtVisualMap} shrink-0 avoid-break`} style={{ backgroundColor: '#f8fafc' }}>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2">設問ごとの正誤分布マップ</p>
          <div className="flex h-3 gap-1">
            {result.details.map((d, i) => (
              <div 
                key={i} 
                className="flex-1 rounded-xs transition-all hover:scale-115" 
                title={`Q${d.questionNumber}: ${d.isCorrect ? '正解' : '不正解'}`}
                style={{ backgroundColor: d.isCorrect ? '#10b981' : '#f43f5e' }} 
              />
            ))}
          </div>
        </div>

        {/* Report Footer */}
        <div className="flex justify-between items-end pt-3 border-t border-slate-100 shrink-0 avoid-break" style={{ backgroundColor: '#ffffff' }}>
           <div className="text-[8px] text-slate-400 font-semibold uppercase tracking-wider" style={{ color: '#94a3b8' }}>
             Report issued by MarkGrade System • Accurate Grading Logs
           </div>
           <div className="bg-slate-100 text-slate-600 px-3 py-1 rounded-sm display-font font-bold text-[9px] uppercase tracking-wide border border-slate-200" style={{ backgroundColor: '#f1f5f9', color: '#475569' }}>
             OFFICIAL GRADE LOG
           </div>
         </div>
      </div>
    </div>
  );
};
