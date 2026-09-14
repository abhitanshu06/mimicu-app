import mongoose from 'mongoose';

/**
 * Track Schema
 * 
 * Relationship between frontend Track and backend Track document:
 * - `id`: Canonical string identifier matching frontend TRACKS (e.g. 'track-3am-1').
 * - `title`, `artist`, `album`: Metadata matching frontend interface.
 * - `duration`: Total length in seconds.
 * - `coverArtUrl`: CSS gradient or image URL for artwork.
 * - `artwork`: Convenience alias for coverArtUrl.
 * - `audioUrl`: Remote or local URL reference.
 * - `audioFile`: Filename in AUDIO_STORAGE_PATH (e.g. 'track-3am-1.wav').
 * - `vibeIds`: Canonical Vibe IDs associated with this track.
 * - `genres`, `moods`: Classification tags.
 * - `bpm`, `energy`: Tempo and acoustic energy.
 */
const TrackSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    artist: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    album: {
      type: String,
      default: '',
      trim: true,
    },
    duration: {
      type: Number,
      required: true,
      min: 0,
    },
    coverArtUrl: {
      type: String,
      default: '',
    },
    artwork: {
      type: String,
      default: '',
    },
    audioUrl: {
      type: String,
      default: '',
    },
    audioFile: {
      type: String,
      default: '',
    },
    vibeIds: {
      type: [String],
      default: [],
      index: true,
    },
    genres: {
      type: [String],
      default: [],
    },
    moods: {
      type: [String],
      default: [],
    },
    bpm: {
      type: Number,
      default: 75,
    },
    energy: {
      type: Number,
      default: 0.5,
      min: 0,
      max: 1,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret._id;
        delete ret.__v;
        if (!ret.artwork && ret.coverArtUrl) {
          ret.artwork = ret.coverArtUrl;
        }
        return ret;
      },
    },
  }
);

// Compound text index for search queries
TrackSchema.index({ title: 'text', artist: 'text', album: 'text' });

export const Track = mongoose.models.Track || mongoose.model('Track', TrackSchema);
