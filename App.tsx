import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Student, Question, StudentAnswer, ScoringResult, ArchiveData, CompetencyType, COMPETENCY_LABELS, RangeSlot } from './types';
import { SetupForm } from './components/SetupForm';
import { ResultReport } from './components/ResultReport';

const APP_VERSION = "v2.0.0-ELEGANT-EDITION";

// Elegant premium academic MarkGrade SVG Logo with gorgeous gradients
const MarkGradeLogo: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="markGradeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0a2540" />
        <stop offset="60%" stopColor="#0284c7" />
        <stop offset="100%" stopColor="#00ffd2" />
      </linearGradient>
      <linearGradient id="checkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="100%" stopColor="#e2e8f0" />
      </linearGradient>
      <filter id="coolShadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#1d4ed8" floodOpacity="0.18" />
      </filter>
    </defs>
    {/* Elegant rounded hexagon shield/base */}
    <path 
      d="M50 8 L85 28 L85 72 L50 92 L15 72 L15 28 Z" 
      fill="url(#markGradeGrad)" 
      filter="url(#coolShadow)"
    />
    {/* Inner sleek overlay to add deep multi-layer aesthetic */}
    <path 
      d="M50 15 L80 32 L80 68 L50 85 L20 68 L20 32 Z" 
      fill="#000000" 
      opacity="0.08" 
    />
    {/* Beautiful shadow representation of checking mark for extra contrast */}
    <path 
      d="M32 49 L46 62 L70 33" 
      fill="none" 
      stroke="#1e1b4b" 
      strokeWidth="9" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      opacity="0.15"
      transform="translate(0, 3)"
    />
    {/* Sparkling pure-white checkmark */}
    <path 
      d="M32 49 L46 62 L70 33" 
      fill="none" 
      stroke="url(#checkGradient)" 
      strokeWidth="8" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
    {/* Dynamic star dot representing outstanding scholastic grade */}
    <path 
      d="M74 19 L76 25 L82 27 L76 29 L74 35 L72 29 L66 27 L72 25 Z" 
      fill="#fbbf24" 
    />
  </svg>
);

// Helpful Educational Guide (Replacing the F1 Pit Radio)
const GraderGuide: React.FC<{ step: number, onDismiss: (forever: boolean) => void }> = ({ step, onDismiss }) => {
  const [showForever, setShowForever] = useState(false);
  const messages: Record<number, string> = {
    1: "登録画面へようこそ。まずは「生徒名簿テンプレート」をダウンロードし、データを記載したCSVをドラッグして流し込みましょう。自動でセッションの下書きが保存されます。",
    2: "採点基準の設定時間です。正解記号、配点、評価する観点を設問ごとに設定できます。左側の「大問 / 観点一括適用」を使えば、複数の設問に数秒で設定を割付できます。",
    3: "回答データのマッピングです。登録生徒のデータが紐づいた「解答記入用シート」を一度保存し、採点した結果を載せてからシステムにアップロードしてください。",
    4: "個人分析レポートへようこそ。生徒一人ひとりの詳細なミス、学習観点バランス、グループ別スコアを精緻に確認できます。左右のボタンやサイドバーで生徒を瞬時に切り替えられます。",
    5: "成績統計ダッシュボードに到着しました。クラス・科目全体の平均、クラス間での対比を視覚的なバッジで追跡できます。全員一括や選択者のみでのPDF個票書き出しも可能です。"
  };

  return (
    <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-2xl px-4 animate-[slideUp_0.5s_ease-out]">
      <div className="bg-white border-l-4 border-indigo-600 shadow-[0_15px_40px_rgba(79,70,229,0.15)] p-5 rounded-r-xl border border-slate-200">
        <div className="flex items-start space-x-4">
          <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center shrink-0 border border-indigo-100">
             <i className="fa-solid fa-graduation-cap text-indigo-600 text-lg"></i>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1.5">
               <span className="display-font text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Grader Assistant</span>
               <span className="text-[9px] font-semibold text-slate-400">ステップ {step} ガイド</span>
            </div>
            <p className="text-slate-600 text-xs font-medium leading-relaxed">
              {messages[step] || "進捗に合わせてアシストします。お疲れ様です！"}
            </p>
            <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-100">
               <label className="flex items-center space-x-2 cursor-pointer group">
                  <input type="checkbox" checked={showForever} onChange={(e) => setShowForever(e.target.checked)} className="w-3.5 h-3.5 accent-indigo-600 rounded" />
                  <span className="text-[10px] text-slate-400 group-hover:text-slate-600 transition-colors">今後はこの案内を表示しない</span>
               </label>
               <button 
                 onClick={() => onDismiss(showForever)}
                 className="bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-indigo-600 px-3.5 py-1.5 rounded-lg text-[10px] font-bold border border-slate-200 transition-all"
               >
                 了解しました
               </button>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes slideUp { from { transform: translate(-50%, 100%); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }
      `}</style>
    </div>
  );
};

const App: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [results, setResults] = useState<ScoringResult[]>([]);
  const [rawAnswers, setRawAnswers] = useState<StudentAnswer[]>([]);
  const [lap, setLap] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [archives, setArchives] = useState<ArchiveData[]>([]);
  const [selectedResultIndex, setSelectedResultIndex] = useState<number>(0);
  const [sessionTitle, setSessionTitle] = useState<string>("");
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'score' | 'id'>('score');
  const [filterClass, setFilterClass] = useState<string | null>(null);
  const [sbClassFilter, setSbClassFilter] = useState<string>("");
  const [sbSortBy, setSbSortBy] = useState<'id' | 'score'>('id');
  const [showExportModal, setShowExportModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportMode, setExportMode] = useState<'all' | 'single' | 'selected' | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialHiddenForever, setTutorialHiddenForever] = useState(false);
  const [showSetupEntry, setShowSetupEntry] = useState(false);
  const [showArchiveView, setShowArchiveView] = useState(false);
  
  // Persistence for range slots (Grand Question settings)
  const [rangeSlots, setRangeSlots] = useState<RangeSlot[]>([]);

  const refreshArchives = useCallback(() => {
    try {
      const savedArchives = localStorage.getItem('grader_archives');
      if (savedArchives) setArchives(JSON.parse(savedArchives));
      const hidden = localStorage.getItem('grader_tutorial_hidden') === 'true';
      setTutorialHiddenForever(hidden);
    } catch (e) { console.error("Archive load failed", e); }
  }, []);

  useEffect(() => {
    refreshArchives();
    const draft = localStorage.getItem('grader_current_draft');
    if (draft) {
      try {
        const data = JSON.parse(draft);
        if (data.students) setStudents(data.students);
        if (data.questions) setQuestions(data.questions);
        if (data.sessionTitle) setSessionTitle(data.sessionTitle);
        if (data.results) setResults(data.results);
        if (data.rawAnswers) setRawAnswers(data.rawAnswers);
        if (data.currentSessionId) setCurrentSessionId(data.currentSessionId);
        if (data.rangeSlots) setRangeSlots(data.rangeSlots);
      } catch (e) { console.error("Draft load failed", e); }
    }

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, [refreshArchives]);

  const startNewSession = () => {
    if (students.length > 0 || questions.length > 0) {
      if (!confirm("現在のクラス登録・採点基準等のデータをリセットして、新しい採点セッションを開始しますか？")) return;
    }
    
    const newId = `session_${Date.now()}`;
    const dateStr = new Date().toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
    const defaultTitle = `テスト集計 - ${dateStr}`;
    
    setStudents([]);
    setQuestions([]);
    setResults([]);
    setRawAnswers([]);
    setSessionTitle(defaultTitle);
    setCurrentSessionId(newId);
    setSelectedResultIndex(0);
    setRangeSlots([]);
    
    const newArchive: ArchiveData = {
      id: newId,
      timestamp: new Date().toLocaleString(),
      name: defaultTitle,
      results: [],
      questions: [],
      students: [],
      rawAnswers: [],
      isArchived: false,
      rangeSlots: []
    };
    
    try {
      const savedArchives = localStorage.getItem('grader_archives');
      let archiveList: ArchiveData[] = savedArchives ? JSON.parse(savedArchives) : [];
      archiveList = [newArchive, ...archiveList];
      localStorage.setItem('grader_archives', JSON.stringify(archiveList));
      setArchives(archiveList);
    } catch (e) {
      console.error("Auto save new session failed", e);
    }
    
    setShowSetupEntry(true);
    setLap(1);
    setShowArchiveView(false);
  };

  const resetAllState = () => {
    setStudents([]);
    setQuestions([]);
    setResults([]);
    setRawAnswers([]);
    setSessionTitle("");
    setCurrentSessionId(null);
    setRangeSlots([]);
    setShowSetupEntry(false);
    localStorage.removeItem('grader_current_draft');
    setLap(1);
  };

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setDeferredPrompt(null);
  };

  useEffect(() => {
    if (!tutorialHiddenForever) setShowTutorial(true);
  }, [lap, tutorialHiddenForever]);

  const handleDismissTutorial = (forever: boolean) => {
    setShowTutorial(false);
    if (forever) {
      setTutorialHiddenForever(true);
      localStorage.setItem('grader_tutorial_hidden', 'true');
    }
  };

  useEffect(() => {
    const draft = { students, questions, sessionTitle, lap, results, rawAnswers, currentSessionId, rangeSlots };
    try {
      localStorage.setItem('grader_current_draft', JSON.stringify(draft));
    } catch (e) { localStorage.removeItem('grader_current_draft'); }
  }, [students, questions, sessionTitle, lap, results, rawAnswers, currentSessionId, rangeSlots]);

  // Auto-sync working draft states back to its entry in archives list
  useEffect(() => {
    if (!currentSessionId) return;
    try {
      const savedArchives = localStorage.getItem('grader_archives');
      if (savedArchives) {
        let archiveList: ArchiveData[] = JSON.parse(savedArchives);
        const index = archiveList.findIndex(a => a.id === currentSessionId);
        if (index > -1) {
          const current = archiveList[index];
          if (
            current.name !== sessionTitle ||
            JSON.stringify(current.students) !== JSON.stringify(students) ||
            JSON.stringify(current.questions) !== JSON.stringify(questions) ||
            JSON.stringify(current.rawAnswers) !== JSON.stringify(rawAnswers) ||
            JSON.stringify(current.results) !== JSON.stringify(results) ||
            JSON.stringify(current.rangeSlots) !== JSON.stringify(rangeSlots)
          ) {
            archiveList[index] = {
              ...current,
              name: sessionTitle,
              students,
              questions,
              rawAnswers,
              results,
              rangeSlots
            };
            localStorage.setItem('grader_archives', JSON.stringify(archiveList));
            setArchives(archiveList);
          }
        }
      }
    } catch (e) {
      console.error("Auto-sync to archives failed", e);
    }
  }, [currentSessionId, sessionTitle, students, questions, rawAnswers, results, rangeSlots]);

  const sortedClassNames = useMemo(() => {
    const classes = Array.from(new Set(students.map(s => s.class)));
    return classes.sort();
  }, [students]);

  const rankMap = useMemo(() => {
    const sortedByScore = [...results].sort((a, b) => b.score - a.score || a.student.id.localeCompare(b.student.id));
    const map = new Map<string, number>();
    sortedByScore.forEach((r, idx) => map.set(r.student.id, idx + 1));
    return map;
  }, [results]);

  const sidebarList = useMemo(() => {
    let filtered = [...results];
    if (sbClassFilter) filtered = filtered.filter(r => r.student.class === sbClassFilter);
    return filtered.sort((a, b) => {
      if (sbSortBy === 'score') {
        const rankA = rankMap.get(a.student.id) || 999;
        const rankB = rankMap.get(b.student.id) || 999;
        return rankA - rankB;
      }
      return a.student.id.localeCompare(b.student.id);
    });
  }, [results, sbClassFilter, sbSortBy, rankMap]);

  const navigateDriver = useCallback((dir: number) => {
    if (sidebarList.length === 0) return;
    let nextIdx = selectedResultIndex + dir;
    if (nextIdx < 0) nextIdx = sidebarList.length - 1;
    if (nextIdx >= sidebarList.length) nextIdx = 0;
    setSelectedResultIndex(nextIdx);
  }, [sidebarList, selectedResultIndex]);

  const triggerLapChange = (nextLap: 1 | 2 | 3 | 4 | 5, shouldExitSetup: boolean = false) => {
    if (lap === 2 && nextLap === 3) saveToArchive(results, rawAnswers);
    
    if (nextLap >= 1 && nextLap <= 3 && !shouldExitSetup) {
      setShowSetupEntry(true);
    }

    setIsAnimating(true);
    setTimeout(() => {
      setLap(nextLap);
      if (shouldExitSetup) {
        setShowSetupEntry(false);
        refreshArchives();
      }
      setTimeout(() => setIsAnimating(false), 200);
    }, 200);
  };

  const overallQuestionStats = useMemo(() => {
    const stats: Record<number, number> = {};
    if (rawAnswers.length === 0) return stats;
    questions.forEach(q => {
      let correct = 0; rawAnswers.forEach(ans => { if (ans.answers[q.number] === q.correctAnswer) correct++; });
      stats[q.number] = (correct / rawAnswers.length) * 100;
    });
    return stats;
  }, [rawAnswers, questions]);

  const overallAverage = useMemo(() => {
    if (results.length === 0) return 0;
    return results.reduce((acc, r) => acc + r.score, 0) / results.length;
  }, [results]);

  const classStats = useMemo(() => {
    const stats: Record<string, { totalScore: number; count: number }> = {};
    results.forEach(r => {
      const cls = r.student.class;
      if (!stats[cls]) stats[cls] = { totalScore: 0, count: 0 };
      stats[cls].totalScore += r.score;
      stats[cls].count += 1;
    });
    return stats;
  }, [results]);

  const getFullDetailResult = useCallback((r: ScoringResult) => {
    const ans = rawAnswers.find(a => a.studentId === r.student.id);
    if (!ans) return r;
    const details = questions.map(q => ({
      questionNumber: q.number, correctAnswer: q.correctAnswer, studentAnswer: ans.answers[q.number] || "",
      isCorrect: ans.answers[q.number] === q.correctAnswer, point: q.point, group: q.group, competency: q.competency, overallAccuracy: overallQuestionStats[q.number]
    }));
    return { ...r, details };
  }, [rawAnswers, questions, overallQuestionStats]);

  const selectedFullResult = useMemo(() => {
    const summary = sidebarList[selectedResultIndex];
    if (!summary) return null;
    return getFullDetailResult(summary);
  }, [sidebarList, selectedResultIndex, getFullDetailResult]);

  const finalSortedStandings = useMemo(() => {
    let data = filterClass ? results.filter(r => r.student.class === filterClass) : results;
    if (sortBy === 'score') return data.sort((a, b) => (rankMap.get(a.student.id) || 0) - (rankMap.get(b.student.id) || 0));
    return data.sort((a, b) => a.student.id.localeCompare(b.student.id));
  }, [results, filterClass, sortBy, rankMap]);

  const handleProcessAnswers = (answers: StudentAnswer[]) => {
    setRawAnswers(answers);
    const newResults: ScoringResult[] = answers.map(ans => {
      const student = students.find(s => s.id === ans.studentId) || { id: ans.studentId, name: '未処理', class: '-' };
      let score = 0; let totalPoints = 0;
      const compMap: Record<CompetencyType, { score: number; total: number }> = { 
        none: { score: 0, total: 0 }, knowledge: { score: 0, total: 0 }, thinking: { score: 0, total: 0 }, attitude: { score: 0, total: 0 } 
      };
      questions.forEach(q => {
        const isCorrect = ans.answers[q.number] === q.correctAnswer;
        totalPoints += q.point;
        if (q.competency) compMap[q.competency].total += q.point;
        if (isCorrect) { score += q.point; if (q.competency) compMap[q.competency].score += q.point; }
      });
      const competencyResults: any = {};
      (Object.keys(compMap) as CompetencyType[]).forEach(k => {
        competencyResults[k] = { label: COMPETENCY_LABELS[k], score: compMap[k].score, total: compMap[k].total, percentage: compMap[k].total > 0 ? (compMap[k].score / compMap[k].total) * 100 : 0 };
      });
      return { student, score, totalPoints, accuracy: totalPoints > 0 ? (score / totalPoints) * 100 : 0, competencyResults, details: [] };
    });
    setResults(newResults);
    saveToArchive(newResults, answers);
    setSelectedResultIndex(0);
    triggerLapChange(4);
  };

  const saveToArchive = useCallback((newResults: ScoringResult[], currentRawAnswers: StudentAnswer[]): string => {
    const dateStr = new Date().toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
    const finalTitle = sessionTitle || `テスト集計 - ${dateStr}`;
    const id = currentSessionId || `session_${Date.now()}`;
    const archiveResults = newResults.map(r => ({ ...r, details: [] }));
    const newArchive: ArchiveData = {
      id, timestamp: new Date().toLocaleString(), name: finalTitle,
      results: archiveResults as any, questions, students, rawAnswers: currentRawAnswers,
      isArchived: false,
      rangeSlots
    };
    try {
      const savedArchives = localStorage.getItem('grader_archives');
      let archiveList: ArchiveData[] = savedArchives ? JSON.parse(savedArchives) : [];
      const existingIndex = archiveList.findIndex(a => a.id === id);
      if (existingIndex > -1) {
        archiveList[existingIndex] = {
          ...archiveList[existingIndex],
          ...newArchive,
          isArchived: archiveList[existingIndex].isArchived || false
        };
      } else {
        archiveList = [newArchive, ...archiveList];
      }
      localStorage.setItem('grader_archives', JSON.stringify(archiveList));
      setArchives(archiveList);
    } catch (e) { alert("保存容量の上限に達しました。不要なログを削除してください。"); }
    if (!currentSessionId) setCurrentSessionId(id);
    return id;
  }, [currentSessionId, questions, sessionTitle, students, rangeSlots]);

  const handleResumeSession = (archive: ArchiveData) => {
    setStudents(archive.students);
    setQuestions(archive.questions);
    setResults(archive.results);
    setRawAnswers(archive.rawAnswers);
    setSessionTitle(archive.name);
    setCurrentSessionId(archive.id);
    setSelectedResultIndex(0);
    setRangeSlots(archive.rangeSlots || []);
    if (archive.rawAnswers && archive.rawAnswers.length > 0) {
      triggerLapChange(4);
    } else {
      setShowSetupEntry(true);
      triggerLapChange(2);
    }
  };

  const handleArchiveSession = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      const savedArchives = localStorage.getItem('grader_archives');
      if (!savedArchives) return;
      let archiveList: ArchiveData[] = JSON.parse(savedArchives);
      const index = archiveList.findIndex(a => a.id === id);
      if (index > -1) {
        archiveList[index].isArchived = true;
        localStorage.setItem('grader_archives', JSON.stringify(archiveList));
        setArchives(archiveList);
        if (currentSessionId === id) {
          // If the archived session is the currently active one, you can reset memory or keep it
        }
      }
    } catch (e) { console.error("Archive session failed", e); }
  }, [currentSessionId]);

  const handleRestoreSession = useCallback((e: React.MouseEvent | null, id: string) => {
    if (e) e.stopPropagation();
    try {
      const savedArchives = localStorage.getItem('grader_archives');
      if (!savedArchives) return;
      let archiveList: ArchiveData[] = JSON.parse(savedArchives);
      const index = archiveList.findIndex(a => a.id === id);
      if (index > -1) {
        archiveList[index].isArchived = false;
        localStorage.setItem('grader_archives', JSON.stringify(archiveList));
        setArchives(archiveList);
      }
    } catch (e) { console.error("Restore session failed", e); }
  }, []);

  const handleDeleteArchive = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("本当にこの集計ログを削除しアーカイブから削除しますか？（復元できません）")) return;
    try {
      const savedArchives = localStorage.getItem('grader_archives');
      if (!savedArchives) return;
      let archiveList: ArchiveData[] = JSON.parse(savedArchives);
      archiveList = archiveList.filter(a => a.id !== id);
      localStorage.setItem('grader_archives', JSON.stringify(archiveList));
      setArchives(archiveList);
      if (currentSessionId === id) setCurrentSessionId(null);
    } catch (e) { console.error("削除エラー", e); }
  }, [currentSessionId]);

  const handleRenameArchive = useCallback((e: React.MouseEvent, id: string, oldName: string) => {
    e.stopPropagation();
    const newName = prompt("集計セッションの新しい名称を入力してください:", oldName);
    if (!newName || newName === oldName) return;
    try {
      const savedArchives = localStorage.getItem('grader_archives');
      if (!savedArchives) return;
      let archiveList: ArchiveData[] = JSON.parse(savedArchives);
      const index = archiveList.findIndex(a => a.id === id);
      if (index > -1) {
        archiveList[index].name = newName;
        localStorage.setItem('grader_archives', JSON.stringify(archiveList));
        setArchives(archiveList);
        if (currentSessionId === id) setSessionTitle(newName);
      }
    } catch (e) { console.error("名称変更エラー", e); }
  }, [currentSessionId]);

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllInStandings = () => {
    const ids = finalSortedStandings.map(r => r.student.id);
    setSelectedIds(new Set(ids));
  };

  const selectAllInSidebar = () => {
    const ids = new Set(selectedIds);
    sidebarList.forEach(r => ids.add(r.student.id));
    setSelectedIds(ids);
  };

  const clearSidebarSelection = () => {
    const ids = new Set(selectedIds);
    sidebarList.forEach(r => ids.delete(r.student.id));
    setSelectedIds(ids);
  };

  const clearSelection = () => setSelectedIds(new Set());

  const exportPDF = async (mode: 'all' | 'single' | 'selected') => {
    setShowExportModal(false);
    setIsExporting(true);
    setExportMode(mode);
    setExportProgress(0);
    const targets = mode === 'single' && selectedFullResult ? [selectedFullResult] : mode === 'selected' ? results.filter(r => selectedIds.has(r.student.id)).sort((a, b) => a.student.id.localeCompare(b.student.id)) : [...results].sort((a, b) => a.student.id.localeCompare(b.student.id));
    if (targets.length === 0) { setIsExporting(false); return; }
    const opt = { 
      margin: [10, 10, 10, 10], 
      filename: `${sessionTitle || 'Grade_Report'}.pdf`, 
      image: { type: 'jpeg', quality: 0.98 }, 
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        logging: false, 
        backgroundColor: '#ffffff',
        scrollY: 0
      }, 
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['css', 'legacy'] }
    };
    try {
      await new Promise(r => setTimeout(r, 800));
      const html2pdf = (window as any).html2pdf;
      let worker = html2pdf().set(opt).from(document.getElementById(`pdf-page-${targets[0].student.id}`)).toPdf();
      setExportProgress(Math.floor((1 / targets.length) * 100));
      for (let i = 1; i < targets.length; i++) {
        const studentId = targets[i].student.id;
        const pageElement = document.getElementById(`pdf-page-${studentId}`);
        if (pageElement) worker = worker.get('pdf').then((pdf: any) => { pdf.addPage(); }).from(pageElement).toContainer().toCanvas().toImg().toPdf();
        setExportProgress(Math.floor(((i + 1) / targets.length) * 100));
        await new Promise(r => setTimeout(r, 60));
      }
      await worker.save();
      setExportProgress(100);
      await new Promise(r => setTimeout(r, 300));
    } catch (err) { alert("PDFの生成に失敗しました。"); } finally { setIsExporting(false); setExportProgress(0); setExportMode(null); }
  };

  const downloadExcel = () => {
    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    const groups = Array.from(new Set(questions.map(q => q.group).filter(g => g !== ""))).sort();
    const competencies = (Object.keys(COMPETENCY_LABELS) as CompetencyType[]).filter(k => k !== 'none');
    let header = "学籍番号,クラス,氏名,合計点,正答率(%)";
    groups.forEach(g => header += `,大問${g}`);
    competencies.forEach(k => header += `,${COMPETENCY_LABELS[k]}`);
    header += "\n";
    let csv = header;
    results.forEach(r => {
      const studentAns = rawAnswers.find(a => a.studentId === r.student.id);
      let row = `${r.student.id},${r.student.class},${r.student.name},${r.score},${r.accuracy.toFixed(1)}`;
      groups.forEach(g => {
        let groupScore = 0;
        questions.filter(q => q.group === g).forEach(q => { if (studentAns?.answers[q.number] === q.correctAnswer) groupScore += q.point; });
        row += `,${groupScore}`;
      });
      competencies.forEach(k => { row += `,${r.competencyResults[k]?.score || 0}`; });
      csv += row + "\n";
    });
    const blob = new Blob([bom, csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${sessionTitle || 'Grade_Analysis'}.csv`; a.click();
  };

  const getClassColor = (cls: string) => {
    const colors = ['#4f46e5', '#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#06b6d4', '#14b8a6', '#64748b'];
    const index = Math.abs(cls.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)) % colors.length;
    return colors[index];
  };

  const resultsForPdf = useMemo(() => {
    if (!isExporting) return [];
    if (exportMode === 'single' && selectedFullResult) return [selectedFullResult];
    let filtered = [...results];
    if (exportMode === 'selected') filtered = filtered.filter(r => selectedIds.has(r.student.id));
    return filtered.sort((a, b) => a.student.id.localeCompare(b.student.id));
  }, [isExporting, exportMode, selectedFullResult, results, selectedIds]);

  const hasDraft = students.length > 0 || questions.length > 0;

  return (
    <div className={`min-h-screen flex flex-col bg-slate-50 text-slate-800 relative`}>
      <style>{`
        body { font-family: 'Inter', sans-serif; overflow-x: hidden; }
        .display-font { font-family: 'Outfit', sans-serif; }
        .mono-font { font-family: 'JetBrains Mono', sans-serif; }
        .compact-scroll::-webkit-scrollbar { width: 5px; }
        .compact-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        .grade-row { display: flex; align-items: center; bg: white; margin-bottom: 6px; height: 52px; position: relative; overflow: hidden; cursor: pointer; transition: all 0.2s ease-out; border: 1px solid #e2e8f0; border-radius: 8px; background: #ffffff; }
        .grade-row:hover { border-color: #cbd5e1; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(15,23,42,0.03); }
        .grade-pos { width: 45px; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 800; display-font; background: #f8fafc; border-right: 1px solid #e2e8f0; margin-right: 4px; }
        .grade-pos.top1 { color: #854d0e; background: #fef9c3; }
        .grade-pos.top2 { color: #334155; background: #f1f5f9; }
        .grade-pos.top3 { color: #7c2d12; background: #ffedd5; }
        .grade-pts { width: 90px; text-align: right; padding-right: 24px; font-weight: 700; display-font; font-size: 16px; color: #1d4ed8; }
        .grade-name-block { flex: 1; height: 100%; display: flex; align-items: center; padding: 0 20px; position: relative; overflow: hidden; }
        .grade-team-color { position: absolute; left: 0; top: 0; bottom: 0; width: 4px; }
        .grade-driver { font-weight: 700; font-size: 14px; color: #1e293b; }
        .grade-team { font-weight: 600; font-size: 10px; color: #64748b; margin-left: auto; background: #f1f5f9; padding: 2px 8px; border-radius: 4px; }
        .grade-stat { width: 120px; text-align: center; font-size: 13px; font-weight: 600; color: #64748b; }
        .nav-paddle-top { width: 44px; height: 100%; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; border-left: 1px solid #e2e8f0; color: #64748b; }
        .nav-paddle-top:hover { bg: #f8fafc; color: #1d4ed8; }
        .driver-list-item { padding: 12px 14px; border-left: 4px solid transparent; cursor: pointer; transition: all 0.15s; background: #ffffff; margin-bottom: 4px; border-radius: 6px; display: flex; align-items: center; border: 1px solid #f1f5f9; }
        .driver-list-item:hover { bg: #f8fafc; border-color: #e2e8f0; }
        .driver-list-item.active { border-left-color: #1d4ed8; bg: #ecf9ff; border-color: #bae6fd; }
        .tps-segment { flex: 1; height: 100%; transition: background-color 0.15s; border-radius: 3px; }
        .checkbox-custom { width: 14px; height: 14px; border: 1.5px solid #cbd5e1; border-radius: 3px; margin-right: 12px; display: flex; align-items: center; justify-content: center; transition: all 0.1s; cursor: pointer; background: #ffffff; }
        .checkbox-custom.checked { background: #1d4ed8; border-color: #1d4ed8; }
        .checkbox-custom.checked::after { content: '✓'; color: white; style: bold; font-size: 9px; font-weight: 950; }
        .grade-checkbox-cell { width: 44px; height: 100%; display: flex; align-items: center; justify-content: center; border-right: 1px solid #f1f5f9; }
        .pwa-btn { position: relative; background: #ffffff; border: 1px solid #e2e8f0; color: #475569; padding: 6px 14px; font-weight: 600; font-size: 11px; border-radius: 6px; transition: all 0.2s; }
        .pwa-btn:hover { border-color: #1d4ed8; color: #1d4ed8; box-shadow: 0 4px 12px rgba(29,78,216,0.08); }
        .pwa-btn span { color: #1d4ed8; margin-right: 6px; }
        .logo-glow { filter: drop-shadow(0 2px 4px rgba(29,78,216,0.1)); }
      `}</style>

      {isAnimating && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-xs flex items-center justify-center">
          <div className="bg-white px-10 py-6 rounded-2xl flex flex-col items-center justify-center shadow-2xl border border-slate-200 text-slate-800">
            <i className="fa-solid fa-spinner text-3xl text-indigo-600 animate-spin mb-3"></i>
            <span className="text-slate-800 text-sm font-bold tracking-wider">データを同期しています...</span>
          </div>
        </div>
      )}

      {showTutorial && <GraderGuide step={lap} onDismiss={handleDismissTutorial} />}

      {showExportModal && (
        <div className="fixed inset-0 z-[200] bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-xl rounded-2xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] animate-[scaleUp_0.3s_ease-out]">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                 <h2 className="display-font font-bold text-lg text-slate-800">印刷・外部出力ターミナル (Export Console)</h2>
                 <button onClick={() => setShowExportModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><i className="fa-solid fa-xmark text-lg"></i></button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center">
                 <div className="space-y-3.5 w-full max-w-md">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center mb-2">セッションデータを高解像度PDF・CSVとして書き出します</p>
                    
                    <button onClick={() => exportPDF('selected')} disabled={selectedIds.size === 0} className={`w-full bg-slate-50 hover:bg-slate-100/80 p-4 rounded-xl border border-slate-200 flex items-center group transition-all text-left ${selectedIds.size === 0 ? 'opacity-40 cursor-not-allowed' : ''}`}>
                       <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center mr-4 group-hover:scale-105 transition-transform shadow-md shadow-indigo-600/10 text-white">
                          <span className="font-bold text-sm">{selectedIds.size}</span>
                       </div>
                       <div>
                          <p className="font-bold text-sm text-slate-800">選択中の生徒 ({selectedIds.size} 名)</p>
                          <p className="text-[10px] text-slate-400">チェックを入れた生徒分のみPDFシートを一括出力</p>
                       </div>
                    </button>

                    <button onClick={() => exportPDF('single')} className="w-full bg-slate-50 hover:bg-slate-100/80 p-4 rounded-xl border border-slate-200 flex items-center group transition-all text-left">
                       <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center mr-4 group-hover:scale-105 transition-transform"><i className="fa-solid fa-user-check text-lg text-indigo-600"></i></div>
                       <div>
                          <p className="font-bold text-sm text-slate-800">現在表示中の生徒のみ</p>
                          <p className="text-[10px] text-slate-400">ビューに開いている生徒の個別シートをPDF出力</p>
                       </div>
                    </button>

                    <button onClick={() => exportPDF('all')} className="w-full bg-slate-50 hover:bg-slate-100/80 p-4 rounded-xl border border-slate-200 flex items-center group transition-all text-left">
                       <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center mr-4 group-hover:scale-105 transition-transform"><i className="fa-solid fa-file-pdf text-lg text-rose-500"></i></div>
                       <div>
                          <p className="font-bold text-sm text-slate-800">全員分 (単一の結合PDF)</p>
                          <p className="text-[10px] text-slate-400">登載された全員分の個人レポートを統合した1つのPDFを出力</p>
                       </div>
                    </button>

                    <button onClick={downloadExcel} className="w-full bg-slate-50 hover:bg-slate-100/80 p-4 rounded-xl border border-slate-200 flex items-center group transition-all text-left">
                       <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center mr-4 group-hover:scale-105 transition-transform"><i className="fa-solid fa-file-excel text-lg text-emerald-600"></i></div>
                       <div>
                          <p className="font-bold text-sm text-slate-800">Excel / CSV 得点表</p>
                          <p className="text-[10px] text-slate-400">合計点、問題別・観点別正誤リストをまとめたCSVをダウンロード</p>
                       </div>
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {isExporting && (
        <div className="fixed inset-0 z-[500] bg-white flex flex-col items-center justify-center p-12">
           <div className="max-w-xl w-full flex flex-col items-center text-center">
              <div className="display-font text-7xl font-bold text-theme-gradient leading-none mb-4 animate-pulse">{exportProgress}%</div>
              <h2 className="display-font text-xl font-bold text-slate-800">成績レポートを構築しています</h2>
               <p className="text-slate-400 text-xs mt-2">各設問の採点マッチング、全体正答率および学習観点レーダーデータをPDFとしてエンコードしています。</p>
              
              <div className="w-full h-2.5 bg-slate-100 rounded-full border border-slate-200 overflow-hidden mt-8 flex p-0.5">
                 <div className="h-full bg-theme-gradient rounded-full transition-all duration-300" style={{ width: `${exportProgress}%` }} />
              </div>
           </div>
           
           <div id="pdf-render-zone" style={{ position: 'absolute', left: '-9999px', top: '0', width: '190mm', backgroundColor: '#ffffff', zIndex: -1, pointerEvents: 'none' }}>
              {resultsForPdf.map((r) => (
                <div key={r.student.id} id={`pdf-page-${r.student.id}`} style={{ backgroundColor: '#ffffff', width: '190mm', margin: 0, padding: 0 }}>
                  <ResultReport result={getFullDetailResult(r)} sessionTitle={sessionTitle} />
                </div>
              ))}
           </div>
        </div>
      )}

      {/* Main Header navigation */}
      <header className="h-16 flex items-center px-8 bg-white border-b border-slate-200/80 z-50 no-print shadow-xs">
        <div className="flex items-center cursor-pointer group py-1" onClick={() => { triggerLapChange(1, true); setShowArchiveView(false); }}>
          <MarkGradeLogo className="h-8 w-auto mr-3 text-indigo-600 logo-glow group-hover:scale-105 transition-all duration-300" />
          <div className="flex flex-col">
            <span className="text-xl font-extrabold tracking-tight text-theme-gradient display-font leading-none bg-clip-text">MarkGrade</span>
            <span className="text-[9px] font-bold text-indigo-600/75 uppercase tracking-wider mt-1">Elegant Assessment & Analysis</span>
          </div>
        </div>
        <div className="ml-auto flex items-center h-full">
          {lap === 1 && deferredPrompt && (
            <button onClick={handleInstallApp} className="pwa-btn mr-4">
              <span><i className="fa-solid fa-cloud"></i></span> システムをインストール
            </button>
          )}
          {lap === 4 && (
            <div className="flex items-center h-full mr-4 bg-slate-50 border-l border-r border-slate-200">
               <button onClick={() => navigateDriver(-1)} className="nav-paddle-top hover:bg-slate-100"><i className="fa-solid fa-chevron-left text-xs"></i></button>
               <div className="px-5 flex flex-col items-center">
                  <span className="text-[8px] font-bold text-indigo-600 uppercase tracking-wider">SELECTED RECORD</span>
                  <span className="text-slate-700 font-bold text-xs truncate max-w-[110px]">{selectedFullResult?.student.name}</span>
               </div>
               <button onClick={() => navigateDriver(1)} className="nav-paddle-top hover:bg-slate-100"><i className="fa-solid fa-chevron-right text-xs"></i></button>
            </div>
          )}
          {rawAnswers.length > 0 && lap <= 3 && (
            <button onClick={() => triggerLapChange(4)} className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 px-3.5 py-1.5 rounded-lg text-xs font-semibold mr-4 flex items-center transition-colors">
              <i className="fa-solid fa-chart-pie mr-1.5"></i> 個人分析ビューに戻る
            </button>
          )}
          {lap > 1 && <button onClick={() => { triggerLapChange(1, true); setShowArchiveView(false); }} className="text-slate-400 text-xs font-semibold hover:text-slate-600 px-3.5 transition-colors">ホーム</button>}
          {lap >= 4 && (
            <div className="relative">
              <button onClick={() => setShowExportModal(true)} className="bg-theme-gradient text-white hover:opacity-95 px-4.5 py-2 font-bold rounded-lg text-xs flex items-center shadow-md shadow-blue-500/10 tracking-wide transition-all">
                印刷・出力 (Export) <i className="fa-solid fa-download ml-1.5"></i>
              </button>
              {selectedIds.size > 0 && (
                <div className="absolute -top-2 -right-1 bg-emerald-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full shadow-sm animate-pulse">
                  {selectedIds.size}
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Main applet workspace */}
      <main className="flex-1 overflow-hidden relative flex flex-col p-6 max-w-[1400px] mx-auto w-full">
        {lap === 1 && !showSetupEntry && (
          showArchiveView ? (
            /* ARCHIVE PAGE VIEW */
            <div className="flex-1 flex flex-col overflow-hidden space-y-6 animate-[fadeIn_0.4s_ease-out]">
                <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-xs mt-2">
                   <div>
                      <h2 className="display-font text-xl font-bold text-slate-800 flex items-center">
                        <i className="fa-solid fa-box-archive mr-2.5 text-amber-500"></i> アーカイブされたセッション
                      </h2>
                      <p className="text-slate-400 text-xs mt-1">過去に格納されたテスト集計データが一覧で表示されます。必要に応じて復元や完全消去が可能です。</p>
                   </div>
                   <button 
                     onClick={() => setShowArchiveView(false)} 
                     className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-4 py-2 font-bold rounded-lg text-xs flex items-center transition-all shadow-xs"
                   >
                     ← 保存済みのセッションに戻る
                   </button>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 compact-scroll grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                   {archives.filter(a => a.isArchived).length === 0 ? (
                     <div className="col-span-full h-64 border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400 bg-slate-50/40">
                       <i className="fa-solid fa-folder-open text-4xl mb-3 text-slate-300"></i>
                       <span className="display-font text-sm font-semibold tracking-wide text-slate-500">アーカイブされたセッションはありません</span>
                     </div>
                   ) : (
                     archives.filter(a => a.isArchived).map(archive => (
                        <div key={archive.id} className="bg-white p-5 rounded-xl border border-slate-200 hover:border-amber-400 transition-all shadow-xs hover:shadow-md group relative">
                          <div className="absolute top-4.5 right-4 flex space-x-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                            <button onClick={(e) => handleRestoreSession(e, archive.id)} className="w-7 h-7 rounded bg-amber-50 text-amber-600 hover:bg-amber-100 transition-all flex items-center justify-center border border-amber-150" title="アクティブに復元"><i className="fa-solid fa-arrow-rotate-left text-xs"></i></button>
                            <button onClick={(e) => handleDeleteArchive(e, archive.id)} className="w-7 h-7 rounded bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-all flex items-center justify-center border border-slate-150" title="完全に削除"><i className="fa-solid fa-trash text-xs"></i></button>
                          </div>
                          <div className="text-[10px] font-medium text-slate-400 mb-1.5">{archive.timestamp}</div>
                          <h4 className="text-base font-bold text-slate-800 uppercase mb-5 truncate pr-16">{archive.name}</h4>
                          <div className="flex justify-between items-end border-t border-slate-50 pt-3.5">
                            <div>
                               <span className="text-lg font-bold text-amber-600 display-font">{archive.results.length || 0}</span>
                               <span className="text-[10px] font-bold text-slate-400 ml-1.5 tracking-wider uppercase">名 登録済み</span>
                            </div>
                            <button 
                              onClick={() => {
                                handleRestoreSession(null, archive.id);
                                handleResumeSession(archive);
                              }}
                              className="text-amber-600 hover:text-amber-700 text-[10px] font-bold uppercase transition-all flex items-center bg-amber-50 px-2.5 py-1 rounded"
                            >
                              復元して表示 <i className="fa-solid fa-chevron-right ml-1"></i>
                            </button>
                          </div>
                        </div>
                     ))
                   )}
                </div>
            </div>
          ) : (
            /* REGULAR HOME VIEW */
            <div className="flex-1 flex flex-col overflow-hidden space-y-10 animate-[fadeIn_0.4s_ease-out]">
               <div className="flex justify-center w-full">
                  <div onClick={startNewSession} className="bg-white border border-slate-200/85 p-8 rounded-2xl cursor-pointer hover:border-indigo-400 shadow-xs hover:shadow-md group transition-all duration-300 relative overflow-hidden w-full max-w-4xl flex items-center justify-between">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 -mr-12 -mt-12 rounded-full group-hover:scale-135 transition-all"></div>
                     <div className="flex items-center space-x-6 min-w-0 pr-6">
                        <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/15 shrink-0">
                          <i className="fa-solid fa-plus text-3xl text-white group-hover:scale-110 transition-transform"></i>
                        </div>
                        <div className="truncate">
                          <h2 className="display-font text-xl font-bold text-slate-800 leading-tight mb-1">新規セッション開始 (New Session)</h2>
                          <p className="text-slate-400 text-xs">クラス名簿の登録と採点基準、正解配点設定等をすべて新しく作成します</p>
                        </div>
                     </div>
                     <div className="bg-slate-50 border border-slate-200 text-slate-500 rounded-xl px-4 py-2 text-xs font-bold transition-all group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 shrink-0">
                       セッション開始 <i className="fa-solid fa-arrow-right ml-1"></i>
                     </div>
                  </div>
               </div>

             {/* Archived logs view */}
             <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="display-font font-bold text-sm text-slate-500 tracking-wider uppercase flex items-center"><i className="fa-solid fa-folder-open mr-2 text-indigo-500"></i> 保存済みのセッション</h3>
                  <div className="flex items-center space-x-3">
                     <button 
                       onClick={() => setShowArchiveView(true)} 
                       className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-3.5 py-1.5 rounded-lg text-xs font-bold border border-slate-200 transition-all flex items-center shadow-xs cursor-pointer"
                     >
                       <i className="fa-solid fa-box-archive mr-1.5 text-amber-500"></i> アーカイブされたセッションを開く
                     </button>
                     <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-md">{archives.filter(a => !a.isArchived).length} 件のデータ</span>
                   </div>
                </div>
                
                <div className="flex-1 overflow-y-auto pr-2 compact-scroll grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                   {archives.filter(a => !a.isArchived).length === 0 ? (
                     <div className="col-span-full h-44 border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400 bg-slate-50/40">
                       <i className="fa-regular fa-folder-open text-3xl mb-2 text-slate-300"></i>
                       <span className="display-font text-xs font-semibold text-slate-400 tracking-wide text-center">保存されたセッションはありません<br/><span className="text-[10px] text-slate-400 font-medium font-sans">（「新規セッション開始」をクリックすると、自動的に保存されます）</span></span>
                     </div>
                   ) : (
                     archives.filter(a => !a.isArchived).map(archive => (
                        <div key={archive.id} onClick={() => handleResumeSession(archive)} className="bg-white p-5 rounded-xl border border-slate-200 hover:border-indigo-400 transition-all cursor-pointer hover:-translate-y-0.5 shadow-xs hover:shadow-md group relative">
                          <div className="absolute top-4.5 right-4 flex space-x-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                            <button onClick={(e) => handleRenameArchive(e, archive.id, archive.name)} className="w-7 h-7 rounded bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-all flex items-center justify-center border border-slate-150 cursor-pointer" title="名称変更"><i className="fa-solid fa-pen text-xs"></i></button>
                             <button onClick={(e) => handleArchiveSession(e, archive.id)} className="w-7 h-7 rounded bg-slate-50 text-slate-400 hover:text-amber-600 hover:bg-slate-100 transition-all flex items-center justify-center border border-slate-150 cursor-pointer" title="アーカイブに移す"><i className="fa-solid fa-box-archive text-xs"></i></button>
                            <button onClick={(e) => handleDeleteArchive(e, archive.id)} className="w-7 h-7 rounded bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-all flex items-center justify-center border border-slate-150 cursor-pointer" title="削除"><i className="fa-solid fa-trash text-xs"></i></button>
                          </div>
                          <div className="text-[10px] font-medium text-slate-400 mb-1.5">{archive.timestamp}</div>
                          <h4 className="text-base font-bold text-slate-800 uppercase mb-5 truncate pr-16 group-hover:text-indigo-600 transition-colors">{archive.name}</h4>
                          <div className="flex justify-between items-end border-t border-slate-50 pt-3.5">
                            <div>
                               <span className="text-lg font-bold text-indigo-600 display-font">{archive.results.length || 0}</span>
                               <span className="text-[10px] font-bold text-slate-400 ml-1.5 tracking-wider uppercase">名 対象</span>
                            </div>
                            <span className="text-slate-400 group-hover:text-indigo-600 text-[10px] font-bold uppercase transition-all flex items-center">
                              レポートを表示 <i className="fa-solid fa-chevron-right ml-1"></i>
                            </span>
                          </div>
                        </div>
                     ))
                   )}
                </div>
             </div>
             
             <div className="flex justify-between items-center border-t border-slate-200/80 pt-4.5">
                <p className="text-[10px] font-semibold text-slate-400 tracking-wider">Elegant Modern Roster Grader System</p>
                <div className="display-font text-[9px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">VERSION: {APP_VERSION}</div>
             </div>
          </div>
         )
        )}

        {lap <= 3 && showSetupEntry && (
          <div className="flex-1 flex flex-col overflow-hidden">
             <SetupForm 
                key={currentSessionId || 'new'} 
                lap={lap as 1|2|3} 
                setLap={triggerLapChange} 
                students={students} 
                setStudents={setStudents} 
                questions={questions} 
                setQuestions={setQuestions} 
                rangeSlots={rangeSlots}
                setRangeSlots={setRangeSlots}
                onProcess={handleProcessAnswers} 
                sessionTitle={sessionTitle} 
                setSessionTitle={setSessionTitle} 
                resetSession={resetAllState} 
              />
          </div>
        )}

        {/* Lap 4: Individual Reports terminal */}
        {lap === 4 && selectedFullResult && (
          <div className="flex-1 flex gap-6 overflow-hidden animate-[fadeIn_0.4s_ease-out]">
            {/* Sidebar list selection */}
            <div className="w-64 bg-white rounded-xl flex flex-col no-print border border-slate-200 shadow-xs">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                <p className="text-[10px] font-bold text-slate-500 uppercase mb-2.5">学生レコード・フィルター</p>
                <div className="space-y-2.5">
                  <select value={sbClassFilter} onChange={(e) => { setSbClassFilter(e.target.value); setSelectedResultIndex(0); }} className="w-full bg-white text-xs text-slate-700 border border-slate-200 p-2.5 rounded-lg outline-none focus:border-indigo-500 cursor-pointer transition-all">
                    <option value="">クラス: すべて</option>
                    {sortedClassNames.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                  <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                    <button onClick={() => setSbSortBy('id')} className={`flex-1 py-1 text-[10px] font-bold rounded-md transition-all ${sbSortBy === 'id' ? 'bg-white shadow-xs text-indigo-600' : 'text-slate-400'}`}>学籍番号順</button>
                    <button onClick={() => setSbSortBy('score')} className={`flex-1 py-1 text-[10px] font-bold rounded-md transition-all ${sbSortBy === 'score' ? 'bg-white shadow-xs text-indigo-600' : 'text-slate-400'}`}>点数成績順</button>
                  </div>
                </div>
              </div>
              <div className="p-2 border-b border-slate-100 flex gap-1.5 no-print bg-slate-50/20">
                <button onClick={selectAllInSidebar} className="flex-1 bg-white hover:bg-slate-50 py-1.5 rounded-lg text-[9px] font-bold text-slate-500 hover:text-indigo-600 transition-colors border border-slate-200">一括選択(PDF)</button>
                <button onClick={clearSidebarSelection} className="flex-1 bg-white hover:bg-slate-50 py-1.5 rounded-lg text-[9px] font-bold text-slate-500 hover:text-rose-500 transition-colors border border-slate-200">チェック解除</button>
              </div>
              
              <div className="flex-1 overflow-y-auto compact-scroll p-1.5 bg-slate-50/20">
                {sidebarList.map((r, idx) => (
                  <div key={r.student.id} className={`driver-list-item ${selectedResultIndex === idx ? 'active' : ''}`}>
                    <div className={`checkbox-custom shrink-0 ${selectedIds.has(r.student.id) ? 'checked' : ''}`} onClick={(e) => { e.stopPropagation(); toggleSelection(r.student.id); }}></div>
                    <div className="flex-1 min-w-0" onClick={() => setSelectedResultIndex(idx)}>
                      <div className="flex justify-between items-center"><span className="text-xs font-bold text-slate-700 truncate pr-1">{r.student.name}</span><span className="text-[10px] text-slate-400 font-medium display-font">{r.student.id}</span></div>
                      <div className="flex justify-between items-center mt-1"><span className="text-xs text-indigo-600 font-bold display-font">{r.score} 点</span><span className="text-[9px] text-slate-400 font-semibold">{r.student.class}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Main report viewer */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex justify-between items-center mb-4 no-print">
                <div className="flex items-center space-x-3"><h2 className="text-lg font-bold text-slate-800">個別診断レポート詳細</h2></div>
                <div className="flex items-center space-x-2">
                  <button onClick={() => triggerLapChange(2)} className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center transition-colors"><i className="fa-solid fa-sliders mr-1.5 text-slate-450"></i>設問基準を微修正</button>
                  <button onClick={() => triggerLapChange(5)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center shadow-md shadow-indigo-600/10 transition-all">全体成績統計ダッシュボードへ <i className="fa-solid fa-trophy ml-1.5"></i></button>
                </div>
              </div>
              <div className="flex-1 flex flex-col overflow-y-auto compact-scroll shadow-lg rounded-xl bg-white border border-slate-200">
                 <ResultReport result={selectedFullResult} sessionTitle={sessionTitle} />
              </div>
            </div>
          </div>
        )}

        {/* Lap 5: Standard general results standings list */}
        {lap === 5 && (
          <div className="flex-1 flex flex-col overflow-hidden animate-[fadeIn_0.4s_ease-out]">
            <div className="flex justify-between items-end mb-6">
               <div>
                  <h1 className="text-2xl font-bold text-slate-850 tracking-tight display-font">{filterClass ? `${filterClass} 成績一覧` : (sessionTitle || "全体成績マトリクス・指標")}</h1>
                  <p className="text-indigo-600 text-xs font-medium tracking-wide mt-1">グレード分類 & レコード成績順一覧（一括書き出し・統計）</p>
               </div>
               <div className="flex space-x-2.5 items-center">
                  <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
                    <button onClick={selectAllInStandings} className="px-3 py-1 text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-white rounded transition-all">すべて選択</button>
                    <button onClick={clearSelection} className="px-3 py-1 text-xs font-semibold text-slate-400 hover:text-slate-600 hover:bg-white rounded transition-all">クリア</button>
                  </div>
                  <button onClick={() => triggerLapChange(2)} className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors"><i className="fa-solid fa-sliders mr-1.5 text-slate-450"></i>正誤基準を修正</button>
                  <button onClick={() => triggerLapChange(4)} className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors">個別レポート表示</button>
                  <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                    {['score', 'id'].map(m => (<button key={m} onClick={() => setSortBy(m as any)} className={`px-4 py-1 text-[10px] font-bold rounded-md transition-all ${sortBy === m ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400'}`}>{m === 'score' ? '成績順' : '番号順'}</button>))}
                  </div>
               </div>
            </div>
            
            {/* Student score lists rows */}
            <div className="flex-1 overflow-y-auto compact-scroll space-y-2 pr-1">
              {finalSortedStandings.map((r) => {
                const absRank = rankMap.get(r.student.id) || 0;
                return (
                  <div key={r.student.id} className="grade-row">
                    <div className="grade-checkbox-cell" onClick={() => toggleSelection(r.student.id)}>
                      <div className={`checkbox-custom mr-0 shrink-0 ${selectedIds.has(r.student.id) ? 'checked' : ''}`}></div>
                    </div>
                    <div className={`grade-pos ${absRank === 1 ? 'top1' : absRank === 2 ? 'top2' : absRank === 3 ? 'top3' : 'text-slate-400'}`} onClick={() => { 
                        const idx = sidebarList.findIndex(res => res.student.id === r.student.id);
                        if (idx !== -1) setSelectedResultIndex(idx);
                        triggerLapChange(4); 
                      }}>{absRank}</div>
                    <div className="grade-pts">{r.score} 点</div>
                    <div className="grade-name-block" onClick={() => { 
                        const idx = sidebarList.findIndex(res => res.student.id === r.student.id);
                        if (idx !== -1) setSelectedResultIndex(idx);
                        triggerLapChange(4); 
                      }}>
                       <div className="grade-team-color" style={{ backgroundColor: getClassColor(r.student.class) }}></div>
                       <span className="grade-driver">{r.student.name}</span>
                       <span className="grade-team">{r.student.class}</span>
                    </div>
                    <div className="grade-stat">{r.accuracy.toFixed(1)}%</div>
                  </div>
                );
              })}
            </div>

            {/* Key general stats summary metrics at bottom */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
               <div className="bg-white p-4.5 rounded-xl border border-slate-200 border-l-4 border-l-indigo-650 shadow-xs">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">全体平均点 (Average Score)</p>
                  <p className="text-2xl font-bold display-font text-indigo-600">{overallAverage.toFixed(1)}</p>
               </div>
               <div className="bg-white p-4.5 rounded-xl border border-slate-200 border-l-4 border-l-emerald-500 shadow-xs">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">受験総人数 (Total Candidates)</p>
                  <p className="text-2xl font-bold display-font text-slate-700">{results.length}</p>
               </div>
               <div className="col-span-2 bg-white p-4.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    {sortedClassNames.slice(0, 4).map(cls => (
                      <div key={cls} className="flex flex-col cursor-pointer hover:opacity-80 transition-all border-r border-slate-100 pr-5 last:border-0" onClick={() => setFilterClass(cls === filterClass ? null : cls)}>
                        <span className="text-[10px] font-bold text-slate-400">{cls} 平均</span>
                        <span className="font-bold text-base mt-0.5" style={{ color: getClassColor(cls) }}>
                          { classStats[cls] ? (classStats[cls].totalScore / classStats[cls].count).toFixed(1) : "0.0" }
                        </span>
                      </div>
                    ))}
                  </div>
                  <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest hidden lg:block">Class Performance Indicators</span>
               </div>
            </div>
          </div>
        )}
      </main>
      
      {/* Footer bar styled minimal */}
      <footer className="h-10 bg-white border-t border-slate-200/60 flex items-center px-8 no-print shrink-0 justify-between text-slate-400">
        <div className="text-[9px] font-semibold tracking-wider text-indigo-500/80">MARKGRADE SYSTEM • CLOUD MEMORY PERSISTED</div>
        <div className="text-[9px] font-medium font-mono">Copyright &copy; Ken Magami. All Rights Reserved.</div>
      </footer>
    </div>
  );
};

export default App;
