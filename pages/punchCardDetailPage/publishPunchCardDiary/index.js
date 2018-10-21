let app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        projectId: 0,

        // 记录成功提交日记基本信息后服务器返回的日记记录id，用于后续日记相关资源文件的上传
        diaryId: 0,

        textContent: '',      // 用户输入的文本内容
        textContentLength: 0,
        chooseImg: [],        // 已选择的图片的本地路径

        address: "",    // 用户选择的地理位置
        latitude: null, // 对应的纬度
        longitude: null, // 对应的经度

        diaryType: ['公开 其他成员可见', '仅圈主可见'], // 日记显示类型
        index: 0,

        disabledPublishBtn: true, // 禁用true、不禁用false发表日记按钮
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        console.log(options);
        let that = this;
        that.data.projectId = parseInt(options.projectId);
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
        console.log('onUnload');
        // TODO 在发表日记过程退出 提示退出则上传失败 或进行后续处理

    },

    // 用户的输入文本内容的输入监听事件
    editTextContent: function(e) {
        let that = this;
        that.data.textContent = e.detail.value;
        that.data.disabledPublishBtn = !(
            that.data.textContent.length > 0 || that.data.chooseImg.length > 0
        );

        that.setData({
            textContentLength: that.data.textContent.length,
            disabledPublishBtn: that.data.disabledPublishBtn
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

                that.data.disabledPublishBtn = !(
                    res.tempFilePaths.length > 0 || that.data.chooseImg.length > 0
                );

                // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
                that.setData({
                    chooseImg: that.data.chooseImg.concat(res.tempFilePaths),
                    disabledPublishBtn: that.data.disabledPublishBtn
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

        that.data.disabledPublishBtn = !(
            that.data.textContent.length > 0 || that.data.chooseImg.length > 0
        );

        that.setData({
            chooseImg: that.data.chooseImg,
            disabledPublishBtn: that.data.disabledPublishBtn
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
    },

    // 发表日记
    publishDiary: function () {
        let that = this;

        wx.showLoading({
            title: '正在处理...'
        });

        // 1.提交打卡日记基本信息至服务器，获取到该条打卡日记的记录id
        let addPunchCardDiary = new Promise(function (resolve) {
            wx.request({
                url: app.globalData.urlRootPath_local + 'index/PunchCardDiary/addPunchCardDiary',
                method: 'post',
                data: {
                    project_id: that.data.projectId,
                    user_id: app.globalData.userInfo.id,
                    text_content: that.data.textContent,     // 打卡日记文件内容
                    punch_card_address: that.data.address,   // 打卡日记的地理位置信息
                    address_longitude: that.data.longitude,  // 地理位置对应的经度
                    address_latitude: that.data.latitude, // 地理位置对应的纬度
                    visible_type: parseInt(that.data.index),      // 打卡日记可见类型
                    is_repair_diary: 0,                           // 0--非补打卡日记
                },
                success: function (res) {
                    console.log(res);
                    switch (res.statusCode) {
                        case 200:
                            that.data.diaryId = parseInt(res.data.data.diaryId);
                            resolve(true);
                            break;

                        default:
                            wx.showToast({
                                title: res.data.errMsg,
                                icon: 'none',
                                duration: 2000
                            });
                            resolve(false);
                            break;
                    }
                },
                fail: function () {
                    wx.showToast({
                        title: '网络异常!'
                    });
                    resolve(false);
                }
            });
        });

        // 2.在第一步完成后根据处理结果来进行 是否要上传该条打卡日记对应的资源文件如图片、TODO 视频、音频等
        addPunchCardDiary.then(function (res) {

            let result = '发表成功!';

            // 打卡日记的基本信息已提交成功
            if (res === true)
            {
                // 进行处理打卡日记存在的资源文件 TODO 目前只支持上传图片资源
                let resourceNum = that.data.chooseImg.length;
                if (resourceNum > 0)
                {
                    // 处理资源上传
                    let successNum = 0;
                    for (let i = 0; i < resourceNum; i++)
                    {
                        // 当前图片上传失败
                        if (that.uploadDiaryResource(that.data.chooseImg,i) === false)
                        {
                            // 只要一个资源上传失败发起请求删除前面相关所有提交包括日记的基本信息
                            let deleteDiary = new Promise(function (resolve) {
                                wx.request({
                                    url: app.globalData.urlRootPath_local
                                        + 'index/PunchCardDiary/deleteDiaryById',
                                    method: 'post',
                                    data: {
                                        diaryId: that.data.diaryId
                                    },
                                    success: function (res) {
                                        console.log(res);
                                        resolve(true);
                                    },
                                    fail: function () {
                                        wx.showToast({
                                            title: '网络异常!'
                                        });
                                        resolve(false);
                                    }

                                })
                            });
                            deleteDiary.then(function (res) {
                                console.log(res);
                            });

                            // 结束上传
                            break;
                        }
                        successNum += 1;
                    }

                    if (successNum !== resourceNum)
                        result = "日记发表失败!"
                }

                wx.showToast({
                    title: result,
                    duration: 1000
                });
                setTimeout(function () {
                    wx.navigateBack({
                        delta: 1
                    });
                },1000);
            }
        });
    },

    // 上传打卡日记存在的相关资源文件 1--图片 2--音频 3--视频
    uploadDiaryResource: function (resourcePath,currUploadImgIndex) {

        let that = this;

        wx.showLoading({
            title: '图片上传中...'
        });

        // 当前需要上传的资源的文件路径对应的数组索引
        let index = currUploadImgIndex;
        let uploadTask = new Promise(function (resolve) {
            wx.uploadFile({
                url: app.globalData.urlRootPath_local
                    + 'index/PunchCardDiary/uploadDiaryResourceFile',
                filePath: resourcePath[index],
                name: 'diaryImgResource',
                formData:{
                    projectId: that.data.projectId,
                    diaryId: that.data.diaryId,
                    resourceType: 1, // 资源类型 1--图片 2--音频 3--视频
                },
                success:function (res) {
                    switch (res.statusCode) {
                        case 200:
                            wx.hideLoading();
                            resolve(true);
                            break;
                        default:
                            wx.showToast({
                                title: res.data.errMsg,
                                icon: 'none',
                                duration: 2000
                            });
                            resolve(false);
                            break;
                    }
                },
                fail: function () {
                    wx.showToast({
                        title: '网络异常,图片上传失败!'
                    });
                    resolve(false);
                }
            });
        });

        // 返回上传结果
        let uploadRes = '';
        uploadTask.then(function (res) {
            uploadRes = res === true;
        });

        let timeout = 20000,
            id = setInterval(function () {
                timeout -= 500;
                if (uploadRes !== '') {
                    clearInterval(id);
                    return uploadRes;
                }
                if (timeout === 0) {
                    clearInterval(id);
                    return false;
                }
            },500);
    },

    // 资源文件存在上传失败则请求服务器进行删除之前的相关数据 包括日记基本信息记录
    deleteDiary: function () {
        let that = this;

        let deleteDiary = new Promise(function (resolve) {
            wx.request({
                url: app.globalData.urlRootPath_local
                    + 'index/PunchCardDiary/deleteDiaryById',
                method: 'post',
                data: {
                    diaryId: that.data.diaryId
                },
                success: function (res) {
                    console.log(res);
                    resolve(true);
                },
                fail: function () {
                    wx.showToast({
                        title: '网络异常!'
                    });
                    resolve(false);
                }

            })
        });

        deleteDiary.then(function (res) {});
        return true;
    }

});