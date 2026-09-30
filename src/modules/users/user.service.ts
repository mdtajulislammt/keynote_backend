import { User, IUser } from './user.model';
import { CreateUserDto, UpdateUserDto, UserQueryDto } from './user.dto';
import { hashPassword } from '../../utils/password';
import { ApiError } from '../../utils/api-error';
import { ErrorCode } from '../../constants';
import { parsePagination, buildPaginationMeta } from '../../utils/pagination';
import { PaginationMeta } from '../../utils/api-response';
import { Note } from '../notes/note.model';
import { Post } from '../posts/post.model';

export interface PaginatedUsersResult {
  data: IUser[];
  meta: PaginationMeta;
}

export class UserService {
  public async createUser(dto: CreateUserDto): Promise<IUser> {
    const existing = await User.findOne({ email: dto.email });
    if (existing) {
      throw ApiError.conflict('An account with this email already exists', ErrorCode.CONFLICT);
    }

    const hashedPassword = await hashPassword(dto.password);

    const user = await User.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      role: dto.role,
      interests: dto.interests,
    });

    const userObj = user.toObject();
    delete userObj.password;
    return userObj as IUser;
  }

  public async getUsers(query: UserQueryDto): Promise<PaginatedUsersResult> {
    const { page, limit, skip } = parsePagination(query);

    const filter: Record<string, unknown> = {};
    if (query.role) {
      filter.role = query.role;
    }

    // Leverages index: { role: 1, createdAt: -1 }
    const [users, total] = await Promise.all([
      User.find(filter)
        .sort({ role: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      User.countDocuments(filter).exec(),
    ]);

    const meta = buildPaginationMeta(total, page, limit);

    return {
      data: users,
      meta,
    };
  }

  public async getUserById(id: string): Promise<IUser> {
    const user = await User.findById(id).exec();
    if (!user) {
      throw ApiError.notFound(`User with id '${id}' not found`, ErrorCode.NOT_FOUND);
    }
    return user;
  }

  public async updateUser(id: string, dto: UpdateUserDto): Promise<IUser> {
    const user = await User.findById(id).select('+password').exec();
    if (!user) {
      throw ApiError.notFound(`User with id '${id}' not found`, ErrorCode.NOT_FOUND);
    }

    if (dto.email && dto.email !== user.email) {
      const emailConflict = await User.findOne({ email: dto.email });
      if (emailConflict) {
        throw ApiError.conflict('Email is already taken by another account', ErrorCode.CONFLICT);
      }
      user.email = dto.email;
    }

    if (dto.name !== undefined) user.name = dto.name;
    if (dto.role !== undefined) user.role = dto.role;
    if (dto.interests !== undefined) user.interests = dto.interests;

    if (dto.password) {
      user.password = await hashPassword(dto.password);
    }

    await user.save();

    const userObj = user.toObject();
    delete userObj.password;
    return userObj as IUser;
  }

  public async deleteUser(id: string, currentAdminId?: string): Promise<{ id: string }> {
    if (currentAdminId && id === currentAdminId) {
      throw ApiError.badRequest('Admins cannot delete their own account', undefined, ErrorCode.BAD_REQUEST);
    }

    const user = await User.findByIdAndDelete(id).exec();
    if (!user) {
      throw ApiError.notFound(`User with id '${id}' not found`, ErrorCode.NOT_FOUND);
    }

    // Clean up associated resources
    await Promise.all([
      Note.deleteMany({ userId: id }).exec(),
      Post.deleteMany({ userId: id }).exec(),
    ]);

    return { id };
  }
}

export const userService = new UserService();
