import React, { useMemo } from 'react';
import { ScoringResult } from '../types';
import { formatClassAndNumber, getScoreEvaluation } from './ResultReport';

export const getFormattedStudentNumber = (student: { id: string; number?: string }) => {
  if (student.number !== undefined && student.number !== null && student.number !== '') {
    const digitsOnly = String(student.number).replace(/\D/g, '');
    if (digitsOnly) {
      const parsed = parseInt(digitsOnly, 10);
      if (!isNaN(parsed)) {
        return String(parsed);
      }
    }
    return String(student.number);
  }
  // fallback parsing ID (e.g. 1A01 -> 1)
  const match = student.id.match(/\d+$/);
  if (match) {
    const rawNum = match[0];
    const parsed = parseInt(rawNum, 10);
    return isNaN(parsed) ? rawNum : String(parsed);
  }
  return student.id;
};

interface StandingsReportProps {
  results: ScoringResult[];
  sessionTitle?: string;
  filterClass?: string | null;
  sortBy?: 'score' | 'id';
  rankMap: Map<string, number>;
}

export const StandingsReport: React.FC<StandingsReportProps> = ({
  results,
  sessionTitle,
  filterClass,
  sortBy,
  rankMap,
}) => {
  // Sort and filter results
  const filteredResults = useMemo(() => {
    let data = filterClass ? results.filter(r => r.student.class === filterClass) : results;
    if (sortBy === 'score') {
      return data.sort((a, b) => (rankMap.get(a.student.id) || 0) - (rankMap.get(b.student.id) || 0));
    }
    return data.sort((a, b) => a.student.id.localeCompare(b.student.id));
  }, [results, filterClass, sortBy, rankMap]);

  // Statistics calculation
  const stats = useMemo(() => {
    if (filteredResults.length === 0) return { avg: 0, max: 0, min: 0, total: 0 };
    const scores = filteredResults.map(r => r.score);
    const sum = scores.reduce((a, b) => a + b, 0);
    return {
      avg: sum / filteredResults.length,
      max: Math.max(...scores),
      min: Math.min(...scores),
      total: filteredResults.length,
    };
  }, [filteredResults]);

  // Class performance
  const classPerformance = useMemo(() => {
    const classMap: Record<string, { total: number; count: number; max: number; min: number }> = {};
    results.forEach(r => {
      const cls = r.student.class || '未設定';
      if (!classMap[cls]) {
        classMap[cls] = { total: 0, count: 0, max: r.score, min: r.score };
      }
      classMap[cls].total += r.score;
      classMap[cls].count += 1;
      classMap[cls].max = Math.max(classMap[cls].max, r.score);
      classMap[cls].min = Math.min(classMap[cls].min, r.score);
    });
    return Object.entries(classMap).map(([name, val]) => ({
      name,
      avg: val.total / val.count,
      max: val.max,
      min: val.min,
      count: val.count,
    })).sort((a, b) => a.name.localeCompare(b.name));
  }, [results]);

  // Grade distributions
  const distributions = useMemo(() => {
    const distributionMap: Record<string, { count: number; range: string; color: string; rankText: string }> = {
      'PERFECT': { count: 0, range: '100%', color: '#4f46e5', rankText: '秀 (S)' },
      'EXCELLENT': { count: 0, range: '90-99%', color: '#10b981', rankText: '優 (A)' },
      'VERY GOOD': { count: 0, range: '80-89%', color: '#0284c7', rankText: '良 (B)' },
      'GOOD': { count: 0, range: '70-79%', color: '#0d9488', rankText: '良好 (C+)' },
      'PASS': { count: 0, range: '60-69%', color: '#6366f1', rankText: '標準 (C)' },
      'NEAR PASS': { count: 0, range: '45-59%', color: '#f59e0b', rankText: '要努力 (D)' },
      'KEEP TRYING': { count: 0, range: '45%未満', color: '#ef4444', rankText: '要努力 (E)' },
    };

    filteredResults.forEach(r => {
      const accuracy = r.accuracy;
      let gradeKey = 'KEEP TRYING';
      if (accuracy === 100) gradeKey = 'PERFECT';
      else if (accuracy >= 90) gradeKey = 'EXCELLENT';
      else if (accuracy >= 80) gradeKey = 'VERY GOOD';
      else if (accuracy >= 70) gradeKey = 'GOOD';
      else if (accuracy >= 60) gradeKey = 'PASS';
      else if (accuracy >= 45) gradeKey = 'NEAR PASS';

      if (distributionMap[gradeKey]) {
        distributionMap[gradeKey].count += 1;
      }
    });

    return Object.entries(distributionMap).map(([badgeText, details]) => ({
      badgeText,
      ...details,
      percentage: filteredResults.length > 0 ? (details.count / filteredResults.length) * 100 : 0,
    }));
  }, [filteredResults]);

  // Decide if we should render everything on a single page, or multiple pages
  const isOnePageLayout = useMemo(() => {
    if (sortBy === 'id') return false; // 番号順は必ずクラス別マルチページ
    return filteredResults.length <= 15;
  }, [sortBy, filteredResults]);

  // Split results for multi-page lists
  const resultPages = useMemo(() => {
    if (isOnePageLayout) return [filteredResults];
    const pages: ScoringResult[][] = [];
    
    if (sortBy === 'score') {
      // 成績順レイアウト：1ページあたり40人
      const itemsPerPageScore = 40;
      for (let i = 0; i < filteredResults.length; i += itemsPerPageScore) {
        pages.push(filteredResults.slice(i, i + itemsPerPageScore));
      }
    } else {
      // 番号順（sortBy === 'id'）：クラスごとにページを切り替える
      const classMap: Record<string, ScoringResult[]> = {};
      const classes: string[] = [];
      
      filteredResults.forEach(r => {
        const cls = r.student.class || '未設定';
        if (!classMap[cls]) {
          classMap[cls] = [];
          classes.push(cls);
        }
        classMap[cls].push(r);
      });
      
      classes.sort((a, b) => a.localeCompare(b));
      
      classes.forEach(cls => {
        const clsResults = classMap[cls];
        // 1クラス最大40人として、万が一40人を超える場合はクラス内でも分割
        for (let i = 0; i < clsResults.length; i += 40) {
          pages.push(clsResults.slice(i, i + 40));
        }
      });
    }
    return pages;
  }, [filteredResults, isOnePageLayout, sortBy]);

  return (
    <div className="bg-white text-slate-800 p-0" style={{ width: '100%', boxSizing: 'border-box', WebkitPrintColorAdjust: 'exact' }}>
      <style>{`
        @media print {
          @page { size: A4; margin: 0; }
          body { -webkit-print-color-adjust: exact; background: white !important; }
          .page-break-before { page-break-before: always; }
          .avoid-break { page-break-inside: avoid; }
        }
      `}</style>

      {/* COMPACT SINGLE PAGE LAYOUT */}
      {isOnePageLayout && (
        <div style={{ height: '296mm', maxHeight: '296mm', overflow: 'hidden', padding: '15mm', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <div className="border-b-4 border-indigo-600 pb-3 flex justify-between items-end mb-4 shrink-0">
            <div>
              <span className="text-[10px] tracking-widest uppercase font-black text-indigo-600">MARKGRADE PERFORMANCE REPORT</span>
              <h1 className="text-xl font-black text-slate-900 tracking-tight display-font mt-0.5">{sessionTitle || "全体成績マトリクス"}</h1>
            </div>
            <div className="text-right">
              <span className="text-[9px] text-slate-400 font-bold tracking-wider">CREATION DATE: {new Date().toLocaleDateString('ja-JP')}</span>
              <p className="text-xs font-bold text-indigo-600 mt-0.5">成績 & グレード総合一覧（1P完結型）</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4 shrink-0">
            {/* Stats Summary */}
            <div className="border border-slate-200/90 rounded-xl p-3.5 bg-slate-50/50">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">全体試験統計</h3>
              <div className="grid grid-cols-4 gap-2">
                <div className="bg-white border border-slate-100 p-2 rounded-lg text-center shadow-xs">
                  <p className="text-[9px] text-slate-400 font-bold">平均点</p>
                  <p className="text-sm font-black display-font text-indigo-600 mt-0.5">{stats.avg.toFixed(1)}</p>
                </div>
                <div className="bg-white border border-slate-100 p-2 rounded-lg text-center shadow-xs">
                  <p className="text-[9px] text-slate-400 font-bold">受験者</p>
                  <p className="text-sm font-black display-font text-slate-700 mt-0.5">{stats.total}名</p>
                </div>
                <div className="bg-white border border-slate-100 p-2 rounded-lg text-center shadow-xs">
                  <p className="text-[9px] text-slate-400 font-bold">最高点</p>
                  <p className="text-sm font-black display-font text-emerald-600 mt-0.5">{stats.max}</p>
                </div>
                <div className="bg-white border border-slate-100 p-2 rounded-lg text-center shadow-xs">
                  <p className="text-[9px] text-slate-400 font-bold">最低点</p>
                  <p className="text-sm font-black display-font text-rose-500 mt-0.5">{stats.min}</p>
                </div>
              </div>
            </div>

            {/* Class distribution */}
            <div className="border border-slate-200/90 rounded-xl p-3.5 bg-slate-50/50">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">クラス別平均点</h3>
              <div className="flex flex-wrap gap-2.5">
                {classPerformance.map(cls => (
                  <div key={cls.name} className="bg-white border border-slate-100 py-1.5 px-2.5 rounded-lg text-center shadow-xs shrink-0 flex-1 min-w-[70px]">
                    <p className="text-[9px] text-slate-500 font-extrabold truncate">{cls.name}</p>
                    <p className="text-xs font-black display-font text-indigo-600 mt-0.5">{cls.avg.toFixed(1)}点</p>
                    <p className="text-[8px] text-slate-400 font-medium">({cls.count}名)</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Standings List */}
          <div className="flex-1 overflow-hidden border border-slate-200 rounded-lg">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                  <th className="py-2.5 px-3 uppercase tracking-wider text-center" style={{ width: '10%' }}>順位</th>
                  <th className="py-2.5 px-3 font-bold uppercase tracking-wider" style={{ width: '15%' }}>クラス</th>
                  <th className="py-2.5 px-3 font-bold uppercase tracking-wider" style={{ width: '20%' }}>出席番号</th>
                  <th className="py-2.5 px-3 font-bold" style={{ width: '25%' }}>名前</th>
                  <th className="py-2.5 px-3 text-right font-bold uppercase tracking-wider" style={{ width: '15%' }}>得点 (率)</th>
                  <th className="py-2.5 px-3 text-center font-bold" style={{ width: '15%' }}>グレード</th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.map((r, i) => {
                  const evalInfo = getScoreEvaluation(r.accuracy);
                  const rank = rankMap.get(r.student.id) || (i + 1);
                  return (
                    <tr key={r.student.id} className="border-b border-slate-100 hover:bg-slate-50/40">
                      <td className="py-2 px-3 text-center font-bold display-font text-slate-700">{rank}</td>
                      <td className="py-2 px-3 text-slate-600 font-semibold">{r.student.class || "-"}</td>
                      <td className="py-2 px-3 font-mono text-slate-500">{getFormattedStudentNumber(r.student)}</td>
                      <td className="py-2 px-3 font-bold text-slate-800">{r.student.name}</td>
                      <td className="py-2 px-3 text-right font-bold text-slate-900 display-font">{r.score}点 <span className="text-[10px] text-slate-400 font-normal">({r.accuracy.toFixed(0)}%)</span></td>
                      <td className="py-2 px-3 text-center">
                        <span className={`text-[10px] font-black tracking-wider px-2 py-0.5 rounded-md border text-xs ${evalInfo.badgeBg}`} style={{ borderColor: evalInfo.badgeColorHex }}>
                          {evalInfo.badgeText}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-slate-450 flex justify-between shrink-0 text-[10px]">
            <span>MARKGRADE ACADEMIC ANALYSIS SYSTEM • OFF-LINE COMPLIANT REPORT</span>
            <span className="font-mono">{filteredResults.length} records parsed</span>
          </div>
        </div>
      )}

      {/* MULTILINE MULTIPAGE LAYOUT */}
      {!isOnePageLayout && (
        <>
          {/* PAGE 1: OVERVIEW STATISTICS & GRADE DISTRIBUTION */}
          <div style={{ height: '296mm', maxHeight: '296mm', overflow: 'hidden', padding: '15mm', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
            <div className="border-b-4 border-indigo-600 pb-4 flex justify-between items-end mb-6 shrink-0">
              <div>
                <span className="text-[10px] tracking-widest uppercase font-black text-indigo-600">MARKGRADE PERFORMANCE SUMMARY</span>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight display-font mt-0.5">{sessionTitle || "全体成績マトリクス"}</h1>
                <p className="text-slate-450 text-[11px] font-bold mt-1.5"><i className="fa-solid fa-chart-simple mr-1 text-indigo-500"></i> 試験総合レポート & グレード分布分析</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 font-bold tracking-wider">CREATION DATE: {new Date().toLocaleDateString('ja-JP')}</span>
                <p className="text-xs font-bold text-indigo-600 mt-1">1の1: サマリー実績統計シート</p>
              </div>
            </div>

            {/* Stats overview and classes statistics in two columns */}
            <div className="grid grid-cols-2 gap-5 mb-5 shrink-0">
              {/* Overall Statistics Card */}
              <div className="border border-slate-200/95 rounded-xl p-4.5 bg-slate-50/50">
                <h3 className="text-xs font-black text-slate-650 uppercase tracking-widest border-b border-slate-200 pb-1.5 mb-3">【1】学年試験基本統計</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white border border-slate-150 p-3 rounded-lg text-center shadow-xs">
                    <p className="text-[10px] text-slate-500 font-bold">学年平均点</p>
                    <p className="text-2xl font-black display-font text-indigo-600 mt-1">{stats.avg.toFixed(1)} <span className="text-xs font-normal text-slate-400">点</span></p>
                  </div>
                  <div className="bg-white border border-slate-150 p-3 rounded-lg text-center shadow-xs">
                    <p className="text-[10px] text-slate-500 font-bold">受験実人員</p>
                    <p className="text-2xl font-black display-font text-slate-700 mt-1">{stats.total} <span className="text-xs font-normal text-slate-400">名</span></p>
                  </div>
                  <div className="bg-white border border-slate-150 p-3 rounded-lg text-center shadow-xs">
                    <p className="text-[10px] text-slate-500 font-bold">最高点</p>
                    <p className="text-lg font-black display-font text-emerald-600 mt-1">{stats.max} 点</p>
                  </div>
                  <div className="bg-white border border-slate-150 p-3 rounded-lg text-center shadow-xs">
                    <p className="text-[10px] text-slate-500 font-bold">最低点</p>
                    <p className="text-lg font-black display-font text-rose-500 mt-1">{stats.min} 点</p>
                  </div>
                </div>
              </div>

              {/* Class by class breakdown */}
              <div className="border border-slate-200/95 rounded-xl p-4.5 bg-slate-50/50 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-black text-slate-650 uppercase tracking-widest border-b border-slate-200 pb-1.5 mb-3">【2】クラス別学力指数</h3>
                  <div className="space-y-1.5">
                    {classPerformance.map(cls => (
                      <div key={cls.name} className="bg-white border border-slate-150 py-1.5 px-3 rounded-lg shadow-xs flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0"></span>
                          <span className="text-xs font-bold text-slate-700">{cls.name} クラス</span>
                        </div>
                        <div className="flex space-x-3 text-right">
                          <span className="text-slate-400 text-[10px] font-semibold">{cls.count}名</span>
                          <span className="text-xs font-black text-indigo-600 display-font">平均 {cls.avg.toFixed(1)}点</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Grade breakdown full analysis */}
            <div className="flex-1 border border-slate-200 rounded-xl p-5 bg-slate-50/30 flex flex-col min-h-0">
              <h3 className="text-xs font-black text-slate-650 uppercase tracking-widest border-b border-slate-200 pb-1.5 mb-4 shrink-0">【3】学年到達度基準グレード分布 (Grade Distribution)</h3>
              <div className="flex-1 overflow-hidden flex flex-col justify-center space-y-3.5">
                {distributions.map(grade => (
                  <div key={grade.badgeText} className="flex items-center">
                    {/* Badge Column */}
                    <div className="w-28 shrink-0">
                      <span className="text-[9px] font-black tracking-widest px-2.5 py-1 rounded border display-font uppercase shrink-0" style={{ borderColor: grade.color, color: grade.color, backgroundColor: `${grade.color}08` }}>
                        {grade.badgeText}
                      </span>
                    </div>

                    {/* Target range description */}
                    <div className="w-20 shrink-0 text-left text-xs font-bold text-slate-400 tracking-tight">
                      {grade.rankText}
                    </div>

                    {/* Progress Bar Column */}
                    <div className="flex-1 h-3.5 bg-slate-100 border border-slate-200 rounded-full overflow-hidden flex mx-4 p-0.5">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${grade.percentage}%`, backgroundColor: grade.color }} />
                    </div>

                    {/* Numbers and percentage summary */}
                    <div className="w-24 shrink-0 text-right font-bold text-xs text-slate-700">
                      <span className="font-black display-font text-slate-900">{grade.count} 名</span>
                      <span className="text-slate-400 text-[10px] ml-1.5 font-normal">({grade.percentage.toFixed(1)}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 pt-3.5 border-t border-slate-100 text-slate-400 flex justify-between shrink-0 text-[10px] font-bold">
              <span>MARKGRADE REPORT ENGINE • ACADEMIC DIVISION DATA SHEET</span>
              <span className="font-mono">Page 1 of {1 + resultPages.length}</span>
            </div>
          </div>

          {/* PAGE 2+: DETAILED SCORE LIST ROWS, automatic pagination */}
          {resultPages.map((pageResults, pageIdx) => (
            <div key={pageIdx} className="page-break-before" style={{ height: '296mm', maxHeight: '296mm', overflow: 'hidden', padding: '10mm 15mm', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
              <div className="border-b border-slate-200 pb-3 flex justify-between items-end mb-2 shrink-0">
                <div>
                  <span className="text-[9px] tracking-widest uppercase font-bold text-slate-400">STUDENT STANDINGS SHEET</span>
                  <h2 className="text-lg font-black text-slate-800 tracking-tight mt-0.5">{sessionTitle || "全体成績マトリクス"}</h2>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-slate-400 font-bold tracking-wider font-mono">
                    {(() => {
                      const startIndex = filteredResults.indexOf(pageResults[0]) + 1;
                      const endIndex = filteredResults.indexOf(pageResults[pageResults.length - 1]) + 1;
                      return `RECORDS: ${startIndex} - ${endIndex} / ${filteredResults.length}`;
                    })()}
                  </span>
                  <p className="text-[11px] font-black text-indigo-600 mt-0.5">
                    {sortBy === 'id' 
                      ? `${pageResults[0]?.student.class || '未設定'}クラス 出席番号順一覧`
                      : `2の${pageIdx + 1}: 個別レコード順データ一覧`}
                  </p>
                </div>
              </div>

              {/* Student detailed table */}
              <div className="flex-1 overflow-hidden border border-slate-200 rounded-lg">
                <table className="w-full text-xs text-left border-collapse" style={{ lineHeight: '1.2' }}>
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                      <th className="py-1 px-2.5 text-center uppercase tracking-wider font-bold" style={{ width: '8%', fontSize: '10px' }}>順位</th>
                      <th className="py-1 px-2.5 tracking-wider font-bold" style={{ width: '12%', fontSize: '10px' }}>クラス</th>
                      <th className="py-1 px-2.5 tracking-wider font-bold" style={{ width: '20%', fontSize: '10px' }}>出席番号</th>
                      <th className="py-1 px-2.5 font-bold" style={{ width: '25%', fontSize: '10px' }}>名前</th>
                      <th className="py-1 px-2.5 text-right tracking-wider font-bold" style={{ width: '18%', fontSize: '10px' }}>得点 (正答率)</th>
                      <th className="py-1 px-2.5 text-center font-bold" style={{ width: '17%', fontSize: '10px' }}>グレード</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageResults.map((r) => {
                      const evalInfo = getScoreEvaluation(r.accuracy);
                      const rank = rankMap.get(r.student.id) || (filteredResults.indexOf(r) + 1);
                      return (
                        <tr key={r.student.id} className="border-b border-slate-100 hover:bg-slate-50/10">
                          <td className="py-[1px] px-2.5 text-center font-extrabold text-slate-700 display-font" style={{ fontSize: '10.5px', lineHeight: '1.2' }}>{rank}</td>
                          <td className="py-[1px] px-2.5 font-bold text-slate-500" style={{ fontSize: '10.5px', lineHeight: '1.2' }}>{r.student.class || "-"}</td>
                          <td className="py-[1px] px-2.5 font-mono text-slate-450 font-medium" style={{ fontSize: '10.5px', lineHeight: '1.2' }}>{getFormattedStudentNumber(r.student)}</td>
                          <td className="py-[1px] px-2.5 font-bold text-slate-800" style={{ fontSize: '10.5px', lineHeight: '1.2' }}>{r.student.name}</td>
                          <td className="py-[1px] px-2.5 text-right font-bold text-slate-900 display-font" style={{ fontSize: '10.5px', lineHeight: '1.2' }}>{r.score} 点 <span className="text-[9px] text-slate-400 font-normal">({r.accuracy.toFixed(0)}%)</span></td>
                          <td className="py-[1px] px-2.5 text-center" style={{ lineHeight: '1.2' }}>
                            <span className={`text-[8px] font-black tracking-wider px-2 py-0.2 rounded border ${evalInfo.badgeBg}`} style={{ borderColor: evalInfo.badgeColorHex, lineHeight: '1.1', display: 'inline-block' }}>
                              {evalInfo.badgeText}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-150 text-slate-400 flex justify-between shrink-0 text-[10px] font-semibold">
                <span>MARKGRADE ACADEMIC ALIGNMENT MATRIX</span>
                <span className="font-mono">Page {2 + pageIdx} of {1 + resultPages.length}</span>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
};
