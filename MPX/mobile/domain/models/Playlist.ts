import { Song } from '@/domain/models/Song';

/**
 * FUTURE: Represents a user playlist
 * Ready for implementation when needed
 */
export interface Playlist {
  id: string;
  name: string;
  songIds: string[]; // References to Song.id
  createdAt: number;
  updatedAt: number;
}
