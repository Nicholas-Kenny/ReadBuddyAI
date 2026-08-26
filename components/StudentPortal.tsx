"use client";

import React, { useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  Lock,
  LogIn,
  MapPin,
  UserPlus,
} from "lucide-react";
import StudentScreeningQuest from "@/components/StudentScreeningQuest";
import { supabase } from "@/lib/supabase";
import {
  activityCount,
  EMPTY_ACTIVITY_PLAN,
  GRADE_LEVELS,
  INTEREST_CATEGORIES,
  normalizeActivityPlan,
} from "@/lib/studentProfile";
import { useLanguage } from "@/lib/i18n";

type StudentStage =
  | "auth"
  | "register"
  | "login"
  | "class"
  | "stories"
  | "quest";

async function hashPin(loginId: string, pin: string) {
  const value = new TextEncoder().encode(`${loginId.toLowerCase()}:${pin}`);
  const digest = await crypto.subtle.digest("SHA-256", value);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function stableStoryScore(studentId: string, storyId: string) {
  const value = `${studentId}:${storyId}`;
  let score = 0;
  for (let index = 0; index < value.length; index += 1) {
    score = (score * 31 + value.charCodeAt(index)) >>> 0;
  }
  return score;
}

export default function StudentPortal() {
  const { t } = useLanguage();
  const [stage, setStage] = useState<StudentStage>("auth");
  const [student, setStudent] = useState<any | null>(null);
  const [stories, setStories] = useState<any[]>([]);
  const [selectedStory, setSelectedStory] = useState<any | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [loginId, setLoginId] = useState("");
  const [pin, setPin] = useState("");
  const [classCode, setClassCode] = useState("");

  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("🐻");
  const [schoolGrade, setSchoolGrade] = useState("Grade 1");
  const [location, setLocation] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [interestDetails, setInterestDetails] = useState("");

  const resetAuthForm = () => {
    setError("");
    setLoginId("");
    setPin("");
  };

  const toggleInterest = (interest: string) => {
    setInterests((current) =>
      current.includes(interest)
        ? current.filter((item) => item !== interest)
        : [...current, interest],
    );
  };

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    const cleanLoginId = loginId.trim().toLowerCase();
    if (
      !cleanLoginId ||
      pin.length < 4 ||
      !name.trim() ||
      !location.trim() ||
      interests.length === 0
    ) {
      setError(
        "Please complete all fields, choose your interests, and use a 4+ digit PIN.",
      );
      return;
    }

    setBusy(true);
    setError("");
    const { data: existing } = await supabase
      .from("students")
      .select("id")
      .eq("login_id", cleanLoginId)
      .maybeSingle();
    if (existing) {
      setBusy(false);
      setError("This Login ID is already taken. Please choose another ID.");
      return;
    }

    const newStudent = {
      id: `std_${Date.now()}`,
      login_id: cleanLoginId,
      pin_hash: await hashPin(cleanLoginId, pin),
      class_code: "",
      name: name.trim(),
      avatar,
      school_grade: schoolGrade,
      reading_level: schoolGrade,
      location: location.trim(),
      interests,
      interest_details: interestDetails.trim(),
      assigned_activities: EMPTY_ACTIVITY_PLAN,
      profile_status: "pending",
    };
    const { data, error: registrationError } = await supabase
      .from("students")
      .insert(newStudent)
      .select()
      .single();
    setBusy(false);

    if (registrationError || !data) {
      setError(
        registrationError?.message || "Registration could not be saved.",
      );
      return;
    }

    setStudent(data);
    setClassCode("");
    setPin("");
    setStage("class");
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    const cleanLoginId = loginId.trim().toLowerCase();
    if (!cleanLoginId || !pin) {
      setError("Please enter your Login ID and PIN.");
      return;
    }

    setBusy(true);
    setError("");
    const { data, error: loginError } = await supabase
      .from("students")
      .select("*")
      .eq("login_id", cleanLoginId)
      .maybeSingle();
    const incomingHash = await hashPin(cleanLoginId, pin);
    setBusy(false);

    if (loginError || !data || data.pin_hash !== incomingHash) {
      setError("Invalid Login ID or PIN.");
      return;
    }

    setStudent(data);
    setClassCode(data.class_code || "");
    setPin("");
    setStage("class");
  };

  const loadStories = async (activeStudent: any) => {
    const { data, error: storyError } = await supabase
      .from("stories")
      .select("*")
      .eq("class_code", activeStudent.class_code)
      .eq("is_verified", true);

    if (storyError) {
      setError("Task library could not be loaded.");
      return;
    }

    const matchingStories = (data || [])
      .filter(
        (story: any) =>
          activeStudent.interests?.includes(story.interest) &&
          (!story.student_id || story.student_id === activeStudent.id),
      )
      .sort(
        (left: any, right: any) =>
          stableStoryScore(activeStudent.id, left.id) -
          stableStoryScore(activeStudent.id, right.id),
      );
    setStories(matchingStories);
    setSelectedStory(matchingStories[0] || null);
    setStage("stories");
  };

  const handleJoinClass = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!student || !classCode.trim()) return;
    setBusy(true);
    setError("");
    const cleanCode = classCode.trim().toUpperCase();
    const { data: classData, error: classError } = await supabase
      .from("classes")
      .select("code")
      .eq("code", cleanCode)
      .maybeSingle();
    if (classError || !classData) {
      setBusy(false);
      setError("Class code not found.");
      return;
    }

    const { data: updatedStudent, error: updateError } = await supabase
      .from("students")
      .update({ class_code: cleanCode })
      .eq("id", student.id)
      .select()
      .single();
    setBusy(false);
    if (updateError || !updatedStudent) {
      setError("Class could not be linked to your profile.");
      return;
    }

    setStudent(updatedStudent);
    await loadStories(updatedStudent);
  };

  const logout = () => {
    setStudent(null);
    setStories([]);
    setSelectedStory(null);
    resetAuthForm();
    setStage("auth");
  };

  if (stage === "quest" && student && selectedStory) {
    return (
      <StudentScreeningQuest
        quest={selectedStory}
        studentId={student.id}
        studentName={student.name}
        avatar={student.avatar}
        classCode={student.class_code}
        activityPlan={normalizeActivityPlan(student.assigned_activities)}
        onExit={() => setStage("stories")}
      />
    );
  }

  return (
    <div
      className={`${stage === "register" || stage === "stories" ? "max-w-2xl" : "max-w-md"} mx-auto my-auto w-full rounded-[36px] border-2 border-slate-300 bg-white p-7 shadow-xl animate-fadeIn`}
    >
      {stage === "auth" && (
        <div className="space-y-5 text-center">
          <div className="text-5xl">🐻</div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">
              {t("profileTitle")}
            </h1>
            <p className="mt-1 text-xs font-bold text-slate-600">
              {t("profileSubtitle")}
            </p>
          </div>
          <button
            onClick={() => {
              resetAuthForm();
              setStage("register");
            }}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-600 hover:bg-orange-700 py-4 text-sm font-black text-white shadow-[0_4px_0_0_#9A3412] cursor-pointer transition"
          >
            <UserPlus className="h-4 w-4" /> {t("registerNewProfile")}
          </button>
          <button
            onClick={() => {
              resetAuthForm();
              setStage("login");
            }}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-sky-700 bg-sky-50 hover:bg-sky-100 py-4 text-sm font-black text-sky-950 cursor-pointer transition"
          >
            <LogIn className="h-4 w-4 text-sky-800" /> {t("loginToProfile")}
          </button>
        </div>
      )}

      {stage === "register" && (
        <form
          onSubmit={handleRegister}
          autoComplete="off"
          className="space-y-5"
        >
          <div className="text-center">
            <h2 className="text-2xl font-black text-slate-900">
              {t("profileRegTitle")}
            </h2>
            <p className="text-xs font-bold text-slate-600">
              {t("profileRegSubtitle")}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[110px_1fr]">
            <label className="text-xs font-black text-slate-900 block">
              Avatar
              <select
                value={avatar}
                onChange={(event) => setAvatar(event.target.value)}
                className="mt-1 w-full rounded-xl border-2 border-slate-300 bg-white p-3 text-xl text-slate-900 font-bold outline-none focus:border-orange-500"
              >
                {["🐻", "🦊", "🦁", "🐼", "🐰", "🦄"].map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <label className="text-xs font-black text-slate-900 block">
              {t("nickname")}
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Alya"
                className="mt-1 w-full rounded-xl border-2 border-slate-300 bg-white p-3 text-sm font-bold text-slate-900 placeholder:text-slate-400 outline-none focus:border-orange-500"
              />
            </label>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="text-xs font-black text-slate-900 block">
              {t("loginId")}
              <input
                value={loginId}
                onChange={(event) => setLoginId(event.target.value)}
                placeholder="e.g. alya25"
                autoCapitalize="none"
                autoComplete="off"
                className="mt-1 w-full rounded-xl border-2 border-slate-300 bg-white p-3 text-sm font-bold text-slate-900 placeholder:text-slate-400 outline-none focus:border-orange-500"
              />
            </label>
            <label className="text-xs font-black text-slate-900 block">
              {t("personalPin")}
              <input
                value={pin}
                onChange={(event) =>
                  setPin(event.target.value.replace(/\D/g, "").slice(0, 8))
                }
                type="password"
                inputMode="numeric"
                autoComplete="new-password"
                placeholder={t("pinPlaceholder")}
                className="mt-1 w-full rounded-xl border-2 border-slate-300 bg-white p-3 text-sm font-bold text-slate-900 placeholder:text-slate-400 outline-none focus:border-orange-500"
              />
            </label>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="text-xs font-black text-slate-900 block">
              {t("schoolGrade")}
              <select
                value={schoolGrade}
                onChange={(event) => setSchoolGrade(event.target.value)}
                className="mt-1 w-full rounded-xl border-2 border-slate-300 bg-white p-3 text-sm font-bold text-slate-900 outline-none focus:border-orange-500"
              >
                {GRADE_LEVELS.map((grade) => (
                  <option key={grade}>{grade}</option>
                ))}
              </select>
            </label>
            <label className="text-xs font-black text-slate-900 block">
              {t("location")}
              <div className="relative mt-1">
                <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                <input
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  placeholder="City / Region"
                  className="w-full rounded-xl border-2 border-slate-300 bg-white py-3 pl-10 pr-3 text-sm font-bold text-slate-900 placeholder:text-slate-400 outline-none focus:border-orange-500"
                />
              </div>
            </label>
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between text-xs font-black text-slate-900">
              <span>{t("readingInterests")}</span>
              <span className="text-slate-600 font-bold">
                {t("selectOneOrMore")}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {INTEREST_CATEGORIES.map((interest) => {
                const active = interests.includes(interest.title);
                return (
                  <button
                    key={interest.title}
                    type="button"
                    onClick={() => toggleInterest(interest.title)}
                    className={`rounded-2xl border-2 p-3 text-left transition cursor-pointer ${
                      active
                        ? "border-orange-600 bg-orange-50 shadow-xs"
                        : "border-slate-300 bg-white hover:border-slate-400"
                    }`}
                  >
                    <span className="text-2xl block">{interest.emoji}</span>
                    <span className="mt-1 block text-xs font-black text-slate-900 leading-tight">
                      {interest.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          <label className="block rounded-2xl border-2 border-sky-300 bg-sky-50/70 p-3 text-xs font-black text-slate-900">
            {t("interestDetailsLabel")}
            <span className="ml-1 font-bold text-slate-600">
              {t("optional")}
            </span>
            <textarea
              value={interestDetails}
              onChange={(event) =>
                setInterestDetails(event.target.value.slice(0, 240))
              }
              placeholder={t("interestDetailsPlaceholder")}
              rows={2}
              className="mt-2 w-full resize-none rounded-xl border-2 border-slate-300 bg-white p-3 text-xs font-bold text-slate-900 placeholder:text-slate-400 outline-none focus:border-sky-600"
            />
            <span className="mt-1 block text-right text-[11px] font-bold text-slate-600">
              {interestDetails.length}/240
            </span>
          </label>
          {error && (
            <p className="rounded-xl border-2 border-rose-300 bg-rose-50 p-3 text-xs font-black text-rose-900">
              {error}
            </p>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStage("auth")}
              className="rounded-xl border-2 border-slate-300 bg-slate-100 hover:bg-slate-200 px-4 text-xs font-black text-slate-900 cursor-pointer"
            >
              {t("back")}
            </button>
            <button
              disabled={busy}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-orange-600 hover:bg-orange-700 py-4 text-sm font-black text-white shadow-[0_3px_0_0_#9A3412] cursor-pointer disabled:opacity-50"
            >
              {busy ? t("saving") : t("registerAndContinue")}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </form>
      )}

      {stage === "login" && (
        <form onSubmit={handleLogin} className="space-y-4 text-center">
          <LogIn className="mx-auto h-10 w-10 text-sky-800" />
          <div>
            <h2 className="text-2xl font-black text-slate-900">
              {t("loginTitle")}
            </h2>
            <p className="text-xs font-bold text-slate-600">
              {t("loginSubtitle")}
            </p>
          </div>
          <input
            value={loginId}
            onChange={(event) => setLoginId(event.target.value)}
            placeholder={t("loginId")}
            autoCapitalize="none"
            className="w-full rounded-xl border-2 border-slate-300 bg-white p-3.5 text-sm font-bold text-slate-900 placeholder:text-slate-400 outline-none focus:border-sky-600"
          />
          <input
            value={pin}
            onChange={(event) =>
              setPin(event.target.value.replace(/\D/g, "").slice(0, 8))
            }
            type="password"
            inputMode="numeric"
            placeholder={t("personalPin")}
            className="w-full rounded-xl border-2 border-slate-300 bg-white p-3.5 text-sm font-bold text-slate-900 placeholder:text-slate-400 outline-none focus:border-sky-600"
          />
          {error && (
            <p className="rounded-xl border-2 border-rose-300 bg-rose-50 p-3 text-xs font-black text-rose-900">
              {error}
            </p>
          )}
          <button
            disabled={busy}
            className="w-full rounded-xl bg-sky-700 hover:bg-sky-800 py-4 text-sm font-black text-white shadow-[0_3px_0_0_#0369A1] cursor-pointer disabled:opacity-50"
          >
            {busy ? t("checking") : t("loginBtn")}
          </button>
          <button
            type="button"
            onClick={() => setStage("auth")}
            className="text-xs font-black text-slate-700 hover:text-slate-900 underline cursor-pointer"
          >
            {t("back")}
          </button>
        </form>
      )}

      {stage === "class" && student && (
        <form onSubmit={handleJoinClass} className="space-y-5 text-center">
          <div className="text-5xl">{student.avatar}</div>
          <div>
            <h2 className="text-2xl font-black text-slate-900">
              {t("helloStudent")}, {student.name}!
            </h2>
            <p className="text-xs font-bold text-slate-600">
              {t("classIntro")}
            </p>
          </div>
          <input
            value={classCode}
            onChange={(event) =>
              setClassCode(event.target.value.toUpperCase().slice(0, 4))
            }
            placeholder="e.g. A490"
            className="w-full rounded-2xl border-2 border-amber-400 bg-amber-50 p-4 text-center font-mono text-2xl font-black tracking-widest text-slate-900 placeholder:text-slate-400 outline-none focus:border-orange-600"
          />
          {error && (
            <p className="rounded-xl border-2 border-rose-300 bg-rose-50 p-3 text-xs font-black text-rose-900">
              {error}
            </p>
          )}
          <button
            disabled={busy || classCode.length < 3}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-600 hover:bg-orange-700 py-4 text-sm font-black text-white shadow-[0_4px_0_0_#9A3412] cursor-pointer disabled:opacity-50"
          >
            {busy ? t("connecting") : t("joinClassBtn")}
            <ArrowRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={logout}
            className="text-xs font-black text-slate-600 hover:text-slate-900 underline cursor-pointer"
          >
            {t("logout")}
          </button>
        </form>
      )}

      {stage === "stories" && student && (
        <div className="space-y-5">
          <div className="flex items-start justify-between rounded-3xl border-2 border-amber-400 bg-amber-50/80 p-5">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{student.avatar}</span>
              <div>
                <h2 className="text-xl font-black text-slate-900">
                  {student.name}
                </h2>
                <p className="flex items-center gap-1 text-xs font-bold text-slate-700">
                  <GraduationCap className="h-3.5 w-3.5 text-slate-800" />
                  {student.school_grade} · {student.reading_level}
                </p>
                <p className="text-xs font-bold text-slate-600">
                  {student.class_code}
                </p>
              </div>
            </div>
            <button
              onClick={() => setStage("class")}
              className="text-xs font-black text-orange-800 hover:text-orange-950 underline cursor-pointer"
            >
              {t("changeClass")}
            </button>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900">
                {t("yourInterestLibrary")}
              </h3>
              <span className="rounded-full bg-slate-100 border border-slate-300 px-2.5 py-1 text-xs font-black text-slate-900">
                {stories.length} {t("storiesCount")}
              </span>
            </div>
            <p className="text-xs font-bold text-slate-600">
              {t("selectStorySubtitle")}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {student.interests?.map((interest: string) => (
              <span
                key={interest}
                className="rounded-full border border-amber-400 bg-amber-100 px-3 py-1 text-xs font-black text-amber-950"
              >
                {
                  INTEREST_CATEGORIES.find((item) => item.title === interest)
                    ?.emoji
                }{" "}
                {interest}
              </span>
            ))}
          </div>

          {activityCount(student.assigned_activities) === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-amber-400 bg-amber-50 p-6 text-center">
              <Lock className="mx-auto mb-2 h-6 w-6 text-amber-800" />
              <p className="text-sm font-black text-slate-900">
                {t("waitingTeacherAssignment")}
              </p>
              <p className="mt-1 text-xs font-bold text-slate-700">
                {t("waitingTeacherSubtitle")}
              </p>
            </div>
          ) : stories.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-sky-300 bg-sky-50 p-6 text-center">
              <p className="text-sm font-black text-slate-900">
                {t("noVerifiedStories")}
              </p>
              <p className="mt-1 text-xs font-bold text-slate-700">
                {t("noVerifiedStoriesSubtitle")}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {stories.map((story) => (
                <button
                  key={story.id}
                  onClick={() => setSelectedStory(story)}
                  className={`rounded-2xl border-2 p-4 text-left transition cursor-pointer ${
                    selectedStory?.id === story.id
                      ? "border-orange-600 bg-orange-50 shadow-xs"
                      : "border-slate-300 bg-white hover:border-slate-400"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">
                      {INTEREST_CATEGORIES.find(
                        (item) => item.title === story.interest,
                      )?.emoji || "📖"}
                    </span>
                    {selectedStory?.id === story.id && (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    )}
                  </div>
                  <span className="mt-2 block text-sm font-black text-slate-900 leading-snug">
                    {story.title}
                  </span>
                  <span className="mt-1 block text-xs font-bold text-slate-600">
                    {story.interest} · {story.word_count} words
                  </span>
                </button>
              ))}
            </div>
          )}

          <button
            onClick={() => setStage("quest")}
            disabled={
              !selectedStory || activityCount(student.assigned_activities) === 0
            }
            className="w-full rounded-2xl bg-orange-600 hover:bg-orange-700 py-4 text-sm font-black text-white shadow-[0_4px_0_0_#9A3412] cursor-pointer disabled:opacity-40"
          >
            {t("startFirstQuest")}
          </button>
          <button
            onClick={logout}
            className="w-full text-xs font-black text-slate-600 hover:text-slate-900 underline cursor-pointer text-center block"
          >
            {t("logout")}
          </button>
        </div>
      )}
    </div>
  );
}
