"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "en" | "id" | "fil";

export const translations = {
  en: {
    // Header & Common
    studentPortal: "Student Portal",
    teacherPortal: "Teacher Portal",
    footerText: "ReadBuddy AI © 2026 — Verified ASEAN Literacy Screening",
    back: "Back",
    logout: "Logout",
    saving: "Saving...",
    checking: "Checking...",
    connecting: "Connecting...",

    // Student Auth & Onboarding
    profileTitle: "Student Learning Profile",
    profileSubtitle: "Create a profile or log in before joining your class.",
    registerNewProfile: "Register New Profile",
    loginToProfile: "Log In to My Profile",
    profileRegTitle: "Profile Registration",
    profileRegSubtitle:
      "Class code will be entered after completing your profile.",
    nickname: "Nickname",
    loginId: "Login ID",
    personalPin: "Personal PIN",
    pinPlaceholder: "Min. 4-digit number",
    schoolGrade: "School Grade",
    location: "Location",
    readingInterests: "Reading Interests",
    selectOneOrMore: "Select one or more",
    interestDetailsLabel: "Tell us more about your interests",
    optional: "(optional)",
    interestDetailsPlaceholder:
      "e.g. I love football, drawing robots, marine animals, and funny adventure stories.",
    registerAndContinue: "Register & Continue",
    loginTitle: "Student Login",
    loginSubtitle: "Log in first, then join your class.",
    loginBtn: "Log In",

    // Student Class & Stories
    helloStudent: "Hello",
    classIntro:
      "Your profile is ready. Now enter the class code from your teacher.",
    joinClassBtn: "Join Class",
    changeClass: "Change class",
    yourInterestLibrary: "Your Interest Library",
    selectStorySubtitle: "Select a story you would like to read today:",
    storiesCount: "stories",
    waitingTeacherAssignment: "Waiting for teacher assignment",
    waitingTeacherSubtitle:
      "Your teacher is preparing the reading activity modules for your profile.",
    noVerifiedStories: "No verified stories available for your interests yet",
    noVerifiedStoriesSubtitle:
      "Your teacher is preparing and verifying stories in this category in the Teacher Portal.",
    startFirstQuest: "Start First Quest →",

    // Quest Screening
    startReading: "START READING",
    startQuest: "START QUEST",
    startRecording: "Start Voice Recording",
    finishReading: "Finish Reading",
    voiceHeard: "Heard",
    c1Remembering: "Level C1: Remembering",
    c2Understanding: "Level C2: Understanding",
    c3PlanBuilder: "C3 · Plan Builder",
    c4EvidenceDetective: "C4 · Evidence Detective",
    c3Instruction:
      "Arrange the steps from first to last using the arrow buttons:",
    storyClaim: "Story Claim:",
    c4InstructionDefault:
      "Select the {count} sentences that best support the claim above.",
    selectedCount: "Selected",
    nextBtn: "Next →",
    finishAndSubmit: "Finish & Submit 🏆",
    screeningDoneTitle: "Screening Completed!",
    fluencyLabel: "Fluency",
    bloomGamesLabel: "Bloom Games",
    backToHome: "Back to Home",

    // Teacher Dashboard
    teacherLoginTitle: "Teacher Login",
    teacherLoginSubtitle:
      "Log in to manage classes and verify AI-generated screening quests",
    enterTeacherPortal: "Enter Teacher Portal",
    teacherDashboardTitle: "Teacher Dashboard & AI Verifier",
    teacherSubtitle:
      "Manage student roster, verified AI story banks, and literacy screening results",
    tabClasses: "Classes & Students",
    tabStoryBank: "AI Story Bank",
    tabAnalytics: "Screening Results",
    createNewClass: "Create New Class",
    className: "Class Name",
    targetGrade: "Target Grade Level",
    generateClassBtn: "+ Generate New Class (4-Digit Code)",
    studentSelfRegTitle: "Student Self-Registration",
    studentSelfRegDesc:
      "Students create their own profile and PIN independently, then enter the class code",
    codeToShare: "Class Code to Share",
    classRoster: "Class Roster",
    studentsCount: "Students",
    noStudentsRegistered:
      "No students have joined this class yet. Share the class code with your students.",
    inspectAndAssign: "Inspect & Assign",
    assigned: "Assigned",
    needsReview: "Needs review",
    storyBrief: "Story Brief",
    storyBriefPlaceholder:
      "e.g. A story about teamwork cleaning a coastal river after rain, featuring a child and a hornbill.",
    generateStoryTask: "Generate Task",
    generatingWithGemini: "Generating with Gemini...",
    verifiedBadge: "Verified",
    reviewBadge: "Review",
    reviewAndVerifyBtn: "Review & Verify",
    inspectC1C4Btn: "Inspect C1–C4",
    unverifyStory: "Unverify Story",
    verifyStoryAndQuestions: "Verify Story & All C1–C4 Questions",
    saveProfileAndAssignment: "Save Profile & Assignment",
    openCategoryGenerator: "Open Category Generator →",
  },

  id: {
    // Header & Common
    studentPortal: "Beranda Murid",
    teacherPortal: "Teacher Portal",
    footerText: "ReadBuddy AI © 2026 — Skrining Literasi ASEAN Terverifikasi",
    back: "Kembali",
    logout: "Keluar",
    saving: "Menyimpan...",
    checking: "Memeriksa...",
    connecting: "Menghubungkan...",

    // Student Auth & Onboarding
    profileTitle: "Profil Belajar Siswa",
    profileSubtitle: "Buat profil atau masuk sebelum bergabung ke kelas.",
    registerNewProfile: "Registrasi Profil Baru",
    loginToProfile: "Login ke Profil Saya",
    profileRegTitle: "Registrasi Profil",
    profileRegSubtitle: "Kelas dipilih setelah profil selesai.",
    nickname: "Nama Panggilan",
    loginId: "ID Login",
    personalPin: "PIN Pribadi",
    pinPlaceholder: "Minimal 4 digit angka",
    schoolGrade: "Tingkat Sekolah",
    location: "Lokasi Asal",
    readingInterests: "Minat Bacaan",
    selectOneOrMore: "Pilih satu atau lebih",
    interestDetailsLabel: "Ceritakan minatmu lebih detail",
    optional: "(opsional)",
    interestDetailsPlaceholder:
      "Contoh: Aku suka sepak bola, robot, biota laut, dan cerita petualangan seru.",
    registerAndContinue: "Daftar & Lanjut",
    loginTitle: "Login Siswa",
    loginSubtitle: "Masuk dulu, lalu pilih kelasmu.",
    loginBtn: "Login",

    // Student Class & Stories
    helloStudent: "Halo",
    classIntro: "Profilmu siap. Sekarang masukkan kode kelas dari guru.",
    joinClassBtn: "Gabung Kelas",
    changeClass: "Ganti kelas",
    yourInterestLibrary: "Perpustakaan Minatmu",
    selectStorySubtitle: "Pilih cerita yang ingin kamu baca hari ini:",
    storiesCount: "cerita",
    waitingTeacherAssignment: "Menunggu assignment guru",
    waitingTeacherSubtitle:
      "Guru sedang menyiapkan modul aktivitas membaca untuk profilmu.",
    noVerifiedStories: "Belum ada cerita terverifikasi untuk minatmu",
    noVerifiedStoriesSubtitle:
      "Gurumu sedang menyiapkan dan memverifikasi cerita kategori ini di Teacher Portal.",
    startFirstQuest: "Mulai Tugas Pertama →",

    // Quest Screening
    startReading: "MULAI MEMBACA",
    startQuest: "MULAI PERMAINAN",
    startRecording: "Mulai Rekam Suara",
    finishReading: "Selesai Membaca",
    voiceHeard: "Terdengar",
    c1Remembering: "Level C1: Remembering",
    c2Understanding: "Level C2: Understanding",
    c3PlanBuilder: "C3 · Plan Builder",
    c4EvidenceDetective: "C4 · Evidence Detective",
    c3Instruction:
      "Susun langkah dari urutan pertama sampai terakhir menggunakan tombol panah:",
    storyClaim: "Klaim Cerita:",
    c4InstructionDefault:
      "Pilih {count} kalimat yang paling mendukung klaim di atas.",
    selectedCount: "Dipilih",
    nextBtn: "Lanjut →",
    finishAndSubmit: "Selesai & Kirim 🏆",
    screeningDoneTitle: "Skrining Berhasil!",
    fluencyLabel: "Kelancaran",
    bloomGamesLabel: "Bloom Games",
    backToHome: "Kembali ke Beranda",

    // Teacher Dashboard
    teacherLoginTitle: "Teacher Login",
    teacherLoginSubtitle:
      "Masuk untuk mengelola kelas & verifikasi materi skrining AI",
    enterTeacherPortal: "Masuk Portal Guru",
    teacherDashboardTitle: "Dashboard Guru & Verifikator AI",
    teacherSubtitle:
      "Kelola data murid, bank cerita terverifikasi, dan hasil skrining literasi",
    tabClasses: "Kelas & Murid",
    tabStoryBank: "Bank Cerita AI",
    tabAnalytics: "Hasil Skrining",
    createNewClass: "Buat Kelas Baru",
    className: "Nama Kelas",
    targetGrade: "Tingkat / Grade",
    generateClassBtn: "+ Generate Kelas Baru (Kode 4 Digit)",
    studentSelfRegTitle: "Registrasi Mandiri Siswa",
    studentSelfRegDesc:
      "Siswa membuat profil dan PIN sendiri terlebih dahulu, lalu memasukkan kode kelas",
    codeToShare: "Kode untuk Dibagikan",
    classRoster: "Roster Murid",
    studentsCount: "Murid",
    noStudentsRegistered:
      "Belum ada murid yang didaftarkan di kelas ini. Bagikan kode kelas kepada siswa.",
    inspectAndAssign: "Inspect & Assign",
    assigned: "Ditugaskan",
    needsReview: "Perlu review",
    storyBrief: "Brief Cerita",
    storyBriefPlaceholder:
      "Contoh: Cerita tentang kerja sama membersihkan sungai setelah hujan, gunakan tokoh anak dan burung rangkong.",
    generateStoryTask: "Generate Tugas",
    generatingWithGemini: "Meracik dengan Gemini...",
    verifiedBadge: "Verified",
    reviewBadge: "Review",
    reviewAndVerifyBtn: "Review & Verifikasi",
    inspectC1C4Btn: "Inspect C1–C4",
    unverifyStory: "Batalkan verifikasi cerita",
    verifyStoryAndQuestions: "Verifikasi cerita dan semua soal C1–C4",
    saveProfileAndAssignment: "Simpan Profil & Assignment",
    openCategoryGenerator: "Buka Generator Kategori →",
  },

  fil: {
    // Header & Common
    studentPortal: "Portal ng Estudyante",
    teacherPortal: "Portal ng Guro",
    footerText: "ReadBuddy AI © 2026 — Na-verify na ASEAN Literacy Screening",
    back: "Bumalik",
    logout: "Mag-logout",
    saving: "Nagse-save...",
    checking: "Sinusuri...",
    connecting: "Kumokonekta...",

    // Student Auth & Onboarding
    profileTitle: "Profile sa Pagkatuto ng Mag-aaral",
    profileSubtitle:
      "Gumawa ng profile o mag-log in bago sumali sa iyong klase.",
    registerNewProfile: "Magrehistro ng Bagong Profile",
    loginToProfile: "Mag-login sa Aking Profile",
    profileRegTitle: "Pagpaparehistro ng Profile",
    profileRegSubtitle:
      "Ilalagay ang code ng klase pagkatapos makumpleto ang profile.",
    nickname: "Palayaw",
    loginId: "Login ID",
    personalPin: "Personal na PIN",
    pinPlaceholder: "Min. 4-digit na numero",
    schoolGrade: "Baitang sa Paaralan",
    location: "Lokasyon",
    readingInterests: "Mga Interes sa Pagbasa",
    selectOneOrMore: "Pumili ng isa o higit pa",
    interestDetailsLabel: "Sabihin pa sa amin ang tungkol sa iyong mga interes",
    optional: "(opsyonal)",
    interestDetailsPlaceholder:
      "Hal. Mahilig ako sa football, pagguhit ng robots, mga hayop sa dagat, at kwento ng pakikipagsapalaran.",
    registerAndContinue: "Magparehistro at Magpatuloy",
    loginTitle: "Login ng Mag-aaral",
    loginSubtitle: "Mag-log in muna, pagkatapos ay sumali sa iyong klase.",
    loginBtn: "Mag-login",

    // Student Class & Stories
    helloStudent: "Kamusta",
    classIntro:
      "Handa na ang iyong profile. Ilagay ngayon ang code ng klase mula sa iyong guro.",
    joinClassBtn: "Sumali sa Klase",
    changeClass: "Palitan ang klase",
    yourInterestLibrary: "Aklatan ng Iyong Interes",
    selectStorySubtitle: "Pumili ng kwento na nais mong basahin ngayon:",
    storiesCount: "mga kwento",
    waitingTeacherAssignment: "Naghihintay ng takdang-aralin mula sa guro",
    waitingTeacherSubtitle:
      "Inihahanda ng iyong guro ang mga module ng aktibidad sa pagbasa para sa iyong profile.",
    noVerifiedStories:
      "Wala pang na-verify na kwento para sa iyong mga interes",
    noVerifiedStoriesSubtitle:
      "Inihahanda at sinusuri pa ng iyong guro ang mga kwento sa Teacher Portal.",
    startFirstQuest: "Simulan ang Unang Pagsasanay →",

    // Quest Screening
    startReading: "SIMULAN ANG PAGBASA",
    startQuest: "SIMULAN ANG PAGSASANAY",
    startRecording: "Simulan ang Pag-record ng Boses",
    finishReading: "Tapusin ang Pagbasa",
    voiceHeard: "Narinig",
    c1Remembering: "Antas C1: Pag-alala",
    c2Understanding: "Antas C2: Pag-unawa",
    c3PlanBuilder: "C3 · Tagabuo ng Plano",
    c4EvidenceDetective: "C4 · Detektib ng Ebidensya",
    c3Instruction:
      "Ayusin ang mga hakbang mula una hanggang huli gamit ang mga pindutan ng arrow:",
    storyClaim: "Pahayag ng Kwento:",
    c4InstructionDefault:
      "Piliin ang {count} mga pangungusap na pinakamahusay na sumusuporta sa pahayag sa itaas.",
    selectedCount: "Napili",
    nextBtn: "Susunod →",
    finishAndSubmit: "Tapusin at Isumite 🏆",
    screeningDoneTitle: "Matagumpay na Nakumpleto ang Pagsusuri!",
    fluencyLabel: "Kalinawan sa Pagbasa",
    bloomGamesLabel: "Mga Laro ng Bloom",
    backToHome: "Bumalik sa Home",

    // Teacher Dashboard
    teacherLoginTitle: "Login ng Guro",
    teacherLoginSubtitle:
      "Mag-log in upang pamahalaan ang mga klase at suriin ang mga pagsasanay sa AI",
    enterTeacherPortal: "Pumasok sa Portal ng Guro",
    teacherDashboardTitle: "Dashboard ng Guro at AI Verifier",
    teacherSubtitle:
      "Pamahalaan ang roster ng mag-aaral, na-verify na mga kwento, at mga resulta ng pagsusuri",
    tabClasses: "Mga Klase at Mag-aaral",
    tabStoryBank: "Bangko ng Kwento ng AI",
    tabAnalytics: "Mga Resulta ng Pagsusuri",
    createNewClass: "Gumawa ng Bagong Klase",
    className: "Pangalan ng Klase",
    targetGrade: "Baitang ng Klase",
    generateClassBtn: "+ Bumuo ng Bagong Klase (4-Digit Code)",
    studentSelfRegTitle: "Direktang Pagpaparehistro ng Mag-aaral",
    studentSelfRegDesc:
      "Ang mga mag-aaral ay gumagawa ng kanilang sariling profile at PIN bago ilagay ang code ng klase",
    codeToShare: "Code ng Klase na Ibahagi",
    classRoster: "Talaan ng Klase",
    studentsCount: "Mga Mag-aaral",
    noStudentsRegistered:
      "Wala pang mag-aaral na nakasali sa klaseng ito. Ibahagi ang code sa kanila.",
    inspectAndAssign: "Suriin at Magtalaga",
    assigned: "Naitakda na",
    needsReview: "Kailangan ng pagsusuri",
    storyBrief: "Maikling Buod ng Kwento",
    storyBriefPlaceholder:
      "Hal. Kwento tungkol sa pagtutulungan sa paglilinis ng ilog pagkatapos ng ulan, tampok ang isang bata at ibong kalaw.",
    generateStoryTask: "Bumuo ng Pagsasanay",
    generatingWithGemini: "Bumubuo gamit ang Gemini...",
    verifiedBadge: "Na-verify",
    reviewBadge: "Suriin",
    reviewAndVerifyBtn: "Suriin at I-verify",
    inspectC1C4Btn: "Suriin ang C1–C4",
    unverifyStory: "Kanselahin ang pag-verify ng kwento",
    verifyStoryAndQuestions: "I-verify ang kwento at lahat ng tanong sa C1–C4",
    saveProfileAndAssignment: "I-save ang Profile at Takdang-Aralin",
    openCategoryGenerator: "Buksan ang Tagabuo ng Kategorya →",
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (
    key: keyof typeof translations.en,
    params?: Record<string, string | number>,
  ) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    const saved = localStorage.getItem("readbuddy_lang") as Language;
    if (saved && (saved === "en" || saved === "id" || saved === "fil")) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("readbuddy_lang", lang);
  };

  const t = (
    key: keyof typeof translations.en,
    params?: Record<string, string | number>,
  ): string => {
    const dict = translations[language] || translations.en;
    let text = dict[key] || translations.en[key] || String(key);
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
      });
    }
    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
