//存放echart图的示例
var echartVar = {
    roseVar: null,
    lineVar: null,
    barVar: null
}
layui.use(['form', 'jquery', 'layer'], function() {
    var form = layui.form,
        $ = layui.$,
        layer = layui.layer;
    // 表格分析
    form.on('submit(lay-data-table)', function(data) {
        data.field.id = window.localStorage.getItem('chapterId');
        data.field.projectId = window.localStorage.getItem('projectId');
        data.field.typicalYear == undefined ? data.field.typicalYear = null : data.field.typicalYear;
        if (data.field.id == 220) {
            tablePictureDada220('/two/table', data)
        } else {
            tablePictureDada('/two/table', data) // 请求表格数据
        }
        return false; //阻止表单跳转。如果需要表单跳转。
    });
    //图片分析
    form.on('submit(lay-data-picture)', function(data) {
        data.field.id = window.localStorage.getItem('chapterId');
        data.field.projectId = window.localStorage.getItem('projectId');
        tablePictureDada('/two/tiao', data) //玫瑰图数据
        tablePictureDada('/two/zhe', data) //折线图数据
        tablePictureDada('/two/zhu', data) //柱状图数据
        return false; //阻止表单跳转。如果需要表单跳转。
    });
    //请求表格和折线图玫瑰图数据 方法
    function tablePictureDada(url, data) {
        var loading
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
                    case '/two/table':
                        renderTable(response)
                        window.parent.showBtn() //上传按钮
                        break;
                    case '/two/tiao':
                        if (response.error !== '不存在数据') {
                            renderRose(response)
                            window.parent.showBtn() //上传按钮
                        }
                        break;
                    case '/two/zhe':
                        if (response.error !== '不存在数据') {
                            renderLine(response)
                            window.parent.showBtn() //上传按钮
                        }
                        break;
                    case '/two/zhu':
                        if (response.error !== '不存在数据') {
                            renderBar(response)
                            window.parent.showBtn() //上传按钮
                        }
                        break;
                }
            },
            complete: function() {
                layer.close(loading);
            }
        });
    }
    //请求220表格单独处理
    function tablePictureDada220(url, data) {
        var loading
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
                renderTable220(response)
            },
            complete: function() {
                layer.close(loading);
            }
        });
    }
    // 220表格渲染
    function renderTable220(response) {
        $('table').remove();
        $('body .rose').html('');
        $('body .line').html('');
        var data = response;
        $.each(data, function(indexInArray, valueOfElement) {
            var tabBox = $(`<table border="1" cellspacing="0" style="text-align:center;width: 100%;" class = ${indexInArray}>
        <caption>${valueOfElement.title}</caption>
        <tbody></tbody>
        </table>`)
            $('body').append(tabBox);
            tabel(indexInArray, valueOfElement);
        });

        function tabel(indexInArray, valueOfElement) {
            var tbclass = indexInArray //table上面的class名称m
            console.log(valueOfElement)
            valueOfElement.tableHead.forEach((item, index) => {
                $(`.${tbclass} tbody`).append($(`<tr class="t${index}"><td>${item}</td></tr>`))
            });
            $.each(valueOfElement.table, function(indexInArray, valueOfElement) {
                tbody(tbclass, valueOfElement)
            });
        }

        function tbody(tbclass, valueOfElement) {
            var arr = [];
            for (const key in valueOfElement) {
                arr.push(valueOfElement[key])
            }
            $.each(arr, function(indexInArray, valueOfElement) {
                $(`.${tbclass} tbody tr`).eq(indexInArray).append(`<td>${valueOfElement}</td>`)
            });
        }
        window.parent.setIframeHeight(window.parent.document.getElementById("iframe-chapter"))
    };
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
                $('body .rose').append(`<div id="${indexInArray}Rose" style="width: 200;height:280px;"></div>`);
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
            echartVar.roseVar = roseVar;
        });
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
                var series = [];
                for (const key in valueOfElement.pictureY) {
                    var ele;
                    ele = {
                        name: valueOfElement.tableTitle[key.substring(1) - 1],
                        type: 'line',
                        data: valueOfElement.pictureY[key]
                    }
                    series.push(ele)
                }
                var option = {
                    title: {
                        text: response.title,
                        textAlign: 'center'
                    },
                    tooltip: {
                        trigger: 'axis'
                    },
                    legend: {
                        data: valueOfElement.tableTitle
                    },
                    grid: {
                        left: '3%',
                        right: '4%',
                        bottom: '3%',
                        containLabel: true
                    },
                    xAxis: {
                        type: 'category',
                        boundaryGap: false,
                        data: valueOfElement.pictureX,
                        axisLine: {
                            show: true,
                            onZero: false
                        }
                    },
                    yAxis: {
                        type: 'value'
                    },
                    series: series //纵轴数据
                };
                lineVar[varName].setOption(option); //执行
            }
            window.parent.setIframeHeight(window.parent.document.getElementById("iframe-chapter"))
            echartVar.lineVar = lineVar;
        });
    }
    //柱状图
    function renderBar(response) {
        console.log(response)
        $('table').remove();
        $('body .bar').html('')
        var barVar = {};
        $.each(response, function(indexInArray, valueOfElement) {
            if (indexInArray != 'title') {
                $('body .bar').append(`<div id="${indexInArray}bar"style="width: 100%;height:400px;"></div>`);
                var varName = `${indexInArray}Chart`; //动态定义变量名
                barVar[varName] = echarts.init(document.getElementById(`${indexInArray}bar`)); //动态赋值
                console.log(valueOfElement.title)
                option = {
                    title: {
                        text: response.title,
                        textAlign: 'center'
                    },
                    color: ['#3398DB'],
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: { // 坐标轴指示器，坐标轴触发有效
                            type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
                        }
                    },
                    grid: {
                        left: '3%',
                        right: '4%',
                        bottom: '3%',
                        containLabel: true
                    },
                    xAxis: [{
                        type: 'category',
                        data: valueOfElement.pictureX,
                        axisTick: {
                            alignWithLabel: true
                        }
                    }],
                    yAxis: [{
                        type: 'value'
                    }],
                    series: [{
                        name: valueOfElement.tableTitle,
                        type: 'bar',
                        barWidth: '60%',
                        data: valueOfElement.pictureY.y1
                    }]
                };
                barVar[varName].setOption(option); //执行
            }
            //更改iframe高度
            window.parent.setIframeHeight(window.parent.document.getElementById("iframe-chapter"))
        });
        window.parent.setIframeHeight(window.parent.document.getElementById("iframe-chapter"))
        echartVar.barVar = barVar;
    }
});
//典型年
function renderTypicalYear() {
    console.log('典型年')
    console.log($('#typicalYear'))
    $('#typicalYear').css('display', 'inline-block'); //显示下拉框
    var userId, //用户id
        projectId; //项目id
    userId = window.localStorage.userId;
    projectId = window.localStorage.projectId;
    (function() { //实际上返回ajax ，是返回ajax 里面的 deferred.promise 对象
        return $.ajax({
            type: "GET",
            async: 'false',
            url: `${projectPATH}/two/year`,
            data: '',
            dataType: "JSON",
            async: false,
        })
    })()
    .then(function(response) {
        var select = '';
        response.forEach(element => {
            select += `<option value="${element}">${element}</option>`
        });
        $('#typicalYear select').append(select)
        layui.use(['form'], function() {
            var form = layui.form;
            form.render('select');
            form.on('select(typicalYear)', function(data) {
                // console.log(data.elem); //得到select原始DOM对象
                // console.log(data.value); //得到被选中的值
                // console.log(data.othis); //得到美化后的DOM对象
                $.ajax({
                    type: "GET",
                    url: `${projectPATH}/two/typical`,
                    data: {
                        user_id: userId,
                        projectId: projectId,
                        typicalYear: data.value
                    },
                    dataType: "json",
                    success: function(response) {
                        console.log(response)
                    }
                });
            });
        })
    })

}

function getDataUrlBase64() {
    var arr = [];
    console.log(echartVar)
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
    console.log(arr)
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
            console.log(response)
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