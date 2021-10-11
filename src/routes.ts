import NodeController from './core/controllers/node';
import EdgeController from './core/controllers/edge';

import { HttpRouter } from './types/http';

export class Routes {
  private _router: HttpRouter;

  constructor(router: HttpRouter) {
    this._router = router;
  }

  registerRoutes() {
    // Node routes
    this._router
      .post('/v1/nodes', NodeController.createNode)
      .get('/v1/nodes', NodeController.listNodes)
      .get('/v1/nodes/:uid', NodeController.getNodeUid);

    // Edge routes
    this._router
      .post('/v1/edges', EdgeController.createEdge);
  }

}
