(function (w) {
    w.swiper = function(options) {

        /**
         * options:
         *   ele: swiper包裹元素
         *   pagination: 小圆点的包裹元素
         *   isAutoPlay: 是否开启自动轮播
         *   delay: 自动播放的时间间隔
         *   gpu: 是否开启3d加速
         * */

        if (!options.ele) {
            console.error('请指定ele选项!');
            return;
        }

        var swiper = options.ele;
        var swiperWrapper = swiper.querySelector('.swiper-wrapper');
        var pagination = options.pagination || null;
        var isAutoPlay = options.isAutoPlay || false;
        var delay = options.delay || 5000;
        var gpu = true;
        if (options.gpu !== undefined && !options.gpu) { // 调用传值了且传递是false
            gpu = false;
        }

        var index = 0;  // 当前的swiper项目的索引

        // 给swiper元素添加类
        swiper.classList.add('swiper');

        // 获取此时swiper项目的数量
        var itemLength = swiper.querySelectorAll('.swiper-item').length;

        // 开启3d加速
        if (gpu) {
            transformCss(swiperWrapper, 'translateZ', 0);
        }

        // 如果指定pagination的话， 根据swiper项目的数量生成小圆点
        if (pagination) {
            pagination.classList.add('pagination');
            for (var i = 0; i < itemLength; i ++) {
                var span = document.createElement('span');
                pagination.appendChild(span);
            }

            var paginationItems = pagination.querySelectorAll('span');
        }



        // 把所有的swiperItem复制一份
        swiperWrapper.innerHTML += swiperWrapper.innerHTML;

        // 获取所有swiperItems的集合
        var swiperItems = swiper.querySelectorAll('.swiper-item');

        // 样式布局计算
        swiperWrapper.style.width = swiperItems.length * 100 + '%';
        swiperItems.forEach(function (item) {
            item.style.width = 100 / swiperItems.length + '%';
        });

        // 设置默认显示
        setSwiper(index);


        if (isAutoPlay) {
            // 自动播放
            var timeId = setInterval(autoPlay, delay);
        }


        // 在过渡完成之后，判断如果到达临界点，快速切换
        swiperWrapper.addEventListener('transitionend', function () {
            // 判断如果到达临界点，快速切换
            if (index >= swiperItems.length - 1) {
                index = itemLength - 1;
                swiperWrapper.style.transition = 'none';
                transformCss(swiperWrapper, 'translateX', -index * swiper.clientWidth);
            }
        });

        // 触摸开始事件
        swiper.addEventListener('touchstart', function (event) {

            if (isAutoPlay) {
                // 取消定时
                clearInterval(timeId);
            }


            // 取消过渡效果
            swiperWrapper.style.transition = 'none';

            // 设置无缝
            if (index <= 0) {
                index = itemLength;
                transformCss(swiperWrapper, 'translateX', -index * swiper.clientWidth);
            } else if (index >= swiperItems.length - 1) {
                index = itemLength - 1;
                transformCss(swiperWrapper, 'translateX', -index * swiper.clientWidth);
            }

            var touch = event.changedTouches[0]; // 获取touch对象
            this.startX = touch.clientX;   // 获取触点的起始位置 并赋值给swiper对象的属性
            this.startY = touch.clientY;   // 触点起始位置 y坐标
            this.eleLeft = transformCss(swiperWrapper, 'translateX'); // 初始位置
            this.startTime = (new Date).getTime(); // 触摸开始时间
            this.isMoveFirst = true;  //标记是否touchstart之后第一次触发touchmove事件
            this.isHorizontal = true;  // 是否正在执行水平逻辑
        });

        // 触摸移动事件
        swiper.addEventListener('touchmove', function (event) {
            // 如果不执行水平逻辑，放弃
            if (!this.isHorizontal) {
                return;
            }

            var touch = event.changedTouches[0];  // 获取touch对象
            var endX = touch.clientX; // 获取触点的结束位置
            var endY = touch.clientY; // 获取触点的结束位置 Y坐标

            // 计算触点的间距 x方向
            this.dstX = endX - this.startX; // 把值赋值给swiper对象属性
            var dstY = endY - this.startY;  // y方向的距离

            // 只有第一次触发move事件后，去判断执行水平逻辑还是垂直逻辑


            if (this.isMoveFirst) {
                this.isMoveFirst = false; // 不再是第一次了
                // 如果垂直方向上的距离大于水平方向，此时执行水平逻辑，且整个过程都执行水平逻辑
                if (Math.abs(dstY) > Math.abs(this.dstX)) {
                    this.dstX = 0; // 重新设置水平移动距离为0；
                    this.isHorizontal = false;  // 表示不执行水平逻辑
                    return;
                }
            }


            // 设置swiper-wrapper 的位置
            transformCss(swiperWrapper, 'translateX', this.eleLeft + this.dstX);


            event.preventDefault();  // 阻止默认动作
            event.stopPropagation();  // 阻止冒泡

        });

        // 触摸离开事件
        swiper.addEventListener('touchend', function (event) {
            // 设置过渡
            swiperWrapper.style.transition = '.5s';

            // 计算结束触摸时间差
            var dstTime = (new Date).getTime() - this.startTime;
            if (dstTime < 200) {
                // 判断向左滑动还是向右滑动
                if (this.dstX < 0) { // 向左滑动  下一张 间距是负值
                    index ++;
                } else if (this.dstX > 0) {  // 向右滑动   上一张 间距是正值
                    index --;
                }
            } else {
                // 计算索引
                index = - Math.round(transformCss(swiperWrapper, 'translateX') / swiper.clientWidth);
            }



            // 调用函数设置位置以及小圆点
            setSwiper(index);

            // 手指离开之后 定时继续
            if (isAutoPlay) {
                timeId = setInterval(autoPlay, delay);
            }


        });


        // 设置swiper位置和小圆点
        function setSwiper(m) {
            // 判断索引范围
            if (m < 0) {
                m = 0;
            } else if (m > swiperItems.length - 1) {
                m = swiperItems.length - 1;
            }

            // 设置swiperWrapper位置
            transformCss(swiperWrapper, 'translateX', -m * swiper.clientWidth);


            if (pagination) {
                // 去掉所有小圆点的 active类
                paginationItems.forEach(function (item) {
                    item.classList.remove('active');
                });

                // 当前的小圆点高亮 添加active
                paginationItems[m % paginationItems.length].classList.add('active');
            }



            index = m; // 给全局索引重置赋值
        }

        // 自动播放 定时函数
        function autoPlay() {
            // 索引 + 1
            index ++;
            // 先滑动古来
            swiperWrapper.style.transition = '.5s';
            setSwiper(index);

        }
    }
})(window);