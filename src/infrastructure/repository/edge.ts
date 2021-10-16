import { v4 as uuid } from 'uuid';
import * as R from 'ramda';

import { Logger } from '../../util/logger';

import { IEdgeRepository, Neo4jDriver } from '../../types/infrastructure';
import { Node as NodeModel, Edge as EdgeModel } from '../../types/model';

export class Edge implements IEdgeRepository {
  private _driver: Neo4jDriver;

  constructor({ neoDriver }: any) {
    if (!neoDriver) {
      throw new Error('failed to connect to database');
    }

    this._driver = neoDriver;
  }

  private setDefaultValues = R.mergeDeepRight({
    label: '--',
    weight: 0.0,
    tags: [],
  });

  async createRelationship(
    startNode: Pick<NodeModel, 'uid' | 'name'>,
    endNode: Partial<NodeModel>,
    edgeData: Partial<EdgeModel>,
  ): Promise<any> {
    const edgeUid = uuid();
    const session = this._driver.session();

    try {
      const __edgeData__ = R.pipe(
        R.pick(['label', 'weight', 'tags']),
        this.setDefaultValues,
        R.assoc('uid', edgeUid),
      )(edgeData);

      const query = `
        match 
          (nStart: Node),
          (nEnd: Node)
        where 
          (nStart.uid = $nStartUid or nStart.name = $nStartName) 
          and (nEnd.uid = $nEndUid or nEnd.name = $nEndName)
        create
          (nStart)-[e: EDGE {
            ${Object.keys(__edgeData__).map(k => `${k}: $${k}`).join(',')}
          }]->(nEnd)
        return nStart, nEnd, e;
      `;

      const res = await session.run(
        query,
        R.mergeDeepLeft(
          __edgeData__,
          {
            nStartUid: startNode.uid || '',
            nStartName: startNode.name || '',
            nEndUid: endNode.uid || '',
            nEndName: endNode.name || '',
          },
        ),
      );

      return res.records;
    } catch (error) {
      Logger.error({ error }, 'failed to create relationship');
      throw error;
    } finally {
      session.close();
    }
  }

  findRelationships(startNode: Pick<NodeModel, 'uid' | 'name'>, edgeFilter: Partial<EdgeModel>): Promise<unknown> {
    throw new Error('Method not implemented.');
  }

  async find(edge: Partial<EdgeModel>): Promise<unknown> {
    const session = this._driver.session()
    
    try {
      const __filter__ = R.pick(['uid', 'name', 'weight'], edge);
      const where = Object.keys(__filter__)
        .map(key => `${key}: $${key}`)
        .join(',');

      const res = await session.run(
        `
          match ()-[e:EDGE { ${where} }]->()
          return e
        `,
        __filter__,
      );

      return res.records; 
    } catch (error) {
      Logger.error({ error, edge }, 'failed to find edge')
      throw error;
    } finally {
      session.close();
    }
  }
}
