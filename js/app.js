// Code by (c) LiYan

// Copyright (C) 2017 LiYan

// Licensed under the MIT License;
// You may obtain a copy of the License at
// https://opensource.org/licenses/MIT

!function () {
    'use strict'

    var app = {
        todos: {
            top: 0,
            nodes: [
                {
                    "eventname": "iPhone发布",
                    "theday": "2007-1-9 周二"
                }
            ]
        },
        sticky: document.querySelector('.sticky'),
        eventTemplate: document.querySelector('.eventTemplate'),
        events: document.querySelector('.events'),
        eventadd: document.querySelector('.eventadd'),
        inputname: document.querySelector('#eventname'),
        inputday: document.querySelector('#theday'),
        sticky: document.querySelector('.sticky'),
        editname: document.querySelector('#editname'),
        editday: document.querySelector('#editday')
    }

    // 将节点元素node用数据data进行渲染
    app.renderNode = function (node, data) {
        // TODO 以“XX年X月X日”格式显示剩余
        var theday = data.theday.split(' ')[0].split('-'),
            year = theday[0],
            month = theday[1] - 1,
            day = theday[2],
            now = new Date(),
            thisyear = now.getFullYear(),
            thismonth = now.getMonth(),
            thisday = now.getDay(),
            thedayDate = new Date(year, month, day),
            datedelta = thedayDate - now,
            daysleft = Math.ceil(datedelta / 86400000)

        node.removeAttribute('hidden');
        node.classList.remove('eventTemplate')
        if (daysleft >= 0) {
            node.querySelector('.description').textContent = node.querySelector('.eventname').textContent = '距离' + data.eventname
        } else {
            node.querySelector('.description').textContent = node.querySelector('.eventname').textContent = data.eventname + '已经'
            if (node.querySelector('.secondary-content')) {
                node.querySelector('.daysleft').classList.remove('blue')
                node.querySelector('.daysleft').classList.add('amber')
                node.querySelector('.secondary-content').classList.remove('blue')
                node.querySelector('.secondary-content').classList.add('amber')
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
        // iOS上new Date('yyyy-mm-dd')格式错误
        var stringa = a.theday.split(' ')[0].split('-')
        var stringb = b.theday.split(' ')[0].split('-')
        var datea = new Date(stringa[0], stringa[1] - 1, stringa[2])
        var dateb = new Date(stringb[0], stringb[1] - 1, stringb[2])
        var now = new Date()
        var deltaa = datea - now + 86400000
        var deltab = dateb - now + 86400000
        if (deltaa >= 0 && deltab >= 0) {
            return deltaa - deltab
        } else if (deltaa < 0 && deltab < 0) {
            return deltab - deltaa
        } else {
            if (deltaa < 0) {
                return 1
            } else {
                return -1
            }
        }
    }
    // 添加事件
    app.addEvent = function () {
        var todos = JSON.parse(localStorage.todos)
        var nodes = todos.nodes
        var thisEventname = app.inputname.value
        var thisTheday = app.inputday.value
        if (!thisEventname || !thisTheday) { return }

        var newevent = {
            "eventname": thisEventname,
            "theday": thisTheday
        }
        nodes.push(newevent)
        nodes = nodes.sort(app.cmp)
        todos.nodes = nodes
        localStorage.setItem('todos', JSON.stringify(todos))

        var newindex = todos.nodes.indexOf(newevent)
        var cloneNode = app.eventTemplate.cloneNode(true)
        app.renderNode(cloneNode, newevent)
        document.querySelectorAll('.collection-item')[newindex].insertAdjacentElement('afterend', cloneNode)
        // 为新节点按钮添加事件处理函数
        cloneNode.querySelector('.removebtn').addEventListener('click', app.removeEvent)
        cloneNode.querySelector('.topbtn').addEventListener('click', app.makeTop)
        app.inputname.value = ''
        app.inputday.value = ''
    }
    document.querySelector('.addeventbtn').addEventListener('click', app.addEvent)
    // 删除事件
    app.removeEvent = function () {
        var activeNode = document.querySelector('.collection-item.active')
        var activeIndex = Array.from(app.events.children).indexOf(activeNode) - 1
        var todos = JSON.parse(localStorage.todos)
        var nodes = todos.nodes
        // 删除当前节点DOM
        app.events.removeChild(activeNode)
        // 更改缓存数据
        nodes.splice(activeIndex, 1)
        todos.nodes = nodes
        localStorage.setItem('todos', JSON.stringify(todos))
        // 如果删除节点事件为置顶节点事件
        if (activeIndex == todos.top) {
            if (nodes.length !== 0) {
                app.renderNode(app.sticky, nodes[0])
            } else {
                // 如果事件被全部删除，用初始事件渲染置顶节点
                app.renderNode(app.sticky, app.todos.nodes[0])
            }
        }
    }
    // 为所有删除按钮添加时间监听
    Array.from(document.querySelectorAll('.removebtn')).forEach(
        function (element) {
            element.addEventListener('click', app.removeEvent)
        }
    )
    // 置顶事件
    app.makeTop = function () {
        var activeNode = document.querySelector('.collection-item.active')
        var activeIndex = Array.from(app.events.children).indexOf(activeNode) - 1
        var todos = JSON.parse(localStorage.todos)
        var nodes = todos.nodes
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
        var activeNode = document.querySelector('.collection-item.active')
        var activeIndex = Array.from(app.events.children).indexOf(activeNode) - 1
        var todos = JSON.parse(localStorage.todos)
        var nodes = todos.nodes
        nodes[activeIndex] = {
            "eventname": app.editname.value,
            "theday": app.editday.value
        }
        todos.nodes = nodes
        localStorage.setItem('todos', JSON.stringify(todos))
        app.renderNode(activeNode, nodes[activeIndex])
        if (activeIndex == todos.top) {
            app.renderNode(app.sticky, nodes[activeIndex])
        }
    }
    document.querySelector('.savebtn').addEventListener('click', app.editEvent)

    // MaterialCSS模块初始化
    $(document).ready(function () {
        $('.modal').modal();
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
            selectYears: 50
        });
    });
    // 注册ServiceWorker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker
            .register('./service-worker.js')
            .then(function () { console.log('Service Worker Registered'); });
    }
}()
