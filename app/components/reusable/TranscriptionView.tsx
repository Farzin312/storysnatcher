"use client";
import React, { useState } from "react";
import { Button } from "./Button";
import Modal from "./Modal";
import ConfirmAction from "./ConfirmAction";

export interface TranscriptRecord {
  id: number;
  firebase_uid: string;
  transcript: string;
  study_guide?: string;
  source: string;
  transcript_name: string;
  created_at?: string;
}

interface TranscriptionViewProps {
  isOpen: boolean;
  transcriptRecord: TranscriptRecord;
  onClose: () => void;
}

const TranscriptionView: React.FC<TranscriptionViewProps> = ({
  isOpen,
  transcriptRecord,
  onClose,
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editTranscriptName, setEditTranscriptName] = useState<string>(
    transcriptRecord.transcript_name
  );
  const [editTranscript, setEditTranscript] = useState<string>(
    transcriptRecord.transcript
  );
  const [editStudyGuide, setEditStudyGuide] = useState<string>(
    transcriptRecord.study_guide || ""
  );
  const [modalMessage, setModalMessage] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([transcriptRecord.transcript], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `${transcriptRecord.transcript_name}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleEditSave = async () => {
    try {
      const res = await fetch(`/api/transcribe/saved`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: transcriptRecord.id,
          transcript_name: editTranscriptName,
          transcript: editTranscript,
          study_guide: editStudyGuide,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setModalMessage("Error updating transcript: " + data.error);
      } else {
        setModalMessage("Transcript updated successfully.");
        setIsEditing(false);
      }
      setIsModalOpen(true);
    } catch {
      setModalMessage("Error updating transcript.");
      setIsModalOpen(true);
    }
  };

  const handleDelete = () => {
    setShowConfirmDelete(true);
  };

  const confirmDelete = async () => {
    try {
      const res = await fetch(`/api/transcribe/saved`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: transcriptRecord.id }),
      });
      const data = await res.json();
      if (data.error) {
        setModalMessage("Error deleting transcript: " + data.error);
        setIsModalOpen(true);
      } else {
        setModalMessage("Transcript deleted successfully.");
        setIsModalOpen(true);
        onClose();
      }
    } catch {
      setModalMessage("Error deleting transcript.");
      setIsModalOpen(true);
    }
    setShowConfirmDelete(false);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded p-6 max-w-2xl w-full relative max-h-[80vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 text-2xl"
        >
          &times;
        </button>
        {!isEditing ? (
          <>
            <h2 className="text-2xl font-bold mb-4">
              {transcriptRecord.transcript_name}
            </h2>
            <div className="mb-4">
              <h3 className="text-xl font-semibold">Transcript</h3>
              <p className="whitespace-pre-wrap text-gray-700">
                {transcriptRecord.transcript}
              </p>
            </div>
            {transcriptRecord.study_guide && (
              <div className="mb-4">
                <h3 className="text-xl font-semibold">Study Guide</h3>
                <p className="whitespace-pre-wrap text-gray-700">
                  {transcriptRecord.study_guide}
                </p>
              </div>
            )}
            <div className="flex justify-end space-x-2">
              <Button onClick={handleDownload}>Download Transcript</Button>
              <Button onClick={() => setIsEditing(true)}>Edit</Button>
              <Button onClick={handleDelete}>Delete</Button>
              <Button onClick={onClose}>Close</Button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-4">Edit Transcript</h2>
            <div className="mb-4">
              <label className="block mb-1">Transcript Name</label>
              <input
                type="text"
                value={editTranscriptName}
                onChange={(e) => setEditTranscriptName(e.target.value)}
                className="w-full border p-2 rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1">Transcript</label>
              <textarea
                value={editTranscript}
                onChange={(e) => setEditTranscript(e.target.value)}
                className="w-full border p-2 rounded h-32"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1">Study Guide</label>
              <textarea
                value={editStudyGuide}
                onChange={(e) => setEditStudyGuide(e.target.value)}
                className="w-full border p-2 rounded h-32"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button onClick={() => setIsEditing(false)}>Cancel</Button>
              <Button onClick={handleEditSave}>Save Changes</Button>
            </div>
          </>
        )}
        {isModalOpen && (
          <Modal
            message={modalMessage}
            onClose={() => {
              setIsModalOpen(false);
              setModalMessage("");
            }}
          />
        )}
        {showConfirmDelete && (
          <ConfirmAction
            message="Are you sure you want to delete this transcript?"
            onConfirm={confirmDelete}
            onCancel={() => setShowConfirmDelete(false)}
          />
        )}
      </div>
    </div>
  );
};

export default TranscriptionView;
