import { Note, INote } from './note.model';
import { CreateNoteDto, UpdateNoteDto, NoteQueryDto } from './note.dto';
import { ApiError } from '../../utils/api-error';
import { UserRole, ErrorCode } from '../../constants';
import { parsePagination, buildPaginationMeta } from '../../utils/pagination';
import { PaginationMeta } from '../../utils/api-response';

export interface PaginatedNotesResult {
  data: INote[];
  meta: PaginationMeta;
}

export class NoteService {
  public async createNote(userId: string, dto: CreateNoteDto): Promise<INote> {
    const note = await Note.create({
      title: dto.title,
      content: dto.content,
      userId,
    });
    return note;
  }

  // Fetch notes belonging to the authenticated user
  public async getUserNotes(userId: string, query: NoteQueryDto): Promise<PaginatedNotesResult> {
    const { page, limit, skip } = parsePagination(query);

    const filter = { userId };

    const [notes, total] = await Promise.all([
      Note.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      Note.countDocuments(filter).exec(),
    ]);

    const meta = buildPaginationMeta(total, page, limit);

    return {
      data: notes,
      meta,
    };
  }

  // Admin-only: Fetch all notes across all users
  public async getAllNotes(query: NoteQueryDto): Promise<PaginatedNotesResult> {
    const { page, limit, skip } = parsePagination(query);

    const [notes, total] = await Promise.all([
      Note.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'name email role')
        .exec(),
      Note.countDocuments().exec(),
    ]);

    const meta = buildPaginationMeta(total, page, limit);

    return {
      data: notes,
      meta,
    };
  }

  // Fetch a single note.
  public async getNoteById(noteId: string, userId: string, role: UserRole): Promise<INote> {
    let note: INote | null;

    if (role === UserRole.ADMIN) {
      note = await Note.findById(noteId).populate('userId', 'name email role').exec();
    } else {
      note = await Note.findOne({ _id: noteId, userId }).exec();
    }

    if (!note) {
      throw ApiError.notFound(`Note with id '${noteId}' not found`, ErrorCode.NOT_FOUND);
    }

    return note;
  }

  /**
   * Update a note. Only own note can be updated.
   */
  public async updateNote(noteId: string, userId: string, dto: UpdateNoteDto): Promise<INote> {
    const note = await Note.findById(noteId).exec();

    if (!note) {
      throw ApiError.notFound(`Note with id '${noteId}' not found`, ErrorCode.NOT_FOUND);
    }

    if (note.userId.toString() !== userId) {
      throw ApiError.forbidden('You can only update your own notes', ErrorCode.AUTHORIZATION_ERROR);
    }

    if (dto.title !== undefined) note.title = dto.title;
    if (dto.content !== undefined) note.content = dto.content;

    await note.save();
    return note;
  }

  /**
   * Delete a note. Only own note can be deleted.
   */
  public async deleteNote(noteId: string, userId: string): Promise<{ id: string }> {
    const note = await Note.findById(noteId).exec();

    if (!note) {
      throw ApiError.notFound(`Note with id '${noteId}' not found`, ErrorCode.NOT_FOUND);
    }

    if (note.userId.toString() !== userId) {
      throw ApiError.forbidden('You can only delete your own notes', ErrorCode.AUTHORIZATION_ERROR);
    }

    await Note.deleteOne({ _id: noteId }).exec();
    return { id: noteId };
  }
}

export const noteService = new NoteService();
