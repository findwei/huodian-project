layui.define('jquery', function(exports) {
    var $ = layui.jquery;
    exports('route', function(src) { //函数参数
        $('#kj-container', parent.document).attr('src', src);
        // $('#kj-container').attr('src', './main/newProject.html');
        console.log($('#kj-container', parent.document))
    });
});
// layui.route('./main/newProject.html');
var userPATH = 'http://192.168.0.124:8082/user'
var projectPATH = 'http://192.168.0.124:8082'