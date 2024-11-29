import React, { createContext, useContext, useState, useCallback } from 'react';

export interface SimpleCondition {
  field1: {
    object: string;
    field: string;
    label: string;
  };
  operator: string;
  field2: {
    object: string;
    field: string;
    label: string;
  } | {
    value: string;
    type: string;
  };
}

export interface ComplexCondition {
  conditions: SimpleCondition[];
  operator: 'AND' | 'OR';
}

export interface ConditionEntry {
  id: string;
  label: string;
  description?: string;
  condition: SimpleCondition | ComplexCondition;
  reference: string;
}

interface Loop {
  id: string;
  collection: string;
  reference: string;
}

interface TemplateContextType {
  conditions: ConditionEntry[];
  loops: Loop[];
  addCondition: (condition: Omit<ConditionEntry, 'id' | 'reference'>) => string;
  addLoop: (loop: Omit<Loop, 'id' | 'reference'>) => string;
  removeCondition: (id: string) => void;
  removeLoop: (id: string) => void;
  getConditionById: (id: string) => ConditionEntry | undefined;
  getLoopById: (id: string) => Loop | undefined;
}

const TemplateContext = createContext<TemplateContextType | undefined>(undefined);

export const useTemplate = () => {
  const context = useContext(TemplateContext);
  if (!context) {
    throw new Error('useTemplate must be used within a TemplateProvider');
  }
  return context;
};

// Mock conditions
const mockConditions: ConditionEntry[] = [
  {
    id: 'condition_1',
    label: 'Account Revenue Check',
    description: 'Check if Account Annual Revenue is greater than $1M',
    reference: '$condition1',
    condition: {
      field1: {
        object: 'Account',
        field: 'AnnualRevenue',
        label: 'Annual Revenue'
      },
      operator: '>',
      field2: {
        value: '1000000',
        type: 'number'
      }
    }
  },
  {
    id: 'condition_2',
    label: 'Complex Opportunity Evaluation',
    description: 'Check if Opportunity is both high value and closing soon, or has strategic account',
    reference: '$condition2',
    condition: {
      conditions: [
        {
          field1: {
            object: 'Opportunity',
            field: 'Amount',
            label: 'Amount'
          },
          operator: '>',
          field2: {
            value: '500000',
            type: 'number'
          }
        },
        {
          field1: {
            object: 'Opportunity',
            field: 'CloseDate',
            label: 'Close Date'
          },
          operator: '<=',
          field2: {
            value: '30',
            type: 'days'
          }
        },
        {
          field1: {
            object: 'Account',
            field: 'Type',
            label: 'Account Type'
          },
          operator: '==',
          field2: {
            value: 'Strategic',
            type: 'string'
          }
        }
      ],
      operator: 'OR'
    }
  }
];

export const TemplateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [conditions, setConditions] = useState<ConditionEntry[]>(mockConditions);
  const [loops, setLoops] = useState<Loop[]>([]);

  const addCondition = useCallback((condition: Omit<ConditionEntry, 'id' | 'reference'>) => {
    const id = `condition_${Date.now()}`;
    const reference = `$condition${conditions.length + 1}`;
    const newCondition = { ...condition, id, reference };
    
    setConditions(prev => [...prev, newCondition]);
    return reference;
  }, [conditions]);

  const addLoop = useCallback((loop: Omit<Loop, 'id' | 'reference'>) => {
    const id = `loop_${Date.now()}`;
    const reference = `$loop${loops.length + 1}`;
    const newLoop = { ...loop, id, reference };
    
    setLoops(prev => [...prev, newLoop]);
    return reference;
  }, [loops]);

  const removeCondition = useCallback((id: string) => {
    setConditions(prev => prev.filter(c => c.id !== id));
  }, []);

  const removeLoop = useCallback((id: string) => {
    setLoops(prev => prev.filter(l => l.id !== id));
  }, []);

  const getConditionById = useCallback((id: string) => {
    return conditions.find(c => c.id === id);
  }, [conditions]);

  const getLoopById = useCallback((id: string) => {
    return loops.find(l => l.id === id);
  }, [loops]);

  const value = {
    conditions,
    loops,
    addCondition,
    addLoop,
    removeCondition,
    removeLoop,
    getConditionById,
    getLoopById,
  };

  return (
    <TemplateContext.Provider value={value}>
      {children}
    </TemplateContext.Provider>
  );
}; 