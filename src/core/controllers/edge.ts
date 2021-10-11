import httpStatus from 'http-status-codes';

import { HttpNext, HttpRequest, HttpResponse } from '../../types/http';

const createEdge = (req: HttpRequest, res: HttpResponse, next: HttpNext) => {
  return res.status(httpStatus.ACCEPTED).json({
    func: 'create-edge'
  });
};

export default {
  createEdge,
};

