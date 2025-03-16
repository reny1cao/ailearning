# Page Sections

This directory contains section components that make up larger page components.

## Purpose

Extracting page sections into separate components helps:
- Reduce complexity of page components
- Improve code readability and maintainability  
- Make sections potentially reusable across pages
- Enable parallel development on different sections
- Support better testing isolation

## Organization

Sections are organized by the page they belong to:

```
sections/
├── home/              # Home page sections
├── courses/           # Courses page sections
├── dashboard/         # Dashboard page sections
└── learn/             # Learning page sections
```

## Naming Convention

Section components should follow the naming pattern:

`[Page][SectionName]`

Examples:
- `HomeMainSection.tsx`  
- `CoursesFilterSection.tsx`
- `DashboardStatsSection.tsx`

## Guidelines

1. Each section should focus on rendering a specific part of a page
2. Keep sections focused on presentation, with minimal business logic
3. Pass data and callbacks through props, minimizing state within sections
4. Document props with TypeScript interfaces
5. Consider using React.memo for performance optimization when appropriate 