from flask.ext.sqlalchemy import SQLAlchemy
from flask import Flask, request, g, redirect, url_for, render_template
from contextlib import closing
import os
from random import randint


app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ['DATABASE_URL']
db = SQLAlchemy(app)


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
    cur = g.db.execute('select title, template from boards order by id asc')
    boards = []
    i = 0
    for row in cur.fetchall():
        boards.append(dict(id=i, title=row[0], template=row[1]))
        i = i + 1
    boards.reverse()
    return render_template('list.jhtml', boards=boards)


@app.route('/new')
def new():
    return render_template('new.jhtml')


@app.route('/add', methods=['POST'])
def add():
    g.db.execute('insert into boards (title, template) values (?, ?)',
                 [request.form['title'], request.form['template']])
    g.db.commit()
    return redirect(url_for('list'))


@app.route('/play')
def play():
    templates = get_templates('static/boards.txt')
    board_id = randint(1, len(templates))
    board_id = 1
    board = convert_template(templates[board_id])
    return render_template('board.jhtml', board=board)


@app.route('/play/<int:id>')
def play_id(id):
    cur = g.db.execute('select title, template from boards order by id asc')
    boards = [dict(title=row[0], template=row[1]) for row in cur.fetchall()]
    title = boards[id]['title'].upper()
    template = boards[id]['template']
    board = convert_template(format_template(template))
    return render_template('board.jhtml', title=title, board=board)


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)



