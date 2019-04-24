let app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        // 服务器图片访问BaseURL
        imgRootPath: app.globalData.imgBaseSeverUrl,
        punchCardProjectList: []
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let that = this;
        let punchCardProjectList = JSON.parse(options.punchCardProjectList);
        that.setData({
            punchCardProjectList: punchCardProjectList
        });
        console.log(that.data.punchCardProjectList);
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
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    // 进入打卡详情页点击事件
    intoPunchCardDetail: function (e) {
        console.log(e);
        wx.navigateTo({
            url: '/pages/punchCardDetailPage/index'
                + "?projectId=" + e.currentTarget.dataset.projectId
                + "&isCreator=" + e.currentTarget.dataset.isCreator
        })
    },
});