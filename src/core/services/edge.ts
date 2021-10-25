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
      destinations.map(async (dest) => {
        if (R.isEmpty(dest.node)) {
          throw new Error('destination node is empty');
        }

        const destNodeUid = R.path(['node', 'uid'], dest) as string;
        try {
          const destNodeData = await this._nodeRepository
            .find({
              uid: destNodeUid,
            });

            // if the destination node already exists
            if (!R.isEmpty(destNodeData)) {
              // update it's data
              try {
                // update destination with the latest data
                await this._nodeRepository.update(
                  { uid: destNodeUid },
                  dest.node,
                );  
              } catch (error) {
                Logger.error({ error, node_uid: destNodeUid }, 'failed to update node with latest data');
                throw error;
              }
            }
        } catch (error) {
          Logger.error({ error, node_uid: destNodeUid }, 'failed to find destination node');
          throw error;
        }

        try {
          const filter = R.reject(R.isNil, {
            uid: R.path(['edgeProperties', 'uid'], dest) as string,
            label: R.path(['edgeProperties', 'label'], dest) as string,
          });

          if (!R.isEmpty(filter)) {
            const edgeData = await this._edgeRepository.find(filter);

            if (!R.isEmpty(edgeData)) {
              const edgeUid = R.path([0, '_fields', 0, 'properties', 'uid'], edgeData) as string;
              try {
                Logger.info({ edge_uid: edgeUid }, 'updating edge data');
                await this._edgeRepository.update(
                  { 
                    uid: edgeUid,
                    label: R.path(['edgeProperties', 'label'], dest) as string,
                  },
                  dest.edgeProperties,
                );
              } catch (error) {
                Logger.error({ error, edge_uid: edgeUid }, 'failed to update edge with latest data')
                throw error;
              }
              return {};
            }
          }
        } catch (error) {
          Logger.error({ error }, 'failed to find edge')
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
