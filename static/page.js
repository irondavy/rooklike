$(document).ready(function() {

    // if ($('#list').length) {
    //     $('h1 .back').hide();
    // }

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

});