import { Kafka, Producer, Admin } from "kafkajs";
import { IncidentAlert } from "../types";
import dotenv from "dotenv";

dotenv.config();

const kafka = new Kafka({
  clientId: "graphrag-producer",
  brokers: [process.env.KAFKA_BROKER as string],
  logLevel: 1,
});

async function ensureTopicExists(admin: Admin): Promise<void> {
  const topics = await admin.listTopics();
  if (!topics.includes("incident-alerts")) {
    await admin.createTopics({
      topics: [
        { topic: "incident-alerts", numPartitions: 1, replicationFactor: 1 },
      ],
    });
    console.log('Topic "incident-alerts" created');
  } else {
    console.log('Topic "incident-alerts" already exists');
  }
}

async function publishAlert(
  producer: Producer,
  alert: IncidentAlert
): Promise<void> {
  await producer.send({
    topic: "incident-alerts",
    messages: [
      {
        key: alert.service,
        value: JSON.stringify(alert),
      },
    ],
  });
  console.log(`Alert published:`, alert);
}

async function main(): Promise<void> {
  const admin: Admin = kafka.admin();
  const producer: Producer = kafka.producer();

  try {
    // Step 1: ensure topic exists
    await admin.connect();
    await ensureTopicExists(admin);
    await admin.disconnect();

    // Step 2: connect producer once and send all alerts
    await producer.connect();
    console.log("Producer connected to Kafka");

    const alerts: IncidentAlert[] = [
      {
        service: "order-service",
        errorType: "timeout",
        timestamp: new Date().toISOString(),
      },
      {
        service: "payment-service",
        errorType: "connection-refused",
        timestamp: new Date().toISOString(),
      },
    ];

    for (const alert of alerts) {
      await publishAlert(producer, alert);
    }
  } finally {
    await producer.disconnect();
  }
}

main().catch(console.error);
