layui.use(['element', 'layer', 'upload', 'form'], function() {
        var $ = layui.jquery,
            element = layui.element,
            layer = layui.layer,
            upload = layui.upload,
            form = layui.form;
        // 报告编写 弹窗
        $('.report-writing span').on('click', function() {
                var className = '.report-writing'
                addName(className);
            })
            // 现场低探观察 弹窗
        $('.field-low-sounding-observation span').on('click', function() {
                var className = '.field-low-sounding-observation'
                addName(className);
            })
            // 弹窗函数
        function addName(className) {
            layer.open({
                type: 1,
                title: '请输入名字',
                content: `<input type="name" name="title" autocomplete="off" placeholder="请输入名字" class="layui-input" style="padding:10px 20px; height:40px;">`,
                btn: ['确实', '取消'],
                yes: function(index, layero) {
                    //按钮【按钮一】的回调
                    var val = $(layero).find('input').val() //获取input的值
                    if ($(className + ':has(li)').length == 0) {
                        $(className).prepend($(`<li>${val}<i class="layui-icon layui-icon-close"></i></li>`));
                    } else {
                        $(`<li>${val}<i class="layui-icon layui-icon-close"></i></li>`).insertAfter(className + ' li:last');
                    }
                    layer.close(index);
                    remove(className) //调用删除DOM
                },
                btn2: function(index, layero) {
                    //按钮【按钮二】的回调
                    layer.close(index);
                }
            })
        }
        // 删除 添加的人 
        function remove(className) {
            $(className + ' li').each(function(index, element) {
                $(this).find('i').click(function(e) {
                    e.preventDefault();
                    console.log($(this).parent());
                    $(this).parent().remove();
                });
            });
        }
        remove('.report-writing');
        remove('.field-low-sounding-observation');
        // 监听提交事件 创建项目 (第一步)
        //邮政编码验证
        form.verify({
            postalCode: [/^[0-9]{6}$/, '邮政编码只能6位数']
        });
        form.on('submit(zjklSubmit)', function(data) {
            var reportWriting = '', //报告编写
                lowAltitudeObservation = ''; //现场低探观察
            $('.report-writing li').text(function(index, text) {
                index == 0 ? reportWriting += `${text}` : reportWriting += `,${text}`
            })
            $('.field-low-sounding-observation li').text(function(index, text) {
                index == 0 ? lowAltitudeObservation += `${text}` : lowAltitudeObservation += `,${text}`
            })
            var type = $('.container .layui-tab.layui-tab-brief .layui-this').data('type');
            var userId = window.localStorage.getItem('userId');
            data.field.type = type;
            data.field.userId = userId;
            data.field.reportWriting = reportWriting;
            data.field.lowAltitudeObservation = lowAltitudeObservation;
            firstNext(data.field) //执行下一步
            return false; //阻止表单跳转。如果需要表单跳转，去掉这段即可。
        });
        //创建项目基本内容 触发下一步
        function firstNext(data) {
            var transferData = JSON.stringify(data);
            $.ajax({
                type: "POST",
                url: `${projectPATH}/upload/new`,
                data: transferData,
                contentType: "application/json;charset=utf-8",
                dataType: "json",
                success: function(response) {
                    if (response.code == 200) {
                        layer.msg(response.msg)
                        window.localStorage.setItem('projectId', response.data)
                            // window.parent.location.href = '../indexEdit.html'
                        $('#msform fieldset:first').find('input.next').trigger('click');
                    } else if (response.code == 201) {
                        layer.msg(response.msg)
                    }
                }
            });
        }
        //上传观察站数据
        uploadFile('#test11', '/upload/dos1'); //观测站 气温
        uploadFile('#test12', '/upload/dos2'); //观测站 气风
        function uploadFile(domId, url) {
            $(domId).click(function(e) {
                e.preventDefault();
                layer.prompt({
                    formType: 0,
                    anim: 2,
                    resize: true,
                    value: '1.5,10,30',
                    title: '请输入高度',
                }, function(value, index, elem) {
                    layer.close(index);
                    uploadParameter(value, domId, url) //调用上传函数
                });
            });
        };
        // 调用上传函数
        function uploadParameter(value, domId, url) {
            var userId = window.localStorage.userId;
            domId = domId.split("");
            domId.splice(6, 0, '-');
            var dom = domId.join("");
            // 调用layui 上传组件
            uploadPerform(dom, url, value, userId)
        };
        //layui上传组件
        function uploadPerform(elem, url, value, userId) {
            var strUrl = url;
            var projectId = window.localStorage.projectId;
            var loading;
            upload.render({
                elem: elem,
                url: `${projectPATH}${url}`,
                multiple: true,
                data: {
                    'height': value,
                    'userId': userId,
                    'projectId': projectId
                },
                before: function(obj) { //obj参数包含的信息，跟 choose回调完全一致，可参见上文。
                    loading = layer.load(0, {
                        shade: [0.4, '#000']
                    }); //0代表加载的风格，支持0-2
                    //loading层
                },
                choose: function(obj) {

                },
                done: function(res, index, upload) { //上传后的回调
                    layer.closeAll('loading'); //关闭loading
                    if (res.code == 200) {
                        var strKey = strUrl.charAt(strUrl.length - 1);
                        if (strKey == 1) {
                            window.sessionStorage.setItem(strUrl, '1')
                        } else if (strKey == 2) {
                            window.sessionStorage.setItem(strUrl, '1')
                        }
                        if (window.sessionStorage.getItem('/upload/dos1') == '1' && window.sessionStorage.getItem('/upload/dos2') == '1') {
                            $('.gcData-tow').removeAttr('disabled')
                            window.sessionStorage.removeItem('/upload/dos1');
                            window.sessionStorage.removeItem('/upload/dos2');
                        }
                        layer.msg(res.msg)
                    } else {
                        layer.msg(res.msg)
                    }
                    console.log(res);
                },
                error: function(res) {
                    console.log(res);
                    layer.closeAll('loading'); //关闭loading
                },
                accept: 'file', //允许上传的文件类型
                exts: 'xlsx|xls'
                    //   ,size: 50 //最大允许上传的文件大小
                    //,……
            });
            // console.log(qw)
            $(elem).click(); //触发上传调用系统上传弹框
        };
    })
    // 气象站 多个数据上传
$('.qxzwd-buttom').click(function(e) {
    e.preventDefault();
    var slef = this;
    qxzUpload(slef, 7, '.gcData-three') //温
});
$('.qxzfs-buttom').click(function(e) {
    e.preventDefault();
    var slef = this;
    qxzUpload(slef, 6, '.gcData-three') //风
});
//气象站 单个数据上传
$('.qxzwd-buttom-d').click(function(e) {
    e.preventDefault();
    var slef = this;
    qxzUpload(slef, 3, '.gcData-four') //温
});
$('.qxzfs-buttom-d').click(function(e) {
    e.preventDefault();
    var slef = this;
    qxzUpload(slef, 4, '.gcData-four') //风
});
// 空冷数据上传
$('.kl-buttom-d').click(function(e) {
    e.preventDefault();
    var slef = this;
    qxzUpload(slef, 5, '.gcData-five') //风
});
// 气象站点击上传 处理
function qxzUpload(slef, num, disableDom) {
    $(slef).parent().find('input')
        .val('')
        .click()
        .on('change', function(e) {
            e.preventDefault();
            uploadFileToService(num, disableDom);
            $(this).off('change');
        });
}
//上传文件
function uploadFileToService(num, disableDom) { //风
    var filrarr = document.getElementById(`uploadFile${num}`).files;
    var formdata = new FormData(); //创建一个表单
    for (var i = 0; i < filrarr.length; i++) {
        formdata.append(`file`, filrarr[i]);
    }
    var userId = window.localStorage.userId;
    var projectId = window.localStorage.projectId;
    formdata.append('userId', userId);
    formdata.append('projectId', projectId);
    var loading;
    $.ajax({
        type: "POST",
        url: `${projectPATH}/upload/dos${num}`,
        processData: false,
        contentType: false,
        data: formdata,
        dataType: "JSON",
        beforeSend: function() {
            loading = layer.load(0, {
                shade: [0.4, '#000']
            }); //0代表加载的风格，支持0-2
            //loading层
        },
        complete: function() {
            layer.close(loading);
        },
        success: function(response) {
            console.log(response);
            //判断气象站单个数据 下一步按钮
            if (response.code == 200) {
                if (num == 3) {
                    window.sessionStorage.setItem(`/upload/dos${num}`, '1')
                } else if (num == 4) {
                    window.sessionStorage.setItem(`/upload/dos${num}`, '1')
                }
                if (window.sessionStorage.getItem(`/upload/dos3`) == '1' && window.sessionStorage.getItem(`/upload/dos4`) == '1') {
                    $(disableDom).removeAttr('disabled')
                    window.sessionStorage.removeItem('/upload/dos3');
                    window.sessionStorage.removeItem('/upload/dos4');
                }
                //判断气象站多个数据 下一步按钮 + 执行表格
                if (num == 6) {
                    window.sessionStorage.setItem(`/upload/dos${num}`, '1')
                    showTable(response.data, 6)
                } else if (num == 7) {
                    window.sessionStorage.setItem(`/upload/dos${num}`, '1')
                    showTable(response.data, 7)
                }
                if (window.sessionStorage.getItem(`/upload/dos6`) == '1' && window.sessionStorage.getItem(`/upload/dos7`) == '1') {
                    $(disableDom).removeAttr('disabled')
                    window.sessionStorage.removeItem('/upload/dos6');
                    window.sessionStorage.removeItem('/upload/dos7');
                }
                //判断空冷的下一步
                if (num == 5) {
                    $(disableDom).removeAttr('disabled')
                    window.sessionStorage.removeItem('/upload/dos5');
                }
            } else {
                layer.msg(response.msg)
            }

        }
    });
}
// 上传了多个参证站数据返回的表格数据
function showTable(data, num) {
    var tabBox = $(`<table class="layui-table tableIndex${num}">
        <caption>${data.table1.title}</caption>
        <thead></thead>
        <tbody></tbody>
        </table>`)
    $('#showTabel h2').after(tabBox);
    var tr = $('<tr></tr>');
    data.table1.tableHead.forEach(element => {
        tr.append($(`<td>${element}</td>)`));
    });
    console.log(tr)
    $(`#showTabel .tableIndex${num} thead`).append(tr)
    data.table1.table.forEach(element => {
        tbody(element)
    });

    function tbody(element) {
        var tbtr = $('<tr></tr>');
        for (const key in element) {
            const element1 = element[key];
            tbtr.append($(`<td>${element1}</td>)`));
        }
        console.log(tbtr)
        $(`#showTabel .tableIndex${num} tbody`).append(tbtr)
    }
}
// 清除观察站数据
$('.gcz-clear').click(function(e) {
    e.preventDefault();
    var self = this;
    gczClear(self);
});

function gczClear(self) {
    var type = $(self).data('clear');
    console.log(window.localStorage.projectId)
    data1 = {
        'user_Id': window.localStorage.userId,
        'project_Id': window.localStorage.projectId,
        'type': type
    }

    $.ajax({
        type: "DELETE",
        url: `${projectPATH}/upload/deleteExcel`,
        data: data1,
        dataType: "dataType",
        success: function(response) {
            console.log(response);
        }
    });
}
// 页面跳转执行
$('.zjkl .add-abolish').click(function(e) {
    e.preventDefault();
    // layui.route('./main/myProject.html');
    window.parent.location.href = "../index.html"
});
$('#DatanewItemSubmit').click(function(e) {
    e.preventDefault();
    // layui.route('./main/myProject.html');
    window.parent.location.href = "../indexEdit.html"
});