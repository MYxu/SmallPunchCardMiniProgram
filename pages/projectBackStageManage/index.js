let app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        projectId: 0,
        projectName: '',
        showUpdateProjectNameModel: false, // 控制显示、隐藏修改圈子名称的自定义模态框
        newProjectNameCheckFlag: false, // 修改后的圈子名是否合法标志
        dataUpdateTime: '',
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        console.log(options);
        let that = this;
        let date = new Date();
        console.log(date.getFullYear());
        that.setData({
            projectId: options.projectId,
            projectName: options.projectName,

            // 圈子的统计皆为昨天的数据
            dataUpdateTime: date.getFullYear() + '-'
                + (date.getMonth() + 1) + '-'
                + (date.getDate() - 1)
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

    // 阻止模态框之外的页面点击事件
    preventTab: function () {

    },

    // 弹出框蒙层截断touchmove事件
    preventTouchMove: function() {

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
                'project_id': that.data.projectId,
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

    // 进入统计数据详情页
    intoDataStatisticsDetailPage: function() {
        wx.showToast({
            title: 'todo'
        })
    },

    // 进入圈子竞争力排名详情页
    intoProjectCompeteRankDetailPage: function() {
        wx.showToast({
            title: 'todo'
        })
    },

    // 进入创建打卡契约详情页
    intoCreatePunchCardConventionPage: function() {
        wx.showToast({
            title: 'todo'
        })
    },

    // 打卡契约详情页简介信息
    conventionHelp: function() {
        wx.showToast({
            title: '打卡契约说明todo'
        })
    },

    problemFeedback: function () {
      wx.showToast({
          title: 'TODO',
          icon: 'none'
      })
    },

});