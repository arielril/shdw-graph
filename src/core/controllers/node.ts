import httpStatus from 'http-status-codes';
import * as R from 'ramda';

import { Node } from '../services/node';

import { HttpNext, HttpRequest, HttpResponse } from '../../types/http';
import { Edge } from '../services/edge';

const nodeService = new Node();

const createNode = async (req: HttpRequest, res: HttpResponse, next: HttpNext): Promise<unknown> => {
  try {
    const nodeData = R.pipe(
      R.propOr({}, 'body'),
      R.pick(['name', 'service', 'port', 'tags', 'metadata']),
    )(req);

    if (R.isEmpty(nodeData)) {
      return res.status(httpStatus.BAD_REQUEST)
        .json({
          message: 'empty node information',
        });
    }

    const result = await nodeService.create(nodeData);

    return res.status(httpStatus.CREATED).json({
      node: R.pathOr({}, ['_fields', 0, 'properties'], result),
    });
  } catch (error) {
    next(error);
  }
};

const listNodes = async (req: HttpRequest, res: HttpResponse, next: HttpNext): Promise<unknown> => {
  try {
    const filter = R.pipe(
      R.propOr({}, 'query'),
      R.pick(['name', 'service', 'port', 'tags']),
    )(req);

    const nodeList = await nodeService.find(filter);

    return res.status(httpStatus.OK).json({
      nodes: nodeList.map(R.path(['_fields', 0, 'properties'])),
    });
  } catch (error) {
    next(error);
  }
};

const getNodeUid = async (req: HttpRequest, res: HttpResponse, next: HttpNext): Promise<unknown> => {
  try {
    const nodeUid = R.path(['params', 'uid'], req) as string;

    if (!nodeUid) {
      return res.status(httpStatus.BAD_GATEWAY).json({
        message: 'invalid node uid',
      });
    }

    const nodeList = await nodeService.find({
      uid: nodeUid,
    });

    return res.status(httpStatus.OK).json({
      node: R.pathOr({}, [0, '_fields', 0, 'properties'], nodeList),
    });
  } catch (error) {
    next(error);
  }
};

export default {
  createNode,
  listNodes,
  getNodeUid,
};
