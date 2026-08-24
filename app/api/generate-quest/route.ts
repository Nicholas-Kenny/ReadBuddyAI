// app/api/generate-quest/route.ts
import { NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import { supabase } from "@/lib/supabase";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const FOLKLORE_COUNTRIES = ["Indonesia 🇮🇩", "Philippines 🇵🇭", "Malaysia 🇲🇾"];

const GRADE_CONFIG: Record<
  string,
  {
    words: string;
    c1Rule: string;
    c2Rule: string;
    c3Rule: string;
    c4Rule: string;
  }
> = {
  "Grade 1": {
    words: "35 to 50 words",
    c1Rule: "Test 1 simple explicit fact like color or object.",
    c2Rule: "Focus on character feelings or simple emotions.",
    c3Rule: "Simple physical action in a similar situation.",
    c4Rule: "Compare 2 simple choices made by character.",
  },
  "Grade 2": {
    words: "60 to 80 words",
    c1Rule: "Test character name and explicit story location.",
    c2Rule: "Cause-and-effect of simple events (2 matching pairs).",
    c3Rule: "Applying a moral rule at school or home.",
    c4Rule: "Safety reason or risk analysis.",
  },
  "Grade 3": {
    words: "85 to 110 words",
    c1Rule: "Explicit chronological sequence of story events.",
    c2Rule: "Summary of the main conflict or problem.",
    c3Rule: "Propose an alternative tool or creative solution.",
    c4Rule: "Compare urgency and priority scale.",
  },
  "Grade 4": {
    words: "110 to 140 words",
    c1Rule: "Specific numbers, measurements, or explicit narrative data.",
    c2Rule: "Interpret deeper moral lesson and character motives.",
    c3Rule: "Formulate an action plan or long-term personal strategy.",
    c4Rule: "Evaluate moral trade-offs and complex consequences.",
  },
};

export async function POST(req: Request) {
  try {
    const {
      grade = "Grade 2",
      interest = "Folklore & Legends",
      classCode = "A490",
      autoSave = true,
    } = await req.json();

    const selectedGrade = GRADE_CONFIG[grade] || GRADE_CONFIG["Grade 2"];
    const randomCountry =
      FOLKLORE_COUNTRIES[Math.floor(Math.random() * FOLKLORE_COUNTRIES.length)];

    const prompt = `You are an early-grade literacy assessment specialist.
Generate an educational reading screening passage and Bloom's Taxonomy (C1-C4) question matrix in English.

Target Parameters:
- Target Grade: ${grade} (Length: ${selectedGrade.words})
- Interest Theme: ${interest}
- Cultural/Country Setting: ${randomCountry}

Difficulty Rules:
- C1 (Remembering - 15%): ${selectedGrade.c1Rule}. Provide 3 options (1 correct = 15 score, 2 false = 0 score).
- C2 (Understanding - 25%): ${selectedGrade.c2Rule}. Provide 2 cause-and-effect pairs (weight: 12.5 each).
- C3 (Applying - 30%): ${selectedGrade.c3Rule}. Provide 3 options (scores: 30 for full, 15 for partial, 0 for off-target).
- C4 (Analysing - 30%): ${selectedGrade.c4Rule}. Provide 3 options (scores: 30 for deep/logical analysis, 15 for shallow, 0 for illogical).`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            passageText: { type: Type.STRING },
            wordCount: { type: Type.NUMBER },
            c1: {
              type: Type.OBJECT,
              properties: {
                weight: { type: Type.NUMBER },
                prompt: { type: Type.STRING },
                options: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      text: { type: Type.STRING },
                      emojiFallback: { type: Type.STRING },
                      bgColor: { type: Type.STRING },
                      score: { type: Type.NUMBER },
                    },
                    required: [
                      "id",
                      "text",
                      "emojiFallback",
                      "bgColor",
                      "score",
                    ],
                  },
                },
              },
              required: ["weight", "prompt", "options"],
            },
            c2: {
              type: Type.OBJECT,
              properties: {
                weight: { type: Type.NUMBER },
                prompt: { type: Type.STRING },
                pairs: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      causeText: { type: Type.STRING },
                      causeEmoji: { type: Type.STRING },
                      effectText: { type: Type.STRING },
                      effectEmoji: { type: Type.STRING },
                      weight: { type: Type.NUMBER },
                    },
                    required: [
                      "id",
                      "causeText",
                      "causeEmoji",
                      "effectText",
                      "effectEmoji",
                      "weight",
                    ],
                  },
                },
              },
              required: ["weight", "prompt", "pairs"],
            },
            c3: {
              type: Type.OBJECT,
              properties: {
                weight: { type: Type.NUMBER },
                scenario: { type: Type.STRING },
                options: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      text: { type: Type.STRING },
                      emojiFallback: { type: Type.STRING },
                      bgColor: { type: Type.STRING },
                      score: { type: Type.NUMBER },
                    },
                    required: [
                      "id",
                      "text",
                      "emojiFallback",
                      "bgColor",
                      "score",
                    ],
                  },
                },
              },
              required: ["weight", "scenario", "options"],
            },
            c4: {
              type: Type.OBJECT,
              properties: {
                weight: { type: Type.NUMBER },
                scenario: { type: Type.STRING },
                options: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      text: { type: Type.STRING },
                      emojiFallback: { type: Type.STRING },
                      bgColor: { type: Type.STRING },
                      score: { type: Type.NUMBER },
                    },
                    required: [
                      "id",
                      "text",
                      "emojiFallback",
                      "bgColor",
                      "score",
                    ],
                  },
                },
              },
              required: ["weight", "scenario", "options"],
            },
          },
          required: [
            "title",
            "passageText",
            "wordCount",
            "c1",
            "c2",
            "c3",
            "c4",
          ],
        },
      },
    });

    const questData = JSON.parse(response.text || "{}");
    const storyId = `story_${Date.now()}`;

    const newStoryRecord = {
      id: storyId,
      class_code: classCode,
      grade,
      interest,
      country_origin: randomCountry,
      title: questData.title,
      passage_text: questData.passageText,
      word_count:
        questData.wordCount || questData.passageText.split(/\s+/).length,
      c1_data: questData.c1,
      c2_data: questData.c2,
      c3_data: questData.c3,
      c4_data: questData.c4,
      is_verified: false,
    };

    if (autoSave) {
      await supabase.from("stories").insert(newStoryRecord);
    }

    return NextResponse.json(newStoryRecord);
  } catch (error: any) {
    console.error("AI Quest Generation Error:", error);
    return NextResponse.json(
      { error: error.message || "Generation failed" },
      { status: 500 },
    );
  }
}
