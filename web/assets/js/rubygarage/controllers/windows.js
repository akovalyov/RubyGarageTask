steal('jquery/controller').then(function ($) {
    $.Controller('WindowsController', {}, {
        'form submit': function (el, ev) {
            ev.preventDefault();
            var project = new Project({name: el.find('[name = name]').val()});
            project.save(function () {

                //close modal window
                $('[data-dismiss=modal]').trigger('click');

            });


        }

    });
});