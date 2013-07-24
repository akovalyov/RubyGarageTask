
steal('jquery/model').then(function ($) {
    $.Model('Task', {
        fakeData: [
            {id: 1, name: 'Task 1', project:1},
            {id: 2, name: 'Task 2', project:1},
            {id: 3, name: 'Task 3', project:2}
        ],
        findAll: function (params, success, error) {
            return $.ajax({
                url: "project/"+params.project+"/tasks.json",
                data: params,
                dataType: "json",
                fixture: function () {
                    return [Task.fakeData];

                },
                success: success
            })
        },
        findOne: function (id, success, error) {
            return $.ajax({
                url: "/tasks/" + id + ".json",
                dataType: "json",
                fixture: function () {
                    return [$.grep(Task.fakeData, function (task) {
                        return task.id == id;
                    })[0]];

                },
                success: success
            })
        },
        create: function (params, success, error) {

            return $.ajax({
                url: "/tasks.json",
                dataType: "json",
                type: "post",
                data: params,
                fixture: function () {
                    params.id = parseInt(Math.random() * 10000);
                    Task.fakeData.push(params);


                },
                success: success
            })
        },
        update: function (id, params, success, error) {
            if(params.id){
                delete params.id
            }
            return $.ajax({
                url: "/tasks/" + id + ".json",
                dataType: "json",
                type: "put",
                data: params,
                fixture: function () {
                    var task_index;
                    $.each(Task.fakeData, function (i, p) {

                        if (p.id == id) {
                            task_index = i;
                        }
                    });
                    Task.fakeData[task_index] = params;
                    return [Task.fakeData[task_index]];

                },
                success: success
            })
        },
        destroy: function (id, success, error) {
            return $.ajax({
                url: "/tasks/" + id + ".json",
                dataType: "json",
                type: "delete",
                fixture: function () {
                    Task.fakeData = jQuery.grep(Task.fakeData, function (value) {
                        return value.id != id;
                    });


                },
                success: success
            })
        }
    }, {});
});