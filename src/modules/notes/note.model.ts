import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INote extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  content: string;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const noteSchema = new Schema<INote>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
      trim: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'userId reference is required'],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// ==========================================
// EXPLICIT INDEX DEFINITIONS
// ==========================================
// 1. Compound index for regular users fetching their own notes paginated and sorted by creation date
noteSchema.index({ userId: 1, createdAt: -1 });

// 2. Admin paginated list across all notes sorted by date
noteSchema.index({ createdAt: -1 });

export const Note: Model<INote> = mongoose.model<INote>('Note', noteSchema);
