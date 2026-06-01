import { ANSWERS, type Answer } from "../data/conversation";

/** Route free text to the best Answer by keyword overlap. */
export function matchAnswer(input: string): Answer | null {
  const text = input.toLowerCase();
  let best: { answer: Answer; score: number } | null = null;

  for (const answer of ANSWERS) {
    let score = 0;
    for (const kw of answer.keywords) {
      if (text.includes(kw)) score += kw.length;
    }
    if (score > 0 && (!best || score > best.score)) {
      best = { answer, score };
    }
  }
  return best?.answer ?? null;
}

export function answerById(id: string): Answer | undefined {
  return ANSWERS.find((a) => a.id === id);
}
