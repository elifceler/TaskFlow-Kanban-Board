"use client";

import { useState } from "react";
import { LayoutDashboard, Plus } from "lucide-react";
import type { Board } from "@/types/taskflow";

type BoardSidebarProps = {
  boards: Board[];
  activeBoardId: string | null;
  onCreateBoard: (name: string) => void;
  onSelectBoard: (boardId: string) => void;
};

export function BoardSidebar({
  boards,
  activeBoardId,
  onCreateBoard,
  onSelectBoard,
}: BoardSidebarProps) {
  const [boardName, setBoardName] = useState("");

  return (
    <aside className="sidebar">
      <div className="sidebar-heading">
        <LayoutDashboard size={18} />
        <span>Boardlar</span>
      </div>
      <div className="board-list">
        {boards.map((board) => (
          <button
            key={board.id}
            className={`board-switcher ${
              board.id === activeBoardId ? "is-active" : ""
            }`}
            onClick={() => onSelectBoard(board.id)}
            type="button"
          >
            <span>{board.name}</span>
            <small>{board.columnOrder.length} sutun</small>
          </button>
        ))}
      </div>
      <div className="quick-create">
        <input
          placeholder="Yeni board"
          value={boardName}
          onChange={(event) => setBoardName(event.target.value)}
        />
        <button
          aria-label="Board olustur"
          title="Board olustur"
          onClick={() => {
            if (!boardName.trim()) {
              return;
            }
            onCreateBoard(boardName.trim());
            setBoardName("");
          }}
          type="button"
        >
          <Plus size={18} />
        </button>
      </div>
    </aside>
  );
}
