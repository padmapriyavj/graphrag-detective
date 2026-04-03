import { getSession, closeDriver } from "./db/neo4j";

async function testConnection(): Promise<void> {
  const session = getSession();
  try {
    console.log("Connecting to Neo4j AuraDB...");

    const result = await session.run(
      'RETURN "GraphRAG Detective is connected!" AS message'
    );

    const message = result.records[0].get("message");
    console.log("Success", message);
  } catch (error) {
    console.log("Connection failed", error);
  } finally {
    await session.close();
    await closeDriver();
  }
}

testConnection();
