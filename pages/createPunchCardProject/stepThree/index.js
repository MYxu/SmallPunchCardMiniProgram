let app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        punchCardProjectId: 0,

        // 在创建圈子的第二步骤成功创建圈子之后进入第三步骤的圈子详情页，默认显示自定义的邀请模态框
        showCustomInviteModal: true,
        showUpdateProjectNameModel: false, // 控制显示、隐藏修改圈子名称的自定义模态框
        newProjectNameCheckFlag: false, // 修改后的圈子名是否合法标志
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
            projectName: options.projectName,
            inviteImgUrl: options.invite_img_url,
            getInviteImgFlag: options.get_invite_img_flag,
            userAvatar: app.globalData.userInfo.avatar_url,
            creatorNickName: app.globalData.userInfo.nick_name

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

        console.log(that.data.inviteImgUrl);

        // 获取邀请者id
        let inviteUserId = app.globalData.userInfo.id;
        let shareObj = {
            title: "MYXuu邀请你打卡",
            path: "pages/projectDetailPage/index" + "?inviteUserId=" + inviteUserId,
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

    // 弹出框蒙层截断touchmove事件
    preventTouchMove: function() {

    },

    // 点击关闭按钮隐藏自定义的邀请模态框
    hiddenCustomModal: function () {
        let that = this;
        that.setData({
            showCustomInviteModal: false
        })
    },

    // 显示修改圈子名称的自定义模态框
    showUpdateProjectNameModal: function() {
        let that = this;
        that.setData({
            showUpdateProjectNameModel: true
        })
    },

    // 输入框失去焦点时检测输入的圈子名称正确性
    checkInputProjectName: function(e) {
        let that = this;

        // 检测是否为十五个汉字以内的字符
        let reg = /^[\u4e00-\u9fa5]{1,15}$/;
        if(reg.test(e.detail.value)){
            that.setData({
                newProjectName: e.detail.value,
                newProjectNameCheckFlag: true
            })

        } else {
            let title = "圈子名称格式错误!";
            if (e.detail.value.length > 15)
                title = "圈子名称限制十五字符!";

            if (e.detail.value.length === 0)
                title = "请填写圈子名称";

            that.data.newProjectNameCheckFlag = false;

            wx.showToast({
                title: title,
                icon: "none"
            })
        }
    },

    // 取消修改圈子名称，隐藏模态框
    onCancel: function () {
        let that = this;
        that.setData({
            newProjectNameCheckFlag: false,
            showUpdateProjectNameModel: false
        })
    },

    // 确认修改
    onConfirm: function () {
        let that = this;
        if (that.data.newProjectNameCheckFlag === false) {
            wx.showToast({
                title: '新圈子名称格式错误!',
                icon: "none"
            });
            return false;
        }

        wx.showLoading({
            title: '处理中...'
        });

        // 新圈子名合法则提交服务器
        wx.request({
           'url': app.globalData.urlRootPath + 'index/PunchCardProject/updateName',
            data: {
               'project_id': that.data.punchCardProjectId,
               'project_name': that.data.newProjectName
            },
            success: function (response) {
               wx.hideLoading();

                switch (response.statusCode) {
                    case 200:
                        // 服务器修改成功后客户端再重新渲染圈子名称
                        that.setData({
                            newProjectNameCheckFlag: false,
                            projectName: that.data.newProjectName,
                            showUpdateProjectNameModel: false
                        });
                        break;

                    default:
                        wx.showToast({
                            title: response.data.errMsg,
                            icon: "none"
                        });
                        break;
                }
            },
            fail: function () {
                wx.showToast({
                    title: '网络异常...'
                });
            }
        });
    }





});