import {
  Request,
  Response,
  NextFunction,
  IRouter
} from 'express';

export type HttpRequest = Request;
export type HttpResponse = Response;
export type HttpNext = NextFunction;
export type HttpRouter = IRouter;
