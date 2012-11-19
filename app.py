import os
from flask import Flask
from flask import render_template
from random import randint


app = Flask(__name__)


pieces = {
    'k': 'king',
    'q': 'queen',
    'r': 'rook',
    'b': 'bishop',
    'n': 'knight',
    'p': 'pawn'
}


def get_templates(filename):
    ''' Takes a file and returns a list of templates (represented as lists of strings) '''

    templates = {}

    file = open(filename)

    i = 1
    templates[i] = []
    for line in file:
        if line == '\n':
            i = i + 1
            templates[i] = []
        else:
            line = line.rstrip()
            templates[i].append(line)

    file.close()

    return templates


def convert_template(template):
    ''' Takes a template and returns a board (represented as a dictionary) '''

    squares = []
    
    y = 1
    for line in template:
        line = line.rstrip()
        x = 1
        for tile in line:
            
            filled = 'filled'
            if tile == '#':
                filled = 'empty'

            piece = pieces.get(str.lower(tile), None)
            
            color = 'white'
            if str.islower(tile):
                color = 'black'

            squares.append({'x': x, 'y': y, 'filled':filled, 'piece':piece, 'color':color})

            x = x + 1

        y = y + 1

    return { 'squares': squares, 'width': x - 1, 'height': y - 1 }


@app.route('/')
def play():
    templates = get_templates('static/boards.txt')
    board_id = randint(1, len(templates))
    board_id = 1
    board = convert_template(templates[board_id])
    return render_template('board.jhtml', board=board)


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)



