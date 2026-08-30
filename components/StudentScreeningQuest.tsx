"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Mic, Square, BookOpen, RotateCcw, ArrowRight } from "lucide-react";
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
  const [showStorySheet, setShowStorySheet] = useState(false);
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
    recorderRef.current = new SpeechRecorder((transcript) => {
      setLiveTranscript(transcript);
    });
  }, []);

  const handleStartRec = () => {
    setIsRecording(true);
    setLiveTranscript("");
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
    const metricsToUse = finalMetrics || metrics;
    if (nextStage) {
      setStage(nextStage);
      setShowStorySheet(false);
      return;
    }
    void handleSubmit(metricsToUse);
  };

  const goBackFrom = (current: QuestStage) => {
    const prevIndex = taskStages.indexOf(current) - 1;
    if (prevIndex >= 0) {
      setStage(taskStages[prevIndex]);
      setShowStorySheet(false);
    } else {
      setStage("start");
    }
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
    setLiveTranscript(nextMetrics.transcribedText || "");
    setTimeout(() => advanceFrom("read", nextMetrics), 600);
  };

  const isQuizStage =
    stage === "c1" || stage === "c2" || stage === "c3" || stage === "c4";

  // Cek apakah suara sudah pernah direkam sebelumnya
  const hasRecordedAudio = Boolean(
    metrics.wcpm > 0 || metrics.transcribedText || liveTranscript,
  );

  return (
    <div className="w-full max-w-4xl mx-auto rounded-[28px] sm:rounded-[36px] border-2 sm:border-4 border-amber-300 bg-[#FFFDF7] shadow-xl p-4 sm:p-6 min-h-[500px] flex flex-col justify-between">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3 gap-2">
        <span className="text-xs font-black text-slate-900 flex items-center gap-1.5 truncate">
          <span className="text-lg sm:text-xl">{avatar}</span>
          <span className="truncate">{studentName}</span>
        </span>

        <div className="flex items-center gap-2 shrink-0">
          {isQuizStage && (
            <button
              type="button"
              onClick={() => setShowStorySheet(!showStorySheet)}
              className="text-[11px] font-black bg-amber-100 hover:bg-amber-200 text-amber-950 px-2.5 py-1 rounded-xl border border-amber-300 flex items-center gap-1 transition cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{showStorySheet ? t("hideStory") : t("viewStory")}</span>
            </button>
          )}

          <span className="text-[11px] sm:text-xs font-black bg-amber-100 text-amber-950 px-2.5 py-1 rounded-full border border-amber-300">
            {quest.country_origin}
          </span>
        </div>
      </div>

      {/* Progress Indicator */}
      {stage !== "start" && stage !== "done" && (
        <div className="mt-3 flex items-center gap-1.5 sm:gap-2">
          {taskStages.map((task, index) => {
            const currentIndex = taskStages.indexOf(stage as QuestStage);
            return (
              <span
                key={task}
                className={`h-2 sm:h-2.5 flex-1 rounded-full transition-all ${
                  index <= currentIndex ? "bg-orange-600" : "bg-slate-200"
                }`}
              />
            );
          })}
        </div>
      )}

      {/* Collapsible Story Reference Accordion */}
      {isQuizStage && showStorySheet && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="my-3 p-4 bg-amber-50 rounded-2xl border-2 border-amber-300 text-xs sm:text-sm font-semibold text-slate-900 leading-relaxed max-h-48 overflow-y-auto shadow-inner"
        >
          <div className="flex items-center justify-between pb-1 mb-1 border-b border-amber-200">
            <span className="font-black text-[10px] text-amber-900 uppercase">
              {t("storyReference")}
            </span>
            <span className="font-black text-xs text-slate-800">
              {quest.title}
            </span>
          </div>
          <p>{quest.passage_text}</p>
        </motion.div>
      )}

      {/* Stage Body */}
      <div className="flex-1 flex flex-col justify-center py-4">
        <AnimatePresence mode="wait">
          {/* START */}
          {stage === "start" && (
            <motion.div
              key="start"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-5"
            >
              <div className="text-6xl sm:text-7xl">{avatar}</div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 px-2">
                {quest.title}
              </h2>
              <button
                onClick={() => taskStages[0] && setStage(taskStages[0])}
                disabled={taskStages.length === 0}
                className="w-full sm:w-auto px-8 py-3.5 bg-orange-600 hover:bg-orange-700 text-white font-black rounded-2xl shadow-[0_4px_0_0_#9A3412] cursor-pointer text-sm sm:text-base transition"
              >
                {activityPlan.oralReading ? t("startReading") : t("startQuest")}
              </button>
            </motion.div>
          )}

          {/* READ */}
          {stage === "read" && (
            <motion.div
              key="read"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="p-4 sm:p-6 bg-white rounded-2xl sm:rounded-3xl border-2 border-slate-300 shadow-xs text-center text-base sm:text-lg font-bold text-slate-900 leading-relaxed max-h-64 overflow-y-auto">
                {quest.passage_text}
              </div>

              {/* Tampilan Status Rekaman */}
              {isRecording ? (
                liveTranscript && (
                  <div className="p-3 bg-amber-100/70 border border-amber-300 rounded-xl text-xs text-amber-950 font-bold italic">
                    {t("voiceHeard")}: &ldquo;{liveTranscript}&rdquo;
                  </div>
                )
              ) : hasRecordedAudio ? (
                <div className="p-3.5 bg-emerald-50 border-2 border-emerald-300 rounded-2xl text-xs text-emerald-950 font-bold space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-black uppercase text-[10px] text-emerald-800 bg-emerald-200/60 px-2 py-0.5 rounded-full">
                      {t("recordedSuccess")}
                    </span>
                    {metrics.wcpm > 0 && (
                      <span className="font-mono text-emerald-900">
                        {metrics.wcpm} WCPM • {t("accuracy")}:{" "}
                        {metrics.accuracy}%
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] font-semibold text-slate-700 italic pt-0.5 line-clamp-3">
                    &ldquo;{metrics.transcribedText || liveTranscript}&rdquo;
                  </p>
                </div>
              ) : null}

              {/* Action Buttons Navigasi */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 w-full">
                <button
                  type="button"
                  onClick={() => goBackFrom("read")}
                  className="w-full sm:w-auto px-5 py-3.5 rounded-2xl border-2 border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black transition cursor-pointer"
                >
                  {t("prevBtn")}
                </button>

                {!isRecording ? (
                  hasRecordedAudio ? (
                    <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={handleStartRec}
                        className="w-full sm:w-auto px-5 py-3.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border-2 border-rose-300 font-black rounded-2xl flex items-center justify-center gap-2 cursor-pointer text-xs sm:text-sm transition"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>{t("reRecord")}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => advanceFrom("read")}
                        className="w-full sm:w-auto px-7 py-3.5 bg-orange-600 hover:bg-orange-700 text-white font-black rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_0_0_#9A3412] text-xs sm:text-sm transition"
                      >
                        <span>{t("nextBtn")}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleStartRec}
                      className="w-full sm:w-auto px-8 py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-sm text-xs sm:text-sm transition"
                    >
                      <Mic className="w-5 h-5" />
                      <span>{t("startRecording")}</span>
                    </button>
                  )
                ) : (
                  <button
                    type="button"
                    onClick={handleStopRec}
                    className="w-full sm:w-auto px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-2xl flex items-center justify-center gap-2 animate-pulse cursor-pointer shadow-md text-xs sm:text-sm"
                  >
                    <Square className="w-5 h-5 text-rose-400" />
                    <span>{t("finishReading")}</span>
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* C1 */}
          {stage === "c1" && (
            <motion.div
              key="c1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <span className="text-xs font-black bg-blue-100 text-blue-950 px-3 py-1 rounded-full border border-blue-300 inline-block">
                {t("c1Remembering")} ({quest.c1_data.weight}%)
              </span>
              <h3 className="font-black text-slate-900 text-sm sm:text-base leading-snug">
                {quest.c1_data.prompt}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                {quest.c1_data.options.map((opt: any) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setC1Choice(opt.id);
                      setC1Score(opt.score);
                    }}
                    className={`p-3.5 sm:p-4 rounded-2xl border-2 text-left text-xs font-black flex sm:flex-col justify-between items-center sm:items-start min-h-[70px] sm:min-h-[130px] transition cursor-pointer ${
                      c1Choice === opt.id
                        ? "border-orange-600 bg-orange-50 text-slate-900 shadow-xs"
                        : "border-slate-300 bg-white text-slate-900 hover:border-slate-400"
                    }`}
                  >
                    <span className="text-2xl sm:text-3xl shrink-0 mr-2 sm:mr-0">
                      {opt.emojiFallback}
                    </span>
                    <span className="leading-snug flex-1">{opt.text}</span>
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => goBackFrom("c1")}
                  className="px-4 py-2.5 rounded-xl border-2 border-slate-300 bg-slate-100 text-slate-800 text-xs font-black hover:bg-slate-200 transition"
                >
                  {t("prevBtn")}
                </button>
                <button
                  disabled={!c1Choice}
                  onClick={() => advanceFrom("c1")}
                  className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-black rounded-xl disabled:opacity-40 cursor-pointer shadow-xs text-xs sm:text-sm"
                >
                  {taskStages.at(-1) === "c1"
                    ? t("finishAndSubmit")
                    : t("nextBtn")}
                </button>
              </div>
            </motion.div>
          )}

          {/* C2 */}
          {stage === "c2" && (
            <motion.div
              key="c2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <span className="text-xs font-black bg-purple-100 text-purple-950 px-3 py-1 rounded-full border border-purple-300 inline-block">
                {t("c2Understanding")} ({quest.c2_data.weight}%)
              </span>
              <h3 className="font-black text-slate-900 text-sm sm:text-base leading-snug">
                {quest.c2_data.prompt}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase text-slate-500 block">
                    Sebab (Cause):
                  </span>
                  {quest.c2_data.pairs.map((p: any) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedCauseId(p.id)}
                      className={`w-full p-3 rounded-xl border-2 text-left text-xs font-black cursor-pointer transition ${
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
                  <span className="text-[10px] font-black uppercase text-purple-700 block">
                    Akibat (Effect):
                  </span>
                  {quest.c2_data.pairs.map((p: any) => (
                    <button
                      key={`eff_${p.id}`}
                      disabled={!selectedCauseId}
                      onClick={() => handleC2Match(p.id)}
                      className="w-full p-3 rounded-xl border-2 border-dashed border-purple-400 bg-purple-50 hover:bg-purple-100 text-purple-950 text-left text-xs font-black disabled:opacity-50 cursor-pointer transition"
                    >
                      {p.effectEmoji} {p.effectText}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => goBackFrom("c2")}
                  className="px-4 py-2.5 rounded-xl border-2 border-slate-300 bg-slate-100 text-slate-800 text-xs font-black hover:bg-slate-200 transition"
                >
                  {t("prevBtn")}
                </button>
                <button
                  disabled={
                    Object.keys(c2Matched).length < quest.c2_data.pairs.length
                  }
                  onClick={() => advanceFrom("c2")}
                  className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-black rounded-xl disabled:opacity-40 cursor-pointer shadow-xs text-xs sm:text-sm"
                >
                  {taskStages.at(-1) === "c2"
                    ? t("finishAndSubmit")
                    : t("nextBtn")}
                </button>
              </div>
            </motion.div>
          )}

          {/* C3 */}
          {stage === "c3" && (
            <motion.div
              key="c3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <span className="text-xs font-black bg-emerald-100 text-emerald-950 px-3 py-1 rounded-full border border-emerald-300 inline-block">
                {t("c3PlanBuilder")} ({quest.c3_data.weight}%)
              </span>
              <h3 className="font-black text-slate-900 text-sm sm:text-base leading-snug">
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
                      className="flex items-center gap-2.5 sm:gap-3 rounded-2xl border-2 border-slate-300 bg-white p-2.5 sm:p-3 shadow-xs"
                    >
                      <span className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 border border-emerald-300 text-xs sm:text-sm font-black text-emerald-950">
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
                          className="h-6 w-7 sm:h-7 sm:w-8 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-xs font-black text-slate-900 disabled:opacity-30 cursor-pointer"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          onClick={() => movePlanStep(step.id, 1)}
                          disabled={index === c3Order.length - 1}
                          className="h-6 w-7 sm:h-7 sm:w-8 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-xs font-black text-slate-900 disabled:opacity-30 cursor-pointer"
                        >
                          ↓
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => goBackFrom("c3")}
                  className="px-4 py-2.5 rounded-xl border-2 border-slate-300 bg-slate-100 text-slate-800 text-xs font-black hover:bg-slate-200 transition"
                >
                  {t("prevBtn")}
                </button>
                <button
                  disabled={!c3Touched}
                  onClick={() => advanceFrom("c3")}
                  className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-black rounded-xl disabled:opacity-40 cursor-pointer shadow-xs text-xs sm:text-sm"
                >
                  {taskStages.at(-1) === "c3"
                    ? t("finishAndSubmit")
                    : t("nextBtn")}
                </button>
              </div>
            </motion.div>
          )}

          {/* C4 */}
          {stage === "c4" && (
            <motion.div
              key="c4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <span className="text-xs font-black bg-rose-100 text-rose-950 px-3 py-1 rounded-full border border-rose-300 inline-block">
                {t("c4EvidenceDetective")} ({quest.c4_data.weight}%)
              </span>
              <div className="rounded-2xl border-2 border-rose-300 bg-rose-50/80 p-3 sm:p-4">
                <span className="text-[10px] sm:text-xs font-black uppercase text-rose-900 block">
                  {t("storyClaim")}
                </span>
                <h3 className="mt-1 font-black text-slate-900 text-xs sm:text-sm leading-snug">
                  {quest.c4_data.claim || quest.c4_data.scenario}
                </h3>
              </div>
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] sm:text-xs font-bold text-slate-700">
                  {quest.c4_data.instruction ||
                    t("c4InstructionDefault", {
                      count: evidenceSelectionCount,
                    })}
                </p>
                <span className="shrink-0 rounded-full bg-slate-100 border border-slate-300 px-2 py-0.5 text-[10px] sm:text-xs font-black text-slate-900">
                  {c4Selected.length}/{evidenceSelectionCount}{" "}
                  {t("selectedCount")}
                </span>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {evidenceItems.map((evidence, index) => (
                  <button
                    key={evidence.id}
                    type="button"
                    onClick={() => toggleEvidence(evidence.id)}
                    className={`flex w-full items-start gap-2.5 rounded-2xl border-2 p-2.5 sm:p-3 text-left text-xs font-black leading-relaxed transition cursor-pointer ${
                      c4Selected.includes(evidence.id)
                        ? "border-rose-600 bg-rose-50 text-slate-900 shadow-xs"
                        : "border-slate-300 bg-white text-slate-900 hover:border-slate-400"
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 sm:h-6 sm:w-6 shrink-0 items-center justify-center rounded-full text-[10px] sm:text-xs font-black ${
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
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => goBackFrom("c4")}
                  className="px-4 py-2.5 rounded-xl border-2 border-slate-300 bg-slate-100 text-slate-800 text-xs font-black hover:bg-slate-200 transition"
                >
                  {t("prevBtn")}
                </button>
                <button
                  disabled={c4Selected.length !== evidenceSelectionCount}
                  onClick={() => advanceFrom("c4")}
                  className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black rounded-xl disabled:opacity-40 cursor-pointer shadow-xs text-xs sm:text-sm"
                >
                  {t("finishAndSubmit")}
                </button>
              </div>
            </motion.div>
          )}

          {/* DONE */}
          {stage === "done" && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-4 py-4"
            >
              <div className="text-5xl sm:text-6xl">🎉</div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                {t("screeningDoneTitle")}
              </h2>
              <div className="flex flex-col sm:flex-row justify-center gap-3 text-left max-w-sm mx-auto">
                {activityPlan.oralReading && (
                  <div className="flex-1 p-3.5 bg-white rounded-2xl border-2 border-slate-300 shadow-xs text-center sm:text-left">
                    <span className="text-[10px] font-black text-slate-600 block uppercase">
                      {t("fluencyLabel")}
                    </span>
                    <span className="text-xl sm:text-2xl font-black text-slate-900">
                      {metrics.wcpm} WCPM
                    </span>
                  </div>
                )}
                {assignedBloomPoints > 0 && (
                  <div className="flex-1 p-3.5 bg-white rounded-2xl border-2 border-slate-300 shadow-xs text-center sm:text-left">
                    <span className="text-[10px] font-black text-slate-600 block uppercase">
                      {t("bloomGamesLabel")}
                    </span>
                    <span className="text-xl sm:text-2xl font-black text-emerald-700">
                      {c1Score + c2Score + c3Score + c4Score}/
                      {assignedBloomPoints}
                    </span>
                  </div>
                )}
              </div>
              <button
                onClick={onExit}
                className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl text-xs cursor-pointer shadow-sm transition"
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
