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
                //binding on project creation
                '{Project} created': function (list, ev, item) {
                    //let's add this project to our stack
                    this.options.projects.push(item);
                    //display the project
                    this._setProjectView(item);
                    //and say to worried user to be relaxed - everything is OK
                    this.publish('notification.push', {level: 'success', 'message': 'Project was successfully created'});
                },
                //replace title with form
                '.project_title .icon-edit click': function (el, ev) {
                    //cache project id to prevent parsing of DOM
                    var project_id = el.parents("[data-project-id]").attr('data-project-id');
                    //find needed project
                    var project = $.grep(this.options.projects, function (project) {
                        if (project.id == project_id) {
                            return project;
                        }
                    })[0];
                    $('[data-project-id=' + project_id + '] .project_name').html(Twig.render(project_form_twig, {
                        project: project
                    }));
                },
                '.project_title form submit': function (el, ev) {
                    ev.preventDefault();
                    new Project({
                        name: el.find('[name=name]').val(),
                        id: el.parents("[data-project-id]").attr('data-project-id')
                    }).save(function(){
                            //@todo edit callback
                            console.log('saved');
                        });
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
                        //push new project to controller to allow it to add the project to the DOM
                        $('[data-controller=project]').project(project);
                        //close modal window
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
                fakeData: [
                    {id: 1, name: 'Project 1'},
                    {id: 2, name: 'Project 2'},
                    {id: 3, name: 'Project 3'}
                ],
                findAll: function (params, success, error) {
                    return $.ajax({
                        url: "/projects.json",
                        data: params,
                        dataType: "json",
                        fixture: function () {
                            return [Project.fakeData];

                        },
                        success: success
                    })
                },
                findOne: function (id, success, error) {
                    return $.ajax({
                        url: "/projects/" + id + ".json",
                        dataType: "json",
                        fixture: function () {
                            return [$.grep(Project.fakeData, function (project) {
                                return project.id == id;
                            })[0]];

                        },
                        success: success
                    })
                },
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
        })
        ;
    })

;
