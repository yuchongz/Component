/*
* @Author: yucho
* @Date:   2018-01-20 19:13:29
* @Last Modified by:   yucho
* @Last Modified time: 2018-01-22 23:19:36
*/
var Carousel_figure = {
    pageInfo : {
        container : document.getElementById('container'),
        images : document.getElementById('images'),
        prev : document.getElementById('prev'),
        next : document.getElementById('next'),
        index : 1,       
        animated : false  //是否在播放动画的标志，false为动画停止状态
    },
    /* 页面初始化函数 */
    init : function () {
        var pageInfo = this.pageInfo;
        pageInfo.imgList = pageInfo.images.children;
        pageInfo.length = pageInfo.imgList.length;
        this.cloneImg();       // 克隆第一张和最后一张图片
        this.createCircle();   // 按照轮播图实际图片数制造小圆点
        pageInfo.circles = document.getElementById('circles');
        pageInfo.circleList = pageInfo.circles.children;
        pageInfo.circleList[0].classList.add('active');
        this.bindEvent();
    },
    /* 绑定事件的函数 */
    bindEvent : function () {
        var pageInfo = this.pageInfo;
        var _this = this;
        // 向前按钮的点击事件处理程序
        pageInfo.prev.onclick = function () {
            if (!pageInfo.animated) {         //当动画完成时点击才有效
                if (pageInfo.index === 1) {
                    pageInfo.index = 5;
                }else {
                    pageInfo.index -= 1;
                }
                _this.activeCircle();
                _this.animate(500);
            }
        };
        // 向后按钮的点击事件处理程序
        pageInfo.next.onclick = function () {
            if (!pageInfo.animated) {        //当动画完成时点击才有效
                if (pageInfo.index === 5) {
                    pageInfo.index = 1;
                }else {
                    pageInfo.index += 1;
                }
                _this.activeCircle();
                _this.animate(-500);
            }
        };
        pageInfo.container.onmouseover = stop;  // 鼠标移到container内部时停止轮播动画
        pageInfo.container.onmouseout = play;   // 鼠标移出container时开始轮播动画
        //给页面添加点击事件处理程序，这里用到了事件委托
        document.addEventListener('click', function (event) {
            var target = event.target;
            if (target.classList.contains('circle')) {   
                _this.circleTurn(target);
            }
        }, false);
        /* 自动运行动画 */
        function play () {
            pageInfo.timer = setInterval(function () {
                pageInfo.next.onclick();
            }, 2000);
        }
        /* 停止动画函数 */
        function stop () {
            clearInterval(_this.pageInfo.timer);
        }   
    },
    /* 复制第一张并放到最后、复制最后一张并放到最前面 */
    cloneImg : function () {
        var pageInfo = this.pageInfo;
        var cloneFirst = pageInfo.imgList[0].cloneNode(true);
        console.log(pageInfo.length);
        var cloneLast = pageInfo.imgList[pageInfo.length-1].cloneNode(true);
        pageInfo.images.insertBefore(cloneLast,pageInfo.imgList[0]);
        pageInfo.images.appendChild(cloneFirst);
    },
    /* 根据图片实际的张数来制造小圆点 */
    createCircle : function () {
        var div = document.createElement('div');   // 小圆点的外层容器
        div.className = 'circles';   // 容器的类为circles，这样才能运用写好的样式
        div.id = 'circles';
        for (var a = 0; a < this.pageInfo.length; a++) {       // for循环制造小圆点，循环的次数就是轮播图实际图片张树（不包括克隆的图片）
            var i = document.createElement('i');
            i.className = 'circle';
            i.setAttribute('index', a + 1);      // 自定义的特性，让小圆点对应到图片，index为1表示第一张图片
            div.appendChild(i);
        }
        this.pageInfo.container.appendChild(div);    
    },
    /* 动画函数，用于控制图片容器即images的偏移量及动画的速率 */
    animate : function (offset) {
        var pageInfo = this.pageInfo;
        pageInfo.animated = true;    // 把animated设置为true表示图片动画开始
        var totalTime = 300;   // 每次动画总的时间
        var interval = 15;     // 每次移动的间隔时间
        var speed = offset/(totalTime/interval);    //每次移动的偏移量
        /* 把现在图片容器images相对于轮播图容器container的偏移量加上应该新的偏移量等于动画完成后
           图片容器images相对于轮播图容器container的偏移量 */
        var newLeft = pageInfo.images.offsetLeft + offset;  
        function go() {
            /* 判断图片容器images相对于轮播图容器container的偏移量是否达到目标即newLeft，若没达到继续调用go函数 */
            if ((speed < 0 && pageInfo.images.offsetLeft > newLeft) || (speed > 0 && pageInfo.images.offsetLeft < newLeft)) {
                var newLeft1 = pageInfo.images.offsetLeft + speed;
                pageInfo.images.style.left = newLeft1 + 'px';
                setTimeout(go, interval);
            }
            /* 若偏移量已达到目标把animated置为false，并判断目前图片是否是副本，若是第1张图片副本，
            即跳到真正的第1张图,若是第5张图片副本，即跳到真正的第5张图 */
            else {    
                pageInfo.animated = false;
                if (newLeft < -2500) {
                    pageInfo.images.style.left = '-500' + 'px';
                }
                if (newLeft > -500) {
                    pageInfo.images.style.left = '-2500' + 'px';
                }
            }
        }
        go();
    },
    /* 给小圆点添加active类，让它告诉用户眼前的是第几张图片 */
    activeCircle : function () {
        var pageInfo = this.pageInfo;
        /* 添加active类前应先移除目前正在亮着的小圆点的active类 */
        for (var i = 0; i < pageInfo.length; i++) {
            if (pageInfo.circleList[i].classList.contains('active')) {
                pageInfo.circleList[i].classList.remove('active');
                break;
            }
        }
        pageInfo.circleList[pageInfo.index-1].classList.add('active');
    },
    /* 当点击小圆点时，控制小圆点的样式变化及图片的跳转 */
    circleTurn : function (elm) {
        var newIndex = parseInt(elm.getAttribute('index'));
        var index = this.pageInfo.index;
        if (newIndex === index) {   // 当用户点击的小圆点正亮着，则不做任何操作
            return;
        }
        var offset = (newIndex - index) * -500; 
        this.animate(offset);
        this.pageInfo.index = newIndex;
        this.activeCircle();
    }
};
Carousel_figure.init();
