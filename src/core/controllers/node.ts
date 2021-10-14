import httpStatus from 'http-status-codes';
import * as R from 'ramda';

import { Node } from '../services/node';

import { HttpNext, HttpRequest, HttpResponse } from '../../types/http';

const createNode = async (req: HttpRequest, res: HttpResponse, next: HttpNext) => {
  const nodeService = new Node();

  const createNode = R.pipe(
    R.propOr({}, 'body'),
    R.pick(['name', 'service', 'port', 'tags', 'metadata']),
  )(req);

  const result = await nodeService.create(createNode);

  return res.status(httpStatus.CREATED).json(result);
};

const listNodes = async (req: HttpRequest, res: HttpResponse, next: HttpNext) => {
  const filter = R.pipe(
    R.propOr({}, 'query'),
    R.pick(['name', 'service', 'port', 'tags']),
  )(req);
  const nodeService = new Node();

  const nodeList = await nodeService.find(filter);


  return res.status(httpStatus.OK).json(nodeList);
};

const getNodeUid = async (req: HttpRequest, res: HttpResponse, next: HttpNext) => {
  const nodeUid = R.path(['params', 'uid'], req) as string;

  if (!nodeUid) {
    return res.status(httpStatus.BAD_GATEWAY).json({
      message: 'invalid node uid',
    });
  }

  const nodeService = new Node();
  const nodeList = await nodeService.find({
    uid: nodeUid,
  });

  return res.status(httpStatus.OK).json(nodeList);
};

export default {
  createNode,
  listNodes,
  getNodeUid,
};
