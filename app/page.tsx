// "use client";

// import React, { useState } from "react";
// import StudentScreeningQuest from "@/components/StudentScreeningQuest";
// import TeacherDashboard from "@/components/TeacherDashboard";
// import { ArrowRight, Users, Sparkles, Lock, CheckCircle2 } from "lucide-react";
// import { supabase } from "@/lib/supabase";

// const ALL_THEMES = [
//   { title: "Folklore & Legends", emoji: "🐉", desc: "Legenda & Dongeng ASEAN" },
//   { title: "Nature & Mangroves", emoji: "🌿", desc: "Konservasi Alam Pesisir" },
//   {
//     title: "Marine Life & Islands",
//     emoji: "🌊",
//     desc: "Terumbu Karang & Pulau",
//   },
//   { title: "Science & Wildlife", emoji: "🔬", desc: "Penyelamatan Satwa Liar" },
// ];

// export default function Home() {
//   const [portal, setPortal] = useState<"home" | "student" | "teacher">("home");
//   const [studentStage, setStudentStage] = useState<
//     "code" | "profile" | "quest"
//   >("code");

//   const [classCode, setClassCode] = useState("A490");
//   const [enrolledStudents, setEnrolledStudents] = useState<any[]>([]);
//   const [selectedStudentName, setSelectedStudentName] = useState("");
//   const [selectedAvatar, setSelectedAvatar] = useState("🐻");

//   // State Cerita yang Terverifikasi
//   const [verifiedStories, setVerifiedStories] = useState<any[]>([]);
//   const [selectedStory, setSelectedStory] = useState<any | null>(null);
//   const [isValidating, setIsValidating] = useState(false);

//   // Verifikasi Kode Kelas & Ambil HANYA Cerita yang Sudah Disetujui Guru
//   const handleVerifyClass = async () => {
//     setIsValidating(true);
//     const cleanCode = classCode.trim().toUpperCase();

//     // 1. Ambil murid terdaftar
//     const { data: stdData } = await supabase
//       .from("students")
//       .select("*")
//       .eq("class_code", cleanCode);

//     if (stdData && stdData.length > 0) {
//       setEnrolledStudents(stdData);
//       setSelectedStudentName(stdData[0].name);
//       setSelectedAvatar(stdData[0].avatar || "🐻");
//     } else {
//       setEnrolledStudents([]);
//       setSelectedStudentName("Murid Tamu");
//     }

//     // 2. Ambil cerita yang HANYA berstatus is_verified = true
//     const { data: storyData } = await supabase
//       .from("stories")
//       .select("*")
//       .eq("class_code", cleanCode)
//       .eq("is_verified", true);

//     if (storyData && storyData.length > 0) {
//       setVerifiedStories(storyData);
//       setSelectedStory(storyData[0]); // Default pilih cerita terverifikasi pertama
//     } else {
//       setVerifiedStories([]);
//       setSelectedStory(null);
//     }

//     setIsValidating(false);
//     setStudentStage("profile");
//   };

//   return (
//     <main className="min-h-screen bg-[#FFFDF7] p-4 sm:p-8 flex flex-col justify-between selection:bg-amber-200">
//       <header className="max-w-4xl mx-auto w-full flex justify-between items-center py-3 bg-white/80 backdrop-blur-md px-6 rounded-full border-2 border-amber-200 shadow-xs mb-6">
//         <span
//           onClick={() => {
//             setPortal("home");
//             setStudentStage("code");
//           }}
//           className="font-black text-xl text-slate-800 cursor-pointer flex items-center gap-2"
//         >
//           <span className="w-8 h-8 rounded-xl bg-amber-400 flex items-center justify-center text-lg">
//             🐻
//           </span>
//           <span>
//             Read<span className="text-orange-500">Buddy</span>AI
//           </span>
//         </span>
//         <button
//           onClick={() => setPortal(portal === "teacher" ? "home" : "teacher")}
//           className="text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 px-3.5 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-amber-200 transition cursor-pointer"
//         >
//           <Users className="w-3.5 h-3.5" />
//           <span>
//             {portal === "teacher" ? "Beranda Murid" : "Teacher Portal"}
//           </span>
//         </button>
//       </header>

//       {/* ======================================================== */}
//       {/* 1. STUDENT FLOW (KODE -> PILIH MINAT TERVERIFIKASI)      */}
//       {/* ======================================================== */}
//       {portal === "home" && (
//         <div className="max-w-md mx-auto w-full bg-white p-7 rounded-[36px] border-2 border-amber-200 shadow-xl space-y-6 my-auto animate-fadeIn">
//           {studentStage === "code" && (
//             <div className="space-y-4 text-center">
//               <div className="inline-flex items-center gap-1.5 bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-black">
//                 <Sparkles className="w-3.5 h-3.5" /> Literacy Screening Quest
//               </div>
//               <h1 className="text-2xl font-black text-slate-900">
//                 Masukkan Kode Kelas
//               </h1>
//               <p className="text-xs text-slate-400">
//                 Mintalah 4-digit kode kelas dari gurumu
//               </p>

//               <input
//                 type="text"
//                 maxLength={4}
//                 value={classCode}
//                 onChange={(e) => setClassCode(e.target.value.toUpperCase())}
//                 placeholder="A490"
//                 className="w-full p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl font-mono font-black text-2xl uppercase tracking-widest text-amber-900 text-center outline-none"
//               />

//               <button
//                 onClick={handleVerifyClass}
//                 disabled={isValidating || classCode.length < 3}
//                 className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-2xl text-sm flex items-center justify-center gap-2 shadow-[0_6px_0_0_#C2410C] transition cursor-pointer disabled:opacity-50"
//               >
//                 <span>
//                   {isValidating ? "Memeriksa Kelas..." : "Lanjut Pilih Profil"}
//                 </span>
//                 <ArrowRight className="w-4 h-4" />
//               </button>
//             </div>
//           )}

//           {studentStage === "profile" && (
//             <div className="space-y-5">
//               <div className="text-center">
//                 <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
//                   Kelas: {classCode}
//                 </span>
//                 <h2 className="text-xl font-black text-slate-800 mt-1">
//                   Siapa yang Membaca?
//                 </h2>
//               </div>

//               {/* Pilih Nama Murid */}
//               <div>
//                 <label className="text-xs font-bold text-slate-500 block mb-1">
//                   Nama Kamu:
//                 </label>
//                 {enrolledStudents.length > 0 ? (
//                   <select
//                     value={selectedStudentName}
//                     onChange={(e) => {
//                       setSelectedStudentName(e.target.value);
//                       const std = enrolledStudents.find(
//                         (s) => s.name === e.target.value,
//                       );
//                       if (std) setSelectedAvatar(std.avatar || "🐻");
//                     }}
//                     className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-2xl font-bold text-sm text-slate-800 outline-none"
//                   >
//                     {enrolledStudents.map((s) => (
//                       <option key={s.id} value={s.name}>
//                         {s.avatar} {s.name}
//                       </option>
//                     ))}
//                   </select>
//                 ) : (
//                   <input
//                     type="text"
//                     value={selectedStudentName}
//                     onChange={(e) => setSelectedStudentName(e.target.value)}
//                     className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-2xl font-bold text-sm text-slate-800 outline-none"
//                   />
//                 )}
//               </div>

//               {/* Pilih Minat / Cerita yang SUDAH diverifikasi guru */}
//               <div>
//                 <div className="flex items-center justify-between mb-2">
//                   <label className="text-xs font-bold text-slate-500">
//                     Pilih Cerita Quest:
//                   </label>
//                   <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
//                     {verifiedStories.length} Tersedia dari Guru
//                   </span>
//                 </div>

//                 {verifiedStories.length === 0 ? (
//                   <div className="p-4 bg-rose-50 border-2 border-rose-200 rounded-2xl text-center space-y-1">
//                     <p className="text-xs font-bold text-rose-800">
//                       Belum ada cerita yang siap!
//                     </p>
//                     <p className="text-[11px] text-rose-600">
//                       Gurumu belum memverifikasi cerita untuk kelas ini di
//                       Teacher Portal.
//                     </p>
//                   </div>
//                 ) : (
//                   <div className="grid grid-cols-2 gap-2">
//                     {ALL_THEMES.map((theme) => {
//                       // Cek apakah ada cerita terverifikasi untuk tema ini
//                       const matchStory = verifiedStories.find(
//                         (s) => s.interest === theme.title,
//                       );
//                       const isAvailable = Boolean(matchStory);
//                       const isSelected =
//                         selectedStory?.id === matchStory?.id && isAvailable;

//                       return (
//                         <button
//                           key={theme.title}
//                           type="button"
//                           disabled={!isAvailable}
//                           onClick={() =>
//                             isAvailable && setSelectedStory(matchStory)
//                           }
//                           className={`p-3 rounded-2xl border-2 text-left transition relative ${
//                             isSelected
//                               ? "bg-amber-50 border-orange-500 shadow-sm"
//                               : isAvailable
//                                 ? "bg-white border-slate-200 hover:border-amber-300 cursor-pointer"
//                                 : "bg-slate-100 border-slate-200 opacity-50 cursor-not-allowed"
//                           }`}
//                         >
//                           <div className="flex items-center justify-between">
//                             <span className="text-xl">{theme.emoji}</span>
//                             {isAvailable ? (
//                               <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
//                             ) : (
//                               <Lock className="w-3.5 h-3.5 text-slate-400" />
//                             )}
//                           </div>
//                           <span className="text-xs font-black text-slate-800 block mt-1 leading-tight">
//                             {theme.title}
//                           </span>
//                           <span className="text-[10px] text-slate-400 block mt-0.5">
//                             {isAvailable
//                               ? matchStory.country_origin
//                               : "Belum Diverifikasi"}
//                           </span>
//                         </button>
//                       );
//                     })}
//                   </div>
//                 )}
//               </div>

//               <button
//                 onClick={() => setStudentStage("quest")}
//                 disabled={!selectedStory}
//                 className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-2xl text-sm flex items-center justify-center gap-2 shadow-[0_6px_0_0_#C2410C] transition cursor-pointer disabled:opacity-40"
//               >
//                 <span>Mulai Membaca 🚀</span>
//                 <ArrowRight className="w-4 h-4" />
//               </button>
//             </div>
//           )}
//         </div>
//       )}

//       {/* ======================================================== */}
//       {/* 2. STUDENT QUEST (HANYA PAKAI CERITA YANG DIPILIH)      */}
//       {/* ======================================================== */}
//       {portal === "home" && studentStage === "quest" && selectedStory && (
//         <StudentScreeningQuest
//           quest={selectedStory}
//           studentName={selectedStudentName}
//           avatar={selectedAvatar}
//           classCode={classCode}
//           onExit={() => {
//             setStudentStage("code");
//             setPortal("home");
//           }}
//         />
//       )}

//       {/* ======================================================== */}
//       {/* 3. TEACHER DASHBOARD                                     */}
//       {/* ======================================================== */}
//       {portal === "teacher" && (
//         <TeacherDashboard onExit={() => setPortal("home")} />
//       )}

//       <footer className="text-center text-xs font-bold text-slate-400 py-2">
//         ReadBuddy AI &copy; 2026 — Verified ASEAN Literacy Screening
//       </footer>
//     </main>
//   );
// }

"use client";

import React, { useState } from "react";
import StudentScreeningQuest from "@/components/StudentScreeningQuest";
import TeacherDashboard from "@/components/TeacherDashboard";
import { ArrowRight, Users, Sparkles, Lock, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

const ALL_THEMES = [
  { title: "Folklore & Legends", emoji: "🐉", desc: "Legenda & Dongeng ASEAN" },
  { title: "Nature & Mangroves", emoji: "🌿", desc: "Konservasi Alam Pesisir" },
  {
    title: "Marine Life & Islands",
    emoji: "🌊",
    desc: "Terumbu Karang & Pulau",
  },
  { title: "Science & Wildlife", emoji: "🔬", desc: "Penyelamatan Satwa Liar" },
];

export default function Home() {
  const [portal, setPortal] = useState<"home" | "student" | "teacher">("home");
  const [studentStage, setStudentStage] = useState<
    "code" | "profile" | "quest"
  >("code");

  const [classCode, setClassCode] = useState("");
  const [enrolledStudents, setEnrolledStudents] = useState<any[]>([]);
  const [selectedStudentName, setSelectedStudentName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("🐻");

  const [verifiedStories, setVerifiedStories] = useState<any[]>([]);
  const [selectedStory, setSelectedStory] = useState<any | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const handleVerifyClass = async () => {
    if (!classCode.trim()) return;
    setIsValidating(true);
    const cleanCode = classCode.trim().toUpperCase();

    const { data: stdData } = await supabase
      .from("students")
      .select("*")
      .eq("class_code", cleanCode)
      .order("name", { ascending: true });

    if (stdData && stdData.length > 0) {
      setEnrolledStudents(stdData);
      setSelectedStudentName(stdData[0].name);
      setSelectedAvatar(stdData[0].avatar || "🐻");
    } else {
      setEnrolledStudents([]);
      setSelectedStudentName("Murid Tamu");
    }

    const { data: storyData } = await supabase
      .from("stories")
      .select("*")
      .eq("class_code", cleanCode)
      .eq("is_verified", true);

    if (storyData && storyData.length > 0) {
      setVerifiedStories(storyData);
      setSelectedStory(storyData[0]);
    } else {
      setVerifiedStories([]);
      setSelectedStory(null);
    }

    setIsValidating(false);
    setStudentStage("profile");
  };

  return (
    <main className="min-h-screen bg-[#FFFDF7] p-4 sm:p-8 flex flex-col justify-between selection:bg-amber-200">
      <header className="max-w-4xl mx-auto w-full flex justify-between items-center py-3 bg-white px-6 rounded-full border-2 border-slate-300 shadow-xs mb-6">
        <span
          onClick={() => {
            setPortal("home");
            setStudentStage("code");
          }}
          className="font-black text-xl text-slate-900 cursor-pointer flex items-center gap-2"
        >
          <span className="w-8 h-8 rounded-xl bg-amber-400 border border-amber-600 flex items-center justify-center text-lg">
            🐻
          </span>
          <span>
            Read<span className="text-orange-600">Buddy</span>AI
          </span>
        </span>
        <button
          onClick={() => setPortal(portal === "teacher" ? "home" : "teacher")}
          className="text-xs font-black bg-amber-100 text-amber-950 border-2 border-amber-400 px-3.5 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-amber-200 transition cursor-pointer"
        >
          <Users className="w-3.5 h-3.5" />
          <span>
            {portal === "teacher" ? "Beranda Murid" : "Teacher Portal"}
          </span>
        </button>
      </header>

      {/* ======================================================== */}
      {/* 1. STUDENT FLOW                                          */}
      {/* ======================================================== */}
      {portal === "home" && (
        <div className="max-w-md mx-auto w-full bg-white p-7 rounded-[36px] border-2 border-slate-300 shadow-xl space-y-6 my-auto animate-fadeIn">
          {studentStage === "code" && (
            <div className="space-y-4 text-center">
              <div className="inline-flex items-center gap-1.5 bg-orange-100 border border-orange-300 text-orange-900 px-3 py-1 rounded-full text-xs font-black">
                <Sparkles className="w-3.5 h-3.5 text-orange-600" /> Literacy
                Screening Quest
              </div>
              <h1 className="text-2xl font-black text-slate-900">
                Masukkan Kode Kelas
              </h1>
              <p className="text-xs font-semibold text-slate-600">
                Mintalah 4-digit kode kelas dari gurumu
              </p>

              <input
                type="text"
                maxLength={4}
                value={classCode}
                onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                placeholder="Contoh: A490"
                className="w-full p-4 bg-amber-50 border-2 border-amber-400 rounded-2xl font-mono font-black text-2xl uppercase tracking-widest text-slate-900 placeholder:text-slate-400 text-center outline-none focus:border-orange-600"
              />

              <button
                onClick={handleVerifyClass}
                disabled={isValidating || classCode.length < 3}
                className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white font-black rounded-2xl text-sm flex items-center justify-center gap-2 shadow-[0_4px_0_0_#9A3412] transition cursor-pointer disabled:opacity-50"
              >
                <span>
                  {isValidating ? "Memeriksa Kelas..." : "Lanjut Pilih Profil"}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {studentStage === "profile" && (
            <div className="space-y-5">
              <div className="text-center">
                <span className="text-xs font-black bg-emerald-100 text-emerald-900 px-3 py-1 rounded-full border border-emerald-300">
                  Kode Kelas: {classCode}
                </span>
                <h2 className="text-xl font-black text-slate-900 mt-2">
                  Siapa yang Membaca?
                </h2>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Pilih Nama Kamu:
                </label>
                {enrolledStudents.length > 0 ? (
                  <select
                    value={selectedStudentName}
                    onChange={(e) => {
                      setSelectedStudentName(e.target.value);
                      const std = enrolledStudents.find(
                        (s) => s.name === e.target.value,
                      );
                      if (std) setSelectedAvatar(std.avatar || "🐻");
                    }}
                    className="w-full p-3 bg-white border-2 border-slate-300 rounded-2xl font-bold text-sm text-slate-900 outline-none focus:border-orange-500"
                  >
                    {enrolledStudents.map((s) => (
                      <option
                        key={s.id}
                        value={s.name}
                        className="text-slate-900 font-bold"
                      >
                        {s.avatar} {s.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={selectedStudentName}
                    onChange={(e) => setSelectedStudentName(e.target.value)}
                    placeholder="Ketik Nama Siswa"
                    className="w-full p-3 bg-white border-2 border-slate-300 rounded-2xl font-bold text-sm text-slate-900 outline-none focus:border-orange-500"
                  />
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-800">
                    Pilih Cerita Quest:
                  </label>
                  <span className="text-xs font-black text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-300">
                    {verifiedStories.length} Tersedia dari Guru
                  </span>
                </div>

                {verifiedStories.length === 0 ? (
                  <div className="p-4 bg-rose-50 border-2 border-rose-300 rounded-2xl text-center space-y-1">
                    <p className="text-xs font-black text-rose-900">
                      Belum ada cerita yang siap!
                    </p>
                    <p className="text-xs font-semibold text-rose-700">
                      Gurumu belum memverifikasi cerita untuk kelas ini di
                      Teacher Portal.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {ALL_THEMES.map((theme) => {
                      const matchStory = verifiedStories.find(
                        (s) => s.interest === theme.title,
                      );
                      const isAvailable = Boolean(matchStory);
                      const isSelected =
                        selectedStory?.id === matchStory?.id && isAvailable;

                      return (
                        <button
                          key={theme.title}
                          type="button"
                          disabled={!isAvailable}
                          onClick={() =>
                            isAvailable && setSelectedStory(matchStory)
                          }
                          className={`p-3 rounded-2xl border-2 text-left transition relative ${
                            isSelected
                              ? "bg-amber-50 border-orange-600 shadow-sm"
                              : isAvailable
                                ? "bg-white border-slate-300 hover:border-amber-400 cursor-pointer"
                                : "bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-2xl">{theme.emoji}</span>
                            {isAvailable ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Lock className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                          <span className="text-xs font-black text-slate-900 block mt-1 leading-tight">
                            {theme.title}
                          </span>
                          <span className="text-[11px] font-bold text-slate-500 block mt-0.5">
                            {isAvailable
                              ? matchStory.country_origin
                              : "Belum Diverifikasi"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <button
                onClick={() => setStudentStage("quest")}
                disabled={!selectedStory}
                className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white font-black rounded-2xl text-sm flex items-center justify-center gap-2 shadow-[0_4px_0_0_#9A3412] transition cursor-pointer disabled:opacity-40"
              >
                <span>Mulai Membaca 🚀</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {portal === "home" && studentStage === "quest" && selectedStory && (
        <StudentScreeningQuest
          quest={selectedStory}
          studentName={selectedStudentName}
          avatar={selectedAvatar}
          classCode={classCode}
          onExit={() => {
            setStudentStage("code");
            setPortal("home");
          }}
        />
      )}

      {portal === "teacher" && (
        <TeacherDashboard onExit={() => setPortal("home")} />
      )}

      <footer className="text-center text-xs font-bold text-slate-500 py-2">
        ReadBuddy AI &copy; 2026 — Verified ASEAN Literacy Screening
      </footer>
    </main>
  );
}
