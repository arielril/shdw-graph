import NodeController from './core/controllers/node';
import EdgeController from './core/controllers/edge';

import { HttpRouter } from './types/http';

export class Routes {
  private _router: HttpRouter;

  constructor(router: HttpRouter) {
    this._router = router;
  }

  registerRoutes(): void {
    // Node routes
    this._router
      .post('/v1/nodes', NodeController.createNode)
      .get('/v1/nodes', NodeController.listNodes)
      .get('/v1/nodes/:uid', NodeController.getNodeUid);

    // Edge routes
    this._router
      .post('/v1/edges', EdgeController.createEdge)
      .get('/v1/edges', EdgeController.listAllEdges)
      .get('/v1/edges/:uid', EdgeController.getEdgeByUid);

    this._router
      .get('/v1/graph', NodeController.getGraph);
  }

}
