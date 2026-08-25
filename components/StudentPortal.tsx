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

type StudentStage = "auth" | "register" | "login" | "class" | "stories" | "quest";

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
      setError("Lengkapi semua data, pilih minat, dan gunakan PIN minimal 4 digit.");
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
      setError("ID login sudah dipakai. Pilih ID lain atau masuk ke profil lama.");
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
      setError(registrationError?.message || "Registrasi belum dapat disimpan.");
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
      setError("Masukkan ID login dan PIN.");
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
      setError("ID login atau PIN tidak cocok.");
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
      setError("Perpustakaan tugas belum dapat dimuat.");
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
      setError("Kode kelas tidak ditemukan.");
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
      setError("Kelas belum dapat dihubungkan ke profilmu.");
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
    <div className={`${stage === "register" || stage === "stories" ? "max-w-2xl" : "max-w-md"} mx-auto my-auto w-full rounded-[36px] border-2 border-slate-300 bg-white p-7 shadow-xl animate-fadeIn`}>
      {stage === "auth" && (
        <div className="space-y-5 text-center">
          <div className="text-5xl">🐻</div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Profil Belajar Siswa</h1>
            <p className="mt-1 text-xs font-semibold text-slate-600">
              Buat profil atau masuk sebelum bergabung ke kelas.
            </p>
          </div>
          <button
            onClick={() => { resetAuthForm(); setStage("register"); }}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-600 py-4 text-sm font-black text-white shadow-[0_4px_0_0_#9A3412]"
          >
            <UserPlus className="h-4 w-4" /> Registrasi Profil Baru
          </button>
          <button
            onClick={() => { resetAuthForm(); setStage("login"); }}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-sky-600 bg-sky-50 py-4 text-sm font-black text-sky-800"
          >
            <LogIn className="h-4 w-4" /> Login ke Profil Saya
          </button>
        </div>
      )}

      {stage === "register" && (
        <form onSubmit={handleRegister} autoComplete="off" className="space-y-5">
          <div className="text-center">
            <h2 className="text-2xl font-black text-slate-900">Registrasi Profil</h2>
            <p className="text-xs font-semibold text-slate-600">Kelas dipilih setelah profil selesai.</p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[110px_1fr]">
            <label className="text-xs font-bold text-slate-700">Avatar
              <select value={avatar} onChange={(event) => setAvatar(event.target.value)} className="mt-1 w-full rounded-xl border-2 border-slate-300 bg-white p-3 text-xl">
                {["🐻", "🦊", "🦁", "🐼", "🐰", "🦄"].map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            <label className="text-xs font-bold text-slate-700">Nama panggilan
              <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Contoh: Nabila" className="mt-1 w-full rounded-xl border-2 border-slate-300 p-3 text-sm font-bold" />
            </label>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="text-xs font-bold text-slate-700">ID login
              <input value={loginId} onChange={(event) => setLoginId(event.target.value)} placeholder="Contoh: nabila25" autoCapitalize="none" autoComplete="off" className="mt-1 w-full rounded-xl border-2 border-slate-300 p-3 text-sm font-bold" />
            </label>
            <label className="text-xs font-bold text-slate-700">PIN pribadi
              <input value={pin} onChange={(event) => setPin(event.target.value.replace(/\D/g, "").slice(0, 8))} type="password" inputMode="numeric" autoComplete="new-password" placeholder="Minimal 4 digit" className="mt-1 w-full rounded-xl border-2 border-slate-300 p-3 text-sm font-bold" />
            </label>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="text-xs font-bold text-slate-700">Tingkat sekolah
              <select value={schoolGrade} onChange={(event) => setSchoolGrade(event.target.value)} className="mt-1 w-full rounded-xl border-2 border-slate-300 bg-white p-3 text-sm font-bold">
                {GRADE_LEVELS.map((grade) => <option key={grade}>{grade}</option>)}
              </select>
            </label>
            <label className="text-xs font-bold text-slate-700">Lokasi
              <div className="relative mt-1">
                <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                <input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Kota / wilayah" className="w-full rounded-xl border-2 border-slate-300 py-3 pl-10 pr-3 text-sm font-bold" />
              </div>
            </label>
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between text-xs font-bold text-slate-700"><span>Minat bacaan</span><span className="text-slate-500">Pilih satu atau lebih</span></div>
            <div className="grid grid-cols-2 gap-2">
              {INTEREST_CATEGORIES.map((interest) => {
                const active = interests.includes(interest.title);
                return <button key={interest.title} type="button" onClick={() => toggleInterest(interest.title)} className={`rounded-2xl border-2 p-3 text-left ${active ? "border-orange-500 bg-orange-50" : "border-slate-200"}`}><span className="text-2xl">{interest.emoji}</span><span className="mt-1 block text-xs font-black text-slate-900">{interest.title}</span></button>;
              })}
            </div>
          </div>
          <label className="block rounded-2xl border border-sky-200 bg-sky-50 p-3 text-xs font-bold text-slate-700">
            Ceritakan minatmu lebih detail
            <span className="ml-1 font-semibold text-slate-500">(opsional)</span>
            <textarea
              value={interestDetails}
              onChange={(event) => setInterestDetails(event.target.value.slice(0, 240))}
              placeholder="Contoh: Aku suka sepak bola, menggambar robot, ikan laut, dan cerita petualangan lucu."
              rows={2}
              className="mt-2 w-full resize-none rounded-xl border-2 border-sky-200 bg-white p-3 text-sm font-semibold text-slate-900 outline-none focus:border-sky-500"
            />
            <span className="mt-1 block text-right text-[10px] font-semibold text-slate-500">
              {interestDetails.length}/240
            </span>
          </label>
          {error && <p className="rounded-xl border border-rose-300 bg-rose-50 p-3 text-xs font-bold text-rose-800">{error}</p>}
          <div className="flex gap-2">
            <button type="button" onClick={() => setStage("auth")} className="rounded-xl border-2 border-slate-300 px-4 text-xs font-black text-slate-700">Kembali</button>
            <button disabled={busy} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-orange-600 py-4 text-sm font-black text-white disabled:opacity-50">{busy ? "Menyimpan..." : "Daftar & Lanjut"}<ArrowRight className="h-4 w-4" /></button>
          </div>
        </form>
      )}

      {stage === "login" && (
        <form onSubmit={handleLogin} className="space-y-4 text-center">
          <LogIn className="mx-auto h-10 w-10 text-sky-700" />
          <div><h2 className="text-2xl font-black text-slate-900">Login Siswa</h2><p className="text-xs font-semibold text-slate-600">Masuk dulu, lalu pilih kelasmu.</p></div>
          <input value={loginId} onChange={(event) => setLoginId(event.target.value)} placeholder="ID login" autoCapitalize="none" className="w-full rounded-xl border-2 border-slate-300 p-3 text-sm font-bold" />
          <input value={pin} onChange={(event) => setPin(event.target.value.replace(/\D/g, "").slice(0, 8))} type="password" inputMode="numeric" placeholder="PIN" className="w-full rounded-xl border-2 border-slate-300 p-3 text-sm font-bold" />
          {error && <p className="rounded-xl border border-rose-300 bg-rose-50 p-3 text-xs font-bold text-rose-800">{error}</p>}
          <button disabled={busy} className="w-full rounded-xl bg-sky-700 py-4 text-sm font-black text-white disabled:opacity-50">{busy ? "Memeriksa..." : "Login"}</button>
          <button type="button" onClick={() => setStage("auth")} className="text-xs font-black text-slate-600 underline">Kembali</button>
        </form>
      )}

      {stage === "class" && student && (
        <form onSubmit={handleJoinClass} className="space-y-5 text-center">
          <div className="text-5xl">{student.avatar}</div>
          <div><h2 className="text-2xl font-black text-slate-900">Halo, {student.name}!</h2><p className="text-xs font-semibold text-slate-600">Profilmu siap. Sekarang masukkan kode kelas dari guru.</p></div>
          <input value={classCode} onChange={(event) => setClassCode(event.target.value.toUpperCase().slice(0, 4))} placeholder="Contoh: A490" className="w-full rounded-2xl border-2 border-amber-400 bg-amber-50 p-4 text-center font-mono text-2xl font-black tracking-widest" />
          {error && <p className="rounded-xl border border-rose-300 bg-rose-50 p-3 text-xs font-bold text-rose-800">{error}</p>}
          <button disabled={busy || classCode.length < 3} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-600 py-4 text-sm font-black text-white disabled:opacity-50">{busy ? "Menghubungkan..." : "Gabung Kelas"}<ArrowRight className="h-4 w-4" /></button>
          <button type="button" onClick={logout} className="text-xs font-black text-slate-500 underline">Keluar dari profil</button>
        </form>
      )}

      {stage === "stories" && student && (
        <div className="space-y-5">
          <div className="flex items-start justify-between rounded-3xl border-2 border-amber-300 bg-amber-50 p-5">
            <div className="flex items-center gap-3"><span className="text-4xl">{student.avatar}</span><div><h2 className="text-xl font-black text-slate-900">{student.name}</h2><p className="flex items-center gap-1 text-xs font-bold text-slate-600"><GraduationCap className="h-3.5 w-3.5" />{student.school_grade} · Bacaan {student.reading_level}</p><p className="text-xs font-semibold text-slate-500">Kelas {student.class_code}</p></div></div>
            <button onClick={() => setStage("class")} className="text-xs font-black text-orange-700 underline">Ganti kelas</button>
          </div>
          <div><div className="mb-2 flex items-center justify-between"><h3 className="text-sm font-black text-slate-900">Perpustakaan Minatmu</h3><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-700">{stories.length} cerita</span></div><p className="text-xs font-semibold text-slate-500">Urutannya dibagi berbeda untuk setiap siswa dengan minat yang sama.</p></div>
          <div className="flex flex-wrap gap-2">{student.interests?.map((interest: string) => <span key={interest} className="rounded-full border border-amber-300 bg-amber-100 px-3 py-1 text-xs font-black text-amber-900">{INTEREST_CATEGORIES.find((item) => item.title === interest)?.emoji} {interest}</span>)}</div>
          {activityCount(student.assigned_activities) === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50 p-6 text-center"><Lock className="mx-auto mb-2 h-6 w-6 text-amber-700" /><p className="text-sm font-black text-slate-900">Menunggu assignment guru</p><p className="mt-1 text-xs font-semibold text-slate-600">Guru dapat melihat minatmu dan memilih aktivitas yang perlu dikerjakan.</p></div>
          ) : stories.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-sky-300 bg-sky-50 p-6 text-center"><p className="text-sm font-black text-slate-900">Belum ada cerita terverifikasi untuk minatmu</p><p className="mt-1 text-xs font-semibold text-slate-600">Guru sedang menyiapkan perpustakaan kategori kelas.</p></div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{stories.map((story) => <button key={story.id} onClick={() => setSelectedStory(story)} className={`rounded-2xl border-2 p-4 text-left ${selectedStory?.id === story.id ? "border-orange-500 bg-orange-50" : "border-slate-200"}`}><div className="flex items-center justify-between"><span className="text-2xl">{INTEREST_CATEGORIES.find((item) => item.title === story.interest)?.emoji || "📖"}</span>{selectedStory?.id === story.id && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}</div><span className="mt-2 block text-sm font-black text-slate-900">{story.title}</span><span className="mt-1 block text-xs font-semibold text-slate-500">{story.interest} · {story.word_count} kata</span></button>)}</div>
          )}
          <button onClick={() => setStage("quest")} disabled={!selectedStory || activityCount(student.assigned_activities) === 0} className="w-full rounded-2xl bg-orange-600 py-4 text-sm font-black text-white disabled:opacity-40">Mulai Tugas Pertama →</button>
          <button onClick={logout} className="w-full text-xs font-black text-slate-500 underline">Logout</button>
        </div>
      )}
    </div>
  );
}
