import mongoose from 'mongoose';

/**
 * Playlist Schema
 * 
 * Foundation for user and curated playlists.
 * Uses `ownerId` defaulting to 'guest-user' for pre-auth phases,
 * designed for seamless migration to user accounts in Phase 9.
 */
const PlaylistSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    cover: {
      type: String,
      default: '',
    },
    trackIds: {
      type: [String],
      default: [],
    },
    ownerId: {
      type: String,
      default: 'guest-user',
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

PlaylistSchema.index({ ownerId: 1, id: 1 });

export const Playlist = mongoose.models.Playlist || mongoose.model('Playlist', PlaylistSchema);
