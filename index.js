tmpAnswer = [];
Array.prototype.shuffle = function () {
    var input = this;
    for (var i = input.length - 1; i >= 0; i--) {
        var randomIndex = Math.floor(Math.random() * (i + 1));
        var itemAtIndex = input[randomIndex];
        input[randomIndex] = input[i];
        input[i] = itemAtIndex;
    }
    return input;
}
function clone(obj){
    return JSON.parse(JSON.stringify(obj));
}
function wash (arr) {
    arr = arr.filter(item => item);
    return Array.from(new Set(arr));
}
function parsePairs (str, names) {
    var arr = wash(str.split('\n'));
    var ret = [];
    arr.forEach((line) => {
        line.replace('，',',');
        var arr = wash(line.split(','));
        arr = arr.filter(x => names.indexOf(x) > -1);
        if(arr.length >= 2) {
            ret.push(arr);
        }
    });
    return ret;
}

function parseInput() {
    var raw_names = document.getElementById("in").value;
    var number = parseInt(document.getElementById("number").value); //每组人员数量
    var names = wash(raw_names.split("\n")); //去重复元素、空元素
    var yes = document.getElementById("yes").value
    var no = document.getElementById("no").value
    if (getbrowser()) {
        // 以下两行代码在EDGE和IE下本地访问不支持
        window.sessionStorage.setItem("randomgroup-list", raw_names); //上次输入的人员名字，存入本地，下次打开时使用
        window.sessionStorage.setItem("randomgroup-number", number); //上次选择的每组数量，存入本地，下次打开时使用
        window.sessionStorage.setItem("randomgroup-yes", yes);
        window.sessionStorage.setItem("randomgroup-no", no);
    }
    yes = parsePairs(yes, names);
    no = parsePairs(no, names);
    return {
        "names" : names,
        "number" : number,
        "yes" : yes,
        "no" : no
    };
}

function solve(input) {
    if(input === undefined || input.names.length <= 0 || isNaN(input.number)) {
        return "<h3>输入不合法</h3>";
    }
    var names = input["names"];
    var unionSet = {}
    names.forEach((i) => {
        unionSet[i] = [i, 1];
    })
    var findroot = function(x) {
        return unionSet[x][0] == x ? x : unionSet[x][0] = findroot(unionSet[x][0]);
    };
    var merge = function(x, y) {
        x = findroot(x);
        y = findroot(y);
        unionSet[x][0] = y;
        unionSet[y][1] += unionSet[x][1];
        unionSet[x][1] = 0;
    };
    input["yes"].forEach((i) => {
        for (var index = 1; index < i.length; index++) {
            merge(i[0], i[index]);
        }
    })
    var conflict = function() {
        for(var j = 0; j < input["no"].length; j++) {
            var line = input["no"][j];
            for (var index = 1; index < line.length; index++) {
                if(findroot(line[0]) == findroot(line[index])) {
                    return true;
                }
            }
        }
        return false;
    }
    if(conflict()) {
        return "<h3>您的条件相互矛盾</h3>";
    }
    var number = input["number"];
    var flag = true;
    while(flag) {
        flag = false;
        for(var i = 0; i < 1000; ++i) {
            var x = Math.floor((Math.random()*names.length)), y = Math.floor((Math.random()*names.length));
            x = findroot(names[x]), y = findroot(names[y]);
            if(x == y || unionSet[x][1] + unionSet[y][1] > number) {
                continue;
            }
            var old = clone(unionSet);
            merge(x, y);
            if(conflict()) {
                unionSet = clone(old);
            } else {
                flag = true;
                break;
            }
        }
    }
    result = []
    names.forEach((x) => {
        if(findroot(x) == x) {
            result.push(names.filter(item => findroot(item) == x));
        }
    });
    return result;
}

function best_solve(input) {
    number = input["number"];
    var evaluate = (res) => {
        var ave = number / res.length;
        var delta = 0;
        res.forEach((x) => {
            delta += (ave - x.length) * (ave - x.length);
        });
        delta = Math.sqrt(delta / res.length);
        return -(res.length * 10000 + delta);
    };
    var result = solve(input);
    if(typeof(result) == "string") {
        return result;
    }
    var try10 = () => {
        for(var i = 0; i < 10; i++) {
            var new_result = solve(input);
            if(evaluate(new_result) > evaluate(result)) {
                result = clone(new_result);
            }
        }        
    }
    try10();
    number = Math.ceil(input["names"].length / Math.ceil(input["names"].length / number));
    try10();    //限制每个组的人数，有利于更均匀的分配小组
    return result;
}

function handleCopy(data) {
//    alert("正在复制" + data);
    var oInput = document.createElement("input");
    oInput.style.border = "0 none";
    oInput.style.color = "transparent";
    oInput.value = data;
    document.body.appendChild(oInput);
    oInput.select(); // 选择对象
    document.execCommand("Copy"); // 执行浏览器复制命令
    oInput.parentNode.removeChild(oInput);
}


function show(result) {
    //console.log(result);
    if(typeof(result) == "string") {
        document.getElementById("out").innerHTML = result;
    } else {
        var html = "<ul>";
        for (var i = 0; i < result.length; i++) {
            html = html + "<li><h3>第 " + (i + 1) + " 组</h3>"
            html = html + "<button type=\"button\" class=\"copy\" onclick=\"handleCopy('" + result[i].join(" ");
            html = html + "')\"> 复制 </button> <ul class='clearfix'>"
            for (j = 0; j < result[i].length; j++) {
                html = html + "<li>" + result[i][j] + "</li>";
            }
            html = html + "</ul></li>"
        }
        html = html + "</ul>";
        html = html + "<button type=\"button\" class=\"copy-all\" onclick=\"handleCopy('"
        var i = 1;
        result.forEach((group) => {
            html += "第" + i + "组:" + group.join(" ") + ";";
            i++;
        });
        html = html + "')\"> 复制所有信息 </button>"
        document.getElementById("out").innerHTML = html;
    }
}
// 判断浏览器
function getbrowser() {
    var Sys = {};
    var ua = navigator.userAgent.toLowerCase();
    var s;
    (s = ua.match(/edge\/([\d.]+)/)) ? Sys.edge = s[1] :
        (s = ua.match(/rv:([\d.]+)\) like gecko/)) ? Sys.ie = s[1] :
            (s = ua.match(/msie ([\d.]+)/)) ? Sys.ie = s[1] :
                (s = ua.match(/firefox\/([\d.]+)/)) ? Sys.firefox = s[1] :
                    (s = ua.match(/chrome\/([\d.]+)/)) ? Sys.chrome = s[1] :
                        (s = ua.match(/opera.([\d.]+)/)) ? Sys.opera = s[1] :
                            (s = ua.match(/version\/([\d.]+).*safari/)) ? Sys.safari = s[1] : 0;

    return Sys.chrome || Sys.firefox;
}

// 读取上次输入并自动保存的人员名单和组织数量，该函数里的内容在EDGE和IE下本地访问不支持
window.onload = function () {
    if (getbrowser()) {
        var namelist = window.sessionStorage.getItem("randomgroup-list");
        document.getElementById("in").value = namelist ? namelist : []; //如果是第一次打开，返回空内容

        var number = parseInt(window.sessionStorage.getItem("randomgroup-number"));
        document.getElementById("number").value = number || 6;

        var yes = window.sessionStorage.getItem("randomgroup-yes");
        document.getElementById("yes").value = yes;

        var no = window.sessionStorage.getItem("randomgroup-no");
        document.getElementById("no").value = no;
    }
}

function go() {
    input = parseInput();
    tmpAnswer = best_solve(input);
    show(tmpAnswer);
}