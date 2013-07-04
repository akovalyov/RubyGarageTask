steal(
    'jquery/controller',
    'jquery/model',
    'jquery/dom/fixture',
    'jquery/view/twig',
    'jquery/controller/subscribe',
    'bootstrap',
    'pnotify'
).then(function ($) {
        steal.bind('ready', function () {
            //declaring controllers
            $.Controller('ProjectController', {}, {
                init: function () {
                    var that = this;
                    console.log(this.options.projects)
                    $.each(this.options.projects, function (i, project) {
                        that._setProjectView(project);
                    });
                },
                _setProjectView: function (project) {
                    if ($('[data-project-id=' + project.id + ']').length === 0) {
                        this.element.append(Twig.render(project_twig, {
                            project: project

                        }));
                    }
                    else {
                        //@todo replace element;
                    }
                },
                '{Project} created': function (list, ev, item) {
                    this.options.projects.push(item);
                    this._setProjectView(item);
                    this.publish('notification.push', {level: 'success', 'message': 'Project was successfully created'});
                }

            })
            ;
            $.Controller('TaskController', {}, {

            });
            $.Controller('WindowsController', {}, {
                'form submit': function (el, ev) {
                    ev.preventDefault();
                    var project = new Project({name: el.find('[name = name]').val()});
                    project.save(function () {
                        $('[data-controller=project]').project(project);
                        $('[data-dismiss=modal]').trigger('click');

                    });


                }

            });
            $.Controller('Notifications', {}, {
                'notification.push subscribe': function (name, data) {
                    $.pnotify({title: data.message, type: data.level});

                }
            });
            $.Model('Project', {
                findAll: function (params, success, error) {
                    return $.ajax({
                        url: "/projects.json",
                        data: params,
                        dataType: "json",
                        fixture: function () {
                            return [
                                [
                                    {id: 1, name: 'Project 1'},
                                    {id: 2, name: 'Project 2'},
                                    {id: 3, name: 'Project 3'}
                                ]
                            ];

                        },
                        success: success
                    })
                },
                findOne: 'GET /projects/{id}.json',
                create: 'POST /projects.json',
                update: 'PUT /projects/{id}.json',
                destroy: 'DELETE /projects/{id}.json'
            }, {});
//initializing controllers
            steal.dev.log('initializing application')
            Project.findAll({}, function (projects) {
                $('[data-controller=project]').project({projects: projects})
            });
            $('[data-controller=task]').task();
            $('[data-controller=notifications]').notifications();
            $('[data-controller=windows]').windows();
            $('.add_project').click(function (ev) {
                $('[data-controller=windows]').windows('initialize', ev
                );
            });
        });
    })

;
