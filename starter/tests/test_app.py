import importlib

import pytest

import app as app_module


@pytest.fixture
def client():
    app_module.app.config.update(TESTING=True)
    app_module.CURRENT['puzzle'] = None
    app_module.CURRENT['solution'] = None
    with app_module.app.test_client() as client:
        yield client
    app_module.CURRENT['puzzle'] = None
    app_module.CURRENT['solution'] = None


def test_index_renders_template(client):
    response = client.get('/')

    assert response.status_code == 200
    assert b'Sudoku Game' in response.data


def test_new_game_returns_puzzle_and_stores_solution(client):
    response = client.get('/new?clues=35')

    assert response.status_code == 200
    payload = response.get_json()
    assert isinstance(payload['puzzle'], list)
    assert len(payload['puzzle']) == app_module.sudoku_logic.SIZE
    assert all(len(row) == app_module.sudoku_logic.SIZE for row in payload['puzzle'])
    assert app_module.CURRENT['solution'] is not None
    assert app_module.CURRENT['puzzle'] is not None


def test_check_solution_returns_error_when_no_game_started(client):
    app_module.CURRENT['solution'] = None
    app_module.CURRENT['puzzle'] = None

    response = client.post('/check', json={'board': [[0] * 9 for _ in range(9)]})

    assert response.status_code == 400
    assert response.get_json()['error'] == 'No game in progress'


def test_check_solution_reports_incorrect_cells(client):
    _, solution = app_module.sudoku_logic.generate_puzzle(35)
    app_module.CURRENT['solution'] = solution
    board = [row[:] for row in solution]
    board[0][0] = board[0][0] + 1 if board[0][0] < 9 else 1

    response = client.post('/check', json={'board': board})

    assert response.status_code == 200
    payload = response.get_json()
    assert payload['incorrect'] == [[0, 0]]
