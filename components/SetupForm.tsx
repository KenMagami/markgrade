import React, { useState, useEffect } from "react";
import {
  Student,
  Question,
  StudentAnswer,
  CompetencyType,
  COMPETENCY_LABELS,
  RangeSlot,
} from "../types";

interface SetupFormProps {
  lap: 1 | 2 | 3 | 4;
  setLap: (lap: any) => void;
  students: Student[];
  setStudents: (s: Student[]) => void;
  questions: Question[];
  setQuestions: (q: Question[] | ((prev: Question[]) => Question[])) => void;
  rangeSlots: RangeSlot[];
  setRangeSlots: React.Dispatch<React.SetStateAction<RangeSlot[]>>;
  onProcess: (answers: StudentAnswer[]) => void;
  sessionTitle: string;
  setSessionTitle: (t: string) => void;
  resetSession?: () => void;
}

type DragMode = "none" | "point" | "group" | "competency";
type UploadStatus = "idle" | "processing" | "success" | "error";

export const SetupForm: React.FC<SetupFormProps> = ({
  lap,
  setLap,
  students,
  setStudents,
  questions,
  setQuestions,
  rangeSlots,
  setRangeSlots,
  onProcess,
  sessionTitle,
  setSessionTitle,
  resetSession,
}) => {
  const [qCount, setQCount] = useState(questions.length || 10);
  const [dragMode, setDragMode] = useState<DragMode>("none");
  const [activeValue, setActiveValue] = useState<number | null>(null);
  const [activeComp, setActiveComp] = useState<CompetencyType | null>(null);
  const [showBulkPaste, setShowBulkPaste] = useState(false);
  const [bulkInput, setBulkInput] = useState("");
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [pastRosters, setPastRosters] = useState<
    { name: string; students: Student[]; type: "last" | "archive"; id: string }[]
  >([]);

  const [flashingQs, setFlashingQs] = useState<Set<number>>(new Set());
  const [subStep, setSubStep] = useState<1 | 2 | 3 | 4>(1);

  // Dropdown predefined options lists
  const YEARS_LIST = ["2026年度", "2025年度", "2027年度", "2024年度"];
  const GRADES_LIST = [
    "中学1年",
    "中学2年",
    "中学3年",
    "高校1年",
    "高校2年",
    "高校3年",
  ];
  const COURSES_LIST = [
    "特選",
    "進学",
    "文型",
    "理系",
    "特進",
    "普通科",
    "一般",
  ];

  const JHS_SUBJECTS = [
    "国語",
    "社会（地理）",
    "社会（歴史）",
    "社会（公民）",
    "数学",
    "理科",
    "英語",
    "音楽",
    "美術",
    "保健体育",
    "技術・家庭",
  ];
  const HS_JA_SUBJECTS = [
    "現代の国語",
    "言語文化",
    "論理国語",
    "文学国語",
    "国語表現",
    "古典探究",
  ];
  const HS_SOC_SUBJECTS = [
    "地理総合",
    "地理探究",
    "歴史総合",
    "日本史探究",
    "世界史探究",
    "公共",
    "倫理",
    "政治・経済",
  ];
  const HS_MATH_SUBJECTS = [
    "数学Ⅰ",
    "数学Ⅱ",
    "数学Ⅲ",
    "数学A",
    "数学B",
    "数学C",
  ];
  const HS_SCI_SUBJECTS = [
    "科学と人間生活",
    "物理基礎",
    "物理",
    "化学基礎",
    "化学",
    "生物基礎",
    "生物",
    "地学基礎",
    "地学",
  ];
  const HS_EN_SUBJECTS = [
    "英語コミュニケーションⅠ",
    "英語コミュニケーションⅡ",
    "英語コミュニケーションⅢ",
    "論理・表現Ⅰ",
    "論理・表現Ⅱ",
    "論理・表現Ⅲ",
  ];
  const HS_ETC_SUBJECTS = [
    "情報Ⅰ",
    "情報Ⅱ",
    "家庭基礎",
    "家庭総合",
    "体育",
    "保健",
  ];

  const FLAT_SUBJECTS = [
    ...JHS_SUBJECTS,
    ...HS_JA_SUBJECTS,
    ...HS_SOC_SUBJECTS,
    ...HS_MATH_SUBJECTS,
    ...HS_SCI_SUBJECTS,
    ...HS_EN_SUBJECTS,
    ...HS_ETC_SUBJECTS,
  ];

  const TERM_LIST = ["1学期", "2学期", "3学期", "前期", "後期"];
  const EXAM_TYPE_LIST = [
    "中間テスト",
    "期末テスト",
    "学年末テスト",
    "実力テスト",
    "小テスト",
    "模擬試験",
  ];

  const [academicYear, setAcademicYear] = useState("");
  const [grade, setGrade] = useState("");
  const [course, setCourse] = useState("");
  const [term, setTerm] = useState("");
  const [examType, setExamType] = useState("");
  const [subject, setSubject] = useState("");

  const [isCustomYear, setIsCustomYear] = useState(false);
  const [isCustomGrade, setIsCustomGrade] = useState(false);
  const [isCustomCourse, setIsCustomCourse] = useState(false);
  const [isCustomTerm, setIsCustomTerm] = useState(false);
  const [isCustomExamType, setIsCustomExamType] = useState(false);
  const [isCustomSubject, setIsCustomSubject] = useState(false);

  useEffect(() => {
    if (sessionTitle && !academicYear && !grade && !course && !subject && !term && !examType) {
      const parts = sessionTitle.split(" ");
      if (parts.length >= 2) {
        let yr = "";
        let gd = "";
        let cs = "";
        let tm = "";
        let ex = "";
        let sj = "";
        parts.forEach((p, idx) => {
          if (p.includes("年度") || /^[0-9０-９]{4}$/.test(p)) {
            yr = p;
          } else if (
            (p.includes("年") || p.includes("Grade")) &&
            p.length <= 4
          ) {
            gd = p;
          } else if (p.includes("学期") || p === "前期" || p === "後期") {
            tm = p;
          } else if (p.includes("テスト") || p.includes("試験")) {
            ex = p;
          } else if (idx === parts.length - 1) {
            sj = p;
          } else {
            if (!cs) {
              cs = p;
            } else {
              cs += " " + p;
            }
          }
        });

        if (yr) {
          setAcademicYear(yr);
          if (!YEARS_LIST.includes(yr)) setIsCustomYear(true);
        }
        if (gd) {
          setGrade(gd);
          if (!GRADES_LIST.includes(gd)) setIsCustomGrade(true);
        }
        if (cs) {
          setCourse(cs);
          if (!COURSES_LIST.includes(cs)) setIsCustomCourse(true);
        }
        if (tm) {
          setTerm(tm);
          if (!TERM_LIST.includes(tm)) setIsCustomTerm(true);
        }
        if (ex) {
          setExamType(ex);
          if (!EXAM_TYPE_LIST.includes(ex)) setIsCustomExamType(true);
        }
        if (sj) {
          setSubject(sj);
          if (!FLAT_SUBJECTS.includes(sj)) setIsCustomSubject(true);
        }
      } else {
        setSubject(sessionTitle);
        if (sessionTitle && !FLAT_SUBJECTS.includes(sessionTitle))
          setIsCustomSubject(true);
      }
    }
  }, [sessionTitle]);

  const updateSessionTitleParts = (
    year: string,
    grd: string,
    crs: string,
    trm: string,
    etyp: string,
    sbj: string,
  ) => {
    setAcademicYear(year);
    setGrade(grd);
    setCourse(crs);
    setTerm(trm);
    setExamType(etyp);
    setSubject(sbj);

    const parts = [year, grd, crs, trm, etyp, sbj].map((s) => s?.trim()).filter(Boolean);

    setSessionTitle(parts.join(" "));
  };

  useEffect(() => {
    const list: { name: string; students: Student[]; type: "last" | "archive"; id: string }[] = [];
    let deletedRosters: string[] = [];
    try {
      const deletedRaw = localStorage.getItem("grader_deleted_rosters");
      if (deletedRaw) {
        deletedRosters = JSON.parse(deletedRaw) as string[];
      }
    } catch (e) {
      console.error(e);
    }

    // 1. Check dedicated last student list
    try {
      const lastSaved = localStorage.getItem("grader_last_student_list");
      if (lastSaved && !deletedRosters.includes("last_student_list")) {
        const parsed = JSON.parse(lastSaved) as Student[];
        if (parsed && parsed.length > 0) {
          list.push({
            name: `前回アップロード・登録した名簿 (${parsed.length}名)`,
            students: parsed,
            type: "last",
            id: "last_student_list",
          });
        }
      }
    } catch (e) {
      console.error(e);
    }

    // 2. Check archives
    try {
      const savedArchives = localStorage.getItem("grader_archives");
      if (savedArchives) {
        const parsedArchives = JSON.parse(savedArchives) as any[];
        parsedArchives.forEach((archive, idx) => {
          if (archive.students && archive.students.length > 0) {
            const rosterId = archive.id || `archive_${idx}`;
            if (deletedRosters.includes(rosterId)) {
              return;
            }

            const name = `${archive.name || "セッション " + (idx + 1)} の名簿 (${archive.students.length}名)`;
            const isDuplicate = list.some(
              (item) =>
                item.students.length === archive.students.length &&
                item.students[0]?.id === archive.students[0]?.id,
            );
            if (!isDuplicate) {
              list.push({
                name,
                students: archive.students,
                type: "archive",
                id: rosterId,
              });
            }
          }
        });
      }
    } catch (e) {
      console.error(e);
    }

    setPastRosters(list);
  }, []);

  const handleDeleteRoster = (rosterId: string, rosterType: "last" | "archive") => {
    if (!window.confirm("この過去の名簿を削除（非表示）にしますか？")) {
      return;
    }

    if (rosterType === "last") {
      localStorage.removeItem("grader_last_student_list");
    } else {
      try {
        const deletedRaw = localStorage.getItem("grader_deleted_rosters");
        const deletedList: string[] = deletedRaw ? JSON.parse(deletedRaw) : [];
        if (!deletedList.includes(rosterId)) {
          deletedList.push(rosterId);
          localStorage.setItem("grader_deleted_rosters", JSON.stringify(deletedList));
        }
      } catch (e) {
        console.error(e);
      }
    }

    setPastRosters((prev) => prev.filter((r) => r.id !== rosterId));
  };

  const flashEffect = (numbers: number[]) => {
    setFlashingQs(new Set(numbers));
    setTimeout(() => setFlashingQs(new Set()), 600);
  };

  const handleStudentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result !== "string") return;
      const csvLines = result
        .split(/\r?\n/)
        .filter((line) => line.trim() !== "");
      const parsed = csvLines
        .slice(1)
        .map((line) => {
          const parts = line.split(",").map((s) => s.trim());
          const [grade, cls, num, name, furigana] = parts;
          if (!grade || !cls || !num) return null;
          const paddedNum = num.padStart(2, "0");
          const id = `${grade}${cls}${paddedNum}`;
          return {
            id,
            name: name || `生徒 ${paddedNum}`,
            class: `${grade}年${cls}組`,
            number: num,
            furigana: furigana || "",
          } as Student;
        })
        .filter((s): s is Student => s !== null);
      setStudents(parsed);
      if (parsed.length > 0) {
        localStorage.setItem(
          "grader_last_student_list",
          JSON.stringify(parsed),
        );
        try {
          const deletedRaw = localStorage.getItem("grader_deleted_rosters");
          if (deletedRaw) {
            let deletedList: string[] = JSON.parse(deletedRaw);
            if (deletedList.includes("last_student_list")) {
              deletedList = deletedList.filter((id) => id !== "last_student_list");
              localStorage.setItem("grader_deleted_rosters", JSON.stringify(deletedList));
            }
          }
        } catch (e) {
          console.error(e);
        }
        setPastRosters((prev) => {
          const filtered = prev.filter(
            (p) =>
              p.id !== "last_student_list" &&
              !p.name.includes("前回アップロード") &&
              !p.name.includes("前回登録"),
          );
          return [
            {
              name: `前回アップロード・登録した名簿 (${parsed.length}名)`,
              students: parsed,
              type: "last",
              id: "last_student_list",
            },
            ...filtered,
          ];
        });
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const downloadStudentTemplate = () => {
    const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
    const csvContent =
      "grade,class,number,name,furigana\n1,A,01,山田 太郎,やまだ たろう\n1,A,02,佐藤 花子,さとう はなこ";
    const blob = new Blob([bom, csvContent], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "student_roster_template.csv";
    a.click();
  };

  useEffect(() => {
    if (lap === 2 && questions.length === 0) {
      const initQ = Array.from({ length: qCount }, (_, i) => ({
        number: i + 1,
        correctAnswer: "",
        point: 5,
        group: "",
        competency: "none" as CompetencyType,
      }));
      setQuestions(initQ);
    }
  }, [lap, qCount, questions.length, setQuestions]);

  const syncGroupNumbers = () => {
    if (rangeSlots.length === 0) return;
    setQuestions((prev: Question[]) => {
      const next = prev.map((q) => {
        const matchingSlot = [...rangeSlots]
          .reverse()
          .find((s) => q.number >= s.start && q.number <= s.end);
        if (matchingSlot && q.group !== matchingSlot.group) {
          return { ...q, group: matchingSlot.group };
        }
        return q;
      });
      return next;
    });
  };

  useEffect(() => {
    if (lap === 2) syncGroupNumbers();
  }, [rangeSlots, lap, qCount]);

  const updateQ = (no: number, field: keyof Question, val: any) => {
    setQuestions((prev: Question[]) =>
      prev.map((q) => (q.number === no ? { ...q, [field]: val } : q)),
    );
  };

  const applyValueToSelectedGroups = (
    field: "point" | "competency",
    value: any,
  ) => {
    if (value === null) return;
    const selectedGroupIds = rangeSlots
      .filter((s) => s.selected)
      .map((s) => s.group.trim());
    if (selectedGroupIds.length === 0) return;
    const affected: number[] = [];
    setQuestions((prev: Question[]) =>
      prev.map((q) => {
        if (selectedGroupIds.includes(q.group.trim())) {
          affected.push(q.number);
          return { ...q, [field]: value };
        }
        return q;
      }),
    );
    flashEffect(affected);
  };

  const updateQCount = (val: number) => {
    if (isNaN(val) || val < 1) return;
    const limitedVal = Math.min(val, 200);
    setQCount(limitedVal);
    setQuestions((prev: Question[]) => {
      const newQs = Array.from({ length: limitedVal }, (_, i) => {
        const existing = prev.find((p) => p.number === i + 1);
        return (
          existing || {
            number: i + 1,
            correctAnswer: "",
            point: 5,
            group: "",
            competency: "none" as CompetencyType,
          }
        );
      });
      return newQs;
    });
  };

  const downloadAnswersTemplate = () => {
    const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
    const headers = [
      "student_id",
      ...questions.map((q) => `Q${q.number}`),
    ].join(",");
    const rows = students
      .map((s) => `${s.id},${questions.map(() => "").join(",")}`)
      .join("\n");
    const csvContent = `${headers}\n${rows}`;
    const blob = new Blob([bom, csvContent], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "score_upload_sheet.csv";
    a.click();
  };

  const handleFinalUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadStatus("processing");
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const result = event.target?.result;
        if (typeof result !== "string") throw new Error("File read error");
        const lines = result
          .split(/\r?\n/)
          .filter((line) => line.trim() !== "");
        const answers: StudentAnswer[] = lines
          .slice(1)
          .map((line) => {
            const parts = line.split(",").map((s) => s.trim());
            if (parts.length < 2) return null;
            const ansMap: Record<number, string> = {};
            questions.forEach((q, idx) => {
              ansMap[q.number] = parts[idx + 1] || "";
            });
            return { studentId: parts[0], answers: ansMap };
          })
          .filter((a): a is StudentAnswer => a !== null && a.studentId !== "");
        setTimeout(() => {
          onProcess(answers);
        }, 800);
      } catch (err) {
        setUploadStatus("error");
      }
    };
    reader.readAsText(file);
  };

  const clearRangeSlotsSelection = () => {
    setRangeSlots((prev) => prev.map((s) => ({ ...s, selected: false })));
  };

  const selectedCount = rangeSlots.filter((s) => s.selected).length;

  // Custom step navigation render helper
  const renderStepsHeader = (currentStep: number) => {
    const steps = [
      { num: 1, title: "生徒名簿登録" },
      { num: 2, title: "正解・配点設定" },
      { num: 3, title: "解答データ流し込み" },
    ];
    return (
      <div className="flex items-center justify-between mx-auto max-w-4xl w-full mb-8 px-4">
        {steps.map((st, i) => (
          <React.Fragment key={st.num}>
            <div className="flex items-center space-x-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                  currentStep === st.num
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                    : currentStep > st.num
                      ? "bg-emerald-500 text-white"
                      : "bg-slate-200 text-slate-500"
                }`}
              >
                {currentStep > st.num ? (
                  <i className="fa-solid fa-check text-xs"></i>
                ) : (
                  st.num
                )}
              </div>
              <span
                className={`text-sm font-semibold transition-all duration-300 ${
                  currentStep === st.num
                    ? "text-indigo-600 font-bold"
                    : "text-slate-400"
                }`}
              >
                {st.title}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-4 rounded transition-all duration-300 ${
                  currentStep > st.num ? "bg-emerald-500" : "bg-slate-200"
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col space-y-8">
      <style>{`
        input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }
        .compact-scroll::-webkit-scrollbar { width: 5px; height: 5px; }
        .compact-scroll::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, 0.5); border-radius: 4px; }
        @keyframes flash-green { 0% { background-color: rgba(16, 185, 129, 0.2); transform: scale(1.02); } 100% { background-color: transparent; transform: scale(1); } }
        .animate-flash { animation: flash-green 0.6s cubic-bezier(0.4, 0, 0.2, 1); z-index: 50; }
      `}</style>

      {renderStepsHeader(lap)}

      {lap === 1 && (
        <div className="max-w-4xl mx-auto w-full space-y-8 animate-[fadeIn_0.4s_ease-out]">
          <div className="bg-white p-8 rounded-xl border border-slate-200/80 shadow-sm">
            <h2 className="display-font text-2xl font-bold mb-6 text-slate-900 tracking-tight">
              ステップ 1: 生徒名簿登録
            </h2>

            <div className="mb-8 p-6 bg-slate-50/50 rounded-xl border border-slate-150 space-y-5">
              <div className="flex items-center space-x-2 pb-1 border-b border-slate-100">
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500"></div>
                <span className="text-sm font-bold text-slate-850">
                  セッション情報の入力
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {/* 年度 */}
                <div className="space-y-1.5">
                  <label className="text-slate-500 font-bold text-xs tracking-wider">
                    年度
                  </label>
                  {isCustomYear ? (
                    <div className="space-y-1">
                      <input
                        type="text"
                        value={academicYear}
                        onChange={(e) =>
                          updateSessionTitleParts(
                            e.target.value,
                            grade,
                            course,
                            term,
                            examType,
                            subject,
                          )
                        }
                        placeholder="例: 2026年度"
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500 transition-all font-sans"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomYear(false);
                          updateSessionTitleParts(
                            YEARS_LIST[0],
                            grade,
                            course,
                            term,
                            examType,
                            subject,
                          );
                        }}
                        className="text-[10px] text-indigo-600 font-bold hover:underline flex items-center transition-colors mt-1"
                      >
                        <i className="fa-solid fa-list-check mr-1"></i>{" "}
                        リストから選択
                      </button>
                    </div>
                  ) : (
                    <select
                      value={academicYear}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "__custom__") {
                          setIsCustomYear(true);
                        } else {
                          updateSessionTitleParts(val, grade, course, term, examType, subject);
                        }
                      }}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-550 focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer"
                    >
                      <option value="">選択してください</option>
                      {YEARS_LIST.map((yr) => (
                        <option key={yr} value={yr}>
                          {yr}
                        </option>
                      ))}
                      <option value="__custom__">その他 (自由入力)...</option>
                    </select>
                  )}
                </div>

                {/* 学年 */}
                <div className="space-y-1.5">
                  <label className="text-slate-500 font-bold text-xs tracking-wider">
                    学年
                  </label>
                  {isCustomGrade ? (
                    <div className="space-y-1">
                      <input
                        type="text"
                        value={grade}
                        onChange={(e) =>
                          updateSessionTitleParts(
                            academicYear,
                            e.target.value,
                            course,
                            term,
                            examType,
                            subject,
                          )
                        }
                        placeholder="例: 中学1年"
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500 transition-all font-sans"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomGrade(false);
                          updateSessionTitleParts(
                            academicYear,
                            GRADES_LIST[0],
                            course,
                            term,
                            examType,
                            subject,
                          );
                        }}
                        className="text-[10px] text-indigo-600 font-bold hover:underline flex items-center transition-colors mt-1"
                      >
                        <i className="fa-solid fa-list-check mr-1"></i>{" "}
                        リストから選択
                      </button>
                    </div>
                  ) : (
                    <select
                      value={grade}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "__custom__") {
                          setIsCustomGrade(true);
                        } else {
                          updateSessionTitleParts(
                            academicYear,
                            val,
                            course,
                            term,
                            examType,
                            subject,
                          );
                        }
                      }}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-550 focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer"
                    >
                      <option value="">選択してください</option>
                      {GRADES_LIST.map((gd) => (
                        <option key={gd} value={gd}>
                          {gd}
                        </option>
                      ))}
                      <option value="__custom__">その他 (自由入力)...</option>
                    </select>
                  )}
                </div>

                {/* コース */}
                <div className="space-y-1.5">
                  <label className="text-slate-500 font-bold text-xs tracking-wider">
                    コース
                  </label>
                  {isCustomCourse ? (
                    <div className="space-y-1">
                      <input
                        type="text"
                        value={course}
                        onChange={(e) =>
                          updateSessionTitleParts(
                            academicYear,
                            grade,
                            e.target.value,
                            term,
                            examType,
                            subject,
                          )
                        }
                        placeholder="例: 特選"
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500 transition-all font-sans"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomCourse(false);
                          updateSessionTitleParts(
                            academicYear,
                            grade,
                            COURSES_LIST[0],
                            term,
                            examType,
                            subject,
                          );
                        }}
                        className="text-[10px] text-indigo-600 font-bold hover:underline flex items-center transition-colors mt-1"
                      >
                        <i className="fa-solid fa-list-check mr-1"></i>{" "}
                        リストから選択
                      </button>
                    </div>
                  ) : (
                    <select
                      value={course}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "__custom__") {
                          setIsCustomCourse(true);
                        } else {
                          updateSessionTitleParts(
                            academicYear,
                            grade,
                            val,
                            term,
                            examType,
                            subject,
                          );
                        }
                      }}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-550 focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer"
                    >
                      <option value="">選択してください</option>
                      {COURSES_LIST.map((cs) => (
                        <option key={cs} value={cs}>
                          {cs}
                        </option>
                      ))}
                      <option value="__custom__">その他 (自由入力)...</option>
                    </select>
                  )}
                </div>

                {/* 学期 */}
                <div className="space-y-1.5">
                  <label className="text-slate-500 font-bold text-xs tracking-wider">
                    学期
                  </label>
                  {isCustomTerm ? (
                    <div className="space-y-1">
                      <input
                        type="text"
                        value={term}
                        onChange={(e) =>
                          updateSessionTitleParts(
                            academicYear,
                            grade,
                            course,
                            e.target.value,
                            examType,
                            subject,
                          )
                        }
                        placeholder="例: 1学期"
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500 transition-all font-sans"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomTerm(false);
                          updateSessionTitleParts(
                            academicYear,
                            grade,
                            course,
                            TERM_LIST[0],
                            examType,
                            subject,
                          );
                        }}
                        className="text-[10px] text-indigo-600 font-bold hover:underline flex items-center transition-colors mt-1"
                      >
                        <i className="fa-solid fa-list-check mr-1"></i>{" "}
                        リストから選択
                      </button>
                    </div>
                  ) : (
                    <select
                      value={term}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "__custom__") {
                          setIsCustomTerm(true);
                        } else {
                          updateSessionTitleParts(
                            academicYear,
                            grade,
                            course,
                            val,
                            examType,
                            subject,
                          );
                        }
                      }}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-550 focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer"
                    >
                      <option value="">選択してください</option>
                      {TERM_LIST.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                      <option value="__custom__">その他 (自由入力)...</option>
                    </select>
                  )}
                </div>

                {/* テスト名・区分 */}
                <div className="space-y-1.5">
                  <label className="text-slate-500 font-bold text-xs tracking-wider">
                    テスト区分
                  </label>
                  {isCustomExamType ? (
                    <div className="space-y-1">
                      <input
                        type="text"
                        value={examType}
                        onChange={(e) =>
                          updateSessionTitleParts(
                            academicYear,
                            grade,
                            course,
                            term,
                            e.target.value,
                            subject,
                          )
                        }
                        placeholder="例: 中間テスト"
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500 transition-all font-sans"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomExamType(false);
                          updateSessionTitleParts(
                            academicYear,
                            grade,
                            course,
                            term,
                            EXAM_TYPE_LIST[0],
                            subject,
                          );
                        }}
                        className="text-[10px] text-indigo-600 font-bold hover:underline flex items-center transition-colors mt-1"
                      >
                        <i className="fa-solid fa-list-check mr-1"></i>{" "}
                        リストから選択
                      </button>
                    </div>
                  ) : (
                    <select
                      value={examType}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "__custom__") {
                          setIsCustomExamType(true);
                        } else {
                          updateSessionTitleParts(
                            academicYear,
                            grade,
                            course,
                            term,
                            val,
                            subject,
                          );
                        }
                      }}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-550 focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer"
                    >
                      <option value="">選択してください</option>
                      {EXAM_TYPE_LIST.map((et) => (
                        <option key={et} value={et}>
                          {et}
                        </option>
                      ))}
                      <option value="__custom__">その他 (自由入力)...</option>
                    </select>
                  )}
                </div>

                {/* 科目名 */}
                <div className="space-y-1.5">
                  <label className="text-slate-500 font-bold text-xs tracking-wider">
                    科目名
                  </label>
                  {isCustomSubject ? (
                    <div className="space-y-1">
                      <input
                        type="text"
                        value={subject}
                        onChange={(e) =>
                          updateSessionTitleParts(
                            academicYear,
                            grade,
                            course,
                            term,
                            examType,
                            e.target.value,
                          )
                        }
                        placeholder="例: 数学Ⅰ"
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500 transition-all font-sans"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomSubject(false);
                          updateSessionTitleParts(
                            academicYear,
                            grade,
                            course,
                            term,
                            examType,
                            FLAT_SUBJECTS[0],
                          );
                        }}
                        className="text-[10px] text-indigo-600 font-bold hover:underline flex items-center transition-colors mt-1"
                      >
                        <i className="fa-solid fa-list-check mr-1"></i>{" "}
                        リストから選択
                      </button>
                    </div>
                  ) : (
                    <select
                      value={subject}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "__custom__") {
                          setIsCustomSubject(true);
                        } else {
                          updateSessionTitleParts(
                            academicYear,
                            grade,
                            course,
                            term,
                            examType,
                            val,
                          );
                        }
                      }}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-805 outline-none focus:border-indigo-550 focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer"
                    >
                      <option value="">選択してください</option>
                      <optgroup label="中学校の教科">
                        {JHS_SUBJECTS.map((sj) => (
                          <option key={sj} value={sj}>
                            {sj}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="高校 国語">
                        {HS_JA_SUBJECTS.map((sj) => (
                          <option key={sj} value={sj}>
                            {sj}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="高校 地理歴史・公民">
                        {HS_SOC_SUBJECTS.map((sj) => (
                          <option key={sj} value={sj}>
                            {sj}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="高校 数学">
                        {HS_MATH_SUBJECTS.map((sj) => (
                          <option key={sj} value={sj}>
                            {sj}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="高校 理科">
                        {HS_SCI_SUBJECTS.map((sj) => (
                          <option key={sj} value={sj}>
                            {sj}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="高校 外国語（英語）">
                        {HS_EN_SUBJECTS.map((sj) => (
                          <option key={sj} value={sj}>
                            {sj}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="高校 情報・家庭・その他">
                        {HS_ETC_SUBJECTS.map((sj) => (
                          <option key={sj} value={sj}>
                            {sj}
                          </option>
                        ))}
                      </optgroup>
                      <option value="__custom__">その他 (自由入力)...</option>
                    </select>
                  )}
                </div>
              </div>

              {/* 自動生成されたタイトル */}
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-slate-500 font-bold text-xs tracking-wider uppercase block">
                    自動生成されたセッションタイトル (直接調整も可能です)
                  </label>
                  {sessionTitle && (
                    <button
                      type="button"
                      onClick={() => {
                        setAcademicYear("");
                        setGrade("");
                        setCourse("");
                        setTerm("");
                        setExamType("");
                        setSubject("");
                        setSessionTitle("");
                      }}
                      className="text-[10px] text-rose-500 font-bold hover:underline"
                    >
                      タイトルをリセット
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={sessionTitle}
                  onChange={(e) => setSessionTitle(e.target.value)}
                  placeholder="例：2026年度 1年 特進コース 数学Ⅰ"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-800 font-bold focus:bg-white focus:border-indigo-500 transition-all outline-none font-sans text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <button
                onClick={downloadStudentTemplate}
                className="h-44 border border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center bg-slate-50/50 hover:bg-slate-50 hover:border-slate-400 group transition-all"
              >
                <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <i className="fa-solid fa-file-csv text-2xl text-indigo-500"></i>
                </div>
                <span className="display-font text-sm font-semibold text-slate-700">
                  1. 名簿テンプレートをダウンロード
                </span>
                <span className="text-xs text-slate-400 mt-1">
                  生徒登録用のCSV定義シートを保存します
                </span>
              </button>

              <div className="h-44 border border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center relative bg-slate-50/50 hover:bg-slate-50 hover:border-indigo-400 overflow-hidden group transition-all">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleStudentUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />
                <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mb-3 group-hover:scale-110 transition-all">
                  <i className="fa-solid fa-cloud-arrow-up text-2xl text-emerald-500"></i>
                </div>
                <span className="display-font text-sm font-semibold text-slate-700">
                  2. 名簿CSVファイルをアップロード
                </span>
                <span className="text-xs text-slate-400 mt-1">
                  作成した生徒名簿CSVをドラッグまたは選択します
                </span>
              </div>
            </div>

            {pastRosters.length > 0 && (
              <div className="mt-8 pt-6 border-t border-slate-100 animate-[fadeIn_0.3s_ease-out]">
                <label className="text-slate-500 font-semibold text-xs tracking-wider uppercase block mb-3.5">
                  <i className="fa-solid fa-clock-rotate-left mr-1.5 text-indigo-500"></i>{" "}
                  一度アップした名簿を再利用（過去の名簿を呼び出す）
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-1 compact-scroll">
                  {pastRosters.map((roster, rIdx) => (
                    <div
                      key={roster.id || rIdx}
                      onClick={() => {
                        setStudents(roster.students);
                      }}
                      className={`p-3.5 rounded-lg border text-left flex items-center justify-between transition-all cursor-pointer group relative ${
                        students.length > 0 &&
                        students[0]?.id === roster.students[0]?.id &&
                        students.length === roster.students.length
                          ? "border-indigo-500 bg-indigo-50/40 text-indigo-950 font-bold"
                          : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50/50 text-slate-700 bg-white"
                      }`}
                    >
                      <div className="flex items-center space-x-3 overflow-hidden pr-2">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                            students.length > 0 &&
                            students[0]?.id === roster.students[0]?.id &&
                            students.length === roster.students.length
                              ? "bg-indigo-100 text-indigo-600"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          <i className="fa-solid fa-users text-xs"></i>
                        </div>
                        <div className="flex flex-col overflow-hidden">
                          <span className="text-xs font-semibold truncate leading-tight">
                            {roster.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium font-sans mt-0.5">
                            先頭: {roster.students[0]?.name || "不明"}
                          </span>
                        </div>
                      </div>
                      <div className="shrink-0 flex items-center space-x-2.5">
                        {students.length > 0 &&
                        students[0]?.id === roster.students[0]?.id &&
                        students.length === roster.students.length ? (
                          <span className="text-[10px] bg-indigo-600 text-white font-bold px-2 py-0.5 rounded">
                            適用中
                          </span>
                        ) : (
                          <span className="text-[10px] text-indigo-600 group-hover:text-indigo-700 font-bold flex items-center whitespace-nowrap">
                            呼び出す{" "}
                            <i className="fa-solid fa-chevron-right ml-1"></i>
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteRoster(roster.id, roster.type);
                          }}
                          className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 hover:border-red-200 border border-transparent transition-all"
                          title="この名簿を削除"
                        >
                          <i className="fa-solid fa-trash-can text-xs"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {students.length > 0 && (
              <div className="mt-8 animate-[fadeIn_0.3s_ease-out]">
                <div className="flex items-center justify-between bg-emerald-50/70 p-5 rounded-lg border border-emerald-100">
                  <div className="flex flex-col">
                    <span className="display-font font-bold text-emerald-700 text-lg leading-none">
                      生徒 {students.length} 名 の登録が完了しました
                    </span>
                    <span className="text-slate-500 text-xs mt-1.5">
                      テストの設問・配点および観点アプローチの設定へ進むことができます。
                    </span>
                  </div>
                  <div className="flex space-x-3 shrink-0">
                    <button
                      onClick={() => resetSession && resetSession()}
                      className="border border-slate-200 text-slate-500 hover:bg-slate-100 px-5 py-2.5 font-semibold rounded-lg transition-all text-xs"
                    >
                      キャンセル
                    </button>
                    <button
                      onClick={() => setLap(2)}
                      className="bg-indigo-600 text-white hover:bg-indigo-700 px-7 py-2.5 font-bold rounded-lg transition-all text-xs flex items-center shadow-md shadow-indigo-600/10"
                    >
                      配点・観点設定へ{" "}
                      <i className="fa-solid fa-chevron-right ml-1.5"></i>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {lap === 2 && (
        <div className="flex-1 flex flex-col overflow-hidden animate-[fadeIn_0.4s_ease-out] bg-white border border-slate-200/80 rounded-xl shadow-sm">
          {/* Form Header bar */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between no-print bg-slate-50/50">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setLap(1)}
                className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center bg-white hover:bg-slate-50 text-slate-500 transition-colors"
              >
                <i className="fa-solid fa-arrow-left text-xs"></i>
              </button>
              <div className="flex flex-col">
                <h2 className="display-font text-lg font-bold leading-none text-slate-800">
                  ステップ 2: 配点・正解・観点の設計
                </h2>
                <p className="text-slate-400 text-xs mt-1">
                  設問ごとの正解記号、配点、評価の観点を設定してください。
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowBulkPaste(true)}
                className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center transition-colors"
              >
                <i className="fa-solid fa-paste mr-1.5 text-cyan-600"></i>{" "}
                正解テキスト一括適用
              </button>
              <button
                onClick={() => setLap(3)}
                className="bg-theme-gradient hover:opacity-90 text-white px-5 py-1.5 rounded-lg font-bold text-xs flex items-center transition-all shadow-md shadow-blue-500/10"
              >
                設定完了、次のステップへ{" "}
                <i className="fa-solid fa-chevron-right ml-1.5"></i>
              </button>
            </div>
          </div>

          {/* Bulk operations and Question slots list layout */}
          <div className="flex-1 overflow-hidden flex min-h-[500px]">
            {/* Left sidebar: Progressive 4-Step Vertical Stepper */}
            <div className="w-[340px] border-r border-slate-100 flex flex-col no-print bg-slate-50/40 overflow-y-auto compact-scroll p-4 space-y-4 shrink-0">
              <div className="pb-2 border-b border-slate-200">
                <span className="text-xs font-extrabold tracking-wider text-slate-500 display-font uppercase">
                  正解・配点設計 4ステップ設定
                </span>
              </div>

              {/* Step 1: 設問数の設定 */}
              <div 
                onClick={() => setSubStep(1)} 
                className={`p-3 rounded-xl border transition-all duration-250 cursor-pointer ${
                  subStep === 1 
                    ? "bg-white border-indigo-500 shadow-sm ring-2 ring-indigo-55/30" 
                    : "bg-slate-50 border-slate-100 hover:border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className={`w-5.5 h-5.5 rounded-full flex items-center justify-center font-bold text-xs ${subStep === 1 ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-500"}`}>
                      1
                    </div>
                    <span className="font-extrabold text-slate-700 text-xs">① 設問数の設定</span>
                  </div>
                  <span className="text-[10px] bg-indigo-50 text-indigo-600 font-bold px-2 py-0.5 rounded-md min-w-[44px] text-center">{qCount} 問</span>
                </div>
                
                {subStep === 1 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-2.5 animate-[fadeIn_0.2s_ease-out]" onClick={(e) => e.stopPropagation()}>
                    <span className="text-[10px] text-slate-450 font-medium block leading-normal">
                      テストの合計設問数を入力してください（最大200問）:
                    </span>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="1"
                        max="200"
                        value={qCount}
                        onChange={(e) => updateQCount(parseInt(e.target.value) || 10)}
                        className="bg-white border border-slate-200 rounded-lg p-2 font-bold text-center outline-none text-sm w-20 focus:border-indigo-500 transition-colors"
                      />
                      <span className="text-slate-500 text-xs font-semibold">問</span>
                    </div>
                    <button
                      onClick={() => setSubStep(2)}
                      className="w-full bg-indigo-650 hover:bg-indigo-720 text-white py-1.5 rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center justify-center space-x-1"
                    >
                      <span>大問の設定へ進む</span>
                      <i className="fa-solid fa-arrow-right text-[10px]"></i>
                    </button>
                  </div>
                )}
              </div>

              {/* Step 2: 大問の設定 */}
              <div 
                onClick={() => setSubStep(2)} 
                className={`p-3 rounded-xl border transition-all duration-250 cursor-pointer ${
                  (subStep === 2 || subStep === 3) 
                    ? "bg-white border-blue-500 shadow-sm ring-2 ring-blue-500/20" 
                    : "bg-slate-50 border-slate-100 hover:border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className={`w-5.5 h-5.5 rounded-full flex items-center justify-center font-bold text-xs ${(subStep === 2 || subStep === 3) ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500"}`}>
                      2
                    </div>
                    <span className="font-extrabold text-slate-700 text-xs">② 大問の範囲設定</span>
                  </div>
                  <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-md text-center">{rangeSlots.length} グループ</span>
                </div>

                {(subStep === 2 || subStep === 3) && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-3 animate-[fadeIn_0.2s_ease-out]" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-between items-center bg-slate-50/50 p-1 rounded-md">
                      <span className="text-[10px] text-slate-400 font-bold ml-1">大問スコープ</span>
                      <div className="flex space-x-2">
                        {rangeSlots.length > 0 && (
                          <button
                            onClick={clearRangeSlotsSelection}
                            className="text-slate-400 hover:text-rose-500 text-[10px] font-bold"
                            title="選択クリア"
                          >
                            <i className="fa-solid fa-square-xmark mr-0.5"></i> 選択解除
                          </button>
                        )}
                        <button
                          onClick={() =>
                            setRangeSlots([
                              ...rangeSlots,
                              {
                                group: (rangeSlots.length + 1).toString(),
                                start: rangeSlots.length > 0 ? rangeSlots[rangeSlots.length - 1].end + 1 : 1,
                                end: rangeSlots.length > 0 ? Math.min(rangeSlots[rangeSlots.length - 1].end + 10, qCount) : Math.min(10, qCount),
                                selected: true,
                              },
                            ])
                          }
                          className="text-blue-600 hover:scale-105 font-extrabold text-[10px] flex items-center"
                        >
                          <i className="fa-solid fa-circle-plus mr-0.5"></i> 追加
                        </button>
                      </div>
                    </div>

                    {rangeSlots.length === 0 ? (
                      <div className="text-center py-4 bg-slate-50/50 border border-dashed border-slate-200 rounded-lg text-[10px] text-slate-400 font-medium">
                         大問が未設定です。「追加」を押して新しい範囲をマップしましょう。
                      </div>
                    ) : (
                      <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 compact-scroll">
                        {rangeSlots.map((slot, idx) => (
                          <div
                            key={idx}
                            className={`flex items-center space-x-1 p-1 bg-white border rounded-lg transition-all ${slot.selected ? "border-blue-200 bg-blue-50/10" : "border-slate-100"}`}
                          >
                            <input
                              type="checkbox"
                              checked={slot.selected}
                              onChange={(e) => {
                                  const n = [...rangeSlots];
                                  n[idx].selected = e.target.checked;
                                  setRangeSlots(n);
                              }}
                              className="w-3.5 h-3.5 accent-blue-600 rounded-sm"
                            />

                            <span className="text-[9px] text-slate-400 font-bold ml-1 shrink-0">
                              大問
                            </span>
                            <input
                              type="text"
                              value={slot.group}
                              onChange={(e) => {
                                const n = [...rangeSlots];
                                n[idx].group = e.target.value;
                                setRangeSlots(n);
                              }}
                              className="bg-slate-50 border border-slate-200 rounded px-1 py-0.5 text-xs w-6 text-blue-600 font-bold text-center outline-none shrink-0"
                            />

                            <input
                              type="number"
                              value={slot.start}
                              onChange={(e) => {
                                const n = [...rangeSlots];
                                n[idx].start = parseInt(e.target.value) || 1;
                                  setRangeSlots(n);
                              }}
                              className="bg-slate-50 border border-slate-200 rounded px-1 py-0.5 text-xs w-8 text-slate-600 text-center outline-none"
                            />
                            <span className="text-slate-300 text-xs shrink-0">~</span>
                            <input
                              type="number"
                              value={slot.end}
                              onChange={(e) => {
                                const n = [...rangeSlots];
                                n[idx].end = parseInt(e.target.value) || 1;
                                setRangeSlots(n);
                              }}
                              className="bg-slate-50 border border-slate-200 rounded px-1 py-0.5 text-xs w-8 text-slate-600 text-center outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setRangeSlots(rangeSlots.filter((_, sIdx) => sIdx !== idx));
                              }}
                              className="text-slate-300 hover:text-rose-500 px-1 transition-colors text-xs shrink-0"
                            >
                              <i className="fa-solid fa-trash-can"></i>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <span className="text-[9px] text-slate-405 block leading-normal font-medium">
                      ※ 選択（チェック）した大問グループに、すぐ下のステップ③で配点や観点を一括で流し込めます。
                    </span>
                  </div>
                )}
              </div>

              {/* Step 3: 大問の詳細設定 */}
              <div 
                onClick={() => setSubStep(3)} 
                className={`p-3 rounded-xl border transition-all duration-250 cursor-pointer ${
                  (subStep === 2 || subStep === 3) 
                    ? "bg-white border-blue-500 shadow-sm ring-2 ring-blue-500/20" 
                    : "bg-slate-50 border-slate-100 hover:border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className={`w-5.5 h-5.5 rounded-full flex items-center justify-center font-bold text-xs ${(subStep === 2 || subStep === 3) ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500"}`}>
                      3
                    </div>
                    <span className="font-extrabold text-slate-700 text-xs">③ 大問の詳細設定</span>
                  </div>
                  <span className="text-[10px] bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded-md text-center">{selectedCount} 件選択中</span>
                </div>

                {(subStep === 2 || subStep === 3) && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-3 animate-[fadeIn_0.2s_ease-out]" onClick={(e) => e.stopPropagation()}>
                    {/* Points quick faders */}
                    <div className="flex flex-col space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-400">
                        配点の指定:
                      </span>
                      <div className="grid grid-cols-5 gap-1">
                        {[1, 2, 3, 4, 5].map((v) => (
                          <button
                            key={v}
                            type="button"
                            onClick={() => setActiveValue(v)}
                            className={`py-1 text-xs font-bold rounded border transition-colors ${activeValue === v ? "bg-blue-600 border-blue-600 text-white" : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"}`}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                      <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
                        <span className="text-[9px] font-bold text-slate-400">
                          任意値:
                        </span>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="配点値"
                          onChange={(e) =>
                            setActiveValue(parseFloat(e.target.value) || null)
                          }
                          className="flex-1 bg-transparent text-slate-700 text-xs font-bold text-center outline-none"
                        />
                      </div>
                    </div>

                    {/* Competency picks */}
                    <div className="flex flex-col space-y-1">
                      <span className="text-[10px] font-bold text-slate-400">
                        学習観点の選択:
                      </span>
                      <div className="grid grid-cols-1 gap-1 max-h-36 overflow-y-auto compact-scroll pr-1">
                        {(Object.keys(COMPETENCY_LABELS) as CompetencyType[]).map(
                          (k) => (
                            <button
                              key={k}
                              type="button"
                              onClick={() => setActiveComp(k)}
                              className={`py-1 text-[10px] font-medium rounded border text-left px-2 truncate transition-colors ${activeComp === k ? "bg-blue-600 border-blue-600 text-white" : "bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100"}`}
                            >
                              {COMPETENCY_LABELS[k]}
                            </button>
                          ),
                        )}
                      </div>
                    </div>

                    {/* Apply button triggers */}
                    <div className="space-y-1.5 pt-1.5">
                      <button
                        type="button"
                        disabled={selectedCount === 0 || activeValue === null}
                        onClick={() =>
                          applyValueToSelectedGroups("point", activeValue)
                        }
                        className="w-full py-1.5 font-bold rounded-lg text-xs bg-blue-600 text-white shadow-xs hover:bg-blue-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      >
                        配点の一括適用 ({selectedCount}大問)
                      </button>
                      <button
                        type="button"
                        disabled={selectedCount === 0 || activeComp === null}
                        onClick={() =>
                          applyValueToSelectedGroups("competency", activeComp)
                        }
                        className="w-full py-1.5 font-bold rounded-lg text-xs bg-blue-600 text-white shadow-xs hover:bg-blue-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      >
                        観点の一括適用 ({selectedCount}大問)
                      </button>
                    </div>

                    {selectedCount === 0 && (
                      <div className="p-2 bg-amber-50 text-amber-600 border border-amber-100 rounded-lg text-[9px] leading-relaxed">
                        ※ 大問設定(ステップ2)でチェックの入ったグループにのみ一括適用できます。
                      </div>
                    )}

                    <div className="flex space-x-2 pt-1 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setSubStep(1)}
                        className="flex-1 bg-slate-50 border border-slate-200 text-slate-500 py-1 rounded text-[10px] font-bold hover:bg-slate-100 transition-colors"
                      >
                        戻る
                      </button>
                      <button
                        type="button"
                        onClick={() => setSubStep(4)}
                        className="flex-1 bg-blue-600 text-white py-1 rounded text-[10px] font-bold shadow-xs hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1"
                      >
                        <span>模範解答へ</span>
                        <i className="fa-solid fa-arrow-right text-[10px]"></i>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Step 4: 模範解答の一括入力 */}
              <div 
                onClick={() => setSubStep(4)} 
                className={`p-3 rounded-xl border transition-all duration-250 cursor-pointer ${
                  subStep === 4 
                    ? "bg-white border-blue-500 shadow-sm ring-2 ring-blue-500/20" 
                    : "bg-slate-50 border-slate-100 hover:border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className={`w-5.5 h-5.5 rounded-full flex items-center justify-center font-bold text-xs ${subStep === 4 ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500"}`}>
                      4
                    </div>
                    <span className="font-extrabold text-slate-700 text-xs">④ 模範解答の一括入力</span>
                  </div>
                  <span className="text-[10px] bg-emerald-50 text-emerald-600 font-bold px-2 py-0.5 rounded-md text-center">一括流し込み</span>
                </div>

                {subStep === 4 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-3 animate-[fadeIn_0.2s_ease-out]" onClick={(e) => e.stopPropagation()}>
                    <span className="text-[10px] text-slate-450 font-medium block leading-normal">
                      解答記号・文字（ア, イ, A, Bなど）を並べて入力、または貼り付けてください（スペース・改行無視）:
                    </span>
                    
                    <textarea
                      value={bulkInput}
                      onChange={(e) => setBulkInput(e.target.value)}
                      placeholder="例：アイウエオ アエイウオ あいうえお"
                      rows={3}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-mono outline-none focus:bg-white focus:border-blue-500 transition-colors"
                    />

                    <button
                      type="button"
                      onClick={() => {
                        const chars = bulkInput.replace(/\s/g, "").split("");
                        setQuestions((prev) =>
                          prev.map((q, idx) => {
                            if (idx < chars.length) {
                              return { ...q, correctAnswer: chars[idx].toUpperCase() };
                            }
                            return q;
                          }),
                        );
                        // Flash updated questions
                        const updatedNums = Array.from({ length: Math.min(chars.length, questions.length) }, (_, i) => i + 1);
                        flashEffect(updatedNums);
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 rounded-lg shadow-md shadow-blue-500/10 transition-all flex items-center justify-center space-x-1.5 active:scale-98"
                    >
                      <i className="fa-solid fa-paste"></i>
                      <span>正解を一括適用する</span>
                    </button>

                    <div className="flex space-x-2 pt-1 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setSubStep(3)}
                        className="flex-1 bg-slate-50 border border-slate-200 text-slate-500 py-1 rounded text-[10px] font-bold hover:bg-slate-100 transition-colors"
                      >
                        戻る
                      </button>
                      <button
                        type="button"
                        onClick={() => setLap(3)}
                        className="flex-1 bg-emerald-600 text-white py-1 rounded text-[10px] font-extrabold shadow-xs hover:bg-emerald-700 transition-colors flex items-center justify-center space-x-0.5 animate-pulse"
                      >
                        <span>設定完了！次へ</span>
                        <i className="fa-solid fa-circle-check text-[10px]"></i>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right questions Grid list */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 compact-scroll">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {questions.map((q) => (
                  <div
                    key={q.number}
                    className={`bg-white border rounded-lg shadow-xs overflow-hidden flex flex-col hover:border-blue-300 transition-all ${flashingQs.has(q.number) ? "animate-flash" : "border-slate-200/80"}`}
                  >
                    <div className="bg-slate-50/70 p-2 flex justify-between items-center border-b border-slate-100">
                      <span className="display-font font-bold text-xs text-blue-600">
                        Q{q.number.toString().padStart(2, "0")}
                      </span>
                      <div className="flex items-center space-x-1">
                        <input
                          type="number"
                          step="0.1"
                          value={q.point}
                          onChange={(e) =>
                            updateQ(
                              q.number,
                              "point",
                              parseFloat(e.target.value) || 0,
                            )
                          }
                          className="bg-white w-8 py-0.5 rounded border border-slate-200 text-slate-700 text-center font-bold text-[10px]"
                          title="配点"
                        />
                        <span className="text-[9px] text-slate-400">点</span>
                      </div>
                    </div>
                    <div className="p-3 space-y-2.5">
                      <input
                        type="text"
                        maxLength={1}
                        id={`correct-answer-${q.number}`}
                        value={q.correctAnswer}
                        onChange={(e) => {
                          const val = e.target.value.toUpperCase();
                          updateQ(q.number, "correctAnswer", val);
                          if (val.length >= 1) {
                            // Wait a tiny bit for React state update before highlighting/focusing the next one
                            setTimeout(() => {
                              const nextInput = document.getElementById(
                                `correct-answer-${q.number + 1}`
                              ) as HTMLInputElement | null;
                              if (nextInput) {
                                nextInput.focus();
                                nextInput.select();
                              }
                            }, 30);
                          }
                        }}
                        placeholder="正解"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-center font-bold text-blue-600 outline-none text-base focus:bg-white focus:border-blue-400 transition-all focus:ring-2 focus:ring-blue-100"
                      />
                      <select
                        value={q.competency}
                        onChange={(e) =>
                          updateQ(q.number, "competency", e.target.value as any)
                        }
                        className="w-full bg-slate-50 text-[9px] p-1.5 rounded-md border border-slate-200 text-slate-600 outline-none focus:bg-white"
                      >
                        {(
                          Object.keys(COMPETENCY_LABELS) as CompetencyType[]
                        ).map((k) => (
                          <option key={k} value={k}>
                            {COMPETENCY_LABELS[k]}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {lap === 3 && (
        <div className="max-w-4xl mx-auto w-full space-y-8 flex-1 flex flex-col animate-[fadeIn_0.4s_ease-out]">
          <div className="bg-white p-8 rounded-xl border border-slate-200/80 shadow-sm flex-1 flex flex-col">
            <div className="flex items-center space-x-4 mb-6">
              <button
                onClick={() => setLap(2)}
                className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center bg-white hover:bg-slate-50 text-slate-600 transition-colors"
              >
                <i className="fa-solid fa-arrow-left"></i>
              </button>
              <h2 className="display-font text-2xl font-bold text-slate-800">
                ステップ 3: 解答データのアップロード
              </h2>
            </div>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
              採点設計シートに沿った回答マトリクスを流し込みます。テンプレートをダウンロードし、1列目に出席生徒のID（学籍番号）、2列目以降に各設問の解答記号を追記したCSVをアップロードしてください。
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-h-[220px]">
              <button
                onClick={downloadAnswersTemplate}
                className="border border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center bg-slate-50/50 hover:bg-slate-50 hover:border-slate-400 p-8 group transition-all"
              >
                <div className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <i className="fa-solid fa-file-export text-3xl text-indigo-500"></i>
                </div>
                <span className="display-font text-base font-bold text-slate-700">
                  1. 解答記入用シートをダウンロード
                </span>
                <span className="text-xs text-slate-400 mt-1.5">
                  登録済みの生徒IDが自動で入力されたCSVひな形を保存します
                </span>
              </button>

              <div className="border border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center relative bg-slate-50/50 hover:bg-slate-50 hover:border-indigo-400 p-8 group transition-all">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFinalUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />
                <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <i className="fa-solid fa-circle-check text-3xl text-emerald-500"></i>
                </div>
                <span className="display-font text-base font-bold text-slate-700">
                  2. 回答を記入したCSVを流し込む
                </span>
                <span className="text-xs text-slate-400 mt-1.5">
                  採点が終わった生徒の解答データをインポートします
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {showBulkPaste && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-lg border border-slate-200/80 animate-[scaleUp_0.3s_ease-out]">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="display-font font-bold text-slate-800 text-base">
                正解テキスト一括適用 (Bulk Text Paste)
              </h3>
              <button
                onClick={() => setShowBulkPaste(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-500 leading-normal">
                正解の選択肢記号をスペースやカンマを挟まずに入力してください。Q1から順番に適用されます。
                <br />
                <span className="font-semibold text-indigo-600">
                  入力例: AABCCDABCC...
                </span>
              </p>
              <textarea
                value={bulkInput}
                onChange={(e) => setBulkInput(e.target.value)}
                className="w-full h-32 bg-slate-50 border border-slate-200 rounded-lg p-3 text-indigo-600 font-mono text-xl outline-none focus:bg-white focus:border-indigo-400 transition-all uppercase tracking-widest leading-loose"
                placeholder="AABCCDABCC..."
              />
              <div className="flex justify-end space-x-3.5 pt-2">
                <button
                  onClick={() => setShowBulkPaste(false)}
                  className="px-5 py-2 hover:bg-slate-100 text-slate-500 text-xs font-semibold rounded-lg transition-colors"
                >
                  キャンセル
                </button>
                <button
                  onClick={() => {
                    const chars = bulkInput.replace(/\s/g, "").split("");
                    setQuestions((prev) =>
                      prev.map((q, i) => ({
                        ...q,
                        correctAnswer: chars[i]
                          ? chars[i].toUpperCase()
                          : q.correctAnswer,
                      })),
                    );
                    setShowBulkPaste(false);
                  }}
                  className="bg-indigo-600 text-white hover:bg-indigo-700 px-6 py-2 rounded-lg font-bold text-xs shadow-md shadow-indigo-600/10 transition-all"
                >
                  一括適用する
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
