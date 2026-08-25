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
    if (!confirm("Hapus murid ini dari kelas?")) return;
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
      alert(`Gagal menyimpan tugas: ${error.message}`);
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
          refinementPrompt: storyPrompt.trim(),
          autoSave: true,
        }),
      });
      const data = await res.json();
      if (data && data.id) {
        setStories([data, ...stories]);
        setStoryPrompt("");
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
      count: matchingStudents.filter((student) => student.reading_level === grade)
        .length,
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
      <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3">
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
                className="max-w-full bg-amber-100 text-slate-900 font-bold text-xs px-3 py-1.5 rounded-xl border-2 border-amber-400 outline-none cursor-pointer"
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

        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
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

            <div className="bg-sky-50/60 p-6 rounded-3xl border-2 border-sky-300 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-sky-700" />
                  <h3 className="font-black text-slate-900 text-sm">
                    Registrasi Mandiri Siswa
                  </h3>
                </div>
                <span className="text-xs font-black text-sky-900 bg-sky-100 px-2.5 py-0.5 rounded-full border border-sky-300">
                  {studentsList.length} Bergabung
                </span>
              </div>
              <p className="text-xs font-semibold leading-relaxed text-slate-600">
                Siswa membuat profil dan PIN sendiri terlebih dahulu, lalu
                memasukkan kode <strong>{selectedClassCode || "kelas"}</strong>.
                Profil tidak lagi dibuat atau dipilih dari roster guru.
              </p>
              <div className="rounded-2xl border border-sky-200 bg-white p-4">
                <span className="block text-[10px] font-black uppercase text-sky-700">Kode untuk dibagikan</span>
                <span className="font-mono text-3xl font-black tracking-widest text-slate-900">{selectedClassCode || "—"}</span>
              </div>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pt-1">
                {studentsList.map((std) => (
                  <div
                    key={std.id}
                    className="p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl space-y-3"
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
                            {std.school_grade || selectedGrade} · Bacaan {std.reading_level || selectedGrade}
                          </span>
                        </div>
                      </div>
                      <span className={`rounded-full px-2 py-1 text-[10px] font-black ${std.profile_status === "assigned" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                        {std.profile_status === "assigned" ? "Assigned" : "Needs review"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <button
                        onClick={() => openStudentProfile(std)}
                        className="flex-1 rounded-xl bg-sky-700 px-3 py-2 text-xs font-black text-white"
                      >
                        Inspect &amp; Assign
                      </button>
                      <button
                        onClick={() => handleDeleteStudent(std.id)}
                        className="p-2 text-rose-600 hover:bg-rose-100 rounded-lg transition"
                        title="Hapus Murid"
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

      {/* ======================================================== */}
      {/* TAB 2: BANK CERITA & VERIFIKASI GURU                     */}
      {/* ======================================================== */}
      {activeTab === "stories" && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible">
            {interestOverview.map((overview) => (
              <button
                key={overview.title}
                type="button"
                onClick={() => setGenInterest(overview.title)}
                className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-xs font-black transition ${genInterest === overview.title ? "border-orange-500 bg-orange-600 text-white" : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"}`}
              >
                <span className="text-base">{overview.emoji}</span>
                <span>{overview.title}</span>
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${genInterest === overview.title ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"}`}>
                  {overview.students.length}
                </span>
              </button>
            ))}
          </div>

          {/* Action Generator Box */}
          <div className="rounded-3xl border-2 border-slate-300 bg-slate-50 p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-black text-slate-900">
                    Buat cerita {selectedInterestOverview?.emoji} {genInterest}
                  </h3>
                  <span className="rounded-full bg-white px-2 py-1 text-[10px] font-black text-slate-600 ring-1 ring-slate-200">
                    {selectedInterestOverview?.students.length || 0} siswa
                  </span>
                </div>
                <label className="text-xs font-bold text-slate-700">
                  Brief cerita
                <textarea
                  value={storyPrompt}
                  onChange={(event) => setStoryPrompt(event.target.value)}
                  placeholder="Contoh: Cerita tentang kerja sama membersihkan sungai setelah hujan, gunakan tokoh anak dan burung rangkong."
                  rows={2}
                  className="mt-1 w-full resize-none rounded-xl border-2 border-slate-300 bg-white p-3 text-xs font-bold text-slate-900 outline-none focus:border-orange-500"
                />
              </label>
              </div>

              <button
                onClick={handleGenerateStory}
                disabled={generatingAi}
                className="flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-orange-600 px-5 py-3 text-xs font-black text-white shadow-[0_3px_0_0_#9A3412] hover:bg-orange-700 disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  {generatingAi
                    ? "Meracik dengan Gemini..."
                    : "Generate Tugas"}
                </span>
              </button>
            </div>

            <details className="mt-3 rounded-xl border border-slate-200 bg-white px-3 py-2">
              <summary className="cursor-pointer text-[11px] font-black text-slate-700">
                Lihat detail minat {selectedInterestOverview?.students.length || 0} siswa
              </summary>
              {selectedInterestOverview?.students.length ? (
                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {selectedInterestOverview.students.map((student) => (
                    <div key={student.id} className="rounded-lg bg-slate-50 p-2.5">
                      <span className="block text-[11px] font-black text-slate-900">
                        {student.avatar || "🐻"} {student.name}
                      </span>
                      <span className="mt-0.5 block text-[10px] font-semibold leading-relaxed text-slate-600">
                        {student.interest_details || "Belum menambahkan detail minat."}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-[10px] font-semibold text-slate-500">
                  Belum ada siswa yang memilih kategori ini.
                </p>
              )}
            </details>
          </div>

          {/* List Cerita */}
          <div className="flex items-end justify-between gap-3 pt-1">
            <div>
              <h3 className="text-sm font-black text-slate-900">Bank cerita</h3>
              <p className="text-[11px] font-semibold text-slate-500">
                {stories.length} cerita · {stories.filter((story) => story.is_verified).length} terverifikasi
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stories.length === 0 ? (
              <div className="col-span-2 p-10 bg-slate-50 border-2 border-dashed border-slate-300 rounded-3xl text-center text-slate-500 font-bold text-xs">
                Belum ada cerita kategori untuk kelas ini. Pilih minat,
                tambahkan brief, lalu klik &ldquo;Generate Tugas&rdquo;.
              </div>
            ) : (
              stories.map((s) => {
                const interestedStudents = studentsList.filter((student) =>
                  student.interests?.includes(s.interest),
                );

                return (
                  <div
                    key={s.id}
                    className="relative rounded-2xl border border-slate-300 bg-white p-4 shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-black text-slate-500">
                          <span>{s.country_origin}</span>
                          <span>·</span>
                          <span>{s.word_count} kata</span>
                          <span>·</span>
                          <span>{s.grade}</span>
                        </div>
                        <h4 className="mt-1 truncate text-sm font-black text-slate-900">
                          {s.title}
                        </h4>
                        <span className="mt-1 inline-block text-[10px] font-black text-sky-800">
                          {INTEREST_CATEGORIES.find((item) => item.title === s.interest)?.emoji || "📖"} {s.interest}
                        </span>
                      </div>
                      <span className={`flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[10px] font-black ${s.is_verified ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                        {s.is_verified ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <ShieldCheck className="h-3 w-3" />
                        )}
                        {s.is_verified ? "Verified" : "Review"}
                      </span>
                    </div>

                    <p className="mt-2 line-clamp-2 text-xs font-medium leading-relaxed text-slate-600">
                      {s.passage_text}
                    </p>

                    <div className="mt-3 flex items-center justify-between gap-3 border-t border-slate-200 pt-3">
                      <details className="group min-w-0 text-[10px] font-bold text-slate-600">
                        <summary className="cursor-pointer list-none text-sky-800">
                          {interestedStudents.length} siswa ▾
                        </summary>
                        <div className="absolute z-10 mt-2 max-w-xs rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
                          {interestedStudents.length > 0
                            ? interestedStudents.map((student) => (
                                <div key={student.id} className="whitespace-nowrap py-1">
                                  {student.avatar || "🐻"} {student.name} · {student.reading_level}
                                </div>
                              ))
                            : "Belum ada siswa untuk kategori ini."}
                        </div>
                      </details>
                      <button
                        onClick={() => setInspectStory(s)}
                        className="rounded-lg bg-slate-900 px-3 py-2 text-[10px] font-black text-white hover:bg-slate-700"
                      >
                        {s.is_verified ? "Inspect C1–C4" : "Review & verifikasi"}
                      </button>
                    </div>
                  </div>
                );
              })
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

      {/* MODAL: PROFIL & ASSIGNMENT MURID */}
      {profileStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-fadeIn">
          <div className="max-h-[90vh] w-full max-w-2xl space-y-5 overflow-y-auto rounded-[32px] border-2 border-slate-300 bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{profileStudent.avatar}</span>
                <div>
                  <h3 className="text-xl font-black text-slate-900">{profileStudent.name}</h3>
                  <p className="text-xs font-bold text-slate-500">Profil belajar · {profileStudent.class_code}</p>
                </div>
              </div>
              <button onClick={() => setProfileStudent(null)} className="h-8 w-8 rounded-full bg-slate-200 font-bold text-slate-800">✕</button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <span className="block text-[10px] font-black uppercase text-slate-500">School grade</span>
                <span className="text-sm font-black text-slate-900">{profileStudent.school_grade || selectedGrade}</span>
              </div>
              <label className="rounded-2xl border border-orange-200 bg-orange-50 p-3">
                <span className="block text-[10px] font-black uppercase text-orange-700">Reading level</span>
                <select
                  value={profileStudent.reading_level || profileStudent.school_grade || selectedGrade}
                  onChange={(event) => setProfileStudent({...profileStudent, reading_level: event.target.value})}
                  className="mt-1 w-full rounded-lg border border-orange-300 bg-white p-1.5 text-xs font-black text-slate-900"
                >
                  {GRADE_LEVELS.map((grade) => <option key={grade}>{grade}</option>)}
                </select>
              </label>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <span className="block text-[10px] font-black uppercase text-slate-500">Location</span>
                <span className="text-sm font-black text-slate-900">{profileStudent.location || "Belum diisi"}</span>
              </div>
            </div>

            <div>
              <span className="mb-2 block text-xs font-black text-slate-800">Minat murid</span>
              <div className="flex flex-wrap gap-2">
                {(profileStudent.interests || []).length > 0 ? profileStudent.interests.map((interest: string) => {
                  const category = INTEREST_CATEGORIES.find((item) => item.title === interest);
                  return <span key={interest} className="rounded-full border border-amber-300 bg-amber-100 px-3 py-1 text-xs font-black text-amber-900">{category?.emoji || "📖"} {interest}</span>;
                }) : <span className="text-xs font-semibold text-slate-500">Belum ada minat yang dipilih.</span>}
              </div>
            </div>

            <div className="rounded-2xl border border-sky-200 bg-sky-50 p-3">
              <span className="block text-[10px] font-black uppercase text-sky-800">
                Hobi &amp; detail minat bacaan
              </span>
              <p className="mt-1 text-xs font-semibold leading-relaxed text-slate-700">
                {profileStudent.interest_details ||
                  "Siswa belum menambahkan detail minat."}
              </p>
            </div>

            <div className="rounded-3xl border-2 border-sky-200 bg-sky-50 p-5">
              <div className="mb-3">
                <h4 className="text-sm font-black text-slate-900">Assign aktivitas</h4>
                <p className="text-xs font-semibold text-slate-600">Pilih tahap yang perlu dikerjakan murid pada quest berikutnya.</p>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {[
                  ["oralReading", "🎙️ Oral Reading", "Ukur kelancaran dan akurasi"],
                  ["c1", "C1 · Remember", "Ingat fakta dari cerita"],
                  ["c2", "C2 · Understand", "Cocokkan sebab dan akibat"],
                  ["c3", "C3 · Plan Builder", "Susun langkah untuk situasi baru"],
                  ["c4", "C4 · Evidence Detective", "Pilih bukti yang mendukung klaim"],
                ].map(([key, label, description]) => {
                  const activityKey = key as keyof ActivityPlan;
                  const enabled = assignmentDraft[activityKey];
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setAssignmentDraft({...assignmentDraft, [activityKey]: !enabled})}
                      className={`rounded-2xl border-2 p-3 text-left ${enabled ? "border-sky-600 bg-white" : "border-slate-200 bg-slate-100"}`}
                    >
                      <span className="flex items-center justify-between text-xs font-black text-slate-900">
                        {label} {enabled && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                      </span>
                      <span className="mt-1 block text-[10px] font-semibold text-slate-500">{description}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="sticky bottom-0 -mx-2 flex flex-col gap-2 border-t border-slate-200 bg-white/95 p-2 pt-3 backdrop-blur-sm sm:flex-row">
              <button
                onClick={handleSaveAssignment}
                disabled={savingAssignment}
                className="flex-1 rounded-xl bg-sky-700 px-4 py-3 text-xs font-black text-white disabled:opacity-50"
              >
                {savingAssignment ? "Menyimpan..." : "Simpan Profil & Assignment"}
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
                className="flex-1 rounded-xl bg-orange-600 px-4 py-3 text-xs font-black text-white"
              >
                Buka Generator Kategori →
              </button>
            </div>
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
                <div className="mt-2 space-y-1.5">
                  {inspectStory.c1_data?.options?.map((option: any, index: number) => (
                    <div
                      key={option.id || index}
                      className="flex items-start justify-between gap-3 rounded-lg border border-blue-200 bg-white p-2"
                    >
                      <span className="font-semibold text-slate-800">
                        {String.fromCharCode(65 + index)}. {option.text}
                      </span>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-black ${option.score === inspectStory.c1_data?.weight ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>
                        {option.score}/{inspectStory.c1_data?.weight}
                      </span>
                    </div>
                  ))}
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
                  {inspectStory.c2_data?.pairs?.map((pair: any, index: number) => (
                    <div
                      key={pair.id || index}
                      className="flex flex-col gap-2 rounded-lg border border-purple-200 bg-white p-2 sm:grid sm:grid-cols-[1fr_auto_1fr_auto] sm:items-center"
                    >
                      <span className="font-semibold text-slate-800">{pair.causeText}</span>
                      <span className="font-black text-purple-700">→</span>
                      <span className="font-semibold text-slate-800">{pair.effectText}</span>
                      <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-black text-purple-800">
                        {pair.weight} poin
                      </span>
                    </div>
                  ))}
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
                      className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-white p-2"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-black text-emerald-800">
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
                  {inspectStory.c4_data?.claim || inspectStory.c4_data?.scenario}
                </p>
                <p className="mt-1 text-[10px] font-semibold text-slate-600">
                  {inspectStory.c4_data?.instruction ||
                    `Siswa memilih ${inspectEvidenceCount} kalimat pendukung.`}
                </p>
                <div className="mt-2 space-y-1.5">
                  {inspectEvidenceItems.map((evidence, index) => (
                    <div
                      key={evidence.id}
                      className="flex items-start justify-between gap-3 rounded-lg border border-rose-200 bg-white p-2"
                    >
                      <span className="font-semibold text-slate-800">
                        {index + 1}. {evidence.text}
                      </span>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-black ${evidence.score > 0 ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>
                        {evidence.score} poin
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
                className={`w-full rounded-xl px-4 py-3 text-xs font-black text-white ${inspectStory.is_verified ? "bg-slate-700 hover:bg-slate-800" : "bg-emerald-700 hover:bg-emerald-800"}`}
              >
                {inspectStory.is_verified
                  ? "Batalkan verifikasi cerita"
                  : "Verifikasi cerita dan semua soal C1–C4"}
              </button>
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
