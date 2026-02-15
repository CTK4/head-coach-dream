import questionsJson from "@/data/hc_interview_press_banks.json";

export type InterviewAnswer = {
  key: string;
  text: string;
  delta: Record<string, number>;
};

export type InterviewQuestion = {
  id: string;
  type: string;
  cluster: string;
  prompt: string;
  answers: InterviewAnswer[];
};

const allItems = (questionsJson as any).items as InterviewQuestion[];

export function getInterviewQuestions(count = 4): InterviewQuestion[] {
  // Filter to HC_INTERVIEW type only
  const hcQuestions = allItems.filter((q) => q.type === "HC_INTERVIEW");
  // Shuffle and return `count` questions
  const shuffled = [...hcQuestions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export const AXES = (questionsJson as any).axes as string[];
