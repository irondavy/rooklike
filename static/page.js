$(document).ready(function() {

    $('.board').each(function() {
        title_height = $(this).children('.title').height();
        map_height = $(this).children('.template').height();
        extra_space = (170 - title_height - map_height) / 2;
        if (extra_space > 0) {
            $(this).children('.title').css('margin-bottom', extra_space);
        }

        map_width = $(this).children('.template').width();
        extra_width = (map_width - 180) / 2;
        if (extra_width > 0) {
            $(this).children('.template').css('left', -extra_width);
        }
    });

    $('#edit [name=title]').keyup(function() {
        $('#delete_dialog strong #delete_dialog_token').text($(this).val());
    });
    $('#delete').click(function(e) {
        e.preventDefault();
        $('#delete_dialog').fadeIn('fast');
    });
    $('#delete_dialog_cancel').click(function(e) {
        e.preventDefault();
        $('#delete_dialog').fadeOut('fast');
    });

    $(document).keyup(function(e) {
        if (e.keyCode == 27) {
            $('.dialog').fadeOut('fast');
        }
    });

});