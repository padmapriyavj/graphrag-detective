import { BlastRadiusResult, AffectedService } from "../types";
import { getDriver } from "../db/neo4j";
export class GraphService {
  async getBlastRadius(serviceName: string): Promise<BlastRadiusResult> {
    const session = getDriver().session();

    try {
      const result = await session.run(
        `MATCH path = (s:Service {name: $serviceName})-[:DEPENDS_ON*1..3]->(dep:Service)
         RETURN
           dep.name AS affectedService,
           length(path) AS depth,
           [node IN nodes(path) | node.name] AS pathTaken
         ORDER BY depth ASC`,
        { serviceName }
      );

      const affectedServices: AffectedService[] = result.records.map(
        (record) => ({
          affectedService: record.get("affectedService"),
          depth: record.get("depth").toNumber(),
          pathTaken: record.get("pathTaken"),
        })
      );
      return {
        triggeredBy: serviceName,
        affectedServices,
        totalAffected: affectedServices.length,
        querriedAt: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(
        `GraphService.getBlastRadius failed for "${serviceName}": ${error}`
      );
    } finally {
      await session.close();
    }
  }

  async serviceExists(serviceName: string): Promise<boolean> {
    const session = getDriver().session();
    try {
      const result = await session.run(
        `MATCH (s:Service {name: $serviceName}) RETURN s`,
        { serviceName }
      );
      return result.records.length > 0;
    } finally {
      await session.close();
    }
  }
}
