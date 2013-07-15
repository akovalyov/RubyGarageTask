steal('jquery/model').then(function ($) {
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
                data: params,
                fixture: function () {
                    console.log(arguments)
                    params.id = parseInt(Math.random() * 10000);
                    Project.fakeData.push(params);


                },
                success: success
            })
        },
        update: function (id, params, success, error) {
            if(params.id){
                delete params.id
            }
            return $.ajax({
                url: "/projects/" + id + ".json",
                dataType: "json",
                type: "put",
                data: params,
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
                    Project.fakeData = jQuery.grep(Project.fakeData, function (value) {
                        return value.id != id;
                    });


                },
                success: success
            })
        }
    }, {});
});