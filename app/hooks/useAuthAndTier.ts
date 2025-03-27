import { useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/firebase";
import { supabase } from "@/app/utils/frontend-client";
import { membershipLimits, MembershipTier } from "@/app/data/membershipLimits";

// The row in your usage_limits table, updated with new fields.
interface UsageData {
  youtube_transcriptions: number;
  flashcard_generations: number;
  flashcard_saves: number;
  quiz_generations: number;
  quiz_saves: number;
  summary_generations: number;   // Monthly count for generated summaries
  generation_usage: number;      // Monthly count for generation usage (new)
  transcript_saves: number;      // Persistent count for saved transcripts
  saved_summaries: number;       // Persistent count for saved summaries
  saved_generation: number;      // Persistent count for saved generation (new)
  cycle_start: string;           // ISO date string for monthly usage reset (for monthly fields)
}

// A typed version of the usage_limits keys, excluding cycle_start.
type UsageKey = keyof Omit<UsageData, "cycle_start">;

// Map usage key names (from DB) to membership limit keys (in camelCase) from membershipLimits.
const usageToLimitMap: Record<UsageKey, keyof typeof membershipLimits["Free"]> = {
  youtube_transcriptions: "youtubeTranscriptions",
  flashcard_generations: "flashcardGenerations",
  flashcard_saves: "flashcardSaves",
  quiz_generations: "quizGenerations",
  quiz_saves: "quizSaves",
  summary_generations: "summaryGenerations",
  generation_usage: "generationUsage",
  transcript_saves: "transcriptSaves",
  saved_summaries: "savedSummaries",
  saved_generation: "savedGeneration",
};

// List of monthly usage fields that should be reset every 30 days.
const monthlyFields: UsageKey[] = [
  "youtube_transcriptions",
  "flashcard_generations",
  "quiz_generations",
  "summary_generations",
  "generation_usage"
];

export function useAuthAndTier() {
  const [user, setUser] = useState<User | null>(null);
  const [tier, setTier] = useState<MembershipTier>("Free");
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        // 1) Fetch membership tier.
        const { data: membership, error: membershipError } = await supabase
          .from("memberships")
          .select("tier")
          .eq("uid", firebaseUser.uid)
          .single();

        if (membershipError || !membership?.tier) {
          setTier("Free");
        } else {
          setTier(membership.tier as MembershipTier);
        }

        // 2) Fetch or initialize usage data.
        const { data: usageData, error: usageError } = await supabase
          .from("usage_limits")
          .select("*")
          .eq("firebase_uid", firebaseUser.uid)
          .single();

        const today = new Date();
        if (usageError || !usageData) {
          // No usage record: initialize all monthly counters to 0 and persistent ones to 0.
          const newUsage: UsageData = {
            youtube_transcriptions: 0,
            flashcard_generations: 0,
            flashcard_saves: 0,
            quiz_generations: 0,
            quiz_saves: 0,
            summary_generations: 0,
            generation_usage: 0,
            transcript_saves: 0,
            saved_summaries: 0,
            saved_generation: 0,
            cycle_start: today.toISOString(),
          };
          setUsage(newUsage);

          await supabase.from("usage_limits").insert({
            firebase_uid: firebaseUser.uid,
            ...newUsage,
          });
        } else {
          // Check if 30-day cycle has expired for monthly fields.
          const cycleStart = new Date(usageData.cycle_start);
          const diffDays = (today.getTime() - cycleStart.getTime()) / (1000 * 60 * 60 * 24);

          if (diffDays >= 30) {
            // Reset monthly usage fields while preserving persistent fields.
            const resetUsage: UsageData = {
              ...usageData,
              youtube_transcriptions: 0,
              flashcard_generations: 0,
              quiz_generations: 0,
              summary_generations: 0,
              generation_usage: 0,
              cycle_start: today.toISOString(),
            };
            setUsage(resetUsage);
            await supabase
              .from("usage_limits")
              .update(resetUsage)
              .eq("firebase_uid", firebaseUser.uid);
          } else {
            setUsage(usageData);
          }
        }
      } else {
        // Not logged in: reset to defaults.
        setTier("Free");
        setUsage(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /**
   * Check if a given usage feature can be incremented by `increment`.
   * Returns { allowed, resetDate }.
   */
  const checkUsageLimit = (feature: UsageKey, increment = 1): { allowed: boolean; resetDate?: Date } => {
    if (!usage) return { allowed: false };
    const limit = membershipLimits[tier][usageToLimitMap[feature]];
    // -1 indicates unlimited.
    if (limit === -1) return { allowed: true };

    const currentCount = usage[feature];
    const newCount = currentCount + increment;
    const allowed = newCount <= limit;

    // Only provide a reset date for monthly usage fields.
    let resetDate: Date | undefined = undefined;
    if (monthlyFields.includes(feature)) {
      resetDate = new Date(new Date(usage.cycle_start).getTime() + 30 * 24 * 60 * 60 * 1000);
    }
    return { allowed, resetDate };
  };

  /**
   * Increment a usage feature by `increment`.
   * Call this only after verifying the limit is not exceeded.
   */
  const updateUsage = async (feature: UsageKey, increment = 1) => {
    if (!user || !usage) return;
    const newCount = usage[feature] + increment;
    const updated: UsageData = { ...usage, [feature]: newCount };
    setUsage(updated);
    await supabase.from("usage_limits").update({ [feature]: newCount }).eq("firebase_uid", user.uid);
  };

  return { user, tier, usage, loading, checkUsageLimit, updateUsage };
}
