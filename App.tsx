import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Student, Question, StudentAnswer, ScoringResult, ArchiveData, CompetencyType, COMPETENCY_LABELS, RangeSlot } from './types';
import { SetupForm } from './components/SetupForm';
import { ResultReport } from './components/ResultReport';
import { StandingsReport } from './components/StandingsReport';
import { 
  auth, 
  signInWithPopup, 
  signOut, 
  googleProvider, 
  onAuthStateChanged, 
  isEmailAllowed, 
  getAllowedEmails, 
  addAllowedEmail, 
  removeAllowedEmail,
  SUPER_ADMIN_EMAIL,
  User 
} from './firebase';

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
  const [exportMode, setExportMode] = useState<'all' | 'single' | 'selected' | 'standings' | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialHiddenForever, setTutorialHiddenForever] = useState(false);
  const [showSetupEntry, setShowSetupEntry] = useState(false);
  const [showArchiveView, setShowArchiveView] = useState(false);
  
  // Google Authentication and Access Control States
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [allowedEmailsList, setAllowedEmailsList] = useState<string[]>([]);
  const [newEmailInput, setNewEmailInput] = useState("");
  const [showAccessManageModal, setShowAccessManageModal] = useState(false);
  const [accessManageMessage, setAccessManageMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  
  // Persistence for range slots (Grand Question settings)
  const [rangeSlots, setRangeSlots] = useState<RangeSlot[]>([]);
  const [standingsActivePage, setStandingsActivePage] = useState<number>(0);

  useEffect(() => {
    setStandingsActivePage(0);
  }, [filterClass, sortBy]);

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

  // Google Authentication Observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setIsAuthLoading(true);
      if (currentUser) {
        const allowed = await isEmailAllowed(currentUser.email);
        if (allowed) {
          setUser(currentUser);
          setIsAllowed(true);
          setAuthError(null);
          // Load other allowed emails
          try {
            const list = await getAllowedEmails();
            setAllowedEmailsList(list);
          } catch (e) {
            console.error("Allowed list fetch failed", e);
          }
        } else {
          setAuthError(`このGoogleアカウント（${currentUser.email}）にはアクセス権限がありません。管理者（${SUPER_ADMIN_EMAIL}）にお問い合わせください。`);
          setUser(null);
          setIsAllowed(false);
          await signOut(auth);
        }
      } else {
        setUser(null);
        setIsAllowed(false);
      }
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

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

  const handleSignIn = async () => {
    try {
      setIsAnimating(true);
      setAuthError(null);
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error("Sign in error:", error);
      // Auth/popup-blocked or iframe issues can be caught and printed elegantly
      setAuthError(`ログインに失敗しました。ポップアップがブロックされていないか確認してください。エラー：${error.message || error}`);
    } finally {
      setIsAnimating(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setIsAnimating(true);
      await signOut(auth);
      setUser(null);
      setIsAllowed(false);
      setAuthError(null);
    } catch (error) {
      console.error("Sign out error:", error);
    } finally {
      setIsAnimating(false);
    }
  };

  const handleAddAllowedEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setAccessManageMessage(null);
    const emailToAdd = newEmailInput.trim().toLowerCase();
    if (!emailToAdd) return;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailToAdd)) {
      setAccessManageMessage({ text: "有効なメールアドレスを入力してください。", type: 'error' });
      return;
    }

    try {
      setIsAnimating(true);
      await addAllowedEmail(emailToAdd);
      const list = await getAllowedEmails();
      setAllowedEmailsList(list);
      setNewEmailInput("");
      setAccessManageMessage({ text: `「${emailToAdd}」を追加しました。`, type: 'success' });
    } catch (err: any) {
      console.error(err);
      setAccessManageMessage({ text: `追加に失敗しました：${err.message || err}`, type: 'error' });
    } finally {
      setIsAnimating(false);
    }
  };

  const handleRemoveAllowedEmail = async (email: string) => {
    if (email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
      alert("スーパー管理者は削除できません。");
      return;
    }
    if (!confirm(`「${email}」のアクセス権限を削除しますか？`)) return;
    
    setAccessManageMessage(null);
    try {
      setIsAnimating(true);
      await removeAllowedEmail(email);
      const list = await getAllowedEmails();
      setAllowedEmailsList(list);
      setAccessManageMessage({ text: `「${email}」を削除しました。`, type: 'success' });
    } catch (err: any) {
      console.error(err);
      setAccessManageMessage({ text: `削除に失敗しました：${err.message || err}`, type: 'error' });
    } finally {
      setIsAnimating(false);
    }
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
    
    // Filter out student answers representing students who didn't take the test (未受験の0点, i.e., those who have no answers filled in)
    const activeRawAnswers = rawAnswers.filter(ans => {
      if (!ans || !ans.answers) return false;
      const keys = Object.keys(ans.answers);
      if (keys.length === 0) return false;
      return keys.some(k => {
        const value = ans.answers[Number(k)];
        return value !== undefined && value !== null && value.trim() !== "";
      });
    });

    if (activeRawAnswers.length === 0) {
      questions.forEach(q => {
        stats[q.number] = 0;
      });
      return stats;
    }

    questions.forEach(q => {
      let correct = 0;
      activeRawAnswers.forEach(ans => {
        if (ans.answers[q.number] === q.correctAnswer) correct++;
      });
      stats[q.number] = (correct / activeRawAnswers.length) * 100;
    });
    return stats;
  }, [rawAnswers, questions]);

  const overallAverage = useMemo(() => {
    const activeResults = results.filter(r => {
      const ans = rawAnswers.find(a => a.studentId === r.student.id);
      if (!ans || !ans.answers) return false;
      const keys = Object.keys(ans.answers);
      if (keys.length === 0) return false;
      return keys.some(k => {
        const val = ans.answers[Number(k)];
        return val !== undefined && val !== null && val.trim() !== "";
      });
    });
    if (activeResults.length === 0) return 0;
    return activeResults.reduce((acc, r) => acc + r.score, 0) / activeResults.length;
  }, [results, rawAnswers]);

  const classStats = useMemo(() => {
    const stats: Record<string, { totalScore: number; count: number }> = {};
    const activeResults = results.filter(r => {
      const ans = rawAnswers.find(a => a.studentId === r.student.id);
      if (!ans || !ans.answers) return false;
      const keys = Object.keys(ans.answers);
      if (keys.length === 0) return false;
      return keys.some(k => {
        const val = ans.answers[Number(k)];
        return val !== undefined && val !== null && val.trim() !== "";
      });
    });
    activeResults.forEach(r => {
      const cls = r.student.class;
      if (!stats[cls]) stats[cls] = { totalScore: 0, count: 0 };
      stats[cls].totalScore += r.score;
      stats[cls].count += 1;
    });
    return stats;
  }, [results, rawAnswers]);

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

  const standingsIsOnePage = useMemo(() => {
    if (sortBy === 'id') return false; // 番号順は必ずクラス別マルチページ
    return finalSortedStandings.length <= 15;
  }, [sortBy, finalSortedStandings]);

  const standingsItemsPerPage = sortBy === 'score' ? 40 : 9999;

  const standingsPages = useMemo(() => {
    if (standingsIsOnePage) {
      return [finalSortedStandings];
    }
    
    if (sortBy === 'score') {
      const chunks: ScoringResult[][] = [];
      for (let i = 0; i < finalSortedStandings.length; i += 40) {
        chunks.push(finalSortedStandings.slice(i, i + 40));
      }
      return chunks;
    } else {
      // クラス毎に分割
      const classMap: Record<string, ScoringResult[]> = {};
      const classes: string[] = [];
      finalSortedStandings.forEach(r => {
        const cls = r.student.class || '未設定';
        if (!classMap[cls]) {
          classMap[cls] = [];
          classes.push(cls);
        }
        classMap[cls].push(r);
      });
      // クラス名をソート
      classes.sort((a, b) => a.localeCompare(b));
      
      const chunks: ScoringResult[][] = [];
      classes.forEach(cls => {
        const clsResults = classMap[cls];
        // 1クラス最大40人として、万が一40人を超える場合はクラス内でも分割
        for (let i = 0; i < clsResults.length; i += 40) {
          chunks.push(clsResults.slice(i, i + 40));
        }
      });
      return chunks;
    }
  }, [finalSortedStandings, standingsIsOnePage, sortBy]);

  const distributionsForUI = useMemo(() => {
    const list = filterClass ? results.filter(r => r.student.class === filterClass) : results;
    const distributionMap: Record<string, { count: number; range: string; color: string; rankText: string }> = {
      'PERFECT': { count: 0, range: '100%', color: '#4f46e5', rankText: '秀 (S)' },
      'EXCELLENT': { count: 0, range: '90-99%', color: '#10b981', rankText: '優 (A)' },
      'VERY GOOD': { count: 0, range: '80-89%', color: '#0284c7', rankText: '良 (B)' },
      'GOOD': { count: 0, range: '70-79%', color: '#0d9488', rankText: '良好 (C+)' },
      'PASS': { count: 0, range: '60-69%', color: '#6366f1', rankText: '標準 (C)' },
      'NEAR PASS': { count: 0, range: '45-59%', color: '#f59e0b', rankText: '要努力 (D)' },
      'KEEP TRYING': { count: 0, range: '45%未満', color: '#ef4444', rankText: '要努力 (E)' },
    };

    list.forEach(r => {
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
      percentage: list.length > 0 ? (details.count / list.length) * 100 : 0,
    }));
  }, [results, filterClass]);

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

  const exportPDF = async (mode: 'all' | 'single' | 'selected' | 'standings') => {
    setShowExportModal(false);
    setIsExporting(true);
    setExportMode(mode);
    setExportProgress(0);

    if (mode === 'standings') {
      const opt = { 
        margin: [0, 0, 0, 0], 
        filename: `${sessionTitle || 'Grade_Analysis'}_Standings.pdf`, 
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
        setExportProgress(50);
        const element = document.getElementById('pdf-page-standings');
        if (element) {
          await html2pdf().set(opt).from(element).save();
        } else {
          throw new Error('Standings page element not found');
        }
        setExportProgress(100);
        await new Promise(r => setTimeout(r, 300));
      } catch (err) { alert("PDFの生成に失敗しました。"); } finally { setIsExporting(false); setExportProgress(0); setExportMode(null); }
      return;
    }

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
    let header = "出席番号,クラス,氏名,合計点,正答率(%)";
    groups.forEach(g => header += `,大問${g}`);
    competencies.forEach(k => header += `,${COMPETENCY_LABELS[k]}`);
    header += "\n";
    let csv = header;
    results.forEach(r => {
      const studentAns = rawAnswers.find(a => a.studentId === r.student.id);
      let studentNumber = r.student.number || r.student.id;
      if (r.student.number !== undefined && r.student.number !== null && r.student.number !== '') {
        const digits = String(r.student.number).replace(/\D/g, '');
        if (digits) {
          const parsed = parseInt(digits, 10);
          if (!isNaN(parsed)) {
            studentNumber = String(parsed);
          }
        }
      } else {
        const match = r.student.id.match(/\d+$/);
        if (match) {
          const parsed = parseInt(match[0], 10);
          if (!isNaN(parsed)) {
            studentNumber = String(parsed);
          }
        }
      }
      let row = `${studentNumber},${r.student.class},${r.student.name},${r.score},${r.accuracy.toFixed(1)}`;
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
    if (exportMode === 'standings') return [];
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

      {isAuthLoading ? (
        <div className="fixed inset-0 bg-slate-50 flex flex-col items-center justify-center z-[9999]">
          <div className="flex flex-col items-center max-w-sm text-center">
            <MarkGradeLogo className="h-16 w-16 mb-4 text-indigo-600 logo-glow animate-pulse" />
            <div className="text-xl font-extrabold text-slate-800 display-font mb-1">MarkGrade</div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-6">Elegant Assessment & Analysis</div>
            <div className="flex items-center space-x-2 bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm">
              <i className="fa-solid fa-circle-notch text-indigo-600 animate-spin"></i>
              <span className="text-slate-600 text-xs font-semibold">セキュリティ接続を初期化中...</span>
            </div>
          </div>
        </div>
      ) : (!user || !isAllowed) ? (
        <div className="fixed inset-0 bg-slate-50 flex items-center justify-center z-[9998] p-4">
          <div className="bg-white w-full max-w-md p-8 rounded-2xl border border-slate-200 shadow-2xl flex flex-col items-center text-center animate-[scaleUp_0.3s_ease-out]">
            <MarkGradeLogo className="h-20 w-20 mb-6 text-indigo-600 logo-glow" />
            <h1 className="text-2xl font-extrabold text-slate-800 display-font tracking-tight">MarkGrade</h1>
            <p className="text-xs text-indigo-600/75 font-bold uppercase tracking-widest mt-1 mb-3">Elegant Assessment & Analysis</p>
            <p className="text-xs text-slate-450 leading-relaxed max-w-xs mb-8">
              本システムは関係者専用の評価分析プラットフォームです。許可されたGoogleアカウントでサインインしてご利用ください。
            </p>

            {authError && (
              <div className="w-full bg-rose-50 border border-rose-100 p-4 rounded-xl text-left mb-6 animate-[fadeIn_0.3s_ease-out]">
                <div className="flex items-start space-x-2">
                  <i className="fa-solid fa-circle-exclamation text-rose-500 mt-0.5 shrink-0"></i>
                  <div>
                    <p className="text-xs font-bold text-rose-800">アクセス制限</p>
                    <p className="text-[11px] text-rose-600 font-medium leading-relaxed mt-1">
                      {authError}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <button 
              onClick={handleSignIn}
              className="w-full bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-850 px-6 py-3.5 rounded-xl border border-slate-200 hover:border-slate-300 font-bold text-sm flex items-center justify-center space-x-3 transition-all shadow-sm cursor-pointer"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>Googleアカウントでサインイン</span>
            </button>
            
            {authError && (
              <button 
                onClick={() => { setAuthError(null); }}
                className="text-[10px] text-slate-400 hover:text-indigo-600 font-bold uppercase tracking-wider mt-4 hover:underline"
              >
                別のアカウントで試す
              </button>
            )}
          </div>
        </div>
      ) : null}

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

      {showAccessManageModal && (
        <div className="fixed inset-0 z-[200] bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[85vh] animate-[scaleUp_0.3s_ease-out]">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center space-x-2">
                <i className="fa-solid fa-users-gear text-indigo-600 text-lg"></i>
                <h2 className="display-font font-bold text-base text-slate-800">アクセス権限管理 (Access Control List)</h2>
              </div>
              <button 
                onClick={() => {
                  setShowAccessManageModal(false);
                  setAccessManageMessage(null);
                }} 
                className="text-slate-400 hover:text-slate-650 transition-colors cursor-pointer"
              >
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">新規許可アカウントの追加 (Add Allowed User)</p>
                <form onSubmit={handleAddAllowedEmail} className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                      <i className="fa-regular fa-envelope text-xs"></i>
                    </span>
                    <input 
                      type="email" 
                      required 
                      placeholder="example@gmail.com" 
                      value={newEmailInput}
                      onChange={(e) => setNewEmailInput(e.target.value)}
                      className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:bg-white text-slate-800 rounded-xl text-xs font-semibold outline-none transition-all placeholder:text-slate-400"
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center space-x-1 transition-all shadow-md shadow-indigo-600/10 shrink-0 cursor-pointer"
                  >
                    <i className="fa-solid fa-plus text-[10px]"></i>
                    <span>追加</span>
                  </button>
                </form>
                {accessManageMessage && (
                  <div className={`mt-2.5 p-2.5 rounded-lg border text-xs font-medium animate-[fadeIn_0.2s_ease-out] ${
                    accessManageMessage.type === 'success' 
                      ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                      : 'bg-rose-50 border-rose-100 text-rose-700'
                  }`}>
                    {accessManageMessage.text}
                  </div>
                )}
              </div>

              <div className="border-t border-slate-100 pt-5">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">アクセス許可済みリスト (Allowed Emails)</p>
                  <span className="text-[9px] font-bold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">{allowedEmailsList.length} 件</span>
                </div>
                
                <div className="space-y-1.5 max-h-[250px] overflow-y-auto compact-scroll pr-1">
                  {allowedEmailsList.map((email) => {
                    const isSuperAdmin = email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
                    return (
                      <div key={email} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 transition-all">
                        <div className="flex items-center space-x-2.5 min-w-0">
                          <div className={`w-2 h-2 rounded-full ${isSuperAdmin ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'}`}></div>
                          <span className="text-xs font-bold text-slate-700 truncate">{email}</span>
                          {isSuperAdmin && (
                            <span className="text-[9px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md font-bold scale-90">
                              スーパー管理者
                            </span>
                          )}
                        </div>
                        {!isSuperAdmin && (
                          <button 
                            type="button"
                            onClick={() => handleRemoveAllowedEmail(email)}
                            className="w-7 h-7 bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 rounded-lg flex items-center justify-center transition-all cursor-pointer"
                            title="削除"
                          >
                            <i className="fa-regular fa-trash-can text-xs"></i>
                          </button>
                        )}
                      </div>
                    );
                  })}
                  
                  {allowedEmailsList.length === 0 && (
                    <div className="text-center py-8 text-slate-400 text-xs font-semibold">
                      読み込み中、またはリストが空です
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-slate-50 text-center">
              <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                ※ スーパー管理者（{SUPER_ADMIN_EMAIL}）は常にフルアクセス権限を持ち、削除することはできません。
              </p>
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
           
           <div id="pdf-render-zone" data-standings="pdf" style={{ position: 'absolute', left: '-9999px', top: '0', width: exportMode === 'standings' ? '210mm' : '190mm', backgroundColor: '#ffffff', zIndex: -1, pointerEvents: 'none' }}>{exportMode === 'standings' && <div id="pdf-page-standings" style={{ backgroundColor: '#ffffff', width: '210mm', margin: 0, padding: 0 }}><StandingsReport results={results} sessionTitle={sessionTitle} filterClass={filterClass} sortBy={sortBy} rankMap={rankMap} /></div>}
              {exportMode !== 'standings' && resultsForPdf.map((r) => (
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

          {user && (
            <div className="flex items-center space-x-3 border-l border-slate-200 pl-4 h-full ml-4">
              <div className="flex flex-col text-right hidden sm:flex">
                <span className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[120px]">{user.displayName || 'ユーザー'}</span>
                <span className="text-[9px] font-semibold text-slate-400 truncate max-w-[120px] leading-none mt-0.5">{user.email}</span>
              </div>
              {user.photoURL ? (
                <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full border border-slate-200 object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold uppercase">
                  {user.email?.[0] || 'U'}
                </div>
              )}
              
              <button 
                onClick={() => {
                  getAllowedEmails().then(setAllowedEmailsList);
                  setAccessManageMessage(null);
                  setShowAccessManageModal(true);
                }}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-indigo-650 hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all flex items-center justify-center cursor-pointer"
                title="アクセス権限の管理"
              >
                <i className="fa-solid fa-users-gear text-sm"></i>
              </button>

              <button 
                onClick={handleSignOut}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-rose-650 hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all flex items-center justify-center cursor-pointer"
                title="ログアウト"
              >
                <i className="fa-solid fa-right-from-bracket text-sm"></i>
              </button>
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
                    <button onClick={() => setSbSortBy('id')} className={`flex-1 py-1 text-[10px] font-bold rounded-md transition-all ${sbSortBy === 'id' ? 'bg-white shadow-xs text-indigo-600' : 'text-slate-400'}`}>出席番号順</button>
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

        {/* Lap 5: Standard general results standings list with interactive pagination mirroring the PDF */}
        {lap === 5 && (
          <div className="flex-1 flex flex-col overflow-hidden animate-[fadeIn_0.4s_ease-out]">
            <div className="flex justify-between items-end mb-4 shrink-0">
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
                  <button onClick={() => exportPDF('standings')} className="bg-rose-600 hover:bg-rose-700 text-white px-3.5 py-2 text-xs font-bold rounded-lg transition-all flex items-center shadow-md shadow-rose-600/10 ml-1.5 cursor-pointer"><i className="fa-solid fa-file-pdf mr-1.5"></i>グレード・成績順一覧をPDF化</button>
                  <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                    {['score', 'id'].map(m => (<button key={m} onClick={() => setSortBy(m as any)} className={`px-4 py-1 text-[10px] font-bold rounded-md transition-all ${sortBy === m ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400'}`}>{m === 'score' ? '成績順' : '番号順'}</button>))}
                  </div>
               </div>
            </div>

            {/* Pagination tabs to keep HTML layout preview identical to PDF pages */}
            {!standingsIsOnePage && (
              <div className="flex bg-slate-100/90 p-1.5 rounded-xl border border-slate-200 mb-4 items-center justify-between no-print shrink-0">
                <div className="flex gap-1.5 overflow-x-auto compact-scroll">
                  <button 
                    onClick={() => setStandingsActivePage(0)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap shrink-0 ${standingsActivePage === 0 ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500 hover:bg-slate-200'}`}
                  >
                    <i className="fa-solid fa-chart-simple mr-1.5"></i>総合サマリー統計 (Page 1)
                  </button>
                  {standingsPages.map((pageData, idx) => {
                    const firstItem = pageData[0];
                    const label = sortBy === 'id' && firstItem 
                      ? `${firstItem.student.class || '未設定'}クラス (Page ${idx + 2})`
                      : `成績データ一覧 (${idx * 40 + 1}〜${Math.min((idx + 1) * 40, finalSortedStandings.length)}位) (Page ${idx + 2})`;
                    return (
                      <button 
                        key={idx}
                        onClick={() => setStandingsActivePage(idx + 1)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap shrink-0 ${standingsActivePage === idx + 1 ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500 hover:bg-slate-200'}`}
                      >
                        <i className={`fa-solid ${sortBy === 'id' ? 'fa-graduation-cap' : 'fa-list-ol'} mr-1.5`}></i>{label}
                      </button>
                    );
                  })}
                </div>
                <div className="text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden md:block">
                  全 {1 + standingsPages.length} ページ構成
                </div>
              </div>
            )}

            {/* Current Active view */}
            {standingsIsOnePage ? (
              // Simple layout for <= 15 items: render all together
              <div className="flex-1 flex flex-col overflow-hidden">
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
                <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0 no-print">
                   <div className="bg-white p-4 rounded-xl border border-slate-200 border-l-4 border-l-indigo-600 shadow-xs">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">全体平均点 (Average Score)</p>
                      <p className="text-2xl font-bold display-font text-indigo-600">{overallAverage.toFixed(1)}</p>
                   </div>
                   <div className="bg-white p-4 rounded-xl border border-slate-200 border-l-4 border-l-emerald-500 shadow-xs">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">受験総人数 (Total Candidates)</p>
                      <p className="text-2xl font-bold display-font text-slate-700">{results.length}</p>
                   </div>
                   <div className="col-span-2 bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
                      <div className="flex flex-wrap gap-4">
                        {sortedClassNames.slice(0, 6).map(cls => (
                          <div key={cls} className="flex flex-col cursor-pointer hover:opacity-80 transition-all" onClick={() => setFilterClass(cls === filterClass ? null : cls)}>
                            <span className="text-[10px] font-bold text-slate-400">{cls} 平均</span>
                            <span className="font-bold text-md mt-0.5" style={{ color: getClassColor(cls) }}>
                              { classStats[cls] ? (classStats[cls].totalScore / classStats[cls].count).toFixed(1) : "0.0" }
                            </span>
                          </div>
                        ))}
                      </div>
                      <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest hidden lg:block">Class Performance Indicators</span>
                   </div>
                </div>
              </div>
            ) : (
              // Multipage layout: render the active page
              <div className="flex-1 flex flex-col overflow-hidden">
                {standingsActivePage === 0 ? (
                  // PAGE 1 Preview: statistics sheet
                  <div className="flex-1 overflow-y-auto compact-scroll space-y-5 pr-1 py-1">
                     {/* Key academic stats */}
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white p-5 rounded-xl border border-slate-200 border-l-4 border-l-indigo-600 shadow-xs flex flex-col justify-between">
                           <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">試験平均点</p>
                           <p className="text-3xl font-bold display-font text-indigo-600 mt-2">{overallAverage.toFixed(1)} <span className="text-xs font-normal text-slate-400">点</span></p>
                        </div>
                        <div className="bg-white p-5 rounded-xl border border-slate-200 border-l-4 border-l-slate-500 shadow-xs flex flex-col justify-between">
                           <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">試験対象人数</p>
                           <p className="text-3xl font-bold display-font text-slate-700 mt-2">{results.length} <span className="text-xs font-normal text-slate-400">名</span></p>
                        </div>
                        <div className="bg-white p-5 rounded-xl border border-slate-200 border-l-4 border-l-emerald-500 shadow-xs flex flex-col justify-between">
                           <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">最高得点</p>
                           <p className="text-3xl font-bold display-font text-emerald-600 mt-2">{Math.max(...results.map(r => r.score), 0)} <span className="text-xs font-normal text-slate-400">点</span></p>
                        </div>
                        <div className="bg-white p-5 rounded-xl border border-slate-200 border-l-4 border-l-rose-500 shadow-xs flex flex-col justify-between">
                           <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">最低得点</p>
                           <p className="text-3xl font-bold display-font text-rose-500 mt-2">{Math.max(0, Math.min(...results.map(r => r.score), 100))} <span className="text-xs font-normal text-slate-400">点</span></p>
                        </div>
                     </div>

                     {/* Class averages overview */}
                     <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                        <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-3.5"><i className="fa-solid fa-graduation-cap mr-1.5 text-indigo-500"></i>全クラス平均点</h3>
                        <div className="flex flex-wrap gap-2.5">
                          {sortedClassNames.map(cls => (
                            <div key={cls} className="bg-slate-50 border border-slate-150 py-2.5 px-3 rounded-lg text-center shadow-xs shrink-0 flex-1 min-w-[70px]">
                              <p className="text-[9px] text-slate-500 font-extrabold truncate">{cls}</p>
                              <p className="text-base font-black display-font text-indigo-600 mt-1">
                                { classStats[cls] ? (classStats[cls].totalScore / classStats[cls].count).toFixed(1) : "0.0" }点
                              </p>
                              <p className="text-[8px] text-slate-400 font-medium">({classStats[cls]?.count || 0}名)</p>
                            </div>
                          ))}
                        </div>
                     </div>

                     {/* Grade reach ratio distribution */}
                     <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4"><i className="fa-solid fa-chart-pie mr-1.5 text-indigo-500"></i>学年到達基準グレード到達分布</h3>
                        <div className="space-y-3.5">
                          {distributionsForUI.map(grade => (
                            <div key={grade.badgeText} className="flex items-center">
                              <div className="w-24 shrink-0">
                                <span className="text-[9px] font-black tracking-wider px-2 py-0.5 rounded border display-font uppercase shrink-0" style={{ borderColor: grade.color, color: grade.color, backgroundColor: `${grade.color}08` }}>
                                  {grade.badgeText}
                                </span>
                              </div>
                              <div className="w-24 shrink-0 text-left text-xs font-extrabold text-slate-400">
                                {grade.rankText}
                              </div>
                              <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden flex mx-4 border border-slate-200/60 p-0.5">
                                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${grade.percentage}%`, backgroundColor: grade.color }} />
                              </div>
                              <div className="w-24 shrink-0 text-right font-bold text-xs text-slate-700">
                                <span className="font-extrabold display-font text-slate-900">{grade.count} 名</span>
                                <span className="text-slate-400 text-[10px] ml-1.5">({grade.percentage.toFixed(1)}%)</span>
                              </div>
                            </div>
                          ))}
                        </div>
                     </div>
                  </div>
                ) : (
                  // Individual student data tables for active page
                  <div className="flex-1 overflow-y-auto compact-scroll space-y-2 pr-1">
                    {standingsPages[standingsActivePage - 1]?.map((r) => {
                      const absRank = rankMap.get(r.student.id) || 0;
                      return (
                        <div key={r.student.id} className="grade-row animate-[fadeIn_0.15s_ease-out]">
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
                )}
              </div>
            )}
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
