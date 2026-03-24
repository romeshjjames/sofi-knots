export type FaqStatus = "active" | "inactive";

export type FaqRecord = {
  id: string;
  question: string;
  answer: string;
  category: string;
  displayOrder: number;
  status: FaqStatus;
  updatedAt: string | null;
};
