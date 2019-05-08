let app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        pageNum: 0, // 当前页面栈中的页面数量
        statusBarHeight: 0, // 状态栏高度
        titleBarHeight: 0,  // 标题栏高度

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        console.log(options);
        let that = this;

        /**
         *  获取页面栈相关信息 需要根据页面栈数量来自定义页面导航栏
         *
         *  1.若是只有一个页面说明是由转发的打卡日记进入到该日记的详情页的
         *  则需要设置一个返回首页的按钮
         *
         *  2.若是存在多个页面 则设置一个返回上一级页面的按钮
         */
        let currPages = getCurrentPages();
        that.data.pagesNum  = currPages.length;
        console.log('pagesNum:' + currPages.length);

        // 获取机器相关数据 获取状态&标题栏高度
        wx.getSystemInfo({
            success: function(res) {
                /*
                 * 1.状态栏与标题栏的总高度可以通过screenHeight - windowHeight 获取
                 * 'iPhone': 64, 'iPhone X': 88, 'android': 68 这是网上的一个标准
                 *
                 * 2.获取状态栏高度，再用总高度减去状态栏高度即得到标题栏高度了
                  */
                console.log(res.screenHeight);
                console.log(res.windowHeight);
                let totalTopHeight = 68;
                if (res.model.indexOf('iPhone X') !== -1) {
                    totalTopHeight = 88;
                } else if (res.model.indexOf('iPhone') !== -1) {
                    totalTopHeight = 64;
                }
                that.data.statusBarHeight = res.statusBarHeight;
                that.data.titleBarHeight = totalTopHeight - res.statusBarHeight;

                that.setData({
                    statusBarHeight: that.data.statusBarHeight,
                    titleBarHeight: that.data.titleBarHeight,
                    pageNum: that.data.pagesNum
                })

            },
        });
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

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    },

    // 返回上一级页面
    goBackPrePage: function () {
        wx.navigateBack({
            delta: 1
        })
    },

    // 跳转至首页
    goBackIndexPage: function () {
        wx.switchTab({
            url: '/pages/index/index'
        });
    },
});