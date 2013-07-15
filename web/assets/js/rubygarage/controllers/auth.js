steal('jquery/controller', 'jquery/controller/subscribe').then(function ($) {
    $.Controller('Auth', {}, {
        'form submit': function (el, ev) {
            var that = this
            ev.preventDefault();
            $.ajax({
                url: el.attr('action'),
                type: el.attr('method'),
                data: el.serialize(),
                'dataType': 'json',
                success: function (data) {
                    if (data.error.length === 0) {
                        that.publish('activity.show', {})

                        setTimeout(function () {
                            $('.auth').fadeOut(function () {

                            });
                            $('.content, .footer').fadeIn(function () {
                                that.publish('activity.hide', {})
                            })

                        }, 500);

                        that.publish('notification.push', {level: 'notice', 'message': 'Logged as ' + data.username + '. Welcome'});
                    }
                    else {
                        that.publish('notification.push', {level: 'error', 'message': 'Error(s) occured: ' + data.error});

                    }
                },
                error: function () {

                }
            });
        }
    })
});