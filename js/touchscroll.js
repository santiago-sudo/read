(function (w) {
    /**
     * @param wrap 包裹元素
     * @param inner 内容元素
     * @param scrollBar 滚动条，可选； 不给参数，没有滚动条
     * @param callback 回调函数组成的对象  {start:fn, move: fn, end:fn}
     * */
    w.touchscroll = function (wrap, inner, scrollBar, callback) {


        var timeId = null;   // 定义标记

        // 滚动条相关设置
        if (scrollBar) {
            var scale2 = wrap.clientHeight / inner.offsetHeight;  // 计算比例
            scrollBar.style.height = wrap.clientHeight * scale2 + 'px';   // 设置滚动条高度

            // 页面初始 隐藏滚动条
            scrollBar.style.transition = 'none';
            scrollBar.style.opacity = 0;  //滚动条隐藏

            transformCss(scrollBar, 'translateZ', 0);  //滚动条元素开启加速
        }

        // 内容元素开启3d加速
        transformCss(inner, 'translateZ', 0);


        // toustart
        wrap.addEventListener('touchstart', function (event) {
            var touch = event.changedTouches[0];  // 获取touch对象
            this.startY = touch.clientY; // 触点开始位置
            this.startTime = (new Date).getTime();  // 触点开始时间
            this.eleY = transformCss(inner, 'translateY');  // 元素起始位置
            this.dstY = 0;  // 滑动间距初始化

            // 清除定时 过渡暂停
            clearInterval(timeId);

            // 显示滚动条
            if (scrollBar) {
                scrollBar.style.transition = 'opacity .5s';
                scrollBar.style.opacity = '1';
            }

            // 如果存在回调函数
            if (callback && typeof callback['start'] === 'function') {
                callback['start']();
            }
        });

        // touchmove
        wrap.addEventListener('touchmove', function (event) {
            var touch = event.changedTouches[0];  //获取触点对象
            var endY = touch.clientY;  //触点结束位置
            this.dstY = endY - this.startY;  //滑动距离

            // 计算元素偏移量
            var translateY = this.eleY + this.dstY;

            // 橡皮筋 到达临界点之后
            if (translateY > 0) {
                var scale = 1 - (translateY / (wrap.clientHeight * 2));
                translateY *= scale;
            } else if (translateY < (wrap.clientHeight - inner.offsetHeight)) {
                var bottomValue = wrap.clientHeight - (inner.offsetHeight + translateY);
                var scale = 1 - (bottomValue / (wrap.clientHeight * 2));
                bottomValue *= scale;
                translateY = wrap.clientHeight - inner.offsetHeight - bottomValue;
            }

            // 设置位置
            transformCss(inner, 'translateY', translateY);

            // 滚动条位置
            if (scrollBar) {
                var scrollBarY = -translateY * scale2;
                transformCss(scrollBar, 'translateY', scrollBarY);  // 设置滚动条位置
            }

            // 如果指定了回调函数
            if (callback && typeof callback['move'] === 'function') {
                callback['move']();
            }
        });


        // touchend
        wrap.addEventListener('touchend', function () {
            var endTime = (new Date).getTime();
            var dstTime = endTime - this.startTime;

            // 计算速度
            var speed = this.dstY / dstTime * 200;

            // 加上速度距离
            var translateY = transformCss(inner, 'translateY') + speed;

            var type = 'sineEaseInOut';  //过渡函数类型
            // 临界值
            if (translateY > 0) {
                translateY = 0;
                type = 'backEaseOut';
            } else if (translateY < (wrap.clientHeight - inner.offsetHeight)) {
                translateY = wrap.clientHeight - inner.offsetHeight;
                type = 'backEaseOut';
            }

            // 调用过渡函数，改变位置
            tweenMove(translateY, 500, type);

        });


        /**
         * @param target 目标位置；
         * @param duration 过渡持续时间；
         * @pram type 过渡类型   Linear（匀速）、backEaseOut（回弹）、sineEaseInOut（加速再减速）
         */
        function tweenMove(target, duration, type) {
            // 清除定时 防止之前有定时没有完成
            clearInterval(timeId);

            // 定义Tween类
            var Tween = {
                Linear: function(t,b,c,d){ return c*t/d + b; },
                backEaseOut: function(t,b,c,d,s){
                    if (s == undefined) s = 1.70158;
                    return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
                },
                sineEaseInOut: function(t,b,c,d){
                    return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
                }
            };

            // 指定相关设置
            var t = 0;  //开始时间
            var b = transformCss(inner, 'translateY');   // 初始位置
            var c = target - b;  // 位置变化量
            var d = duration;   // 持续时间
            var delay = 20;     // 定时的间隔

            // 开启定时
            timeId = setInterval(function () {
                t += delay;  // 开始时间，每次都要变化
                var currVal = Tween[type](t, b, c, d);  // 获取当前位置

                // 设置inner的位置
                transformCss(inner, 'translateY', currVal);

                // 设置滚动条位置
                if (scrollBar) {
                    // 滚动条位置
                    var scrollBarY = -currVal * scale2;
                    transformCss(scrollBar, 'translateY', scrollBarY);  // 设置滚动条位置
                }

                // 如果指定了回调函数
                if (callback && typeof callback['move'] === 'function') {
                    callback['move']();
                }


                // 持续时间到了
                if (t >= d) {
                    clearInterval(timeId);  //停止定时
                    // 有滚动条
                    if (scrollBar) {
                        scrollBar.style.opacity = 0; // 隐藏滚动条
                    }
                    // 指定回调函数
                    if (callback && typeof callback['end'] === 'function') {
                        callback['end']();
                    }
                }
            }, delay);
        }
    }
    
})(window);