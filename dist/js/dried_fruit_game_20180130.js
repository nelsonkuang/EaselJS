!(function () {
    var stage,
        squatterSprites = [],
        squatterSpriteSheet,
        squatterMasks = [],
        squatterSpriteSheetBuilder,
        squatterContainer,
        squatterImgFrames = [],
        squatterYMovements = [],
        shakeSquatterMovements = [],
        gameTimeText,
        clock = 60000;
    var scale = document.getElementsByTagName('html')[0].style.fontSize.replace('px', '') / 75;

    // 获得屏宽高
    var screenWidth = window.innerWidth > 750 ? 750 : window.innerWidth,
        screenHeight = window.outerHeight;

    // 重设canvas宽高
    var canvas = document.getElementById("canvas");
    canvas.setAttribute('width', screenWidth); // 设置屏宽
    canvas.setAttribute('height', screenHeight); // 设置屏宽

    init(); // 起动

    function init() {
        stage = new createjs.Stage("canvas");
        // enable touch interactions if supported on the current device:
        createjs.Touch.enable(stage);

        var queue = new createjs.LoadQueue(); // 创建资源加载队列
        queue.installPlugin(createjs.Sound); // 增加声音处理
        queue.on("complete", handleLoad, this);
        queue.loadManifest([
            { id: "squatter_1", src: "/dist/img/coupon_again_icon1.png" },
            { id: "squatter_2", src: "/dist/img/coupon_again_icon2.png" },
            { id: "squatter_3", src: "/dist/img/coupon_again_icon3.png" },
            { id: "squatter_4", src: "/dist/img/coupon_again_icon4.png" },
            { id: "squatter_5", src: "/dist/img/coupon_again_icon5.png" },
            { id: "squatter_6", src: "/dist/img/coupon_again_icon6.png" },
            { id: "game_bg", src: "/dist/img/gamebg.jpg" },
            { id: "timer_bg", src: "/dist/img/gameTime.png" },
            { id: "game_bgm", src: "/dist/audio/gamebg.mp3" },
            { id: "audio_ok", src: "/dist/audio/clickO.mp3" },
            { id: "audio_no", src: "/dist/audio/clickN.mp3" },
            { id: "audio_end", src: "/dist/audio/gameEnd.mp3" },
            { id: "audio_countdown", src: "/dist/audio/countdown.mp3" }
        ], true);
    }

    function handleLoad(evt) { // 加载完成执行
        setupSpriteSheets(evt.target); // 初始化精灵
        setupUI(evt.target); // 设置初始UI界面
        createjs.Ticker.timingMode = createjs.Ticker.RAF; // 用requestAnimationFrame方式
        createjs.Ticker.on("tick", tick, this); // 每帧动画回调
    }

    function tick(evt) {
        /******************每帧监听事件处理*******************/
        clock -= 16;
        if (clock >= 0) {
            // update the text:
            gameTimeText.text = Math.floor(clock / 1000) + '.' + Math.floor(clock % 1000 / 100) + " s";
        } else {
            gameTimeText.text = 0 + " s";
            stopGame();
        }


        stage.update(evt);
    }
    function pauseGame() {
        for (var i = 0; i < 9; i++) {
            squatterYMovements[i].paused = true;
            shakeSquatterMovements[i].paused = true;
        }
    }
    function stopGame() {
        for (var i = 0; i < 9; i++) {
            squatterYMovements[i].paused = true;
            shakeSquatterMovements[i].paused = true;
            squatterSprites[i].removeAllEventListeners('mousedown');
        }
    }
    function moveSquatterY(squatter, from, to, wait, duration) {
        var ran = Math.floor(7 * Math.random()),
            isClicked = false; // 防止重复点击
        squatter.gotoAndStop(ran);

        var movementY = createjs.Tween
            .get(squatter, { loop: true })
            .wait(wait * ran)
            .to({ y: from }, duration)
            .wait(wait)
            .to({ y: to }, duration)
            .call(function () {
                ran = Math.floor(7 * Math.random());
                squatter.gotoAndStop(ran);
                isClicked = false;
            });

        var movementShake = createjs.Tween
            .get(squatter, { loop: false, paused: true })
            .to({ scale: 0.5, skewX: -5, skewY: -5 }, 100)
            .to({ scale: 0.7, skewX: 5, skewY: 5 }, 100)
            .to({ scale: 1, skewX: 0, skewY: 0 }, 200)
            .wait(wait)
            .call(function () {
                movementY.paused = false;
            });

        squatterYMovements.push(movementY); // 入栈用于测试
        shakeSquatterMovements.push(movementShake);

        squatter.on("mousedown", function () {
            if (!isClicked) { // 防止重复点击
                console.log('click: ' + ran);
                movementY.paused = true;
                movementShake.paused = false;
                movementShake.gotoAndPlay(0);
                isClicked = true;
            }
        }, this); // 绑定每个果干的点击事件
    }

    function setupUI(queue) {
        // background:
        var bgImg = queue.getResult('game_bg');
        var bgBmp = new createjs.Bitmap(bgImg).set({ scale: scale, x: 0, y: 0 });
        stage.addChild(bgBmp);

        // 计时器背景
        var timerBgImg = queue.getResult('timer_bg');
        var timerBgBmp = new createjs.Bitmap(timerBgImg).set({ scale: scale, x: 10, y: 10 });
        stage.addChild(timerBgBmp);

        // 创建遮罩用于显示果干
        var squatterMaskPositions = [
            [50, 400, 160, 160],
            [50, 580, 160, 160],
            [45, 760, 160, 160],
            [280, 448, 160, 160],
            [285, 620, 160, 160],
            [283, 795, 160, 160],
            [515, 410, 160, 160],
            [525, 590, 160, 160],
            [526, 770, 160, 160],
        ];
        for (var i = 0; i < 9; i++) {
            var squatterMask = new createjs.Shape();
            squatterMask.graphics
                .drawRect(squatterMaskPositions[i][0] * scale, squatterMaskPositions[i][1] * scale, squatterMaskPositions[i][2] * scale, squatterMaskPositions[i][3] * scale);
            squatterMasks.push(squatterMask);
        }

        // 添加果干容器
        squatterContainer = new createjs.Container(squatterSpriteSheet);
        stage.addChild(squatterContainer);

        // 在果干容器里面添加果干
        var squatterPositions = [
            [20, 400],
            [30, 580],
            [20, 760],
            [260, 443],
            [260, 615],
            [260, 790],
            [495, 405],
            [495, 585],
            [495, 760],
        ];
        for (var i = 0; i < 9; i++) {
            var squatterSprite = new createjs.Sprite(squatterSpriteSheet, "squatters");
            var squatterRect = squatterSprite.getBounds();
            var fromX = squatterPositions[i][0] * scale + (squatterRect.width >> 1),
                toY = (squatterPositions[i][1] + 160) * scale + (squatterRect.height >> 1),
                fromY = squatterPositions[i][1] * scale + (squatterRect.height >> 1);
            // console.log(squatterRect);
            squatterSprite.set({ x: fromX, y: toY, regX: squatterRect.width >> 1, regY: squatterRect.height >> 1 });
            squatterContainer.addChild(squatterSprite);
            squatterSprite.mask = squatterMasks[i]; // 为每个果干添加mask
            squatterSprites.push(squatterSprite); // 入栈用于测试

            moveSquatterY(squatterSprite, fromY, toY, 500, 100); // 开始播放Y竖直方向动画
        }

        // Game Time Countdown
        gameTimeText = new createjs.Text("60 s", 18 + "px Arial", "#000");
        gameTimeText.x = 125 * scale;
        gameTimeText.y = 65 * scale;
        stage.addChild(gameTimeText);
    }

    function setupSpriteSheets(queue) {
        squatterSpriteSheetBuilder = new createjs.SpriteSheetBuilder();
        for (var i = 0; i < 6; i++) {
            var img = queue.getResult('squatter_' + (i + 1));
            var bmp = new createjs.Bitmap(img);
            var index = squatterSpriteSheetBuilder.addFrame(bmp, null, scale * 0.63, function (target, data) { }, i); // 0.63为调试最适合的大小
            squatterImgFrames.push(index);
        }
        squatterSpriteSheetBuilder.addAnimation("squatters", squatterImgFrames, true, 8);
        squatterSpriteSheet = squatterSpriteSheetBuilder.build(); // 构建spriteSheet

        //stage.addChild(new createjs.Bitmap(squatterSpriteSheet._images[0])).set({ x: 0, y: 150 }); // 测试整张输出
    }

})();