"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Mic, Square } from "lucide-react";
import { SpeechRecorder, FluencyStats } from "@/lib/speechEngine";
import { ActivityPlan, FULL_ACTIVITY_PLAN } from "@/lib/studentProfile";
import {
  getEvidenceItems,
  getEvidenceSelectionCount,
  getPlanSteps,
} from "@/lib/questGames";
import { useLanguage } from "@/lib/i18n";

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
  const { t } = useLanguage();
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
    <div className="w-full max-w-4xl mx-auto rounded-[32px] border-4 border-amber-300 bg-[#FFFDF7] shadow-xl p-6 min-h-[540px] flex flex-col justify-between">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
          <span className="text-xl">{avatar}</span>
          <span>{studentName}</span>
        </span>
        <span className="text-xs font-black bg-amber-100 text-amber-950 px-3 py-1 rounded-full border border-amber-300">
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
                className={`h-2.5 flex-1 rounded-full ${index <= currentIndex ? "bg-orange-600" : "bg-slate-200"}`}
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
              <h2 className="text-2xl font-black text-slate-900">
                {quest.title}
              </h2>
              <button
                onClick={() => taskStages[0] && setStage(taskStages[0])}
                disabled={taskStages.length === 0}
                className="px-8 py-3.5 bg-orange-600 hover:bg-orange-700 text-white font-black rounded-2xl shadow-[0_4px_0_0_#9A3412] cursor-pointer"
              >
                {activityPlan.oralReading ? t("startReading") : t("startQuest")}
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
              <div className="p-6 bg-white rounded-3xl border-2 border-slate-300 shadow-xs text-center text-lg font-bold text-slate-900 leading-relaxed">
                {quest.passage_text}
              </div>
              {liveTranscript && (
                <div className="p-3 bg-amber-100/70 border border-amber-300 rounded-xl text-xs text-amber-950 font-bold italic">
                  {t("voiceHeard")}: &ldquo;{liveTranscript}&rdquo;
                </div>
              )}
              <div className="flex justify-center">
                {!isRecording ? (
                  <button
                    onClick={handleStartRec}
                    className="px-6 py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-2xl flex items-center gap-2 cursor-pointer shadow-sm"
                  >
                    <Mic className="w-5 h-5" /> {t("startRecording")}
                  </button>
                ) : (
                  <button
                    onClick={handleStopRec}
                    className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-2xl flex items-center gap-2 animate-pulse cursor-pointer shadow-md"
                  >
                    <Square className="w-5 h-5 text-rose-400" />{" "}
                    {t("finishReading")}
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
              <span className="text-xs font-black bg-blue-100 text-blue-950 px-3 py-1 rounded-full border border-blue-300">
                {t("c1Remembering")} ({quest.c1_data.weight}%)
              </span>
              <h3 className="font-black text-slate-900 text-base">
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
                    className={`p-4 rounded-2xl border-2 text-left text-xs font-black flex flex-col justify-between h-36 transition cursor-pointer ${
                      c1Choice === opt.id
                        ? "border-orange-600 bg-orange-50 text-slate-900 shadow-xs"
                        : "border-slate-300 bg-white text-slate-900 hover:border-slate-400"
                    }`}
                  >
                    <span className="text-3xl">{opt.emojiFallback}</span>
                    <span className="leading-snug">{opt.text}</span>
                  </button>
                ))}
              </div>
              <button
                disabled={!c1Choice}
                onClick={() => advanceFrom("c1")}
                className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-black rounded-xl float-right disabled:opacity-40 cursor-pointer shadow-xs"
              >
                {taskStages.at(-1) === "c1"
                  ? t("finishAndSubmit")
                  : t("nextBtn")}
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
              <span className="text-xs font-black bg-purple-100 text-purple-950 px-3 py-1 rounded-full border border-purple-300">
                {t("c2Understanding")} ({quest.c2_data.weight}%)
              </span>
              <h3 className="font-black text-slate-900 text-base">
                {quest.c2_data.prompt}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  {quest.c2_data.pairs.map((p: any) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedCauseId(p.id)}
                      className={`w-full p-3.5 rounded-xl border-2 text-left text-xs font-black cursor-pointer transition ${
                        selectedCauseId === p.id
                          ? "border-orange-600 bg-orange-50 text-slate-900 shadow-xs"
                          : c2Matched[p.id]
                            ? "border-emerald-600 bg-emerald-50 text-emerald-950"
                            : "border-slate-300 bg-white text-slate-900 hover:border-slate-400"
                      }`}
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
                      className="w-full p-3.5 rounded-xl border-2 border-dashed border-purple-400 bg-purple-50 hover:bg-purple-100 text-purple-950 text-left text-xs font-black disabled:opacity-50 cursor-pointer transition"
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
                className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-black rounded-xl float-right disabled:opacity-40 cursor-pointer shadow-xs"
              >
                {taskStages.at(-1) === "c2"
                  ? t("finishAndSubmit")
                  : t("nextBtn")}
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
              <span className="text-xs font-black bg-emerald-100 text-emerald-950 px-3 py-1 rounded-full border border-emerald-300">
                {t("c3PlanBuilder")} ({quest.c3_data.weight}%)
              </span>
              <h3 className="font-black text-slate-900 text-base">
                {quest.c3_data.scenario}
              </h3>
              <p className="text-xs font-bold text-slate-600">
                {t("c3Instruction")}
              </p>
              <div className="space-y-2">
                {c3Order.map((stepId, index) => {
                  const step = planSteps.find((item) => item.id === stepId);
                  if (!step) return null;
                  return (
                    <div
                      key={step.id}
                      className="flex items-center gap-3 rounded-2xl border-2 border-slate-300 bg-white p-3 shadow-xs"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 border border-emerald-300 text-sm font-black text-emerald-950">
                        {index + 1}
                      </span>
                      <span className="flex-1 text-xs font-black leading-relaxed text-slate-900">
                        {step.text}
                      </span>
                      <div className="flex shrink-0 flex-col gap-1">
                        <button
                          type="button"
                          onClick={() => movePlanStep(step.id, -1)}
                          disabled={index === 0}
                          className="h-7 w-8 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-xs font-black text-slate-900 disabled:opacity-30 cursor-pointer"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          onClick={() => movePlanStep(step.id, 1)}
                          disabled={index === c3Order.length - 1}
                          className="h-7 w-8 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-xs font-black text-slate-900 disabled:opacity-30 cursor-pointer"
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
                className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-black rounded-xl float-right disabled:opacity-40 cursor-pointer shadow-xs"
              >
                {taskStages.at(-1) === "c3"
                  ? t("finishAndSubmit")
                  : t("nextBtn")}
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
              <span className="text-xs font-black bg-rose-100 text-rose-950 px-3 py-1 rounded-full border border-rose-300">
                {t("c4EvidenceDetective")} ({quest.c4_data.weight}%)
              </span>
              <div className="rounded-2xl border-2 border-rose-300 bg-rose-50/80 p-4">
                <span className="text-xs font-black uppercase text-rose-900 block">
                  {t("storyClaim")}
                </span>
                <h3 className="mt-1 font-black text-slate-900 text-sm leading-snug">
                  {quest.c4_data.claim || quest.c4_data.scenario}
                </h3>
              </div>
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-bold text-slate-700">
                  {quest.c4_data.instruction ||
                    t("c4InstructionDefault", {
                      count: evidenceSelectionCount,
                    })}
                </p>
                <span className="shrink-0 rounded-full bg-slate-100 border border-slate-300 px-2.5 py-1 text-xs font-black text-slate-900">
                  {c4Selected.length}/{evidenceSelectionCount}{" "}
                  {t("selectedCount")}
                </span>
              </div>
              <div className="space-y-2">
                {evidenceItems.map((evidence, index) => (
                  <button
                    key={evidence.id}
                    type="button"
                    onClick={() => toggleEvidence(evidence.id)}
                    className={`flex w-full items-start gap-3 rounded-2xl border-2 p-3 text-left text-xs font-black leading-relaxed transition cursor-pointer ${
                      c4Selected.includes(evidence.id)
                        ? "border-rose-600 bg-rose-50 text-slate-900 shadow-xs"
                        : "border-slate-300 bg-white text-slate-900 hover:border-slate-400"
                    }`}
                  >
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-black ${
                        c4Selected.includes(evidence.id)
                          ? "bg-rose-600 text-white"
                          : "bg-slate-100 text-slate-800 border border-slate-300"
                      }`}
                    >
                      {index + 1}
                    </span>
                    <span>{evidence.text}</span>
                  </button>
                ))}
              </div>
              <button
                disabled={c4Selected.length !== evidenceSelectionCount}
                onClick={() => advanceFrom("c4")}
                className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black rounded-xl float-right disabled:opacity-40 cursor-pointer shadow-xs"
              >
                {t("finishAndSubmit")}
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
              <h2 className="text-2xl font-black text-slate-900">
                {t("screeningDoneTitle")}
              </h2>
              <div className="flex justify-center gap-4 text-left">
                {activityPlan.oralReading && (
                  <div className="p-4 bg-white rounded-2xl border-2 border-slate-300 shadow-xs">
                    <span className="text-[10px] font-black text-slate-600 block uppercase">
                      {t("fluencyLabel")}
                    </span>
                    <span className="text-2xl font-black text-slate-900">
                      {metrics.wcpm} WCPM
                    </span>
                  </div>
                )}
                {assignedBloomPoints > 0 && (
                  <div className="p-4 bg-white rounded-2xl border-2 border-slate-300 shadow-xs">
                    <span className="text-[10px] font-black text-slate-600 block uppercase">
                      {t("bloomGamesLabel")}
                    </span>
                    <span className="text-2xl font-black text-emerald-700">
                      {c1Score + c2Score + c3Score + c4Score}/
                      {assignedBloomPoints}
                    </span>
                  </div>
                )}
              </div>
              <button
                onClick={onExit}
                className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl text-xs cursor-pointer shadow-sm"
              >
                {t("backToHome")}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
