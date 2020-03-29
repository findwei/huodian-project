var windowifram = document.getElementById('iframe-chapter');//获取当前页面的子iframe
layui.use(['tree', 'jquery'], function () {
    var tree = layui.tree;
    var $ = layui.jquery;
    // 获取项目id
    var projectEd = window.localStorage.getItem('projectId')
    $.ajax({
        type: "GET",
        url: `${projectPATH}/category/findAll`,
        data: {
            id: projectEd
        },
        dataType: "json",
        success: function (response) {
            function dg(arr) {
                $.each(arr, function (index, value) {
                    var titleNumber2 = value.s2 ? `.${value.s2}` : '';
                    var titleNumber3 = value.s3 ? `.${value.s3}` : '';
                    value.title = `${value.s1}${titleNumber2}${titleNumber3}&nbsp;${value.title}`
                    if (value.children != undefined) {
                        dg(value.children);
                    }
                });
            }
            dg(response);
            xrTable(response);
        }
    });
    //渲染 目录
    function xrTable(data) {
        var inst1 = tree.render({
            elem: '#tree' //绑定元素
            ,
            showLine: false //是否开启连接线
            ,
            data: data,
            // edit: true //修改、删除
            //     ,
            click: function (obj) {
                $('.layui-tree-entry').css('backgroundColor', '');
                $(obj.elem).find('.layui-tree-entry:eq(0)').css('backgroundColor', 'rgb(13, 62, 94)');
                var chapterId = `${obj.data.s1}${obj.data.s2}${obj.data.s3}`
                // console.log(obj.data); //得到当前点击的节点数据
                // console.log(obj.state); //得到当前节点的展开状态：open、close、normal
                // console.log(obj.elem); //得到当前节点元素
                // console.log(obj.data.children); //当前节点下是否有子节点
                window.localStorage.setItem('chapterId', chapterId)
                // 动态改变IfIframe
                switchoverIframe(obj.data.s1);
                // 根据Id查询模板内容
                modelContent(obj);
                //从后台获取当前章节的带标签的富文本内容
                getSQLUEdit(chapterId)
                //260典型年选择
                if (chapterId == '260') {
                    document.getElementById('iframe-chapter').onload = function () {
                        document.getElementById('iframe-chapter').contentWindow.renderTypicalYear();
                        // document.getElementById('iframe-chapter').onload = null;
                    };
                }
            }
        });
    }
    // 目录点击隐藏和显示
    $('.hide-show-buttom').click(function (e) {
        e.preventDefault();
        if ($('.left.catalog').css('left') == '0px') {
            $('.left.catalog').css('left', '-280px');
            $('.right.content').css('left', '20px');
            $(this).css({
                'left': '20px',
                'backgroundImage': 'url(images/arrows_right.png)'
            });
        } else {
            $('.left.catalog').css('left', '0px');
            $('.right.content').css('left', '280px');
            $(this).css({
                'left': '280px',
                'backgroundImage': 'url(images/arrows.png)'
            });
        }
    });
    //点击目录获取右边模板内容
    function modelContent(obj) {
        $.ajax({
            type: "GET",
            url: `${projectPATH}/category/findId/${obj.data.id}`,
            dataType: "json",
            success: function (response) {
                $('.edit-template-content').text(response.string);
            }
        });
    }
});
// 点击目录切换表格\图表的iframe
function switchoverIframe(num) {
    $('.editBottom')
        .html('')
        .append(`<iframe id="iframe-chapter" src="./projectEditTemplate/${num}.html"  frameborder="0" width="100%"></iframe>`)
    // document.getElementById('iframe-chapter').src = `./projectEditTemplate/${num}.html`;
    // $('#iframe-chapter').attr('src', `./projectEditTemplate/${num}.html`);

}

// ueditor //////////////////////////////////////////////////////
var ue = UE.getEditor('container', {
    // 配置
});
// ue.execCommand('preview'); //预览
// // 对编辑器的操作最好在编辑器ready之后再做
ue.ready(function () {
    // 点击插入模板到富文本
    $('.edit-template-title-btn').click(function (e) {
        e.preventDefault();
        var val = $('.edit-template-content').text();
        ue.setContent(val);
    });
    // //设置编辑器的内容
    // ue.setContent();
    // //获取html内容，返回: <p>hello</p>
    // var html = ue.getContent();
    // console.log(html)
    //     //获取纯文本内容，返回: hello
    // var txt = ue.getContentTxt();

});
// 后台获取当前章节的带标签的富文本内容
function getSQLUEdit(chapterId) {
    var data = {
        versionId: window.localStorage.getItem('projectId'), //项目id
        chapterId: chapterId, //章节id
        userId: window.localStorage.getItem('userId'), //用户id
    }
    $.ajax({
        type: "POST",
        url: `${projectPATH}/user-content/getContent`,
        data: JSON.stringify(data),
        contentType: 'application/json',
        dataType: "json",
        success: function (response) {
            if (response.content !== null) {
                ue.ready(function () {
                    ue.setContent(response.content);
                })
            }
        }
    });
}
// 上传内容到后台
function addSQLUEdit(chapterId, val) {
    var data = {
        uesrName: window.localStorage.getItem('user'),
        versionId: window.localStorage.getItem('projectId'), //项目id
        chapterId: chapterId, //章节id
        userId: window.localStorage.getItem('userId'), //用户id
        content: val //传到后端的内容
    }
    $.ajax({
        type: "POST",
        url: `${projectPATH}/user-content/updateContent`,
        data: JSON.stringify(data),
        contentType: 'application/json',
        dataType: "json",
        success: function (response) {
            console.log(response)
        }
    });
}
// 点击保存
$('#save').click(function (e) {
    e.preventDefault();
    var chapterId = window.localStorage.getItem('chapterId')
    var val;
    ue.ready(function () {
        // 点击插入模板到富文本
        val = ue.getContent();
    })
    addSQLUEdit(chapterId, val)
});
//点击预览
$('#preview').click(function (e) {
    e.preventDefault();
    ue.ready(function () {
        ue.execCommand('preview');
    })
});
// ueditor end//////////////////////////////////////////////////////
// 判断是否有表格或者图片 在显示上传按钮
function showBtn() {

    if (document.getElementById('iframe-chapter').contentWindow.$('table').length !== 0 || document.getElementById('iframe-chapter').contentWindow.$('body .rose').html() !== '' || document.getElementById('iframe-chapter').contentWindow.$('body .line').html() !== '') {
        $('.btn-upload').css('display', 'block')
    } else {
        $('.btn-upload').css('display', 'none')
    }
}
// ifarm自适应高函数
function setIframeHeight(iframe) {
    if (iframe) {
        var iframeWin = iframe.contentWindow || iframe.contentDocument.parentWindow;
        if (iframeWin.document.body) {
            iframe.height = iframeWin.document.documentElement.scrollHeight || iframeWin.document.body.scrollHeight;
        }
    }
};
window.onload = function () {
    setIframeHeight(document.getElementById('iframe-chapter'));
    showBtn();//显示上传按钮
};
//上传图片到富文本
$('.btn-upload').click(function (e) {
    e.preventDefault();
    document.getElementById('iframe-chapter').contentWindow.getDataUrlBase64();
    // getDataUrlBase64()
});
$('#goBack').click(function (e) { 
    e.preventDefault();
    window.parent.location.href="../index.html";
});