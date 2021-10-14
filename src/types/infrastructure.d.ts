import { Node as NodeModel } from './model';

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

