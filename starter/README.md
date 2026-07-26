# Sudoku Game Refactor

## Overview

This project is a Flask-based Sudoku game that was refactored into a cleaner, more maintainable structure while adding a small set of user-facing features. The app includes a playable Sudoku board, difficulty selection, a timer, hints, live validation, a local leaderboard, dark mode, and a responsive layout.

## Features

- Flask backend for serving the app and managing the current game state
- Difficulty selection for Easy, Medium, and Hard puzzles
- In-game timer
- Hint system for revealing a correct value
- Live validation for editable cells
- Top 10 leaderboard stored in the browser with localStorage
- Dark mode toggle
- Responsive UI for desktop, tablet, and mobile screens
- Pytest-based test suite for core behavior

## Technologies Used

- Python
- Flask
- HTML
- CSS
- Vanilla JavaScript
- pytest

## Project Structure

- [app.py](app.py) — Flask entry point and route handlers
- [sudoku_logic.py](sudoku_logic.py) — Sudoku generation and validation logic
- [templates/index.html](templates/index.html) — main page template
- [static/main.js](static/main.js) — frontend game behavior
- [static/styles.css](static/styles.css) — page styling and responsive layout
- [tests](tests) — pytest test suite

## Installation

1. Clone the repository.
2. Create and activate a virtual environment if desired.
3. Install the dependencies:

```bash
python -m pip install -r requirements.txt
```

## Running the Application

Start the Flask app from the project root:

```bash
python app.py
```

Then open the app in your browser at:

```text
http://127.0.0.1:5000/
```

## Running Tests

Run the test suite with:

```bash
pytest
```

## Screenshots

Screenshots can be added to the [Screenshots](Screenshots) folder as the project evolves.

- Desktop view: placeholder
- Mobile view: placeholder
- Dark mode: placeholder

## GitHub Copilot Usage

GitHub Copilot was used throughout the project to assist with:

- refactoring the Flask application structure
- implementing frontend features incrementally
- adding and maintaining pytest tests
- improving the UI and project organization

## Future Improvements

Possible next steps include:

- adding a more complete game state reset flow
- improving accessibility for keyboard and screen reader users
- expanding test coverage for the frontend interactions
- refining the leaderboard experience

## License

This project is currently provided as-is for educational and personal use. If you plan to publish or distribute it publicly, consider adding an explicit license file.
