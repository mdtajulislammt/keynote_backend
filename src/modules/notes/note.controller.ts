import { Request, Response } from 'express';
import { noteService } from './note.service';
import { ApiResponse } from '../../utils/api-response';
import { asyncHandler } from '../../utils/async-handler';
import { ApiError } from '../../utils/api-error';

export class NoteController {
  public createNote = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized('User not authenticated');

    const note = await noteService.createNote(req.user.userId, req.body);
    return ApiResponse.created(res, note, 'Note created successfully');
  });

  public getUserNotes = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized('User not authenticated');

    const result = await noteService.getUserNotes(req.user.userId, req.query);
    return ApiResponse.paginated(res, result.data, result.meta, 'Notes retrieved successfully');
  });

  public getAllNotes = asyncHandler(async (req: Request, res: Response) => {
    const result = await noteService.getAllNotes(req.query);
    return ApiResponse.paginated(res, result.data, result.meta, 'All notes retrieved successfully');
  });

  public getNoteById = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized('User not authenticated');

    const id = req.params.id as string;
    const note = await noteService.getNoteById(id, req.user.userId, req.user.role);
    return ApiResponse.success(res, note, 'Note retrieved successfully');
  });

  public updateNote = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized('User not authenticated');

    const id = req.params.id as string;
    const note = await noteService.updateNote(id, req.user.userId, req.body);
    return ApiResponse.success(res, note, 'Note updated successfully');
  });

  public deleteNote = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized('User not authenticated');

    const id = req.params.id as string;
    const result = await noteService.deleteNote(id, req.user.userId);
    return ApiResponse.success(res, result, 'Note deleted successfully');
  });
}

export const noteController = new NoteController();
