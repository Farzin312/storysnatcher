"use client";
import React, { useState } from "react";
import { Button } from "./Button";
import Modal from "./Modal";
import ConfirmAction from "./ConfirmAction";

export interface SummaryRecord {
  id: string;
  firebase_uid: string;
  transcript_id: number | null;
  summary: string;
  summary_name: string;
  created_at: string;
}

interface ViewSummaryProps {
  isOpen: boolean;
  summaryRecord: SummaryRecord;
  onClose: () => void;
}

const ViewSummary: React.FC<ViewSummaryProps> = ({
  isOpen,
  summaryRecord,
  onClose,
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editSummaryName, setEditSummaryName] = useState<string>(
    summaryRecord.summary_name
  );
  const [editSummary, setEditSummary] = useState<string>(summaryRecord.summary);
  const [modalMessage, setModalMessage] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([summaryRecord.summary], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `${summaryRecord.summary_name}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleEditSave = async () => {
    try {
      const res = await fetch(`/api/summarize/saved`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: summaryRecord.id,
          summary_name: editSummaryName,
          summary: editSummary,
          transcript_id: summaryRecord.transcript_id,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setModalMessage("Error updating summary: " + data.error);
      } else {
        setModalMessage("Summary updated successfully.");
        setIsEditing(false);
      }
      setIsModalOpen(true);
    } catch {
      setModalMessage("Error updating summary.");
      setIsModalOpen(true);
    }
  };

  const handleDelete = () => {
    setShowConfirmDelete(true);
  };

  const confirmDelete = async () => {
    try {
      const res = await fetch(`/api/summarize/saved`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: summaryRecord.id }),
      });
      const data = await res.json();
      if (data.error) {
        setModalMessage("Error deleting summary: " + data.error);
        setIsModalOpen(true);
      } else {
        setModalMessage("Summary deleted successfully.");
        setIsModalOpen(true);
        onClose();
      }
    } catch {
      setModalMessage("Error deleting summary.");
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
              {summaryRecord.summary_name}
            </h2>
            <div className="mb-4">
              <h3 className="text-xl font-semibold">Summary</h3>
              <p className="whitespace-pre-wrap text-gray-700">
                {summaryRecord.summary}
              </p>
            </div>
            <div className="flex justify-end space-x-2">
              <Button onClick={handleDownload}>Download Summary</Button>
              <Button onClick={() => setIsEditing(true)}>Edit</Button>
              <Button onClick={handleDelete}>Delete</Button>
              <Button onClick={onClose}>Close</Button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-4">Edit Summary</h2>
            <div className="mb-4">
              <label className="block mb-1">Summary Name</label>
              <input
                type="text"
                value={editSummaryName}
                onChange={(e) => setEditSummaryName(e.target.value)}
                className="w-full border p-2 rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1">Summary</label>
              <textarea
                value={editSummary}
                onChange={(e) => setEditSummary(e.target.value)}
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
            message="Are you sure you want to delete this summary?"
            onConfirm={confirmDelete}
            onCancel={() => setShowConfirmDelete(false)}
          />
        )}
      </div>
    </div>
  );
};

export default ViewSummary;
