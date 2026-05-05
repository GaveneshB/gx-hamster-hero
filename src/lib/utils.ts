import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Mood } from "@/components/Hamster";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateSpendingRisk(user: {
  balance: number;
  income: number;
  payday: number;
  emergencyBuffer: { current: number; target: number };
  bnplActive: number;
  bnplTotal: number;
}): number {
  // Calculate 30-day risk based on multiple factors
  let riskScore = 0;

  // Factor 1: BNPL load (higher is worse) - max 30 points
  const bnplRatio = user.bnplTotal / user.income;
  riskScore += Math.min(30, bnplRatio * 100);

  // Factor 2: Buffer status (lower is worse) - max 35 points
  const bufferRatio = user.emergencyBuffer.current / user.emergencyBuffer.target;
  riskScore += Math.max(0, (1 - bufferRatio) * 35);

  // Factor 3: Days to payday (more days = more risk) - max 25 points
  const today = new Date().getDate();
  const daysToPayday = user.payday > today ? user.payday - today : 30 - today + user.payday;
  riskScore += (daysToPayday / 30) * 25;

  // Factor 4: Balance sufficiency (lower balance = higher risk) - max 10 points
  const balanceRatio = user.balance / user.income;
  riskScore += Math.max(0, (1 - Math.min(balanceRatio, 1)) * 10);

  return Math.round(Math.min(100, riskScore));
}

export function getHamsterMood(riskScore: number): Mood {
  if (riskScore >= 60) return "worried";
  if (riskScore <= 25) return "happy";
  // Medium risk - mix happy and worried
  return Math.random() > 0.5 ? "happy" : "worried";
}
