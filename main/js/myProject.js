// 判断是否管理员，显示账户管理
if (window.localStorage.getItem('admin') == 'superManager') {
    $('.accountUserInfo').show();
}
//项目 用户 切换
function titleSwitchover() {
    $('.top-project-title').click(function(e) { //显示项目
        e.preventDefault();
        $('.top-account-title').removeClass('show');
        $(this).addClass('show');
        $('.layui-main.account').hide();
        $('.layui-main.project').show();
    });
    $('.top-account-title').click(function(e) { //显示用户
        e.preventDefault();
        $('.top-project-title').removeClass('show');
        $(this).addClass('show');
        $('.layui-main.project').hide();
        $('.layui-main.account').show();
    });
};
titleSwitchover();

// 初始化渲染
layui.use(['form', 'table'], function() {
        var form = layui.form,
            $ = layui.jquery,
            table = layui.table;
        form.render('select'); //刷新select选择框渲染
    })
    // user 信息处理
userInfoManage();

function userInfoManage() {
    layui.use(['form', 'table'], function() {
        var form = layui.form,
            $ = layui.jquery,
            table = layui.table;
        form.render('select'); //刷新select选择框渲染
        // 筛选 切换
        function filter() {
            $('.category ul li').click(function(e) {
                e.preventDefault();
                $(this).parent().find('li').removeClass('filter-show');
                $(this).addClass('filter-show');
            });
        }
        filter()
        var userManage = table.render({
            elem: '#user',
            url: `${userPATH}/querUserAll` //数据接口
                ,
            page: { //开启分页
                // count: pageData.length,
            },
            cols: [
                [ //表头
                    { field: '', title: '序号', fixed: 'left', align: 'center', type: 'numbers' },
                    { field: 'id', title: 'ID', sort: true, fixed: 'left', align: 'center' },
                    { field: 'count', title: '用户名', align: 'center' },
                    { field: 'name', title: '姓名', align: 'center' },
                    { field: 'passWord', title: '登录密码', align: 'center' },
                    {
                        field: 'status',
                        title: '账号状态',
                        align: 'center',
                        templet: function(d) {
                            return d.status == true ? '启用状态' : '禁用状态';
                            console.log(d);
                        }
                    },
                    {
                        field: 'userRole',
                        title: '权限',
                        align: 'center',
                        templet: function(d) {
                            switch (d.userRole) {
                                case 1:
                                    return '超级管理员'
                                case 2:
                                    return '管理员'
                                case 3:
                                    return '普通'
                            }
                            // return d.status == true ? '启用状态' : '禁用状态';
                        }
                    },
                    { fixed: 'right', title: '操作', toolbar: '#barDemo', align: 'center', fixed: 'right' }
                ]
            ]
        });
        console.log(userManage)
            // userManage.reload();
            // 监听行工具事件
        table.on('tool(user)', function(obj) {
            var userData = obj.data;
            console.log(userData);
            if (obj.event === 'del') {
                layer.confirm('真的删除行么', function(index) {
                    console.log(obj)
                    $.ajax({
                        type: "GET",
                        url: `${userPATH}/delete`,
                        data: {
                            "id": userData.id
                        },
                        success: function(response) {
                            console.log(response)
                        }
                    });
                    obj.del();

                    layer.close(index);
                });
            } else if (obj.event === 'edit') {
                $.ajax({
                    type: "GET",
                    url: `${userPATH}/userJurisdiction`,
                    data: "",
                    dataType: "JSON",
                    success: function(response) {
                        $('.roleId option:not(.tip)').remove();
                        $.each(response.data, function(indexInArray, valueOfElement) {
                            $(`<option value="${valueOfElement.id}">${valueOfElement.type}</option>`).appendTo('.roleId');
                        });
                        // 数据回填
                        form.val("userInfo", { //formTest 即 class="layui-form" 所在元素属性 lay-filter="" 对应的值
                            "name": userData.name,
                            "status": userData.status,
                            "roleId": userData.roleId,
                        });
                        form.render('select', 'userInfo');
                    }
                });
                $('.user-title-box').hide();
                var edit = layer.open({
                    type: 1,
                    title: '编辑内容',
                    // skin: 'layui-layer-rim', //加上边框
                    // area: ['420px', '240px'], //宽高
                    content: $('.user-pop-up-edit'),
                    btn: ['确定', '取消'],
                    yes: function() {
                        var data1 = form.val("userInfo");
                        delete data1.count;
                        console.log(data1)
                        data1.id = userData.id;
                        console.log(data1);
                        $.ajax({
                            type: "POST",
                            url: `${userPATH}/insertOrUpdatUser`,
                            contentType: "application/json;charset=utf-8",
                            data: JSON.stringify(data1),
                            // dataType: "json",
                            success: function(response) {
                                console.log(response);
                                userManage.reload();
                                layer.close(edit);
                            },
                            error: function(response) {
                                console.log(response);
                            }
                        });
                    },
                    end: function() {
                        $('.user-title-box').show();
                    }
                });

            }
        });
        // 新增用户
        $('.account .add-user').click(function(e) {
            e.preventDefault();
            // 权限下拉框获取
            $.ajax({
                type: "GET",
                url: `${userPATH}/userJurisdiction`,
                data: "",
                dataType: "JSON",
                success: function(response) {
                    $('.roleId option:not(.tip)').remove();
                    console.log(response)
                    $.each(response.data, function(indexInArray, valueOfElement) {
                        $(`<option value="${valueOfElement.id}">${valueOfElement.type}</option>`).appendTo('.roleId');
                    });
                    form.render('select', 'userInfo');
                }
            });
            var addUserPopup = layer.open({
                type: 1,
                title: '新增用户',
                content: $('.user-pop-up-edit'),
                btn: ['确定', '取消'],
                yes: function() {
                    // 新增用户
                    var data1 = form.val("userInfo");
                    console.log(data1);
                    $.ajax({
                        type: "POST",
                        contentType: "application/json;charset=utf-8",
                        url: `${userPATH}/insertOrUpdatUser`,
                        data: JSON.stringify(data1),
                        success: function(response) {
                            console.log(response);
                            if (response.msg == '该用户已存在') {

                            } else {

                            }
                            layer.close(addUserPopup);
                            userManage.reload();
                        },
                        error: function(response) {
                            console.log(response);
                        }
                    });
                }
            });
        });
    });
}
// 页面跳转  跳转到新建页面
$('.project .new').click(function(e) {
    e.preventDefault();
    // layui.route('./main/newProject.html');
    window.parent.location.href = "../indexNewProject.html"
});
// 模糊搜索
$('.serach-btn').click(function(e) {
    e.preventDefault();
    projectSearch();
});
// 项目查询
function projectSearch() {
    var name = $('#search').val()
    if ($('.account').css('display') == 'none') { //查询项目
        console.log('none')
        $.ajax({
            type: "GET",
            url: `${projectPATH}/upload/search`,
            data: {
                name: name
            },
            dataType: "json",
            success: function(response) {
                if (response.code == 201) {
                    layer.msg(response.msg)
                } else {
                    selectItem(response.data)
                }
            }
        });
    } else { //查询用户
        console.log('block')
        layui.use('table', function() {
            var table = layui.table;
            table.reload('user', {
                url: `${projectPATH}/user/search`,
                where: {
                    name: '1234'
                },
                response: {
                    statusCode: 200 //规定成功的状态码，默认：0
                }
            })
        })
    }
}
// 时间查询项目
layui.use('laydate', function() {
        var laydate = layui.laydate;
        laydate.render({
            elem: '#time1',
            type: 'date',
            range: true,
            min: '2019-11-10',
            max: getCurrentDate(),
            done: function(value, date, endDate) {
                var startTime = value.replace(/\s/g, "").split('-').slice(0, 3).join('-');
                var endTime = value.replace(/\s/g, "").split('-').slice(3, 6).join('-');
                $.ajax({
                    type: "GET",
                    url: `${projectPATH}/upload/selectDate`,
                    data: {
                        start: startTime,
                        end: endTime
                    },
                    dataType: "json",
                    success: function(response) {
                        if (response.code == 201) {
                            layer.msg(response.msg)
                        } else {
                            selectItem(response.data)
                        }
                    }
                });
            }

        });
    })
    // 项目信息处理
typeSelect('/upload/all') // 查询全部
$('.category ul li').click(function(e) { //点击分类查询
    e.preventDefault();
    $('.category ul li').removeClass('filter-show');
    $(this).addClass('filter-show')
    switch ($(this).data('type')) {
        case 1:
            typeSelect('/upload/zhi')
            break;
        case 2:
            typeSelect('/upload/jian')
            break;
        case 3:
            typeSelect('/upload/shui')
            break;
        case 'all':
            typeSelect('/upload/all')
            break;
    }
});
// 查询项目ajax
function typeSelect(url) {
    $.ajax({
        type: "GET",
        url: projectPATH + url,
        // data: "data",
        dataType: "json",
        success: function(response) {
            console.log(response)
            selectItem(response)
        }
    });
}
// 查询的项目 添加内容
function selectItem(response) {
    // 移除之前的元素
    $('.item:not(.new)').remove();
    var content, //插入的内容
        type = null, //项目类型
        bgColor, //项目图标背景颜色
        dom; //dom
    dom = $('.porject-item');
    $.each(response, function(indexInArray, valueOfElement) {
        console.log(valueOfElement)
        switch (valueOfElement.type) {
            case 1:
                type = '直接空冷';
                bgColor = '#009eff';
                break;
            case 2:
                type = '间接空冷';
                bgColor = '#faae13';
                break;
            case 3:
                type = '水冷';
                bgColor = '#52c51a';
                break;
        }
        content = ` <div class="item">
<div class="main">
    <div class="title">
        <p style="background-color:${bgColor};line-height:${valueOfElement.type == 3 ? '41px' : null}"><span>${type}</span></p>
        <h4>${valueOfElement.projectName}</h4>
    </div>

    <div class="time">
        <span>${valueOfElement.bearerUnit}</span>
        <p>${valueOfElement.createTime}</p>
    </div>
</div>
<div class="editor">
    <div class="projectEd" data-id=${valueOfElement.version}>编辑</div>
    <div>下载</div>
    <div>预览</div>
    <div>共享</div>
</div>
</div>`
        dom.append(content)
    });
    // 点击编辑跳转
    $('.projectEd').click(function(e) {
        e.preventDefault();
        var projectId = $(this).data('id');
        window.localStorage.setItem('projectId', projectId)
        window.parent.location.href = '../indexEdit.html'
    });
}
// 获取当前时间
function getCurrentDate() {
    var date = new Date();
    var connect = "-";
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var strDate = date.getDate();
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
    }
    var currentdate = year + connect + month + connect + strDate;
    return currentdate;
}