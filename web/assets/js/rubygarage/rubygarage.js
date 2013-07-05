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
                /**
                 * initialize
                 */
                init: function () {
                    var that = this;
                    $.each(this.options.projects, function (i, project) {
                        that._setProjectView(project);
                    });
                },
                /**
                 * helper function for adding or updating set of DOM elements which represent project
                 * @param project
                 * @private
                 */
                _setProjectView: function (project) {
                    if ($('[data-project-id=' + project.id + ']').length === 0) {
                        this.element.append(Twig.render(project_twig, {
                            project: project

                        }));
                    }
                    else {
                        $('[data-project-id=' + project.id + ']').replaceWith(Twig.render(project_twig, {project: project}));
                    }
                },
                /**
                 * updates local stack of projects, calls the DOM update function and publishes a message
                 * @param list
                 * @param ev
                 * @param item
                 */
                '{Project} created': function (list, ev, item) {
                    // say to worried user to be relaxed - everything is OK

                    this.publish('notification.push', {level: 'success', 'message': 'Project was successfully created'});
                    //reload all projects

                    Project.findAll({}, function (projects) {
                        $('[data-controller=project]').project('destroy').html('').project({projects: projects})
                    });
                },
                /**
                 *
                 * @param el
                 * @param ev
                 */
                '.project_title .project_edit click': function (el, ev) {
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
                '.project_title .project_delete click': function (el, ev) {
                    var that = this;
                    var project_id = el.parents("[data-project-id]").attr('data-project-id');
                    var project = Project.destroy(project_id);
                    project.then(function () {
                        that.publish('notification.push', {level: 'success', 'message': 'Project was successfully deleted'});

                        $('[data-project-id=' + project_id + ']').fadeOut(function () {
                            $(this).remove();
                        })
                    })

                },
                '.project_title form submit': function (el, ev) {
                    ev.preventDefault();
                    var that = this;
                    new Project({
                        name: el.find('[name=name]').val(),
                        id: el.parents("[data-project-id]").attr('data-project-id')
                    }).save(function (project) {
                            var project_index;
                            $.each(that.options.projects, function (i, p) {

                                if (p.id == project.id) {
                                    project_index = i;
                                }
                            });
                            //get project with tasks
                            var updated_project = Project.findOne(project.id);
                            updated_project.then(function (project) {
                                //update local stack
                                that.options.projects[project_index] = project;
                                //update view
                                that._setProjectView(project);

                                //and say to worried user to be relaxed - everything is OK
                                that.publish('notification.push', {level: 'success', 'message': 'Project was successfully updated'});
                            });
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
                create: function (params, success, error) {
                    return $.ajax({
                        url: "/projects.json",
                        dataType: "json",
                        type: "post",
                        fixture: function () {
                            console.log(arguments)
                            params.id = parseInt(Math.random() * 10000);
                            Project.fakeData.push(params);


                        },
                        success: success
                    })
                },
                update: function (id, params, success, error) {
                    return $.ajax({
                        url: "/projects/" + id + ".json",
                        dataType: "json",
                        type: "put",
                        fixture: function () {
                            var project_index;
                            $.each(Project.fakeData, function (i, p) {

                                if (p.id == id) {
                                    project_index = i;
                                }
                            });
                            Project.fakeData[project_index] = params;
                            return [Project.fakeData[project_index]];

                        },
                        success: success
                    })
                },
                destroy: function (id, success, error) {
                    return $.ajax({
                        url: "/projects/" + id + ".json",
                        dataType: "json",
                        type: "delete",
                        fixture: function () {
                            Project.fakeData = jQuery.grep(Project.fakeData, function(value) {
                                return value.id != id;
                            });


                        },
                        success: success
                    })
                }
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
