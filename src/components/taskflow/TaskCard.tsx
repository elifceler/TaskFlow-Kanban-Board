"use client";

import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  GripVertical,
  Pencil,
  Trash2,
  UserRound,
} from "lucide-react";
import type { Board, CardItem, MoveDirection } from "@/types/taskflow";

type SortableCardProps = {
  board: Board;
  card: CardItem;
  columnIndex: number;
  cardIndex: number;
  onEditCard: (cardId: string) => void;
  onDeleteCard: (cardId: string) => void;
  onMoveCardByButton: (cardId: string, direction: MoveDirection) => void;
};

export function SortableCard({
  board,
  card,
  columnIndex,
  cardIndex,
  onEditCard,
  onDeleteCard,
  onMoveCardByButton,
}: SortableCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: { type: "card", cardId: card.id },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <article
      className={`task-card ${isDragging ? "is-dragging" : ""}`}
      ref={setNodeRef}
      style={style}
    >
      <div className="card-topline">
        <span className={`label-dot label-${card.label.toLowerCase()}`} />
        <span className="card-label">{card.label}</span>
        <button
          className="icon-button compact drag-handle"
          aria-label="Karti surukle"
          title="Karti surukle"
          type="button"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={15} />
        </button>
      </div>
      <button className="card-title" onClick={() => onEditCard(card.id)} type="button">
        {card.title}
      </button>
      {card.description ? (
        <p className="card-description">{card.description}</p>
      ) : null}
      <div className="card-meta">
        {card.assignee ? (
          <span>
            <UserRound size={13} />
            {card.assignee}
          </span>
        ) : null}
        {card.dueDate ? (
          <span>
            <CalendarDays size={13} />
            {new Intl.DateTimeFormat("tr-TR", {
              month: "short",
              day: "numeric",
            }).format(new Date(card.dueDate))}
          </span>
        ) : null}
      </div>
      <div className="card-actions">
        <button
          className="icon-button compact"
          aria-label="Sola tasi"
          title="Sola tasi"
          disabled={columnIndex === 0}
          onClick={() => onMoveCardByButton(card.id, "left")}
          type="button"
        >
          <ChevronLeft size={15} />
        </button>
        <button
          className="icon-button compact"
          aria-label="Yukari tasi"
          title="Yukari tasi"
          disabled={cardIndex === 0}
          onClick={() => onMoveCardByButton(card.id, "up")}
          type="button"
        >
          <ChevronUp size={15} />
        </button>
        <button
          className="icon-button compact"
          aria-label="Asagi tasi"
          title="Asagi tasi"
          onClick={() => onMoveCardByButton(card.id, "down")}
          type="button"
        >
          <ChevronDown size={15} />
        </button>
        <button
          className="icon-button compact"
          aria-label="Saga tasi"
          title="Saga tasi"
          disabled={columnIndex === board.columnOrder.length - 1}
          onClick={() => onMoveCardByButton(card.id, "right")}
          type="button"
        >
          <ChevronRight size={15} />
        </button>
        <span className="action-spacer" />
        <button
          className="icon-button compact"
          aria-label="Karti duzenle"
          title="Karti duzenle"
          onClick={() => onEditCard(card.id)}
          type="button"
        >
          <Pencil size={14} />
        </button>
        <button
          className="icon-button compact"
          aria-label="Karti sil"
          title="Karti sil"
          onClick={() => onDeleteCard(card.id)}
          type="button"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </article>
  );
}

export function CardPreview({ card }: { card: CardItem }) {
  return (
    <article className="task-card drag-preview">
      <div className="card-topline">
        <span className={`label-dot label-${card.label.toLowerCase()}`} />
        <span className="card-label">{card.label}</span>
      </div>
      <div className="card-title as-text">{card.title}</div>
      {card.description ? <p className="card-description">{card.description}</p> : null}
    </article>
  );
}
