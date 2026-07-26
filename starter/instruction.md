# GitHub Copilot Project Instructions

## Project Overview
This project is a Flask-based Sudoku game. The goal is to refactor the legacy code into a clean, modular, and maintainable application while implementing additional gameplay features.

## Coding Standards

- Follow PEP 8 guidelines.
- Use Python type hints whenever appropriate.
- Keep functions small and focused on a single responsibility.
- Avoid duplicated code.
- Use meaningful variable and function names.
- Add comments only when they improve readability.
- Handle errors gracefully.

## Project Structure

- Separate business logic from UI.
- Keep Sudoku generation, solving, validation, and utilities in separate modules.
- Keep frontend JavaScript modular.
- Avoid large files whenever possible.

## Flask

- Follow Flask best practices.
- Keep routes simple.
- Move reusable logic outside route handlers.

## Frontend

- Use vanilla JavaScript.
- Write responsive CSS.
- Support desktop and mobile layouts.
- Support light and dark mode.

## Sudoku Requirements

- Generated puzzles must have exactly one unique solution.
- Support Easy, Medium, and Hard difficulty.
- Prefilled cells must remain locked.
- Highlight invalid moves.
- Provide Hint and Check functionality.
- Track elapsed time.
- Save Top 10 scores using browser localStorage.

## Testing

- Use pytest.
- Keep tests isolated and repeatable.
- Ensure refactoring does not break existing functionality.

## Git

- Make small, meaningful commits.
- Commit after every completed feature.
