var app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        canIUse: wx.canIUse('button.open-type.getUserInfo'),
        userInfo: '',
        punchCardProjectList: [],
        moreProjectInfo: false, // 用于控制我的打卡圈子信息中的"查看更多"按钮的显示与隐藏
        projectNum: 0, // 我参与的打卡圈子数量
        projectHidden: true// 隐藏第3个之后的所有打卡圈子，使用查看更多按钮来控制显示
    },


    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function () {
        const that = this;

        // TODO 动态获取我参与的打卡圈子信息

        that.setData({
            projectNum: 0,
            moreProjectInfo: true, // 圈子数量超过3个则显示查看更多按钮
            punchCardProjectList:  [
                {name: '测试1', isCreator: true},
                {name: '测试2', isCreator: false},
                {name: '字标题测试吧吧吧啦啦啦啦啦啦啦', isCreator: false},
                {name: '测试4', isCreator: true}
            ]
        });


        // 根据全局变量中是否已经存在服务器端返回的用户信息条件，
        // 来注册loginAuth.js的addWeiXinUserInfo函数的回调函数userInfoReadyCallBack
        // 若是不存在，则注册，该回调函数在addWeiXinUserInfo()向服务器发送请求
        // 在服务器端保存发送的微信用户信息到用户表，同时返回用户表完整的用户信息之后进行调用
        // 回调函数userInfoReadyCallBack()则将返回的完整用户信息保存到当前page的data中

        // 回调函数注册的条件是当前page.data不存在完整的用户信息（存在部分用户的微信信息）
        // 而addWeiXinUserInfo中的回调函数调用条件是已经被注册

        if (app.globalData.userInfo.id === undefined) {
            app.userInfoReadyCallBack = function (userInfo) {
                that.setData({
                    userInfo: userInfo
                })
            };
        } else {
            that.setData({
                userInfo: app.globalData.userInfo
            });

        }
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
        wx.setNavigationBarTitle({
            title: '首页'
        });

        var that = this;
        console.log(that.data.userInfo);
        console.log(that.data.canIUse);

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

    // 查看按钮点击事件
    showMorePunchCardProject: function () {
        var that = this;
        that.setData({
            moreProjectInfo: true,
            projectHidden: false
        });
    },

    // 进入打卡详情页点击事件
    intoPunchCardDetail: function () {
        wx.showToast({
            title: '进入圈子详情页成功'

        })
    },
    // 创建新的打卡圈子按钮点击事件
    createNewPunchCardProject: function () {
        wx.navigateTo({
          url: '../createPunchCardProject/stepOne/index'
        });
    }

});