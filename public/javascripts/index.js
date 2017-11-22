/*获取对象*/
function $(s) {
    return document.querySelectorAll(s);
}
var lis = $("#list li");
for (var i = 0; i < lis.length; i++) {
    lis[i].onclick = function () {
        for (var j = 0; j < lis.length; j++) {
            lis[j].className = "";

        }
        this.className = "selected";
        load("/media/" + this.title);//点击歌名就向服务器请求
    }
}

/**创建ajax异步请求 */
var xhr = new XMLHttpRequest();
/* 创建AudioContext对象*/
var ac = new (window.AudioContext || window.webkitAudioContext)();
var gainNode = ac[ac.createGain ? "createGain" : "createGainNode"]();/*改变音频大小对象*/
gainNode.connect(ac.destination);//连接到destination

var analyser = ac.createAnalyser();//分析音频对象
var size = 128;
analyser.fftSize = size * 2;
analyser.connect(gainNode);

var source = null;
var count = 0;
var box = $("#box")[0];
var height, width;
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
box.appendChild(canvas);
var Dots = [];
function random(m, n) {
    return Math.round(Math.random() * (n - m) + m);
}
function getDots() {
    Dots = [];
    for (var i = 0; i < size; i++) {
        var x = random(0, width);
        var y = random(0, height);
        var color = "rbg(" + random(0, 255) + "," + random(0, 255) + "," + random(0, 255) + ")";
        Dots.push({
            x: x,
            y: y,
            color: color
        });
    }
}
var line;//全局变量，解决换了dot模式回不来
function resize() {
    height = box.clientHeight;
    width = box.clientWidth;
    canvas.height = height;
    canvas.width = width;
    line = ctx.createLinearGradient(0, 0, 0, height);
    line.addColorStop(0, "red");
    line.addColorStop(0.5, "yellow");
    line.addColorStop(1, "green");
  
    getDots();
}
resize();
window.onresize = resize;

function draw(arr) {
    ctx.clearRect(0, 0, width, height);
    var w = width / size;
    ctx.fillStyle = line;
    for (var i = 0; i < size; i++) {
        if (draw.type == "column") {
            var h = arr[i] / 256 * height;
            ctx.fillRect(w * i, height - h, w * 0.6, h);
        } else if (draw.type == "dot") {
            ctx.beginPath();//告诉浏览器重新绘图
            var o = Dots[i];
            var r = arr[i] / 256 * 50;
            ctx.arc(o.x, o.y, r, 0, Math.PI * 2, true);
            var g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, r);
            g.addColorStop(0, "#fff");
            g.addColorStop(1,"#4e4e4e");
            ctx.fillStyle = g;
            ctx.fill();
            // ctx.strokeStyle = "#fff";
            // ctx.stroke();
        }
    }
}
draw.type = "column";
var types = $("#type li");
for (var i = 0; i < types.length; i++) {
    types[i].onclick = function () {
        for (var j = 0; j < types.length; j++) {
            types[j].className = "";
        }
        this.className = "selected";
        draw.type = this.getAttribute("data-type");
    }
}

function load(url) {
    var n = ++count;
    source && source[source.stop ? "stop" : "noteOff"]();
    xhr.abort();//停止上一次请求，不过上一次有没有
    xhr.open("GET", url);
    xhr.responseType = "arraybuffer";
    xhr.onload = function () {
        if (n != count) {
            return;
        }
        /*将异步请求回来的二进制资源解码*/
        ac.decodeAudioData(xhr.response, function (buffer) {
            if (n != count) {
                return;
            }
            var bufferSource = ac.createBufferSource();/*创建bufferSource对象*/
            bufferSource.buffer = buffer;
            bufferSource.connect(analyser);
            bufferSource[bufferSource.start ? "start" : "noteOn"](0);
            source = bufferSource;
        }, function (err) {
            console.log(err);
        })
    }
    xhr.send();
}

function visualizer() {
    /*将分析得到的数据传给数组arr */
    var arr = new Uint8Array(analyser.frequencyBinCount);

    requestAnimationFrame = window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame;
    function v() {
        analyser.getByteFrequencyData(arr);
        //console.log(arr);
        draw(arr);
        requestAnimationFrame(v);
    }
    requestAnimationFrame(v);
}
visualizer();
/*调音量 */
function changeVolume(percent) {
    gainNode.gain.value = percent * percent;
}
$("#volume")[0].onchange = function () {
    changeVolume(this.value / this.max);
}
$("#volume")[0].onchange();