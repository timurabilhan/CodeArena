"use client";

import { useEffect, useRef, useState } from "react";

type Section = "practice" | "quiz" | "midterm" | "final" | "translator";
type Difficulty = "Easy" | "Medium" | "Hard";
type RunResult = {
  output: string;
  error: string;
  status: string;
  time: string | number | null;
  memory: number | null;
};
type Problem = {
  id: number;
  title: string;
  difficulty: Difficulty;
  description: string;
  input: string;
  output: string;
  exampleInput: string;
  exampleOutput: string;
  hint: string;
  starter: string;
};

const practices = [
  { id: 1, title: "C++ Basics", count: 10, icon: "💻", level: "Easy" },
  { id: 2, title: "Variables & Data Types", count: 10, icon: "🔢", level: "Easy" },
  { id: 3, title: "Bitwise Operators", count: 10, icon: "⚡", level: "Medium" },
  { id: 4, title: "Arrays", count: 15, icon: "📊", level: "Medium" },
  { id: 5, title: "2D Arrays", count: 10, icon: "🧩", level: "Medium" },
  { id: 6, title: "Strings", count: 15, icon: "🔤", level: "Medium" },
  { id: 7, title: "Functions", count: 15, icon: "⚙️", level: "Medium" },
  { id: 8, title: "STL: Vector, Set, Map", count: 15, icon: "📦", level: "Hard" },
  { id: 9, title: "Stack, Queue, Deque", count: 10, icon: "🗂️", level: "Hard" },
  { id: 10, title: "Structs & Pointers", count: 10, icon: "🔗", level: "Hard" },
] as const;

const starter = `#include <iostream>
using namespace std;

int main() {
    // Write your solution here
    return 0;
}`;

const problems: Problem[] = [
  {
    id: 1, title: "Hello, CodeArena!", difficulty: "Easy",
    description: 'Write a program that prints the exact text "Hello, CodeArena!".',
    input: "There is no input.", output: "Print the required text on one line.",
    exampleInput: "(no input)", exampleOutput: "Hello, CodeArena!",
    hint: 'Use cout and remember that spelling and punctuation matter.', starter,
  },
  {
    id: 2, title: "Sum of Two Integers", difficulty: "Easy",
    description: "Read two integers a and b. Print their sum.",
    input: "Two integers a and b (−1,000,000 ≤ a, b ≤ 1,000,000).",
    output: "Print one integer: a + b.", exampleInput: "7 5", exampleOutput: "12",
    hint: "Declare two integer variables and read them with cin.", starter,
  },
  {
    id: 3, title: "Three Numbers", difficulty: "Easy",
    description: "Read three integers and print their sum and product, separated by one space.",
    input: "Three integers a, b, c (−100 ≤ a, b, c ≤ 100).",
    output: "Print sum and product on one line.", exampleInput: "2 3 4", exampleOutput: "9 24",
    hint: "Use + for the sum and * for the product.", starter,
  },
  {
    id: 4, title: "Rectangle Perimeter", difficulty: "Easy",
    description: "Given the width and height of a rectangle, calculate its perimeter.",
    input: "Two positive integers w and h (1 ≤ w, h ≤ 10000).",
    output: "Print the perimeter as one integer.", exampleInput: "4 7", exampleOutput: "22",
    hint: "The perimeter is 2 × (width + height).", starter,
  },
  {
    id: 5, title: "Minutes to Hours", difficulty: "Easy",
    description: "Convert a non-negative number of minutes into complete hours and remaining minutes.",
    input: "One integer m (0 ≤ m ≤ 1000000).",
    output: "Print complete hours and remaining minutes, separated by a space.",
    exampleInput: "135", exampleOutput: "2 15",
    hint: "Integer division / gives complete hours; % gives the remainder.", starter,
  },
  {
    id: 6, title: "Last Digit", difficulty: "Easy",
    description: "Find the last decimal digit of a non-negative integer.",
    input: "One integer n (0 ≤ n ≤ 1000000000).",
    output: "Print the last digit.", exampleInput: "4782", exampleOutput: "2",
    hint: "Try the remainder when dividing by 10.", starter,
  },
  {
    id: 7, title: "Swap Two Numbers", difficulty: "Easy",
    description: "Read two integers a and b. Print them in reverse order.",
    input: "Two integers a and b (−100000 ≤ a, b ≤ 100000).",
    output: "Print b followed by a, separated by one space.", exampleInput: "8 13", exampleOutput: "13 8",
    hint: "You do not need to change the variables to print them in reverse order.", starter,
  },
  {
    id: 8, title: "Even or Odd", difficulty: "Easy",
    description: 'Determine whether an integer is even or odd. Print exactly "Even" or "Odd".',
    input: "One integer n (−1000000000 ≤ n ≤ 1000000000).",
    output: 'Print "Even" if n is divisible by 2, otherwise print "Odd".',
    exampleInput: "17", exampleOutput: "Odd",
    hint: "Check n % 2.", starter,
  },
  {
    id: 9, title: "Maximum of Three", difficulty: "Easy",
    description: "Read three integers and print the largest one.",
    input: "Three integers a, b and c (−100000 ≤ each ≤ 100000).",
    output: "Print the maximum value.", exampleInput: "-4 15 9", exampleOutput: "15",
    hint: "Compare the values with if statements, or use max from <algorithm>.", starter,
  },
  {
    id: 10, title: "Digit Sum", difficulty: "Medium",
    description: "A positive three-digit integer is given. Find the sum of its digits.",
    input: "One integer n (100 ≤ n ≤ 999).",
    output: "Print the sum of its three digits.", exampleInput: "583", exampleOutput: "16",
    hint: "Use / and % to extract the hundreds, tens and ones digits.", starter,
  },
];

// Simple syntax colors for the C++ editor. No extra packages required.
function highlightCpp(source: string, dark: boolean) {
  const tokenPattern = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/|^\s*#\s*include[^\n]*|^\s*#\s*define[^\n]*|"(?:\\.|[^"\\])*"|\'(?:\\.|[^\'\\])*\'|\b(?:int|long|short|double|float|char|bool|void|auto|const|unsigned|signed|return|if|else|for|while|do|break|continue|switch|case|default|class|struct|public|private|protected|using|namespace|true|false|nullptr|new|delete|static|vector|string|size_t)\b|\b\d+(?:\.\d+)?\b|\b(?:cin|cout|cerr|endl|main|std)\b)/gm;
  const parts = [];
  let position = 0;
  let match: RegExpExecArray | null;
  while ((match = tokenPattern.exec(source)) !== null) {
    if (match.index > position) parts.push(source.slice(position, match.index));
    const token = match[0];
    let color = dark ? "text-slate-200" : "text-slate-800";
    if (/^\s*#/.test(token)) color = dark ? "text-fuchsia-300" : "text-fuchsia-700";
    else if (token.startsWith("//") || token.startsWith("/*")) color = dark ? "text-slate-500" : "text-slate-500";
    else if (token.startsWith('"') || token.startsWith("'")) color = dark ? "text-amber-300" : "text-amber-700";
    else if (/^\d/.test(token)) color = dark ? "text-orange-300" : "text-orange-700";
    else if (/^(cin|cout|cerr|endl|main|std)$/.test(token)) color = dark ? "text-sky-300" : "text-blue-700";
    else color = dark ? "text-violet-300" : "text-violet-700";
    parts.push(<span key={match.index} className={color}>{token}</span>);
    position = tokenPattern.lastIndex;
  }
  if (position < source.length) parts.push(source.slice(position));
  return parts;
}

const sectionLabels: Record<Section, string> = {
  practice: "C++ Practice", quiz: "Quiz Preparation", midterm: "Midterm Preparation", final: "Final Preparation", translator: "Translator",
};

export default function Home() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [section, setSection] = useState<Section>("practice");
  const [selectedPractice, setSelectedPractice] = useState<number | null>(null);
  const [selectedProblem, setSelectedProblem] = useState<number | null>(null);
  const [drafts, setDrafts] = useState<Record<number, string>>({});
  const [showHint, setShowHint] = useState(false);
  const [notice, setNotice] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const [running, setRunning] = useState(false);
  const [runResult, setRunResult] = useState<RunResult | null>(null);
  const [runError, setRunError] = useState("");
  const [translatorInput, setTranslatorInput] = useState("");
  const [translatorOutput, setTranslatorOutput] = useState("");
  const [targetLanguage, setTargetLanguage] = useState<"ru" | "kk">("ru");
  const [translatorBusy, setTranslatorBusy] = useState(false);
  const [translatorError, setTranslatorError] = useState("");
  const highlightedCodeRef = useRef<HTMLPreElement>(null);
  const [translationTrigger, setTranslationTrigger] = useState(0);
  const translateImmediately = useRef(false);
  const [translatorCacheStatus, setTranslatorCacheStatus] = useState(false);

  useEffect(() => {
    try {
      const storedTheme = localStorage.getItem("codearena-theme");
      if (storedTheme === "light" || storedTheme === "dark") setTheme(storedTheme);
      const storedDrafts = localStorage.getItem("codearena-drafts-v1");
      if (storedDrafts) {
        const parsed: unknown = JSON.parse(storedDrafts);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          const clean: Record<number, string> = {};
          for (const [id, value] of Object.entries(parsed)) {
            if (Number.isInteger(Number(id)) && typeof value === "string") clean[Number(id)] = value;
          }
          setDrafts(clean);
        }
      }
    } catch { /* Local storage may be unavailable. */ }
  }, []);

  function switchTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    try { localStorage.setItem("codearena-theme", next); } catch { /* ignore */ }
  }

  function updateDraft(id: number, code: string) {
    const next = { ...drafts, [id]: code };
    setDrafts(next);
    try { localStorage.setItem("codearena-drafts-v1", JSON.stringify(next)); } catch { /* ignore */ }
  }

  function openSection(next: Section) {
    setSection(next);
    setSelectedPractice(null);
    setSelectedProblem(null);
    setNotice("");
    setMobileMenu(false);
  }

  function openPractice(id: number) {
    setSelectedPractice(id);
    setSelectedProblem(null);
    setNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openProblem(id: number) {
    setSelectedProblem(id);
    const problem = problems.find((item) => item.id === id);
    setCustomInput(problem?.exampleInput === "(no input)" ? "" : problem?.exampleInput ?? "");
    setRunResult(null);
    setRunError("");
    setShowHint(false);
    setNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Cache up to 60 translations on this device. Key includes source text and target language.
  // Every new input/language change cancels the previous pending or active request.
  useEffect(() => {
    if (section !== "translator") return;
    const text = translatorInput.trim();
    if (!text) {
      setTranslatorBusy(false);
      setTranslatorCacheStatus(false);
      return;
    }

    const cacheKey = JSON.stringify(["gemini-3.5-flash-lite", targetLanguage, text]);
    try {
      const raw = localStorage.getItem("codearena-translation-cache-v1");
      if (raw) {
        const entries: [string, string][] = JSON.parse(raw);
        if (Array.isArray(entries)) {
          const hit = entries.find((entry) => Array.isArray(entry) && entry[0] === cacheKey);
          if (hit && typeof hit[1] === "string") {
            setTranslatorOutput(hit[1]);
            setTranslatorBusy(false);
            setTranslatorError("");
            setTranslatorCacheStatus(true);
            return;
          }
        }
      }
    } catch { /* Browser storage might be disabled. */ }

    const immediate = translateImmediately.current;
    translateImmediately.current = false;
    const controller = new AbortController();
    let cancelled = false;
    setTranslatorCacheStatus(false);
    setTranslatorBusy(false);

    const timeout = window.setTimeout(async () => {
      if (cancelled) return;
      setTranslatorBusy(true);
      setTranslatorError("");
      try {
        const response = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, language: targetLanguage }),
          signal: controller.signal,
        });
        const data: { translation?: string; error?: string } = await response.json();
        if (!response.ok) throw new Error(data.error || `Translation failed (${response.status})`);
        if (typeof data.translation !== "string" || !data.translation.trim()) {
          throw new Error("No translation was returned.");
        }
        if (cancelled) return;
        setTranslatorOutput(data.translation);
        setTranslatorError("");
        try {
          const stored = localStorage.getItem("codearena-translation-cache-v1");
          const oldEntries: [string, string][] = stored ? JSON.parse(stored) : [];
          const clean = Array.isArray(oldEntries) ? oldEntries.filter((entry) =>
            Array.isArray(entry) && typeof entry[0] === "string" && typeof entry[1] === "string" && entry[0] !== cacheKey
          ) : [];
          clean.push([cacheKey, data.translation]);
          localStorage.setItem("codearena-translation-cache-v1", JSON.stringify(clean.slice(-60)));
        } catch { /* Cache is optional. */ }
      } catch (error) {
        if (cancelled || controller.signal.aborted) return;
        setTranslatorError(error instanceof Error ? error.message : "Translation failed.");
      } finally {
        if (!cancelled) setTranslatorBusy(false);
      }
    }, immediate ? 0 : 850);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [section, translatorInput, targetLanguage, translationTrigger]);

  function translateText() {
    if (!translatorInput.trim()) return;
    translateImmediately.current = true;
    setTranslationTrigger((value) => value + 1);
  }

  function changeTranslationLanguage(value: "ru" | "kk") {
    setTargetLanguage(value);
    setTranslatorOutput("");
    setTranslatorError("");
    setTranslatorCacheStatus(false);
  }

  async function runCode() {
    if (!activeProblem || running) return;
    setRunning(true);
    setRunResult(null);
    setRunError("");
    try {
      const response = await fetch("/api/judge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, input: customInput }),
      });
      const data: Partial<RunResult> & { error?: string } = await response.json();
      if (!response.ok) throw new Error(data.error || `Server error (${response.status})`);
      setRunResult({
        output: typeof data.output === "string" ? data.output : "",
        error: typeof data.error === "string" ? data.error : "",
        status: typeof data.status === "string" ? data.status : "Unknown",
        time: data.time ?? null,
        memory: data.memory ?? null,
      });
    } catch (error) {
      setRunError(error instanceof Error ? error.message : "Could not run code.");
    } finally {
      setRunning(false);
    }
  }

  const isDark = theme === "dark";
  const activePractice = practices.find((p) => p.id === selectedPractice);
  const activeProblem = problems.find((p) => p.id === selectedProblem);
  const code = activeProblem ? drafts[activeProblem.id] ?? activeProblem.starter : "";

  const shell = isDark ? "bg-[#080e1c] text-slate-100" : "bg-[#f3f6fc] text-slate-900";
  const sidebar = isDark ? "bg-[#0d1628] border-white/10" : "bg-white border-slate-200";
  const panel = isDark ? "bg-[#111d32] border-white/10" : "bg-white border-slate-200 shadow-sm";
  const muted = isDark ? "text-slate-400" : "text-slate-600";
  const subdued = isDark ? "text-slate-500" : "text-slate-500";
  const divider = isDark ? "border-white/10" : "border-slate-200";
  const highlight = isDark ? "bg-blue-600/20 text-blue-300" : "bg-blue-100 text-blue-800";
  const hover = isDark ? "hover:bg-white/5 hover:text-white" : "hover:bg-blue-50 hover:text-slate-900";

  const statementBox = isDark ? "bg-[#0d1729] border-white/10" : "bg-white border-slate-200";
  const infoBox = isDark ? "bg-[#0b1526] border-white/10" : "bg-[#f8fbff] border-slate-200";
  const exampleInputBox = isDark ? "bg-[#071427] text-cyan-100 border-cyan-500/20" : "bg-cyan-50 text-cyan-900 border-cyan-200";
  const exampleOutputBox = isDark ? "bg-[#101426] text-violet-100 border-violet-500/20" : "bg-violet-50 text-violet-900 border-violet-200";
  const stdinBox = isDark ? "bg-[#071427] text-cyan-100 border-cyan-500/20 placeholder:text-cyan-300/40" : "bg-cyan-50 text-cyan-900 border-cyan-200 placeholder:text-cyan-700/40";
  const stdoutBox = isDark ? "bg-[#081422] text-blue-100 border-blue-500/20" : "bg-blue-50 text-blue-900 border-blue-200";
  const errorBox = isDark ? "bg-[#1a1012] text-red-200 border-red-500/20" : "bg-red-50 text-red-900 border-red-200";
  const labelText = isDark ? "text-slate-300" : "text-slate-700";
  const helperText = isDark ? "text-slate-400" : "text-slate-500";

  const navigation = (
    <>
      <div className="mb-11 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold text-white">{"</>"}</div>
        <div>
          <h1 className="text-xl font-extrabold">CodeArena</h1>
          <p className={`text-xs ${muted}`}>Programming Practice</p>
        </div>
      </div>
      <p className={`mb-4 text-xs font-bold uppercase tracking-widest ${subdued}`}>Learning</p>
      {(
        [
          { id: "practice", icon: "💻" },
          { id: "quiz", icon: "📝" },
          { id: "midterm", icon: "📚" },
          { id: "final", icon: "🎓" },
        ] as const
      ).map((item) => (
        <button key={item.id} onClick={() => openSection(item.id)}
          className={`mb-2 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition ${section === item.id ? highlight : `${muted} ${hover}`}`}>
          <span>{item.icon}</span>{sectionLabels[item.id]}
        </button>
      ))}
      <div className={`mt-6 border-t pt-5 ${divider}`}>
        <p className={`mb-3 text-xs font-bold uppercase tracking-widest ${subdued}`}>Tools</p>
        <button onClick={() => openSection("translator")}
          className={`mb-2 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition ${section === "translator" ? highlight : `${muted} ${hover}`}`}>
          <span>🌐</span> Translator
        </button>
      </div>
      <div className={`mt-6 border-t pt-5 ${divider}`}>
        <p className={`mb-3 text-xs font-bold uppercase tracking-widest ${subdued}`}>Other projects</p>
        <a
          href="https://studyai-iota-seven.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${muted} ${hover}`}
        >
          <span>🎓</span> StudyAI <span className="ml-auto text-xs">↗</span>
        </a>
      </div>
      <div className={`mt-6 rounded-2xl border p-4 ${panel}`}>
        <p className="font-semibold">Your progress</p>
        <p className={`mt-2 text-sm ${muted}`}>0 / 120 accepted solutions</p>
        <div className={`mt-3 h-2 overflow-hidden rounded-full ${isDark ? "bg-slate-700" : "bg-slate-200"}`}>
          <div className="h-full w-0 rounded-full bg-blue-500" />
        </div>
        <p className={`mt-3 text-xs ${subdued}`}>Code execution is available locally; graded submissions are coming soon.</p>
      </div>
    </>
  );

  return (
    <main className={`min-h-screen transition-colors ${shell}`}>
      <div className="flex min-h-screen">
        <aside className={`hidden w-64 shrink-0 border-r p-6 lg:block ${sidebar}`}>{navigation}</aside>
        {mobileMenu && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button aria-label="Close menu" onClick={() => setMobileMenu(false)} className="absolute inset-0 bg-black/50" />
            <aside className={`relative h-full w-72 border-r p-6 ${sidebar}`}>
              <button onClick={() => setMobileMenu(false)} className={`absolute right-4 top-4 text-xl ${muted}`} aria-label="Close menu">×</button>
              {navigation}
            </aside>
          </div>
        )}
        <div className="min-w-0 flex-1">
          <header className={`flex flex-wrap items-center justify-between gap-4 border-b px-5 py-5 sm:px-9 ${divider}`}>
            <div className="flex items-center gap-3">
              <button aria-label="Open menu" className={`rounded-lg border px-3 py-2 lg:hidden ${divider}`} onClick={() => setMobileMenu(true)}>☰</button>
              <div>
                <p className="text-xs font-bold tracking-wide text-blue-500 sm:text-sm">CODEARENA / C++</p>
                <p className={`text-xs ${muted}`}>Improve your programming skills</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`rounded-xl border px-3 py-2 text-xs ${divider} ${muted}`}>C++17</span>
              <button onClick={switchTheme} aria-label="Toggle light and dark theme"
                className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${divider} ${hover}`}>
                {isDark ? "☀️ Light" : "🌙 Dark"}
              </button>
            </div>
          </header>

          <div className="mx-auto max-w-6xl px-5 py-8 sm:px-9 sm:py-10">
            {section === "translator" ? (
              <div className="space-y-6">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-blue-500">CODEARENA / TOOLS</p>
                  <h2 className="mt-2 text-3xl font-extrabold">🌐 Translator</h2>
                  <p className={`mt-3 ${muted}`}>Paste a programming problem or any study text. Translate it into Russian or Kazakh.</p>
                </div>
                <div className={`overflow-hidden rounded-2xl border ${panel}`}>
                  <div className={`grid border-b md:grid-cols-2 ${divider}`}>
                    <div className={`flex items-center gap-2 px-5 py-4 ${isDark ? "bg-[#101a2b]" : "bg-slate-50"}`}>
                      <span className="text-sm font-semibold">🌍 Original text</span>
                      <span className={`ml-auto text-xs ${muted}`}>Auto-detect</span>
                    </div>
                    <div className={`flex flex-wrap items-center gap-3 border-t px-5 py-3 md:border-l md:border-t-0 ${divider} ${isDark ? "bg-[#101a2b]" : "bg-slate-50"}`}>
                      <span className="text-sm font-semibold">Translation</span>
                      <select aria-label="Target language" value={targetLanguage}
                        onChange={(event) => changeTranslationLanguage(event.target.value as "ru" | "kk")}
                        className={`ml-auto rounded-xl border px-3 py-2 text-sm font-semibold outline-none focus:border-blue-500 ${isDark ? "border-white/15 bg-[#192940] text-white" : "border-slate-200 bg-white text-slate-900"}`}>
                        <option value="ru">🇷🇺 Русский</option>
                        <option value="kk">🇰🇿 Қазақша</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2">
                    <div className={`flex min-h-[320px] flex-col p-5 ${isDark ? "bg-[#0b1527]" : "bg-white"}`}>
                      <label htmlFor="translator-text" className="sr-only">Text to translate</label>
                      <textarea id="translator-text" value={translatorInput} maxLength={6000}
                        onChange={(event) => {setTranslatorInput(event.target.value); setTranslatorOutput(""); setTranslatorError(""); setTranslatorBusy(false); setTranslatorCacheStatus(false);}}
                        placeholder="Enter text or paste a problem statement..." spellCheck={false}
                        className={`min-h-[240px] w-full flex-1 resize-y bg-transparent text-base leading-7 outline-none placeholder:opacity-50 ${isDark ? "text-slate-100" : "text-slate-900"}`} />
                      <div className={`mt-3 flex items-center justify-between gap-3 border-t pt-3 ${divider}`}>
                        <span className={`text-xs ${muted}`}>{translatorInput.length} / 6000</span>
                        <button type="button" onClick={() => {setTranslatorInput("");setTranslatorOutput("");setTranslatorError("");setTranslatorBusy(false);setTranslatorCacheStatus(false);}}
                          className={`rounded-lg px-3 py-2 text-xs font-semibold ${hover}`}>Clear</button>
                      </div>
                    </div>
                    <div className={`flex min-h-[320px] flex-col border-t p-5 md:border-l md:border-t-0 ${divider} ${isDark ? "bg-[#101b30]" : "bg-[#f7f9ff]"}`}>
                      <div className={`min-h-[240px] flex-1 whitespace-pre-wrap break-words text-base leading-7 ${translatorOutput ? (isDark ? "text-slate-100" : "text-slate-900") : muted}`} role="status">
                        {translatorBusy ? "Translating..." : translatorOutput || "Your translation will appear here."}
                      </div>
                      <div className={`mt-3 flex items-center justify-end border-t pt-3 ${divider}`}>
                        <button type="button" disabled={!translatorOutput}
                          onClick={() => navigator.clipboard.writeText(translatorOutput)}
                          className={`rounded-lg px-3 py-2 text-xs font-semibold disabled:opacity-40 ${hover}`}>📋 Copy translation</button>
                      </div>
                    </div>
                  </div>
                </div>
                {translatorError && <p role="alert" className={`rounded-xl border px-4 py-3 text-sm ${isDark ? "border-red-500/30 bg-red-500/10 text-red-200" : "border-red-200 bg-red-50 text-red-800"}`}>{translatorError}</p>}
                <div className="flex flex-wrap items-center gap-4">
                  <button type="button" disabled={!translatorInput.trim() || translatorBusy} onClick={translateText}
                    className="rounded-xl bg-blue-600 px-7 py-3 font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50">
                    {translatorBusy ? "Translating..." : "🌐 Translate now"}
                  </button>
                  <span className={`text-xs ${translatorCacheStatus ? "text-emerald-500" : muted}`}>
                    {translatorCacheStatus ? "⚡ Loaded from cache" : "⚡ Auto-translate after you stop typing (0.85 s)"}
                  </span>
                </div>
                <p className={`text-xs leading-6 ${muted}`}>Translations use Gemini Flash-Lite through the CodeArena server. Repeated text is cached in this browser. Check the original for exact numbers and formulas.</p>
              </div>
            ) : section !== "practice" ? (
              <div className={`rounded-3xl border p-8 sm:p-12 ${panel}`}>
                <p className="mb-4 text-xs font-bold uppercase tracking-widest text-blue-500">Coming soon</p>
                <h2 className="text-3xl font-extrabold">{sectionLabels[section]}</h2>
                <p className={`mt-4 max-w-xl leading-7 ${muted}`}>Dedicated practice sets for this exam will be added in a later update.</p>
                <button onClick={() => openSection("practice")} className="mt-8 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-500">Back to C++ Practice</button>
              </div>
            ) : activeProblem && selectedPractice === 1 ? (
              <>
                <button onClick={() => { setSelectedProblem(null); setNotice(""); }} className="mb-6 text-sm font-semibold text-blue-500 hover:underline">← Back to Practice 1</button>
                <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-blue-500">Practice 1 · Problem {activeProblem.id}/10</p>
                    <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">{activeProblem.id}. {activeProblem.title}</h2>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${highlight}`}>{activeProblem.difficulty}</span>
                </div>
                <div className="space-y-6">
                  <div className="space-y-5">
                    <section className={`rounded-2xl border p-6 ${statementBox}`}>
                      <div className="mb-4 flex items-center gap-2"><span>📘</span><h3 className="text-lg font-bold">Problem statement</h3></div>
                      <p className={`leading-7 ${labelText}`}>{activeProblem.description}</p>
                      <div className="mt-6 grid gap-4 md:grid-cols-2">
                        <div className={`rounded-xl border p-4 ${infoBox}`}>
                          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-cyan-500">Input</p>
                          <p className={`text-sm leading-6 ${labelText}`}>{activeProblem.input}</p>
                        </div>
                        <div className={`rounded-xl border p-4 ${infoBox}`}>
                          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-violet-500">Output</p>
                          <p className={`text-sm leading-6 ${labelText}`}>{activeProblem.output}</p>
                        </div>
                      </div>
                    </section>
                    <section className={`rounded-2xl border p-6 ${statementBox}`}>
                      <div className="mb-4 flex items-center gap-2"><span>🧪</span><h3 className="text-lg font-bold">Example</h3></div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-cyan-500">Example input</p>
                          <pre className={`overflow-x-auto rounded-xl border p-4 font-mono text-sm ${exampleInputBox}`}>{activeProblem.exampleInput}</pre>
                        </div>
                        <div>
                          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-violet-500">Example output</p>
                          <pre className={`overflow-x-auto rounded-xl border p-4 font-mono text-sm ${exampleOutputBox}`}>{activeProblem.exampleOutput}</pre>
                        </div>
                      </div>
                    </section>
                    <section className={`rounded-2xl border p-5 ${statementBox}`}>
                      <button onClick={() => setShowHint((previous) => !previous)} className="text-sm font-semibold text-amber-500 hover:underline">
                        {showHint ? "Hide hint ↑" : "💡 Show hint ↓"}
                      </button>
                      {showHint && <div className={`mt-4 rounded-xl border p-4 ${isDark ? "border-amber-500/20 bg-amber-500/10" : "border-amber-200 bg-amber-50"}`}><p className={`text-sm leading-6 ${labelText}`}>{activeProblem.hint}</p></div>}
                    </section>
                  </div>
                  <section className={`h-fit rounded-2xl border p-5 sm:p-6 ${panel}`}>
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-bold">Code editor</h3>
                        <p className={`mt-1 text-xs ${muted}`}>C++17 · drafts save in this browser</p>
                      </div>
                      <button onClick={() => activeProblem && updateDraft(activeProblem.id, starter)} className={`rounded-lg border px-3 py-2 text-xs ${divider} ${hover}`}>Reset</button>
                    </div>
                    <div className={`mb-3 rounded-xl border px-4 py-3 ${isDark ? "border-emerald-500/20 bg-emerald-500/5" : "border-emerald-200 bg-emerald-50"}`}>
                      <p className="text-xs font-bold uppercase tracking-wider text-emerald-500">Your C++ code</p>
                    </div>
                    <label htmlFor="cpp-code" className="sr-only">Your C++ code</label>
                    <div className={`relative min-h-[440px] overflow-hidden rounded-xl border ${isDark ? "border-white/10 bg-[#06101f]" : "border-slate-200 bg-[#f7fbff]"}`}>
                      <pre
                        ref={highlightedCodeRef}
                        aria-hidden="true"
                        className={`pointer-events-none absolute inset-0 overflow-hidden whitespace-pre p-4 font-mono text-[13px] leading-6 ${isDark ? "text-slate-200" : "text-slate-800"}`}
                      >{highlightCpp(code + (code.endsWith("\n") ? " " : ""), isDark)}</pre>
                      <textarea
                        id="cpp-code"
                        wrap="off"
                        spellCheck={false}
                        autoCapitalize="off"
                        autoCorrect="off"
                        value={code}
                        onChange={(event) => updateDraft(activeProblem.id, event.target.value)}
                        onScroll={(event) => {
                          if (highlightedCodeRef.current) {
                            highlightedCodeRef.current.scrollTop = event.currentTarget.scrollTop;
                            highlightedCodeRef.current.scrollLeft = event.currentTarget.scrollLeft;
                          }
                        }}
                        className={`relative min-h-[440px] w-full resize-y overflow-auto whitespace-pre bg-transparent p-4 font-mono text-[13px] leading-6 text-transparent outline-none selection:bg-blue-500/30 ${isDark ? "caret-white" : "caret-slate-900"}`}
                        style={{ WebkitTextFillColor: "transparent" }}
                      />
                    </div>
                    <div className="mt-5">
                      <div className={`mb-3 rounded-xl border px-4 py-3 ${isDark ? "border-cyan-500/20 bg-cyan-500/5" : "border-cyan-200 bg-cyan-50"}`}>
                        <label htmlFor="cpp-input" className="block text-xs font-bold uppercase tracking-wider text-cyan-500">Standard input (stdin)</label>
                        <p className={`mt-1 text-xs ${helperText}`}>Enter the input that your program should read.</p>
                      </div>
                      <textarea
                        id="cpp-input"
                        value={customInput}
                        onChange={(event) => setCustomInput(event.target.value)}
                        placeholder="Enter the input for your program (leave blank if none)"
                        spellCheck={false}
                        className={`min-h-[100px] w-full resize-y rounded-xl border p-4 font-mono text-sm outline-none focus:border-cyan-500 ${stdinBox}`}
                      />
                      <button
                        type="button"
                        onClick={() => setCustomInput(activeProblem.exampleInput === "(no input)" ? "" : activeProblem.exampleInput)}
                        className="mt-2 text-xs font-semibold text-cyan-500 hover:underline"
                      >
                        Use example input
                      </button>
                    </div>
                    <div className="mt-5 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        disabled={running || !code.trim()}
                        onClick={() => void runCode()}
                        className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {running ? "Running..." : "▶ Run Code"}
                      </button>
                      <span className={`text-xs ${muted}`}>Run with custom input · C++ (GCC 9.2)</span>
                    </div>
                    {runError && (
                      <p role="alert" className={`mt-4 rounded-xl border p-4 text-sm ${isDark ? "border-red-500/30 bg-red-500/10 text-red-200" : "border-red-200 bg-red-50 text-red-800"}`}>
                        {runError}
                      </p>
                    )}
                    {runResult && (
                      <div className={`mt-5 space-y-4 rounded-xl border p-5 ${isDark ? "border-white/10 bg-[#0b1529]" : "border-slate-200 bg-slate-50"}`} role="status">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h4 className="font-bold">Execution result</h4>
                          <span className={`rounded-lg px-3 py-1 text-xs font-semibold ${runResult.status === "Accepted" ? (isDark ? "bg-emerald-500/15 text-emerald-300" : "bg-emerald-100 text-emerald-800") : (isDark ? "bg-amber-500/15 text-amber-300" : "bg-amber-100 text-amber-800")}`}>
                            {runResult.status === "Accepted" ? "Run completed" : runResult.status}
                          </span>
                        </div>
                        <div>
                          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-blue-500">Program output (stdout)</p>
                          <pre className={`min-h-[55px] overflow-x-auto whitespace-pre-wrap break-words rounded-lg border p-4 font-mono text-sm ${stdoutBox}`}>{runResult.output || "(no output)"}</pre>
                        </div>
                        {runResult.error && (
                          <div>
                            <p className="mb-2 text-xs font-bold uppercase text-red-500">Error / compiler output</p>
                            <pre className={`overflow-x-auto whitespace-pre-wrap break-words rounded-lg border p-4 font-mono text-sm ${errorBox}`}>{runResult.error}</pre>
                          </div>
                        )}
                        <p className={`text-xs ${muted}`}>
                          {runResult.time !== null ? `Time: ${runResult.time} s` : ""}
                          {runResult.memory !== null ? ` · Memory: ${runResult.memory} KB` : ""}
                        </p>
                      </div>
                    )}
                    <p className={`mt-5 text-xs leading-5 ${subdued}`}>
                      Run Code compiles and executes your C++ program with the input above.
                      A successful run does not mean the answer passed the problem tests.
                      Verified Submit and saved progress will be added separately.
                    </p>
                  </section>
                </div>
                <div className="mt-8 flex flex-wrap justify-between gap-3">
                  <button disabled={activeProblem.id === 1} onClick={() => openProblem(activeProblem.id - 1)} className={`rounded-xl border px-5 py-3 text-sm font-semibold disabled:opacity-40 ${divider}`}>← Previous</button>
                  <button disabled={activeProblem.id === 10} onClick={() => openProblem(activeProblem.id + 1)} className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-40">Next problem →</button>
                </div>
              </>
            ) : activePractice ? (
              <>
                <button onClick={() => { setSelectedPractice(null); setSelectedProblem(null); }} className="mb-6 text-sm font-semibold text-blue-500 hover:underline">← Back to practices</button>
                <div className={`rounded-3xl border p-7 sm:p-9 ${panel}`}>
                  <p className="text-xs font-bold uppercase tracking-widest text-blue-500">C++ practice</p>
                  <h2 className="mt-3 text-2xl font-extrabold sm:text-3xl">Practice {activePractice.id}: {activePractice.title}</h2>
                  <p className={`mt-3 ${muted}`}>{activePractice.count} programming problems</p>
                </div>
                {activePractice.id === 1 ? (
                  <div className="mt-6 space-y-3">
                    {problems.map((problem) => (
                      <button key={problem.id} onClick={() => openProblem(problem.id)} className={`flex w-full items-center gap-4 rounded-2xl border p-5 text-left transition hover:border-blue-500/60 ${panel}`}>
                        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${highlight}`}>{String(problem.id).padStart(2, "0")}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-bold">{problem.title}</span>
                          <span className={`mt-1 block text-xs ${muted}`}>{problem.difficulty} · {drafts[problem.id] ? "Draft saved" : "Not started"}</span>
                        </span>
                        <span className="shrink-0 text-blue-500">Open →</span>
                      </button>
                    ))}
                    <p className={`pt-3 text-xs ${muted}`}>These are original CodeArena practice tasks, not copied from KBTU Ejudge.</p>
                  </div>
                ) : (
                  <div className={`mt-6 rounded-2xl border p-8 ${panel}`}>
                    <p className={muted}>Problems for this practice will be added next. Practice 1 is available now.</p>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className={`mb-9 rounded-3xl border p-8 sm:p-12 ${isDark ? "border-blue-500/20 bg-gradient-to-r from-[#192f60] to-[#141c35]" : "border-blue-200 bg-gradient-to-r from-blue-100 to-white"}`}>
                  <span className={`rounded-full px-4 py-2 text-xs font-semibold ${highlight}`}>C++ Learning Platform</span>
                  <h2 className="mt-6 text-3xl font-extrabold tracking-tight sm:text-5xl">Practice. Code. Improve.</h2>
                  <p className={`mt-5 max-w-2xl leading-7 ${muted}`}>Learn C++ by solving programming problems. Start with basics, practice regularly, and build confidence step by step.</p>
                  <button onClick={() => openPractice(1)} className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-500">Start Practice 1 →</button>
                </div>
                <div className="mb-6 flex items-center justify-between gap-3">
                  <h2 className="text-2xl font-bold">C++ Practices</h2>
                  <span className={`text-sm ${muted}`}>10 practices · 120 planned problems</span>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {practices.map((practice) => (
                    <button key={practice.id} onClick={() => openPractice(practice.id)} className={`group rounded-2xl border p-6 text-left transition hover:-translate-y-0.5 hover:border-blue-500/60 ${panel}`}>
                      <div className="flex items-center justify-between">
                        <span className="text-3xl">{practice.icon}</span>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isDark ? "bg-white/5 text-slate-400" : "bg-slate-100 text-slate-600"}`}>{practice.level}</span>
                      </div>
                      <h3 className="mt-5 text-lg font-bold">Practice {practice.id}: {practice.title}</h3>
                      <p className={`mt-2 text-sm ${muted}`}>{practice.count} planned problems</p>
                      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm">
                        <span className={subdued}>{practice.id === 1 ? "10 available" : "Coming soon"}</span>
                        <span className="font-semibold text-blue-500 group-hover:underline">Open practice →</span>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
