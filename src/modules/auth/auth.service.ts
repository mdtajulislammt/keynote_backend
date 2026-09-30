import { User, IUser } from '../users/user.model';
import { RegisterDto, LoginDto } from './auth.dto';
import { hashPassword, comparePassword } from '../../utils/password';
import { signToken } from '../../utils/jwt';
import { ApiError } from '../../utils/api-error';
import { UserRole, ErrorCode } from '../../constants';

export interface AuthResult {
  user: {
    _id: string;
    name: string;
    email: string;
    role: UserRole;
    interests: string[];
    createdAt: Date;
    updatedAt: Date;
  };
  token: string;
}

export class AuthService {
  public async register(dto: RegisterDto): Promise<AuthResult> {
    const existingUser = await User.findOne({ email: dto.email });
    if (existingUser) {
      throw ApiError.conflict('An account with this email already exists', ErrorCode.CONFLICT);
    }

    const hashedPassword = await hashPassword(dto.password);

    const user = await User.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      role: UserRole.USER,
      interests: dto.interests,
    });

    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    return {
      user: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        interests: user.interests,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      token,
    };
  }

  public async login(dto: LoginDto): Promise<AuthResult> {
    const user = await User.findOne({ email: dto.email }).select('+password');
    if (!user || !user.password) {
      throw ApiError.unauthorized('Invalid email or password', ErrorCode.AUTHENTICATION_ERROR);
    }

    const isMatch = await comparePassword(dto.password, user.password);
    if (!isMatch) {
      throw ApiError.unauthorized('Invalid email or password', ErrorCode.AUTHENTICATION_ERROR);
    }

    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    return {
      user: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        interests: user.interests,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      token,
    };
  }

  public async getProfile(userId: string): Promise<IUser> {
    const user = await User.findById(userId);
    if (!user) {
      throw ApiError.notFound('User profile not found', ErrorCode.NOT_FOUND);
    }
    return user;
  }
}

export const authService = new AuthService();
