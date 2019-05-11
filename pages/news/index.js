let app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        userInfo: '',
        // 服务器图片访问BaseURL
        imgRootPath: app.globalData.imgBaseSeverUrl,
        windowWidth: app.globalData.windowWidth,
        unreadLikeNewsNum: 0, // 未读的被点赞消息数
        unreadCommentNewsNum: 0, // 未读的被评论消息数

        showLoading: true, // 页面加载数据时显示加载动画并显示空白页
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        console.log(options);
        let that = this;
        wx.hideShareMenu();
        that.data.userInfo = app.globalData.userInfo;

    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
        wx.setNavigationBarTitle({
            title: '消息'
        })
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        let that = this;
        // 获取我的未读消息
        that.getUnreadNewsNum();
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
        let that = this;

        // 获取我的未读消息
        that.getUnreadNewsNum();
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    // 获取我的未读消息条数
    getUnreadNewsNum: function () {
        let that = this;
        wx.showLoading({
            title: '消息获取中...'
        });
        that.setData({
            showLoading: true
        });

        wx.request({
            url: app.globalData.urlRootPath
                + 'index/UnreadNewsCount/getUnreadNewsNum',
            method: 'post',
            data: {
                user_id: that.data.userInfo.id
            },
            success: function (res) {
                wx.hideLoading();
                wx.stopPullDownRefresh();
                let respData = res.data;
                if (res.statusCode === 200) {
                    let unreadLikeNewsNum = parseInt(respData.data.unreadLikeNewsNum);
                    let unreadCommentNewsNum = parseInt(respData.data.unreadCommentNewsNum);

                    that.setData({
                        unreadLikeNewsNum: unreadLikeNewsNum,
                        unreadCommentNewsNum: unreadCommentNewsNum,
                        showLoading: false,
                    });

                    if ((unreadLikeNewsNum + unreadCommentNewsNum) !== 0) {
                        // 在小程序tab页右上角设置文本 即未读的消息数
                        wx.setTabBarBadge({
                            index: 2,
                            text: unreadCommentNewsNum + unreadLikeNewsNum + ''
                        });
                    } else {
                        wx.removeTabBarBadge({
                            index: 2
                        });
                    }

                } else {
                    that.setData({
                        showLoading: false,
                    });
                    wx.showToast({
                        title: respData.errMsg,
                        icon: 'none'
                    });
                }
            },
            fail: function () {
                wx.hideLoading();
                wx.stopPullDownRefresh();
                wx.showToast({
                    title: '网络异常,无法获取未读消息',
                    icon: 'none',
                    duration: 1000
                })
            }
        });
    },

    // 当点击进入被点赞、被评论的消息列表时，设置该用户未读的被点赞、被评论
    // 消息数为0
    setNewsReadStatus: function(unreadNewsType) {
        let that = this;
        wx.request({
            url: app.globalData.urlRootPath
                + 'index/UnreadNewsCount/setNewsReadStatus',
            method: 'post',
            data: {
                user_id: that.data.userInfo.id,
                unread_news_type: unreadNewsType
            },
            success: function (res) {
                if (res.statusCode === 200) {
                    let unreadLikeNewsNum = that.data.unreadLikeNewsNum;
                    let unreadCommentNewsNum = that.data.unreadCommentNewsNum;

                    if (unreadNewsType === 'likeNews')
                        unreadLikeNewsNum = 0;
                    if (unreadNewsType === 'commentNews')
                        unreadCommentNewsNum = 0;


                    that.setData({
                        unreadLikeNewsNum: unreadLikeNewsNum,
                        unreadCommentNewsNum: unreadCommentNewsNum
                    });
                    console.log(unreadLikeNewsNum + unreadCommentNewsNum);
                    console.log((unreadLikeNewsNum + unreadCommentNewsNum) !== 0);


                    if ((unreadLikeNewsNum + unreadCommentNewsNum) !== 0) {
                        // 在小程序tab页右上角设置文本 即未读的消息数
                        wx.setTabBarBadge({
                            index: 2,
                            text: unreadCommentNewsNum + unreadLikeNewsNum + ''
                        });
                    }


                } else {
                    wx.showToast({
                        title: respData.errMsg,
                        icon: 'none'
                    });
                }
            },
            fail: function () {
                wx.showToast({
                    title: '网络异常,无法设置消息已读',
                    icon: 'none',
                    duration: 1000
                })
            }
        })
    },

    // 点击评论消息进入 消息详情页展示所有的评论消息列表
    intoCommentNewsListsPage: function () {
        let that = this;

        // 设置被评论的消息已读
        that.setNewsReadStatus('commentNews');

        wx.navigateTo({
            url: '/pages/newsDetailPage/index'
                + '?pageTitle=' + '日记评论'
                + '&newsType='  + 'commentNews'
        });
    },

    // 点击点赞消息进入 消息详情页展示所有的点赞消息列表
    intoLikeNewsListsPage: function () {
        let that = this;

        // 设置被评论的消息已读
        that.setNewsReadStatus('likeNews');

        wx.navigateTo({
            url: '/pages/newsDetailPage/index'
                + '?pageTitle=' + '日记评论'
                + '&newsType='  + 'likeNews'
        });
    }
});