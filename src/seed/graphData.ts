export const services: string[] = [
  "api-gateway",
  "auth-service",
  "order-service",
  "payment-service",
  "payment-db",
  "inventory-service",
  "inventory-db",
];

export const dependencies: { from: string; to: string }[] = [
  {
    from: "api-gateway",
    to: "auth-service",
  },
  {
    from: "api-gateway",
    to: "order-service",
  },
  {
    from: "order-service",
    to: "payment-service",
  },
  {
    from: "payment-service",
    to: "payment-db",
  },
  {
    from: "order-service",
    to: "inventory-service",
  },
  {
    from: "inventory-service",
    to: "inventory-db",
  },
];
