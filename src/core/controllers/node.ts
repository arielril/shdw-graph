import httpStatus from 'http-status-codes';

import { Node } from '../services/node';

import { HttpNext, HttpRequest, HttpResponse } from '../../types/http';
import { Node as NodeModel } from '../../types/model';

const createNode = async (req: HttpRequest, res: HttpResponse, next: HttpNext) => {
  const nodeService = new Node();

  await nodeService.create({
    name: 'SSH',
    port: 22,
    service: 'SSH',
    tags: ['network', 'ssl'],
  } as Partial<NodeModel>);


  return res.status(httpStatus.ACCEPTED).json({
    func: 'create-node'
  });
};

const listNodes = (req: HttpRequest, res: HttpResponse, next: HttpNext) => {
  return res.status(httpStatus.ACCEPTED).json({
    func: 'list-nodes'
  });
};

const getNodeUid = (req: HttpRequest, res: HttpResponse, next: HttpNext) => {
  return res.status(httpStatus.ACCEPTED).json({
    func: 'get-node-uid'
  });
};

export default {
  createNode,
  listNodes,
  getNodeUid,
};
