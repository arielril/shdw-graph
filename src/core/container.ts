import { getConnection } from '../infrastructure/database/neo4j';
import { Node } from '../infrastructure/repository/node';
import { Edge } from '../infrastructure/repository/edge';
import env from '../util/env';

import { Neo4jConfig } from '../types/infrastructure';

const createNodeRepository = (dbConfig: Neo4jConfig) => {
  const conn = getConnection(dbConfig);
  return new Node({ neoDriver: conn });
};

const createEdgeRepository = (dbConfig: Neo4jConfig) => {
  const conn = getConnection(dbConfig);
  return new Edge({ neoDriver: conn });
};

export const getInfraContainer = () => {
  const dbConfig: Neo4jConfig = {
    host: env.NEO4J_HOST,
    username: env.NEO4J_USERNAME,
    password: env.NEO4J_PASSWORD,
  };

  return {
    nodeRepository: createNodeRepository(dbConfig),
    edgeRepository: createEdgeRepository(dbConfig),
  };
};
