layui.use(['layer'], function() {
    var timr = true; //控制重复点击
    $('.login-button').click(function(e) {
        e.preventDefault();
        if (timr) {
            timr = false;
            var loading = layer.load(0, { shade: false }); //0代表加载的风格，支持0-2
            var aldata = {
                "count": $('.login #user').val(),
                "passWord": $('.login #password').val()
            };
            $.ajax({
                type: "POST",
                url: `${userPATH}/login`,
                data: JSON.stringify(aldata), //
                contentType: "application/json;charset=utf-8",
                success: function(response) {
                    console.log(response);
                    if (response.st == 'success') {
                        window.localStorage.setItem('admin', response.admin); //是否超级管理员
                        window.localStorage.setItem('token', response.token); //验证的token
                        window.localStorage.setItem('user', aldata.count); //用户名
                        window.localStorage.setItem('userId', response.id); //用户唯一id
                        window.location.href = '../index.html' //页面跳转
                    } else {
                        if ($("#password").next().attr('class') !== 'hint') {
                            //添加用户名密码错误
                            $('<p class="hint">手机号或密码错误</p>').insertAfter("#password");
                        } else {
                            // 抖动函数
                            shake('.hint')
                        }

                    }
                    layer.close(loading); //关闭等待
                    timr = true;
                },
                error: function(response) {
                    layer.msg('网络请求错误请稍后重试！')
                    layer.close(loading); //关闭等待
                    timr = true;
                }
            });
        } else {
            return false;
        }
    });

    // 抖动函数
    function shake(o) {
        var $panel = $(o);
        box_left = 0;
        $panel.css({ 'left': box_left, 'position': 'relative' });
        for (var i = 1; 4 >= i; i++) {
            $panel.animate({ left: box_left - (20 - 5 * i) }, 30);
            $panel.animate({ left: box_left + (20 - 5 * i) }, 30);
        }
    }
})