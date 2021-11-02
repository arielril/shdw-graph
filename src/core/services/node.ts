import { getInfraContainer } from '../container';

import { INodeRepository } from '../../types/infrastructure';
import { Node as NodeModel } from '../../types/model';


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

  getGraph(): Promise<unknown> {
    return this._nodeRepository.getAll({});
  }
}
