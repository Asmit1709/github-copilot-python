import app as app_module


def test_generate_puzzle_returns_puzzle_and_solution():
    puzzle, solution = app_module.sudoku_logic.generate_puzzle(35)

    assert isinstance(puzzle, list)
    assert isinstance(solution, list)
    assert len(puzzle) == app_module.sudoku_logic.SIZE
    assert len(solution) == app_module.sudoku_logic.SIZE
    assert all(len(row) == app_module.sudoku_logic.SIZE for row in puzzle)
    assert all(len(row) == app_module.sudoku_logic.SIZE for row in solution)

    assert puzzle != solution


def test_create_empty_board_has_expected_shape():
    board = app_module.sudoku_logic.create_empty_board()

    assert board == [[0] * app_module.sudoku_logic.SIZE for _ in range(app_module.sudoku_logic.SIZE)]


def test_is_safe_rejects_conflicts_in_row_column_and_box():
    board = app_module.sudoku_logic.create_empty_board()

    assert app_module.sudoku_logic.is_safe(board, 0, 0, 1) is True
    board[0][1] = 1
    assert app_module.sudoku_logic.is_safe(board, 0, 0, 1) is False
