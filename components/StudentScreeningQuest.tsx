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

export default function StudentScreeningQuest({
  quest,
  studentName,
  avatar,
  classCode,
  onExit,
}: {
  quest: any;
  studentName: string;
  avatar: string;
  classCode: string;
  onExit: () => void;
}) {
  const [stage, setStage] = useState<
    "start" | "read" | "c1" | "c2" | "c3" | "c4" | "done"
  >("start");
  const [isRecording, setIsRecording] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [metrics, setMetrics] = useState<FluencyStats>({
    wcpm: 75,
    accuracy: 90,
    durationSeconds: 15,
    transcribedText: "",
    wordsToPractice: [],
  });

  const [c1Choice, setC1Choice] = useState<string | null>(null);
  const [c1Score, setC1Score] = useState(0);
  const [selectedCauseId, setSelectedCauseId] = useState<string | null>(null);
  const [c2Matched, setC2Matched] = useState<Record<string, string>>({});
  const [c2Score, setC2Score] = useState(0);
  const [c3Choice, setC3Choice] = useState<string | null>(null);
  const [c3Score, setC3Score] = useState(0);
  const [c4Choice, setC4Choice] = useState<string | null>(null);
  const [c4Score, setC4Score] = useState(0);

  const recorderRef = useRef<SpeechRecorder | null>(null);

  useEffect(() => {
    recorderRef.current = new SpeechRecorder((t) => setLiveTranscript(t));
  }, []);

  const handleStartRec = () => {
    setIsRecording(true);
    recorderRef.current?.start();
  };

  const handleStopRec = () => {
    setIsRecording(false);
    const m = recorderRef.current?.stop(quest.passage_text) || {
      wcpm: 75,
      accuracy: 90,
      durationSeconds: 15,
      transcribedText: quest.passage_text,
      wordsToPractice: [],
    };
    setMetrics(m);
    setTimeout(() => setStage("c1"), 600);
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

  const handleSubmit = async () => {
    confetti({ particleCount: 80, spread: 70 });
    setStage("done");
    const totalBloom = c1Score + c2Score + c3Score + c4Score;

    await fetch("/api/evaluate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentName,
        classCode,
        storyTitle: quest.title,
        passageText: quest.passage_text,
        transcribedText: metrics.transcribedText,
        wcpm: metrics.wcpm,
        accuracy: metrics.accuracy,
        wordsToPractice: metrics.wordsToPractice,
        c1Score,
        c2Score,
        c3Score,
        c4Score,
        totalBloomScore: totalBloom,
      }),
    });
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
                onClick={() => setStage("read")}
                className="px-8 py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-2xl shadow-[0_4px_0_0_#C2410C] cursor-pointer"
              >
                MULAI MEMBACA
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
                onClick={() => setStage("c2")}
                className="px-6 py-2.5 bg-orange-500 text-white font-black rounded-xl float-right disabled:opacity-40 cursor-pointer"
              >
                Lanjut &rarr;
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
                onClick={() => setStage("c3")}
                className="px-6 py-2.5 bg-orange-500 text-white font-black rounded-xl float-right disabled:opacity-40 cursor-pointer"
              >
                Lanjut &rarr;
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
                Level C3: Applying ({quest.c3_data.weight}%)
              </span>
              <h3 className="font-black text-slate-800">
                {quest.c3_data.scenario}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {quest.c3_data.options.map((opt: any) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setC3Choice(opt.id);
                      setC3Score(opt.score);
                    }}
                    className={`p-4 rounded-2xl border-2 text-left font-bold text-xs flex flex-col justify-between h-36 cursor-pointer ${c3Choice === opt.id ? "border-emerald-500 bg-emerald-50" : "bg-white border-slate-200"}`}
                  >
                    <span className="text-3xl">{opt.emojiFallback}</span>
                    <span>{opt.text}</span>
                  </button>
                ))}
              </div>
              <button
                disabled={!c3Choice}
                onClick={() => setStage("c4")}
                className="px-6 py-2.5 bg-orange-500 text-white font-black rounded-xl float-right disabled:opacity-40 cursor-pointer"
              >
                Lanjut &rarr;
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
                Level C4: Analysing ({quest.c4_data.weight}%)
              </span>
              <h3 className="font-black text-slate-800">
                {quest.c4_data.scenario}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {quest.c4_data.options.map((opt: any) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setC4Choice(opt.id);
                      setC4Score(opt.score);
                    }}
                    className={`p-4 rounded-2xl border-2 text-left font-bold text-xs flex flex-col justify-between h-36 cursor-pointer ${c4Choice === opt.id ? "border-rose-500 bg-rose-50" : "bg-white border-slate-200"}`}
                  >
                    <span className="text-3xl">{opt.emojiFallback}</span>
                    <span>{opt.text}</span>
                  </button>
                ))}
              </div>
              <button
                disabled={!c4Choice}
                onClick={handleSubmit}
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
                <div className="p-4 bg-white rounded-2xl border border-amber-200">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">
                    Fluency
                  </span>
                  <span className="text-2xl font-black text-slate-800">
                    {metrics.wcpm} WCPM
                  </span>
                </div>
                <div className="p-4 bg-white rounded-2xl border border-amber-200">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">
                    Bloom HOTS
                  </span>
                  <span className="text-2xl font-black text-emerald-600">
                    {c1Score + c2Score + c3Score + c4Score}/100
                  </span>
                </div>
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
