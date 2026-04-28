"use client";

import { useState } from "react";
import { useSortable, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import type { Board, CardItem, Column, MoveDirection } from "@/types/taskflow";
import { SortableCard } from "./TaskCard";

type SortableColumnProps = {
  board: Board;
  column: Column;
  cards: CardItem[];
  columnIndex: number;
  onAddCard: (columnId: string, title: string) => void;
  onEditCard: (cardId: string) => void;
  onDeleteCard: (cardId: string) => void;
  onRenameColumn: (columnId: string, title: string) => void;
  onDeleteColumn: (columnId: string) => void;
  onMoveCardByButton: (cardId: string, direction: MoveDirection) => void;
};

function getColumnTone(title: string) {
  const normalizedTitle = title.toLowerCase();

  if (normalizedTitle.includes("devam")) {
    return "column-doing";
  }
  if (normalizedTitle.includes("inceleme")) {
    return "column-review";
  }
  if (normalizedTitle.includes("tamam")) {
    return "column-done";
  }
  return "column-todo";
}

export function SortableColumn({
  board,
  column,
  cards,
  columnIndex,
  onAddCard,
  onEditCard,
  onDeleteCard,
  onRenameColumn,
  onDeleteColumn,
  onMoveCardByButton,
}: SortableColumnProps) {
  const [newCardTitle, setNewCardTitle] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);
  const [title, setTitle] = useState(column.title);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: { type: "column", columnId: column.id },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  function saveTitle() {
    if (title.trim()) {
      onRenameColumn(column.id, title.trim());
    } else {
      setTitle(column.title);
    }
    setIsRenaming(false);
  }

  return (
    <section
      className={`kanban-column ${getColumnTone(column.title)} ${
        isDragging ? "is-dragging" : ""
      }`}
      ref={setNodeRef}
      style={style}
    >
      <header className="column-header">
        <button
          className="icon-button drag-handle"
          aria-label="Sutunu tasi"
          title="Sutunu tasi"
          type="button"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={17} />
        </button>
        {isRenaming ? (
          <input
            className="column-title-input"
            autoFocus
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            onBlur={saveTitle}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                saveTitle();
              }
              if (event.key === "Escape") {
                setTitle(column.title);
                setIsRenaming(false);
              }
            }}
          />
        ) : (
          <button
            className="column-title"
            onClick={() => setIsRenaming(true)}
            type="button"
          >
            {column.title}
          </button>
        )}
        <span className="count-pill">{cards.length}</span>
        <button
          className="icon-button"
          aria-label="Sutunu sil"
          title="Sutunu sil"
          onClick={() => onDeleteColumn(column.id)}
          type="button"
        >
          <Trash2 size={15} />
        </button>
      </header>

      <SortableContext items={column.cardIds} strategy={verticalListSortingStrategy}>
        <div className="card-stack" data-column-id={column.id}>
          {cards.map((card, index) => (
            <SortableCard
              key={card.id}
              board={board}
              card={card}
              columnIndex={columnIndex}
              cardIndex={index}
              onEditCard={onEditCard}
              onDeleteCard={onDeleteCard}
              onMoveCardByButton={onMoveCardByButton}
            />
          ))}
          {cards.length === 0 ? (
            <div className="empty-drop">
              <strong>Hazir</strong>
              <span>Kartlari buraya surukle</span>
            </div>
          ) : null}
        </div>
      </SortableContext>

      <form
        className="new-card"
        onSubmit={(event) => {
          event.preventDefault();
          if (!newCardTitle.trim()) {
            return;
          }
          onAddCard(column.id, newCardTitle.trim());
          setNewCardTitle("");
        }}
      >
        <input
          placeholder="Kart basligi"
          value={newCardTitle}
          onChange={(event) => setNewCardTitle(event.target.value)}
        />
        <button aria-label="Kart ekle" title="Kart ekle" type="submit">
          <Plus size={17} />
        </button>
      </form>
    </section>
  );
}
