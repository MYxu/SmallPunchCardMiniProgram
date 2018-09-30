let app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        projectId: 0,
        creatorIntrInfo: '',
        inputTextNum: 0,
        creatorWeiXinNum: '',
        creatorWeiXinNumFlag: true,
        inputWeiXinNum: 0
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        console.log(options);
        let that = this;
        that.data.projectId = options.projectId;
        that.setData({
            creatorIntrInfo: options.creatorIntrInfo,
            creatorWeiXinNum: options.weixinNum
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

    // 圈主简介信息输入触发事件
    creatorIntrInfoInput: function (e) {
        console.log(e);
        let that = this;
        that.data.creatorIntrInfo = e.detail.value;
        that.setData({
            inputTextNum: e.detail.cursor
        });
    },

    // 圈主微信输入触发事件
    creatorWeiXinInfoInput: function (e) {
        console.log(e);
        let that = this;

        that.data.creatorWeiXinNum = e.detail.value;
        that.setData({
            inputWeiXinNum: e.detail.cursor
        });
    },

    // 微信号格式检测
    checkWeiXinNumInput: function(e) {
        let that = this;
        // 对输入的微信号进行验证 长度为6-20，由字母、数字、下划线、减号组成，字母开头
        let creatorWeiXinNum = e.detail.value;
        that.data.creatorWeiXinNumFlag = true; // 允许微信号不填写
        if (creatorWeiXinNum !== '') {
            let reg = /^[a-zA-Z][-_a-zA-Z0-9]{5,19}$/;
            if (reg.test(creatorWeiXinNum)) {
                that.data.creatorWeiXinNumFlag = true;
            } else {
                that.data.creatorWeiXinNumFlag = false;
                wx.showToast({
                    title: "微信号由6-20个字母开头、字母、数字、下划线、减号组成",
                    icon: "none"
                })
            }
        }
    },

    // 上传更改圈主简介
    updateCreatorIntrInfo: function () {
        let that = this;

        if (that.data.creatorWeiXinNumFlag === true) {
            wx.request({
                url: app.globalData.urlRootPath
                    + "index/PunchCardProject/updateCreatorInfo",
                method: "post",
                data:{
                    project_id: that.data.projectId,
                    creator_introduce: that.data.creatorIntrInfo,
                    weixin_num: that.data.creatorWeiXinNum
                },
                success: function (response) {
                    console.log(response);
                    switch (response.statusCode) {
                        case 200:
                            wx.navigateBack({
                                delta: 1
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
                        title: "网络异常...",
                        icon: "none"
                    });
                }
            });
        } else {
            wx.showToast({
                title: "微信号格式错误!",
                icon: "none"
            });
        }


    }
});