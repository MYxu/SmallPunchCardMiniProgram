let app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        textContent: '',      // 用户输入的文本内容
        textContentLength: 0,
        chooseImg: [],        // 已选择的图片的本地路径

        address: "",    // 用户选择的地理位置
        latitude: null, // 对应的纬度
        longitude: null, // 对应的经度

        diaryType: ['公开 其他成员可见', '仅圈主可见'], // 日记显示类型
        index: 0,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        console.log(options);
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

    // 用户的输入文本内容的输入监听事件
    editTextContent: function(e) {
        let that = this;
        that.data.textContent = e.detail.value;
        that.setData({
            textContentLength: that.data.textContent.length
        });
    },

    // 选择图片
    chooseImage: function () {
        let that = this;

        // 当前可选的图片张数 总9张
        let remainNum = 9 - that.data.chooseImg.length;

        wx.chooseImage({
            count: remainNum,
            sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
            sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
            success: function (res) {
                // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
                that.setData({
                    chooseImg: that.data.chooseImg.concat(res.tempFilePaths)
                });

                console.log(that.data)
            }
        })
    },
    // 点击图片预览
    previewImage: function(e){
        wx.previewImage({
            current: e.currentTarget.id, // 当前显示图片的http链接
            urls: this.data.chooseImg // 需要预览的图片http链接列表
        })
    },
    // 取消对应的已选图片 使用的catchtap 阻止事件冒泡去执行上层的图片预览事件
    cancelPictureUpload: function(e) {

        let that = this;
        let index = e.currentTarget.dataset.index;
        that.data.chooseImg.splice(index,1); // 取消对应的图片

        that.setData({
            chooseImg: that.data.chooseImg
        });
    },

    // 选择音频
    chooseSound: function () {
        wx.showToast({
            title: 'TODO'
        });
    },


    // 选择视频
    chooseVideo: function () {
        wx.showToast({
            title: 'TODO'
        });
    },

    // 跳转到定位界面 结合腾讯地图进行位置选择
    chooseLocationAddress: function () {
        wx.navigateTo({
            url: "../../position/index"
        });

    },
    // 取消已选择的地理位置
    cancelLocationAddress: function () {
        let that = this;
        that.setData({
            address: "",
            latitude: null,
            longitude: null
        })
    },

    // 设置日记可见类型：0--公开 其他成员可见 & 1--仅圈主可见
    chooseDiaryVisibleType: function (e) {
        console.log('picker发送选择改变，携带值为', e.detail.value);
        this.setData({
            index: e.detail.value
        })
    }

});