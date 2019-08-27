const TEduBoard = require('./libs/TEduBoard_miniprogram.min.js');
const ImHandler = require('../webim-component/ImHandler');

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    userId: {
      type: String,
      value: '',
    },

    userSig: {
      type: String,
      value: '',
    },

    sdkAppID: {
      type: Number,
      value: null,
    },

    classId: {
      type: Number,
      value: null,
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    board: null,
    boardImg: '',
    currentPic: '', //预留图片链接
    hideBoard: false, // 默认显示白板
    hideImg: true, // 默认隐藏图片, 只有计算出图片宽高后，才展示
    imgLoadList: null, //预加载图片链接列表
    bgColor: '#ffffff',
    naturalWidth: 0,
    naturalHeight: 0,
    imgStyle: '',
    boardWidth: 0,
    boardHeight: 0,
    wrapWidth: 0,
    wrapHeight: 0,
    ratio: '16:9',
    canvasComponent: null,
    orientation: null,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    render(boardConfig = {}, callback) {
      this.data.ratio = boardConfig.ratio;
      this.data.orientation = boardConfig.orientation;

      this.orientationTransform((rect) => {
        boardConfig.containerOffset = {
          left: rect.left,
          top: rect.top,
        };
        this.init(boardConfig);
        callback && callback();
      });
    },

    getBoardInstance() {
      return this.data.board;
    },

    init(boardConfig) {
      // 渲染涂鸦的canvas
      var canvasComponent = wx.createCanvasContext('tic_board_canvas', this);
      // 实时绘制的canvas
      var canvasDrawComponent = wx.createCanvasContext('tic_float_board_canvas', this);

      this.data.board = wx.board = new TEduBoard({
        userId: boardConfig.userId,
        userSig: boardConfig.userSig,
        sdkAppId: boardConfig.sdkAppId,
        classId: boardConfig.classId,
        containerOffset: boardConfig.containerOffset,
        preStep: this.data.preStep, //预加载步数
        width: this.data.boardWidth,
        height: this.data.boardHeight,
        canvasComponent, //
        canvasDrawComponent, // 临时涂鸦数据（真正数据是画在canvasComponent）
        context: this,
        orientation: boardConfig.orientation,
        drawEnable: boardConfig.drawEnable,
        ratio: boardConfig.ratio,
        brushColor: boardConfig.brushColor,
        brushThin: boardConfig.brushThin,
        toolType: boardConfig.toolType,
        globalBackgroundColor: boardConfig.globalBackgroundColor,
        dataSyncEnable: boardConfig.dataSyncEnable,
        smoothLevel: boardConfig.smoothLevel,
      });

      // if (this.data.orientation === 'horizontal') { // 横屏
      //   height = this.data.boardWidth;
      //   width = this.data.boardHeight;
      // } else {
      //   width = this.data.boardWidth;
      //   height = this.data.boardHeight;
      // }

      // this.setData({
      //   orientation: boardConfig.orientation,
      //   boardWidth: width,
      //   boardHeight: height
      // });

      /*监听draw发送的预加载列表和图像链接 */
      this.data.board.on('preload', (data) => {
        this.setData({
          hideImg: true,
          currentPic: data.currentPic,
          imgLoadList: data.preloadList,
        });
      });

      /**
       * 监听到实时涂鸦数据后，通过im将数据同步到各端
       */
      this.data.board.on(TEduBoard.EVENT.TEB_SYNCDATA, (data) => {
        ImHandler.sendBoardMsg(data);
      });
    },

    /**
     * 监听touchstart事件
     * @param {*} event
     */
    bindContainerTouchstart(event) {
      this.data.board.canvasTouchStart(event);
    },

    /**
     * 监听touchmove事件
     * @param {*} event
     */
    bindContainerTouchmove(event) {
      this.data.board.canvasTouchMove(event);
    },

    /**
     * 监听touchend事件
     * @param {*} event
     */
    bindContainerTouchend(event) {
      this.data.board.canvasTouchEnd(event);
    },

    /**
     * 监听touchcancel事件
     * @param {*} event
     */
    bindContainerTouchcancel(event) {
      this.data.board.canvasTouchCancel(event);
    },

    /**
     * 图片加载完成
     * @param {*} ev
     */
    imgOnLoad(ev) {
      let width = ev.detail.width;
      let height = ev.detail.height;

      // 获取图片原始宽高
      this.setData(
        {
          naturalWidth: width,
          naturalHeight: height,
        },
        () => {
          this.updateImgStyle();
        },
      );
    },

    // 图片加载失败
    imgOnLoadError(error) {},

    /**
     * 横竖屏方向
     * @param {*} callback
     */
    orientationTransform(callback) {
      wx.createSelectorQuery()
        .in(this)
        .select('.tic-board-box')
        .boundingClientRect((rect) => {
          // 进行横竖屏的白板容器尺寸转换
          let { wrapWidth, wrapHeight, boardWidth, boardHeight } = this.boardContainerTransform(rect);

          this.setData(
            {
              wrapWidth: wrapWidth,
              wrapHeight: wrapHeight,
              boardWidth: boardWidth,
              boardHeight: boardHeight,
            },
            () => {
              // 正常设置容器和白板的宽高后，计算出偏移值，并设置给白板，白板用该偏移值计算涂鸦坐标
              wx.createSelectorQuery()
                .in(this)
                .select('.tic-board-wrap')
                .boundingClientRect((rect) => {
                  callback && callback(rect);
                })
                .exec();
            },
          );
        })
        .exec();
    },

    /**
     * 动态设置白板展示方向
     * @param {*} orientation
     */
    setOrientation(orientation = 'vertical', callback) {
      this.setData(
        {
          hideImg: true,
          orientation: orientation,
          hideBoard: true,
        },
        () => {
          this.orientationTransform((rect) => {
            if (this.data.board) {
              this.data.board.resize(this.data.boardWidth, this.data.boardHeight);
              this.data.board.setOrientation(orientation);
              this.data.board.setContainerOffset({
                left: rect.left,
                top: rect.top,
              });
              this.updateImgStyle();
            }
            this.setData(
              {
                hideBoard: false,
              },
              () => {
                callback && callback();
              },
            );
          });
        },
      );
    },

    // 根据白板容器宽高，分辨率计算白板尺寸
    calculateBoardSize(containerWidth, containerHeight) {
      var width, height;
      var ratioWidth, ratioHeight;
      try {
        var ratios = this.data.ratio.split(':');
        ratioWidth = ratios[0] * 1;
        ratioWidth = isNaN(ratioWidth) ? 16 : ratioWidth;
        ratioHeight = ratios[1] * 1;
        ratioHeight = isNaN(ratioHeight) ? 9 : ratioHeight;
      } catch (error) {
        ratioWidth = 16;
        ratioHeight = 9;
      }

      if (containerWidth / containerHeight > ratioWidth / ratioHeight) {
        width = (containerHeight * ratioWidth) / ratioHeight;
        height = containerHeight;
      } else {
        width = containerWidth;
        height = (containerWidth * ratioHeight) / ratioWidth;
      }
      return {
        width,
        height,
      };
    },

    addSyncData(data) {
      this.data.board.addSyncData(data);
    },

    // 设置当前背景图片
    setCurrentImg(currentPic, currentBoard) {
      this.setData({
        currentPic,
      });
    },

    // 设置预加载图片
    setPreLoadImgList(preloadList) {
      this.setData({
        preloadList,
      });
    },

    // 设置白板背景颜色
    setBoardBgColor(bgColor) {
      this.setData({
        bgColor,
      });
    },

    /**
     * 白板容器尺寸转换
     */
    boardContainerTransform(rect) {
      var wrapWidth, wrapHeight;
      var widthHeight;
      if (this.data.orientation === 'horizontal') {
        // 横屏
        widthHeight = this.calculateBoardSize(rect.height, rect.width);
        wrapWidth = widthHeight.height;
        wrapHeight = widthHeight.width;
      } else {
        widthHeight = this.calculateBoardSize(rect.width, rect.height);
        wrapWidth = widthHeight.width;
        wrapHeight = widthHeight.height;
      }
      // 白板外部容器宽高需要进行转换处理，白板内部将canvas的坐标系进行了translate，所以不需要转换
      return {
        wrapWidth,
        wrapHeight,
        boardWidth: widthHeight.width,
        boardHeight: widthHeight.height,
      };
    },

    /**
     * 根据横竖屏计算图片的展示位置
     */
    updateImgStyle() {
      var style = [];
      if (this.data.orientation !== 'horizontal') {
        // 水平方向
        style = ['left: 50%', 'transform: translate(-50%, -50%) ', 'top: 50%'];
        if (this.data.boardWidth / this.data.boardHeight < this.data.naturalWidth / this.data.naturalHeight) {
          style.push('width:100%');
          style.push('height:' + (this.data.boardWidth / this.data.naturalWidth) * this.data.naturalHeight + 'px');
        } else {
          style.push('width:' + (this.data.boardHeight / this.data.naturalHeight) * this.data.naturalWidth + 'px');
          style.push('height:100%');
        }
      } else {
        if (this.data.boardWidth / this.data.boardHeight < this.data.naturalWidth / this.data.naturalHeight) {
          style.push('top: 0');
          style.push('width:' + this.data.boardWidth + 'px');
          var height = (this.data.boardWidth / this.data.naturalWidth) * this.data.naturalHeight;
          style.push('height:' + height + 'px');
          style.push('left:' + (this.data.boardHeight + height) / 2 + 'px');
        } else {
          style.push('left: ' + this.data.boardHeight + 'px');
          var width = (this.data.boardHeight / this.data.naturalHeight) * this.data.naturalWidth;
          style.push('width:' + width + 'px');
          style.push('height:' + this.data.boardHeight + 'px');
          style.push('top:' + (this.data.boardWidth - width) / 2 + 'px');
        }
      }

      this.setData({
        imgStyle: style.join(';'),
        hideImg: false,
      });
    },
  },
});
