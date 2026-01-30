/**
 * Core domain model for a music track
 */
export interface Song {
  id: string;
  title: string;
  artist: string;
  duration: number; // in seconds
  uri: string;
}
