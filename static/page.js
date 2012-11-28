$(document).ready(function() {

    $('.board').each(function() {
        title_height = $(this).find('.title').height();
        map_height = $(this).find('.template').height();
        extra_space = (170 - title_height - map_height) / 2;
        if (extra_space > 0) {
            $(this).find('.title').css('margin-bottom', extra_space);
        } else {
            extra_height = (map_height - (150 - title_height)) / 2;
            if (extra_height > 0) {
                $(this).find('.template').css('top', -extra_height);
            }
        }

        map_width = $(this).find('.template').width();
        link_width = $(this).width() + 2;
        extra_width = (map_width - link_width) / 2;
        if (extra_width > 0) {
            $(this).find('.template').css('left', -(extra_width - 4));
        }
    });

    $('#edit [name=template]').keyup(function(e) {
        console.log($(this).val());
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