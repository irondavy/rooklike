$(document).ready(function() {
    $('.piece').jrumble({ speed: 200 });
    $('.piece').toggle(
        function() {
            
            $('.selected .piece').trigger('stopRumble');
            $('.selected').removeClass('selected');

            $(this).trigger('startRumble');
            $(this).parent().addClass('selected');

            if ($(this).hasClass('queen')) {
                
            }

        },
        function() {
            $(this).trigger('stopRumble');
            $(this).parent().removeClass('selected');
        }
    );
});

