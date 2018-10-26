// pages/createPunchCardProject/stepThree/updateCoverImg/index.js
let app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        // 服务器图片访问BaseURL
        imgRootPath: app.globalData.imgBaseSeverUrl,
        projectId: 0,
        // 当前圈子使用的系统推荐封面背景图的图片id,0--代表使用的是自定义上传的图片
        // 或者小程序内置的默认图片images/default/project_cover_img.png
        sysRecommendCoverImgId: 0,
        curCoverImgUrl: '', // 修改前使用的封面图片的路径
        systemRecommendCoverImgList: [
            // {"img_url":"../../../../images/backgroundImg/img_1.png"},
        ],
        sysRecommendCoverImgLoadNotice: "图片加载中...",

        // 用户所选择的自定义封面图的路径
        tempFilePaths: ''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        console.log(options);
        let that = this;
        that.data.projectId = options.projectId;
        that.data.sysRecommendCoverImgId = parseInt(options.preCoverImgId);
        that.data.curCoverImgUrl = options.curCoverImgUrl;

        this.getSystemRecommendCoverImg();
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
        this.getSystemRecommendCoverImg();
    },

    // 获取系统推荐的圈子封面背景图列表
    getSystemRecommendCoverImg: function () {
        let that = this;

        // 获取系统推荐的圈子封面背景图列表
        wx.request({
            url: app.globalData.urlRootPath + "index/PunchCardProject/getSysRecommendCoverImg",
            method: "post",
            success: function (res) {
                wx.hideLoading();
                console.log(res);

                switch (res.statusCode) {
                    case 200:
                        that.setData({
                            systemRecommendCoverImgList: res.data.data,
                        });
                        break;

                    default:
                        that.setData({
                            sysRecommendCoverImgLoadNotice: "暂无系统推荐封面背景图!"
                        });
                        wx.showToast({
                            title: res.data.errMsg,
                            icon: "none"
                        });
                        break;
                }
            },
            fail: function () {
                wx.hideLoading();
                wx.showToast({
                    title: '网络异常...'
                });
            }
        })
    },

    // 使用系统推荐的封面图片
    useSystemRecommendCoverImg: function (e) {
        console.log(e);
        let that = this;
        wx.showLoading({
            title: '加载中...'
        });

        wx.request({
            url: app.globalData.urlRootPath + "index/PunchCardProject/updateCoverImg",
            method: "post",
            data: {
                // 若修改前使用的是推荐封面背景图，则在修改时要设置其被使用数-1,因此需要pre~Id
                preSysRecommendCoverImgId: that.data.sysRecommendCoverImgId,
                newSysRecommendCoverImgId: parseInt(e.currentTarget.dataset.id),
                newImgUrl: e.currentTarget.dataset.url,
                curCoverImgUrl: that.data.curCoverImgUrl,
                projectId: parseInt(that.data.projectId)
            },
            success: function (res) {
                wx.hideLoading();
                console.log(res);

                switch (res.statusCode) {
                    case 200:
                        // 修改成功后将最新的封面图片信息赋值到上一个页面
                        let pages = getCurrentPages();
                        let prePage = pages[pages.length - 2];
                        prePage.setData({
                            projectCoverImgUrl: e.currentTarget.dataset.url,
                            sysRecommendCoverImgId: parseInt(e.currentTarget.dataset.id),
                        });
                        wx.navigateBack({
                            delta: 1
                        });
                        break;

                    default:
                        wx.showToast({
                            title: res.data.errMsg,
                            icon: "none"
                        });
                        break;
                }
            },
            fail: function () {
                wx.hideLoading();
                wx.showToast({
                    title: '网络异常...'
                });
            }
        })
    },

    // 使用自定义上传的图片作为封面
    useCustomUploadCoverImg: function () {
        let that = this;

        // 1.选择图片
        let chooseImg = new Promise(function (resolve) {
            wx.chooseImage({
                count: 1,
                sizeType: ['original'],
                sourceType: ['album', 'camera'],
                success (res) {
                    that.data.tempFilePaths = res.tempFilePaths[0];
                    resolve("选择图片成功");
                }
            });
        });
        wx.showLoading({
            title: '加载中...'
        });

        // 2.上传
        chooseImg.then(function (res) {
            console.log(res);
            wx.uploadFile({
                url: app.globalData.urlRootPath
                    + "index/PunchCardProject/updateCoverImg",
                filePath: that.data.tempFilePaths,
                name: "image",
                formData: {
                    // 若修改前使用的是推荐封面背景图，则在修改时要设置其被使用数-1,因此需要pre~Id
                    preSysRecommendCoverImgId: that.data.sysRecommendCoverImgId,
                    curCoverImgUrl: that.data.curCoverImgUrl,
                    projectId: parseInt(that.data.projectId)
                },
                success: function (res) {
                    wx.hideLoading();
                    let data = JSON.parse(res.data);
                    console.log(data);

                    switch (res.statusCode) {
                        case 200:
                            // 修改成功后将最新的封面图片信息赋值到上一个页面
                            let pages = getCurrentPages();
                            let prePage = pages[pages.length - 2];
                            prePage.setData({
                                projectCoverImgUrl: data.data.cover_img_url,
                                sysRecommendCoverImgId: 0,
                            });
                            wx.navigateBack({
                                delta: 1
                            });
                            break;

                        default:
                            wx.showToast({
                                title: data.errMsg,
                                icon: "none"
                            });
                            break;
                    }
                },
                fail: function () {
                    wx.hideLoading();
                    wx.showToast({
                        title: '网络异常...'
                    });
                }
            });
        })


    }
});