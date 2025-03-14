"use client";
import { useState, FormEvent, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/firebase"; 
import { LoginModal, Modal, Button, ProgressBar } from "../reusable/";
import whisperLanguagesData from "@/app/data/whisperLanguages.json";

// Define the type for language options based on whisperLanguages.json
interface WhisperLanguage {
  label: string;
  value: string;
}

// Cast the imported JSON to an array of WhisperLanguage objects
const whisperLanguages: WhisperLanguage[] = whisperLanguagesData.languages;

export default function Transcription() {
  // Universal language state
  const [selectedLanguage, setSelectedLanguage] = useState<string>("en");

  // File transcription state
  const [file, setFile] = useState<File | null>(null);
  const [fileTranscript, setFileTranscript] = useState<string>("");
  const [fileLoading, setFileLoading] = useState<boolean>(false);

  // YouTube transcription state
  const [youtubeUrl, setYoutubeUrl] = useState<string>("");
  const [youtubeTranscript, setYoutubeTranscript] = useState<string>("");
  const [youtubeLoading, setYoutubeLoading] = useState<boolean>(false);

  // Study guide state
  const [studyGuide, setStudyGuide] = useState<string>("");
  const [guideLoading, setGuideLoading] = useState<boolean>(false);

  // Save data loading state (for saving to DB)
  const [saveLoading, setSaveLoading] = useState<boolean>(false);

  // Transcript name state – user input; default is set only when the active method changes.
  const [transcriptName, setTranscriptName] = useState<string>("");

  // Locally stored transcript names to prevent duplicates (this session)
  const [savedTranscriptNames, setSavedTranscriptNames] = useState<string[]>([]);

  // Track which method was used ("file" or "youtube")
  const [activeMethod, setActiveMethod] = useState<"file" | "youtube" | null>(null);

  // User authentication
  const [user, setUser] = useState<User | null>(null);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);

  // Modal for error messages
  const [modalMessage, setModalMessage] = useState<string>("");

  // Progress modal state and progress percentage (for all loading processes)
  const [showProgressModal, setShowProgressModal] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);

  // State to track if save was successful
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Listen for auth changes.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Set default transcript name only when the active method changes.
  useEffect(() => {
    if (activeMethod === "youtube" && youtubeUrl) {
      setTranscriptName(youtubeUrl);
    } else if (activeMethod === "file" && file) {
      setTranscriptName(file.name);
    } else {
      setTranscriptName("");
    }
  }, [activeMethod, youtubeUrl, file]);

  // Simulate slow progress updates.
  // When any of the individual loading states is true, the progress modal is shown.
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    // Check individual loading states: if any is true, we're still processing.
    if (fileLoading || youtubeLoading || guideLoading || saveLoading) {
      setShowProgressModal(true);
      setProgress(0);
      interval = setInterval(() => {
        setProgress((prev) => (prev < 95 ? prev + 1 : prev));
      }, 350);
    } else {
      // All loading states are false.
      if (!modalMessage && (saveSuccess || fileTranscript || youtubeTranscript)) {
        // On successful operation, force progress to 100% and auto-close the progress modal after 2 sec.
        setProgress(100);
        const timeout = setTimeout(() => {
          setShowProgressModal(false);
          setProgress(0);
          setSaveSuccess(false);
        }, 2000);
        return () => clearTimeout(timeout);
      } else if (modalMessage) {
        // If there is an error, close the progress modal immediately.
        setShowProgressModal(false);
        setProgress(0);
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [fileLoading, youtubeLoading, guideLoading, saveLoading, modalMessage, saveSuccess, fileTranscript, youtubeTranscript]);

  // Automatically generate study guide (passing the selected language)
  const generateStudyGuide = async (transcript: string) => {
    setGuideLoading(true);
    try {
      const res = await fetch("/api/transcribe/study-guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript, language: selectedLanguage }),
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

  // Handler for file upload transcription
  const handleFileSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    if (!file) return;
    setFileLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("language", selectedLanguage);
    formData.append("mediaType", "audio");
    try {
      const res = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.error) {
        setModalMessage("File transcription error: " + data.error);
      } else {
        setFileTranscript(data.transcript || "");
        setActiveMethod("file");
        if (data.transcript) await generateStudyGuide(data.transcript);
      }
    } catch (error) {
      console.error("File transcription error:", error);
      setModalMessage("File transcription failed. Please try again.");
    } finally {
      setFileLoading(false);
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
        setActiveMethod("youtube");
        if (data.transcript) await generateStudyGuide(data.transcript);
      }
    } catch (error) {
      console.error("YouTube transcription error:", error);
      setModalMessage("YouTube transcription failed. Please try again.");
    } finally {
      setYoutubeLoading(false);
    }
  };

  // Save handler for transcript & study guide, including transcriptName.
  const handleSaveAll = async () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    let transcript = "";
    let source = "";
    if (activeMethod === "file") {
      transcript = fileTranscript;
      source = "whisper";
    } else if (activeMethod === "youtube") {
      transcript = youtubeTranscript;
      source = "youtube";
    } else {
      setModalMessage("No transcription available to save.");
      return;
    }
    // Ensure transcriptName is provided and unique.
    if (!transcriptName) {
      setModalMessage("Please provide a name for your transcript.");
      return;
    }
    if (savedTranscriptNames.includes(transcriptName)) {
      setModalMessage("A transcript with that name already exists. Please choose a different name.");
      return;
    }
    setSaveLoading(true);
    try {
      const token = await user.getIdToken(true);
      const res = await fetch("/api/transcribe/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ transcript, studyGuide, source, transcriptName }),
      });
      const data = await res.json();
      if (data.error) {
        setModalMessage("Error saving data: " + data.error);
      } else {
        console.log("Data saved successfully!");
        setSavedTranscriptNames((prev) => [...prev, transcriptName]);
        setSaveSuccess(true);
        // Clear fields upon successful save
        setFile(null);
        setFileTranscript("");
        setYoutubeUrl("");
        setYoutubeTranscript("");
        setStudyGuide("");
        setTranscriptName("");
        setActiveMethod(null);
      }
    } catch (error) {
      console.error("Error saving data:", error);
      setModalMessage("Error saving data. Please try again.");
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="bg-blue-50 text-gray-800 min-h-screen p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Universal Language Selector */}
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
              Note: Choosing a language other than English for YouTube transcription may take longer due to the additional translation step.
            </p>
          )}
        </header>

        {/* Transcription Methods */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* File Upload Section */}
          <section className="bg-white p-6 rounded shadow-lg">
            <h2 className="text-2xl font-bold mb-3">File Upload Transcription</h2>
            <p className="mb-4 text-gray-600">
              Upload an audio or video file. The selected language will be used for transcription.
            </p>
            <form onSubmit={handleFileSubmit} className="space-y-4">
              <input
                type="file"
                accept="audio/*,video/*"
                onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                required
                disabled={activeMethod === "youtube"}
                className="w-full border p-3 rounded"
              />
              <Button type="submit" disabled={fileLoading} className="w-full">
                {fileLoading ? "Transcribing File..." : "Transcribe File"}
              </Button>
            </form>
            {fileTranscript && (
              <div className="mt-4">
                <h3 className="font-bold text-lg">File Transcript</h3>
                <div className="max-h-[500px] overflow-y-auto bg-gray-100 p-3 rounded whitespace-pre-wrap">
                  {fileTranscript}
                </div>
              </div>
            )}
          </section>

          {/* YouTube Transcription Section */}
          <section className="bg-white p-6 rounded shadow-lg">
            <h2 className="text-2xl font-bold mb-3">YouTube Transcription</h2>
            <p className="mb-4 text-gray-600">
              Enter a YouTube video URL. The transcript will be translated into the selected language.
            </p>
            <form onSubmit={handleYoutubeSubmit} className="space-y-4">
              <input
                type="url"
                placeholder="Enter YouTube URL"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                required
                disabled={activeMethod === "file"}
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
        </div>

        {/* Study Guide & Save Section */}
        <section className="bg-white p-6 rounded shadow-lg">
          <h2 className="text-2xl font-bold mb-3">Study Guide</h2>
          {(fileLoading || youtubeLoading || guideLoading || saveLoading) ? (
            <p className="text-center text-gray-600">Processing... Please wait.</p>
          ) : studyGuide ? (
            <div>
              <p className="mb-4 text-gray-600">
                Your automatically generated study guide is shown below:
              </p>
              <div className="max-h-[500px] overflow-y-auto bg-gray-100 p-3 rounded whitespace-pre-wrap">
                {studyGuide}
              </div>
            </div>
          ) : (
            <p className="text-gray-600">
              Your study guide will appear here after a transcription is generated.
            </p>
          )}
          {/* Transcript name input section */}
          {activeMethod && (fileTranscript || youtubeTranscript) && (
            <div className="flex flex-col items-center mt-4 space-y-2">
              <small className="text-gray-500">
                Default:{" "}
                {activeMethod === "youtube"
                  ? youtubeUrl
                  : file
                  ? file.name
                  : ""}
              </small>
              <input
                type="text"
                value={transcriptName}
                onChange={(e) => setTranscriptName(e.target.value)}
                placeholder="Name your transcript & study guide (defaults to URL)"
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

      {/* Render modal for login or error messages */}
      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
      {modalMessage && <Modal message={modalMessage} onClose={() => setModalMessage("")} />}

      {/* Render the ProgressBar */}
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
  );
}
