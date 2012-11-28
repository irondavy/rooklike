$(document).ready(function() {

    if ($('#list').length) {

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

    }

    if ($('#edit').length) {

        $('#edit_submit').click(function(e) {
            e.preventDefault();

            var invalid = false;

            template = $('#edit [name=template]').val();

            if (template.length) {
                var valid_chars = '.#NnBbRrQq\n';
                var white_chars = 'NBRQ';
                var black_chars = 'nbrq';
                var errors = {
                    'invalid_chars': false,
                    'invalid_grid': false,
                    'no_white': true,
                    'no_black': true
                }
                var line_lengths = []

                for (var i=0, j=1; i < template.length; i++, j++) {
                    if (valid_chars.indexOf(template[i]) == -1) {
                        errors['invalid_chars'] = true;
                    } else if (template[i] == '\n') {
                        line_lengths.push(j);
                        j = 0;
                    } else if (white_chars.indexOf(template[i]) > -1) {
                        errors['no_white'] = false;
                    } else if (black_chars.indexOf(template[i]) > -1) {
                        errors['no_black'] = false;
                    }
                }
                line_lengths.push(j);

                for (var i=0; i < line_lengths.length; i++) {
                    if (i > 0 && line_lengths[i] != line_lengths[i-1]) {
                        errors['invalid_grid'] = true;
                    }
                }

                if ($.inArray(true, errors)) {
                    error_messages = []
                    if (errors['invalid_chars']) {
                        error_messages.push('Your template contains invalid characters.');
                    }
                    if (errors['invalid_grid']) {
                        error_messages.push('Each row of your template needs to be the same length.');
                    }
                    if (errors['no_white']) {
                        error_messages.push('Your board needs at least one white piece.');
                    }
                    if (errors['no_black']) {
                        error_messages.push('Your board needs at least one black piece.');
                    }
                    $('#error').html(error_messages.join(' ')).show();
                } else {
                    $('#edit_form').submit();
                }
            } else {
                $('#error').html('Your template is empty.').show();
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

    }

    $(document).keyup(function(e) {
        if (e.keyCode == 27) {
            $('.dialog').fadeOut('fast');
        }
    });

});
