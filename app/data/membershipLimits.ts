export type MembershipTier = "Free" | "Gold" | "Diamond";

export interface MembershipLimit {
  youtubeTranscriptions: number;    // -1 means unlimited
  flashcardGenerations: number;     // -1 means unlimited
  flashcardSaves: number;
  quizGenerations: number;
  quizSaves: number;
  transcriptSaves: number;          // Limit on transcript saves: 10 (Free), 50 (Gold), -1 (Diamond)
  summaryGenerations: number;       // Limit on generated summaries: 100 (Free), 300 (Gold), -1 (Diamond)
  savedSummaries: number;           // Limit on saved summaries: 10 (Free), 50 (Gold), -1 (Diamond)
  generationUsage: number;          // Monthly generation usage: 5 (Free), 25 (Gold), 60 (Diamond)
  savedGeneration: number;          // Persistent generation saves: 3 (Free), 10 (Gold), 25 (Diamond)
}

export const membershipLimits: Record<MembershipTier, MembershipLimit> = {
  Free: {
    youtubeTranscriptions: 35,
    flashcardGenerations: 300,
    flashcardSaves: 5,
    quizGenerations: 5,
    quizSaves: 3,
    transcriptSaves: 10,
    summaryGenerations: 100,
    savedSummaries: 10,
    generationUsage: 5,
    savedGeneration: 3,
  },
  Gold: {
    youtubeTranscriptions: 150,
    flashcardGenerations: 1200,
    flashcardSaves: 25,
    quizGenerations: 25,
    quizSaves: 10,
    transcriptSaves: 50,
    summaryGenerations: 300,
    savedSummaries: 50,
    generationUsage: 25,
    savedGeneration: 10,
  },
  Diamond: {
    youtubeTranscriptions: -1,
    flashcardGenerations: -1,
    flashcardSaves: 50,
    quizGenerations: 60,
    quizSaves: 25,
    transcriptSaves: -1,
    summaryGenerations: -1,
    savedSummaries: -1,
    generationUsage: -1,
    savedGeneration: -1,
  },
};
