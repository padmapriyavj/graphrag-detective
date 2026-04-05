import { parse } from "node:path";
import { getBlastRadius } from "./queries/traversal";
import { closeDriver } from "./db/neo4j";

interface AffectedService {
  affectedService: string;
  depth: number;
  pathTaken: string[];
}

function parseBlastRadius(records: any[]): AffectedService[] {
  return records.map((record) => ({
    affectedService: record.get("affectedService"),
    depth: record.get("depth").toNumber(),
    pathTaken: record.get("pathTaken"),
  }));
}

async function testTraversal(serviceName: string): Promise<void> {
  console.log(`\n Blast radius for: ${serviceName}`);
  console.log("─".repeat(40));

  const result = await getBlastRadius(serviceName);
  const affected = parseBlastRadius(result.records);

  if (affected.length === 0) {
    console.log("No downstream services found.");
    return;
  }

  affected.forEach((s) => {
    console.log(`  [${"->".repeat(s.depth)}] ${s.affectedService}`);
    console.log(`      path: ${s.pathTaken.join(" -> ")}`);
  });

  console.log(`\n  Total affected: ${affected.length} services`);
}

async function main(): Promise<void> {
  try {
    await testTraversal("order-service");
    await testTraversal("api-gateway");
  } finally {
    await closeDriver();
  }
}

main();
