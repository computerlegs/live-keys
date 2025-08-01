import { Request, Response } from 'express';
import { KeyService } from '../services/key-service';
import { EncryptionService } from '../services/encryption-service';
import { ApiResponse, ApiErrorResponse } from '../types/api';

let isStreamingMode = false;

const sendError = (res: Response, code: string, message: string, statusCode = 500) => {
    const errorResponse: ApiErrorResponse = {
        success: false,
        error: { code, message },
        timestamp: new Date().toISOString(),
    };
    return res.status(statusCode).json(errorResponse);
};

const sendSuccess = <T>(res: Response, data: T, statusCode = 200) => {
    const successResponse: ApiResponse<T> = {
        success: true,
        data,
        timestamp: new Date().toISOString(),
    };
    return res.status(statusCode).json(successResponse);
};

export class KeyController {
    public static getKey(req: Request, res: Response) {
        const { name } = req.params;
        if (!name) {
            return sendError(res, 'INVALID_INPUT', '`name` parameter is required.', 400);
        }
        const key = KeyService.getByName(name);

        if (!key) {
            return sendError(res, 'KEY_NOT_FOUND', `Key with name '${name}' not found.`, 404);
        }

        const responseValue = isStreamingMode ? key.placeholder : EncryptionService.decrypt(key.value);
        if (!responseValue) {
            return sendError(res, 'INVALID_STATE', `No value available for key '${name}' in current mode.`, 404);
        }

        return sendSuccess(res, { name, value: responseValue });
    }

    public static createKey(req: Request, res: Response) {
        const { name, value, placeholder } = req.body;

        if (!name || typeof name !== 'string' || !value || typeof value !== 'string') {
            return sendError(res, 'INVALID_INPUT', '`name` and `value` are required string fields.', 400);
        }

        if (KeyService.getByName(name)) {
            return sendError(res, 'CONFLICT', `A key with name '${name}' already exists.`, 409);
        }

        const newKey = KeyService.create({ name, value, placeholder });
        return sendSuccess(res, newKey, 201);
    }

    public static updateKey(req: Request, res: Response) {
        const { id } = req.params;
        if (!id) {
            return sendError(res, 'INVALID_INPUT', '`id` parameter is required.', 400);
        }
        const { value, placeholder } = req.body;

        if (!value && placeholder === undefined) {
            return sendError(res, 'INVALID_INPUT', 'Either `value` or `placeholder` must be provided.', 400);
        }

        const updatedKey = KeyService.update(parseInt(id, 10), { value, placeholder });

        if (!updatedKey) {
            return sendError(res, 'KEY_NOT_FOUND', `Key with id '${id}' not found.`, 404);
        }

        return sendSuccess(res, updatedKey);
    }

    public static deleteKey(req: Request, res: Response) {
        const { id } = req.params;
        if (!id) {
            return sendError(res, 'INVALID_INPUT', '`id` parameter is required.', 400);
        }
        const success = KeyService.delete(parseInt(id, 10));

        if (!success) {
            return sendError(res, 'KEY_NOT_FOUND', `Key with id '${id}' not found.`, 404);
        }

        return sendSuccess(res, { message: 'Key deleted successfully.' });
    }

    public static listKeys(req: Request, res: Response) {
        const keys = KeyService.getAll().map(k => ({ id: k.id, name: k.name, placeholder: k.placeholder, createdAt: k.createdAt, updatedAt: k.updatedAt }));
        return sendSuccess(res, keys);
    }

    public static toggleStreamingMode(req: Request, res: Response) {
        isStreamingMode = !isStreamingMode;
        return sendSuccess(res, { streamingMode: isStreamingMode });
    }

    public static getStatus(req: Request, res: Response) {
        return sendSuccess(res, { streamingMode: isStreamingMode });
    }
} 