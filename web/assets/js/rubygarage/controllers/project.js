steal('jquery/controller').then(function ($) {
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
    });

});