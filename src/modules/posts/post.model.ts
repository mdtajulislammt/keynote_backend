import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPost extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  body: string;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<IPost>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    body: {
      type: String,
      required: [true, 'Body is required'],
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
// 1. Directly supports retrieving all posts belonging to a particular user with sorting and $lookup aggregation
postSchema.index({ userId: 1, createdAt: -1 });

export const Post: Model<IPost> = mongoose.model<IPost>('Post', postSchema);
