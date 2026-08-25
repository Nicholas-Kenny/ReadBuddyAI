"use client";

import React, { useState } from "react";
import { Users } from "lucide-react";
import StudentPortal from "@/components/StudentPortal";
import TeacherDashboard from "@/components/TeacherDashboard";

export default function Home() {
  const [portal, setPortal] = useState<"student" | "teacher">("student");

  return (
    <main className="min-h-screen bg-[#FFFDF7] p-4 sm:p-8 flex flex-col justify-between selection:bg-amber-200">
      <header className="max-w-5xl mx-auto w-full flex justify-between items-center py-3 bg-white px-6 rounded-full border-2 border-slate-300 shadow-xs mb-6">
        <button
          onClick={() => setPortal("student")}
          className="font-black text-xl text-slate-900 cursor-pointer flex items-center gap-2"
        >
          <span className="w-8 h-8 rounded-xl bg-amber-400 border border-amber-600 flex items-center justify-center text-lg">
            🐻
          </span>
          <span>
            Read<span className="text-orange-600">Buddy</span>AI
          </span>
        </button>
        <button
          onClick={() => setPortal(portal === "teacher" ? "student" : "teacher")}
          className="text-xs font-black bg-amber-100 text-amber-950 border-2 border-amber-400 px-3.5 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-amber-200 transition cursor-pointer"
        >
          <Users className="w-3.5 h-3.5" />
          <span>{portal === "teacher" ? "Beranda Murid" : "Teacher Portal"}</span>
        </button>
      </header>

      {portal === "student" ? (
        <StudentPortal />
      ) : (
        <TeacherDashboard onExit={() => setPortal("student")} />
      )}

      <footer className="text-center text-xs font-bold text-slate-500 py-2">
        ReadBuddy AI &copy; 2026 — Verified ASEAN Literacy Screening
      </footer>
    </main>
  );
}
