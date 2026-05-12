import { useState } from "react";
import { Loader2, StickyNote } from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";
import type { Note } from "../types/note";

const formatDateTime = (iso: string) =>
  new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));

function Avatar({ name }: { name: string }) {
  const letter = (name || "?")[0].toUpperCase();
  const colors = ["bg-indigo-100 text-indigo-700","bg-green-100 text-green-700","bg-yellow-100 text-yellow-700","bg-pink-100 text-pink-700","bg-purple-100 text-purple-700"];
  const color = colors[letter.charCodeAt(0) % colors.length];
  return <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold shrink-0 ${color}`}>{letter}</div>;
}

interface NoteListProps { notes: Note[]; customerId: string; onRefresh: () => void; }

export default function NoteList({ notes, customerId, onRefresh }: NoteListProps) {
  const [content, setContent]       = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleAdd = async () => {
    if (!content.trim()) return;
    setSubmitting(true);
    try {
      await api.post(`/customers/${customerId}/notes/`, { content: content.trim() });
      setContent("");
      onRefresh();
      toast.success("Not eklendi.");
    } catch { toast.error("Not eklenemedi."); }
    finally { setSubmitting(false); }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleAdd();
  };

  return (
    <div className="space-y-5">
      <div className="border border-gray-200 rounded-xl p-4 space-y-3">
        <textarea
          rows={3}
          placeholder="Not ekle… (Ctrl+Enter ile gönder)"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
        />
        <div className="flex justify-end">
          <button onClick={handleAdd} disabled={submitting || !content.trim()} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors">
            {submitting && <Loader2 size={14} className="animate-spin" />}Not Ekle
          </button>
        </div>
      </div>
      {notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 gap-3 text-gray-400">
          <StickyNote size={32} strokeWidth={1.5} /><p className="text-sm">Henüz not eklenmemiş.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <div key={note.id} className="flex gap-3">
              <Avatar name={note.created_by_name || "?"} />
              <div className="flex-1 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                  <span className="text-xs font-semibold text-gray-700">{note.created_by_name || "Kullanıcı"}</span>
                  <span className="text-xs text-gray-400">{formatDateTime(note.created_at)}</span>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{note.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
