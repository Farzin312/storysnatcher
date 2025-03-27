"use client";
import { useState, useEffect, FormEvent } from "react";
import { LoginModal, Modal, Button, ProgressBar } from "../reusable/";
import ReactMarkdown from "react-markdown";
import whisperLanguagesData from "@/app/data/whisperLanguages.json";
import { useAuthAndTier } from "@/app/hooks/useAuthAndTier";

// Define the type for language options based on whisperLanguages.json
interface WhisperLanguage {
  label: string;
  value: string;
}

// Cast the imported JSON to an array of WhisperLanguage objects
const whisperLanguages: WhisperLanguage[] = whisperLanguagesData.languages;

export default function Transcription() {
  // YouTube transcription state
  const [youtubeUrl, setYoutubeUrl] = useState<string>("");
  const [youtubeTranscript, setYoutubeTranscript] = useState<string>("");

  // Study guide state
  const [studyGuide, setStudyGuide] = useState<string>("");

  // Save data loading state
  const [saveLoading, setSaveLoading] = useState<boolean>(false);

  // Transcript name (defaults to the YouTube URL)
  const [transcriptName, setTranscriptName] = useState<string>("");

  // Locally stored transcript names to prevent duplicates (this session)
  const [savedTranscriptNames, setSavedTranscriptNames] = useState<string[]>([]);

  // Loading states for YouTube and study guide processing
  const [youtubeLoading, setYoutubeLoading] = useState<boolean>(false);
  const [guideLoading, setGuideLoading] = useState<boolean>(false);

  // Our custom auth hook (manages user, tier, loading, usage, etc.)
  const { user, tier, loading, checkUsageLimit, updateUsage } = useAuthAndTier();

  // Local state for showing the login modal
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);

  // Modal for error messages
  const [modalMessage, setModalMessage] = useState<string>("");

  // Progress modal state
  const [showProgressModal, setShowProgressModal] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);

  // Track if save was successful
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Selected language for transcription
  const [selectedLanguage, setSelectedLanguage] = useState<string>("en");

  // Automatically set the transcript name to the YouTube URL (or blank)
  useEffect(() => {
    setTranscriptName(youtubeUrl || "");
  }, [youtubeUrl]);

  // Simulate slow progress updates for any loading processes
  useEffect(() => {
    const anyLoading = youtubeLoading || guideLoading || saveLoading;
    let interval: NodeJS.Timeout | null = null;
    let timeout: NodeJS.Timeout | null = null;

    if (anyLoading) {
      setShowProgressModal(true);
      setProgress(0);
      interval = setInterval(() => {
        setProgress((prev) => (prev < 95 ? prev + 1 : prev));
      }, 350);
    } else {
      if (!modalMessage && (saveSuccess || youtubeTranscript)) {
        setProgress(100);
        timeout = setTimeout(() => {
          setShowProgressModal(false);
          setProgress(0);
          setSaveSuccess(false);
        }, 2000);
      } else if (modalMessage) {
        setShowProgressModal(false);
        setProgress(0);
      }
    }

    return () => {
      if (interval) clearInterval(interval);
      if (timeout) clearTimeout(timeout);
    };
  }, [youtubeLoading, guideLoading, saveLoading, modalMessage, saveSuccess, youtubeTranscript]);

  // Generate study guide from transcript; pass in the selected language
  const generateStudyGuide = async (transcript: string, language: string) => {
    setGuideLoading(true);
    try {
      const res = await fetch("/api/transcribe/study-guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript, language }),
      });
      const data = await res.json();
      setStudyGuide(data.studyGuide || "");
    } catch (error) {
      console.error("Error generating study guide:", error);
      setModalMessage("Error generating study guide. Please try again.");
    } finally {
      setGuideLoading(false);
    }
  };

  // Handler for YouTube transcription
  const handleYoutubeSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    if (!youtubeUrl) return;

    // Check usage limit for monthly YouTube transcriptions
    const { allowed, resetDate } = checkUsageLimit("youtube_transcriptions", 1);
    if (!allowed) {
      let upgradeMessage = "";
      if (tier === "Free") {
        upgradeMessage = " Upgrade to Gold for more transcriptions.";
      } else if (tier === "Gold") {
        upgradeMessage = " Upgrade to Diamond for more transcriptions.";
      } else {
        upgradeMessage = " Please wait until your cycle resets.";
      }
      setModalMessage(
        `You have reached your monthly YouTube transcription limit. It will reset on ${resetDate?.toLocaleDateString()}.${upgradeMessage}`
      );
      return;
    }

    setYoutubeLoading(true);
    try {
      const res = await fetch("/api/transcribe/youtube-transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ youtubeUrl, language: selectedLanguage }),
      });
      const data = await res.json();
      if (data.error) {
        setModalMessage("YouTube transcription error: " + data.error);
      } else {
        setYoutubeTranscript(data.transcript || "");
        if (data.transcript) {
          await generateStudyGuide(data.transcript, selectedLanguage);
        }
        // Update usage for a successful YouTube transcription
        await updateUsage("youtube_transcriptions", 1);
      }
    } catch (error) {
      console.error("YouTube transcription error:", error);
      setModalMessage("YouTube transcription failed. Please try again.");
    } finally {
      setYoutubeLoading(false);
    }
  };

  // Save handler for transcript & study guide
  const handleSaveAll = async () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    if (!youtubeTranscript) {
      setModalMessage("No YouTube transcription is available to save.");
      return;
    }
    if (!transcriptName) {
      setModalMessage("Please provide a name for your transcript.");
      return;
    }
    if (savedTranscriptNames.includes(transcriptName)) {
      setModalMessage("A transcript with that name already exists. Please choose a different name.");
      return;
    }

    // Check usage limit for persistent transcript saves
    const { allowed } = checkUsageLimit("transcript_saves", 1);
    if (!allowed) {
      let upgradeMessage = "";
      if (tier === "Free") {
        upgradeMessage = " Upgrade to Gold for more saved transcripts.";
      } else if (tier === "Gold") {
        upgradeMessage = " Upgrade to Diamond for more saved transcripts.";
      }
      setModalMessage("You have reached your transcript save limit." + upgradeMessage);
      return;
    }

    setSaveLoading(true);
    try {
      const token = await user.getIdToken(true);
      const res = await fetch("/api/transcribe/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          transcript: youtubeTranscript,
          studyGuide,
          source: "youtube",
          transcriptName,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setModalMessage("Error saving data: " + data.error);
      } else {
        console.log("Data saved successfully!");
        setSavedTranscriptNames((prev) => [...prev, transcriptName]);
        setSaveSuccess(true);
        // Update usage for saving a transcript
        await updateUsage("transcript_saves", 1);
        // Clear fields upon successful save
        setYoutubeUrl("");
        setYoutubeTranscript("");
        setStudyGuide("");
        setTranscriptName("");
      }
    } catch (error) {
      console.error("Error saving data:", error);
      setModalMessage("Error saving data. Please try again.");
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <>
      {loading ? (
        <div className="min-h-screen flex items-center justify-center">
          <p>Loading user data...</p>
        </div>
      ) : (
        <div className="text-gray-800 min-h-screen p-8">
          <div className="max-w-6xl mx-auto space-y-12">
            {/* Language Selector */}
            <header className="text-center">
              <div className="flex justify-center items-center space-x-4">
                <label className="text-gray-700 font-medium" htmlFor="language-select">
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
              {selectedLanguage !== "en" && (
                <p className="text-sm text-gray-600 mt-2">
                  Note: Choosing a language other than English for YouTube transcription may take longer.
                </p>
              )}
            </header>

            {/* YouTube Transcription Section */}
            <section className="bg-white p-6 rounded shadow-lg">
              <h2 className="text-2xl font-bold mb-3">YouTube Transcription</h2>
              <p className="mb-4 text-gray-600">
                Enter a YouTube video URL. The transcript will be generated in the selected language.
              </p>
              <form onSubmit={handleYoutubeSubmit} className="space-y-4">
                <input
                  type="url"
                  placeholder="Enter YouTube URL"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  required
                  className="w-full border p-3 rounded"
                />
                <Button type="submit" disabled={youtubeLoading} className="w-full">
                  {youtubeLoading ? "Fetching YouTube Transcript..." : "Fetch YouTube Transcript"}
                </Button>
              </form>
              {youtubeTranscript && (
                <div className="mt-4">
                  <h3 className="font-bold text-lg">YouTube Transcript</h3>
                  <div className="max-h-[500px] overflow-y-auto bg-gray-100 p-3 rounded whitespace-pre-wrap">
                    {youtubeTranscript}
                  </div>
                </div>
              )}
            </section>

            {/* Study Guide & Save Section */}
            <section className="bg-white p-6 rounded shadow-lg">
              <h2 className="text-2xl font-bold mb-3">Study Guide</h2>
              {(youtubeLoading || guideLoading || saveLoading) ? (
                <p className="text-center text-gray-600">Processing... Please wait.</p>
              ) : studyGuide ? (
                <div>
                  <p className="mb-4 text-gray-600">
                    Your automatically generated study guide is shown below:
                  </p>
                  {/* Render study guide with Markdown formatting */}
                  <ReactMarkdown>
                    {studyGuide}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="text-gray-600">
                  Your study guide will appear here after a transcription is generated.
                </p>
              )}
              {youtubeTranscript && (
                <div className="flex flex-col items-center mt-4 space-y-2">
                  <small className="text-gray-500">Default: {youtubeUrl}</small>
                  <input
                    type="text"
                    value={transcriptName}
                    onChange={(e) => setTranscriptName(e.target.value)}
                    placeholder="Name your transcript & study guide"
                    className="border p-2 rounded w-full max-w-md"
                  />
                  <div className="mt-4 flex justify-center">
                    <Button onClick={handleSaveAll} className="px-6 py-3">
                      Save Transcript
                    </Button>
                  </div>
                </div>
              )}
            </section>
          </div>

          {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
          {modalMessage && <Modal message={modalMessage} onClose={() => setModalMessage("")} />}
          {showProgressModal && (
            <ProgressBar
              progress={progress}
              onClose={() => {
                setShowProgressModal(false);
                setProgress(0);
                setSaveSuccess(false);
              }}
              inProgressMessage="Processing"
              completeMessage={saveSuccess ? "Successfully Saved" : "Done"}
            />
          )}
        </div>
      )}
    </>
  );
}
