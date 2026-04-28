"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { LABELS } from "@/lib/taskflow";
import type { CardDraft, CardItem } from "@/types/taskflow";

type EditCardDialogProps = {
  card: CardItem;
  onClose: () => void;
  onSave: (draft: CardDraft) => void;
};

export function EditCardDialog({ card, onClose, onSave }: EditCardDialogProps) {
  const [draft, setDraft] = useState<CardDraft>({
    title: card.title,
    description: card.description,
    label: card.label,
    assignee: card.assignee,
    dueDate: card.dueDate,
  });

  return (
    <div className="dialog-backdrop" role="presentation">
      <section className="dialog" role="dialog" aria-modal="true" aria-label="Kart detayi">
        <header>
          <h2>Kart detayi</h2>
          <button
            className="icon-button"
            aria-label="Kapat"
            title="Kapat"
            onClick={onClose}
            type="button"
          >
            <X size={17} />
          </button>
        </header>
        <label className="field">
          <span>Baslik</span>
          <input
            value={draft.title}
            onChange={(event) =>
              setDraft((current) => ({ ...current, title: event.target.value }))
            }
          />
        </label>
        <label className="field">
          <span>Aciklama</span>
          <textarea
            rows={5}
            value={draft.description}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                description: event.target.value,
              }))
            }
          />
        </label>
        <div className="field-grid">
          <label className="field">
            <span>Etiket</span>
            <select
              value={draft.label}
              onChange={(event) =>
                setDraft((current) => ({ ...current, label: event.target.value }))
              }
            >
              {LABELS.map((label) => (
                <option key={label} value={label}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Sorumlu</span>
            <input
              value={draft.assignee}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  assignee: event.target.value,
                }))
              }
            />
          </label>
          <label className="field">
            <span>Tarih</span>
            <input
              type="date"
              value={draft.dueDate}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  dueDate: event.target.value,
                }))
              }
            />
          </label>
        </div>
        <footer>
          <button className="secondary-action" onClick={onClose} type="button">
            Vazgec
          </button>
          <button
            className="primary-action"
            onClick={() => {
              if (!draft.title.trim()) {
                return;
              }
              onSave({ ...draft, title: draft.title.trim() });
            }}
            type="button"
          >
            <Check size={17} />
            Kaydet
          </button>
        </footer>
      </section>
    </div>
  );
}
