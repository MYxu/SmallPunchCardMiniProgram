// pages/createPunchCardProject/stepOne/index.js
let app = getApp();
Page({

    /**
    * 页面的初始数据
    */
    data: {
        user_id: 0,         // 用户id
        privacy_type: 0,    // 打卡圈子隐私类型，默认为0--公开
        btn_disable: true   // 禁用下一步按钮直至数据验证通过

    },

    /**
    * 生命周期函数--监听页面加载
    */
    onLoad: function () {
      let that = this;
      that.setData({
          user_id: app.globalData.userInfo.id
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
    * 页面相关事件处理函数--监听用户下拉动作
    */
    onPullDownRefresh: function () {

    },

    /**
    * 页面上拉触底事件的处理函数
    */
    onReachBottom: function () {

    },

    // 监听单选按钮
    radioChange:function (e) {
        let that = this;
        that.setData({
            privacy_type: parseInt(e.detail.value)
        });
        console.log(e.detail.value);
    },


    //  输入框失去焦点检测输入的数据正确性，并根据检测结果控制下一步按钮
    checkInput: function (e) {
        let that = this;

        // 检测是否为十五个汉字以内的字符
        let reg = /^[\u4e00-\u9fa5]{1,15}$/;
        if(reg.test(e.detail.value)){
            that.setData({
                btn_disable: false,
                project_name: e.detail.value
            })

        } else {
            this.setData({btn_disable: true});
            let title = "圈子名称格式错误!";
            if (e.detail.value.length > 15)
                title = "圈子名称限制十五字符!";

            if (e.detail.value.length === 0)
                title = "请填写圈子名称";
            wx.showToast({
                title: title,
                icon: "none"
            })
        }
    },

    // 下一步按钮点击事件
    intoSetTwo : function () {
        let project_name = this.data.project_name;
        let privacy_type = this.data.privacy_type;
        wx.navigateTo({
          url: '../stepTwo/index'
          +'?project_name='+project_name
          +'&privacy_type='+privacy_type

        })
    }
});