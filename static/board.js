var DEBUG = false;

$(document).ready(function() {

    drawBoard();

    if (DEBUG) {
        debug(true);
    }

    $('tile').on('click',
        'piece.unlocked',
        function() {
            var self = $(this);
            if (self.parent().hasClass('selected')) {
                deselectPiece(self);
            } else {
                deselectPiece($('.selected piece'));
                selectPiece(self);
            }
        });

    playWhite();

});

function drawBoard() {
    TILE_SIZE = 50;
    BOARD_WIDTH = $('board').attr('width');
    BOARD_HEIGHT = $('board').attr('height');
    if (BOARD_WIDTH * TILE_SIZE > $(window).width() || BOARD_HEIGHT * TILE_SIZE > $(window).height()) {
        var extra_width = BOARD_WIDTH * TILE_SIZE - $(window).width();
        var extra_height = BOARD_HEIGHT * TILE_SIZE - $(window).height();
        if (extra_width > extra_height) {
            TILE_SIZE = Math.round(($(window).width() - 200) / BOARD_WIDTH);
        } else {
            TILE_SIZE = Math.round(($(window).height() - 200) / BOARD_HEIGHT);
        }
    }

    $('tile')
        .width(TILE_SIZE)
        .height(TILE_SIZE);

    $('piece')
        .width(TILE_SIZE)
        .height(TILE_SIZE)
        .css({
            'font-size': Math.round(TILE_SIZE * .8),
            'line-height': TILE_SIZE + 'px'
        });

    $('board')
        .width(BOARD_WIDTH * TILE_SIZE)
        .height(BOARD_HEIGHT * TILE_SIZE)
        .css({
            'margin-left': -(BOARD_WIDTH * TILE_SIZE / 2),
            'margin-top': -(BOARD_HEIGHT * TILE_SIZE / 2) + 40,
            'display': 'block'
        });

    $('#board_title')
        .css({
            'position': 'absolute',
            'top': $('board').offset().top - $('#board_title').height() - 20
        })
        .show();

    $('piece').each(function() {
        var self = $(this);
        self.jrumble({ speed: 150 });
        if (self.attr('color') == 'black') {
            self.removeClass('unlocked')
                .addClass('locked')
                .addClass('unplayed');
        }
    });
}

function selectPiece(piece) {
    piece.trigger('startRumble');
    piece.parent('tile').addClass('selected');

    console.log('Selected ' + piece.attr('type') + ' at ' + piece.parent().attr('x') + ',' + piece.parent().attr('y'));

    checkSquares(piece, false);

    $('.valid, .valid piece').click(function() {
        if ($(this).is('tile')) {
            var tile = $(this);
        } else {
            var tile = $(this).parent();
        }
        deselectPiece(piece);
        movePiece(piece, tile);
    });
}

function deselectPiece(piece) {
    piece.trigger('stopRumble');
    piece.parent('tile').removeClass('selected');
    $('.valid, .valid piece').unbind();
    $('.valid').removeClass('valid');
    piece
        .removeClass('locked')
        .addClass('unlocked');
}

function movePiece(piece, tile, callback) {
    old_x = piece.parent().attr('x');
    old_y = piece.parent().attr('y');
    new_x = tile.attr('x');
    new_y = tile.attr('y');

    log_type = piece.attr('type').charAt(0).toUpperCase() + piece.attr('type').slice(1)
    console.log(log_type + ' at ' + old_x + ',' + old_y + ' moving to ' + new_x + ',' + new_y);

    piece.css('position', 'relative');

    var animation_speed = 500;
    if (DEBUG) { animation_speed = 1500; } 
    piece.animate({
        'left': '+='+(TILE_SIZE * (new_x - old_x)),
        'top': '+='+(TILE_SIZE * (new_y - old_y))
    }, animation_speed, function() {
        if (tile.children('piece').length) {
            tile.children('piece').remove();
        }
        piece
            .appendTo(tile)
            .css({
                'position': 'relative',
                'left': 0,
                'top': 0
            })
            .removeClass('unlocked')
            .addClass('locked');
        checkTurn();
        if (callback) {
            callback();
        }
    });
}

function Piece(type,color, x, y) {
    this.type = type;
    this.color = color;
    this.x = x;
    this.y = y;
}

function checkSquares(piece, is_enemy) {
    var type = piece.attr('type');
    var color = piece.attr('color');
    var x = parseInt(piece.parent().attr('x'));
    var y = parseInt(piece.parent().attr('y'));
    piece_class = new Piece(type, color, x, y)

    if (piece_class.type == 'queen') {
        checkDirections(piece_class, is_enemy, ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']);
    } else if (piece_class.type == 'bishop') {
        checkDirections(piece_class, is_enemy, ['NE', 'SE', 'SW', 'NW']);
    } else if (piece_class.type == 'rook') {
        checkDirections(piece_class, is_enemy, ['N', 'E', 'S', 'W']);
    }
}

function checkDirections(piece_class, is_enemy, directions) {
    for (var i = 0; i < directions.length; i++) {
        if (directions[i] == 'N')  { checkN(piece_class, is_enemy) }
        if (directions[i] == 'NE') { checkNE(piece_class, is_enemy) }
        if (directions[i] == 'E')  { checkE(piece_class, is_enemy) }
        if (directions[i] == 'SE') { checkSE(piece_class, is_enemy) }
        if (directions[i] == 'S')  { checkS(piece_class, is_enemy) }
        if (directions[i] == 'SW') { checkSW(piece_class, is_enemy) }
        if (directions[i] == 'W')  { checkW(piece_class, is_enemy) }
        if (directions[i] == 'NW') { checkNW(piece_class, is_enemy) }
    }
}

function checkN(piece_class, is_enemy) {
    for (var x = piece_class.x, y = piece_class.y - 1; y > 0; y--) {
        if (!checkTile(piece_class, is_enemy, x, y)) { break; }
    }
}

function checkNE(piece_class, is_enemy) {
    for (var x = piece_class.x + 1, y = piece_class.y - 1; x <= BOARD_WIDTH, y > 0; x++, y--) {
        if (!checkTile(piece_class, is_enemy, x, y)) { break; }
    }
}

function checkE(piece_class, is_enemy) {
    for (var x = piece_class.x + 1, y = piece_class.y; x <= BOARD_WIDTH; x++) {
        if (!checkTile(piece_class, is_enemy, x, y)) { break; }
    }
}

function checkSE(piece_class, is_enemy) {
    for (var x = piece_class.x + 1, y = piece_class.y + 1; x <= BOARD_WIDTH, y <= BOARD_HEIGHT; x++, y++) {
        if (!checkTile(piece_class, is_enemy, x, y)) { break; }
    }
}

function checkS(piece_class, is_enemy) {
    for (var x = piece_class.x, y = piece_class.y + 1; y <= BOARD_HEIGHT; y++) {
        if (!checkTile(piece_class, is_enemy, x, y)) { break; }
    }
}

function checkSW(piece_class, is_enemy) {
    for (var x = piece_class.x - 1, y = piece_class.y + 1; x > 0, y <= BOARD_HEIGHT; x--, y++) {
        if (!checkTile(piece_class, is_enemy, x, y)) { break; }
    }
}

function checkW(piece_class, is_enemy) {
    for (var x = piece_class.x - 1, y = piece_class.y; x > 0; x--) {
        if (!checkTile(piece_class, is_enemy, x, y)) { break; }
    }
}

function checkNW(piece_class, is_enemy) {
    for (var x = piece_class.x - 1, y = piece_class.y - 1; x > 0, y > 0; x--, y--) {
        if (!checkTile(piece_class, is_enemy, x, y)) { break; }
    }
}

function checkTile(piece_class, is_enemy, x, y) {
    check_class = 'valid';
    if (is_enemy) { check_class = 'dangerous'; }
    var tile = $('tile[x='+x+'][y='+y+']');
    if (tile.attr('filled') == 'filled') {
        if (tile.children('piece').length) {
            if (tile.children('piece').attr('color') == piece_class.color) {
                return false;
            } else {
                tile.addClass(check_class);
                tile.children('piece')
                    .removeClass('unlocked')
                    .addClass('locked');
                return false;
            }
        }
        tile.addClass(check_class);
        return true;
    } else {
        return false;
    }
}

function checkTurn() {
    if ($('piece').filter('[color=white]').length == 0) { // There are no uncaptured white tiles
        declareWinner('black');
    } else if ($('piece').filter('[color=black]').length == 0) { // There are no uncapture black tiles
        declareWinner('white');
    } else if ($('piece.unlocked').filter('[color=white]').length == 0 && // There are no unlocked white tiles
               $('piece.played').filter('[color=black]').length == 0) { // There are unplayed black tiles
        playBlack();
    } else if ($('piece.unplayed').filter('[color=black]').length == 0) { // There are no unplayed black tiles
        playWhite();
    }
}

function resetRound() {
    $('piece').filter('[color=black]')
        .removeClass('played')
        .addClass('unplayed');
    $('piece').filter('[color=white]')
        .removeClass('locked')
        .addClass('unlocked');
}

function playWhite() {
    console.log('### Turn: White ###');
    $('body').removeClass().addClass('turn_white');
}

function playBlack() {
    console.log('### Turn: Black ###');
    $('body').removeClass().addClass('turn_black');
    playNextBlackPiece();
}

function playNextBlackPiece() {
    var piece = $('piece.unplayed').filter('[color=black]').first();
    if (piece.length) {
        checkSquares(piece, false);

        $('piece').filter('[color=white]').each(function() {
            checkSquares($(this), true);
        });

        // If there are no valid pieces, stay in position
        valid_tiles = $('.valid');
        if (valid_tiles.length == 0) {
            console.log('Can\'t move');
            new_tile = piece.parent();
        } else {

            // If there are pieces to capture, capture a random one
            piece_tiles = $('.valid').has('piece[color=white]');
            if (piece_tiles.length) {
                console.log('Capturing a piece.');
                new_tile = getRandomTile(piece_tiles);
            } else {

                // If there are safe tiles, go to a random one
                safe_tiles = $('.valid').not('.dangerous');
                if (safe_tiles.length) {
                    console.log('Going to a safe tile.')
                    new_tile = getRandomTile(safe_tiles);
                } else {

                    // Pick a random dangerous tile
                    dangerous_tiles = $('.valid.dangerous');
                    console.log('Going to a dangerous tile.')
                    new_tile = getRandomTile(dangerous_tiles);

                }
            }
        }
        
        piece
            .removeClass('unplayed')
            .addClass('played');
        movePiece(piece, new_tile, function() {
            $('.dangerous').removeClass('dangerous');
            $('.valid').removeClass('valid');
            playNextBlackPiece();
        });
    } else {
        resetRound();
    }
}

function getRandomTile(tiles) {
    id = Math.floor(Math.random()*tiles.length);
    return $(tiles[id]);
}

function getValue(piece) {
    type = piece.attr('type');
    console.log('Found a ' + type);
    if (type == 'queen') {
        return 3;
    } else if (type == 'rook') {
        return 5;
    } else if (type == 'queen') {
        return 9;
    }
}

function declareWinner(color) {
    if (color == 'white') {
        console.log('White wins: all black tiles have been captured');
        $('#game_over_win').show();
    } else {
        console.log('Black wins: all white tiles have been captured');
        $('#game_over_lose').show();
    }
    $('#game_over_dialog')
        .fadeIn('fast')
        .click(function() {
            $(this).fadeOut('fast');
            showReplay();
        });
    $(document).keyup(escCloseWinnerDialog);
    $('piece').addClass('locked');
}

function escCloseWinnerDialog(e) {
    if (e.keyCode == 27) {
        $('.dialog').fadeOut('fast');
        showReplay();
    }
    $(document).unbind('keyup', escCloseWinnerDialog);
}

function showReplay() {
    $('#replay a')
        .click(function() {
            location.reload();
        })
        .show()
        .animate({
            top: '+=37'
        });
    $(document).unbind('keyup', escCloseWinnerDialog);
}

function debug(bool) {
    DEBUG = bool;
    if (DEBUG) {
        $('board').addClass('debug');
        $('tile[filled=filled]').each(function() {
            $(this).prepend('<span class=\'tile_xy\'>' + $(this).attr('x') + (',') + $(this).attr('y') + '</span>')
        });
    } else {
        $('board').removeClass('debug');
    }
}

