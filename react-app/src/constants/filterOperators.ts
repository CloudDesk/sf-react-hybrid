export interface FilterOperator {
  value: string;
  label: string;
  template?: string;
}

export const OPERATORS: FilterOperator[] = [
  { value: '=', label: 'Equals' },
  { value: '!=', label: 'Not Equals' },
  { value: '<', label: 'Less Than' },
  { value: '<=', label: 'Less or Equal' },
  { value: '>', label: 'Greater Than' },
  { value: '>=', label: 'Greater or Equal' },
  { value: 'LIKE', label: 'Contains' },
  { value: 'LIKE', label: 'Starts With', template: 'value%' },
  { value: 'LIKE', label: 'Ends With', template: '%value' },
  { value: 'IN', label: 'In' },
  { value: 'NOT IN', label: 'Not In' },
  { value: 'INCLUDES', label: 'Includes' },
  { value: 'EXCLUDES', label: 'Excludes' },
]; 