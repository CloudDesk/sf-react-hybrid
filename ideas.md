# SF React Hybrid Editor Project

## NEVER EVER REWRITE ANY COMPONENT FULLY WITHOUT SCREAMING OUT FOR CONFIRMATION

## Implemented Features

### Field Selection and Navigation
- Restored lookup field traversal functionality in field selection dropdown
- Added support for browsing through lookup relationships
- Included system fields like RecordType in field listings
- Removed field filtering to show all available fields
- Made Lookup(Object) text clickable for easier navigation
- Added data type display in field listings

### Advanced Mode Enhancements
- Implemented lookup traversal in Advanced Mode
- Updated Toolbox to use DataUnits instead of Models
- Refined field selection UI with:
  - Split view layout (70/30)
  - Search fields on left, selected fields on right
  - Independent scrolling for both sections
  - Subtle styling for field list
  - Custom scrollbar behavior
  - Data type indicators

### Filter Builder Improvements
- Implemented dual-mode value selection in conditions:
  - Static value input
  - Dynamic field reference selection
- Added ability to reference Primary Data Unit fields in filter conditions
- Support for referencing child unit fields in conditions
- Clean condition layout with field, operator, and value inputs
- Filter logic support for complex conditions
- Reference syntax using {!Primary.FieldName} format
- Visual feedback for field selection states

### CKEditor Integration
- Enhanced context menu to load from data sets in advanced mode
- Improved field selection experience in editor

### Child Units
- Added Child Units tab
- Implemented ability to add new child queries
- Support for relationship field selection

### UI/UX Improvements
- Sleeker condition labels and styling
- Improved data unit value retention
- Better visual hierarchy in field lists
- Enhanced scrolling behavior
- Modern styling with hover states and transitions
- Clear visual feedback for interactive elements

### Architecture Changes
- Created useFieldSelection hook for reusable field selection logic
- Modularized components for better maintainability
- Improved state management for field selection
- Better handling of click-away events

## Development Practices & Learnings

### Code Preservation
- Maintain awareness of working features during iterations
- Use targeted fixes instead of complete rewrites
- Track and preserve functional code across changes
- Validate existing functionality before making changes

### Change Management
- Prefer incremental updates over full rewrites
- Use surgical fixes for specific issues
- Keep track of working features in a checklist
- Document complex features as they're implemented

### Best Practices for Updates
- Review existing code before making changes
- Identify specific areas needing updates
- Use targeted edits for isolated issues
- Test changes against existing functionality
- Document working features and their dependencies

### Common Pitfalls to Avoid
- Complete rewrites when fixing single issues
- Losing working features during updates
- Insufficient testing of existing functionality
- Not tracking feature dependencies

## Planned/Future Features

### Data Unit Management
- Enhanced child unit relationship management
- Better visualization of relationships between units
- Improved field traversal across related objects

### Query Building
- More advanced filter conditions
- Enhanced SOQL preview functionality
- Better support for complex relationships

### UI/UX
- Further refinement of styling and layouts
- Enhanced accessibility
- More intuitive navigation
- Better visual feedback for actions

### Performance
- Optimization of field loading
- Better handling of large data sets
- Improved caching mechanisms

## Technical Notes

### State Management
- Using React hooks for field selection
- Maintaining consistent state across components
- Clear separation of concerns

### Component Architecture
- Modular design for reusability
- Clear component hierarchy
- Consistent styling patterns

### Data Flow
- Clear patterns for data propagation
- Consistent event handling
- Proper type safety throughout

### Best Practices
- TypeScript for type safety
- Modern React patterns
- Consistent code style
- Performance considerations
- Accessibility standards