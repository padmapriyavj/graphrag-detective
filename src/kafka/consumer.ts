import { Kafka, Consumer, EachMessagePayload } from "kafkajs";
import { GraphService } from "../services/GraphService";
import { getDriver, closeDriver } from "../db/neo4j";
import { IncidentAlert } from "../types";
import dotenv from "dotenv";

dotenv.config();

const kafka = new Kafka({
  clientId: "graphrag-consumer",
  brokers: [process.env.KAFKA_BROKER as string],
  logLevel: 1,
});

const graphService = new GraphService();

async function handleAlert(alert: IncidentAlert): Promise<void> {
  console.log(`\n Incident received:`);
  console.log(`   Service  : ${alert.service}`);
  console.log(`   Error    : ${alert.errorType}`);
  console.log(`   Time     : ${alert.timestamp}`);

  const exists = await graphService.serviceExists(alert.service);
  if (!exists) {
    console.warn(
      ` Unknown service "${alert.service}" — skipping blast radius query`
    );
    return;
  }

  const result = await graphService.getBlastRadius(alert.service);

  console.log(`\nBlast radius for "${result.triggeredBy}":`);
  console.log(`   Total affected: ${result.totalAffected} services`);
  console.log(`   Queried at    : ${result.querriedAt}`);
  console.log(`   Affected services:`);

  result.affectedServices.forEach((s) => {
    console.log(`     [${"→".repeat(s.depth)}] ${s.affectedService}`);
    console.log(`          path: ${s.pathTaken.join(" → ")}`);
  });
}

async function startConsumer(): Promise<void> {
  const consumer: Consumer = kafka.consumer({
    groupId: "graphrag-incident-group",
  });

  try {
    // Verify Neo4j is reachable before starting
    console.log("Verifying Neo4j connection...");
    const session = getDriver().session();
    await session.run("RETURN 1");
    await session.close();
    console.log("Neo4j connection verified");

    await consumer.connect();
    console.log("Consumer connected to Kafka");

    await consumer.subscribe({
      topic: "incident-alerts",
      fromBeginning: false,
    });
    console.log("Listening for incident alerts...\n");

    await consumer.run({
      eachMessage: async ({ message }: EachMessagePayload) => {
        if (!message.value) return;
        const alert: IncidentAlert = JSON.parse(message.value.toString());
        await handleAlert(alert);
      },
    });
  } catch (error) {
    console.error("Consumer error:", error);
    await consumer.disconnect();
    await closeDriver();
  }
}

startConsumer();
