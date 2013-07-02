steal('jquery/controller').then(function ($) {
    //declaring controllers
    $.Controller('Project', {}, {
        init: function () {
        }
    });


    //initializing controllers
    $('[data-controller=project]').project();
    $('[data-controller=task]').task();
});