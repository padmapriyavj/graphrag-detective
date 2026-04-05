import { getSession, closeDriver } from "../db/neo4j";
import { services, dependencies } from "./graphData";

async function seedGraph(): Promise<void> {
  const session = getSession();

  try {
    console.log("Seeding graph data into Neo4j...");

    //Create all service nodes
    await session.executeWrite(async(tx)=>{
        for (const name of services) {
            await tx.run(
            `MERGE (s:Service {name: $name}) 
            ON CREATE SET s.createdAt = timestamp()`,
            { name }
            );
        }
    });
    console.log(`Created ${services.length} service nodes`);

    //Create all dependency relationships
    await session.executeWrite(async(tx)=>{
        for(const dep of dependencies){
            await tx.run(
                `MATCH (a:Service {name: $from}),
                (b:Service {name: $to})
                MERGE (a)-[:DEPENDS_ON]->(b)`,
                { from: dep.from, to: dep.to }
            );
        }
    });
    console.log(`Created ${dependencies.length} DEPENDS_ON relationships`);
    console.log("Graph seeding completed successfully")
  } catch (error) {
    console.error('seeding failed', error);;
  }finally{
    await session.close();
    await closeDriver();
  }
}

seedGraph();
