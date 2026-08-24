import { NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import { supabase } from "@/lib/supabase";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
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
    } = body;

    const normalizedFluency = Math.min(100, Math.round((wcpm / 90) * 100));
    const compositeScore = Math.round(
      0.3 * normalizedFluency + 0.7 * totalBloomScore,
    );

    const status =
      wcpm >= 65 && totalBloomScore >= 75
        ? "green"
        : totalBloomScore >= 50
          ? "yellow"
          : "red";

    let strength = "Good reading engagement and strong factual understanding.";
    let weakness = "Occasional hesitation on multi-syllable terms.";
    let solution = "Practice syllable chunking cards before oral reading.";
    let feedback = "Great reading effort! Keep up the daily reading habit!";

    try {
      const prompt = `Evaluate student screening:
Student: ${studentName}, Story: "${storyTitle}", WCPM: ${wcpm}, Acc: ${accuracy}%, Bloom C1-C4 Total: ${totalBloomScore}/100.
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

    const assessmentId = `asm_${Date.now()}`;
    await supabase.from("assessments").insert({
      id: assessmentId,
      student_name: studentName,
      class_code: (classCode || "A490").toUpperCase(),
      story_title: storyTitle,
      wcpm,
      accuracy,
      c1_score: c1Score,
      c2_score: c2Score,
      c3_score: c3Score,
      c4_score: c4Score,
      total_bloom_score: totalBloomScore,
      composite_score: compositeScore,
      status,
      transcribed_text: transcribedText,
      words_to_practice: body.wordsToPractice || [],
      strength,
      weakness,
      solution,
      feedback,
    });

    return NextResponse.json({
      success: true,
      compositeScore,
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
