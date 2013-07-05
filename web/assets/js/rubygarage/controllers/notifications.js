steal('jquery/controller').then(function ($) {
    $.Controller('Notifications', {}, {
        'notification.push subscribe': function (name, data) {
            $.pnotify({title: data.message, type: data.level});

        }
    });
});