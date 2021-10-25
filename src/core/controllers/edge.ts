import httpStatus from 'http-status-codes';
import * as R from 'ramda';

import { Edge } from '../services/edge';

import {
  CreateEdgeRequest,
  HttpNext,
  HttpRequest,
  HttpResponse,
} from '../../types/http';

const edgeService = new Edge();

const createEdge = async (req: HttpRequest, res: HttpResponse, next: HttpNext): Promise<unknown> => {
  try {
    const edgeData = R.pipe(
      R.propOr({}, 'body'),
      R.pick(['startNode', 'destinations']),
    )(req) as CreateEdgeRequest;

    if (R.isEmpty(edgeData)) {
      return res.status(httpStatus.BAD_REQUEST)
        .json({
          message: 'empty edge information',
        });
    }

    const edgeRes = await edgeService.createRelationships(edgeData);

    const resStartNode = R.pathOr(
      {}, 
      [
        0, 0, 
        '_fields',
        R.path([0, 0, '_fieldLookup', 'nStart'], edgeRes) as number,
        'properties',
      ],
      edgeRes,
    );

    const destinations = edgeRes.map(
      (edgeResult: any) => {
        return {
          node: R.pathOr(
            {},
            [
              0,
              '_fields',
              R.path([0, '_fieldLookup', 'nEnd'], edgeResult) as number,
              'properties',
            ],
            edgeResult,
          ),
          edge: R.pathOr(
            {},
            [
              0,
              '_fields',
              R.path([0, '_fieldLookup', 'e'], edgeResult) as number,
              'properties'
            ],
            edgeResult,
          ),
        };
      }
    );


    return res.status(httpStatus.CREATED)
      .json({
        startNode: resStartNode,
        destinations,
      });
  } catch (error) {
    next(error);
  }
};

const getEdgeByUid = async (req: HttpRequest, res: HttpResponse, next: HttpNext) => {
  try {
    const edgeUid = R.path(['params', 'uid'], req) as string;

    if (!edgeUid) {
      return res.status(httpStatus.BAD_REQUEST)
        .json({
          message: 'invalid edge uid',
        });
    }

    const edgeData = await edgeService.find({
      uid: edgeUid,
    });

    return res.status(httpStatus.OK)
      .json(R.pathOr({}, [0, '_fields', 0, 'properties'], edgeData));
  } catch (error) {
    next(error);
  } 
}

const listAllEdges = async (req: HttpRequest, res: HttpResponse, next: HttpNext) => {
  try {
    const edgeList = await edgeService.find({});

    return res.status(httpStatus.OK)
      .json(edgeList.map(R.path(['_fields', 0, 'properties'])));
  } catch (error) {
    next(error);
  }
}

export default {
  createEdge,
  getEdgeByUid,
  listAllEdges,
};

