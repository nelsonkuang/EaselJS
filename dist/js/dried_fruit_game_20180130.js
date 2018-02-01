/*
打果干小游戏
(c) 2017-2018 Nelson Kuang
*/
(function (root, c) {

    var DFGame = function (options) {
        this.version = '1.0.1';
        this.author = 'Nelson Kuang';
        this.description = 'A Dried-Fruit-Hitting Game';
        this.defaults = {
            canvasId: 'canvas',
            width: window.innerWidth > 750 ? 750 : window.innerWidth,
            height: window.innerHeight,
            resource: [
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
            ],
            gameRoundTime: 60000,
            soundOff: false,
            spriteWaitTime: 600,
            spriteMoveDuration: 300,
            remScale: document.getElementsByTagName('html')[0].style.fontSize.replace('px', '') / 75,
            onReady: function () { },
            onGameOver: function () { },
        };
        options = this.extend(this.defaults, options);
        this.currentScores = [0, 0, 0, 0, 0, 0];
        this.soundOff = options.soundOff;
        this.isReady = false;
        this.readyTimer = null;
        var _this = this;

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
            gameScoreTips,
            scores = [0, 0, 0, 0, 0, 0],
            gameover = false;

        // 重设canvas宽高
        var canvas = document.getElementById(options.canvasId);
        canvas.setAttribute('width', options.width); // 设置屏宽
        canvas.setAttribute('height', options.height); // 设置屏宽

        function init() {
            stage = new c.Stage(options.canvasId);
            // enable touch interactions if supported on the current device:
            c.Touch.enable(stage);

            var queue = new c.LoadQueue(); // 创建资源加载队列
            queue.installPlugin(c.Sound); // 增加声音处理

            queue.on("complete", function (evt) {
                _this.playBgMusic();
                options.onReady && options.onReady();
                var resourceQueue = evt.target;
                _this.readyTimer = setInterval(function () {
                    if (_this.isReady) {
                        startGame(resourceQueue);
                        clearInterval(_this.readyTimer);
                    }
                }, 16);

            }, this);

            queue.loadManifest(options.resource, true);
        }

        function startGame(resourceQueue) {
            setupSpriteSheets(resourceQueue); // 初始化精灵
            setupUI(resourceQueue); // 设置初始UI界面
            c.Ticker.timingMode = c.Ticker.RAF; // 用requestAnimationFrame方式
            c.Ticker.on("tick", function (evt) {
                // 每帧监听事件处理
                options.gameRoundTime -= 16;
                if (options.gameRoundTime >= 0) {
                    // update the text:
                    gameTimeText.text = Math.floor(options.gameRoundTime / 1000) + '.' + Math.floor(options.gameRoundTime % 1000 / 100) + " s";
                } else {
                    gameTimeText.text = 0 + " s";
                    if (!gameover) {
                        stopGame();
                    }
                }
                stage.update(evt);
            }, this); // 每帧动画回调
        }

        function stopGame() {
            for (var i = 0; i < 9; i++) {
                squatterYMovements[i].paused = true;
                shakeSquatterMovements[i].paused = true;
                squatterSprites[i].removeAllEventListeners('mousedown');
            }
            _this.playGameOverMusic();
            options.onGameOver && options.onGameOver();
            gameover = true;
        }

        function showScore(type) {
            var text = '+ ';
            if (type == 3) {
                text = '  + 1';
                // text += 1;
            } else if (type == 0) {
                text += 200;
            } else {
                text += 100;
            }
            gameScoreTips.text = text;
            var showTips = c.Tween
                .get(gameScoreTips, { loop: false, override: true })
                .to({ scale: 1.2, alpha: 0.8 }, 100)
                .wait(500)
                .to({ scale: 0.8, alpha: 0 }, 100);
        }

        function moveSquatterY(squatter, from, to, wait, duration) {
            var ran = Math.floor(6 * Math.random()),
                isClicked = false; // 防止重复点击
            squatter.gotoAndStop(ran);

            var movementY = c.Tween
                .get(squatter, { loop: true })
                .wait(wait * Math.random())
                .to({ y: from }, duration)
                .wait(wait)
                .to({ y: to }, duration)
                .call(function () {
                    ran = Math.floor(6 * Math.random());
                    squatter.gotoAndStop(ran);
                    isClicked = false;
                });

            var movementShake = c.Tween
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
                    // console.log('click: ' + ran);
                    movementY.paused = true;
                    movementShake.paused = false;
                    movementShake.gotoAndPlay(0);
                    scores[ran]++;
                    for (var j = 0; j < 6; j++) {
                        _this.currentScores[j] = scores[j];
                    }
                    if (ran != 3) {
                        _this.playSuccessMusic();
                    } else {
                        _this.playFailureMusic();
                    }
                    showScore(ran);
                    // console.log(scores);
                    isClicked = true;
                }
            }, this); // 绑定每个果干的点击事件
        }

        function setupUI(queue) {
            // background:
            var bgImg = queue.getResult('game_bg');
            var bgBmp = new c.Bitmap(bgImg).set({ scale: options.remScale, x: 0, y: 0 });
            stage.addChild(bgBmp);

            // 计时器背景
            var timerBgImg = queue.getResult('timer_bg');
            var timerBgBmp = new c.Bitmap(timerBgImg).set({ scale: options.remScale, x: 10, y: 10 });
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
                var squatterMask = new c.Shape();
                squatterMask.graphics
                    .drawRect(squatterMaskPositions[i][0] * options.remScale, squatterMaskPositions[i][1] * options.remScale, squatterMaskPositions[i][2] * options.remScale, squatterMaskPositions[i][3] * options.remScale);
                squatterMasks.push(squatterMask);
            }

            // 添加果干容器
            squatterContainer = new c.Container(squatterSpriteSheet);
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
                var squatterSprite = new c.Sprite(squatterSpriteSheet, "squatters");
                var squatterRect = squatterSprite.getBounds();
                var fromX = squatterPositions[i][0] * options.remScale + (squatterRect.width >> 1),
                    toY = (squatterPositions[i][1] + 160) * options.remScale + (squatterRect.height >> 1),
                    fromY = squatterPositions[i][1] * options.remScale + (squatterRect.height >> 1);
                // console.log(squatterRect);
                squatterSprite.set({ x: fromX, y: toY, regX: squatterRect.width >> 1, regY: squatterRect.height >> 1 });
                squatterContainer.addChild(squatterSprite);
                squatterSprite.mask = squatterMasks[i]; // 为每个果干添加mask
                squatterSprites.push(squatterSprite); // 入栈用于测试

                moveSquatterY(squatterSprite, fromY, toY, 600, 300); // 开始播放Y竖直方向动画
            }

            // Game Time Countdown
            gameTimeText = new c.Text("60 s", 18 + "px Arial", "#000");
            gameTimeText.x = 125 * options.remScale;
            gameTimeText.y = 65 * options.remScale;
            stage.addChild(gameTimeText);

            // Game Score Tips
            gameScoreTips = new c.Text("+ 000");
            gameScoreTips.font = 'bold 60px Arial';
            gameScoreTips.color = '#fff';
            // gameScoreTips.textAlign = 'center';
            var tipsRect = gameScoreTips.getBounds();
            gameScoreTips.set({ x: 355 * options.remScale, y: 225 * options.remScale, regX: tipsRect.width >> 1, regY: tipsRect.height >> 1, scale: 0.5, alpha: 0 });
            stage.addChild(gameScoreTips);
        }

        function setupSpriteSheets(queue) {
            squatterSpriteSheetBuilder = new c.SpriteSheetBuilder();
            for (var i = 0; i < 6; i++) {
                var img = queue.getResult('squatter_' + (i + 1));
                var bmp = new c.Bitmap(img);
                var index = squatterSpriteSheetBuilder.addFrame(bmp, null, options.remScale * 0.63, function (target, data) { }, i); // 0.63为调试最适合的大小
                squatterImgFrames.push(index);
            }
            squatterSpriteSheetBuilder.addAnimation("squatters", squatterImgFrames, true, 8);
            squatterSpriteSheet = squatterSpriteSheetBuilder.build(); // 构建spriteSheet

            //stage.addChild(new c.Bitmap(squatterSpriteSheet._images[0])).set({ x: 0, y: 150 }); // 测试整张输出
        }

        init(); // bootstrap the game

    }
    DFGame.prototype = {
        constructor: DFGame,

        extend: function (target, source) {
            var result = {};
            for (var o in target) {
                result[o] = target[o];
            }
            for (var p in source) {
                if (source.hasOwnProperty(p)) {
                    result[p] = source[p];
                }
            }
            return result;
        },

        start: function (){
            this.isReady = true;
        },

        musicOn: function () {
            this.soundOff = false;
            this.playBgMusic();
        },

        musicOff: function () {
            c.Sound.stop();
            this.soundOff = true;
        },

        playBgMusic: function () {
            if (!this.soundOff) {
                c.Sound.play("game_bgm", { loop: -1 });
            }
        },

        playGameOverMusic: function () {
            if (!this.soundOff) {
                this.musicOff();
                c.Sound.play("audio_end");
            }
        },

        playCountdownMusic: function () {
            if (!this.soundOff) {
                c.Sound.play("audio_countdown");
            }
        },

        playSuccessMusic: function () {
            if (!this.soundOff) {
                c.Sound.play("audio_ok");
            }
        },

        playFailureMusic: function () {
            if (!this.soundOff) {
                c.Sound.play("audio_no", { offset: 500 });
            }
        }
    }

    root.DFGame = DFGame;

})(this, createjs);