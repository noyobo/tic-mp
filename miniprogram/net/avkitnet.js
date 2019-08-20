function AvKitRequest() {

}

AvKitRequest.prototype.post = function (url, data, loadingTitle) {
  return this.request('POST', url, data, loadingTitle);
}

AvKitRequest.prototype.get = function (url, data, loadingTitle) {
  return this.request('GET', url, data, loadingTitle);
}

AvKitRequest.prototype.request = function (method = 'POST', url, data = {}, loadingTitle) {
  return new Promise((resolve, reject) => {
    if (loadingTitle) {
      wx.showLoading({
        title: loadingTitle,
      });
    }
    wx.request({
      method: method,
      url: url,
      header: {
        'content-type': 'application/json' // 默认值
      },
      data: data,
      success(res) {
        loadingTitle && wx.hideLoading();
        resolve(res);
      },
      fail(error) {
        loadingTitle && wx.hideLoading()
        reject(error);
      }
    })
  });
}

module.exports = new AvKitRequest;