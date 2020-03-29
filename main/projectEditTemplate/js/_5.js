//存放echart图的示例
var echartVar = {
    roseVar: null,
    lineVar: null
}
layui.use(['form', 'jquery'], function() {
    var form = layui.form,
        $ = layui.$;
    form.render('select');
    // 表格分析
    form.on('submit(lay-data-table)', function(data) {
        data.field.id = window.localStorage.getItem('chapterId');
        data.field.projectId = window.localStorage.getItem('projectId');
        tablePictureDada('/fives/fiveTable', data) // 请求表格数据
        tablePictureDada('/fives/fiveTableSpecial', data)
            // window.parent.showBtn()//上传按钮
        return false; //阻止表单跳转。如果需要表单跳转。
    });

});
//请求表格和折线图玫瑰图数据 方法
function tablePictureDada(url, data) {
    var loading;
    $.ajax({
        beforeSend: function() {
            loading = layer.load(0, { shade: false }); //0代表加载的风格，支持0-2
            //loading层
        },
        type: "GET",
        url: `${projectPATH}${url}`,
        data: data.field,
        contentType: '/',
        dataType: 'json',
        success: function(response) {
            console.log(response)
            switch (url) {
                case '/fives/fiveTable':
                    if (response.st !== '当前章节错误') {
                        renderTable(response)
                        window.parent.showBtn(); //上传按钮
                    }
                    break;
                case '/fives/fiveTableSpecial':
                    if (response.st !== '当前章节错误') {
                        fiveTableSpecial(response)
                        window.parent.showBtn(); //上传按钮
                    }
                    break;
            }
        },
        complete: function() {
            layer.close(loading);
        }
    });
}
// 表格渲染
function renderTable(response) {
    $('table').remove();
    $('body .rose').html('');
    $('body .line').html('');
    var data = response;
    $.each(data, function(indexInArray, valueOfElement) {
        var tabBox = $(`<table border="1" cellspacing="0" style="text-align:center;width: 100%;" class = ${indexInArray}>
        <caption>${valueOfElement.title}</caption>
        <thead></thead>
        <tbody></tbody>
        </table>`)
        $('body').append(tabBox);
        tabel(indexInArray, valueOfElement);
    });

    function tabel(indexInArray, valueOfElement) {
        var theadTr = $(`<tr></tr>`);
        $(`.${indexInArray} thead`).append(theadTr);
        var tbclass = indexInArray //table上面的class名称
        $.each(valueOfElement.tableHead, function(indexInArray, valueOfElement) {
            thead(tbclass, valueOfElement)
        });
        $.each(valueOfElement.table, function(indexInArray, valueOfElement) {
            var tr = $('<tr></tr>')
            $(`.${tbclass} tbody`).append(tr);
            tbody(valueOfElement, tr)
        });
    }
    // 表头
    function thead(tbclass, valueOfElement) {
        $(`.${tbclass} thead tr`).append($(`<td>${valueOfElement}</td>`));
    }
    // 表主要内容
    function tbody(valueOfElement, tr) { //valueOfElement还是一个对象
        $.each(valueOfElement, function(indexInArray, valueOfElement) {
            $(tr).append($(`<td>${valueOfElement}</td>`));
        });
        // ifarm自适应高
        window.parent.setIframeHeight(window.parent.document.getElementById("iframe-chapter"))
    }
};
// colspan="2"
function fiveTableSpecial(response) {
    $('table').remove();
    $('body .rose').html('');
    $('body .line').html('');
    var data = response;
    $.each(data, function(indexInArray, valueOfElement) {
        var tabBox = $(`<table border="1" cellspacing="0" style="text-align:center;width: 100%;" class = ${indexInArray}>
        <caption>${valueOfElement.title}</caption>
        <thead></thead>
        <tbody></tbody>
        </table>`)
        $('body').append(tabBox);
        tabel(indexInArray, valueOfElement);
    });

    function tabel(indexInArray, valueOfElement) {
        var theadTr = $(`<tr></tr>`);
        var tabelClass = indexInArray;
        // 表头
        $(`.${indexInArray} thead`)
            .append(theadTr)
            .find('tr')
            .append(`<td>${valueOfElement.tableHead1[0]}</td><td colspan="3">${valueOfElement.tableHead1[1]}</td><td colspan="4">${valueOfElement.tableHead1[2]}</td><td colspan="4">${valueOfElement.tableHead1[3]}</td>`);
        // 表身第一行
        var tbodytd;
        valueOfElement.tableHead2.forEach(element => {
            tbodytd += `<td>${element}</td>`
        });
        $(`.${indexInArray} tbody`)
            .append('<tr></tr>')
            .find('tr')
            .append(tbodytd)
            // 表身中间
        $.each(valueOfElement.table, function(indexInArray, valueOfElement) {
            var tr = $('<tr></tr>')
            $(`.${tabelClass} tbody`).append(tr)
            tbody(valueOfElement, tr)
        });

        function tbody(valueOfElement, tr) { //valueOfElement还是一个对象
            $.each(valueOfElement, function(indexInArray, valueOfElement) {
                $(tr).append($(`<td>${valueOfElement}</td>`));
            });
            // ifarm自适应高
            window.parent.setIframeHeight(window.parent.document.getElementById("iframe-chapter"))
        }
        // 表结尾两行
        $(`.${indexInArray} tbody`)
            .append('<tr class = "endOne"></tr>')
            .find('tr.endOne')
            .append(`<td>${valueOfElement.tableLast1[0]}</td><td colspan="3">${valueOfElement.tableLast1[1]}</td><td colspan="4">${valueOfElement.tableLast1[2]}</td><td colspan="4">${valueOfElement.tableLast1[3]}</td>`);
        $(`.${indexInArray} tbody`)
            .append('<tr class = "endTow"></tr>')
            .find('tr.endTow')
            .append(`<td>${valueOfElement.tableLast2[0]}</td><td colspan="3">${valueOfElement.tableLast2[1]}</td><td colspan="4">${valueOfElement.tableLast2[2]}</td><td colspan="4">${valueOfElement.tableLast2[3]}</td>`);
    }

}

function getDataUrlBase64() {
    var arr = [];
    for (const key in echartVar) {
        if (echartVar[key] !== null) {
            const element = echartVar[key];
            for (const key1 in element) {
                const echart = element[key1];
                var base64 = echart.getDataURL({
                    // 导出的图片分辨率比例，默认为 1。
                    pixelRatio: 2,
                    // 导出的图片背景色，默认使用 option 里的 backgroundColor
                    backgroundColor: '#fff',
                    // 导出的格式，可选 png, jpeg
                    type: 'jpeg',
                    // 忽略组件的列表，例如要忽略 toolbox 就是 ['toolbox']
                    // excludeComponents: Array.<string>,
                });
                arr.push(base64)
            }
        } else {

        }
    }
    $.ajax({
        type: "GET",
        url: `${projectPATH}/picture/insertPic`,
        data: {
            id: window.localStorage.getItem('chapterId'),
            projectId: window.localStorage.getItem('projectId'),
            listPic: arr
        },
        dataType: "JSON",
        success: function(response) {
            var str;
            response.st.forEach(element => {
                str += `<img src="${projectPATH}/${element}" style="width:100px">`
            });
            window.parent.ue.ready(function() {
                // 点击插入模板到富文本
                window.parent.ue.setContent(str, true);
            })

        }
    });
}