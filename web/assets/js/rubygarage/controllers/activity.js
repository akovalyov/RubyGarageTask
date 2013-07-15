steal('jquery/controller', 'jquery/controller/subscribe').then(function ($) {

    $.Controller('Activity', {}, {
        hide: function () {
            this.element.fadeOut(function () {
                $(this).addClass('hide');
                $('body').css('overflow', 'auto')
            });
        },
        show: function () {
            this.element.fadeIn(function () {
                $(this).removeClass('hide');
                //    $('body').css('overflow', 'auto')
            });
        },
        'activity.show subscribe': function () {
            console.log('called')
            this.show();
        },
        'activity.hide subscribe': function () {
            console.log('called')
            this.hide();
        }
    });
});