import mongoose from 'mongoose';

/**
 * User Schema
 * 
 * Central user account model for Mimicu Phase 9.
 * Manages user profile, authentication credentials, and references to personal music collections.
 */
const UserSchema = new mongoose.Schema(
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
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
    },
    avatar: {
      type: String,
      default: 'linear-gradient(135deg, #a855f7 0%, #38bdf8 100%)',
    },
    likedTrackIds: {
      type: [String],
      default: [],
    },
    recentlyPlayed: [
      {
        trackId: { type: String, required: true },
        playedAt: { type: Date, default: Date.now },
      },
    ],
    savedVibeIds: {
      type: [String],
      default: [],
    },
    playlistIds: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret._id;
        delete ret.__v;
        delete ret.passwordHash; // Critical: never leak password hash
        return ret;
      },
    },
  }
);

export const User = mongoose.models.User || mongoose.model('User', UserSchema);
