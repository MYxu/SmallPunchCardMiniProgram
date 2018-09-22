var app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        punchCardProjectId:'',

        // 在创建圈子的第二步骤成功创建圈子之后进入第三步骤的圈子详情页，默认显示自定义的邀请模态框
        showCustomInviteModal: true
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        console.log("threePage options:");
        console.log(options);
        console.log(options.projectId);
        let that = this;
        that.setData({
            punchCardProjectId: options.projectId,
            inviteImgUrl: options.invite_img_url,
            getInviteImgFlag: options.get_invite_img_flag

        })
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
        // 修改navigateBack按钮的返回事件，直接关闭其他非tabBar页面，回到首页tab
        wx.switchTab({
            url:"../../index/index"
        });
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
     * 点击右上角、分享按钮进行邀请
     */
    onShareAppMessage: function (options) {
        let that = this;
        // let promise = new Promise(function () {
        //     that.hiddenCustomModal();
        //     console.log("setHidden");
        //
        // });
        //
        // promise.then(function () {
        //     console.log("share");
        // });
        console.log(that.data.inviteImgUrl);

        let shareObj = {
            title: "MYXuu邀请你打卡",
            // path: "pages/createPunchCardProject/stepThree/index"
            imageUrl: that.data.inviteImgUrl
        };
        if (options.from === 'button') {
            that.hiddenCustomModal();
        }

        return shareObj;



    },

    // 阻止模态框之外的页面点击事件
    preventTab: function () {

    },
    // 点击关闭按钮隐藏自定义的邀请模态框
    hiddenCustomModal: function () {
        var that = this;
        that.setData({
            showCustomInviteModal: false
        })
    }
});