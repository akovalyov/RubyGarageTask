steal('jquery/controller').then(function ($) {
    $.Controller('Project', {}, {
        init: function () {
            alert('asd');
        }
    });



    //initializing controllers
    $('[data-controller=project]').project();
    $('[data-controller=task]').task();
});