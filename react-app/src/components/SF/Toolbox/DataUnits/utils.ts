import { DataUnit, DependencyNode, DependencyError, FilterCondition } from './types';

// Get all data units referenced in filters
const getFilterReferences = (filters: FilterCondition[]): string[] => {
  return filters
    .filter(filter => filter.valueType === 'reference' && filter.reference)
    .map(filter => filter.reference!.dataUnit);
};

// Convert DataUnits to dependency nodes for graph processing
export const createDependencyGraph = (dataUnits: DataUnit[]): DependencyNode[] => {
  return dataUnits.map(unit => ({
    developerName: unit.developerName,
    dependencies: [
      ...getFilterReferences(unit.filters),
      ...unit.childUnits.flatMap(child => getFilterReferences(child.filters))
    ],
    visited: false,
    temp: false
  }));
};

// Detect cycles in the dependency graph using DFS
export const detectCycles = (graph: DependencyNode[]): string[] | null => {
  const visit = (node: DependencyNode, path: string[] = []): string[] | null => {
    if (node.temp) {
      // Found a cycle
      return [...path, node.developerName];
    }
    if (node.visited) {
      return null;
    }

    node.temp = true;
    path.push(node.developerName);

    const dependencies = node.dependencies
      .map(dep => graph.find(n => n.developerName === dep))
      .filter((n): n is DependencyNode => n !== undefined);

    for (const dependency of dependencies) {
      const cycle = visit(dependency, [...path]);
      if (cycle) {
        return cycle;
      }
    }

    node.temp = false;
    node.visited = true;
    path.pop();
    return null;
  };

  for (const node of graph) {
    if (!node.visited) {
      const cycle = visit(node);
      if (cycle) {
        return cycle;
      }
    }
  }

  return null;
};

// Perform topological sort to get execution order
export const getExecutionOrder = (dataUnits: DataUnit[]): string[] => {
  const graph = createDependencyGraph(dataUnits);
  const cycle = detectCycles(graph);
  
  if (cycle) {
    throw new DependencyError('Circular dependency detected in filter references', cycle);
  }

  const order: string[] = [];
  const visited = new Set<string>();

  const visit = (node: DependencyNode) => {
    if (visited.has(node.developerName)) {
      return;
    }

    // Process dependencies first
    const dependencies = node.dependencies
      .map(dep => graph.find(n => n.developerName === dep))
      .filter((n): n is DependencyNode => n !== undefined);

    for (const dependency of dependencies) {
      visit(dependency);
    }

    visited.add(node.developerName);
    order.push(node.developerName);
  };

  // Visit all nodes
  for (const node of graph) {
    visit(node);
  }

  return order;
};

// Validate filter references exist and are valid
export const validateDataUnitReferences = (dataUnits: DataUnit[]): void => {
  const availableUnits = new Set(dataUnits.map(unit => unit.developerName));

  const validateFilters = (filters: FilterCondition[], sourceUnit: string) => {
    for (const filter of filters) {
      if (filter.valueType === 'reference' && filter.reference) {
        const { dataUnit: referencedUnit, field: referencedField } = filter.reference;
        
        if (!availableUnits.has(referencedUnit)) {
          throw new DependencyError(
            `Invalid filter reference in ${sourceUnit}: Data unit ${referencedUnit} does not exist`
          );
        }

        // Validate referenced field exists in the referenced unit
        const targetUnit = dataUnits.find(u => u.developerName === referencedUnit);
        if (targetUnit && !targetUnit.fields.includes(referencedField)) {
          throw new DependencyError(
            `Invalid field reference in ${sourceUnit}'s filter: Field ${referencedField} does not exist in ${referencedUnit}`
          );
        }
      }
    }
  };

  // Validate main filters and child unit filters
  for (const unit of dataUnits) {
    validateFilters(unit.filters, unit.developerName);
    for (const childUnit of unit.childUnits) {
      validateFilters(childUnit.filters, `${unit.developerName}.${childUnit.relationshipName}`);
    }
  }
}; 