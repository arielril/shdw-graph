import {
  Request,
  Response,
  NextFunction,
  IRouter,
} from 'express';
import { Edge as EdgeModel, Node as NodeModel } from './model';

export type HttpRequest = Request;
export type HttpResponse = Response;
export type HttpNext = NextFunction;
export type HttpRouter = IRouter;

export type CreateEdgeRequest = {
  startNode: {
    uid: NodeModel['uid'];
    name: NodeModel['name'];
  };
  destinations: {
    node: {
      uid: NodeModel['uid'];
      name: NodeModel['name'];
    };
    edgeProperties: Partial<EdgeModel>;
  }[];
};

