import { NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import { supabase } from "@/lib/supabase";
import { runLocalDbOperation } from "@/lib/localDbServer";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      studentId,
      studentName,
      classCode,
      storyTitle,
      passageText,
      transcribedText,
      wcpm,
      accuracy,
      c1Score,
      c2Score,
      c3Score,
      c4Score,
      totalBloomScore,
      assignedActivities,
    } = body;

    const hasOralReading = assignedActivities?.oralReading !== false;
    const availableBloomPoints =
      (assignedActivities?.c1 ? 15 : 0) +
      (assignedActivities?.c2 ? 25 : 0) +
      (assignedActivities?.c3 ? 30 : 0) +
      (assignedActivities?.c4 ? 30 : 0);
    const normalizedFluency = Math.min(100, Math.round((wcpm / 90) * 100));
    const normalizedBloom = availableBloomPoints
      ? Math.round((totalBloomScore / availableBloomPoints) * 100)
      : 0;
    const compositeScore = hasOralReading
      ? availableBloomPoints
        ? Math.round(0.3 * normalizedFluency + 0.7 * normalizedBloom)
        : normalizedFluency
      : normalizedBloom;

    const status =
      compositeScore >= 75
        ? "green"
        : compositeScore >= 50
          ? "yellow"
          : "red";

    let strength = "Good reading engagement and strong factual understanding.";
    let weakness = "Occasional hesitation on multi-syllable terms.";
    let solution = "Practice syllable chunking cards before oral reading.";
    let feedback = "Great reading effort! Keep up the daily reading habit!";

    if (process.env.NEXT_PUBLIC_USE_LOCAL_DB !== "true") {
      try {
        const prompt = `Evaluate student screening:
Student: ${studentName}, Story: "${storyTitle}", WCPM: ${hasOralReading ? wcpm : "not assigned"}, Acc: ${hasOralReading ? `${accuracy}%` : "not assigned"}, Assigned Bloom score: ${totalBloomScore}/${availableBloomPoints || 0} (${normalizedBloom}%).
Diagnose concise strength, weakness, solution (for teacher), and feedback (for student).`;

        const response = await ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                strength: { type: Type.STRING },
                weakness: { type: Type.STRING },
                solution: { type: Type.STRING },
                feedback: { type: Type.STRING },
              },
              required: ["strength", "weakness", "solution", "feedback"],
            },
          },
        });

        const aiData = JSON.parse(response.text || "{}");
        if (aiData.strength) strength = aiData.strength;
        if (aiData.weakness) weakness = aiData.weakness;
        if (aiData.solution) solution = aiData.solution;
        if (aiData.feedback) feedback = aiData.feedback;
      } catch (e) {
        console.warn("Gemini fallback used:", e);
      }
    }

    const assessmentId = `asm_${Date.now()}`;
    const assessmentRecord = {
      id: assessmentId,
      student_id: studentId || null,
      student_name: studentName,
      class_code: (classCode || "A490").toUpperCase(),
      story_title: storyTitle,
      wcpm,
      accuracy,
      c1_score: c1Score,
      c2_score: c2Score,
      c3_score: c3Score,
      c4_score: c4Score,
      total_bloom_score: normalizedBloom,
      composite_score: compositeScore,
      status,
      transcribed_text: transcribedText,
      words_to_practice: body.wordsToPractice || [],
      strength,
      weakness,
      solution,
      feedback,
    };

    if (process.env.NEXT_PUBLIC_USE_LOCAL_DB === "true") {
      await runLocalDbOperation({
        action: "insert",
        table: "assessments",
        values: assessmentRecord,
      });
    } else {
      await supabase.from("assessments").insert(assessmentRecord);
    }

    return NextResponse.json({
      success: true,
      compositeScore,
      normalizedBloom,
      status,
      strength,
      weakness,
      solution,
      feedback,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
