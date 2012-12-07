from flask import Flask, request, redirect, url_for, render_template, session
from flask.ext.sqlalchemy import SQLAlchemy
from flask_heroku import Heroku
from flask.ext.login import LoginManager, current_user, login_required, login_user, logout_user
from flask_oauth import OAuth
import os
from random import randint


app = Flask(__name__)
heroku = Heroku(app)
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'postgresql://localhost/rooklike')
db = SQLAlchemy(app)


class Board(db.Model):
    bid = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(40))
    uid = db.Column(db.Integer, db.ForeignKey('user.uid'))
    template = db.Column(db.String(1000))

    def __init__(self, title, uid, template):
        self.title = title
        self.uid = uid
        self.template = template


class User(db.Model):
    uid = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(30))
    token = db.Column(db.String(50))
    secret = db.Column(db.String(50))
    boards = db.relationship('Board', backref='user', lazy='dynamic')

    def __init__(self, name, token, secret):
        self.name = name
        self.token = token
        self.secret = secret

    def get_id(self):
        return self.uid

    def is_authenticated(self):
        return True

    def is_active(self):
        return True

    def is_anonymous(self):
        return False


app.secret_key = 'rj$96*0)hp_(@=4kgrtj39d@9-psqrd(_d%b!%*(#8@ds5ioao'

login_manager = LoginManager()
login_manager.login_view = 'login'

@login_manager.user_loader
def load_user(uid):
    return User.query.get(uid)

login_manager.setup_app(app)


oauth = OAuth()
twitter = oauth.remote_app('twitter',
    base_url='https://api.twitter.com/1/',
    request_token_url='https://api.twitter.com/oauth/request_token',
    access_token_url='https://api.twitter.com/oauth/access_token',
    authorize_url='https://api.twitter.com/oauth/authenticate',
    consumer_key='lZfre6Yks74x6M4RQWfxNA',
    consumer_secret='mRltdabpGOsCciuaSSU5kqXg46f6roP1YsXbOFaM'
)


@twitter.tokengetter
def get_twitter_token(token=None):
    if current_user.is_authenticated():
        return (current_user.token, current_user.secret)
    else:
        return None


@app.route('/oauth-authorized')
@twitter.authorized_handler
def oauth_authorized(resp):
    next_url = request.args.get('next') or url_for('index')
    if resp is None:
        return redirect(url_for('index'))

    session['twitter_token'] = (
        resp['oauth_token'],
        resp['oauth_token_secret']
    )
    session['twitter_user'] = resp['screen_name']

    this_account = User.query.filter_by(name = resp['screen_name']).first()
    if this_account is None:
        new_account = User(resp['screen_name'], resp['oauth_token'], resp['oauth_token_secret'])
        db.session.add(new_account)
        db.session.commit()
        login_user(new_account, remember=True)
    else:
        login_user(this_account, remember=True)

    return redirect(next_url)


@app.route('/')
def index():
    return redirect(url_for('boards'))


@app.route('/boards')
def boards():
    boards = []
    boards_query = Board.query.order_by(Board.bid.desc()).all()
    for board in boards_query:
        boards.append(dict(bid=board.bid, title=board.title, template=board.template))
    return render_template('list.jhtml', boards=boards)


@app.route('/login')
def login():
    if current_user.is_authenticated():
        return redirect(url_for('index'))
    return twitter.authorize(callback=url_for('oauth_authorized',
        next=request.args.get('next') or request.referrer or None))


@app.route('/logout')
def logout():
    logout_user()
    return redirect(url_for("index"))


@app.route('/new')
@login_required
def new():
    return render_template('new.jhtml')


@app.route('/add', methods=['POST'])
@login_required
def add():
    uid = current_user.get_id()
    title = request.form.get('title', 'Untitled')[:40]
    template = request.form['template']
    if validate_template(format_template(template)):
        board = Board(title, uid, template)
        db.session.add(board)
        db.session.commit()
        board_query = Board.query.filter_by(uid = uid).order_by(Board.bid.desc()).first()
        return redirect(url_for('play', bid=board_query.bid))
    else:
        return redirect(url_for('boards'))


@app.route('/edit/<int:bid>')
@login_required
def edit(bid):
    board_query = Board.query.get(bid)
    title = board_query.title.upper()
    template = board_query.template
    viewer_uid = current_user.get_id()
    board_uid = board_query.uid
    if viewer_uid == board_uid:
        return render_template('edit.jhtml', bid=bid, title=title, template=template)
    else:
        return redirect(url_for('play', bid=bid))


@app.route('/fork/<int:bid>')
@login_required
def fork(bid):
    board_query = Board.query.get(bid)
    title = board_query.title.upper()
    if title[-7:] == 'REMIXED':
        title = title[:-5] + 'REMIXED'
    else:
        title = title + ' REMIXED'
    template = board_query.template
    viewer_uid = current_user.get_id()
    board_uid = board_query.uid
    if viewer_uid == board_uid:
        return render_template('edit.jhtml', bid=bid, title=title, template=template, fork=True)
    else:
        return redirect(url_for('play', bid=bid))


@app.route('/delete', methods=['POST'])
@login_required
def delete():
    bid = request.form['bid']
    board = Board.query.get(bid)
    db.session.delete(board)
    db.session.commit()
    return redirect(url_for('boards'))


@app.route('/update', methods=['POST'])
@login_required
def update():
    title = request.form['title'][:40]
    template = request.form['template']
    if validate_template(format_template(template)):
        if request.form.get('fork', False):
            uid = current_user.get_id()
            board = Board(title, uid, template)
            db.session.add(board)
            db.session.commit()
            board_query = Board.query.filter_by(uid = uid).order_by(Board.bid.desc()).first()
            return redirect(url_for('play', bid=board_query.bid))
        else:
            bid = request.form['bid']
            board = Board.query.get(bid)
            board.title = title
            board.template = template
            db.session.commit()
            return redirect(url_for('play', bid=bid))
    return redirect(url_for('play', bid=bid))


@app.route('/play/<int:bid>')
def play(bid):
    board_query = Board.query.get(bid)
    title = board_query.title.upper()
    template = convert_template(format_template(board_query.template))
    viewer_uid = current_user.get_id()
    board_uid = board_query.uid
    show_edit = True
    if viewer_uid and viewer_uid != board_uid:
        show_edit = False
    if template:
        return render_template('board.jhtml', show_edit=show_edit, bid=bid, title=title, template=template)
    else:
        return redirect(url_for('boards'))


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


def validate_template(template):
    ''' Takes a formated template and returns True if the template is valid '''

    valid_chars = '.#NnBbRrQqKk'
    white_chars = 'NBRQK'
    black_chars = 'nbrqk'
    errors = {
        'invalid_chars': False,
        'invalid_grid': False,
        'no_white': True,
        'no_black': True
    }
    line_lengths = []

    i = 0
    for line in template:
        line = line.rstrip()
        for tile in line:
            if (tile in valid_chars) == False:
                errors['invalid_chars'] = True
            elif tile in white_chars:
                errors['no_white'] = False;
            elif tile in black_chars:
                errors['no_black'] = False;
            i = i + 1
        line_lengths.append(i)
        i = 0

    i = 0
    for length in line_lengths:
        if i > 0 and length != line_lengths[i-1]:
            errors['invalid_grid'] = True
        i = i + 1

    if True in errors.values():
        return False
    return True


def convert_template(template):
    ''' Takes a template and returns a board (represented as a dictionary) '''

    pieces = {
        'q': 'queen',
        'r': 'rook',
        'b': 'bishop',
        'n': 'knight',
        'k': 'king'
        # 'p': 'pawn'
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


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)



