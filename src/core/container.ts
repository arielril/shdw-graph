import { getConnection } from '../infrastructure/database/neo4j';
import { Node } from '../infrastructure/repository/node';
import { Neo4jConfig } from '../types/infrastructure';

const createNodeRepository = (dbConfig: Neo4jConfig) => {
  const conn = getConnection(dbConfig);
  return new Node({ neoDriver: conn });
};

export const getInfraContainer = () => {
  const dbConfig: Neo4jConfig = {
    host: '',
    username: '',
    password: '',
  };


  return {
    nodeRepository: createNodeRepository(dbConfig),
    // edgeRepository: createEdgeRepository(dbConfig),
  };
};
