import neo4j, { Driver, Session } from "neo4j-driver";
import dotenv from "dotenv";
import { getSourceMapsSupport } from "node:module";

dotenv.config();

const URI = process.env.NEO4J_URI as string;
const USER = process.env.NEO4J_USER as string;
const PASDWORD = process.env.NEO4J_PASSWORD as string;

if (!URI || !USER || !PASDWORD) {
  throw new Error("Missing Neo4j configuration in .env file");
}

let driver: Driver;

export function getDriver(): Driver {
  if (!driver) {
    driver = neo4j.driver(URI, neo4j.auth.basic(USER, PASDWORD));
  }
  return driver;
}

export function getSession(): Session {
  return getDriver().session();
}

export async function closeDriver(): Promise<void> {
  if (driver) {
    await driver.close();
  }
}
