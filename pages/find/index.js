let app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        // 服务器图片访问BaseURL
        imgRootPath: app.globalData.imgBaseSeverUrl,


        // 打卡圈子精选专题
        punchCardProjectSpecialSubject: [
            '精选打卡专题-1', '精选打卡专题-2', '精选打卡专题-3', '精选打卡专题-4',
            '精选打卡专题-5', '精选打卡专题-6', '精选打卡专题-7', '精选打卡专题-8',
        ],

        // 打卡圈子推荐列表
        punchCardProjectRecommendList: [
            {
                project_id: 1,
                cover_img_url: 'default_cover_img',
                project_name: '项目名1',
                attendUserNum: 9999,
                punchCardNum: 99999,
                // TODO 参与打卡圈子报名费

            },
            {
                project_id: 1,
                cover_img_url: 'default_cover_img',
                project_name: '啦啦啦啦啦啦啦啦啦啦啦啦啦啦啦和',
                attendUserNum: 9999,
                punchCardNum: 99999,
            },
            {
                project_id: 1,
                cover_img_url: 'default_cover_img',
                project_name: '啦啦啦啦啦啦啦啦啦哈哈哈哈哈哈呵呵呵呵呵呵呵呵',
                attendUserNum: 9999,
                punchCardNum: 99999,
            },
        ],

        // 打卡圈子推荐列表子项右边圈子信息的宽度
        projectBaseInfoWidth: app.globalData.windowWidth - (10 + 100 + 5),
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
        wx.setNavigationBarTitle({
            title: '发现'
        });
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
        // 获取推荐的打卡圈子数据

    },

    // 进入打卡圈子搜索页
    intoSearchProjectPage: function () {
      wx.showToast({
         title: 'TODO',
         icon: 'none'
      });
    },

    // 进入打卡圈子精选专题页
    intoProjectSpecialSubject: function (e) {
        console.log(e);
    },

    // 根据选择的打卡圈子类型查找、显示对应的打卡圈子
    searchProjectByType: function (e) {
        console.log(e);
        let type = e.currentTarget.dataset.type;
        wx.showToast({
            title: '选择了'+ type,
            icon: 'none'
        });
    },

    // 进入指定的打卡圈子的打卡详情页
    intoPunchCardDetail: function (e) {
        console.log(e);
        // wx.navigateTo({
        //     url: '../punchCardDetailPage/index'
        //         + "?projectId=" + e.currentTarget.dataset.project_id
        //         + "&isCreator=" + e.currentTarget.dataset.is_creator
        // });
    },

});