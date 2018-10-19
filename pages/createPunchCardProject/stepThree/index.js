let app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        // 用于访问服务器图片
        imgRootPath: "https://myxu.xyz/SmallPunchMiniProgramAfterEnd/",

        userAvatar: app.globalData.userInfo.avatar_url,
        creatorNickName: app.globalData.userInfo.nick_name,

        // 圈子相关信息
        punchCardProjectId: 0,
        projectCoverImgUrl: "default_cover_img", // 代表使用小程序本地内置的一张默认图片
        sysRecommendCoverImgId: 0,               // 所使用的系统推荐封面背景图的图片id,没有使用为0
        projectName: '',
        inviteImgUrl: '',
        getInviteImgFlag: true, // stepTwo中生成圈子邀请图片的结果 true为生成成功、false为失败
        projectTypeLabel: '',
        projectIntrInfo: [],
        creatorIntrInfo: '',
        weixinNum: '',

        // 在创建圈子的第二步骤成功创建圈子之后进入第三步骤的圈子详情页，默认显示自定义的邀请模态框
        showCustomInviteModal: true,
        showUpdateProjectNameModel: false, // 控制显示、隐藏修改圈子名称的自定义模态框
        newProjectNameCheckFlag: false, // 修改后的圈子名是否合法标志
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let that = this;

        console.log("threePage options:");
        console.log(options);
        // 页面初次加载，接收从stepTwo页面传递的圈子信息参数
        that.setData({
            punchCardProjectId: options.projectId,
            projectName: options.projectName,
            inviteImgUrl: options.inviteImgUrl,
            getInviteImgFlag: options.getInviteImgFlag,
            projectTypeLabel: options.projectTypeLabel,

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
     *
     * 当从其他修改页面返回时从服务器端获取最新的圈子信息
     */
    onShow: function () {
        let that = this;
        // 从服务器端获取圈主信息
        wx.request({
            url: app.globalData.urlRootPath + "index/PunchCardProject/getCreatorInfo",
            data:{
                project_id: that.data.punchCardProjectId
            },
            method: "post",
            success:function (response) {
                console.log(response);
                switch (response.statusCode) {
                    case 200:
                        that.setData({
                            creatorIntrInfo: response.data.data.creator_introduce,
                            weixinNum: response.data.data.weixin_num
                        });
                        break;

                    default:
                        wx.showToast({
                           title: response.data.errMsg,
                           icon: "none"
                        });
                        break
                }

            },
            fail: function () {
                wx.showToast({
                   title: "网络异常...",
                   icon: "none"
                });
            }
        });

        // 获取圈子简介信息
        wx.request({
            url: app.globalData.urlRootPath + "index/PunchCardProject/getProjectIntr",
            data:{
                project_id: that.data.punchCardProjectId
            },
            method: "post",
            success:function (response) {
                console.log(response);
                switch (response.statusCode) {
                    case 200:
                        that.setData({
                            projectIntrInfo: response.data.data,
                        });
                        break;

                    default:
                        wx.showToast({
                            title: response.data.errMsg,
                            icon: "none"
                        });
                        break
                }

            },
            fail: function () {
                wx.showToast({
                    title: "网络异常...",
                    icon: "none"
                });
            }
        });
        console.log(that.data)
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
            title: app.globalData.userInfo.nick_name + "邀请你打卡",
            path: "pages/punchCardDetailPage/index"
                + "?inviteUserId=" + inviteUserId
                + "&projectId=" + that.data.punchCardProjectId
                + "&isCreator=" + -1,//-1代表分享给的用户 是否为创建者未知
            imageUrl: that.data.inviteImgUrl
        };
        if (options.from === 'button') {
            that.hiddenCustomModal();
        }

        return shareObj;
    },

    // 修改打卡圈子封面图
    updateProjectCoverImg: function() {
        let that = this;
        wx.navigateTo({
           'url': '../stepThree/updateCoverImg/index'
               + "?projectId=" + that.data.punchCardProjectId
               + "&preCoverImgId=" + that.data.sysRecommendCoverImgId
               + "&curCoverImgUrl=" + that.data.projectCoverImgUrl
        });
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
               console.log(response);

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
    },

    // 修改圈子详情介绍
    updateProjectIntrInfo: function() {
        let  that = this;
        let projectIntrInfo = that.data.projectIntrInfo;
        if (projectIntrInfo !== "")
            projectIntrInfo = JSON.stringify(that.data.projectIntrInfo);
        wx.navigateTo({
            url: '../stepThree/updateProjectIntrInfo/index'
                + "?projectId=" + that.data.punchCardProjectId
                + "&projectIntrInfo=" + projectIntrInfo
        });
    },

    // 进入个人主页
    intoPersonalPage: function() {
        wx.navigateTo({
            url: "../../mine/detailPage/userInfo"
        })
    },

    // 修改圈主介绍
    updateCreatorInfo: function (e) {
        console.log(e);
        let  that = this;
        wx.navigateTo({
           url: '../stepThree/updateCreatorInfo/index'
               + "?projectId=" + that.data.punchCardProjectId
               + "&creatorIntrInfo=" + e.currentTarget.dataset.introduce
               + "&weixinNum=" + that.data.weixinNum
        });
    },

    // 修改圈子类型标签
    updateProjectType: function() {
        wx.showToast({
            title: '待开发...',
            icon: "none"
        })
    },

    // 设置报名费与分销佣金
    setProjectAttendCost: function() {
        wx.showToast({
            title: '待开发...',
            icon: "none"
        })
    },

    // 创建契约金
    setPunchCardMoneyAward: function() {
        wx.showToast({
            title: '待开发...',
            icon: "none"
        })
    },

    // 跳转至圈子的打卡详情页
    intoPunchCardDetailPage: function () {
        let that = this;
        wx.navigateTo({
            url: '../../punchCardDetailPage/index'
                + "?projectId=" + that.data.punchCardProjectId
                + "&isCreator=" + 1
        });
    },

});