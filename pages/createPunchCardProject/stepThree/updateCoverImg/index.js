// pages/createPunchCardProject/stepThree/updateCoverImg/index.js
let app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        // 服务器图片访问BaseURL
        imgRootPath: app.globalData.imgBaseSeverUrl,
        projectId: 0,
        systemRecommendCoverImgList: [
            // {"img_url":"../../../../images/backgroundImg/img_1.png"},
            // {"img_url":"../../../../images/backgroundImg/img_1.png"},
            // {"img_url":"../../../../images/backgroundImg/img_1.png"}

        ]
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        console.log(options);
        let that = this;
        that.data.projectId = options.projectId;

        this.getSystemRecommendCoverImg();
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        this.getSystemRecommendCoverImg();
    },

    // 获取系统推荐的圈子封面背景图列表
    getSystemRecommendCoverImg: function () {
        let that = this;
        wx.showLoading({
            title: '加载中...'
        });

        // 获取系统推荐的圈子封面背景图列表
        wx.request({
            url: app.globalData.urlRootPath + "index/PunchCardProject/getSysRecommendCoverImg",
            method: "post",
            success: function (res) {
                wx.hideLoading();
                console.log(res);

                switch (res.statusCode) {
                    case 200:
                        that.setData({
                            systemRecommendCoverImgList: res.data.data,
                        });
                        break;

                    default:
                        wx.showToast({
                            title: res.data.errMsg,
                            icon: "none"
                        });
                        break;
                }
            },
            fail: function () {
                wx.hideLoading();
                wx.showToast({
                    title: '网络异常...'
                });
            }
        })
    },

    // 使用系统推荐的封面图片
    useSystemRecommendCoverImg: function (e) {
        console.log(e);
    }
});