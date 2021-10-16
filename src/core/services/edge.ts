import * as R from 'ramda';

import { getInfraContainer } from '../container';
import { Logger } from '../../util/logger';

import { CreateEdgeRequest } from '../../types/http';
import { IEdgeRepository, INodeRepository } from '../../types/infrastructure';
import { Node as NodeModel, Edge as EdgeModel } from '../../types/model';

export class Edge {
  private _edgeRepository: IEdgeRepository;
  private _nodeRepository: INodeRepository;

  constructor() {
    const container = getInfraContainer();
    this._edgeRepository = container.edgeRepository;
    this._nodeRepository = container.nodeRepository;
  }

  async createRelationships(relationship: CreateEdgeRequest): Promise<any> {
    const startNodeList = await this._nodeRepository.find(
      R.prop('startNode', relationship),
    );

    const startNode = R.pathOr({}, [0, '_fields', 0, 'properties'], startNodeList) as unknown as NodeModel;

    if (R.isEmpty(startNode)) {
      throw new Error('inexistent start node');
    }

    const destinations = R.propOr([], 'destinations', relationship) as CreateEdgeRequest['destinations'];

    return Promise.all(
      destinations.map((dest) => {
        if (R.isEmpty(dest.node)) {
          throw new Error('destination node is empty');
        }

        return this._edgeRepository.createRelationship(
          startNode,
          dest.node,
          dest.edgeProperties,
        )
          .catch((err) => {
            if (err) {
              Logger.warn({
                error: err,
                startNode,
                endNode: dest.node,
                edge: dest.edgeProperties,
              }, 'failed to relate nodes');
            }
          });
      }),
    );
  }

  async find(edge: Partial<EdgeModel>): Promise<any> {
    return this._edgeRepository.find(edge);
  }
}
