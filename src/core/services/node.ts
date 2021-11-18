import * as R from 'ramda';

import { getInfraContainer } from '../container';

import { INodeRepository } from '../../types/infrastructure';
import { Node as NodeModel } from '../../types/model';
import { Logger } from '../../util/logger';


export class Node {
  private _nodeRepository: INodeRepository;

  constructor() {
    const container = getInfraContainer();

    this._nodeRepository = container.nodeRepository;
  }

  create(node: Partial<NodeModel>) {
    return this._nodeRepository.create(node);
  }

  find(node: Partial<NodeModel>) {
    return this._nodeRepository.find(node);
  }

  update(filter: Partial<NodeModel>, data: Partial<NodeModel>) {
    return this._nodeRepository.update(filter, data);
  }

  async getGraph(): Promise<unknown> {
    try {
      const dbResult = await this._nodeRepository.getAll();

      const nodes = new Set();
      const edges = new Set();
      // @ts-ignore
      for (const rc of dbResult.records) {
        const startNode = R.path(['_fields', 0, 'properties'], rc) as unknown as any;
        const edge = R.path(['_fields', 1, 'properties'], rc) as unknown as any;
        const endNode = R.path(['_fields', 2, 'properties'], rc) as unknown as any;

        nodes.add(startNode);
        nodes.add(endNode);
        edges.add({
          source: R.prop('uid', startNode),
          target: R.prop('uid', endNode),
          // @ts-ignore
          label: `lb=${edge.label||0}; wg=${edge.weight}`,
        });
      }

      // @ts-ignore
      return { nodes: Array.from(nodes), edges: Array.from(edges) };
    } catch (error) {
      Logger.error({ error }, 'failed to get and format graph from database');
      throw error;
    }
  }
}
