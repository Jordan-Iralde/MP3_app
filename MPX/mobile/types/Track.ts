/**
 * @deprecated Use Song from domain/models/Song.ts instead
 * Kept for backward compatibility
 */
export type Track = {
  id: string;
  title: string;
  artist: string;
  duration: number;
  uri: string;
  filename?: string;
  modificationTime?: number;
};
