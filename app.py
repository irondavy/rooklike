import os
from flask import Flask
from flask import render_template

app = Flask(__name__)

def get_board(filename):
    board = []

    template = open(filename)
    
    y = 1
    for line in template:
        line = line.rstrip()
        x = 1
        for tile in line:
            
            filled = 'filled'
            if tile == 'X':
                filled = 'empty'

            if str.lower(tile) == 'k':
                piece = 'king'
            elif str.lower(tile) == 'q':
                piece = 'queen'
            elif str.lower(tile) == 'r':
                piece = 'rook'
            elif str.lower(tile) == 'b':
                piece = 'bishop'
            elif str.lower(tile) == 'n':
                piece = 'knight'
            elif str.lower(tile) == 'p':
                piece = 'pawn'
            else:
                piece = None
            
            color = 'black'
            if str.islower(tile):
                color = 'white'

            board.append({'x': x, 'y': y, 'filled':filled, 'piece':piece, 'color':color})

            x = x + 1

        y = y + 1

    template.close()

    return board

board = get_board('boards.txt')

@app.route('/')
def play():
    return render_template('board.jhtml', board=board)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)

