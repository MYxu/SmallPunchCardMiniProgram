let app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        showLoading: true, // 在未从服务器端获取到打卡圈子信息之前则显示加载动画&&空白页面
        imgRootPath: app.globalData.imgBaseSeverUrl, // 服务器图片访问BaseURL
        projectId: 0,
        joinInPunchCardProject: -1, // 当前用户是否已经加入该打卡圈子 -1--未知、0--未加入、1--已加入
        isCreator: -1, // 当前用户是否为圈子创建者 -1--未知、 0--参与者、1--代表当前用户为创建者
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        console.log(options);
        let that = this;
        that.setData({
            projectId: parseInt(options.projectId),
            isCreator: parseInt(options.isCreator),
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
        let that = this;

        wx.showLoading({
            title:'加载中...'
        });

        let promise = [];

        // 1.获取当前用户是否已经加入该打卡圈子的相关信息
        promise[0] = new Promise(function (resolve) {

            let id = setTimeout(function () {
                resolve(false);
            },10000);

            wx.request({
               url: app.globalData.urlRootPath + '',
               method: 'post',
               data: {
                   userId: app.globalData.userInfo.id,
                   projectId: that.data.projectId
               },
               success:function (res) {

               },
               fail:function () {
                   wx.hideLoading();
                   wx.showToast({
                       title: '网络异常...',
                       icon: "none"
                   });
                   clearTimeout(id);
                   resolve(false);
               }
            });


        });
        // 2.获取该打卡圈子的相关信息
        promise[1] = new Promise(function (resolve) {
            let id = setTimeout(function () {
                resolve(false);
            },10000);

            wx.request({
                url: app.globalData.urlRootPath + '',
                method: 'post',
                data: {

                },
                success:function () {

                },
                fail:function () {
                    wx.hideLoading();
                    wx.showToast({
                        title: '网络异常...',
                        icon: "none"
                    });
                    clearTimeout(id);
                    resolve(false);
                }
            });
        });

        Promise.all(promise).then(function (res) {
            console.log(res);
            that.setData({
                showLoading: true
            });
            wx.hideLoading();
        });
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
        // 修改navigateBack按钮的返回事件，直接关闭其他非tabBar页面，回到首页tab
        // wx.switchTab({
        //     url: "../../index/index"
        // });
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

    // 返回首页
    intoIndexPage: function () {
        wx.switchTab({
            url: '../index/index'
        })
    },

    // 进入发表打卡日记页面
    intoPublishPunchCardDiaryPage: function () {


    },

    // 进入发现页
    intoFindPage: function () {
        wx.switchTab({
            url: '../find/index'
        })
    },
});