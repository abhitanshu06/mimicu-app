import mongoose from 'mongoose';

/**
 * Vibe Schema
 * 
 * Represents one of Mimicu's 15 canonical immersive worlds.
 * Maintains references to canonical trackIds without duplicating track records.
 */
const VibeSchema = new mongoose.Schema(
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
      index: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    emoji: {
      type: String,
      default: '✨',
    },
    tagline: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    colors: {
      primary: { type: String, default: '#a855f7' },
      secondary: { type: String, default: '#38bdf8' },
      accent: { type: String, default: '#c084fc' },
      glow: { type: String, default: 'rgba(168, 85, 247, 0.45)' },
      bg: { type: String, default: '#090a12' },
    },
    visualWorld: {
      environmentType: { type: String, default: 'minimal-focus' },
      sky: { type: mongoose.Schema.Types.Mixed },
      lighting: { type: mongoose.Schema.Types.Mixed },
      fog: { type: mongoose.Schema.Types.Mixed },
      terrain: { type: mongoose.Schema.Types.Mixed },
      particles: { type: mongoose.Schema.Types.Mixed },
      camera: { type: mongoose.Schema.Types.Mixed },
    },
    recommendedGenres: {
      type: [String],
      default: [],
    },
    moodTags: {
      type: [String],
      default: [],
    },
    energy: {
      type: Number,
      default: 0.35,
    },
    bpmRange: {
      type: [Number],
      default: [65, 90],
    },
    trackIds: {
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
        return ret;
      },
    },
  }
);

export const Vibe = mongoose.models.Vibe || mongoose.model('Vibe', VibeSchema);
