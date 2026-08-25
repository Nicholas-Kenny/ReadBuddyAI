export interface PlanStep {
  id: string;
  text: string;
  order: number;
}

export interface EvidenceItem {
  id: string;
  text: string;
  score: number;
}

export function getPlanSteps(c3Data: any): PlanStep[] {
  if (Array.isArray(c3Data?.steps) && c3Data.steps.length > 1) {
    return c3Data.steps
      .map((step: any, index: number) => ({
        id: String(step.id || `step_${index + 1}`),
        text: String(step.text || ""),
        order: Number(step.order || index + 1),
      }))
      .sort((left: PlanStep, right: PlanStep) => left.order - right.order);
  }

  return [
    { id: "step_1", text: "Notice what needs help and understand the problem.", order: 1 },
    { id: "step_2", text: "Invite classmates and prepare safe tools to share.", order: 2 },
    { id: "step_3", text: "Finish the task together and explain how to keep the place safe.", order: 3 },
  ];
}

export function getEvidenceItems(c4Data: any, passageText: string): EvidenceItem[] {
  if (Array.isArray(c4Data?.evidence) && c4Data.evidence.length > 1) {
    return c4Data.evidence.map((item: any, index: number) => ({
      id: String(item.id || `evidence_${index + 1}`),
      text: String(item.text || ""),
      score: Number(item.score || 0),
    }));
  }

  const sentences = passageText
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
  const correctIndexes = new Set(
    sentences.length > 1 ? [sentences.length - 2, sentences.length - 1] : [0],
  );
  const correctCount = correctIndexes.size || 1;
  const pointsPerSentence = Number(c4Data?.weight || 30) / correctCount;

  return sentences.map((sentence, index) => ({
    id: `evidence_${index + 1}`,
    text: sentence,
    score: correctIndexes.has(index) ? pointsPerSentence : 0,
  }));
}

export function getEvidenceSelectionCount(c4Data: any, evidence: EvidenceItem[]) {
  return Number(
    c4Data?.requiredSelections || evidence.filter((item) => item.score > 0).length || 1,
  );
}
