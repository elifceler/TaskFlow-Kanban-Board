import type { AppState, Board, CardDraft } from "@/types/taskflow";

export const STORAGE_KEY = "taskflow-kanban-state-v1";
export const LABELS = ["Backend", "Frontend", "Bug", "Tasarim", "Planlama"];

export const emptyCardDraft: CardDraft = {
  title: "",
  description: "",
  label: "Planlama",
  assignee: "",
  dueDate: "",
};

export function uid(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

export function nowIso() {
  return new Date().toISOString();
}

export function createInitialBoard(ownerId: string): Board {
  const todoId = uid("column");
  const doingId = uid("column");
  const reviewId = uid("column");
  const doneId = uid("column");
  const cardA = uid("card");
  const cardB = uid("card");
  const cardC = uid("card");
  const createdAt = nowIso();

  return {
    id: uid("board"),
    ownerId,
    name: "TaskFlow Kanban Board",
    createdAt,
    columnOrder: [todoId, doingId, reviewId, doneId],
    columns: {
      [todoId]: {
        id: todoId,
        title: "Yapilacak",
        cardIds: [cardA, cardB],
      },
      [doingId]: {
        id: doingId,
        title: "Devam Ediyor",
        cardIds: [cardC],
      },
      [reviewId]: {
        id: reviewId,
        title: "Inceleme",
        cardIds: [],
      },
      [doneId]: {
        id: doneId,
        title: "Tamamlandi",
        cardIds: [],
      },
    },
    cards: {
      [cardA]: {
        id: cardA,
        title: "Kimlik akisini tamamla",
        description:
          "Kullanici kayit, giris ve cikis senaryolarini ayni local-first veri modeline bagla.",
        label: "Backend",
        assignee: "Ece",
        dueDate: "",
        createdAt,
        updatedAt: createdAt,
      },
      [cardB]: {
        id: cardB,
        title: "Mobil tasima kontrollerini ekle",
        description:
          "Dokunmatik cihazlarda surukle-birak zor oldugunda kartlar butonlarla da tasinabilsin.",
        label: "Frontend",
        assignee: "Mert",
        dueDate: "",
        createdAt,
        updatedAt: createdAt,
      },
      [cardC]: {
        id: cardC,
        title: "Siralama kaliciligini dogrula",
        description:
          "Kart ve sutun sirasi sayfa yenilendiginde korunmali; veri column.cardIds ve columnOrder ile saklaniyor.",
        label: "Bug",
        assignee: "Ada",
        dueDate: "",
        createdAt,
        updatedAt: createdAt,
      },
    },
    activity: [],
  };
}

export function defaultState(): AppState {
  const demoUser = {
    id: "user-demo",
    name: "TaskFlow Ekibi",
    email: "demo@taskflow.local",
    password: "taskflow",
  };
  const demoBoard = createInitialBoard(demoUser.id);

  return {
    users: [demoUser],
    currentUserId: null,
    boards: {
      [demoBoard.id]: demoBoard,
    },
    activeBoardId: null,
  };
}

export function readInitialState(): AppState {
  if (typeof window === "undefined") {
    return defaultState();
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return defaultState();
    }

    const parsed = JSON.parse(raw) as AppState;
    return {
      users: parsed.users ?? [],
      currentUserId: parsed.currentUserId ?? null,
      boards: parsed.boards ?? {},
      activeBoardId: parsed.activeBoardId ?? null,
    };
  } catch {
    return defaultState();
  }
}

export function findColumnForCard(board: Board, cardId: string) {
  return board.columnOrder.find((columnId) =>
    board.columns[columnId]?.cardIds.includes(cardId),
  );
}

export function getColumnTitle(board: Board, columnId: string) {
  return board.columns[columnId]?.title ?? "Bilinmeyen";
}

export function moveCardBetweenColumns(
  board: Board,
  cardId: string,
  sourceColumnId: string,
  targetColumnId: string,
  targetIndex: number,
) {
  const source = board.columns[sourceColumnId];
  const target = board.columns[targetColumnId];
  if (!source || !target) {
    return board;
  }

  const sourceCards = source.cardIds.filter((id) => id !== cardId);
  const targetCards =
    sourceColumnId === targetColumnId ? sourceCards : [...target.cardIds];
  const boundedIndex = Math.max(0, Math.min(targetIndex, targetCards.length));
  targetCards.splice(boundedIndex, 0, cardId);

  return {
    ...board,
    columns: {
      ...board.columns,
      [sourceColumnId]: {
        ...source,
        cardIds: sourceColumnId === targetColumnId ? targetCards : sourceCards,
      },
      [targetColumnId]: {
        ...target,
        cardIds: targetCards,
      },
    },
  };
}
