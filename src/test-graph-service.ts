import { GraphService } from './services/GraphService';
import { closeDriver } from './db/neo4j';

async function main(): Promise<void> {
  const graphService = new GraphService();

  try {
    // Test 1: serviceExists guard
    console.log('Testing serviceExists()...');
    const exists = await graphService.serviceExists('order-service');
    const doesNotExist = await graphService.serviceExists('fake-service');
    console.log(`  order-service exists: ${exists}`);
    console.log(`  fake-service exists: ${doesNotExist}`);

    // Test 2: blast radius for order-service
    console.log('\nTesting getBlastRadius() for order-service...');
    const result1 = await graphService.getBlastRadius('order-service');
    console.log(`  triggeredBy: ${result1.triggeredBy}`);
    console.log(`  totalAffected: ${result1.totalAffected}`);
    console.log(`  querriedAt: ${result1.querriedAt}`);
    console.log('  affectedServices:');
    result1.affectedServices.forEach((s) => {
      console.log(`    [${'→'.repeat(s.depth)}] ${s.affectedService} — ${s.pathTaken.join(' → ')}`);
    });

    // Test 3: blast radius for api-gateway
    console.log('\nTesting getBlastRadius() for api-gateway...');
    const result2 = await graphService.getBlastRadius('api-gateway');
    console.log(`  triggeredBy: ${result2.triggeredBy}`);
    console.log(`  totalAffected: ${result2.totalAffected}`);
    console.log('  affectedServices:');
    result2.affectedServices.forEach((s) => {
      console.log(`    [${'→'.repeat(s.depth)}] ${s.affectedService} — ${s.pathTaken.join(' → ')}`);
    });

  } catch (error) {
    console.error('Smoke test failed:', error);
  } finally {
    await closeDriver();
  }
}

main();