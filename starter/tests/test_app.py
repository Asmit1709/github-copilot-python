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


def test_index_includes_leaderboard_container(client):
    response = client.get('/')

    assert response.status_code == 200
    assert b'id="leaderboard"' in response.data
    assert b'Leaderboard' in response.data


def test_index_includes_completion_modal(client):
    response = client.get('/')

    assert response.status_code == 200
    assert b'id="win-modal"' in response.data
    assert b'Save Score' in response.data


def test_new_game_returns_puzzle_and_stores_solution(client):
    response = client.get('/new?clues=35')

    assert response.status_code == 200
    payload = response.get_json()
    assert isinstance(payload['puzzle'], list)
    assert len(payload['puzzle']) == app_module.sudoku_logic.SIZE
    assert all(len(row) == app_module.sudoku_logic.SIZE for row in payload['puzzle'])
    assert app_module.CURRENT['solution'] is not None
    assert app_module.CURRENT['puzzle'] is not None


@pytest.mark.parametrize(
    ('difficulty', 'expected_clues'),
    [('easy', 40), ('medium', 35), ('hard', 30)]
)
def test_new_game_supports_difficulty_levels(client, difficulty, expected_clues):
    response = client.get(f'/new?difficulty={difficulty}')

    assert response.status_code == 200
    payload = response.get_json()
    clue_count = sum(1 for row in payload['puzzle'] for value in row if value != 0)
    assert clue_count == expected_clues


def test_check_solution_returns_error_when_no_game_started(client):
    app_module.CURRENT['solution'] = None
    app_module.CURRENT['puzzle'] = None

    response = client.post('/check', json={'board': [[0] * 9 for _ in range(9)]})

    assert response.status_code == 400
    assert response.get_json()['error'] == 'No game in progress'


def test_hint_endpoint_returns_new_empty_cells_on_repeated_calls(client):
    response = client.get('/new?difficulty=easy')
    assert response.status_code == 200

    first_hint = client.get('/hint')
    second_hint = client.get('/hint')

    assert first_hint.status_code == 200
    assert second_hint.status_code == 200
    assert first_hint.get_json()['row'] != second_hint.get_json()['row'] or first_hint.get_json()['col'] != second_hint.get_json()['col']


def test_check_solution_reports_incorrect_cells(client):
    _, solution = app_module.sudoku_logic.generate_puzzle(35)
    app_module.CURRENT['solution'] = solution
    board = [row[:] for row in solution]
    board[0][0] = board[0][0] + 1 if board[0][0] < 9 else 1

    response = client.post('/check', json={'board': board})

    assert response.status_code == 200
    payload = response.get_json()
    assert payload['incorrect'] == [[0, 0]]
