// Code by (c) LiYan

// Copyright (c) 2017 LiYan
// Licensed under the MIT License;
// You may obtain a copy of the License at
// https://opensource.org/licenses/MIT

!function () {
    'use strict'

    var app = {
        todos: {
            top: 0,
            nodes: [{
                    "eventname": "AlphaGo击败人类",
                    "theday": "2016-3-15 周二"
            }]
        },
        sticky: document.querySelector('.sticky'),
        eventTemplate: document.querySelector('.eventTemplate'),
        events: document.querySelector('.events'),
        eventadd: document.querySelector('.eventadd'),
        inputname: document.querySelector('#eventname'),
        inputday: document.querySelector('#eventday'),
        sticky: document.querySelector('.sticky'),
        editname: document.querySelector('#editname'),
        editday: document.querySelector('#editday')
    }

    // 将节点元素node用数据data进行渲染
    app.renderNode = function (node, data) {
        var theday = data.theday.split(' ')[0].split('-'),
            year = theday[0],
            month = theday[1] - 1,
            day = theday[2],
            now = new Date(),
            thedayDate = new Date(year, month, day),
            datedelta = thedayDate - now,
            daysleft = Math.ceil(datedelta / 86400000)

        node.removeAttribute('hidden');
        node.classList.remove('eventTemplate')
        if (daysleft >= 0) {
            node.querySelector('.description').textContent = node.querySelector('.eventname').textContent 
                                                           = '距离' + data.eventname
        } else {
            node.querySelector('.description').textContent = node.querySelector('.eventname').textContent 
                                                           = data.eventname + '已经'
            if (node.querySelector('.secondary-content')) {
                node.querySelector('.daysleft').classList.remove('blue')
                node.querySelector('.daysleft').classList.add('orange')
                node.querySelector('.secondary-content').classList.remove('blue')
                node.querySelector('.secondary-content').classList.add('orange')
            }
        }
        node.querySelector('.daysleft').textContent = Math.abs(daysleft)
        node.querySelector('.cardDaysleft').textContent = Math.abs(daysleft) + '天'
        node.querySelector('.theday').textContent = data.theday

    }
    // 初始化页面
    app.init = function () {
        if (!localStorage.todos || JSON.parse(localStorage.todos).nodes.length == 0) {
            var todos = app.todos
            localStorage.todos = JSON.stringify(todos)
        } else {
            var todos = JSON.parse(localStorage.todos)
        }

        app.renderNode(app.sticky, todos.nodes[todos.top])
        for (let node of todos.nodes) {
            let cloneNode = app.eventTemplate.cloneNode(true)
            app.renderNode(cloneNode, node)
            app.events.appendChild(cloneNode)
        }
    }
    app.init()
    // 按事件时间排序函数
    app.cmp = function cmp(a, b) {
        var stringa = a.theday.split(' ')[0].split('-'),
            stringb = b.theday.split(' ')[0].split('-'),
            datea = new Date(stringa[0], stringa[1] - 1, stringa[2]),
            dateb = new Date(stringb[0], stringb[1] - 1, stringb[2]),
            now = new Date(),
            deltaa = datea - now + 86400000,
            deltab = dateb - now + 86400000
        if (deltaa >= 0 && deltab >= 0) {
            return deltaa - deltab
        } else {
            return deltab - deltaa
        } 
    }
    // 添加事件
    app.addEvent = function () {
        var todos = JSON.parse(localStorage.todos),
            nodes = todos.nodes,
            thisEventname = app.inputname.value,
            thisTheday = app.inputday.value
        if (!thisEventname || !thisTheday) { return }

        var newevent = {
            "eventname": thisEventname,
            "theday": thisTheday
        }
        nodes.push(newevent)
        nodes = nodes.sort(app.cmp)

        var newindex = todos.nodes.indexOf(newevent),
            cloneNode = app.eventTemplate.cloneNode(true)
        app.renderNode(cloneNode, newevent)
        document.querySelectorAll('.collection-item')[newindex]
                .insertAdjacentElement('afterend', cloneNode)
        cloneNode.querySelector('.removebtn').addEventListener('click', app.removeEvent)
        cloneNode.querySelector('.topbtn').addEventListener('click', app.makeTop)
        cloneNode.querySelector('.cardDaysleft').addEventListener('click', app.toggleFormat)
        app.inputname.value = ''
        app.inputday.value = ''
        todos.nodes = nodes
        if (newindex <= todos.top) {
            todos.top++
        }
        localStorage.setItem('todos', JSON.stringify(todos))
    }
    document.querySelector('.addeventbtn').addEventListener('click', app.addEvent)

    // 删除事件
    app.removeEvent = function () {
        var activeNode = document.querySelector('.collection-item.active'),
            activeIndex = Array.from(app.events.children).indexOf(activeNode) - 1,
            todos = JSON.parse(localStorage.todos),
            nodes = todos.nodes
        app.events.removeChild(activeNode)
        nodes.splice(activeIndex, 1)
        todos.nodes = nodes
        if (activeIndex == todos.top) {
            todos.top = 0
            if (nodes.length !== 0) {
                app.renderNode(app.sticky, nodes[0])
            } else {
                app.renderNode(app.sticky, app.todos.nodes[0])
            }
        } else if (activeIndex < todos.top) {
            todos.top--
        }
        localStorage.setItem('todos', JSON.stringify(todos))
    }
    Array.from(document.querySelectorAll('.removebtn')).forEach(
        function (element) {
            element.addEventListener('click', app.removeEvent)
        }
    )
    // 置顶事件
    app.makeTop = function () {
        console.log(898)
        var activeNode = document.querySelector('.collection-item.active'),
            activeIndex = Array.from(app.events.children).indexOf(activeNode) - 1,
            todos = JSON.parse(localStorage.todos),
            nodes = todos.nodes
        todos.top = activeIndex
        localStorage.setItem('todos', JSON.stringify(todos))
        app.renderNode(app.sticky, nodes[todos.top])
    }
    Array.from(document.querySelectorAll('.topbtn')).forEach(
        function (element) {
            element.addEventListener('click', app.makeTop)
        }
    )
    // 编辑事件
    app.editEvent = function () {
        var activeNode = document.querySelector('.collection-item.active'),
            activeIndex = Array.from(app.events.children).indexOf(activeNode) - 1,
            todos = JSON.parse(localStorage.todos),
            nodes = todos.nodes,
            editEventname = app.editname.value,
            editTheday = app.editday.value
        if (!editEventname || !editTheday) {return}
        var newevent = {
            "eventname": editEventname,
            "theday": editTheday
        }
        nodes[activeIndex] = newevent
        app.renderNode(activeNode, newevent)
        // 删除原节点并按新顺序插入新节点
        nodes.sort(app.cmp)
        var newindex = nodes.indexOf(newevent),
            backupNode = activeNode.cloneNode(true)
        app.events.removeChild(activeNode)
        backupNode.querySelector('.removebtn').addEventListener('click', app.removeEvent)
        backupNode.querySelector('.topbtn').addEventListener('click', app.makeTop)
        backupNode.querySelector('.cardDaysleft').addEventListener('click', app.toggleFormat)
        document.querySelectorAll('.collection-item')[newindex]
                .insertAdjacentElement('afterend', backupNode)
        if (activeIndex == todos.top) {
            app.renderNode(app.sticky, newevent)
            todos.top = newindex
        } else if (activeIndex > todos.top && newindex <= todos.top) {
            todos.top++
        } else if (activeIndex < todos.top && newindex >= todos.top) {
            todos.top--
        }
        todos.nodes = nodes
        localStorage.setItem('todos', JSON.stringify(todos))  
    }
    document.querySelector('.savebtn').addEventListener('click', app.editEvent)


    // ***************************************************
    // 
    // “年-月-日”日期计算函数，计算日期date与今日的差，
    // 如果是同一天，则返回“0天”，
    // 否则，返回“X年X月X日”或“X月X日”或“X日”
    // 
    // ***************************************************
    app.getFullDelta = function(date) {
        var now = new Date(),
            yearNow = now.getFullYear(),
            monthNow = now.getMonth(),
            dayNow = now.getDate(),
            yearDelta = 0, monthDelta = 0, dayDelta = 0,
            days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
        
        if (-86400000 < date - now && date - now < 0) {
            return '0天'
        } else {
            var smalldate = new Date(yearNow, monthNow, dayNow),
                bigdate
            date - smalldate > 0 ? bigdate = date : [bigdate, smalldate] = [smalldate, date]
            let bigyear = bigdate.getFullYear()
            if (bigyear % 400 == 0 || (bigyear % 4 == 0 && bigyear % 100 !== 0)) {
                days[1] = 29
            }
            smalldate.setFullYear(smalldate.getFullYear() + 1)
            while (bigdate - smalldate >= 0) {
                yearDelta++
                smalldate.setFullYear(smalldate.getFullYear() + 1)
            }

            if (bigdate.getFullYear() < smalldate.getFullYear()) {
                smalldate.setFullYear(smalldate.getFullYear() - 1)
                if (bigdate.getDate() >= smalldate.getDate()) {
                    monthDelta = bigdate.getMonth() - smalldate.getMonth()
                    dayDelta = bigdate.getDate() - smalldate.getDate()
                } else {
                    monthDelta = bigdate.getMonth() - smalldate.getMonth() - 1
                    dayDelta = days[bigdate.getMonth() - 1] - smalldate.getDate() + bigdate.getDate()
                }
            } else {
                var monthDeltaA = 11 - smalldate.getMonth(),
                    monthDeltaB,
                    dayDelta
                if (bigdate.getDate() >= smalldate.getDate()) {
                    monthDeltaB = bigdate.getMonth() + 1
                    dayDelta = bigdate.getDate() - smalldate.getDate()
                } else {
                    monthDeltaB = bigdate.getMonth()
                    dayDelta = days[bigdate.getMonth() - 1] - smalldate.getDate() + bigdate.getDate()
                }
                monthDelta = monthDeltaA + monthDeltaB
            }
            if (yearDelta !== 0) {
                return yearDelta + '年' + monthDelta + '月' + dayDelta + '天'
            }
            if (monthDelta !== 0) {
                return monthDelta + '月' + dayDelta + '天'
            }
            return dayDelta + '天'
        }
    }

    // 点击卡片日期转换日期显示格式
    app.toggleFormat = function (e) {
        var target = e.target,
            index = Array.from(document.querySelectorAll('.cardDaysleft')).indexOf(target) - 2,
            todos = JSON.parse(localStorage.todos),
            theday
        index < 0 ? theday = todos.nodes[todos.top].theday.split(' ')[0].split('-')
                  : theday = todos.nodes[index].theday.split(' ')[0].split('-')
        var targetDate = new Date(theday[0], theday[1] - 1, theday[2]),
            now = new Date(),
            daysDelta = Math.abs(Math.ceil((targetDate - now) / 86400000)),
            fullDelta = app.getFullDelta(targetDate)

        if (target.classList.toggle('full')) {
            target.textContent = fullDelta
            if (fullDelta.length > 3) {
                target.style.fontSize = '50px'
            }
            if (fullDelta.length > 6) {
                target.style.fontSize = '40px'
            }
        } else {
            target.textContent = daysDelta + '天'
            target.style.fontSize = '60px'
        }
    }
    Array.from(document.querySelectorAll('.cardDaysleft')).forEach(
        function (element) {
            element.addEventListener('click', app.toggleFormat)
        }
    )

    // MaterialCSS模块初始化
    $(document).ready(function () {
        $('#modal1').modal();
        $('#modal2').modal({
            ready: function (modal, trigger) {
                var activeNode = document.querySelector('.collection-item.active'),
                    activeIndex = $('.collection-item').index(activeNode) - 1,
                    todos = JSON.parse(localStorage.todos)
                $('#editname').val(todos.nodes[activeIndex].eventname)
                $('#editname').next().addClass('active')
                $('#editday').val(todos.nodes[activeIndex].theday)
                $('#editday').next().addClass('active')
            }
        });
        $('.datepicker').pickadate({
            monthsFull: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
            monthsShort: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
            weekdaysFull: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
            weekdaysShort: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
            today: '今日',
            clear: '清除',
            close: '确认',
            format: 'yyyy-m-d ddd',
            container: '#datepicker',
            selectMonths: true,
            selectYears: 100
        });
    });
    // 注册ServiceWorker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker
            .register('./service-worker.js')
            .then(function () { console.log('Service Worker Registered'); });
    }
}()
