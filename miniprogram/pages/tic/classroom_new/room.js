const CONSTANT = require('../../../constant/Constant');

Page({
  // TIC
  txTic: null,
  webrtcroomComponent: null,

  data: {
    identifier: null,
    userSig: null,
    sdkAppId: null,
    roomID: null,
    isTeacher: false,

    isJoinClassroom: false, // 是否已经在课堂中
    boardShowFullScreen: false,

    // 音视频模板
    template: '1v1',

    // 是否启用摄像头
    enableCamera: true,

    isShowBoardPanel: false, // 是否显示白板面板

    chatMsg: '', // 聊天输入框值
    msgList: [], // IM消息列表

    loadingImg: 'https://main.qcloudimg.com/raw/0c56375ca9e2dfde99930f36f19b137b.gif',
    playerBackgroundImg: 'https://main.qcloudimg.com/raw/b14189beafbb8db8275e53c8cb596e1f.png',

    isErrorModalShow: false, // 房间事件会重复触发，增加错误窗口是否显示的标志
    classUrl: '', // 课堂链接
  },

  onReady(options) {
    // 保持屏幕常亮
    wx.setKeepScreenOn({
      keepScreenOn: true,
    });
  },

  onLoad(options) {
    this.data.identifier = options.identifier;
    this.data.userSig = options.userSig;
    this.data.sdkAppId = options.sdkAppId;
    this.data.roomID = options.roomID;
    this.data.isTeacher = !!(options.role * 1);

    // 获取webrtc组件
    this.webrtcroomComponent = this.selectComponent('#webrtcroom');
    // 登录
    this.startRTC();
  },

  onUnload() {},

  // 开始RTC
  startRTC() {
    this.setData(
      {
        userID: this.data.identifier,
        userSig: this.data.userSig,
        sdkAppID: this.data.sdkAppId,
        roomID: this.data.roomID,
      },
      () => {
        this.webrtcroomComponent.start();
      },
    );

    this.setData(
      {
        classUrl: `https://www.qcloudtrtc.com/miniprogram/miniprogram.html?isTeacher=${this.data.isTeacher}&sdkAppId=${this.data.sdkAppId}&classId=${this.data.roomID}&userId=${this.data.identifier}&userSig=${this.data.userSig}`,
      },
      () => {
        console.log(this.data.classUrl);
      },
    );
  },

  /**
   * 监听webrtc事件
   */
  onRoomEvent(e) {
    var self = this;
    switch (e.detail.tag) {
      case 'error':
        // 错误提示窗口是否已经显示
        if (this.data.isErrorModalShow) {
          return;
        }

        if (e.detail.code === -10) {
          // 进房失败，一般为网络切换的过程中
          this.data.isErrorModalShow = true;
          wx.showModal({
            title: '提示',
            content: e.detail.detail,
            confirmText: '重试',
            cancelText: '退出',
            success: function(res) {},
          });
        } else {
          var pages = getCurrentPages();
          console.log(pages, pages.length, pages[pages.length - 1].__route__);
          if (pages.length > 1 && pages[pages.length - 1].__route__ == 'pages/index/index') {
            this.data.isErrorModalShow = true;
            wx.showModal({
              title: '提示',
              content: e.detail.detail,
              showCancel: false,
              complete: function() {
                self.data.isErrorModalShow = false;
                pages = getCurrentPages();
                if (pages.length > 1 && pages[pages.length - 1].__route__ == 'pages/index/index') {
                  wx.showToast({
                    title: `code:${e.detail.code} content:${e.detail.detail}`,
                  });
                  wx.navigateBack({
                    delta: 1,
                  });
                }
              },
            });
          }
        }
        break;
    }
  },

  /**
   * 显示信息弹窗
   * @param {*} msg
   * @param {*} error
   */
  showToast(msg) {
    wx.showToast({
      icon: 'none',
      title: msg,
    });
  },

  /**
   * 显示错误信息弹窗
   * @param {*} msg
   * @param {*} error
   */
  showErrorToast(msg, error) {
    wx.showToast({
      icon: 'none',
      title: msg,
    });
    console.error('Error msg:', error || msg);
  },
});
