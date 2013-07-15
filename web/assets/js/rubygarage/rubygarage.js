steal(
    'jquery/controller',
    'jquery/model',
  //  'jquery/dom/fixture',
    'jquery/view/twig',
    'jquery/controller/subscribe',
    'bootstrap',
    'pnotify',
    './controllers/project.js',
    './controllers/task.js',
    './controllers/windows.js',
    './controllers/activity.js',
    './controllers/notifications.js',
    './controllers/auth.js',
    './models/project.js'
).then(function ($) {
        steal.bind('ready', function () {
            //initializing controllers
            steal.dev.log('initializing application')
            $('.login_form').auth();
            Project.findAll({}, function (projects) {
                $('[data-controller=project]').project({projects: projects});
                $('[data-controller=task]').task();
                $('[data-controller=notifications]').notifications();
                $('[data-controller=windows]').windows();
                $('[data-controller=activity]').activity(window.spinnerConfig);
                setTimeout(function () {
                    $('[data-controller=activity]').activity('hide');
                }, 500);
            });

            $('.add_project').click(function (ev) {
                $('[data-controller=windows]').windows('initialize', ev
                );
            });
        })
        ;
    })
;
