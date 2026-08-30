export type Presence = {
  cursor: { x: number; y: number } | null;
  isThinking: boolean;
};

export type UserMeta = {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  cursorColor: string;
};
