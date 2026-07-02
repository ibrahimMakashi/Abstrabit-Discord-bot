import { ZodError } from 'zod';
import { StatusCodes } from 'http-status-codes';
import { apiResponse } from '../utils/apiResponse.js';
import { AppError } from '../utils/AppError.js';
import { buildDiscordReply } from '../services/discordService.js';

export const notFoundHandler = (req, res) => {
  res.status(StatusCodes.NOT_FOUND).json(
    apiResponse({
      success: false,
      message: `Route not found: ${req.method} ${req.originalUrl}`,
      data: null,
    }),
  );
};

export const errorHandler = (error, req, res) => {
  req.log?.error({ err: error }, 'Request failed');

  if (req.originalUrl.startsWith('/api/interactions') && !res.headersSent) {
    if (error instanceof AppError && error.statusCode === StatusCodes.UNAUTHORIZED) {
      return res.status(StatusCodes.UNAUTHORIZED).send(error.message);
    }

    const message =
      error instanceof AppError && error.message.length < 180
        ? error.message
        : 'The command could not be processed. Please try again.';

    return res.status(200).json(buildDiscordReply(message));
  }

  if (error instanceof ZodError) {
    return res.status(StatusCodes.BAD_REQUEST).json(
      apiResponse({
        success: false,
        message: 'Validation failed',
        data: error.flatten(),
      }),
    );
  }

  if (error instanceof AppError) {
    return res.status(error.statusCode).json(
      apiResponse({
        success: false,
        message: error.message,
        data: error.details,
      }),
    );
  }

  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(
    apiResponse({
      success: false,
      message: 'Internal server error',
      data: null,
    }),
  );
};
