import { QueryResult } from "neo4j-driver";
import { getSession } from "../db/neo4j";

export async function getBlastRadius(
  serviceName: string
): Promise<QueryResult> {
  const session = getSession();
  try {
    const result = await session.run(
      `MATCH path = (s:Service {name: $serviceName})-[:DEPENDS_ON*1..3]->(dep:Service)
    RETURN
      dep.name AS affectedService,
      length(path) AS depth,
      [node IN nodes(path) | node.name] AS pathTaken
    ORDER BY depth ASC`,
      {
        serviceName,
      }
    );
    return result;
  } finally {
    await session.close();
  }
}
