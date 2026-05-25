"use client";

import { Button } from "@/components/ui/button";
import api from "@/lib/axios";
import { useState } from "react";
import { toast } from "sonner";

export default function InternalNoteForm({
  id,
  onBack,
}: {
  id: string;
  onBack: () => void;
}) {
  const [noteText, setNoteText] = useState("");
  const handleSaveNote = async (id: string) => {
    try {
      const res = await api.put(`/orders/${id}`, { internalNotes: noteText });
      if (res.status === 200) {
        toast("Note Added!");
        setNoteText("");
      }
    } catch {
      toast("Failed to add Note.");
    } finally {
      await onBack();
    }
  };
  return (
    <div className="flex gap-2 items-stretch">
      {/* Custom styled text area wrapper */}
      <div className="flex-1 border border-[#2D8C9E] p-2  flex flex-col">
        <label className="text-xs text-[#2D8C9E] font-medium mb-1">
          Internal Notes
        </label>
        <textarea
          className="w-full text-sm resize-none outline-none bg-transparent"
          rows={2}
          placeholder="Type your note..."
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
        />
      </div>

      {/* Save Button */}
      <Button
        className="bg-[#2D8C9E] hover:bg-[#247585] text-white rounded-none px-4 "
        onClick={() => handleSaveNote(id)}
      >
        Save
      </Button>
    </div>
  );
}
