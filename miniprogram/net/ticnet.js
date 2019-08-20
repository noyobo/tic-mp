// Demo中获取privateMapKey的接口
const privateMapKeyUrl = 'https://sxb.qcloud.com/sxb_dev/?svc=account&cmd=authPrivMap';

function TICDataUtil() {
  this.privateMapKeyUrl = privateMapKeyUrl;
}

/**
 * 腾讯视频云Demo中的PrivateMapKey获取接口
 * 业务侧需要自己实现
 */
TICDataUtil.prototype.getPrivateMapKey = function (params) {
  var privateMapKeyUrl = this.privateMapKeyUrl;
  wx.hideLoading();
  return new Promise((resolve, reject) => {
    wx.showLoading({
      title: '加载中',
    });
    wx.request({
      method: 'POST',
      url: privateMapKeyUrl,
      header: {
        'content-type': 'application/json' // 默认值
      },
      data: {
        "identifier": params.userID,
        "pwd": "123", // 腾讯云DEMO接口鉴权密码
        "appid": params.sdkAppID,
        "accounttype": params.accountType,
        "roomnum": Number(params.roomID), // 整型
        "privMap": 255
      },
      success(res) {
        wx.hideLoading();
        if (res.data.errorCode) {
          reject(res.data);
        } else {
          resolve(res.data);
        }
      },
      fail(error) {
        wx.hideLoading()
        reject(error);
      }
    })
  });
}

module.exports = new TICDataUtil();