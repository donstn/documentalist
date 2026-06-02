export interface Doc {
  id: string;
  title: string;
  body: string;
  /** Whether the user has starred (favourited) this document. */
  starred: boolean;
  /** Free-form labels shown in the sidebar and editable below the editor. */
  tags: string[];
  /** Epoch milliseconds. */
  createdAt: number;
  /** Epoch milliseconds; bumped on every edit. Used for sidebar ordering. */
  updatedAt: number;
  /** Null when active; epoch milliseconds of when it was moved to the trash. */
  deletedAt: number | null;
}
