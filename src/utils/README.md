# Utilities

This directory contains reusable utility functions used throughout the application.

## Purpose

The utilities in this folder are designed to be:
- Pure functions with no side effects
- Focused on a single responsibility
- Easily testable
- Reusable across the application

## Structure

- `format.ts` - Formatting utilities (dates, numbers, text, etc.)
- `validation.ts` - Form validation and data validation functions
- `analytics.ts` - Analytics-related helper functions
- `storage.ts` - Local storage and session storage utilities
- `api.ts` - API-related helper functions

## Usage Guidelines

1. Keep utility functions simple and pure where possible
2. Document each function with JSDoc comments
3. Group related utilities in the same file
4. Export all utilities from the barrel index.ts file
5. Write tests for all utility functions 