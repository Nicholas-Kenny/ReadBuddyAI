"use client";

import React, { useState } from "react";
import { Users, Globe } from "lucide-react";
import StudentPortal from "@/components/StudentPortal";
import TeacherDashboard from "@/components/TeacherDashboard";
import { LanguageProvider, useLanguage, Language } from "@/lib/i18n";

function MainContent() {
  const [portal, setPortal] = useState<"student" | "teacher">("student");
  const { language, setLanguage, t } = useLanguage();

  return (
    <main className="min-h-screen bg-[#FFFDF7] p-4 sm:p-8 flex flex-col justify-between selection:bg-amber-200">
      <header className="max-w-5xl mx-auto w-full flex flex-wrap justify-between items-center py-3 bg-white px-6 rounded-full border-2 border-slate-300 shadow-xs mb-6 gap-3">
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

        <div className="flex items-center gap-2">
          {/* Language Selector Dropdown */}
          <div className="flex items-center bg-slate-100 border border-slate-300 rounded-full px-2.5 py-1 gap-1">
            <Globe className="w-3.5 h-3.5 text-slate-600 ml-0.5" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="bg-transparent text-xs font-black text-slate-900 outline-none cursor-pointer pr-1"
            >
              <option value="en">🇬🇧 English</option>
              <option value="id">🇮🇩 Indonesia</option>
              <option value="fil">🇵🇭 Filipino</option>
            </select>
          </div>

          <button
            onClick={() =>
              setPortal(portal === "teacher" ? "student" : "teacher")
            }
            className="text-xs font-black bg-amber-100 text-amber-950 border-2 border-amber-400 px-3.5 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-amber-200 transition cursor-pointer"
          >
            <Users className="w-3.5 h-3.5" />
            <span>
              {portal === "teacher" ? t("studentPortal") : t("teacherPortal")}
            </span>
          </button>
        </div>
      </header>

      {portal === "student" ? (
        <StudentPortal />
      ) : (
        <TeacherDashboard onExit={() => setPortal("student")} />
      )}

      <footer className="text-center text-xs font-bold text-slate-500 py-2">
        {t("footerText")}
      </footer>
    </main>
  );
}

export default function Home() {
  return (
    <LanguageProvider>
      <MainContent />
    </LanguageProvider>
  );
}
