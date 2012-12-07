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
                var valid_chars = '.#NnBbRrQqKk\n';
                var white_chars = 'NBRQK';
                var black_chars = 'nbrqk';
                var error_states = {
                    'invalid_chars': false,
                    'invalid_grid': false,
                    'no_white': true,
                    'no_black': true
                }
                var line_lengths = []

                for (var i=0, j=1; i < template.length; i++, j++) {
                    if (valid_chars.indexOf(template[i]) == -1) {
                        error_states['invalid_chars'] = true;
                    } else if (template[i] == '\n') {
                        line_lengths.push(j);
                        j = 0;
                    } else if (white_chars.indexOf(template[i]) > -1) {
                        error_states['no_white'] = false;
                    } else if (black_chars.indexOf(template[i]) > -1) {
                        error_states['no_black'] = false;
                    }
                }
                line_lengths.push(j);

                for (var i=0; i < line_lengths.length; i++) {
                    if (i > 0 && line_lengths[i] != line_lengths[i-1]) {
                        error_states['invalid_grid'] = true;
                    }
                }

                if ($('input[name=title]').val().length > 40) {
                    error_states['long_title'] = true;
                }
                if ($('textarea[name=template]').val().length > 1000) {
                    error_states['long_template'] = true;
                }

                error_copy = {
                        'invalid_chars': 'Your template contains invalid characters.',
                        'invalid_grid': 'Each row of your template needs to be the same length.',
                        'no_white': 'Your board needs at least one white piece.',
                        'no_black': 'Your board needs at least one black piece.',
                        'long_title': 'Your title needs to be less than 30 characters.',
                        'long_template': 'Your template needs to be less than 1000 characters.'
                    }

                error_messages = []
                for (var error in error_states) {
                    if (error_states[error]) {
                        error_messages.push(error_copy[error]);
                    }
                }

                if (error_messages.length) {
                    $('#error').html(error_messages.join(' ')).show();
                } else {
                    $('#edit_form').submit();
                }
            } else {
                $('#error').html('Your template is empty.').show();
            }
        });

        countCharacters($('input[name=title]'), $('#title_counter'), 30);
        $('input[name=title]')
            .keydown(function() {
                countCharacters($(this), $('#title_counter'), 30);
            })
            .keyup(function() {
                countCharacters($(this), $('#title_counter'), 30);
            });

        countCharacters($('textarea[name=template]'), $('#template_counter'), 1000);
        $('textarea[name=template]')
            .keydown(function() {
                countCharacters($(this), $('#template_counter'), 1000);
            })
            .keyup(function() {
                countCharacters($(this), $('#template_counter'), 1000);
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

function countCharacters(input, counter, max) {
    length = input.val().length;
    counter.html(max - length);
    if (length > max) {
        counter.addClass('too_long');
    } else {
        counter.removeClass('too_long');
    }
}
