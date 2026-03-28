export type UserRole = "mother" | "chw" | "admin";
export type RiskLevel = "low" | "medium" | "high";
export type Sentiment = "positive" | "neutral" | "negative";

export interface User {
  uid: string;
  email: string;
  role: UserRole;
  name: string;
  language: string;
  county: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
}

export interface Mother extends User {
  postpartumDay: number;
  assignedCHW: string;
  riskLevel: RiskLevel;
  gardenPetals: number;
  badges: Badge[];
}

export interface CHW extends User {
  assignedMothers: string[];
  county: string;
  subCounty: string;
}

export interface CheckInResponse {
  questionId: string;
  questionText: string;
  answer: string | number | boolean;
  sentiment: Sentiment;
}

export interface CheckIn {
  id: string;
  userId: string;
  timestamp: string;
  responses: CheckInResponse[];
  riskScore: number;
  riskLevel: RiskLevel;
  aiSummary: string;
}

export interface CompanionMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export type AppUser = User | Mother | CHW;
