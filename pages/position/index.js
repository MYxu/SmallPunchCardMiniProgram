let QQMapWX = require('../../lib/qqmap-wx-jssdk.js');
let QQMapSDK;
Page({
  data: {},
  onLoad: function () {
    // 实例化API核心类
    QQMapSDK = new QQMapWX({
      key: 'TLMBZ-XG43U-R7IVE-2BCJY-VA4M7-KQFMJ'
    });

    let that = this;
    that.moveToLocation();
  },

  //移动选点
  moveToLocation: function () {

    // 打开地图选择当前选择的地理位置 获取相关的信息：地理位置名称 & 经度 & 纬度
    wx.chooseLocation({
      success: function (res) {
        console.log(res);

        // 为上一个页面栈设置用户选择的地理位置信息
        let pages = getCurrentPages();
        pages[pages.length - 2].setData({
          address: res.name,
          latitude: res.latitude,
          longitude: res.longitude
        });

        //选择地点之后返回到原来页面
        wx.navigateBack({
          delta: 1
        });
      },
      fail: function (err) {
        console.log(err)
      }
    });
  }
});