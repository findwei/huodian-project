layui.use(['form', 'layer'], function() {
    var $ = layui.jquery,
        form = layui.form,
        layer = layui.layer;
    form.on('submit(confirmDataFormSubmit)', function(data) {
        var datastr = [];
        for (const key in data.field) {
            const element = data.field[key];
            datastr.push(element);
        }
        var data1 = {
            data: datastr.join('-'),
            projectId: window.localStorage.projectId
        }
        $.ajax({
            type: "POST",
            url: `${projectPATH}/appendix/addSpatialParameters`,
            data: data1,
            dataType: "json",
            success: function(response) {
                layer.msg(response.msg)
            }
        });
        return false; //阻止表单跳转。如果需要表单跳转，去掉这段即可。
    });
});