// app/api/generate-quest/route.ts
import { NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import { supabase } from "@/lib/supabase";
import { runLocalDbOperation } from "@/lib/localDbServer";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const FOLKLORE_COUNTRIES = ["Indonesia 🇮🇩", "Philippines 🇵🇭", "Malaysia 🇲🇾"];

// Model priority list for automatic cascading fallback on rate limit / quota exhaustion
const CANDIDATE_MODELS = Array.from(
  new Set([
    process.env.GEMINI_MODEL || "gemini-2.5-flash",
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-3.5-flash",
    "gemini-3.7-flash",
    "gemini-3.6-flash",
  ]),
);

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

function createLocalQuest(interest: string, refinementPrompt?: string) {
  const learner = "Alya";
  const theme =
    interest === "Nature & Mangroves"
      ? {
          title: `${learner} and the Young Mangrove`,
          emoji: "🌿",
          place: "the muddy coast",
          goal: "plant a young mangrove to protect the shore",
          discovery: "a tiny crab hiding beside the roots",
        }
      : interest === "Marine Life & Islands"
        ? {
            title: `${learner} and the Coral Garden`,
            emoji: "🌊",
            place: "a small island beach",
            goal: "help collect litter before it reached the coral reef",
            discovery: "a bright blue fish swimming in clean water",
          }
        : interest === "Science & Wildlife"
          ? {
              title: `${learner} and the Forest Footprints`,
              emoji: "🔬",
              place: "a forest learning trail",
              goal: "observe animal tracks without disturbing their homes",
              discovery: "three small footprints near a fallen leaf",
            }
          : {
              title: `${learner} and the Helpful Hornbill`,
              emoji: "🐉",
              place: "a village beside the rainforest",
              goal: "return a lost seed pouch to the village gardener",
              discovery: "a hornbill pointing toward the garden path",
            };

  const cleanBrief = refinementPrompt?.trim().replace(/[.!?]+$/, "");
  const teacherDirection = cleanBrief
    ? ` Before they began, the teacher added this special challenge: ${cleanBrief}.`
    : "";
  const passageText = `${learner} visited ${theme.place} with classmates.${teacherDirection} Their teacher asked everyone to ${theme.goal}. ${learner} worked carefully and noticed ${theme.discovery}. The class shared their tools, finished the task together, and left the place safer than they found it. On the way home, ${learner} explained that small, thoughtful actions can help a whole community.`;

  return {
    title: theme.title,
    passageText,
    wordCount: passageText.split(/\s+/).length,
    c1: {
      weight: 15,
      prompt: `What did ${learner} do with the class?`,
      options: [
        {
          id: "c1_1",
          text: theme.goal,
          emojiFallback: theme.emoji,
          bgColor: "",
          score: 15,
        },
        {
          id: "c1_2",
          text: "Stayed home and watched television",
          emojiFallback: "📺",
          bgColor: "",
          score: 0,
        },
        {
          id: "c1_3",
          text: "Left the group without helping",
          emojiFallback: "🚶",
          bgColor: "",
          score: 0,
        },
      ],
    },
    c2: {
      weight: 25,
      prompt: "Match each action to its outcome.",
      pairs: [
        {
          id: "p1",
          causeText: "The class shared their tools",
          causeEmoji: "🧰",
          effectText: "Everyone could finish the task",
          effectEmoji: "✅",
          weight: 12.5,
        },
        {
          id: "p2",
          causeText: "They worked carefully",
          causeEmoji: "🤲",
          effectText: "The place became safer",
          effectEmoji: "🌟",
          weight: 12.5,
        },
      ],
    },
    c3: {
      weight: 30,
      scenario:
        "Your class wants to improve a shared place. Arrange the plan from first to last.",
      steps: [
        {
          id: "step_1",
          text: "Notice what needs help and understand the problem.",
          order: 1,
        },
        {
          id: "step_2",
          text: "Invite classmates and prepare safe tools to share.",
          order: 2,
        },
        {
          id: "step_3",
          text: "Finish the task together and explain how to keep the place safe.",
          order: 3,
        },
      ],
    },
    c4: {
      weight: 30,
      claim:
        "Working together helped the class finish safely and improve the place.",
      instruction: "Select the two sentences that best support the claim.",
      requiredSelections: 2,
      evidence: passageText
        .split(/(?<=[.!?])\s+/)
        .map((text, index, sentences) => ({
          id: `evidence_${index + 1}`,
          text,
          score: index >= sentences.length - 2 ? 15 : 0,
        })),
    },
  };
}

export async function POST(req: Request) {
  try {
    const {
      grade = "Grade 2",
      interest = "Folklore & Legends",
      classCode = "A490",
      studentId,
      studentName,
      location,
      assignedActivities,
      refinementPrompt,
      targetLanguage = "English",
      autoSave = true,
    } = await req.json();

    const selectedGrade = GRADE_CONFIG[grade] || GRADE_CONFIG["Grade 2"];
    const randomCountry =
      FOLKLORE_COUNTRIES[Math.floor(Math.random() * FOLKLORE_COUNTRIES.length)];

    if (process.env.NEXT_PUBLIC_USE_LOCAL_DB === "true") {
      const questData = createLocalQuest(interest, refinementPrompt);
      const localStoryRecord = {
        id: `story_${Date.now()}`,
        class_code: classCode,
        student_id: studentId || null,
        student_name: studentName || null,
        teacher_prompt: refinementPrompt || null,
        grade,
        interest,
        country_origin: randomCountry,
        title: questData.title,
        passage_text: questData.passageText,
        word_count: questData.wordCount,
        c1_data: questData.c1,
        c2_data: questData.c2,
        c3_data: questData.c3,
        c4_data: questData.c4,
        is_verified: false,
      };

      if (autoSave) {
        await runLocalDbOperation({
          action: "insert",
          table: "stories",
          values: localStoryRecord,
        });
      }
      return NextResponse.json(localStoryRecord);
    }

    const prompt = `You are an early-grade literacy assessment specialist.
Generate an educational reading screening passage and Bloom's Taxonomy (C1-C4) question matrix strictly in ${targetLanguage}.

Target Parameters:
- Target Grade: ${grade} (Length: ${selectedGrade.words})
- Interest Theme: ${interest}
- Teacher Story Brief: ${refinementPrompt || "No extra brief. Create a broadly useful category story."}
- Student: ${studentName || "Class assignment"}
- Student Location: ${location || "Not provided"}. Use it only for familiar, age-appropriate context; do not state or infer private details.
- Assigned Activities: ${
      Object.entries(assignedActivities || {})
        .filter(([, enabled]) => enabled)
        .map(([activity]) => activity)
        .join(", ") || "All stages"
    }
- Cultural/Country Setting: ${randomCountry}

Difficulty Rules:
- C1 (Remembering - 15%): ${selectedGrade.c1Rule}. Provide 3 options (1 correct = 15 score, 2 false = 0 score).
- C2 (Understanding - 25%): ${selectedGrade.c2Rule}. Provide 2 cause-and-effect pairs (weight: 12.5 each).
- C3 (Applying - 30%): ${selectedGrade.c3Rule}. Create a Plan Builder with exactly 3 short action sentences. Store them in correct chronological order with order values 1, 2, and 3.
- C4 (Analysing - 30%): ${selectedGrade.c4Rule}. Create an Evidence Detective claim and include every passage sentence as an evidence item. Exactly 2 sentences must strongly support the claim and score 15 each; every other sentence scores 0.`;

    const schemaConfig = {
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
                  required: ["id", "text", "emojiFallback", "bgColor", "score"],
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
              steps: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    text: { type: Type.STRING },
                    order: { type: Type.NUMBER },
                  },
                  required: ["id", "text", "order"],
                },
              },
            },
            required: ["weight", "scenario", "steps"],
          },
          c4: {
            type: Type.OBJECT,
            properties: {
              weight: { type: Type.NUMBER },
              claim: { type: Type.STRING },
              instruction: { type: Type.STRING },
              requiredSelections: { type: Type.NUMBER },
              evidence: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    text: { type: Type.STRING },
                    score: { type: Type.NUMBER },
                  },
                  required: ["id", "text", "score"],
                },
              },
            },
            required: [
              "weight",
              "claim",
              "instruction",
              "requiredSelections",
              "evidence",
            ],
          },
        },
        required: ["title", "passageText", "wordCount", "c1", "c2", "c3", "c4"],
      },
    };

    let questData: any = null;
    let successfulModel = "";

    for (const model of CANDIDATE_MODELS) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: schemaConfig,
        });

        if (response.text) {
          questData = JSON.parse(response.text);
          successfulModel = model;
          break;
        }
      } catch (modelError: any) {
        console.warn(
          `[Gemini Fallback] Model "${model}" failed (quota/limit): ${modelError.message}. Trying next candidate...`,
        );
      }
    }

    // Zero-downtime fallback to local algorithmic generator if all models hit quota
    if (!questData) {
      console.warn(
        "[Gemini Fallback] All AI models exhausted. Falling back to local algorithmic template.",
      );
      questData = createLocalQuest(interest, refinementPrompt);
    } else {
      console.log(
        `[Gemini Fallback] Generated successfully via ${successfulModel}`,
      );
    }

    const storyId = `story_${Date.now()}`;
    const newStoryRecord = {
      id: storyId,
      class_code: classCode,
      student_id: studentId || null,
      student_name: studentName || null,
      teacher_prompt: refinementPrompt || null,
      grade,
      interest,
      country_origin: randomCountry,
      title: questData.title,
      passage_text: questData.passageText || questData.passage_text,
      word_count:
        questData.wordCount ||
        questData.passageText?.split(/\s+/).length ||
        questData.passage_text?.split(/\s+/).length ||
        50,
      c1_data: questData.c1 || questData.c1_data,
      c2_data: questData.c2 || questData.c2_data,
      c3_data: questData.c3 || questData.c3_data,
      c4_data: questData.c4 || questData.c4_data,
      is_verified: false,
    };

    if (autoSave) {
      if (process.env.NEXT_PUBLIC_USE_LOCAL_DB === "true") {
        await runLocalDbOperation({
          action: "insert",
          table: "stories",
          values: newStoryRecord,
        });
      } else {
        await supabase.from("stories").insert(newStoryRecord);
      }
    }

    return NextResponse.json(newStoryRecord);
  } catch (error: any) {
    console.error("AI Quest Generation Critical Error:", error);
    return NextResponse.json(
      { error: error.message || "Generation failed" },
      { status: 500 },
    );
  }
}
