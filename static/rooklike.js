$(document).ready(function() {

    drawBoard(50);

    $(document).on('click',
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

function drawBoard(size) {
    TILE_SIZE = size;
    BOARD_WIDTH = $('board').attr('width');
    BOARD_HEIGHT = $('board').attr('height');

    $('board')
        .width(BOARD_WIDTH * TILE_SIZE)
        .height(BOARD_HEIGHT * TILE_SIZE)
        .css({
            'margin-left': -(BOARD_WIDTH * TILE_SIZE / 2),
            'margin-top': -(BOARD_HEIGHT * TILE_SIZE / 2),
        });

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

function Piece(type,color, x, y) {
    this.type = type;
    this.color = color;
    this.x = x;
    this.y = y;
}

function selectPiece(piece) {
    piece.trigger('startRumble');
    piece.parent('tile').addClass('selected');
    piece_selected = true;

    checkSquares(piece, true);

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

    console.log(piece.attr('type'));

    piece.css('position', 'relative');
    piece.animate({
        'left': '+='+(TILE_SIZE * (new_x - old_x)),
        'top': '+='+(TILE_SIZE * (new_y - old_y))
    }, 500, function() {
        if (tile.children('piece').length) {
            tile.children('piece').remove();
        }
        piece
            .appendTo(tile)
            .css({
                'position': 'static',
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

function checkSquares(piece, visible) {
    if (visible) {
        $('board').addClass('show_valid');
    } else {
        $('board').removeClass('show_valid');
    }

    var type = piece.attr('type');
    var color = piece.attr('color');
    var x = parseInt(piece.parent().attr('x'));
    var y = parseInt(piece.parent().attr('y'));
    piece = new Piece(type, color, x, y)

    if (piece.type == 'queen') {
        checkDirections(piece, ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']);
    } else if (piece.type == 'bishop') {
        checkDirections(piece, ['NE', 'SE', 'SW', 'NW']);
    } else if (piece.type == 'rook') {
        checkDirections(piece, ['N', 'E', 'S', 'W']);
    }
}

function checkDirections(piece, directions) {
    for (var i = 0; i < directions.length; i++) {
        if (directions[i] == 'N')  { checkN(piece) }
        if (directions[i] == 'NE') { checkNE(piece) }
        if (directions[i] == 'E')  { checkE(piece) }
        if (directions[i] == 'SE') { checkSE(piece) }
        if (directions[i] == 'S')  { checkS(piece) }
        if (directions[i] == 'SW') { checkSW(piece) }
        if (directions[i] == 'W')  { checkW(piece) }
        if (directions[i] == 'NW') { checkNW(piece) }
    }
}

function checkN(piece) {
    for (var x = piece.x, y = piece.y - 1; y > 0; y--) {
        if (!checkTile(piece, x, y)) { break; }
    }
}

function checkNE(piece) {
    for (var x = piece.x + 1, y = piece.y - 1; x <= BOARD_WIDTH, y > 0; x++, y--) {
        if (!checkTile(piece, x, y)) { break; }
    }
}

function checkE(piece) {
    for (var x = piece.x + 1, y = piece.y; x <= BOARD_WIDTH; x++) {
        if (!checkTile(piece, x, y)) { break; }
    }
}

function checkSE(piece) {
    for (var x = piece.x + 1, y = piece.y + 1; x <= BOARD_WIDTH, y <= BOARD_HEIGHT; x++, y++) {
        if (!checkTile(piece, x, y)) { break; }
    }
}

function checkS(piece) {
    for (var x = piece.x, y = piece.y + 1; y <= BOARD_HEIGHT; y++) {
        if (!checkTile(piece, x, y)) { break; }
    }
}

function checkSW(piece) {
    for (var x = piece.x - 1, y = piece.y + 1; x > 0, y <= BOARD_HEIGHT; x--, y++) {
        if (!checkTile(piece, x, y)) { break; }
    }
}

function checkW(piece) {
    for (var x = piece.x - 1, y = piece.y; x > 0; x--) {
        if (!checkTile(piece, x, y)) { break; }
    }
}

function checkNW(piece) {
    for (var x = piece.x - 1, y = piece.y - 1; x > 0, y > 0; x--, y--) {
        if (!checkTile(piece, x, y)) { break; }
    }
}

function checkTile(piece, x, y) {
    var tile = $('tile[x='+x+'][y='+y+']');
    if (tile.attr('filled') == 'filled') {
        if (tile.children('piece').length) {
            if (tile.children('piece').attr('color') == piece.color) {
                return false;
            } else {
                tile.addClass('valid');
                tile.children('piece')
                    .removeClass('unlocked')
                    .addClass('locked');
                return false;
            }
        }
        tile.addClass('valid');
        return true;
    } else {
        return false;
    }
}

function checkTurn() {
    if ($('piece').filter('[color=white]').length == 0) { // There are no uncaptured white tiles
        console.log('gg');
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
    console.log('turn: white');
}

function playBlack() {
    console.log('turn: black');
    playNextBlackPiece();
}

function playNextBlackPiece() {
    var piece = $('piece.unplayed').filter('[color=black]').first();
    if (piece.length) {
        checkSquares(piece, true);

        var new_tile = piece.parent();
        valid_tiles = $('.valid');
        for (var i=0; i < valid_tiles.length; i++) {
            valid_tile = $(valid_tiles[i]);
            if (valid_tile.children('piece').length) {
                new_tile = valid_tile;
                break;
            } else {
                random_tile_id = Math.floor(Math.random()*valid_tiles.length);
                new_tile = $(valid_tiles[random_tile_id]);
            }
        }

        $('.valid').removeClass('valid');
        piece
            .removeClass('unplayed')
            .addClass('played');
        movePiece(piece, new_tile, function() {
             playNextBlackPiece();
        });
    } else {
        resetRound();
    }
}

