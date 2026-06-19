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
  <tr className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors" style={{ backgroundColor: '#ffffff', pageBreakInside: 'avoid', lineHeight: '1.0' }}>
    <td className="font-bold text-slate-700 display-font text-left" style={{ paddingTop: pyTable, paddingBottom: pyTable, fontSize: fontSizeMain, lineHeight: '1.0' }}>Q{d.questionNumber.toString().padStart(2, '0')}</td>
    <td className="font-medium text-slate-400 text-left" style={{ paddingTop: pyTable, paddingBottom: pyTable, fontSize: fontSizeSub, lineHeight: '1.0' }}>{d.point}</td>
    <td className="font-bold text-indigo-600 text-left" style={{ paddingTop: pyTable, paddingBottom: pyTable, fontSize: fontSizeMain, lineHeight: '1.0' }}>{d.correctAnswer}</td>
    <td className={`font-bold ${d.isCorrect ? 'text-slate-800' : 'text-rose-500 font-black'} text-left`} style={{ paddingTop: pyTable, paddingBottom: pyTable, fontSize: fontSizeMain, lineHeight: '1.0' }}>
      {d.studentAnswer || "-"}
    </td>
    <td className="text-center" style={{ paddingTop: pyTable, paddingBottom: pyTable, lineHeight: '1.0' }}>
      {d.isCorrect ? (
        <span className="text-emerald-500 font-extrabold bg-emerald-50 rounded-xs" style={{ padding: '0px 2px', fontSize: `calc(${fontSizeSub} - 0.5px)`, lineHeight: '1.0', display: 'inline-block' }}>○</span>
      ) : (
        <span className="text-rose-500 font-extrabold bg-rose-50 rounded-xs" style={{ padding: '0px 2px', fontSize: `calc(${fontSizeSub} - 0.5px)`, lineHeight: '1.0', display: 'inline-block' }}>×</span>
      )}
    </td>
    <td className="text-right text-slate-400 font-medium mono-font" style={{ paddingTop: pyTable, paddingBottom: pyTable, fontSize: fontSizeSub, lineHeight: '1.0' }}>
      {d.overallAccuracy !== undefined ? `${d.overallAccuracy.toFixed(0)}%` : "-"}
    </td>
  </tr>
);

const getStudentNumber = (student: { id: string; class: string; number?: string }) => {
  if (student.number !== undefined && student.number !== null && student.number !== '') {
    const digitsOnly = student.number.replace(/\D/g, '');
    if (digitsOnly) {
      const parsed = parseInt(digitsOnly, 10);
      if (!isNaN(parsed)) {
        return String(parsed);
      }
    }
    return student.number;
  }
  // fallback parsing ID
  const match = student.id.match(/\d+$/);
  if (match) {
    const rawNum = match[0];
    const parsed = parseInt(rawNum, 10);
    return isNaN(parsed) ? rawNum : String(parsed);
  }
  return '';
};

export const formatClassAndNumber = (student: { id: string; class: string; number?: string }) => {
  const cls = student.class && student.class !== '-' ? student.class : '';
  const num = getStudentNumber(student);
  const numStr = num ? `${num}番` : '';
  if (cls && numStr) {
    return `${cls}${numStr}`;
  }
  return cls || numStr || 'ー年ー組ー番';
};

export const getScoreEvaluation = (accuracy: number) => {
  if (accuracy === 100) {
    return {
      rankText: '秀 (S)',
      badgeText: 'PERFECT',
      badgeBg: 'bg-indigo-600 border-indigo-500 text-white',
      cardBorder: 'border-l-indigo-600',
      badgeColorHex: '#4f46e5',
      comment: '満点、本当におめでとうございます！すべての設問に完璧に解答できており、抜群の理解度です。この素晴らしい学力と自信を大切に、さらに得意意識を伸ばしていきましょう！',
    };
  } else if (accuracy >= 90) {
    return {
      rankText: '優 (A)',
      badgeText: 'EXCELLENT',
      badgeBg: 'bg-emerald-600 border-emerald-500 text-white',
      cardBorder: 'border-l-emerald-500',
      badgeColorHex: '#10b981',
      comment: '素晴らしい成績です！基礎知識はもちろん、思考力が必要な問題もしっかり得点できています。間違えたわずかな部分をテスト後の見直しでクリアにし、次回はさらなる高みを目指しましょう！',
    };
  } else if (accuracy >= 80) {
    return {
      rankText: '良 (B)',
      badgeText: 'VERY GOOD',
      badgeBg: 'bg-sky-600 border-sky-400 text-white',
      cardBorder: 'border-l-sky-500',
      badgeColorHex: '#0284c7',
      comment: '非常によく健闘しました！全体的に安定した理解レベルに達しています。返却された答案の「間違えた理由」を少し分析して復習するだけで、さらに確固たる実力が身につきます。',
    };
  } else if (accuracy >= 70) {
    return {
      rankText: '良好 (C+)',
      badgeText: 'GOOD',
      badgeBg: 'bg-teal-600 border-teal-500 text-white',
      cardBorder: 'border-l-teal-500',
      badgeColorHex: '#0d9488',
      comment: 'よく頑張りました！基礎的な内容や知識は十分に定着しています。今後は間違えた分野の解説を見直し、少し難しい応用問題にも積極的にチャレンジして得点源を広げましょう。',
    };
  } else if (accuracy >= 60) {
    return {
      rankText: '標準 (C)',
      badgeText: 'PASS',
      badgeBg: 'bg-indigo-50 border-indigo-200 text-indigo-700',
      cardBorder: 'border-l-indigo-300',
      badgeColorHex: '#6366f1',
      comment: '合格基準をしっかりとクリアできました！よく努力された成果です。一部の苦手な分野の基礎を再度整理し、解き直しを重ねることで、次回はさらに上の目標が十分クリア可能です！',
    };
  } else if (accuracy >= 45) {
    return {
      rankText: '要努力 (D)',
      badgeText: 'NEAR PASS',
      badgeBg: 'bg-amber-500 border-amber-400 text-white',
      cardBorder: 'border-l-amber-500',
      badgeColorHex: '#f59e0b',
      comment: '目標レベルまであと一歩です！ミスした問題のなかには、解き方を少し見直すだけで正解できた惜しいものもありそうです。まずは教科書の例題レベルから確実に解けるよう復習しましょう。',
    };
  } else {
    return {
      rankText: '要復習 (E)',
      badgeText: 'RETRY',
      badgeBg: 'bg-rose-50 border-rose-200 text-rose-700 font-bold',
      cardBorder: 'border-l-rose-400',
      badgeColorHex: '#f43f5e',
      comment: '伸びしろが非常に大きい領域です！焦る必要はありません。今回の間違いは大切な学習ステップです。まずは基本事項（公式・英単語・基礎用語など）を一つずつ着実に見端から見直して、自信をつけましょう！',
    };
  }
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
  const evalInfo = getScoreEvaluation(result.accuracy);

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
    pyTable = '1.2px';
    pyHeader = '2px';
    fontSizeMain = '8px';
    fontSizeSub = '7.5px';
    fontSizeHeader = '8px';
    pHeader = 'py-3 px-5';
    pContent = 'py-3 px-5';
    mbStats = 'mb-2';
    mbSpecs = 'mb-2';
    mbTableTitle = 'mb-1.5 pb-0.5';
    mtVisualMap = 'mt-2 mb-1.5';
    pyVisualMap = 'p-1.5';
    gapClass = 'gap-2';
    gridClass = 'grid-cols-5';
    cardPadding = 'p-1.5';
    compCardPadding = 'p-2';
  } else if (totalQs > 100) {
    colCount = 4;
    pyTable = '1.0px';
    pyHeader = '1.5px';
    fontSizeMain = '8.2px';
    fontSizeSub = '7px';
    fontSizeHeader = '8px';
    pHeader = 'py-2 px-4';
    pContent = 'py-2 px-4';
    mbStats = 'mb-1.5';
    mbSpecs = 'mb-1.5';
    mbTableTitle = 'mb-1 pb-0.5';
    mtVisualMap = 'mt-1.5 mb-1';
    pyVisualMap = 'p-1.5';
    gapClass = 'gap-2.5';
    gridClass = 'grid-cols-4';
    cardPadding = 'p-1.5';
    compCardPadding = 'p-2';
  } else if (totalQs > 50) {
    colCount = 4;
    pyTable = '1.0px';
    pyHeader = '1.5px';
    fontSizeMain = '8.2px';
    fontSizeSub = '7px';
    fontSizeHeader = '8px';
    pHeader = 'py-2 px-4';
    pContent = 'py-2 px-4';
    mbStats = 'mb-1.5';
    mbSpecs = 'mb-1.5';
    mbTableTitle = 'mb-1 pb-0.5';
    mtVisualMap = 'mt-1.5 mb-1';
    pyVisualMap = 'p-1.5';
    gapClass = 'gap-2.5';
    gridClass = 'grid-cols-4';
    cardPadding = 'p-1.5';
    compCardPadding = 'p-1.5';
  }

  // Determine items per column
  const itemsPerCol = Math.ceil(details.length / colCount);
  const columns = Array.from({ length: colCount }, (_, i) => 
    details.slice(i * itemsPerCol, (i + 1) * itemsPerCol)
  );

  if (totalQs > 100) {
    const cohort1 = details.slice(0, 100);
    const cohort2 = details.slice(100);

    const colCount1 = 4;
    const itemsPerCol1 = Math.ceil(cohort1.length / colCount1);
    const columns1 = Array.from({ length: colCount1 }, (_, i) => 
      cohort1.slice(i * itemsPerCol1, (i + 1) * itemsPerCol1)
    );

    const colCount2 = 4;
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
            height: '276mm',
            maxHeight: '276mm',
            overflow: 'hidden',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#ffffff',
            borderBottom: '8px solid #4f46e5',
            padding: '10px'
          }}
          className="bg-white border-b-8 border-indigo-600 Page1"
        >
          {/* Header - Academic Elegance */}
          <div className="bg-[#0f172a] flex flex-col gap-3 shrink-0 rounded-t-sm" style={{ backgroundColor: '#0f172a', paddingTop: '36px', paddingBottom: '36px', paddingLeft: '20px', paddingRight: '20px' }}>
             {/* Title row */}
             <div className="w-full flex justify-between items-center gap-4">
                <div className="flex-1 min-w-0">
                   <div 
                     className={`text-white font-black tracking-wider display-font break-words ${
                       (sessionTitle || "ASSESSMENT REPORT").length > 50 ? 'text-[12px] leading-tight' : (sessionTitle || "ASSESSMENT REPORT").length > 30 ? 'text-sm sm:text-base leading-snug' : 'text-base sm:text-lg md:text-xl'
                     }`} 
                     style={{ color: '#ffffff' }}
                   >
                      {sessionTitle || "ASSESSMENT REPORT"}
                   </div>
                </div>
                <div className="text-right shrink-0">
                   <div className={`display-font text-xs sm:text-sm font-black tracking-widest px-5 py-2.5 rounded-md border-2 shadow-sm ${evalInfo.badgeBg}`} style={{ borderColor: evalInfo.badgeColorHex }}>
                     {evalInfo.badgeText}
                   </div>
                </div>
             </div>
             
             {/* Student details row (Below Title) */}
             <div className="flex items-center justify-between border-t border-slate-800/80 pt-3 gap-3">
                <div className="flex items-center gap-3 min-w-0">
                   <div className="bg-indigo-600 text-white px-3.5 py-1.5 font-black text-sm rounded-md display-font tracking-wide shrink-0" style={{ backgroundColor: '#4f46e5', color: '#ffffff' }}>
                      {formatClassAndNumber(result.student)}
                   </div>
                   <div className="flex flex-col justify-center min-w-0 leading-tight">
                      {result.student.furigana && (
                        <span className="text-[10px] text-slate-300 font-bold tracking-wider truncate mb-0.5" style={{ color: '#cbd5e1' }}>
                           {result.student.furigana}
                        </span>
                      )}
                      <h2 className="text-xl md:text-2xl font-black text-white mb-0 tracking-tight display-font truncate animate-fade-in" style={{ color: '#ffffff' }}>
                         {result.student.name}
                      </h2>
                   </div>
                </div>
                <div className="text-indigo-400 font-extrabold text-[10.5px] tracking-widest uppercase shrink-0" style={{ color: '#818cf8' }}>
                   表面 (1〜100問)
                </div>
             </div>
          </div>

          <div className="flex-1 flex flex-col justify-between pt-4 bg-white" style={{ backgroundColor: '#ffffff' }}>
            {/* Statistics Cards */}
            <div className="grid grid-cols-4 gap-3.5 mb-3.5" style={{ backgroundColor: '#ffffff' }}>
               {[
                 { label: '総合得点', val: `${result.score} / ${result.totalPoints}`, sub: 'SCORE', color: 'text-slate-900' },
                 { label: '正答率', val: `${result.accuracy.toFixed(1)}%`, sub: 'ACCURACY', color: 'text-indigo-600' },
                 { label: '正解問題数', val: `${result.details.filter(d => d.isCorrect).length}`, sub: `OF ${result.details.length} ITEMS`, color: 'text-slate-900' },
                 { label: '平均正答率', val: `${(result.details.reduce((acc, d) => acc + (d.overallAccuracy || 0), 0) / result.details.length).toFixed(1)}%`, sub: 'AVERAGE', color: 'text-slate-400' }
               ].map((stat, i) => (
                 <div key={i} className="py-2.5 px-3 border-l-4 border-indigo-600 bg-slate-50/80 rounded-r shadow-xs text-xs flex flex-col justify-between" style={{ backgroundColor: '#f8fafc' }}>
                    <div className="flex items-baseline justify-between gap-1 w-full overflow-hidden mb-1.5">
                       <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tight truncate shrink-0" style={{ color: '#475569' }}>{stat.label}</span>
                       <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider truncate" style={{ color: '#94a3b8' }}>{stat.sub}</span>
                    </div>
                    <p className={`display-font font-black text-sm sm:text-base md:text-lg leading-snug ${stat.color}`}>{stat.val}</p>
                 </div>
               ))}
            </div>

            {/* Competency Balanced Scorecard */}
            {activeCompetencies.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mb-3.5" style={{ backgroundColor: '#ffffff' }}>
                 {activeCompetencies.map((key) => {
                   const comp = result.competencyResults[key];
                   return (
                     <div key={key} className="p-1.5 border border-slate-100 rounded-lg relative" style={{ backgroundColor: competencyBg[key] }}>
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
              <div className="flex items-center space-x-3 border-b border-slate-200 mb-2 pb-1">
                <span className="display-font font-semibold text-[9px] uppercase text-slate-400 tracking-widest" style={{ color: '#94a3b8' }}>Detailed Scoring Matrix (1〜100問)</span>
                <div className="flex-1 h-px bg-slate-100" style={{ backgroundColor: '#f1f5f9' }}></div>
              </div>
              <div className="grid grid-cols-4 gap-4" style={{ backgroundColor: '#ffffff' }}>
                {columns1.map((colItems, idx) => (
                   <div key={idx} className="" style={{ backgroundColor: '#ffffff' }}>
                     <table className="w-full text-left table-fixed border-collapse">
                       <thead>
                         <TableHeader pyHeader="3px" fontSizeHeader="8.5px" isCompact={true} />
                       </thead>
                       <tbody style={{ backgroundColor: '#ffffff' }}>
                         {colItems.map((d) => (
                           <TableRow 
                             key={d.questionNumber} 
                             d={d} 
                             pyTable="1.5px" 
                             fontSizeMain="9px" 
                             fontSizeSub="8px" 
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
            height: '276mm',
            maxHeight: '276mm',
            overflow: 'hidden',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#ffffff',
            borderBottom: '8px solid #4f46e5',
            padding: '10px'
          }}
          className="bg-white border-b-8 border-indigo-600 Page2 page-break-before"
        >
          {/* Header - Academic Elegance */}
          <div className="bg-[#0f172a] flex flex-col gap-3 shrink-0 rounded-t-sm" style={{ backgroundColor: '#0f172a', paddingTop: '36px', paddingBottom: '36px', paddingLeft: '20px', paddingRight: '20px' }}>
             {/* Title row */}
             <div className="w-full flex justify-between items-center gap-4">
                <div className="flex-1 min-w-0">
                   <div 
                     className={`text-white font-black tracking-wider display-font break-words ${
                       (sessionTitle || "ASSESSMENT REPORT").length > 50 ? 'text-[12px] leading-tight' : (sessionTitle || "ASSESSMENT REPORT").length > 30 ? 'text-sm sm:text-base leading-snug' : 'text-base sm:text-lg md:text-xl'
                     }`} 
                     style={{ color: '#ffffff' }}
                   >
                      {sessionTitle || "ASSESSMENT REPORT"}
                   </div>
                </div>
                <div className="text-right shrink-0">
                   <div className={`display-font text-xs sm:text-sm font-black tracking-widest px-5 py-2.5 rounded-md border-2 shadow-sm ${evalInfo.badgeBg}`} style={{ borderColor: evalInfo.badgeColorHex }}>
                     {evalInfo.badgeText}
                   </div>
                </div>
             </div>
             
             {/* Student details row */}
             <div className="flex items-center justify-between border-t border-slate-800/80 pt-3 gap-3">
                <div className="flex items-center gap-3 min-w-0">
                   <div className="bg-indigo-600 text-white px-3.5 py-1.5 font-black text-sm rounded-md display-font tracking-wide shrink-0" style={{ backgroundColor: '#4f46e5', color: '#ffffff' }}>
                      {formatClassAndNumber(result.student)}
                   </div>
                   <div className="flex flex-col justify-center min-w-0 leading-tight">
                      {result.student.furigana && (
                        <span className="text-[10px] text-slate-300 font-bold tracking-wider truncate mb-0.5" style={{ color: '#cbd5e1' }}>
                           {result.student.furigana}
                        </span>
                      )}
                      <h2 className="text-xl md:text-2xl font-black text-white mb-0 tracking-tight display-font truncate animate-fade-in" style={{ color: '#ffffff' }}>
                         {result.student.name}
                      </h2>
                   </div>
                </div>
                <div className="text-indigo-400 font-extrabold text-[10.5px] tracking-widest uppercase shrink-0" style={{ color: '#818cf8' }}>
                   裏面 (101問以降)
                </div>
             </div>
          </div>

          <div className="flex-1 flex flex-col justify-between pt-4 bg-white" style={{ backgroundColor: '#ffffff' }}>
            
            {/* Detailed Score Table */}
            <div className="flex-1" style={{ backgroundColor: '#ffffff' }}>
              <div className="flex items-center space-x-3 border-b border-slate-200 mb-2 pb-1">
                <span className="display-font font-semibold text-[9px] uppercase text-slate-400 tracking-widest" style={{ color: '#94a3b8' }}>Detailed Scoring Matrix (101問〜)</span>
                <div className="flex-1 h-px bg-slate-100" style={{ backgroundColor: '#f1f5f9' }}></div>
              </div>
              <div className="grid grid-cols-4 gap-4" style={{ backgroundColor: '#ffffff' }}>
                {columns2.map((colItems, idx) => (
                   <div key={idx} className="" style={{ backgroundColor: '#ffffff' }}>
                     <table className="w-full text-left table-fixed border-collapse">
                       <thead>
                         <TableHeader pyHeader="3px" fontSizeHeader="8.5px" isCompact={true} />
                       </thead>
                       <tbody style={{ backgroundColor: '#ffffff' }}>
                         {colItems.map((d) => (
                           <TableRow 
                             key={d.questionNumber} 
                             d={d} 
                             pyTable="1.5px" 
                             fontSizeMain="9px" 
                             fontSizeSub="8px" 
                           />
                         ))}
                       </tbody>
                     </table>
                   </div>
                ))}
              </div>
            </div>

            {/* Visual Score Map */}
            <div className="bg-slate-50 p-2.5 rounded border border-slate-100 mt-3 shrink-0" style={{ backgroundColor: '#f8fafc' }}>
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
        height: '276mm',
        maxHeight: '276mm',
        overflow: 'hidden',
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
      <div className="bg-[#0f172a] flex flex-col gap-3 shrink-0 avoid-break" style={{ backgroundColor: '#0f172a', paddingTop: '36px', paddingBottom: '36px', paddingLeft: '20px', paddingRight: '20px' }}>
         {/* Title row */}
         <div className="w-full flex justify-between items-center gap-4">
            <div className="flex-1 min-w-0">
               <div 
                 className={`text-white font-black tracking-wider display-font break-words ${
                   (sessionTitle || "ASSESSMENT REPORT").length > 50 ? 'text-[12px] leading-tight' : (sessionTitle || "ASSESSMENT REPORT").length > 30 ? 'text-sm sm:text-base leading-snug' : 'text-base sm:text-lg md:text-xl'
                 }`} 
                 style={{ color: '#ffffff' }}
               >
                  {sessionTitle || "ASSESSMENT REPORT"}
               </div>
            </div>
            <div className="text-right shrink-0">
               <div className={`display-font text-xs sm:text-sm font-black tracking-widest px-5 py-2.5 rounded-md border-2 shadow-sm ${evalInfo.badgeBg}`} style={{ borderColor: evalInfo.badgeColorHex }}>
                 {evalInfo.badgeText}
               </div>
            </div>
         </div>
         
         {/* Student details row */}
         <div className="flex items-center justify-between border-t border-slate-800/80 pt-3 gap-3">
            <div className="flex items-center gap-3 min-w-0">
               <div className="bg-indigo-600 text-white px-3.5 py-1.5 font-black text-sm rounded-md display-font tracking-wide shrink-0" style={{ backgroundColor: '#4f46e5', color: '#ffffff' }}>
                  {formatClassAndNumber(result.student)}
               </div>
               <div className="flex flex-col justify-center min-w-0 leading-tight">
                  {result.student.furigana && (
                    <span className="text-[10px] text-slate-300 font-bold tracking-wider truncate mb-0.5" style={{ color: '#cbd5e1' }}>
                       {result.student.furigana}
                    </span>
                  )}
                  <h2 className="text-xl md:text-2xl font-black text-white mb-0 tracking-tight display-font truncate animate-fade-in" style={{ color: '#ffffff' }}>
                     {result.student.name}
                  </h2>
               </div>
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
             <div key={i} className={`${cardPadding} border-l-4 border-slate-200 bg-slate-50 rounded-r shadow-xs flex flex-col justify-between`} style={{ backgroundColor: '#f8fafc' }}>
                <div className="flex items-baseline justify-between gap-1 w-full overflow-hidden mb-1">
                   <span className="text-[9px] font-bold text-slate-600 uppercase tracking-tight truncate shrink-0" style={{ color: '#475569' }}>{stat.label}</span>
                   <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-wider truncate" style={{ color: '#94a3b8' }}>{stat.sub}</span>
                </div>
                <p className={`display-font font-bold text-base leading-none ${stat.color}`}>{stat.val}</p>
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
