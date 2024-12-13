export interface FilterCondition {
  field: string;
  operator: string;
  value: string;
  valueType: 'static' | 'reference';
  reference?: {
    dataUnit: string;
    field: string;
  };
}

export interface ChildUnit {
  relationshipName: string;
  fields: string[];
  filters: FilterCondition[];
  filterLogic: string;
}

export interface DataUnit {
  name: string;
  developerName: string;
  description: string;
  object: string;
  fields: string[];
  filters: FilterCondition[];
  filterLogic: string;
  childUnits: ChildUnit[];
}

// Helper type for dependency graph (now based on filter references)
export interface DependencyNode {
  developerName: string;
  dependencies: string[];
  visited?: boolean;
  temp?: boolean;
}

// Error type for dependency validation
export class DependencyError extends Error {
  constructor(message: string, public cycle?: string[]) {
    super(message);
    this.name = 'DependencyError';
  }
} 