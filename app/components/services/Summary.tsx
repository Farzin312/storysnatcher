"use client";
import { useState, useEffect, FormEvent } from "react";
import { LoginModal, Modal, Button, ProgressBar, Spinner, Option } from "../reusable/";
import whisperLanguagesData from "@/app/data/whisperLanguages.json";
import { useAuthAndTier } from "@/app/hooks/useAuthAndTier";

// Define transcript interface for saved transcripts
interface Transcript {
  id: string;
  transcript_name: string;
}

// Define language option type
interface WhisperLanguage {
  label: string;
  value: string;
}

const whisperLanguages: WhisperLanguage[] = whisperLanguagesData.languages;

// Define summary types
type SummaryType = "concise" | "detailed" | "bullet points" | "custom";

export default function Summary() {
  // Language and method states
  const [selectedLanguage, setSelectedLanguage] = useState<string>("en");
  const [activeMethod, setActiveMethod] = useState<"saved" | "youtube">("saved");

  // For saved transcripts
  const [savedTranscripts, setSavedTranscripts] = useState<Transcript[]>([]);
  const [selectedTranscriptId, setSelectedTranscriptId] = useState<string>("");
  const [transcriptsLoading, setTranscriptsLoading] = useState<boolean>(false);

  // For YouTube method
  const [youtubeUrl, setYoutubeUrl] = useState<string>("");

  // Summary generation states
  const [summary, setSummary] = useState<string>("");
  const [summaryLoading, setSummaryLoading] = useState<boolean>(false);
  const [summaryType, setSummaryType] = useState<SummaryType>("concise");
  const [customPrompt, setCustomPrompt] = useState<string>("");

  // Separate states for the two summary sources
  const [savedSummary, setSavedSummary] = useState<string>("");
  const [youtubeSummary, setYoutubeSummary] = useState<string>("");

  // New state for naming & saving summary
  const [summaryName, setSummaryName] = useState<string>("");
  const [saveLoading, setSaveLoading] = useState<boolean>(false);

  // Option state to ask which summary to save
  const [showOption, setShowOption] = useState<boolean>(false);
  // New state for the select field in Option
  const [selectedOptionForSave, setSelectedOptionForSave] = useState<string>("saved");

  // Use the revised hook for authentication and usage tracking.
  const { user, tier, checkUsageLimit, updateUsage } = useAuthAndTier();

  // Local state to control when to show the LoginModal.
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);

  // Modal state for displaying messages (errors or notifications)
  const [modalMessage, setModalMessage] = useState<string>("");

  // Progress modal state and progress percentage
  const [showProgressModal, setShowProgressModal] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);

  // Persist the selected language between remounts using localStorage
  useEffect(() => {
    const storedLanguage = localStorage.getItem("selectedLanguage");
    if (storedLanguage) {
      setSelectedLanguage(storedLanguage);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("selectedLanguage", selectedLanguage);
  }, [selectedLanguage]);

  // When activeMethod or user changes, fetch saved transcripts if needed.
  useEffect(() => {
    if (user && activeMethod === "saved") {
      fetchSavedTranscripts(user.uid);
    }
  }, [user, activeMethod]);

  // (Removed the effect that defaulted summaryName based on the transcript.)

  // Fetch saved transcripts from the API endpoint
  async function fetchSavedTranscripts(userId: string): Promise<void> {
    setTranscriptsLoading(true);
    try {
      const res = await fetch(`/api/transcribe/saved?userId=${userId}`);
      const data: { transcripts: Transcript[] } = await res.json();
      setSavedTranscripts(data.transcripts || []);
      if (data.transcripts && data.transcripts.length > 0) {
        setSelectedTranscriptId(data.transcripts[0].id);
      }
    } catch (error) {
      console.error("Error fetching saved transcripts:", error);
      setModalMessage("Error fetching saved transcripts. Please try again.");
    } finally {
      setTranscriptsLoading(false);
    }
  }

  // Simulate slow progress updates for summary generation and saving.
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    let timeout: NodeJS.Timeout | null = null;

    if (summaryLoading || saveLoading) {
      setShowProgressModal(true);
      setProgress(0);
      interval = setInterval(() => {
        setProgress((prev) => (prev < 95 ? prev + 1 : prev));
      }, 350);
    } else {
      setProgress(100);
      if (!modalMessage) {
        timeout = setTimeout(() => {
          setShowProgressModal(false);
          setProgress(0);
        }, 2000);
      } else {
        setShowProgressModal(false);
        setProgress(0);
      }
    }
    return () => {
      if (interval) clearInterval(interval);
      if (timeout) clearTimeout(timeout);
    };
  }, [summaryLoading, saveLoading, modalMessage]);

  // Handler for summary generation
  async function handleSummarize(e: FormEvent) {
    e.preventDefault();
    if (!user) {
      setModalMessage("Please log in to generate a summary.");
      return;
    }

    // Check usage limit for summary generation.
    const usageCheck = checkUsageLimit("summary_generations", 1);
    if (!usageCheck.allowed) {
      setModalMessage(
        tier !== "Diamond"
          ? "You have reached your monthly summary generation limit. Consider upgrading your membership."
          : "You have reached your monthly summary generation limit. Diamond membership cannot be upgraded."
      );
      return;
    }

    setSummaryLoading(true);
    const payload: {
      language: string;
      transcriptId?: string;
      youtubeUrl?: string;
      summaryType: SummaryType;
      customPrompt?: string;
    } = { language: selectedLanguage, summaryType };

    if (activeMethod === "saved") {
      if (!selectedTranscriptId) {
        setModalMessage("Please select a saved transcript.");
        setSummaryLoading(false);
        return;
      }
      payload.transcriptId = selectedTranscriptId;
    } else if (activeMethod === "youtube") {
      if (!youtubeUrl) {
        setModalMessage("Please enter a YouTube URL.");
        setSummaryLoading(false);
        return;
      }
      payload.youtubeUrl = youtubeUrl;
    }
    if (summaryType === "custom" && customPrompt.trim() !== "") {
      payload.customPrompt = customPrompt;
    }
    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data: { summary?: string; error?: string } = await res.json();
      if (data.error) {
        setModalMessage("Error summarizing transcript: " + data.error);
      } else {
        setSummary(data.summary || "");
        if (activeMethod === "saved") {
          setSavedSummary(data.summary || "");
        } else if (activeMethod === "youtube") {
          setYoutubeSummary(data.summary || "");
        }
        // Update usage after successful summary generation.
        await updateUsage("summary_generations", 1);
      }
    } catch (error) {
      console.error("Summary error:", error);
      setModalMessage("Summary failed. Please try again.");
    } finally {
      setSummaryLoading(false);
    }
  }

  // Helper function to perform the actual save.
  async function saveSummary(selectedSummary: string) {
    try {
      setSaveLoading(true);
      const token = await user!.getIdToken(true);
      const res = await fetch("/api/summarize/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user!.uid,
          transcriptId: activeMethod === "saved" ? selectedTranscriptId : null,
          summary: selectedSummary,
          summaryName: summaryName.trim(),
        }),
      });
      const data = await res.json();
      if (data.error) {
        setModalMessage("Error saving summary: " + data.error);
      } else {
        setModalMessage("Summary saved successfully!");
        if (activeMethod === "youtube") {
          setSummaryName("");
        }
        // Update usage for saving summary.
        await updateUsage("saved_summaries", 1);
      }
    } catch (error) {
      console.error("Error saving summary:", error);
      setModalMessage("Error saving summary. Please try again.");
    } finally {
      setSaveLoading(false);
    }
  }

  // Handler for saving the summary.
  async function handleSaveSummary() {
    if (!user) {
      setModalMessage("Please log in to save a summary.");
      return;
    }
    // Require a custom summary name for both methods.
    if (!summaryName.trim()) {
      setModalMessage("Please provide a name for your summary.");
      return;
    }
    // Check usage limit for saving summary.
    const savedCheck = checkUsageLimit("saved_summaries", 1);
    if (!savedCheck.allowed) {
      setModalMessage(
        tier !== "Diamond"
          ? "You have reached your saved summaries limit. Consider upgrading your membership."
          : "You have reached your saved summaries limit. Diamond membership cannot be upgraded."
      );
      return;
    }
    // If both summaries exist and differ, prompt the user.
    if (savedSummary && youtubeSummary && savedSummary !== youtubeSummary) {
      setShowOption(true);
    } else {
      // Otherwise, save the one that exists.
      const summaryToSave = savedSummary || youtubeSummary || summary;
      await saveSummary(summaryToSave);
    }
  }

  // Option callback.
  async function handleOptionSave() {
    // Immediately hide the Option modal.
    setShowOption(false);
    if (selectedOptionForSave === "saved") {
      await saveSummary(savedSummary);
    } else {
      await saveSummary(youtubeSummary);
    }
  }

  // If activeMethod is "saved" and transcripts are still loading, show a full-page spinner.
  if (activeMethod === "saved" && transcriptsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="text-gray-800 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Language selector */}
        <div className="flex justify-center items-center space-x-4">
          <label htmlFor="language-select" className="text-gray-700 font-medium">
            Select Language:
          </label>
          <select
            id="language-select"
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="border p-2 rounded"
          >
            {whisperLanguages.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>

        {/* Method selection */}
        <div className="flex justify-center space-x-4">
          <Button
            onClick={() => setActiveMethod("saved")}
            variant={activeMethod === "saved" ? "default" : "outline"}
            className="rounded-lg"
          >
            Saved Transcript
          </Button>
          <Button
            onClick={() => setActiveMethod("youtube")}
            variant={activeMethod === "youtube" ? "default" : "outline"}
            className="rounded-lg"
          >
            YouTube URL
          </Button>
        </div>

        {/* Conditional UI based on method */}
        {activeMethod === "saved" ? (
          <>
            {user ? (
              <div className="flex flex-col items-center">
                <label
                  htmlFor="transcript-select"
                  className="font-medium text-center text-gray-700 mb-2"
                >
                  Select a Saved Transcript:
                </label>
                <select
                  id="transcript-select"
                  value={selectedTranscriptId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setSelectedTranscriptId(id);
                  }}
                  className="border p-2 rounded w-full max-w-md"
                >
                  {savedTranscripts.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.transcript_name}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <p className="text-gray-700 font-medium mb-2">
                  Log in to view saved transcripts.
                </p>
                <Button onClick={() => setShowLoginModal(true)}>Log In</Button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center space-y-4">
            <label htmlFor="youtube-url" className="font-medium text-gray-700">
              Enter YouTube URL:
            </label>
            <input
              type="url"
              id="youtube-url"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="border p-2 rounded w-full max-w-md"
            />
          </div>
        )}

        {/* Summary type selection */}
        <div className="flex flex-col items-center space-y-2">
          <label htmlFor="summary-type" className="font-medium text-gray-700">
            Summary Type:
          </label>
          <select
            id="summary-type"
            value={summaryType}
            onChange={(e) => setSummaryType(e.target.value as SummaryType)}
            className="border p-2 rounded w-full max-w-md"
          >
            <option value="concise">Concise</option>
            <option value="detailed">Detailed</option>
            <option value="bullet points">Bullet Points</option>
            <option value="custom">Custom</option>
          </select>
          {summaryType === "custom" && (
            <input
              type="text"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Enter your custom prompt"
              className="border p-2 rounded w-full max-w-md"
            />
          )}
        </div>

        <div className="flex justify-center">
          <Button onClick={handleSummarize} disabled={summaryLoading}>
            {summaryLoading ? "Summarizing..." : "Summarize"}
          </Button>
        </div>

        {summary && (
          <div className="bg-white p-6 rounded shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Summary</h2>
            {/* Fixed height container with vertical scrolling */}
            <div className="max-h-[500px] overflow-y-auto whitespace-pre-wrap text-gray-700">
              {summary}
            </div>
            {/* Save summary input and button */}
            <div className="mt-4 flex flex-col items-center space-y-2">
              <input
                type="text"
                value={summaryName}
                onChange={(e) => setSummaryName(e.target.value)}
                placeholder="Name your summary"
                className="border p-2 rounded w-full max-w-md"
              />
              <Button onClick={handleSaveSummary} disabled={saveLoading}>
                {saveLoading ? "Saving Summary..." : "Save Summary"}
              </Button>
            </div>
          </div>
        )}
      </div>

      {modalMessage && (
        <Modal message={modalMessage} onClose={() => setModalMessage("")} />
      )}
      {showProgressModal && (
        <ProgressBar
          progress={progress}
          onClose={() => {
            setShowProgressModal(false);
            setProgress(0);
          }}
          inProgressMessage="Processing"
          completeMessage="Summarization Complete"
        />
      )}

      {/* Option modal for selecting which summary to save */}
      {showOption && (
        <Option
          question="You have generated two different summaries. Please select which summary to save."
          selectOptions={[
            { label: "Saved Transcript", value: "saved" },
            { label: "YouTube URL", value: "youtube" },
          ]}
          selectedOption={selectedOptionForSave}
          onSelectChange={(value) => setSelectedOptionForSave(value)}
          onSave={handleOptionSave}
          onClose={() => setShowOption(false)}
        />
      )}

      {/* Render the LoginModal only when triggered */}
      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
    </div>
  );
}
