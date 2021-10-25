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
    startNode: Pick<NodeModel, 'uid' | 'name' | 'port'>,
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
          (nStart: Node { uid: $n_uid }),
          (nEnd: Node { uid: $m_uid })
        merge
          (nStart)-[e: EDGE { 
            ${Object.keys(__edgeData__).map(k => `${k}: $${k}`).join(',')} 
          }]->(nEnd)
        return nStart, nEnd, e
      `;

      const res = await session.run(
        query,
        R.mergeDeepLeft(
          __edgeData__,
          {
            n_uid: startNode.uid || '',
            m_uid: endNode.uid || '',
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
      const __filter__ = R.pick(['uid', 'name', 'label', 'weight'], edge);
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

  async update(filter: Partial<EdgeModel>, data: Partial<EdgeModel>): Promise<unknown> {
    const session = this._driver.session();

    try {
      const setQueryKeys = Object.keys(R.omit(['uid'], data))
        .map(k => `e.${k} = $${k}`)
        .join(',');

      let setQuery = '';
      if (setQueryKeys) {
        setQuery = `set ${setQueryKeys}`;
      }

      const filterQuery = Object.keys(filter)
        .map(k => `${k}: $${k}`)
        .join(',');

      const res = await session.run(
        `
          match ()-[e: EDGE { ${filterQuery} }]-()
          ${setQuery}
          return e
        `,
        R.mergeDeepLeft(filter, data),
      );

      return res.records[0];
    } catch (error) {
      Logger.error({ error, edge: data }, 'failed to update edge data');
      throw error;
    } finally {
      session.close();
    }
  }
}
