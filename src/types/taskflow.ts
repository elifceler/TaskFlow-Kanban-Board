export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
};

export type CardItem = {
  id: string;
  title: string;
  description: string;
  label: string;
  assignee: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
};

export type Column = {
  id: string;
  title: string;
  cardIds: string[];
};

export type Activity = {
  id: string;
  cardId: string;
  cardTitle: string;
  fromColumnId: string;
  toColumnId: string;
  at: string;
};

export type Board = {
  id: string;
  ownerId: string;
  name: string;
  createdAt: string;
  columnOrder: string[];
  columns: Record<string, Column>;
  cards: Record<string, CardItem>;
  activity: Activity[];
};

export type AppState = {
  users: User[];
  currentUserId: string | null;
  boards: Record<string, Board>;
  activeBoardId: string | null;
};

export type CardDraft = Pick<
  CardItem,
  "title" | "description" | "label" | "assignee" | "dueDate"
>;

export type MoveDirection = "left" | "right" | "up" | "down";
