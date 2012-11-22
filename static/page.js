$(document).ready(function() {

    $('.board').each(function() {
        title_height = $(this).children('strong').height();
        map_height = $(this).children('span').height();
        extra_space = (170 - title_height - map_height) / 2;
        if (extra_space > 0) {
            $(this).children('strong').css('margin-bottom', extra_space);
        }

        map_width = $(this).children('span').width();
        extra_width = (map_width - 180) / 2;
        if (extra_width > 0) {
            $(this).children('span').css('left', -extra_width);
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