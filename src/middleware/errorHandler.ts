import httpStatus from 'http-status-codes';
import { HttpNext, HttpRequest, HttpResponse } from '../types/http';
import { Logger } from '../util/logger';

export const errorHandler = (
  err: Error,
  req: HttpRequest,
  res: HttpResponse,
  next: HttpNext,
): unknown => {
  Logger.error(err);

  return res
    .status(httpStatus.INTERNAL_SERVER_ERROR)
    .send({
      name: err.name,
      message: err.message,
    });
};
