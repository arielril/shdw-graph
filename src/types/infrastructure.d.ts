import { Edge as EdgeModel, Node as NodeModel } from './model';

export type Neo4jConfig = {
  host: string;
  username: string;
  password: string;
};

export type Neo4jDriver = import('neo4j-driver').Driver;

export interface INodeRepository {
  create(node: Partial<NodeModel>): Promise<NodeModel>;
  find(node: Partial<NodeModel>): Promise<NodeModel[]>;
  update(filter: Partial<NodeModel>, data: Partial<NodeModel>): Promise<NodeModel>;
}

export interface IEdgeRepository {
  createRelationship(
    startNode: Pick<NodeModel, 'uid' | 'name'>,
    endNode: Partial<NodeModel>,
    edgeData: Partial<EdgeModel>,
  ): Promise<unknown>;

  findRelationships(
    startNode: Pick<NodeModel, 'uid' | 'name'>,
    edgeFilter: Partial<EdgeModel>,
  ): Promise<unknown>;

  find(edge: Partial<EdgeModel>): Promise<unknown>;
}
