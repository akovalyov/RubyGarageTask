steal('jquery/controller').then(function ($) {
    $.Controller('TaskController', {}, {
        /**
         * initialize
         */
        init: function () {
            var that = this;
            if (this.options.tasks && this.options.tasks.length > 0) {
                $.each(this.options.tasks, function (i, task) {
                    that._setTaskView(task);
                });
            }
            else {
                this.setNoTasks();
            }
        },
        '.add_task form submit': function (el, ev) {
            ev.preventDefault();
            var task = new Task({name: el.find('[name = name]').val(), project: el.parents('.todo').attr('data-project-id')});
            task.save(function () {

            });


        },
        setNoTasks: function () {
            this.element.find('.list').html(Twig.render(no_tasks_twig, {}))
        },
        /**
         * helper function for adding or updating set of DOM elements which represent task
         * @param task
         * @private
         */
        _setTaskView: function (task) {
            if ($('[data-task-id=' + task.id + ']').length === 0) {
                this.element.find('.list').append(Twig.render(task_twig, {
                    task: task
                }));
            }
            else {
                $('[data-task-id=' + task.id + '] .task ').replaceWith(Twig.render(task_twig, {task: task}));
            }
        },
        /**
         * updates local stack of tasks, calls the DOM update function and publishes a message
         * @param list
         * @param ev
         * @param item
         */
        '{Task} created': function (list, ev, item) {
            // say to worried user to be relaxed - everything is OK
            if (this.element.parents('.todo').attr('data-project-id') == item.project) {
                this.publish('notification.push', {level: 'success', 'message': 'Task was successfully created'});
                var that = this;
                //reload all tasks
                Task.findAll({project: item.project}, function (tasks) {
                    that.element.task('destroy').task({tasks: tasks})
                });
            }
        }
    });
});