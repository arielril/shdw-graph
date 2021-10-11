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
}
