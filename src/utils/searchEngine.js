import { TRACKS } from '../data/tracks';
import { VIBES } from '../config/vibes';

/**
 * Universal Search Engine
 *
 * Case-insensitive, partial-match friendly filtering across:
 * - Songs (title, artist, album, genres, mood)
 * - Vibes (name, category, tagline, description, moodTags)
 * - Playlists (name, description)
 * - Artists (unique matching artists with track counts)
 *
 * @param {string} query
 * @param {Array} userPlaylists
 * @returns {{ songs: Array, vibes: Array, playlists: Array, artists: Array, totalCount: number }}
 */
export function performUniversalSearch(query = '', userPlaylists = []) {
  const q = query.trim().toLowerCase();
  if (!q) {
    return {
      songs: [],
      vibes: [],
      playlists: [],
      artists: [],
      totalCount: 0,
    };
  }

  // 1. Search Songs
  const matchedSongs = TRACKS.filter((track) => {
    const titleMatch = track.title?.toLowerCase().includes(q);
    const artistMatch = track.artist?.toLowerCase().includes(q);
    const albumMatch = track.album?.toLowerCase().includes(q);
    const genreMatch = track.genres?.some((g) => g.toLowerCase().includes(q));
    const moodMatch = track.mood?.some((m) => m.toLowerCase().includes(q));
    return titleMatch || artistMatch || albumMatch || genreMatch || moodMatch;
  });

  // 2. Search Vibes (all 15 canonical vibes)
  const allVibes = Object.values(VIBES);
  const matchedVibes = allVibes.filter((vibe) => {
    const nameMatch = vibe.name?.toLowerCase().includes(q);
    const categoryMatch = vibe.category?.toLowerCase().includes(q);
    const taglineMatch = vibe.tagline?.toLowerCase().includes(q);
    const descMatch = vibe.description?.toLowerCase().includes(q);
    const moodMatch = vibe.moodTags?.some((m) => m.toLowerCase().includes(q));
    const genreMatch = vibe.recommendedGenres?.some((g) => g.toLowerCase().includes(q));
    return nameMatch || categoryMatch || taglineMatch || descMatch || moodMatch || genreMatch;
  });

  // 3. Search User Playlists
  const matchedPlaylists = (userPlaylists || []).filter((pl) => {
    const nameMatch = pl.name?.toLowerCase().includes(q);
    const descMatch = pl.description?.toLowerCase().includes(q);
    return nameMatch || descMatch;
  });

  // 4. Search Unique Artists
  const artistMap = new Map();
  TRACKS.forEach((track) => {
    if (!track.artist) return;
    const lowerArtist = track.artist.toLowerCase();
    if (lowerArtist.includes(q)) {
      if (!artistMap.has(track.artist)) {
        artistMap.set(track.artist, {
          artist: track.artist,
          trackCount: 1,
          coverArtUrl: track.coverArtUrl,
        });
      } else {
        const existing = artistMap.get(track.artist);
        existing.trackCount += 1;
      }
    }
  });
  const matchedArtists = Array.from(artistMap.values());

  const totalCount =
    matchedSongs.length + matchedVibes.length + matchedPlaylists.length + matchedArtists.length;

  return {
    songs: matchedSongs,
    vibes: matchedVibes,
    playlists: matchedPlaylists,
    artists: matchedArtists,
    totalCount,
  };
}
