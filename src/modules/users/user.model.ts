import mongoose, { Schema, Document, Model } from 'mongoose';
import { UserRole } from '../../constants';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  interests: string[];
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      // Index and uniqueness are explicitly defined below via userSchema.index
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false, // Hidden by default from queries for security
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
      required: true,
    },
    interests: {
      type: [String],
      default: [],
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
// 1. Fast lookup for login & registration uniqueness checks
userSchema.index({ email: 1 }, { unique: true });

// 2. Admin paginated user listing sorted by creation date
userSchema.index({ role: 1, createdAt: -1 });

// 3. Multikey index strictly supporting $unwind & $group aggregation pipeline by interests
userSchema.index({ interests: 1 });

export const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);
