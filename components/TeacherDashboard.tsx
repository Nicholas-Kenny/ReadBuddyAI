"use client";

import React, { useState, useEffect } from "react";
import {
  LogOut,
  RefreshCw,
  PlusCircle,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Trash2,
  Users,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  ActivityPlan,
  EMPTY_ACTIVITY_PLAN,
  GRADE_LEVELS,
  INTEREST_CATEGORIES,
  normalizeActivityPlan,
} from "@/lib/studentProfile";
import {
  getEvidenceItems,
  getEvidenceSelectionCount,
  getPlanSteps,
} from "@/lib/questGames";
import { useLanguage } from "@/lib/i18n";

export default function TeacherDashboard({ onExit }: { onExit: () => void }) {
  const { t } = useLanguage();
  const [isAuth, setIsAuth] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState<
    "analytics" | "stories" | "classes"
  >("classes");

  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClassCode, setSelectedClassCode] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("Grade 2");
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [generatingAi, setGeneratingAi] = useState(false);

  // Form States (Create Class)
  const [newClassName, setNewClassName] = useState("");
  const [newClassGrade, setNewClassGrade] = useState("Grade 1");

  // AI Story Generator State
  const [genInterest, setGenInterest] = useState("Folklore & Legends");
  const [storyPrompt, setStoryPrompt] = useState("");

  // Modal State
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [profileStudent, setProfileStudent] = useState<any | null>(null);
  const [assignmentDraft, setAssignmentDraft] =
    useState<ActivityPlan>(EMPTY_ACTIVITY_PLAN);
  const [savingAssignment, setSavingAssignment] = useState(false);
  const [inspectStory, setInspectStory] = useState<any | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const { data: cls } = await supabase
      .from("classes")
      .select("*")
      .order("created_at", { ascending: false });

    if (cls && cls.length > 0) {
      setClasses(cls);
      const currentCode = selectedClassCode || cls[0].code;
      if (!selectedClassCode) setSelectedClassCode(currentCode);

      const activeCls = cls.find((c: any) => c.code === currentCode);
      if (activeCls) setSelectedGrade(activeCls.grade);

      // Fetch Students
      const { data: std } = await supabase
        .from("students")
        .select("*")
        .eq("class_code", currentCode)
        .order("created_at", { ascending: true });
      if (std) setStudentsList(std);

      // Fetch Assessments
      const { data: asm } = await supabase
        .from("assessments")
        .select("*")
        .eq("class_code", currentCode)
        .order("created_at", { ascending: false });
      if (asm) setAssessments(asm);

      // Fetch Stories
      const { data: sty } = await supabase
        .from("stories")
        .select("*")
        .eq("class_code", currentCode)
        .order("created_at", { ascending: false });
      if (sty) setStories(sty);
    } else {
      setClasses([]);
      setStudentsList([]);
      setAssessments([]);
      setStories([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isAuth) fetchData();
  }, [isAuth, selectedClassCode]);

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;

    const generatedCode = "A" + Math.floor(100 + Math.random() * 900);
    const newCls = {
      id: `cls_${Date.now()}`,
      code: generatedCode,
      name: newClassName.trim(),
      grade: newClassGrade,
    };

    const { error } = await supabase.from("classes").insert(newCls);
    if (!error) {
      setNewClassName("");
      setSelectedClassCode(generatedCode);
      setSelectedGrade(newClassGrade);
      await fetchData();
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (!confirm("Remove this student from the class?")) return;
    const { error } = await supabase
      .from("students")
      .delete()
      .eq("id", studentId);
    if (!error) {
      setStudentsList(studentsList.filter((s) => s.id !== studentId));
    }
  };

  const openStudentProfile = (student: any) => {
    setProfileStudent(student);
    setAssignmentDraft(normalizeActivityPlan(student.assigned_activities));
  };

  const handleSaveAssignment = async () => {
    if (!profileStudent) return false;
    setSavingAssignment(true);
    const hasAssignment = Object.values(assignmentDraft).some(Boolean);
    const { error } = await supabase
      .from("students")
      .update({
        reading_level: profileStudent.reading_level,
        assigned_activities: assignmentDraft,
        profile_status: hasAssignment ? "assigned" : "pending",
      })
      .eq("id", profileStudent.id);
    setSavingAssignment(false);

    if (error) {
      alert(`Failed to save assignment: ${error.message}`);
      return false;
    }

    const updatedStudent = {
      ...profileStudent,
      reading_level: profileStudent.reading_level,
      assigned_activities: assignmentDraft,
      profile_status: hasAssignment ? "assigned" : "pending",
    };
    setStudentsList((current) =>
      current.map((student) =>
        student.id === updatedStudent.id ? updatedStudent : student,
      ),
    );
    setProfileStudent(updatedStudent);
    return true;
  };

  const handleGenerateStory = async () => {
    if (!selectedClassCode) {
      alert("Please select or create a class first!");
      return;
    }
    setGeneratingAi(true);
    try {
      const res = await fetch("/api/generate-quest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grade: selectedGrade,
          interest: genInterest,
          classCode: selectedClassCode,
          refinementPrompt: storyPrompt.trim(),
          targetLanguage: "English", // MVP Lock: Always generate in English for Speech-to-Text support
          autoSave: true,
        }),
      });
      const data = await res.json();
      if (data && data.id) {
        setStories([data, ...stories]);
        setStoryPrompt("");
      }
    } catch (e) {
      alert("Failed to generate story with AI");
    } finally {
      setGeneratingAi(false);
    }
  };

  const handleToggleVerifyStory = async (
    storyId: string,
    currentStatus: boolean,
  ) => {
    const nextStatus = !currentStatus;
    const { error } = await supabase
      .from("stories")
      .update({ is_verified: nextStatus })
      .eq("id", storyId);
    if (!error) {
      setStories((currentStories) =>
        currentStories.map((s) =>
          s.id === storyId ? { ...s, is_verified: nextStatus } : s,
        ),
      );
      setInspectStory((current: any) =>
        current?.id === storyId
          ? { ...current, is_verified: nextStatus }
          : current,
      );
    }
  };

  const groupedStudents = React.useMemo(() => {
    const map = new Map<string, any[]>();
    assessments.forEach((r) => {
      const groupKey = r.student_id || `name:${r.student_name.toLowerCase()}`;
      const prev = map.get(groupKey) || [];
      prev.push(r);
      map.set(groupKey, prev);
    });

    const res: any[] = [];
    map.forEach((records) => {
      const latest = records[0];
      const match = studentsList.find((student) =>
        latest.student_id
          ? student.id === latest.student_id
          : student.name.toLowerCase() === latest.student_name.toLowerCase(),
      );
      res.push({
        id: match?.id || latest.student_id || latest.student_name,
        name: match?.name || latest.student_name,
        avatar: match?.avatar || "🐻",
        latestWcpm: latest.wcpm,
        latestAccuracy: latest.accuracy,
        latestBloom: latest.total_bloom_score,
        latestComposite: latest.composite_score,
        status: latest.status,
        totalAttempts: records.length,
        latestRecord: latest,
        history: records,
      });
    });
    return res;
  }, [assessments, studentsList]);

  const interestOverview = INTEREST_CATEGORIES.map((interest) => {
    const matchingStudents = studentsList.filter((student) =>
      student.interests?.includes(interest.title),
    );
    const readingLevels = GRADE_LEVELS.map((grade) => ({
      grade,
      count: matchingStudents.filter(
        (student) => student.reading_level === grade,
      ).length,
    })).filter((item) => item.count > 0);
    return { ...interest, students: matchingStudents, readingLevels };
  });

  const selectedInterestOverview = interestOverview.find(
    (interest) => interest.title === genInterest,
  );
  const inspectPlanSteps = inspectStory
    ? getPlanSteps(inspectStory.c3_data)
    : [];
  const inspectEvidenceItems = inspectStory
    ? getEvidenceItems(inspectStory.c4_data, inspectStory.passage_text)
    : [];
  const inspectEvidenceCount = inspectStory
    ? getEvidenceSelectionCount(inspectStory.c4_data, inspectEvidenceItems)
    : 0;

  if (!isAuth) {
    return (
      <div className="max-w-sm mx-auto bg-white p-6 sm:p-7 rounded-[28px] sm:rounded-[32px] border-2 border-slate-300 shadow-xl text-center space-y-4 my-auto animate-fadeIn">
        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-amber-100 text-amber-900 rounded-2xl flex items-center justify-center text-xl sm:text-2xl mx-auto mb-1 border border-amber-300">
          🔑
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900">
          {t("teacherLoginTitle")}
        </h2>
        <p className="text-xs font-semibold text-slate-600">
          {t("teacherLoginSubtitle")}
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (username === "guru" && password === "admin123") setIsAuth(true);
            else alert("Demo credentials: guru / admin123");
          }}
          className="space-y-3 pt-2"
        >
          <input
            type="text"
            placeholder="Username (guru)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 sm:p-3.5 bg-white border-2 border-slate-300 rounded-2xl text-xs font-bold text-slate-900 placeholder:text-slate-400 outline-none focus:border-orange-500"
          />
          <input
            type="password"
            placeholder="Password (admin123)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 sm:p-3.5 bg-white border-2 border-slate-300 rounded-2xl text-xs font-bold text-slate-900 placeholder:text-slate-400 outline-none focus:border-orange-500"
          />
          <button
            type="submit"
            className="w-full py-3 sm:py-3.5 bg-orange-600 hover:bg-orange-700 text-white font-black rounded-2xl shadow-[0_4px_0_0_#9A3412] text-xs transition cursor-pointer"
          >
            {t("enterTeacherPortal")}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto w-full bg-white p-4 sm:p-8 rounded-[28px] sm:rounded-[36px] border-2 border-slate-300 shadow-xl space-y-6 my-auto animate-fadeIn">
      {/* Top Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg sm:text-xl font-black text-slate-900">
              {t("teacherDashboardTitle")}
            </h2>
            {classes.length > 0 ? (
              <select
                value={selectedClassCode}
                onChange={(e) => {
                  setSelectedClassCode(e.target.value);
                  const active = classes.find((c) => c.code === e.target.value);
                  if (active) setSelectedGrade(active.grade);
                }}
                className="max-w-full bg-amber-100 text-slate-900 font-bold text-xs px-2.5 py-1.5 rounded-xl border-2 border-amber-400 outline-none cursor-pointer"
              >
                {classes.map((c) => (
                  <option
                    key={c.code}
                    value={c.code}
                    className="text-slate-900 font-bold"
                  >
                    {c.name} ({c.code} • {c.grade})
                  </option>
                ))}
              </select>
            ) : (
              <span className="text-xs font-black text-rose-700 bg-rose-100 px-2.5 py-1 rounded-xl border border-rose-300">
                No active classes
              </span>
            )}
          </div>
          <p className="text-xs font-medium text-slate-600">
            {t("teacherSubtitle")}
          </p>
        </div>

        {/* Action Tabs Bar */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setActiveTab("classes")}
            className={`shrink-0 text-xs font-black px-3 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === "classes"
                ? "bg-orange-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-800 hover:bg-slate-200"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>{t("tabClasses")}</span>
          </button>
          <button
            onClick={() => setActiveTab("stories")}
            className={`shrink-0 text-xs font-black px-3 py-2 rounded-xl transition cursor-pointer ${
              activeTab === "stories"
                ? "bg-orange-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-800 hover:bg-slate-200"
            }`}
          >
            📖 {t("tabStoryBank")}
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`shrink-0 text-xs font-black px-3 py-2 rounded-xl transition cursor-pointer ${
              activeTab === "analytics"
                ? "bg-orange-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-800 hover:bg-slate-200"
            }`}
          >
            📊 {t("tabAnalytics")}
          </button>
          <button
            onClick={fetchData}
            disabled={loading}
            className="shrink-0 p-2 bg-slate-100 text-slate-800 hover:bg-slate-200 rounded-xl transition cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
            />
          </button>
          <button
            onClick={onExit}
            className="shrink-0 text-xs font-black text-rose-600 bg-rose-50 hover:bg-rose-100 p-2 rounded-xl flex items-center gap-1 cursor-pointer transition"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* TAB 1: CLASSES & STUDENT ROSTER */}
      {activeTab === "classes" && (
        <div className="space-y-6 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Create New Class */}
            <div className="bg-amber-50/60 p-5 sm:p-6 rounded-3xl border-2 border-amber-300 space-y-4">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-orange-600" />
                <h3 className="font-black text-slate-900 text-sm">
                  {t("createNewClass")}
                </h3>
              </div>
              <form onSubmit={handleCreateClass} className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    {t("className")}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Grade 3 Orion"
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                    className="w-full p-2.5 sm:p-3 bg-white border-2 border-slate-300 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-400 outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    {t("targetGrade")}
                  </label>
                  <select
                    value={newClassGrade}
                    onChange={(e) => setNewClassGrade(e.target.value)}
                    className="w-full p-2.5 sm:p-3 bg-white border-2 border-slate-300 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-orange-500"
                  >
                    <option value="Grade 1">Grade 1 (Early Phonics)</option>
                    <option value="Grade 2">Grade 2 (Simple Sentences)</option>
                    <option value="Grade 3">
                      Grade 3 (Sequence & Cause-Effect)
                    </option>
                    <option value="Grade 4">Grade 4 (Deep Analysis)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-black rounded-xl text-xs shadow-[0_3px_0_0_#9A3412] transition cursor-pointer"
                >
                  {t("generateClassBtn")}
                </button>
              </form>
            </div>

            <div className="bg-sky-50/60 p-5 sm:p-6 rounded-3xl border-2 border-sky-300 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-sky-700" />
                  <h3 className="font-black text-slate-900 text-sm">
                    {t("studentSelfRegTitle")}
                  </h3>
                </div>
                <span className="text-xs font-black text-sky-900 bg-sky-100 px-2.5 py-0.5 rounded-full border border-sky-300">
                  {studentsList.length} Joined
                </span>
              </div>
              <p className="text-xs font-semibold leading-relaxed text-slate-600">
                {t("studentSelfRegDesc")}{" "}
                <strong>{selectedClassCode || "class"}</strong>.
              </p>
              <div className="rounded-2xl border border-sky-200 bg-white p-4">
                <span className="block text-[10px] font-black uppercase text-sky-700">
                  {t("codeToShare")}
                </span>
                <span className="font-mono text-2xl sm:text-3xl font-black tracking-widest text-slate-900">
                  {selectedClassCode || "—"}
                </span>
              </div>
            </div>
          </div>

          {/* Roster / Registered Students List */}
          <div className="p-4 sm:p-5 bg-white border-2 border-slate-300 rounded-3xl space-y-3 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                <span>
                  📋 {t("classRoster")} ({selectedClassCode})
                </span>
                <span className="text-xs text-slate-500">
                  ({studentsList.length} {t("studentsCount")})
                </span>
              </h4>
            </div>

            {studentsList.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-3 text-center">
                {t("noStudentsRegistered")}
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pt-1">
                {studentsList.map((std) => (
                  <div
                    key={std.id}
                    className="p-3.5 sm:p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl p-1 bg-white rounded-lg border border-slate-200">
                          {std.avatar}
                        </span>
                        <div>
                          <span className="block text-sm font-black text-slate-900">
                            {std.name}
                          </span>
                          <span className="block text-[11px] font-bold text-slate-500">
                            {std.school_grade || selectedGrade} ·{" "}
                            {std.reading_level || selectedGrade}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`rounded-full px-2 py-1 text-[10px] font-black ${std.profile_status === "assigned" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}
                      >
                        {std.profile_status === "assigned"
                          ? t("assigned")
                          : t("needsReview")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <button
                        onClick={() => openStudentProfile(std)}
                        className="flex-1 rounded-xl bg-sky-700 px-3 py-2 text-xs font-black text-white hover:bg-sky-800 transition cursor-pointer"
                      >
                        {t("inspectAndAssign")}
                      </button>
                      <button
                        onClick={() => handleDeleteStudent(std.id)}
                        className="p-2 text-rose-600 hover:bg-rose-100 rounded-lg transition cursor-pointer"
                        title="Delete Student"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: AI STORY BANK & VERIFICATION */}
      {activeTab === "stories" && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible scrollbar-none">
            {interestOverview.map((overview) => (
              <button
                key={overview.title}
                type="button"
                onClick={() => setGenInterest(overview.title)}
                className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-xs font-black transition cursor-pointer ${genInterest === overview.title ? "border-orange-500 bg-orange-600 text-white" : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"}`}
              >
                <span className="text-base">{overview.emoji}</span>
                <span>{overview.title}</span>
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] ${genInterest === overview.title ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"}`}
                >
                  {overview.students.length}
                </span>
              </button>
            ))}
          </div>

          {/* Action Generator Box */}
          <div className="rounded-3xl border-2 border-slate-300 bg-slate-50 p-4 sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-black text-slate-900">
                    {selectedInterestOverview?.emoji} {genInterest}
                  </h3>
                  <span className="rounded-full bg-white px-2 py-1 text-[10px] font-black text-slate-600 ring-1 ring-slate-200">
                    {selectedInterestOverview?.students.length || 0}{" "}
                    {t("studentsCount")}
                  </span>
                </div>
                <label className="text-xs font-bold text-slate-700 block">
                  {t("storyBrief")}
                  <textarea
                    value={storyPrompt}
                    onChange={(event) => setStoryPrompt(event.target.value)}
                    placeholder={t("storyBriefPlaceholder")}
                    rows={2}
                    className="mt-1 w-full resize-none rounded-xl border-2 border-slate-300 bg-white p-3 text-xs font-bold text-slate-900 outline-none focus:border-orange-500"
                  />
                </label>
              </div>

              <button
                onClick={handleGenerateStory}
                disabled={generatingAi}
                className="flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-orange-600 px-5 py-3 text-xs font-black text-white shadow-[0_3px_0_0_#9A3412] hover:bg-orange-700 disabled:opacity-50 cursor-pointer transition"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  {generatingAi
                    ? t("generatingWithGemini")
                    : t("generateStoryTask")}
                </span>
              </button>
            </div>
          </div>

          {/* List Stories */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stories.map((s) => (
              <div
                key={s.id}
                className="relative rounded-2xl border border-slate-300 bg-white p-4 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-black text-slate-500">
                        <span>{s.country_origin}</span>
                        <span>·</span>
                        <span>{s.word_count} words</span>
                        <span>·</span>
                        <span>{s.grade}</span>
                      </div>
                      <h4 className="mt-1 truncate text-sm font-black text-slate-900">
                        {s.title}
                      </h4>
                    </div>
                    <span
                      className={`flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[10px] font-black ${s.is_verified ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}
                    >
                      {s.is_verified ? (
                        <CheckCircle2 className="h-3 w-3" />
                      ) : (
                        <ShieldCheck className="h-3 w-3" />
                      )}
                      {s.is_verified ? t("verifiedBadge") : t("reviewBadge")}
                    </span>
                  </div>

                  <p className="mt-2 line-clamp-2 text-xs font-medium leading-relaxed text-slate-600">
                    {s.passage_text}
                  </p>
                </div>

                <div className="mt-3 flex items-center justify-end gap-3 border-t border-slate-200 pt-3">
                  <button
                    onClick={() => setInspectStory(s)}
                    className="rounded-lg bg-slate-900 px-3 py-2 text-[10px] font-black text-white hover:bg-slate-700 cursor-pointer"
                  >
                    {s.is_verified
                      ? t("inspectC1C4Btn")
                      : t("reviewAndVerifyBtn")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ANALYTICS & RESPONSIVE STUDENT SCREENING RESULTS */}
      {activeTab === "analytics" && (
        <div className="space-y-4 animate-fadeIn">
          {/* Desktop & Tablet Table View */}
          <div className="hidden sm:block border-2 border-slate-300 rounded-2xl overflow-x-auto shadow-xs">
            <table className="w-full text-left text-xs min-w-[620px]">
              <thead className="bg-slate-100 border-b border-slate-300 text-slate-800 font-black">
                <tr>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Latest Fluency</th>
                  <th className="p-3">Accuracy</th>
                  <th className="p-3">Bloom C1–C4</th>
                  <th className="p-3">Composite</th>
                  <th className="p-3">History</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {groupedStudents.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="p-8 text-center text-slate-500 font-bold italic"
                    >
                      {t("noScreeningData")}
                    </td>
                  </tr>
                ) : (
                  groupedStudents.map((std) => (
                    <tr
                      key={std.name}
                      className="hover:bg-amber-50/50 transition"
                    >
                      <td className="p-3 font-black text-slate-900 flex items-center gap-2">
                        <span>{std.avatar}</span>
                        <button
                          onClick={() => setSelectedStudent(std)}
                          className="hover:text-orange-700 font-black text-left cursor-pointer hover:underline"
                        >
                          {std.name}
                        </button>
                      </td>
                      <td className="p-3 font-mono font-bold text-orange-700">
                        {std.latestWcpm} WCPM
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-800">
                        {std.latestAccuracy}%
                      </td>
                      <td className="p-3 font-mono font-bold text-purple-700">
                        {std.latestBloom}/100
                      </td>
                      <td className="p-3 font-mono font-black text-indigo-700">
                        {std.latestComposite}/100
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-300">
                          {std.totalAttempts}x
                        </span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-black ${
                            std.status === "green"
                              ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                              : std.status === "yellow"
                                ? "bg-amber-100 text-amber-900 border border-amber-300"
                                : "bg-rose-100 text-rose-900 border border-rose-300"
                          }`}
                        >
                          {std.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => setSelectedStudent(std)}
                          className="px-3 py-1 bg-blue-100 text-blue-900 font-bold rounded-lg text-xs border border-blue-300 cursor-pointer hover:bg-blue-200 transition"
                        >
                          View Log
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View (< sm breakpoint) */}
          <div className="block sm:hidden space-y-3">
            {groupedStudents.length === 0 ? (
              <div className="p-6 bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl text-center text-slate-500 font-bold text-xs italic">
                {t("noScreeningData")}
              </div>
            ) : (
              groupedStudents.map((std) => (
                <div
                  key={std.name}
                  className="p-4 bg-white border-2 border-slate-300 rounded-2xl shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{std.avatar}</span>
                      <div>
                        <h4 className="text-sm font-black text-slate-900">
                          {std.name}
                        </h4>
                        <span className="text-[10px] font-bold text-slate-500">
                          {std.totalAttempts} {t("screeningSessions")}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        std.status === "green"
                          ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                          : std.status === "yellow"
                            ? "bg-amber-100 text-amber-900 border border-amber-300"
                            : "bg-rose-100 text-rose-900 border border-rose-300"
                      }`}
                    >
                      {std.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 bg-orange-50 rounded-xl border border-orange-200">
                      <span className="block text-[9px] font-bold text-slate-500 uppercase">
                        Fluency
                      </span>
                      <span className="font-mono font-black text-orange-700">
                        {std.latestWcpm} WCPM
                      </span>
                    </div>
                    <div className="p-2 bg-purple-50 rounded-xl border border-purple-200">
                      <span className="block text-[9px] font-bold text-slate-500 uppercase">
                        Bloom
                      </span>
                      <span className="font-mono font-black text-purple-700">
                        {std.latestBloom}/100
                      </span>
                    </div>
                    <div className="p-2 bg-indigo-50 rounded-xl border border-indigo-200">
                      <span className="block text-[9px] font-bold text-slate-500 uppercase">
                        Composite
                      </span>
                      <span className="font-mono font-black text-indigo-700">
                        {std.latestComposite}/100
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedStudent(std)}
                    className="w-full py-2 bg-blue-100 text-blue-900 font-bold rounded-xl text-xs border border-blue-300 cursor-pointer"
                  >
                    View Diagnostic Log
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* MODAL: STUDENT PROFILE & ASSIGNMENT */}
      {profileStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4 backdrop-blur-xs animate-fadeIn">
          <div className="max-h-[90vh] w-full max-w-2xl space-y-4 sm:space-y-5 overflow-y-auto rounded-[28px] sm:rounded-[32px] border-2 border-slate-300 bg-white p-4 sm:p-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-3xl sm:text-4xl">
                  {profileStudent.avatar}
                </span>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900">
                    {profileStudent.name}
                  </h3>
                  <p className="text-xs font-bold text-slate-500">
                    Learning profile · {profileStudent.class_code}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setProfileStudent(null)}
                className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-slate-200 font-bold text-slate-800 cursor-pointer hover:bg-slate-300 text-xs sm:text-sm"
              >
                ✕
              </button>
            </div>

            {/* Profile Detail Cards */}
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-2.5 sm:p-3">
                <span className="block text-[10px] font-black uppercase text-slate-500">
                  School Grade
                </span>
                <span className="text-xs sm:text-sm font-black text-slate-900">
                  {profileStudent.school_grade || selectedGrade}
                </span>
              </div>
              <label className="rounded-2xl border border-orange-200 bg-orange-50 p-2.5 sm:p-3 block">
                <span className="block text-[10px] font-black uppercase text-orange-700">
                  Reading Level
                </span>
                <select
                  value={
                    profileStudent.reading_level ||
                    profileStudent.school_grade ||
                    selectedGrade
                  }
                  onChange={(event) =>
                    setProfileStudent({
                      ...profileStudent,
                      reading_level: event.target.value,
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-orange-300 bg-white p-1 text-xs font-black text-slate-900 outline-none"
                >
                  {GRADE_LEVELS.map((grade) => (
                    <option key={grade}>{grade}</option>
                  ))}
                </select>
              </label>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-2.5 sm:p-3">
                <span className="block text-[10px] font-black uppercase text-slate-500">
                  Location
                </span>
                <span className="text-xs sm:text-sm font-black text-slate-900 truncate block">
                  {profileStudent.location || "Not specified"}
                </span>
              </div>
            </div>

            {/* Student Interests Badges */}
            <div>
              <span className="mb-1.5 block text-xs font-black text-slate-800">
                Student Interests
              </span>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {(profileStudent.interests || []).length > 0 ? (
                  profileStudent.interests.map((interest: string) => {
                    const category = INTEREST_CATEGORIES.find(
                      (item) => item.title === interest,
                    );
                    return (
                      <span
                        key={interest}
                        className="rounded-full border border-amber-300 bg-amber-100 px-2.5 py-0.5 text-xs font-black text-amber-900"
                      >
                        {category?.emoji || "📖"} {interest}
                      </span>
                    );
                  })
                ) : (
                  <span className="text-xs font-semibold text-slate-500">
                    No interests selected.
                  </span>
                )}
              </div>
            </div>

            {/* Interest Details */}
            <div className="rounded-2xl border border-sky-200 bg-sky-50 p-3">
              <span className="block text-[10px] font-black uppercase text-sky-800">
                Hobbies &amp; Reading Interests
              </span>
              <p className="mt-1 text-xs font-semibold leading-relaxed text-slate-700">
                {profileStudent.interest_details ||
                  "Student has not added detailed interests yet."}
              </p>
            </div>

            {/* Activity Checkboxes Assignment Module */}
            <div className="rounded-3xl border-2 border-sky-200 bg-sky-50 p-4 sm:p-5">
              <div className="mb-2 sm:mb-3">
                <h4 className="text-xs sm:text-sm font-black text-slate-900">
                  Assign Activities
                </h4>
                <p className="text-[11px] sm:text-xs font-semibold text-slate-600">
                  Select the modules the student must complete in their next
                  quest.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {[
                  [
                    "oralReading",
                    "🎙️ Oral Reading",
                    "Measure reading fluency & accuracy",
                  ],
                  ["c1", "C1 · Remember", "Recall explicit story facts"],
                  ["c2", "C2 · Understand", "Match cause and effect pairs"],
                  [
                    "c3",
                    "C3 · Plan Builder",
                    "Sequence action steps for new scenarios",
                  ],
                  [
                    "c4",
                    "C4 · Evidence Detective",
                    "Select text evidence supporting claims",
                  ],
                ].map(([key, label, description]) => {
                  const activityKey = key as keyof ActivityPlan;
                  const enabled = assignmentDraft[activityKey];
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() =>
                        setAssignmentDraft({
                          ...assignmentDraft,
                          [activityKey]: !enabled,
                        })
                      }
                      className={`rounded-2xl border-2 p-2.5 sm:p-3 text-left cursor-pointer transition ${enabled ? "border-sky-600 bg-white shadow-xs" : "border-slate-200 bg-slate-100 hover:bg-slate-200/60"}`}
                    >
                      <span className="flex items-center justify-between text-xs font-black text-slate-900">
                        {label}{" "}
                        {enabled && (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                        )}
                      </span>
                      <span className="mt-0.5 block text-[10px] font-semibold text-slate-500">
                        {description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="sticky bottom-0 -mx-2 flex flex-col gap-2 border-t border-slate-200 bg-white/95 p-2 pt-3 backdrop-blur-sm sm:flex-row">
              <button
                onClick={handleSaveAssignment}
                disabled={savingAssignment}
                className="flex-1 rounded-xl bg-sky-700 hover:bg-sky-800 px-4 py-3 text-xs font-black text-white disabled:opacity-50 cursor-pointer transition shadow-xs"
              >
                {savingAssignment ? t("saving") : t("saveProfileAndAssignment")}
              </button>
              <button
                onClick={async () => {
                  const saved = await handleSaveAssignment();
                  if (!saved) return;
                  setGenInterest(
                    profileStudent.interests?.[0] || "Folklore & Legends",
                  );
                  setActiveTab("stories");
                  setProfileStudent(null);
                }}
                disabled={savingAssignment}
                className="flex-1 rounded-xl bg-orange-600 hover:bg-orange-700 px-4 py-3 text-xs font-black text-white cursor-pointer transition shadow-xs"
              >
                {t("openCategoryGenerator")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: REVIEW STORY & QUESTIONS */}
      {inspectStory && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-fadeIn">
          <div className="bg-white max-w-2xl w-full p-4 sm:p-6 rounded-[28px] sm:rounded-[32px] shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto border-2 border-slate-300">
            <div className="flex items-center justify-between border-b pb-2">
              <div>
                <h3 className="text-base sm:text-xl font-black text-slate-900">
                  {inspectStory.title}
                </h3>
                <span className="text-xs text-orange-700 font-bold">
                  {inspectStory.country_origin} • {inspectStory.grade}
                </span>
              </div>
              <button
                onClick={() => setInspectStory(null)}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-200 text-slate-800 font-bold cursor-pointer hover:bg-slate-300 text-xs sm:text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-3 sm:p-4 bg-amber-50 rounded-2xl text-xs font-bold text-slate-900 leading-relaxed border border-amber-200 max-h-40 overflow-y-auto">
              {inspectStory.passage_text}
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-blue-50 rounded-xl border-2 border-blue-200">
                <span className="font-black text-blue-950 block">
                  C1 ({inspectStory.c1_data?.weight}%)
                </span>
                <p className="text-slate-800 font-medium">
                  {inspectStory.c1_data?.prompt}
                </p>
                <div className="mt-2 space-y-1.5">
                  {inspectStory.c1_data?.options?.map(
                    (option: any, index: number) => (
                      <div
                        key={option.id || index}
                        className="flex items-start justify-between gap-3 rounded-lg border border-blue-200 bg-white p-2"
                      >
                        <span className="font-semibold text-slate-800">
                          {String.fromCharCode(65 + index)}. {option.text}
                        </span>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-black ${option.score === inspectStory.c1_data?.weight ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}
                        >
                          {option.score}/{inspectStory.c1_data?.weight}
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </div>
              <div className="p-3 bg-purple-50 rounded-xl border-2 border-purple-200">
                <span className="font-black text-purple-950 block">
                  C2 ({inspectStory.c2_data?.weight}%)
                </span>
                <p className="text-slate-800 font-medium">
                  {inspectStory.c2_data?.prompt}
                </p>
                <div className="mt-2 space-y-1.5">
                  {inspectStory.c2_data?.pairs?.map(
                    (pair: any, index: number) => (
                      <div
                        key={pair.id || index}
                        className="flex flex-col gap-1 sm:gap-2 rounded-lg border border-purple-200 bg-white p-2 sm:grid sm:grid-cols-[1fr_auto_1fr_auto] sm:items-center"
                      >
                        <span className="font-semibold text-slate-800">
                          {pair.causeText}
                        </span>
                        <span className="font-black text-purple-700 hidden sm:inline">
                          →
                        </span>
                        <span className="font-semibold text-slate-800">
                          {pair.effectText}
                        </span>
                        <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-black text-purple-800 self-start sm:self-auto">
                          {pair.weight} pts
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl border-2 border-emerald-200">
                <span className="font-black text-emerald-950 block">
                  C3 · Plan Builder ({inspectStory.c3_data?.weight}%)
                </span>
                <p className="text-slate-800 font-medium">
                  {inspectStory.c3_data?.scenario}
                </p>
                <div className="mt-2 space-y-1.5">
                  {inspectPlanSteps.map((step, index) => (
                    <div
                      key={step.id}
                      className="flex items-start gap-2.5 rounded-lg border border-emerald-200 bg-white p-2"
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-black text-emerald-800">
                        {index + 1}
                      </span>
                      <span className="font-semibold text-slate-800">
                        {step.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-3 bg-rose-50 rounded-xl border-2 border-rose-200">
                <span className="font-black text-rose-950 block">
                  C4 · Evidence Detective ({inspectStory.c4_data?.weight}%)
                </span>
                <p className="mt-1 font-black text-slate-800">
                  {inspectStory.c4_data?.claim ||
                    inspectStory.c4_data?.scenario}
                </p>
                <p className="mt-1 text-[10px] font-semibold text-slate-600">
                  {inspectStory.c4_data?.instruction ||
                    `Student selects ${inspectEvidenceCount} supporting sentences.`}
                </p>
                <div className="mt-2 space-y-1.5">
                  {inspectEvidenceItems.map((evidence, index) => (
                    <div
                      key={evidence.id}
                      className="flex items-start justify-between gap-2.5 rounded-lg border border-rose-200 bg-white p-2"
                    >
                      <span className="font-semibold text-slate-800">
                        {index + 1}. {evidence.text}
                      </span>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-black ${evidence.score > 0 ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}
                      >
                        {evidence.score} pts
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 -mx-2 border-t border-slate-200 bg-white/95 p-2 pt-3 backdrop-blur-sm">
              <button
                onClick={() =>
                  handleToggleVerifyStory(
                    inspectStory.id,
                    inspectStory.is_verified,
                  )
                }
                className={`w-full rounded-xl px-4 py-3 text-xs font-black text-white cursor-pointer transition ${inspectStory.is_verified ? "bg-slate-700 hover:bg-slate-800" : "bg-emerald-700 hover:bg-emerald-800"}`}
              >
                {inspectStory.is_verified
                  ? t("unverifyStory")
                  : t("verifyStoryAndQuestions")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: STUDENT DIAGNOSTICS */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-fadeIn">
          <div className="bg-white max-w-2xl w-full p-4 sm:p-6 rounded-[28px] sm:rounded-[32px] shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto border-2 border-slate-300">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-lg sm:text-xl font-black text-slate-900">
                {selectedStudent.name}
              </h3>
              <button
                onClick={() => setSelectedStudent(null)}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-200 text-slate-800 font-bold cursor-pointer hover:bg-slate-300 text-xs sm:text-sm"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-black">
              <div className="p-2.5 sm:p-3 bg-blue-50 text-blue-950 border border-blue-200 rounded-xl">
                C1: {selectedStudent.latestRecord.c1_score}/15
              </div>
              <div className="p-2.5 sm:p-3 bg-purple-50 text-purple-950 border border-purple-200 rounded-xl">
                C2: {selectedStudent.latestRecord.c2_score}/25
              </div>
              <div className="p-2.5 sm:p-3 bg-emerald-50 text-emerald-950 border border-emerald-200 rounded-xl">
                C3: {selectedStudent.latestRecord.c3_score}/30
              </div>
              <div className="p-2.5 sm:p-3 bg-rose-50 text-rose-950 border border-rose-200 rounded-xl">
                C4: {selectedStudent.latestRecord.c4_score}/30
              </div>
            </div>

            <div className="p-3 bg-slate-100 rounded-xl text-xs font-medium text-slate-800 italic border border-slate-200">
              &ldquo;{selectedStudent.latestRecord.transcribed_text}&rdquo;
            </div>

            <div className="space-y-2 text-xs">
              <p>
                <strong className="text-slate-900 block">
                  {t("strengthLabel")}
                </strong>
                <span className="text-slate-700 leading-relaxed">
                  {selectedStudent.latestRecord.strength}
                </span>
              </p>
              <p>
                <strong className="text-slate-900 block">
                  {t("weaknessLabel")}
                </strong>
                <span className="text-slate-700 leading-relaxed">
                  {selectedStudent.latestRecord.weakness}
                </span>
              </p>
              <p>
                <strong className="text-slate-900 block">
                  {t("solutionLabel")}
                </strong>
                <span className="text-slate-700 leading-relaxed">
                  {selectedStudent.latestRecord.solution}
                </span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
