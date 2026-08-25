// "use client";

// import React, { useState, useRef, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import confetti from "canvas-confetti";
// import { Mic, Square, CheckCircle2, ArrowRight, Star } from "lucide-react";
// import { VIETNAM_MANGROVE_QUEST } from "@/lib/storyData";
// import { SpeechRecorder, FluencyStats } from "@/lib/speechEngine";

// export default function StudentScreeningQuest({
//   studentName,
//   avatar,
//   classCode,
//   onExit,
// }: {
//   studentName: string;
//   avatar: string;
//   classCode: string;
//   onExit: () => void;
// }) {
//   const quest = VIETNAM_MANGROVE_QUEST;
//   const [stage, setStage] = useState<
//     "start" | "read" | "c1" | "c2" | "c3" | "c4" | "done"
//   >("start");
//   const [isRecording, setIsRecording] = useState(false);
//   const [liveTranscript, setLiveTranscript] = useState("");
//   const [metrics, setMetrics] = useState<FluencyStats>({
//     wcpm: 80,
//     accuracy: 95,
//     durationSeconds: 15,
//     transcribedText: "",
//     wordsToPractice: [],
//   });

//   const [c1Choice, setC1Choice] = useState<string | null>(null);
//   const [c1Score, setC1Score] = useState(0);
//   const [selectedCauseId, setSelectedCauseId] = useState<string | null>(null);
//   const [c2Matched, setC2Matched] = useState<Record<string, string>>({});
//   const [c2Score, setC2Score] = useState(0);
//   const [c3Choice, setC3Choice] = useState<string | null>(null);
//   const [c3Score, setC3Score] = useState(0);
//   const [c4Choice, setC4Choice] = useState<string | null>(null);
//   const [c4Score, setC4Score] = useState(0);

//   const recorderRef = useRef<SpeechRecorder | null>(null);

//   useEffect(() => {
//     recorderRef.current = new SpeechRecorder((t) => setLiveTranscript(t));
//   }, []);

//   const handleStartRec = () => {
//     setIsRecording(true);
//     recorderRef.current?.start();
//   };

//   const handleStopRec = () => {
//     setIsRecording(false);
//     const m = recorderRef.current?.stop(quest.passageText) || {
//       wcpm: 80,
//       accuracy: 95,
//       durationSeconds: 15,
//       transcribedText: quest.passageText,
//       wordsToPractice: [],
//     };
//     setMetrics(m);
//     setTimeout(() => setStage("c1"), 600);
//   };

//   const handleC2Match = (pairId: string) => {
//     if (!selectedCauseId) return;
//     const updated = { ...c2Matched, [selectedCauseId]: pairId };
//     setC2Matched(updated);
//     let total = 0;
//     quest.c2.pairs.forEach((p) => {
//       if (updated[p.id] === p.id) total += p.weight;
//     });
//     setC2Score(total);
//     setSelectedCauseId(null);
//   };

//   const handleSubmit = async () => {
//     confetti({ particleCount: 80, spread: 70 });
//     setStage("done");
//     const totalBloom = c1Score + c2Score + c3Score + c4Score;

//     await fetch("/api/evaluate", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         studentName,
//         classCode,
//         storyTitle: quest.title,
//         passageText: quest.passageText,
//         transcribedText: metrics.transcribedText,
//         wcpm: metrics.wcpm,
//         accuracy: metrics.accuracy,
//         wordsToPractice: metrics.wordsToPractice,
//         c1Score,
//         c2Score,
//         c3Score,
//         c4Score,
//         totalBloomScore: totalBloom,
//       }),
//     });
//   };

//   return (
//     <div className="w-full max-w-4xl mx-auto rounded-[32px] border-4 border-amber-200 bg-[#FFFDF7] shadow-xl p-6 min-h-[540px] flex flex-col justify-between">
//       <div className="flex items-center justify-between border-b pb-3">
//         <span className="text-xs font-black text-slate-700">
//           {avatar} {studentName}
//         </span>
//         <span className="text-xs font-bold bg-amber-100 text-amber-800 px-3 py-1 rounded-full">
//           {quest.origin}
//         </span>
//       </div>

//       <div className="flex-1 flex flex-col justify-center py-4">
//         <AnimatePresence mode="wait">
//           {stage === "start" && (
//             <motion.div
//               key="start"
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               className="text-center space-y-5"
//             >
//               <div className="text-7xl">{avatar}</div>
//               <h2 className="text-2xl font-black text-slate-800">
//                 {quest.title}
//               </h2>
//               <button
//                 onClick={() => setStage("read")}
//                 className="px-8 py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-2xl shadow-[0_4px_0_0_#C2410C]"
//               >
//                 START READING
//               </button>
//             </motion.div>
//           )}

//           {stage === "read" && (
//             <motion.div
//               key="read"
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               className="space-y-4"
//             >
//               <div className="p-6 bg-white rounded-2xl border-2 border-amber-200 text-center text-lg font-bold text-slate-800 leading-relaxed">
//                 {quest.passageText}
//               </div>
//               {liveTranscript && (
//                 <div className="p-3 bg-amber-50 rounded-xl text-xs text-amber-900 italic">
//                   Live: &quot;{liveTranscript}&quot;
//                 </div>
//               )}
//               <div className="flex justify-center">
//                 {!isRecording ? (
//                   <button
//                     onClick={handleStartRec}
//                     className="px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white font-black rounded-2xl flex items-center gap-2"
//                   >
//                     <Mic className="w-5 h-5" /> Start Recording
//                   </button>
//                 ) : (
//                   <button
//                     onClick={handleStopRec}
//                     className="px-6 py-3 bg-slate-900 text-white font-black rounded-2xl flex items-center gap-2 animate-pulse"
//                   >
//                     <Square className="w-5 h-5 text-rose-400" /> Finish Reading
//                   </button>
//                 )}
//               </div>
//             </motion.div>
//           )}

//           {stage === "c1" && (
//             <motion.div
//               key="c1"
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               className="space-y-4"
//             >
//               <span className="text-xs font-black bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
//                 Level C1: Remembering
//               </span>
//               <h3 className="font-black text-slate-800">
//                 {quest.c1.prompt}[cite: 1]
//               </h3>
//               <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
//                 {quest.c1.options.map((opt) => (
//                   <button
//                     key={opt.id}
//                     onClick={() => {
//                       setC1Choice(opt.id);
//                       setC1Score(opt.score);
//                     }}
//                     className={`p-4 rounded-2xl border-2 text-left font-bold text-xs flex flex-col justify-between h-36 ${c1Choice === opt.id ? "border-amber-500 bg-amber-50" : "bg-white border-slate-200"}`}
//                   >
//                     <span className="text-3xl">{opt.emojiFallback}</span>
//                     <span>{opt.text}</span>
//                   </button>
//                 ))}
//               </div>
//               <button
//                 disabled={!c1Choice}
//                 onClick={() => setStage("c2")}
//                 className="px-6 py-2.5 bg-orange-500 text-white font-black rounded-xl float-right disabled:opacity-40"
//               >
//                 Next Quest
//               </button>
//             </motion.div>
//           )}

//           {stage === "c2" && (
//             <motion.div
//               key="c2"
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               className="space-y-4"
//             >
//               <span className="text-xs font-black bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
//                 Level C2: Understanding[cite: 1]
//               </span>
//               <h3 className="font-black text-slate-800">
//                 Match Action with its Result:[cite: 1]
//               </h3>
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   {quest.c2.pairs.map((p) => (
//                     <button
//                       key={p.id}
//                       onClick={() => setSelectedCauseId(p.id)}
//                       className={`w-full p-3 rounded-xl border-2 text-left text-xs font-bold ${selectedCauseId === p.id ? "border-amber-500 bg-amber-50" : c2Matched[p.id] ? "border-emerald-500 bg-emerald-50" : "bg-white"}`}
//                     >
//                       {p.causeEmoji} {p.causeText}
//                     </button>
//                   ))}
//                 </div>
//                 <div className="space-y-2">
//                   {quest.c2.pairs.map((p) => (
//                     <button
//                       key={`eff_${p.id}`}
//                       disabled={!selectedCauseId}
//                       onClick={() => handleC2Match(p.id)}
//                       className="w-full p-3 rounded-xl border-2 border-dashed border-purple-300 bg-purple-50 text-left text-xs font-bold disabled:opacity-50"
//                     >
//                       {p.effectEmoji} {p.effectText}
//                     </button>
//                   ))}
//                 </div>
//               </div>
//               <button
//                 disabled={Object.keys(c2Matched).length < quest.c2.pairs.length}
//                 onClick={() => setStage("c3")}
//                 className="px-6 py-2.5 bg-orange-500 text-white font-black rounded-xl float-right disabled:opacity-40"
//               >
//                 Next Quest
//               </button>
//             </motion.div>
//           )}

//           {stage === "c3" && (
//             <motion.div
//               key="c3"
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               className="space-y-4"
//             >
//               <span className="text-xs font-black bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
//                 Level C3: Applying[cite: 1]
//               </span>
//               <h3 className="font-black text-slate-800">
//                 {quest.c3.scenario}[cite: 1]
//               </h3>
//               <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
//                 {quest.c3.options.map((opt) => (
//                   <button
//                     key={opt.id}
//                     onClick={() => {
//                       setC3Choice(opt.id);
//                       setC3Score(opt.score);
//                     }}
//                     className={`p-4 rounded-2xl border-2 text-left font-bold text-xs flex flex-col justify-between h-36 ${c3Choice === opt.id ? "border-emerald-500 bg-emerald-50" : "bg-white border-slate-200"}`}
//                   >
//                     <span className="text-3xl">{opt.emojiFallback}</span>
//                     <span>{opt.text}</span>
//                   </button>
//                 ))}
//               </div>
//               <button
//                 disabled={!c3Choice}
//                 onClick={() => setStage("c4")}
//                 className="px-6 py-2.5 bg-orange-500 text-white font-black rounded-xl float-right disabled:opacity-40"
//               >
//                 Next Quest
//               </button>
//             </motion.div>
//           )}

//           {stage === "c4" && (
//             <motion.div
//               key="c4"
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               className="space-y-4"
//             >
//               <span className="text-xs font-black bg-rose-100 text-rose-800 px-3 py-1 rounded-full">
//                 Level C4: Analysing[cite: 1]
//               </span>
//               <h3 className="font-black text-slate-800">
//                 {quest.c4.scenario}[cite: 1]
//               </h3>
//               <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
//                 {quest.c4.options.map((opt) => (
//                   <button
//                     key={opt.id}
//                     onClick={() => {
//                       setC4Choice(opt.id);
//                       setC4Score(opt.score);
//                     }}
//                     className={`p-4 rounded-2xl border-2 text-left font-bold text-xs flex flex-col justify-between h-36 ${c4Choice === opt.id ? "border-rose-500 bg-rose-50" : "bg-white border-slate-200"}`}
//                   >
//                     <span className="text-3xl">{opt.emojiFallback}</span>
//                     <span>{opt.text}</span>
//                   </button>
//                 ))}
//               </div>
//               <button
//                 disabled={!c4Choice}
//                 onClick={handleSubmit}
//                 className="px-6 py-2.5 bg-emerald-600 text-white font-black rounded-xl float-right disabled:opacity-40"
//               >
//                 Submit Screening 🏆
//               </button>
//             </motion.div>
//           )}

//           {stage === "done" && (
//             <motion.div
//               key="done"
//               initial={{ opacity: 0, scale: 0.9 }}
//               animate={{ opacity: 1, scale: 1 }}
//               className="text-center space-y-4"
//             >
//               <div className="text-6xl">🎉</div>
//               <h2 className="text-2xl font-black text-slate-800">
//                 Quest Completed!
//               </h2>
//               <div className="flex justify-center gap-4 text-left">
//                 <div className="p-4 bg-white rounded-2xl border border-amber-200">
//                   <span className="text-[10px] font-bold text-slate-400 block uppercase">
//                     Fluency
//                   </span>
//                   <span className="text-2xl font-black text-slate-800">
//                     {metrics.wcpm} WCPM
//                   </span>
//                 </div>
//                 <div className="p-4 bg-white rounded-2xl border border-amber-200">
//                   <span className="text-[10px] font-bold text-slate-400 block uppercase">
//                     Bloom Score[cite: 1]
//                   </span>
//                   <span className="text-2xl font-black text-emerald-600">
//                     {c1Score + c2Score + c3Score + c4Score}/100[cite: 1]
//                   </span>
//                 </div>
//               </div>
//               <button
//                 onClick={onExit}
//                 className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl text-xs"
//               >
//                 Pass Tablet to Friend
//               </button>
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </div>
//     </div>
//   );
// }

"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Mic, Square, CheckCircle2, ArrowRight } from "lucide-react";
import { SpeechRecorder, FluencyStats } from "@/lib/speechEngine";
import { ActivityPlan, FULL_ACTIVITY_PLAN } from "@/lib/studentProfile";
import {
  getEvidenceItems,
  getEvidenceSelectionCount,
  getPlanSteps,
} from "@/lib/questGames";

type QuestStage = "read" | "c1" | "c2" | "c3" | "c4";

export default function StudentScreeningQuest({
  quest,
  studentId,
  studentName,
  avatar,
  classCode,
  activityPlan = FULL_ACTIVITY_PLAN,
  onExit,
}: {
  quest: any;
  studentId?: string;
  studentName: string;
  avatar: string;
  classCode: string;
  activityPlan?: ActivityPlan;
  onExit: () => void;
}) {
  const [stage, setStage] = useState<
    "start" | "read" | "c1" | "c2" | "c3" | "c4" | "done"
  >("start");
  const [isRecording, setIsRecording] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [metrics, setMetrics] = useState<FluencyStats>({
    wcpm: 0,
    accuracy: 0,
    durationSeconds: 0,
    transcribedText: "",
    wordsToPractice: [],
  });

  const [c1Choice, setC1Choice] = useState<string | null>(null);
  const [c1Score, setC1Score] = useState(0);
  const [selectedCauseId, setSelectedCauseId] = useState<string | null>(null);
  const [c2Matched, setC2Matched] = useState<Record<string, string>>({});
  const [c2Score, setC2Score] = useState(0);
  const planSteps = getPlanSteps(quest.c3_data);
  const evidenceItems = getEvidenceItems(quest.c4_data, quest.passage_text);
  const evidenceSelectionCount = getEvidenceSelectionCount(
    quest.c4_data,
    evidenceItems,
  );
  const [c3Order, setC3Order] = useState<string[]>(() =>
    [...getPlanSteps(quest.c3_data)].reverse().map((step) => step.id),
  );
  const [c3Touched, setC3Touched] = useState(false);
  const [c3Score, setC3Score] = useState(0);
  const [c4Selected, setC4Selected] = useState<string[]>([]);
  const [c4Score, setC4Score] = useState(0);

  const taskStages: QuestStage[] = [
    activityPlan.oralReading ? "read" : null,
    activityPlan.c1 ? "c1" : null,
    activityPlan.c2 ? "c2" : null,
    activityPlan.c3 ? "c3" : null,
    activityPlan.c4 ? "c4" : null,
  ].filter((item): item is QuestStage => Boolean(item));
  const assignedBloomPoints =
    (activityPlan.c1 ? 15 : 0) +
    (activityPlan.c2 ? 25 : 0) +
    (activityPlan.c3 ? 30 : 0) +
    (activityPlan.c4 ? 30 : 0);

  const recorderRef = useRef<SpeechRecorder | null>(null);

  useEffect(() => {
    recorderRef.current = new SpeechRecorder((t) => setLiveTranscript(t));
  }, []);

  const handleStartRec = () => {
    setIsRecording(true);
    recorderRef.current?.start();
  };

  const handleC2Match = (pairId: string) => {
    if (!selectedCauseId) return;
    const updated = { ...c2Matched, [selectedCauseId]: pairId };
    setC2Matched(updated);
    let total = 0;
    quest.c2_data.pairs.forEach((p: any) => {
      if (updated[p.id] === p.id) total += p.weight;
    });
    setC2Score(total);
    setSelectedCauseId(null);
  };

  const movePlanStep = (stepId: string, direction: -1 | 1) => {
    const currentIndex = c3Order.indexOf(stepId);
    const targetIndex = currentIndex + direction;
    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= c3Order.length) {
      return;
    }

    const nextOrder = [...c3Order];
    [nextOrder[currentIndex], nextOrder[targetIndex]] = [
      nextOrder[targetIndex],
      nextOrder[currentIndex],
    ];
    const correctPositions = nextOrder.filter(
      (id, index) => id === planSteps[index]?.id,
    ).length;
    setC3Order(nextOrder);
    setC3Touched(true);
    setC3Score(
      Math.round((correctPositions / planSteps.length) * quest.c3_data.weight),
    );
  };

  const toggleEvidence = (evidenceId: string) => {
    const nextSelection = c4Selected.includes(evidenceId)
      ? c4Selected.filter((id) => id !== evidenceId)
      : c4Selected.length < evidenceSelectionCount
        ? [...c4Selected, evidenceId]
        : c4Selected;
    setC4Selected(nextSelection);
    setC4Score(
      Math.min(
        quest.c4_data.weight,
        nextSelection.reduce(
          (total, id) =>
            total + (evidenceItems.find((item) => item.id === id)?.score || 0),
          0,
        ),
      ),
    );
  };

  const handleSubmit = async (finalMetrics: FluencyStats = metrics) => {
    const totalBloom = c1Score + c2Score + c3Score + c4Score;

    const response = await fetch("/api/evaluate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId,
        studentName,
        classCode,
        storyTitle: quest.title,
        passageText: quest.passage_text,
        transcribedText: finalMetrics.transcribedText,
        wcpm: finalMetrics.wcpm,
        accuracy: finalMetrics.accuracy,
        wordsToPractice: finalMetrics.wordsToPractice,
        assignedActivities: activityPlan,
        c1Score,
        c2Score,
        c3Score,
        c4Score,
        totalBloomScore: totalBloom,
      }),
    });

    if (!response.ok) throw new Error("Assessment could not be saved");
    confetti({ particleCount: 80, spread: 70 });
    setStage("done");
  };

  const advanceFrom = (current: QuestStage, finalMetrics?: FluencyStats) => {
    const nextStage = taskStages[taskStages.indexOf(current) + 1];
    if (nextStage) {
      setStage(nextStage);
      return;
    }
    void handleSubmit(finalMetrics);
  };

  const handleStopRec = () => {
    setIsRecording(false);
    const nextMetrics = recorderRef.current?.stop(quest.passage_text) || {
      wcpm: 0,
      accuracy: 0,
      durationSeconds: 0,
      transcribedText: "",
      wordsToPractice: [],
    };
    setMetrics(nextMetrics);
    setTimeout(() => advanceFrom("read", nextMetrics), 600);
  };

  return (
    <div className="w-full max-w-4xl mx-auto rounded-[32px] border-4 border-amber-200 bg-[#FFFDF7] shadow-xl p-6 min-h-[540px] flex flex-col justify-between">
      <div className="flex items-center justify-between border-b pb-3">
        <span className="text-xs font-black text-slate-700">
          {avatar} {studentName}
        </span>
        <span className="text-xs font-bold bg-amber-100 text-amber-800 px-3 py-1 rounded-full">
          {quest.country_origin}
        </span>
      </div>

      {stage !== "start" && stage !== "done" && (
        <div className="mt-3 flex items-center gap-2">
          {taskStages.map((task, index) => {
            const currentIndex = taskStages.indexOf(stage as QuestStage);
            return (
              <span
                key={task}
                className={`h-2 flex-1 rounded-full ${index <= currentIndex ? "bg-orange-500" : "bg-slate-200"}`}
              />
            );
          })}
        </div>
      )}

      <div className="flex-1 flex flex-col justify-center py-4">
        <AnimatePresence mode="wait">
          {stage === "start" && (
            <motion.div
              key="start"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center space-y-5"
            >
              <div className="text-7xl">{avatar}</div>
              <h2 className="text-2xl font-black text-slate-800">
                {quest.title}
              </h2>
              <button
                onClick={() => taskStages[0] && setStage(taskStages[0])}
                disabled={taskStages.length === 0}
                className="px-8 py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-2xl shadow-[0_4px_0_0_#C2410C] cursor-pointer"
              >
                MULAI {activityPlan.oralReading ? "MEMBACA" : "PERMAINAN"}
              </button>
            </motion.div>
          )}

          {stage === "read" && (
            <motion.div
              key="read"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <div className="p-6 bg-white rounded-2xl border-2 border-amber-200 text-center text-lg font-bold text-slate-800 leading-relaxed">
                {quest.passage_text}
              </div>
              {liveTranscript && (
                <div className="p-3 bg-amber-50 rounded-xl text-xs text-amber-900 italic">
                  Terdengar: &quot;{liveTranscript}&quot;
                </div>
              )}
              <div className="flex justify-center">
                {!isRecording ? (
                  <button
                    onClick={handleStartRec}
                    className="px-6 py-3 bg-rose-500 text-white font-black rounded-2xl flex items-center gap-2 cursor-pointer"
                  >
                    <Mic className="w-5 h-5" /> Mulai Rekam Suara
                  </button>
                ) : (
                  <button
                    onClick={handleStopRec}
                    className="px-6 py-3 bg-slate-900 text-white font-black rounded-2xl flex items-center gap-2 animate-pulse cursor-pointer"
                  >
                    <Square className="w-5 h-5 text-rose-400" /> Selesai Membaca
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {stage === "c1" && (
            <motion.div
              key="c1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <span className="text-xs font-black bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                Level C1: Remembering ({quest.c1_data.weight}%)
              </span>
              <h3 className="font-black text-slate-800">
                {quest.c1_data.prompt}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {quest.c1_data.options.map((opt: any) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setC1Choice(opt.id);
                      setC1Score(opt.score);
                    }}
                    className={`p-4 rounded-2xl border-2 text-left font-bold text-xs flex flex-col justify-between h-36 cursor-pointer ${c1Choice === opt.id ? "border-amber-500 bg-amber-50" : "bg-white border-slate-200"}`}
                  >
                    <span className="text-3xl">{opt.emojiFallback}</span>
                    <span>{opt.text}</span>
                  </button>
                ))}
              </div>
              <button
                disabled={!c1Choice}
                onClick={() => advanceFrom("c1")}
                className="px-6 py-2.5 bg-orange-500 text-white font-black rounded-xl float-right disabled:opacity-40 cursor-pointer"
              >
                {taskStages.at(-1) === "c1" ? "Selesai & Kirim 🏆" : "Lanjut →"}
              </button>
            </motion.div>
          )}

          {stage === "c2" && (
            <motion.div
              key="c2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <span className="text-xs font-black bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
                Level C2: Understanding ({quest.c2_data.weight}%)
              </span>
              <h3 className="font-black text-slate-800">
                {quest.c2_data.prompt}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  {quest.c2_data.pairs.map((p: any) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedCauseId(p.id)}
                      className={`w-full p-3 rounded-xl border-2 text-left text-xs font-bold cursor-pointer ${selectedCauseId === p.id ? "border-amber-500 bg-amber-50" : c2Matched[p.id] ? "border-emerald-500 bg-emerald-50" : "bg-white"}`}
                    >
                      {p.causeEmoji} {p.causeText}
                    </button>
                  ))}
                </div>
                <div className="space-y-2">
                  {quest.c2_data.pairs.map((p: any) => (
                    <button
                      key={`eff_${p.id}`}
                      disabled={!selectedCauseId}
                      onClick={() => handleC2Match(p.id)}
                      className="w-full p-3 rounded-xl border-2 border-dashed border-purple-300 bg-purple-50 text-left text-xs font-bold disabled:opacity-50 cursor-pointer"
                    >
                      {p.effectEmoji} {p.effectText}
                    </button>
                  ))}
                </div>
              </div>
              <button
                disabled={
                  Object.keys(c2Matched).length < quest.c2_data.pairs.length
                }
                onClick={() => advanceFrom("c2")}
                className="px-6 py-2.5 bg-orange-500 text-white font-black rounded-xl float-right disabled:opacity-40 cursor-pointer"
              >
                {taskStages.at(-1) === "c2" ? "Selesai & Kirim 🏆" : "Lanjut →"}
              </button>
            </motion.div>
          )}

          {stage === "c3" && (
            <motion.div
              key="c3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <span className="text-xs font-black bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
                C3 · Plan Builder ({quest.c3_data.weight}%)
              </span>
              <h3 className="font-black text-slate-800">
                {quest.c3_data.scenario}
              </h3>
              <p className="text-xs font-semibold text-slate-500">
                Susun langkah dari pertama sampai terakhir.
              </p>
              <div className="space-y-2">
                {c3Order.map((stepId, index) => {
                  const step = planSteps.find((item) => item.id === stepId);
                  if (!step) return null;
                  return (
                    <div
                      key={step.id}
                      className="flex items-center gap-3 rounded-2xl border-2 border-emerald-200 bg-white p-3"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-black text-emerald-800">
                        {index + 1}
                      </span>
                      <span className="flex-1 text-xs font-bold leading-relaxed text-slate-800">
                        {step.text}
                      </span>
                      <div className="flex shrink-0 flex-col gap-1">
                        <button
                          type="button"
                          onClick={() => movePlanStep(step.id, -1)}
                          disabled={index === 0}
                          aria-label={`Naikkan langkah ${index + 1}`}
                          className="h-7 w-8 rounded-lg bg-slate-100 text-xs font-black text-slate-700 disabled:opacity-30"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          onClick={() => movePlanStep(step.id, 1)}
                          disabled={index === c3Order.length - 1}
                          aria-label={`Turunkan langkah ${index + 1}`}
                          className="h-7 w-8 rounded-lg bg-slate-100 text-xs font-black text-slate-700 disabled:opacity-30"
                        >
                          ↓
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <button
                disabled={!c3Touched}
                onClick={() => advanceFrom("c3")}
                className="px-6 py-2.5 bg-orange-500 text-white font-black rounded-xl float-right disabled:opacity-40 cursor-pointer"
              >
                {taskStages.at(-1) === "c3" ? "Selesai & Kirim 🏆" : "Lanjut →"}
              </button>
            </motion.div>
          )}

          {stage === "c4" && (
            <motion.div
              key="c4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <span className="text-xs font-black bg-rose-100 text-rose-800 px-3 py-1 rounded-full">
                C4 · Evidence Detective ({quest.c4_data.weight}%)
              </span>
              <div className="rounded-2xl border-2 border-rose-200 bg-rose-50 p-4">
                <span className="text-[10px] font-black uppercase text-rose-700">
                  Klaim
                </span>
                <h3 className="mt-1 font-black text-slate-800">
                  {quest.c4_data.claim || quest.c4_data.scenario}
                </h3>
              </div>
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold text-slate-600">
                  {quest.c4_data.instruction ||
                    `Pilih ${evidenceSelectionCount} kalimat yang paling mendukung klaim.`}
                </p>
                <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-[10px] font-black text-slate-600">
                  {c4Selected.length}/{evidenceSelectionCount}
                </span>
              </div>
              <div className="space-y-2">
                {evidenceItems.map((evidence, index) => (
                  <button
                    key={evidence.id}
                    type="button"
                    onClick={() => toggleEvidence(evidence.id)}
                    className={`flex w-full items-start gap-3 rounded-2xl border-2 p-3 text-left text-xs font-bold leading-relaxed ${c4Selected.includes(evidence.id) ? "border-rose-500 bg-rose-50" : "border-slate-200 bg-white"}`}
                  >
                    <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-black ${c4Selected.includes(evidence.id) ? "bg-rose-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                      {index + 1}
                    </span>
                    <span>{evidence.text}</span>
                  </button>
                ))}
              </div>
              <button
                disabled={c4Selected.length !== evidenceSelectionCount}
                onClick={() => advanceFrom("c4")}
                className="px-6 py-2.5 bg-emerald-600 text-white font-black rounded-xl float-right disabled:opacity-40 cursor-pointer"
              >
                Selesai &amp; Kirim 🏆
              </button>
            </motion.div>
          )}

          {stage === "done" && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-4"
            >
              <div className="text-6xl">🎉</div>
              <h2 className="text-2xl font-black text-slate-800">
                Skrining Berhasil!
              </h2>
              <div className="flex justify-center gap-4 text-left">
                {activityPlan.oralReading && (
                  <div className="p-4 bg-white rounded-2xl border border-amber-200">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">
                      Fluency
                    </span>
                    <span className="text-2xl font-black text-slate-800">
                      {metrics.wcpm} WCPM
                    </span>
                  </div>
                )}
                {assignedBloomPoints > 0 && (
                  <div className="p-4 bg-white rounded-2xl border border-amber-200">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">
                      Bloom Games
                    </span>
                    <span className="text-2xl font-black text-emerald-600">
                      {c1Score + c2Score + c3Score + c4Score}/{assignedBloomPoints}
                    </span>
                  </div>
                )}
              </div>
              <button
                onClick={onExit}
                className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl text-xs cursor-pointer"
              >
                Kembali ke Beranda
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
