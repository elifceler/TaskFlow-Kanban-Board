"use client";

import { useEffect, useMemo, useState } from "react";
import {
  closestCorners,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import {
  Columns3,
  KanbanSquare,
  LogOut,
  Plus,
  Search,
  UserRound,
} from "lucide-react";
import { AuthScreen } from "./AuthScreen";
import { BoardSidebar } from "./BoardSidebar";
import { EditCardDialog } from "./CardDialog";
import { SortableColumn } from "./KanbanColumn";
import { CardPreview } from "./TaskCard";
import {
  createInitialBoard,
  emptyCardDraft,
  findColumnForCard,
  getColumnTitle,
  moveCardBetweenColumns,
  nowIso,
  readInitialState,
  STORAGE_KEY,
  uid,
} from "@/lib/taskflow";
import type { AppState, Board, CardDraft, MoveDirection, User } from "@/types/taskflow";

export function TaskFlowApp() {
  const [state, setState] = useState<AppState>(() => readInitialState());
  const [isHydrated, setIsHydrated] = useState(false);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setIsHydrated(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [isHydrated, state]);

  const currentUser = state.users.find((user) => user.id === state.currentUserId);

  const userBoards = useMemo(() => {
    if (!currentUser) {
      return [];
    }
    return Object.values(state.boards)
      .filter((board) => board.ownerId === currentUser.id)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }, [currentUser, state.boards]);

  const activeBoard =
    (state.activeBoardId && state.boards[state.activeBoardId]) || userBoards[0] || null;

  const editingCard =
    activeBoard && editingCardId ? activeBoard.cards[editingCardId] : null;

  const activeCard =
    activeBoard && activeDragId ? activeBoard.cards[activeDragId] : null;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 7 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 180, tolerance: 7 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function mutateBoard(boardId: string, updater: (board: Board) => Board) {
    setState((current) => {
      const board = current.boards[boardId];
      if (!board) {
        return current;
      }

      return {
        ...current,
        boards: {
          ...current.boards,
          [boardId]: updater(board),
        },
      };
    });
  }

  function handleAuth(
    mode: "signin" | "signup",
    payload: Omit<User, "id">,
  ): string | null {
    const email = payload.email.trim().toLowerCase();
    const password = payload.password.trim();
    const name = payload.name.trim() || "TaskFlow Uyesi";

    if (!email || !password) {
      return "E-posta ve sifre gerekli.";
    }

    if (mode === "signin") {
      const user = state.users.find((item) => item.email === email);
      if (!user) {
        return "Hesap bulunamadi. Kayit sekmesini kullanin.";
      }

      if (user.password !== password) {
        return "Sifre eslesmiyor.";
      }

      setState((current) => ({
        ...current,
        currentUserId: user.id,
        activeBoardId:
          Object.values(current.boards).find((board) => board.ownerId === user.id)?.id ??
          null,
      }));
      return null;
    }

    if (state.users.some((item) => item.email === email)) {
      return "Bu e-posta ile hesap var.";
    }

    const user: User = {
      id: uid("user"),
      name,
      email,
      password,
    };
    const board = createInitialBoard(user.id);

    setState((current) => ({
      users: [...current.users, user],
      currentUserId: user.id,
      boards: { ...current.boards, [board.id]: board },
      activeBoardId: board.id,
    }));
    return null;
  }

  function createBoard(name: string) {
    if (!currentUser) {
      return;
    }
    const board = {
      ...createInitialBoard(currentUser.id),
      name,
    };
    setState((current) => ({
      ...current,
      boards: { ...current.boards, [board.id]: board },
      activeBoardId: board.id,
    }));
  }

  function addColumn(boardId: string, title: string) {
    mutateBoard(boardId, (board) => {
      const columnId = uid("column");
      return {
        ...board,
        columnOrder: [...board.columnOrder, columnId],
        columns: {
          ...board.columns,
          [columnId]: { id: columnId, title, cardIds: [] },
        },
      };
    });
  }

  function renameColumn(boardId: string, columnId: string, title: string) {
    mutateBoard(boardId, (board) => ({
      ...board,
      columns: {
        ...board.columns,
        [columnId]: {
          ...board.columns[columnId],
          title,
        },
      },
    }));
  }

  function deleteColumn(boardId: string, columnId: string) {
    mutateBoard(boardId, (board) => {
      if (board.columnOrder.length <= 1) {
        return board;
      }

      const deletedCards = new Set(board.columns[columnId]?.cardIds ?? []);
      const columns = { ...board.columns };
      delete columns[columnId];
      const cards = Object.fromEntries(
        Object.entries(board.cards).filter(([cardId]) => !deletedCards.has(cardId)),
      );

      return {
        ...board,
        columnOrder: board.columnOrder.filter((id) => id !== columnId),
        columns,
        cards,
      };
    });
  }

  function addCard(boardId: string, columnId: string, title: string) {
    mutateBoard(boardId, (board) => {
      const cardId = uid("card");
      const createdAt = nowIso();
      return {
        ...board,
        cards: {
          ...board.cards,
          [cardId]: {
            ...emptyCardDraft,
            id: cardId,
            title,
            createdAt,
            updatedAt: createdAt,
          },
        },
        columns: {
          ...board.columns,
          [columnId]: {
            ...board.columns[columnId],
            cardIds: [...board.columns[columnId].cardIds, cardId],
          },
        },
      };
    });
  }

  function updateCard(boardId: string, cardId: string, draft: CardDraft) {
    mutateBoard(boardId, (board) => ({
      ...board,
      cards: {
        ...board.cards,
        [cardId]: {
          ...board.cards[cardId],
          ...draft,
          updatedAt: nowIso(),
        },
      },
    }));
    setEditingCardId(null);
  }

  function deleteCard(boardId: string, cardId: string) {
    mutateBoard(boardId, (board) => {
      const columnId = findColumnForCard(board, cardId);
      if (!columnId) {
        return board;
      }

      const cards = { ...board.cards };
      delete cards[cardId];
      return {
        ...board,
        cards,
        columns: {
          ...board.columns,
          [columnId]: {
            ...board.columns[columnId],
            cardIds: board.columns[columnId].cardIds.filter((id) => id !== cardId),
          },
        },
      };
    });
  }

  function moveCardByButton(
    boardId: string,
    cardId: string,
    direction: MoveDirection,
  ) {
    mutateBoard(boardId, (board) => {
      const sourceColumnId = findColumnForCard(board, cardId);
      if (!sourceColumnId) {
        return board;
      }

      const sourceColumnIndex = board.columnOrder.indexOf(sourceColumnId);
      const sourceCards = board.columns[sourceColumnId].cardIds;
      const sourceIndex = sourceCards.indexOf(cardId);

      if (direction === "up" || direction === "down") {
        const targetIndex = direction === "up" ? sourceIndex - 1 : sourceIndex + 1;
        if (targetIndex < 0 || targetIndex >= sourceCards.length) {
          return board;
        }
        return {
          ...board,
          columns: {
            ...board.columns,
            [sourceColumnId]: {
              ...board.columns[sourceColumnId],
              cardIds: arrayMove(sourceCards, sourceIndex, targetIndex),
            },
          },
        };
      }

      const targetColumnIndex =
        direction === "left" ? sourceColumnIndex - 1 : sourceColumnIndex + 1;
      const targetColumnId = board.columnOrder[targetColumnIndex];
      if (!targetColumnId) {
        return board;
      }

      const movedBoard = moveCardBetweenColumns(
        board,
        cardId,
        sourceColumnId,
        targetColumnId,
        board.columns[targetColumnId].cardIds.length,
      );

      return {
        ...movedBoard,
        activity: [
          {
            id: uid("activity"),
            cardId,
            cardTitle: board.cards[cardId]?.title ?? "Kart",
            fromColumnId: sourceColumnId,
            toColumnId: targetColumnId,
            at: nowIso(),
          },
          ...board.activity,
        ].slice(0, 20),
      };
    });
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveDragId(String(event.active.id));
  }

  function handleDragEnd(boardId: string, event: DragEndEvent) {
    const { active, over } = event;
    setActiveDragId(null);
    if (!over || active.id === over.id) {
      return;
    }

    mutateBoard(boardId, (board) => {
      const activeType = active.data.current?.type;
      const overType = over.data.current?.type;
      const activeId = String(active.id);
      const overId = String(over.id);

      if (activeType === "column" && overType === "column") {
        const oldIndex = board.columnOrder.indexOf(activeId);
        const newIndex = board.columnOrder.indexOf(overId);
        if (oldIndex < 0 || newIndex < 0) {
          return board;
        }
        return {
          ...board,
          columnOrder: arrayMove(board.columnOrder, oldIndex, newIndex),
        };
      }

      if (activeType !== "card") {
        return board;
      }

      const sourceColumnId = findColumnForCard(board, activeId);
      const targetColumnId =
        overType === "column" ? overId : findColumnForCard(board, overId);

      if (!sourceColumnId || !targetColumnId) {
        return board;
      }

      const sourceCards = board.columns[sourceColumnId].cardIds;
      const targetCards = board.columns[targetColumnId].cardIds;
      const sourceIndex = sourceCards.indexOf(activeId);
      const overIndex =
        overType === "card" ? targetCards.indexOf(overId) : targetCards.length;

      if (sourceIndex < 0) {
        return board;
      }

      const movedBoard = moveCardBetweenColumns(
        board,
        activeId,
        sourceColumnId,
        targetColumnId,
        overIndex < 0 ? targetCards.length : overIndex,
      );

      if (sourceColumnId === targetColumnId) {
        return movedBoard;
      }

      return {
        ...movedBoard,
        activity: [
          {
            id: uid("activity"),
            cardId: activeId,
            cardTitle: board.cards[activeId]?.title ?? "Kart",
            fromColumnId: sourceColumnId,
            toColumnId: targetColumnId,
            at: nowIso(),
          },
          ...board.activity,
        ].slice(0, 20),
      };
    });
  }

  if (!isHydrated) {
    return <main className="loading-screen">TaskFlow</main>;
  }

  if (!currentUser) {
    return <AuthScreen onAuth={handleAuth} />;
  }

  if (!activeBoard) {
    return (
      <main className="empty-app">
        <button className="primary-action" onClick={() => createBoard("Yeni Board")}>
          <Plus size={18} />
          Board olustur
        </button>
      </main>
    );
  }

  const totalCards = Object.keys(activeBoard.cards).length;

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="product-lockup">
          <div className="brand-icon">
            <KanbanSquare size={24} />
          </div>
          <div>
            <span>TaskFlow</span>
            <strong>{activeBoard.name}</strong>
          </div>
        </div>
        <label className="search-box">
          <Search size={16} />
          <input
            placeholder="Kart ara"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        <div className="user-chip">
          <UserRound size={16} />
          <span>{currentUser.name}</span>
          <button
            className="icon-button compact"
            aria-label="Cikis yap"
            title="Cikis yap"
            onClick={() =>
              setState((current) => ({
                ...current,
                currentUserId: null,
              }))
            }
            type="button"
          >
            <LogOut size={15} />
          </button>
        </div>
      </header>

      <div className="workspace">
        <BoardSidebar
          boards={userBoards}
          activeBoardId={activeBoard.id}
          onCreateBoard={createBoard}
          onSelectBoard={(boardId) =>
            setState((current) => ({ ...current, activeBoardId: boardId }))
          }
        />
        <section className="board-area">
          <div className="board-toolbar">
            <div className="board-toolbar-copy">
              <span className="board-count">{userBoards.length} board</span>
              <p>
                {activeBoard.columnOrder.length} sutun · {totalCards} kart · siralama
                kaydedildi
              </p>
            </div>
            <form
              className="new-column"
              onSubmit={(event) => {
                event.preventDefault();
                if (!newColumnTitle.trim()) {
                  return;
                }
                addColumn(activeBoard.id, newColumnTitle.trim());
                setNewColumnTitle("");
              }}
            >
              <input
                placeholder="Yeni sutun"
                value={newColumnTitle}
                onChange={(event) => setNewColumnTitle(event.target.value)}
              />
              <button aria-label="Sutun ekle" title="Sutun ekle" type="submit">
                <Columns3 size={17} />
              </button>
            </form>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={(event) => handleDragEnd(activeBoard.id, event)}
          >
            <SortableContext
              items={activeBoard.columnOrder}
              strategy={horizontalListSortingStrategy}
            >
              <div className="kanban-board">
                {activeBoard.columnOrder.map((columnId, columnIndex) => {
                  const column = activeBoard.columns[columnId];
                  const cards = column.cardIds
                    .map((cardId) => activeBoard.cards[cardId])
                    .filter(Boolean)
                    .filter((card) =>
                      `${card.title} ${card.description} ${card.assignee}`
                        .toLowerCase()
                        .includes(search.trim().toLowerCase()),
                    );

                  return (
                    <SortableColumn
                      key={column.id}
                      board={activeBoard}
                      column={column}
                      cards={cards}
                      columnIndex={columnIndex}
                      onAddCard={(targetColumnId, title) =>
                        addCard(activeBoard.id, targetColumnId, title)
                      }
                      onEditCard={setEditingCardId}
                      onDeleteCard={(cardId) => deleteCard(activeBoard.id, cardId)}
                      onRenameColumn={(targetColumnId, title) =>
                        renameColumn(activeBoard.id, targetColumnId, title)
                      }
                      onDeleteColumn={(targetColumnId) =>
                        deleteColumn(activeBoard.id, targetColumnId)
                      }
                      onMoveCardByButton={(cardId, direction) =>
                        moveCardByButton(activeBoard.id, cardId, direction)
                      }
                    />
                  );
                })}
              </div>
            </SortableContext>
            <DragOverlay>
              {activeCard ? <CardPreview card={activeCard} /> : null}
            </DragOverlay>
          </DndContext>
        </section>
        <aside className="activity-panel">
          <h2>Aktivite</h2>
          <div className="activity-list">
            {activeBoard.activity.length === 0 ? (
              <p>Henuz hareket yok.</p>
            ) : (
              activeBoard.activity.map((item) => (
                <div className="activity-item" key={item.id}>
                  <span className="activity-dot" />
                  <strong>{item.cardTitle}</strong>
                  <span>
                    {getColumnTitle(activeBoard, item.fromColumnId)}
                    {" -> "}
                    {getColumnTitle(activeBoard, item.toColumnId)}
                  </span>
                  <time>
                    {new Intl.DateTimeFormat("tr-TR", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    }).format(new Date(item.at))}
                  </time>
                </div>
              ))
            )}
          </div>
        </aside>
      </div>

      {editingCard ? (
        <EditCardDialog
          card={editingCard}
          onClose={() => setEditingCardId(null)}
          onSave={(draft) => updateCard(activeBoard.id, editingCard.id, draft)}
        />
      ) : null}
    </main>
  );
}
