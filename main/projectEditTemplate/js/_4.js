//存放echart图的示例
var echartVar = {
    roseVar: null,
    lineVar: null
}
layui.use(['form', 'jquery'], function() {
    var form = layui.form,
        $ = layui.$;
    // 表格分析
    form.on('submit(lay-data-table)', function(data) {
        data.field.id = window.localStorage.getItem('chapterId');
        data.field.projectId = window.localStorage.getItem('projectId');
        tablePictureDada('/four/fourTable', data) // 请求表格数据
        window.parent.showBtn() //上传按钮
        return false; //阻止表单跳转。如果需要表单跳转。
    });
    //图片提交
    form.on('submit(lay-data-picture)', function(data) {
        data.field.id = window.localStorage.getItem('chapterId');
        data.field.projectId = window.localStorage.getItem('projectId');
        tablePictureDada('/four/fourRose', data) //玫瑰图数据
        tablePictureDada('/four/fourZhexian', data) //玫瑰图数据
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
            switch (url) {
                case '/four/fourTable':
                    renderTable(response)
                    window.parent.showBtn(); //上传按钮
                    console.log(echartVar)
                    break;
                case '/four/fourRose':
                    if (response.st !== '当前章节没有玫瑰图') {
                        renderRose(response)
                        window.parent.showBtn(); //上传按钮
                        console.log(echartVar)
                            // getDataUrlBase64()
                    }
                    break;
                case '/four/fourZhexian':
                    if (response.st !== '当前章节没有折线图') {
                        renderLine(response)
                        window.parent.showBtn(); //上传按钮
                        console.log(echartVar)
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
// 玫瑰图选择
function renderRose(response) {
    console.log(response)
    $('table').remove();
    $('body .rose').html('');
    var roseVar = {};
    $.each(response, function(indexInArray, valueOfElement) {
        if (indexInArray != 'title') {
            $('body .rose').append(`<div id="${indexInArray}Rose" style="width: 220;height:280px;"></div>`);
            var varName = `${indexInArray}Chart`; //动态定义变量名
            roseVar[varName] = echarts.init(document.getElementById(`${indexInArray}Rose`)); //动态赋值
            var option = {
                angleAxis: {
                    type: 'category',
                    boundaryGap: false,
                    data: valueOfElement.picturX,
                    z: 0,
                    axisLine: {
                        show: true,
                    },
                    splitLine: {
                        show: true
                    }
                },
                radiusAxis: {
                    //反向
                },
                polar: {},
                series: [{
                    type: 'line', //radar
                    data: valueOfElement.picturY,
                    coordinateSystem: 'polar',
                    symbol: '', //点的形状
                    symbolSize: '',
                    name: valueOfElement.picturTitle,
                    // stack: 'a',
                    lineStyle: {
                        normal: {
                            color: '#0076c8'
                        }
                    },
                    areaStyle: {
                        color: '#0076c8',
                        origin: 'auto'
                    }

                }],
                color: ['#0076c8'],
                legend: {
                    show: true,
                    textStyle: {
                        color: '#0076c8'
                    },
                    data: [valueOfElement.picturTitle]
                }
            };
            roseVar[varName].setOption(option); //执行
        }
        window.parent.setIframeHeight(window.parent.document.getElementById("iframe-chapter"))
    });
    echartVar.roseVar = roseVar; //存入echart实例
}
//折线图
function renderLine(response) {
    console.log(response)
    $('table').remove();
    $('body .line').html('')
    var lineVar = {};
    $.each(response, function(indexInArray, valueOfElement) {
        if (indexInArray != 'title') {
            $('body .line').append(`<div id="${indexInArray}Line"style="width: 100%;height:400px;"></div>`);
            var varName = `${indexInArray}Chart`; //动态定义变量名
            lineVar[varName] = echarts.init(document.getElementById(`${indexInArray}Line`)); //动态赋值
            option = {
                title: {
                    text: ''
                },
                tooltip: {
                    trigger: 'axis'
                },
                legend: {
                    data: [valueOfElement.title]
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                },
                // toolbox: {  //保存图片按钮
                //     feature: {
                //         saveAsImage: {}
                //     }
                // },
                xAxis: {
                    type: 'category',
                    boundaryGap: false,
                    data: valueOfElement.x,
                    axisLine: {
                        show: true,
                        onZero: false
                    }
                },
                yAxis: {
                    type: 'value'
                },
                series: [{
                    name: valueOfElement.title,
                    type: 'line',
                    data: valueOfElement.y
                }, ]
            };
            lineVar[varName].setOption(option); //执行
        }
        window.parent.setIframeHeight(window.parent.document.getElementById("iframe-chapter"))
    });
    echartVar.lineVar = lineVar; //存入echart实例
    window.parent.setIframeHeight(window.parent.document.getElementById("iframe-chapter"))
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
                str += `<img src="${projectPATH}/${element}" style="width:50%">`
            });
            window.parent.ue.ready(function() {
                // 点击插入模板到富文本
                window.parent.ue.setContent(str, true);
            })

        }
    });
}