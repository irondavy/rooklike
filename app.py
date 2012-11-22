from flask import Flask, request, redirect, url_for, render_template
from flask.ext.sqlalchemy import SQLAlchemy
from flask_heroku import Heroku
import os
from random import randint


app = Flask(__name__)
heroku = Heroku(app)
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'postgresql://localhost/rooklike')
db = SQLAlchemy(app)


class Board(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(30))
    template = db.Column(db.String(1000))

    def __init__(self, title, template):
        self.title = title
        self.template = template


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


def format_template(template):
    ''' Takes a unicode template from the database and returns a template
        (represented as a list of strings) for use by convert_template() '''

    template = template.encode('ascii', 'ignore').replace('\r', '').split('\n')
    return template


def convert_template(template):
    ''' Takes a template and returns a board (represented as a dictionary) '''

    pieces = {
        'k': 'king',
        'q': 'queen',
        'r': 'rook',
        'b': 'bishop',
        'n': 'knight',
        'p': 'pawn'
    }

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
def list():
    boards = []
    boards_query = Board.query.all()
    boards_query.reverse()
    for board in boards_query:
        boards.append(dict(id=board.id, title=board.title, template=board.template))
    return render_template('list.jhtml', boards=boards)


@app.route('/new')
def new():
    return render_template('new.jhtml')


@app.route('/add', methods=['POST'])
def add():
    title = 'Untitled'
    if request.form['title']:
        title = request.form['title']
    board = Board(title, request.form['template'])
    db.session.add(board)
    db.session.commit()
    return redirect(url_for('list'))


@app.route('/edit/<int:id>')
def edit(id):
    board_query = Board.query.get(id)
    title = board_query.title.upper()
    template = board_query.template
    return render_template('edit.jhtml', id=id, title=title, template=template)


@app.route('/delete', methods=['POST'])
def delete():
    id = request.form['id']
    board = Board.query.get(id)
    db.session.delete(board)
    db.session.commit()
    return redirect(url_for('list'))


@app.route('/update', methods=['POST'])
def update():
    id = request.form['id']
    board = Board.query.get(id)
    board.title = request.form['title']
    board.template = request.form['template']
    db.session.commit()
    return redirect(url_for('play_id', id=id))


@app.route('/play/<int:id>')
def play_id(id):
    board_query = Board.query.get(id)
    title = board_query.title.upper()
    board = convert_template(format_template(board_query.template))
    return render_template('board.jhtml', id=id, title=title, board=board)


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)



