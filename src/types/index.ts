// Represents a single service affected by a failure, retured by graph traversal
export interface AffectedService {
  affectedService: string;
  depth: number;
  pathTaken: string[];
}

// Respresents an incoming alert from kafka
export interface IncidentAlert {
  service: string;
  errorType: string;
  timestamp: string;
}

// Respresents the full blast radius result for a given service
export interface BlastRadiusResult {
  triggeredBy: string;
  affectedServices: AffectedService[];
  totalAffected: number;
  querriedAt: string;
}
