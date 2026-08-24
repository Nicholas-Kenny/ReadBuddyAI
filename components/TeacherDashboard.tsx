// "use client";

// import React, { useState, useEffect } from "react";
// import {
//   LogOut,
//   RefreshCw,
//   BarChart2,
//   PlusCircle,
//   UserPlus,
//   Layers,
//   History,
//   CheckCircle2,
//   Sparkles,
//   ShieldCheck,
//   Edit3,
//   XCircle,
// } from "lucide-react";
// import { supabase } from "@/lib/supabase";

// export default function TeacherDashboard({ onExit }: { onExit: () => void }) {
//   const [isAuth, setIsAuth] = useState(false);
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [activeTab, setActiveTab] = useState<
//     "analytics" | "stories" | "classes"
//   >("stories");

//   const [classes, setClasses] = useState<any[]>([]);
//   const [selectedClassCode, setSelectedClassCode] = useState("A490");
//   const [selectedGrade, setSelectedGrade] = useState("Grade 2");
//   const [studentsList, setStudentsList] = useState<any[]>([]);
//   const [assessments, setAssessments] = useState<any[]>([]);
//   const [stories, setStories] = useState<any[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [generatingAi, setGeneratingAi] = useState(false);

//   // Form States
//   const [newClassName, setNewClassName] = useState("");
//   const [newStudentName, setNewStudentName] = useState("");
//   const [newStudentAvatar, setNewStudentAvatar] = useState("🐻");
//   const [genInterest, setGenInterest] = useState("Folklore & Legends");

//   // Modal State
//   const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
//   const [inspectStory, setInspectStory] = useState<any | null>(null);

//   const fetchData = async () => {
//     setLoading(true);
//     const { data: cls } = await supabase
//       .from("classes")
//       .select("*")
//       .order("created_at", { ascending: false });
//     if (cls && cls.length > 0) {
//       setClasses(cls);
//       const activeCls = cls.find((c) => c.code === selectedClassCode);
//       if (activeCls) setSelectedGrade(activeCls.grade);
//     }

//     const { data: std } = await supabase
//       .from("students")
//       .select("*")
//       .eq("class_code", selectedClassCode);
//     if (std) setStudentsList(std);

//     const { data: asm } = await supabase
//       .from("assessments")
//       .select("*")
//       .eq("class_code", selectedClassCode)
//       .order("created_at", { ascending: false });
//     if (asm) setAssessments(asm);

//     const { data: sty } = await supabase
//       .from("stories")
//       .select("*")
//       .eq("class_code", selectedClassCode)
//       .order("created_at", { ascending: false });
//     if (sty) setStories(sty);

//     setLoading(false);
//   };

//   useEffect(() => {
//     if (isAuth) fetchData();
//   }, [isAuth, selectedClassCode]);

//   const handleGenerateStory = async () => {
//     setGeneratingAi(true);
//     try {
//       const res = await fetch("/api/generate-quest", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           grade: selectedGrade,
//           interest: genInterest,
//           classCode: selectedClassCode,
//           autoSave: true,
//         }),
//       });
//       const data = await res.json();
//       if (data && data.id) {
//         setStories([data, ...stories]);
//       }
//     } catch (e) {
//       alert("Gagal membuat cerita dengan AI");
//     } finally {
//       setGeneratingAi(false);
//     }
//   };

//   const handleToggleVerifyStory = async (
//     storyId: string,
//     currentStatus: boolean,
//   ) => {
//     const nextStatus = !currentStatus;
//     const { error } = await supabase
//       .from("stories")
//       .update({ is_verified: nextStatus })
//       .eq("id", storyId);
//     if (!error) {
//       setStories(
//         stories.map((s) =>
//           s.id === storyId ? { ...s, is_verified: nextStatus } : s,
//         ),
//       );
//     }
//   };

//   const groupedStudents = React.useMemo(() => {
//     const map = new Map<string, any[]>();
//     assessments.forEach((r) => {
//       const prev = map.get(r.student_name) || [];
//       prev.push(r);
//       map.set(r.student_name, prev);
//     });

//     const res: any[] = [];
//     map.forEach((records, name) => {
//       const latest = records[0];
//       const match = studentsList.find(
//         (s) => s.name.toLowerCase() === name.toLowerCase(),
//       );
//       res.push({
//         name,
//         avatar: match?.avatar || "🐻",
//         latestWcpm: latest.wcpm,
//         latestAccuracy: latest.accuracy,
//         latestBloom: latest.total_bloom_score,
//         latestComposite: latest.composite_score,
//         status: latest.status,
//         totalAttempts: records.length,
//         latestRecord: latest,
//         history: records,
//       });
//     });
//     return res;
//   }, [assessments, studentsList]);

//   if (!isAuth) {
//     return (
//       <div className="max-w-sm mx-auto bg-white p-7 rounded-[32px] border-2 border-amber-200 shadow-xl text-center space-y-4 my-auto animate-fadeIn">
//         <div className="w-14 h-14 bg-amber-100 text-amber-800 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-1">
//           🔑
//         </div>
//         <h2 className="text-2xl font-black text-slate-800">Teacher Login</h2>
//         <p className="text-xs text-slate-400">
//           Masuk untuk memverifikasi bank cerita AI & kelola kelas
//         </p>
//         <form
//           onSubmit={(e) => {
//             e.preventDefault();
//             if (username === "guru" && password === "admin123") setIsAuth(true);
//             else alert("Demo kredensial: guru / admin123");
//           }}
//           className="space-y-3 pt-2"
//         >
//           <input
//             type="text"
//             placeholder="Username (guru)"
//             value={username}
//             onChange={(e) => setUsername(e.target.value)}
//             className="w-full p-3.5 bg-slate-50 border-2 border-slate-200 rounded-2xl text-xs font-bold outline-none focus:border-orange-400"
//           />
//           <input
//             type="password"
//             placeholder="Password (admin123)"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             className="w-full p-3.5 bg-slate-50 border-2 border-slate-200 rounded-2xl text-xs font-bold outline-none focus:border-orange-400"
//           />
//           <button
//             type="submit"
//             className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-2xl shadow-[0_4px_0_0_#C2410C] text-xs transition cursor-pointer"
//           >
//             Masuk Portal Guru
//           </button>
//         </form>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-5xl mx-auto w-full bg-white p-6 sm:p-8 rounded-[36px] border-2 border-amber-200 shadow-xl space-y-6 my-auto animate-fadeIn">
//       {/* Top Controls */}
//       <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b">
//         <div className="space-y-1">
//           <div className="flex items-center gap-3">
//             <h2 className="text-xl font-black text-slate-900">
//               Dashboard Guru & Verifikator AI
//             </h2>
//             <select
//               value={selectedClassCode}
//               onChange={(e) => setSelectedClassCode(e.target.value)}
//               className="bg-amber-100 text-amber-900 font-mono font-black text-xs px-3 py-1.5 rounded-xl border border-amber-300 outline-none cursor-pointer"
//             >
//               {classes.map((c) => (
//                 <option key={c.code} value={c.code}>
//                   {c.name} (Kode: {c.code} • {c.grade})
//                 </option>
//               ))}
//             </select>
//           </div>
//           <p className="text-xs text-slate-400">
//             Verifikasi konten cerita AI dan pantau pertumbuhan literasi murid
//           </p>
//         </div>

//         <div className="flex items-center gap-2">
//           <button
//             onClick={() => setActiveTab("stories")}
//             className={`text-xs font-bold px-3 py-2 rounded-xl transition ${activeTab === "stories" ? "bg-orange-500 text-white" : "bg-slate-100 text-slate-700"}`}
//           >
//             📖 Bank Cerita AI
//           </button>
//           <button
//             onClick={() => setActiveTab("analytics")}
//             className={`text-xs font-bold px-3 py-2 rounded-xl transition ${activeTab === "analytics" ? "bg-orange-500 text-white" : "bg-slate-100 text-slate-700"}`}
//           >
//             📊 Hasil Skrining
//           </button>
//           <button
//             onClick={() => setActiveTab("classes")}
//             className={`text-xs font-bold px-3 py-2 rounded-xl transition ${activeTab === "classes" ? "bg-orange-500 text-white" : "bg-slate-100 text-slate-700"}`}
//           >
//             👥 Kelas &amp; Murid
//           </button>
//           <button
//             onClick={onExit}
//             className="text-xs font-bold text-rose-500 hover:bg-rose-50 p-2 rounded-xl"
//           >
//             <LogOut className="w-4 h-4" />
//           </button>
//         </div>
//       </div>

//       {/* ======================================================== */}
//       {/* TAB 1: BANK CERITA & VERIFIKASI GURU                     */}
//       {/* ======================================================== */}
//       {activeTab === "stories" && (
//         <div className="space-y-4 animate-fadeIn">
//           {/* Action Generator Box */}
//           <div className="p-5 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 rounded-3xl border-2 border-amber-200 flex flex-wrap items-center justify-between gap-4">
//             <div>
//               <span className="text-xs font-black uppercase text-orange-600 block">
//                 AI Quest Generator
//               </span>
//               <h3 className="text-base font-black text-slate-800">
//                 Generate Cerita Rakyat &amp; Soal C1–C4 Baru
//               </h3>
//               <p className="text-[11px] text-slate-500">
//                 Randomisasi asal negara (Indonesia 🇮🇩, Philippines 🇵🇭, Malaysia
//                 🇲🇾) sesuai {selectedGrade}
//               </p>
//             </div>

//             <div className="flex items-center gap-2">
//               <select
//                 value={genInterest}
//                 onChange={(e) => setGenInterest(e.target.value)}
//                 className="p-2 bg-white border border-amber-300 rounded-xl text-xs font-bold outline-none"
//               >
//                 <option value="Folklore & Legends">
//                   🐉 Cerita Rakyat &amp; Legenda
//                 </option>
//                 <option value="Nature & Mangroves">
//                   🌿 Alam &amp; Konservasi
//                 </option>
//                 <option value="Marine Life & Islands">
//                   🌊 Laut &amp; Terumbu Karang
//                 </option>
//                 <option value="Science & Wildlife">
//                   🔬 Sains &amp; Satwa Hutan
//                 </option>
//               </select>

//               <button
//                 onClick={handleGenerateStory}
//                 disabled={generatingAi}
//                 className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-black text-xs rounded-xl flex items-center gap-1.5 shadow-[0_3px_0_0_#C2410C] disabled:opacity-50 cursor-pointer"
//               >
//                 <Sparkles className="w-3.5 h-3.5" />
//                 <span>
//                   {generatingAi
//                     ? "Meracik dengan Gemini..."
//                     : "Generate AI Story"}
//                 </span>
//               </button>
//             </div>
//           </div>

//           {/* List Cerita */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             {stories.length === 0 ? (
//               <div className="col-span-2 p-10 bg-slate-50 border border-slate-200 rounded-3xl text-center text-slate-400 italic text-xs">
//                 Belum ada cerita yang dibuat untuk kelas ini. Klik tombol di
//                 atas untuk generate!
//               </div>
//             ) : (
//               stories.map((s) => (
//                 <div
//                   key={s.id}
//                   className="p-4 bg-white border-2 border-slate-200 rounded-3xl space-y-3 shadow-xs"
//                 >
//                   <div className="flex items-center justify-between">
//                     <span className="text-xs font-black bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full">
//                       {s.country_origin}
//                     </span>
//                     <button
//                       onClick={() =>
//                         handleToggleVerifyStory(s.id, s.is_verified)
//                       }
//                       className={`px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-1 transition cursor-pointer ${
//                         s.is_verified
//                           ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
//                           : "bg-amber-100 text-amber-800 border border-amber-300"
//                       }`}
//                     >
//                       {s.is_verified ? (
//                         <CheckCircle2 className="w-3 h-3 text-emerald-600" />
//                       ) : (
//                         <ShieldCheck className="w-3 h-3" />
//                       )}
//                       <span>
//                         {s.is_verified
//                           ? "Terverifikasi Guru ✓"
//                           : "Belum Diverifikasi (Klik)"}
//                       </span>
//                     </button>
//                   </div>

//                   <div>
//                     <h4 className="font-black text-slate-900 text-sm">
//                       {s.title}
//                     </h4>
//                     <p className="text-xs text-slate-500 line-clamp-2 mt-1 italic">
//                       &ldquo;{s.passage_text}&rdquo;
//                     </p>
//                   </div>

//                   <div className="flex items-center justify-between pt-2 border-t text-[11px] text-slate-400 font-bold">
//                     <span>
//                       {s.word_count} Kata • {s.grade}
//                     </span>
//                     <button
//                       onClick={() => setInspectStory(s)}
//                       className="text-orange-600 hover:underline font-black cursor-pointer"
//                     >
//                       Review Soal C1–C4 &rarr;
//                     </button>
//                   </div>
//                 </div>
//               ))
//             )}
//           </div>
//         </div>
//       )}

//       {/* ======================================================== */}
//       {/* TAB 2: ANALYTICS & GROUPED STUDENTS                      */}
//       {/* ======================================================== */}
//       {activeTab === "analytics" && (
//         <div className="space-y-4 animate-fadeIn">
//           <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
//             <table className="w-full text-left text-xs">
//               <thead className="bg-slate-50 border-b text-slate-500 font-bold">
//                 <tr>
//                   <th className="p-3">Nama Murid</th>
//                   <th className="p-3">Fluency Terakhir</th>
//                   <th className="p-3">Akurasi</th>
//                   <th className="p-3">Bloom C1–C4</th>
//                   <th className="p-3">Composite</th>
//                   <th className="p-3">Riwayat</th>
//                   <th className="p-3">Status</th>
//                   <th className="p-3 text-right">Detail</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-slate-100">
//                 {groupedStudents.length === 0 ? (
//                   <tr>
//                     <td
//                       colSpan={8}
//                       className="p-8 text-center text-slate-400 italic"
//                     >
//                       Belum ada pengerjaan skrining untuk kelas ini.
//                     </td>
//                   </tr>
//                 ) : (
//                   groupedStudents.map((std) => (
//                     <tr
//                       key={std.name}
//                       className="hover:bg-amber-50/40 transition"
//                     >
//                       <td className="p-3 font-bold text-slate-800 flex items-center gap-2">
//                         <span>{std.avatar}</span>
//                         <button
//                           onClick={() => setSelectedStudent(std)}
//                           className="hover:text-orange-600 font-black text-left cursor-pointer hover:underline"
//                         >
//                           {std.name}
//                         </button>
//                       </td>
//                       <td className="p-3 font-mono font-bold text-orange-600">
//                         {std.latestWcpm} WCPM
//                       </td>
//                       <td className="p-3 font-mono font-bold text-slate-700">
//                         {std.latestAccuracy}%
//                       </td>
//                       <td className="p-3 font-mono font-bold text-purple-600">
//                         {std.latestBloom}/100
//                       </td>
//                       <td className="p-3 font-mono font-black text-indigo-600">
//                         {std.latestComposite}/100
//                       </td>
//                       <td className="p-3">
//                         <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
//                           {std.totalAttempts}x Sesi
//                         </span>
//                       </td>
//                       <td className="p-3">
//                         <span
//                           className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
//                             std.status === "green"
//                               ? "bg-emerald-100 text-emerald-800"
//                               : std.status === "yellow"
//                                 ? "bg-amber-100 text-amber-800"
//                                 : "bg-rose-100 text-rose-800"
//                           }`}
//                         >
//                           {std.status.toUpperCase()}
//                         </span>
//                       </td>
//                       <td className="p-3 text-right">
//                         <button
//                           onClick={() => setSelectedStudent(std)}
//                           className="px-2.5 py-1 bg-blue-50 text-blue-600 font-bold rounded-lg text-xs"
//                         >
//                           Lihat Log
//                         </button>
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}

//       {/* ======================================================== */}
//       {/* TAB 3: KELOLA KELAS & MURID                              */}
//       {/* ======================================================== */}
//       {activeTab === "classes" && (
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
//           <div className="bg-amber-50/50 p-6 rounded-3xl border-2 border-amber-200 space-y-3">
//             <h3 className="font-black text-slate-800 text-sm">
//               Buat Kelas Baru
//             </h3>
//             <input
//               type="text"
//               placeholder="Nama Kelas"
//               value={newClassName}
//               onChange={(e) => setNewClassName(e.target.value)}
//               className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold"
//             />
//             <button
//               onClick={async () => {
//                 if (!newClassName) return;
//                 const code = "A" + Math.floor(100 + Math.random() * 900);
//                 await supabase
//                   .from("classes")
//                   .insert({
//                     id: `cls_${Date.now()}`,
//                     code,
//                     name: newClassName,
//                     grade: selectedGrade,
//                   });
//                 fetchData();
//                 setNewClassName("");
//               }}
//               className="w-full py-2.5 bg-orange-500 text-white font-black rounded-xl text-xs"
//             >
//               Generate Kelas Baru
//             </button>
//           </div>

//           <div className="bg-sky-50/50 p-6 rounded-3xl border-2 border-sky-200 space-y-3">
//             <h3 className="font-black text-slate-800 text-sm">
//               Assign Murid ke Kode: {selectedClassCode}
//             </h3>
//             <input
//               type="text"
//               placeholder="Nama Murid"
//               value={newStudentName}
//               onChange={(e) => setNewStudentName(e.target.value)}
//               className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold"
//             />
//             <button
//               onClick={async () => {
//                 if (!newStudentName) return;
//                 await supabase.from("students").insert({
//                   id: `std_${Date.now()}`,
//                   class_code: selectedClassCode,
//                   name: newStudentName,
//                   avatar: newStudentAvatar,
//                 });
//                 fetchData();
//                 setNewStudentName("");
//               }}
//               className="w-full py-2.5 bg-sky-600 text-white font-black rounded-xl text-xs"
//             >
//               + Daftarkan Murid
//             </button>
//           </div>
//         </div>
//       )}

//       {/* MODAL: REVIEW SOAL & CERITA */}
//       {inspectStory && (
//         <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
//           <div className="bg-white max-w-2xl w-full p-6 rounded-[32px] shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
//             <div className="flex items-center justify-between border-b pb-2">
//               <div>
//                 <h3 className="text-xl font-black text-slate-900">
//                   {inspectStory.title}
//                 </h3>
//                 <span className="text-xs text-orange-600 font-bold">
//                   {inspectStory.country_origin} • {inspectStory.grade}
//                 </span>
//               </div>
//               <button
//                 onClick={() => setInspectStory(null)}
//                 className="w-8 h-8 rounded-full bg-slate-100 font-bold"
//               >
//                 ✕
//               </button>
//             </div>

//             <div className="p-4 bg-amber-50/60 rounded-2xl text-xs font-bold text-slate-800 leading-relaxed">
//               {inspectStory.passage_text}
//             </div>

//             <div className="space-y-2 text-xs">
//               <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
//                 <span className="font-black text-blue-900 block">
//                   C1 ({inspectStory.c1_data?.weight}%)
//                 </span>
//                 <p className="text-slate-700">{inspectStory.c1_data?.prompt}</p>
//               </div>
//               <div className="p-3 bg-purple-50 rounded-xl border border-purple-200">
//                 <span className="font-black text-purple-900 block">
//                   C2 ({inspectStory.c2_data?.weight}%)
//                 </span>
//                 <p className="text-slate-700">{inspectStory.c2_data?.prompt}</p>
//               </div>
//               <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
//                 <span className="font-black text-emerald-900 block">
//                   C3 ({inspectStory.c3_data?.weight}%)
//                 </span>
//                 <p className="text-slate-700">
//                   {inspectStory.c3_data?.scenario}
//                 </p>
//               </div>
//               <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
//                 <span className="font-black text-rose-900 block">
//                   C4 ({inspectStory.c4_data?.weight}%)
//                 </span>
//                 <p className="text-slate-700">
//                   {inspectStory.c4_data?.scenario}
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* MODAL: DIAGNOSTIK SISWA */}
//       {selectedStudent && (
//         <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
//           <div className="bg-white max-w-2xl w-full p-6 rounded-[32px] shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
//             <div className="flex justify-between items-center border-b pb-2">
//               <h3 className="text-xl font-black text-slate-900">
//                 {selectedStudent.name}
//               </h3>
//               <button
//                 onClick={() => setSelectedStudent(null)}
//                 className="w-8 h-8 rounded-full bg-slate-100 font-bold"
//               >
//                 ✕
//               </button>
//             </div>
//             <div className="grid grid-cols-4 gap-2 text-center text-xs font-bold">
//               <div className="p-3 bg-blue-50 rounded-xl">
//                 C1: {selectedStudent.latestRecord.c1_score}/15
//               </div>
//               <div className="p-3 bg-purple-50 rounded-xl">
//                 C2: {selectedStudent.latestRecord.c2_score}/25
//               </div>
//               <div className="p-3 bg-emerald-50 rounded-xl">
//                 C3: {selectedStudent.latestRecord.c3_score}/30
//               </div>
//               <div className="p-3 bg-rose-50 rounded-xl">
//                 C4: {selectedStudent.latestRecord.c4_score}/30
//               </div>
//             </div>
//             <div className="p-3 bg-slate-50 rounded-xl text-xs italic">
//               &ldquo;{selectedStudent.latestRecord.transcribed_text}&rdquo;
//             </div>
//             <div className="space-y-1.5 text-xs">
//               <p>
//                 <strong>Kekuatan:</strong>{" "}
//                 {selectedStudent.latestRecord.strength}
//               </p>
//               <p>
//                 <strong>Bottleneck:</strong>{" "}
//                 {selectedStudent.latestRecord.weakness}
//               </p>
//               <p>
//                 <strong>Solusi Guru:</strong>{" "}
//                 {selectedStudent.latestRecord.solution}
//               </p>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

"use client";

import React, { useState, useEffect } from "react";
import {
  LogOut,
  RefreshCw,
  BarChart2,
  PlusCircle,
  UserPlus,
  Layers,
  History,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Trash2,
  Users,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function TeacherDashboard({ onExit }: { onExit: () => void }) {
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

  // Form States (Assign Student)
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentAvatar, setNewStudentAvatar] = useState("🐻");

  // AI Story Generator State
  const [genInterest, setGenInterest] = useState("Folklore & Legends");

  // Modal State
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
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

      const activeCls = cls.find((c) => c.code === currentCode);
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

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim() || !selectedClassCode) return;

    const newStd = {
      id: `std_${Date.now()}`,
      class_code: selectedClassCode,
      name: newStudentName.trim(),
      avatar: newStudentAvatar,
    };

    const { error } = await supabase.from("students").insert(newStd);
    if (!error) {
      setNewStudentName("");
      await fetchData();
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (!confirm("Hapus murid ini dari kelas?")) return;
    const { error } = await supabase
      .from("students")
      .delete()
      .eq("id", studentId);
    if (!error) {
      setStudentsList(studentsList.filter((s) => s.id !== studentId));
    }
  };

  const handleGenerateStory = async () => {
    if (!selectedClassCode) {
      alert("Pilih atau buat kelas terlebih dahulu!");
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
          autoSave: true,
        }),
      });
      const data = await res.json();
      if (data && data.id) {
        setStories([data, ...stories]);
      }
    } catch (e) {
      alert("Gagal membuat cerita dengan AI");
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
      setStories(
        stories.map((s) =>
          s.id === storyId ? { ...s, is_verified: nextStatus } : s,
        ),
      );
    }
  };

  const groupedStudents = React.useMemo(() => {
    const map = new Map<string, any[]>();
    assessments.forEach((r) => {
      const prev = map.get(r.student_name) || [];
      prev.push(r);
      map.set(r.student_name, prev);
    });

    const res: any[] = [];
    map.forEach((records, name) => {
      const latest = records[0];
      const match = studentsList.find(
        (s) => s.name.toLowerCase() === name.toLowerCase(),
      );
      res.push({
        name,
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

  if (!isAuth) {
    return (
      <div className="max-w-sm mx-auto bg-white p-7 rounded-[32px] border-2 border-slate-300 shadow-xl text-center space-y-4 my-auto animate-fadeIn">
        <div className="w-14 h-14 bg-amber-100 text-amber-900 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-1 border border-amber-300">
          🔑
        </div>
        <h2 className="text-2xl font-black text-slate-900">Teacher Login</h2>
        <p className="text-xs font-semibold text-slate-600">
          Masuk untuk mengelola kelas & verifikasi materi
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (username === "guru" && password === "admin123") setIsAuth(true);
            else alert("Demo kredensial: guru / admin123");
          }}
          className="space-y-3 pt-2"
        >
          <input
            type="text"
            placeholder="Username (guru)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3.5 bg-white border-2 border-slate-300 rounded-2xl text-xs font-bold text-slate-900 placeholder:text-slate-400 outline-none focus:border-orange-500"
          />
          <input
            type="password"
            placeholder="Password (admin123)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3.5 bg-white border-2 border-slate-300 rounded-2xl text-xs font-bold text-slate-900 placeholder:text-slate-400 outline-none focus:border-orange-500"
          />
          <button
            type="submit"
            className="w-full py-3.5 bg-orange-600 hover:bg-orange-700 text-white font-black rounded-2xl shadow-[0_4px_0_0_#9A3412] text-xs transition cursor-pointer"
          >
            Masuk Portal Guru
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto w-full bg-white p-6 sm:p-8 rounded-[36px] border-2 border-slate-300 shadow-xl space-y-6 my-auto animate-fadeIn">
      {/* Top Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-black text-slate-900">
              Dashboard Guru & Verifikator AI
            </h2>
            {classes.length > 0 ? (
              <select
                value={selectedClassCode}
                onChange={(e) => {
                  setSelectedClassCode(e.target.value);
                  const active = classes.find((c) => c.code === e.target.value);
                  if (active) setSelectedGrade(active.grade);
                }}
                className="bg-amber-100 text-slate-900 font-bold text-xs px-3 py-1.5 rounded-xl border-2 border-amber-400 outline-none cursor-pointer"
              >
                {classes.map((c) => (
                  <option
                    key={c.code}
                    value={c.code}
                    className="text-slate-900 font-bold"
                  >
                    {c.name} (Kode: {c.code} • {c.grade})
                  </option>
                ))}
              </select>
            ) : (
              <span className="text-xs font-black text-rose-700 bg-rose-100 px-3 py-1 rounded-xl border border-rose-300">
                Belum ada kelas aktif
              </span>
            )}
          </div>
          <p className="text-xs font-medium text-slate-600">
            Kelola data murid, bank cerita terverifikasi, dan hasil skrining
            literasi
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("classes")}
            className={`text-xs font-black px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === "classes"
                ? "bg-orange-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-800 hover:bg-slate-200"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Kelas &amp; Murid</span>
          </button>
          <button
            onClick={() => setActiveTab("stories")}
            className={`text-xs font-black px-3.5 py-2 rounded-xl transition cursor-pointer ${
              activeTab === "stories"
                ? "bg-orange-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-800 hover:bg-slate-200"
            }`}
          >
            📖 Bank Cerita AI
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`text-xs font-black px-3.5 py-2 rounded-xl transition cursor-pointer ${
              activeTab === "analytics"
                ? "bg-orange-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-800 hover:bg-slate-200"
            }`}
          >
            📊 Hasil Skrining
          </button>
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2 bg-slate-100 text-slate-800 hover:bg-slate-200 rounded-xl transition cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={onExit}
            className="text-xs font-black text-rose-600 bg-rose-50 hover:bg-rose-100 p-2 rounded-xl flex items-center gap-1 cursor-pointer transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: KELOLA KELAS & ASSIGN MURID                      */}
      {/* ======================================================== */}
      {activeTab === "classes" && (
        <div className="space-y-6 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Buat Kelas Baru */}
            <div className="bg-amber-50/60 p-6 rounded-3xl border-2 border-amber-300 space-y-4">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-orange-600" />
                <h3 className="font-black text-slate-900 text-sm">
                  Buat Kelas Baru
                </h3>
              </div>
              <form onSubmit={handleCreateClass} className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    Nama Kelas
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Kelas 3 Bintang"
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                    className="w-full p-3 bg-white border-2 border-slate-300 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-400 outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    Tingkat / Grade
                  </label>
                  <select
                    value={newClassGrade}
                    onChange={(e) => setNewClassGrade(e.target.value)}
                    className="w-full p-3 bg-white border-2 border-slate-300 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-orange-500"
                  >
                    <option value="Grade 1">
                      Grade 1 (Early Phonics & Words)
                    </option>
                    <option value="Grade 2">
                      Grade 2 (Simple Sentences & Morals)
                    </option>
                    <option value="Grade 3">
                      Grade 3 (Sequence & Cause-Effect)
                    </option>
                    <option value="Grade 4">
                      Grade 4 (Deep Analysis & Inference)
                    </option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-black rounded-xl text-xs shadow-[0_3px_0_0_#9A3412] transition cursor-pointer"
                >
                  + Generate Kelas Baru (Kode 4 Digit)
                </button>
              </form>
            </div>

            {/* Assign Murid ke Kelas Aktif */}
            <div className="bg-sky-50/60 p-6 rounded-3xl border-2 border-sky-300 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-sky-700" />
                  <h3 className="font-black text-slate-900 text-sm">
                    Assign Murid (Kode: {selectedClassCode || "Belum Ada"})
                  </h3>
                </div>
                <span className="text-xs font-black text-sky-900 bg-sky-100 px-2.5 py-0.5 rounded-full border border-sky-300">
                  {studentsList.length} Terdaftar
                </span>
              </div>

              <form onSubmit={handleAddStudent} className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    Nama Lengkap Murid
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Anisa Putri"
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                    disabled={!selectedClassCode}
                    className="w-full p-3 bg-white border-2 border-slate-300 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-400 outline-none focus:border-sky-500 disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    Avatar Karakter
                  </label>
                  <select
                    value={newStudentAvatar}
                    onChange={(e) => setNewStudentAvatar(e.target.value)}
                    disabled={!selectedClassCode}
                    className="w-full p-2.5 bg-white border-2 border-slate-300 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-sky-500 disabled:opacity-50"
                  >
                    <option value="🐻">🐻 Beruang</option>
                    <option value="🦊">🦊 Rubah</option>
                    <option value="🦁">🦁 Singa</option>
                    <option value="🐼">🐼 Panda</option>
                    <option value="🐰">🐰 Kelinci</option>
                    <option value="🦄">🦄 Unicorn</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={!selectedClassCode}
                  className="w-full py-3 bg-sky-700 hover:bg-sky-800 text-white font-black rounded-xl text-xs shadow-[0_3px_0_0_#0369A1] transition cursor-pointer disabled:opacity-50"
                >
                  + Daftarkan Murid ke Kelas Ini
                </button>
              </form>
            </div>
          </div>

          {/* Roster / Daftar Murid yang Terdaftar di Kelas Ini */}
          <div className="p-5 bg-white border-2 border-slate-300 rounded-3xl space-y-3 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                <span>📋 Roster Murid Kelas {selectedClassCode}</span>
                <span className="text-xs text-slate-500">
                  ({studentsList.length} Murid)
                </span>
              </h4>
            </div>

            {studentsList.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-3 text-center">
                Belum ada murid yang didaftarkan di kelas ini. Masukkan nama
                murid pada form di atas.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pt-1">
                {studentsList.map((std) => (
                  <div
                    key={std.id}
                    className="flex items-center justify-between p-3 bg-slate-50 border-2 border-slate-200 rounded-2xl"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl p-1 bg-white rounded-lg border border-slate-200">
                        {std.avatar}
                      </span>
                      <span className="text-xs font-black text-slate-900">
                        {std.name}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteStudent(std.id)}
                      className="p-1.5 text-rose-600 hover:bg-rose-100 rounded-lg transition"
                      title="Hapus Murid"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: BANK CERITA & VERIFIKASI GURU                     */}
      {/* ======================================================== */}
      {activeTab === "stories" && (
        <div className="space-y-4 animate-fadeIn">
          {/* Action Generator Box */}
          <div className="p-5 bg-amber-50/80 rounded-3xl border-2 border-amber-300 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-black uppercase text-orange-700 block">
                AI Quest Generator
              </span>
              <h3 className="text-base font-black text-slate-900">
                Generate Cerita Rakyat &amp; Soal ({selectedGrade})
              </h3>
              <p className="text-xs font-semibold text-slate-600">
                Cerita rakyat otomatis dirandomisasi dari Indonesia 🇮🇩,
                Philippines 🇵🇭, atau Malaysia 🇲🇾
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={genInterest}
                onChange={(e) => setGenInterest(e.target.value)}
                className="p-2.5 bg-white border-2 border-slate-300 rounded-xl text-xs font-bold text-slate-900 outline-none"
              >
                <option value="Folklore & Legends">
                  🐉 Cerita Rakyat &amp; Legenda
                </option>
                <option value="Nature & Mangroves">
                  🌿 Alam &amp; Konservasi
                </option>
                <option value="Marine Life & Islands">
                  🌊 Laut &amp; Terumbu Karang
                </option>
                <option value="Science & Wildlife">
                  🔬 Sains &amp; Satwa Hutan
                </option>
              </select>

              <button
                onClick={handleGenerateStory}
                disabled={generatingAi}
                className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-black text-xs rounded-xl flex items-center gap-1.5 shadow-[0_3px_0_0_#9A3412] disabled:opacity-50 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  {generatingAi
                    ? "Meracik dengan Gemini..."
                    : "Generate AI Story"}
                </span>
              </button>
            </div>
          </div>

          {/* List Cerita */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stories.length === 0 ? (
              <div className="col-span-2 p-10 bg-slate-50 border-2 border-dashed border-slate-300 rounded-3xl text-center text-slate-500 font-bold text-xs">
                Belum ada cerita yang dibuat untuk kelas ini. Klik tombol
                &ldquo;Generate AI Story&rdquo; di atas!
              </div>
            ) : (
              stories.map((s) => (
                <div
                  key={s.id}
                  className="p-5 bg-white border-2 border-slate-300 rounded-3xl space-y-3 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black bg-amber-100 text-amber-950 px-2.5 py-1 rounded-full border border-amber-300">
                      {s.country_origin}
                    </span>
                    <button
                      onClick={() =>
                        handleToggleVerifyStory(s.id, s.is_verified)
                      }
                      className={`px-3 py-1 rounded-full text-xs font-black flex items-center gap-1 transition cursor-pointer ${
                        s.is_verified
                          ? "bg-emerald-100 text-emerald-900 border-2 border-emerald-400"
                          : "bg-amber-100 text-amber-900 border-2 border-amber-400"
                      }`}
                    >
                      {s.is_verified ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                      ) : (
                        <ShieldCheck className="w-3.5 h-3.5" />
                      )}
                      <span>
                        {s.is_verified
                          ? "Terverifikasi Guru ✓"
                          : "Belum Diverifikasi (Klik)"}
                      </span>
                    </button>
                  </div>

                  <div>
                    <h4 className="font-black text-slate-900 text-sm">
                      {s.title}
                    </h4>
                    <p className="text-xs font-medium text-slate-700 line-clamp-3 mt-1 leading-relaxed">
                      &ldquo;{s.passage_text}&rdquo;
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs text-slate-600 font-bold">
                    <span>
                      {s.word_count} Kata • {s.grade}
                    </span>
                    <button
                      onClick={() => setInspectStory(s)}
                      className="text-orange-700 hover:text-orange-900 font-black cursor-pointer underline"
                    >
                      Review Soal C1–C4 &rarr;
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: ANALYTICS & GROUPED STUDENTS                      */}
      {/* ======================================================== */}
      {activeTab === "analytics" && (
        <div className="space-y-4 animate-fadeIn">
          <div className="border-2 border-slate-300 rounded-2xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 border-b border-slate-300 text-slate-800 font-black">
                <tr>
                  <th className="p-3">Nama Murid</th>
                  <th className="p-3">Fluency Terakhir</th>
                  <th className="p-3">Akurasi</th>
                  <th className="p-3">Bloom C1–C4</th>
                  <th className="p-3">Composite</th>
                  <th className="p-3">Riwayat</th>
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
                      Belum ada pengerjaan skrining untuk kelas ini.
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
                          {std.totalAttempts}x Sesi
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
                          className="px-3 py-1 bg-blue-100 text-blue-900 font-bold rounded-lg text-xs border border-blue-300 cursor-pointer"
                        >
                          Lihat Log
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: REVIEW SOAL & CERITA */}
      {inspectStory && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white max-w-2xl w-full p-6 rounded-[32px] shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto border-2 border-slate-300">
            <div className="flex items-center justify-between border-b pb-2">
              <div>
                <h3 className="text-xl font-black text-slate-900">
                  {inspectStory.title}
                </h3>
                <span className="text-xs text-orange-700 font-bold">
                  {inspectStory.country_origin} • {inspectStory.grade}
                </span>
              </div>
              <button
                onClick={() => setInspectStory(null)}
                className="w-8 h-8 rounded-full bg-slate-200 text-slate-800 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-amber-50 rounded-2xl text-xs font-bold text-slate-900 leading-relaxed border border-amber-200">
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
              </div>
              <div className="p-3 bg-purple-50 rounded-xl border-2 border-purple-200">
                <span className="font-black text-purple-950 block">
                  C2 ({inspectStory.c2_data?.weight}%)
                </span>
                <p className="text-slate-800 font-medium">
                  {inspectStory.c2_data?.prompt}
                </p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl border-2 border-emerald-200">
                <span className="font-black text-emerald-950 block">
                  C3 ({inspectStory.c3_data?.weight}%)
                </span>
                <p className="text-slate-800 font-medium">
                  {inspectStory.c3_data?.scenario}
                </p>
              </div>
              <div className="p-3 bg-rose-50 rounded-xl border-2 border-rose-200">
                <span className="font-black text-rose-950 block">
                  C4 ({inspectStory.c4_data?.weight}%)
                </span>
                <p className="text-slate-800 font-medium">
                  {inspectStory.c4_data?.scenario}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DIAGNOSTIK SISWA */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white max-w-2xl w-full p-6 rounded-[32px] shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto border-2 border-slate-300">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-xl font-black text-slate-900">
                {selectedStudent.name}
              </h3>
              <button
                onClick={() => setSelectedStudent(null)}
                className="w-8 h-8 rounded-full bg-slate-200 text-slate-800 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center text-xs font-black">
              <div className="p-3 bg-blue-50 text-blue-950 border border-blue-200 rounded-xl">
                C1: {selectedStudent.latestRecord.c1_score}/15
              </div>
              <div className="p-3 bg-purple-50 text-purple-950 border border-purple-200 rounded-xl">
                C2: {selectedStudent.latestRecord.c2_score}/25
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-950 border border-emerald-200 rounded-xl">
                C3: {selectedStudent.latestRecord.c3_score}/30
              </div>
              <div className="p-3 bg-rose-50 text-rose-950 border border-rose-200 rounded-xl">
                C4: {selectedStudent.latestRecord.c4_score}/30
              </div>
            </div>
            <div className="p-3 bg-slate-100 rounded-xl text-xs font-medium text-slate-800 italic border border-slate-200">
              &ldquo;{selectedStudent.latestRecord.transcribed_text}&rdquo;
            </div>
            <div className="space-y-1.5 text-xs">
              <p>
                <strong className="text-slate-900">Kekuatan:</strong>{" "}
                <span className="text-slate-700">
                  {selectedStudent.latestRecord.strength}
                </span>
              </p>
              <p>
                <strong className="text-slate-900">Bottleneck:</strong>{" "}
                <span className="text-slate-700">
                  {selectedStudent.latestRecord.weakness}
                </span>
              </p>
              <p>
                <strong className="text-slate-900">Solusi Guru:</strong>{" "}
                <span className="text-slate-700">
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
