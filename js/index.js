
// 全局处理 阻止浏览器默认动作
(function () {
    // 全局阻止浏览器默认动作
    var app = document.querySelector('#app'); // 获取元素
    app.addEventListener('touchstart', function (event) {
       event.preventDefault();  // 阻止默认事件
    });

    // 让链接恢复链接的功能
    var aNodes = document.querySelectorAll('a[href]');  // 获取所有的超链接
    aNodes.forEach(function (aNode) {
        //监听事件
        aNode.addEventListener('touchend', function () {
            location.href = this.href;
        });
    });

})();


// 实现移动端屏幕适配
(function () {
    // 获取视口宽度
    var viewW = document.documentElement.clientWidth;

    // 计算字体大小
    var fontSize = viewW / 16;

    // 设置根元素的字体大小
    document.documentElement.style.fontSize = fontSize + 'px';
})();


// header
(function () {
    // 让input获取焦点的
    var inputNode = document.querySelector('#header input'); // 获取input元素
    inputNode.addEventListener('touchstart', function (event) {
        this.focus(); //手动获取焦点
        event.stopPropagation(); //阻止冒泡
        event.preventDefault(); // 阻止默认动作
    });
    // 失去焦点
    document.addEventListener('touchstart', function () {
        inputNode.blur();
    });


})();


// 轮播图
(function () {
    swiper({
        ele: document.querySelector('.swiper'),
        pagination: document.querySelector('.pagination'),
        isAutoPlay: true,
        gpu: true
    });
})();


// tab可拖动
(function () {
    // 获取所有tab对象
    var tabs = document.querySelectorAll('#main .tab');

    // 遍历，每一个都调用函数
    tabs.forEach(function (tab) {
        swiperTab(tab);
    });


     //@param tabNode 选项卡元素

    function swiperTab(tabNode) {
        // 获取元素
        var tabContent = tabNode.querySelector('.tab-content');
        var tabList = tabContent.querySelector('.tab-list');
        //var tabLoadings = tabContent.querySelectorAll('.tab-loading');
        //var tabNavItems = tabNode.querySelectorAll('.tab-nav a'); // 所有导航的集合
        var activeBorder = tabNode.querySelector('.active-border');  //小绿
        /*var index = 0;   // 导航的索引*/

        // 计算每个项目的宽度
        var itemWidth = tabList.offsetWidth;

        // 开启3d加速
        transformCss(tabContent, 'translateZ', 0);
        transformCss(activeBorder, 'translateZ', 0);

        // tabContent位移变化 显示中间的tabList
       transformCss(tabContent, 'translateX', -itemWidth);

        // touchstart
        tabList.addEventListener('touchstart', function (event) {
            var touch = event.changedTouches[0]; // 获取touch对象
            this.startX = touch.clientX; // 触点开始位置
            this.startY = touch.clientY; // 触点开始位置 y坐标
            this.eleX = transformCss(tabContent, 'translateX');
            this.dstX = 0;
            this.isMoveFirst = true;  //标记是否第一次触发 touchmvoe


            // 把加载图片隐藏了
            tabLoadings.forEach(function (item) {
                item.style.opacity = '0';
            });
        });
    }



})();

// 页面可以滚动
(function () {
    // 获取元素
    var app = document.querySelector('#app');
    var main = document.querySelector('#main');
    var scrollBar = document.querySelector('#scrollBar');

    // 页面滚动
    touchscroll(app, main, scrollBar);
})();
