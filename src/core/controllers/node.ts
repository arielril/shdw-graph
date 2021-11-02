import httpStatus from 'http-status-codes';
import * as R from 'ramda';

import { Node } from '../services/node';
import { Logger } from '../../util/logger';

import { HttpNext, HttpRequest, HttpResponse } from '../../types/http';
import { Node as NodeModel } from '../../types/model';

const nodeService = new Node();

const createNode = async (req: HttpRequest, res: HttpResponse, next: HttpNext): Promise<unknown> => {
  try {
    const nodeData = R.pipe(
      R.propOr({}, 'body'),
      R.pick(['name', 'port', 'status_code', 'tags', 'metadata']),
    )(req);

    if (R.isEmpty(nodeData)) {
      return res.status(httpStatus.BAD_REQUEST)
        .json({
          message: 'empty node information',
        });
    }

    const searchNode = R.pick(['port', 'tags'], nodeData) as Partial<NodeModel>;
    let existingNode = {} as NodeModel[];

    if (searchNode.port) {
      existingNode = await nodeService.find(searchNode);
      Logger.debug({
        node: R.path([0, '_fields', 0, 'properties'], existingNode),
      }, 'the node to create already exists');
    }


    let result: any;
    if (!R.isEmpty(existingNode)) {
      // update an existing node
      const existingNodeUid = R.path([0, '_fields', 0, 'properties', 'uid'], existingNode) as unknown as string;
      result = await nodeService.update(
        { uid: existingNodeUid },
        nodeData,
      );
    } else {
      // just create
      result = await nodeService.create(nodeData);
    }

    return res.status(httpStatus.CREATED).json(R.pathOr({}, ['_fields', 0, 'properties'], result));
  } catch (error) {
    next(error);
  }
};

const listNodes = async (req: HttpRequest, res: HttpResponse, next: HttpNext): Promise<unknown> => {
  try {
    const filter = R.pipe(
      R.propOr({}, 'query'),
      R.pick(['name', 'port', 'tags']),
    )(req);

    const nodeList = await nodeService.find(filter);

    return res.status(httpStatus.OK).json(nodeList.map(R.path(['_fields', 0, 'properties'])));
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

    return res.status(httpStatus.OK).json(R.pathOr({}, [0, '_fields', 0, 'properties'], nodeList));
  } catch (error) {
    next(error);
  }
};

const getGraph = async (req: HttpRequest, res: HttpResponse, next: HttpNext): Promise<unknown> => {
  try {
    const result = await nodeService.getGraph();

    return res.status(httpStatus.OK).json(result);
  } catch (error) {
    next(error);
  }
};

export default {
  createNode,
  listNodes,
  getNodeUid,
  getGraph,
};
