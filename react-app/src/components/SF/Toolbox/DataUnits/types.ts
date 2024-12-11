export interface FilterCondition {
  field: string;
  operator: string;
  value: string;
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
  isPrimary: boolean;
  childUnits: ChildUnit[];
} 