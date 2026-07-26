from flask import Flask, render_template, jsonify, request
import sudoku_logic

app = Flask(__name__)

DIFFICULTY_CLUES = {
    'easy': 40,
    'medium': 35,
    'hard': 30,
}


def resolve_clues(request_args):
    difficulty = request_args.get('difficulty', '').strip().lower()
    if difficulty in DIFFICULTY_CLUES:
        return DIFFICULTY_CLUES[difficulty]
    return int(request_args.get('clues', 35))


# Keep a simple in-memory store for current puzzle and solution
CURRENT = {
    'puzzle': None,
    'solution': None,
    'hinted_cells': []
}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/new')
def new_game():
    clues = resolve_clues(request.args)
    puzzle, solution = sudoku_logic.generate_puzzle(clues)
    CURRENT['puzzle'] = puzzle
    CURRENT['solution'] = solution
    CURRENT['hinted_cells'] = []
    return jsonify({'puzzle': puzzle})

@app.route('/check', methods=['POST'])
def check_solution():
    data = request.json
    board = data.get('board')
    solution = CURRENT.get('solution')
    if solution is None:
        return jsonify({'error': 'No game in progress'}), 400
    incorrect = []
    for i in range(sudoku_logic.SIZE):
        for j in range(sudoku_logic.SIZE):
            if board[i][j] != solution[i][j]:
                incorrect.append([i, j])
    return jsonify({'incorrect': incorrect})


@app.route('/hint')
def get_hint():
    solution = CURRENT.get('solution')
    puzzle = CURRENT.get('puzzle')
    if solution is None or puzzle is None:
        return jsonify({'error': 'No game in progress'}), 400

    hinted_cells = CURRENT.get('hinted_cells', [])
    for row in range(sudoku_logic.SIZE):
        for col in range(sudoku_logic.SIZE):
            if puzzle[row][col] != 0:
                continue
            if [row, col] in hinted_cells:
                continue
            CURRENT['hinted_cells'] = hinted_cells + [[row, col]]
            return jsonify({'row': row, 'col': col, 'value': solution[row][col]})

    return jsonify({'error': 'No empty cells left'}), 400

if __name__ == '__main__':
    app.run(debug=True)