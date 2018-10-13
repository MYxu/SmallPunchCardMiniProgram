let app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        // 服务器图片访问BaseURL
        imgRootPath: app.globalData.imgBaseSeverUrl,
        // 在未从服务器端获取到打卡圈子信息之前则显示加载动画&&空白页面
        showLoading: true,

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
        let that = this;

        wx.showLoading({
            title:'加载中...'
        });

        // 1.进行微信登录获取code、进而获取openId
        let weiXinLoginPromise = new Promise(function (resolve) {
            that.weiXinLogin();
            let id = setInterval(function () {
                // 成功获取openId后执行下一步
                if (app.globalData.openid !== '0') {
                    clearInterval(id);
                    resolve(true);
                }
            },500);
        });

        // 2.获取openId成功,进行用户授权判断
        weiXinLoginPromise.then(function (result) {
            wx.getSetting({
                success: function(res) {
                    // 用户已经授权
                    if (res.authSetting['scope.userInfo'])
                    {
                        // 获取用户信息
                        wx.getUserInfo({
                            success: function(res) {
                                console.log("微信用户授权信息：");
                                console.log(res);

                                // 保存用户微信信息至全局变量,同时保证字段名与表字段名一致
                                app.globalData.userInfo.avatar_url = res.userInfo.avatarUrl;
                                app.globalData.userInfo.nick_name = res.userInfo.nickName;
                                app.globalData.userInfo.sex = parseInt(res.userInfo.gender);

                                // 3.提交所获取的微信用户授权信息至服务器、服务器进行新用户的注册，
                                // 已注册用户则直接返回服务器端该用户的详细信息
                                that.addWeiXinUserInfo();

                            }
                        });

                    } else {
                        // 没有授权则进入授权页进行用户授权
                        wx.redirectTo({
                            url: '../loginAuth/index'
                        })
                    }
                }
            })

        });

        // 根据全局变量中是否已经存在服务器端返回的用户信息条件，
        // 来注册addWeiXinUserInfo函数的回调函数userInfoReadyCallBack
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

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        let that = this;

        // 在获取用户的打卡圈子列表之前要确保已获取到用户id
        let promise = new Promise(function (resolve) {
            // 设置一个定时器去判断用户id是否获取成功
            let timeout = 20000;
            let id = setInterval(function () {
                timeout -= 500;
                if (timeout >= 0) {
                    if (that.data.userInfo.id !== undefined) {
                        clearInterval(id);
                        resolve(true); // 在规定时间内成功获取
                    }
                } else {
                    clearInterval(id);
                    resolve(false); // 没有在规定时间获取则认定为获取失败
                }
            },500)
        });

        promise.then(function (res) {
            if (res === false) {
                wx.showToast({
                    title: '出了点小问题,请下拉重试...',
                    icon: 'none'
                });
                return false;
            }
            // 获取当前用户参与的打卡圈子信息
            that.getMyPunchCardProject();

        });
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
        wx.stopPullDownRefresh();
        let that = this;
        that.getMyPunchCardProject();

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    // 微信登录获取openId
    weiXinLogin: function() {
        // 微信登录，获取用户openID
        wx.login({
            success: function(res) {
                if (res.code) {
                    wx.request({
                        url: app.globalData.urlRootPath +
                            'index/user/getOpenId',
                        data: {
                            code: res.code
                        },
                        success: function(response) {
                            switch (response.statusCode) {
                                case 200:
                                    app.globalData.openid = response.data.data.openid;
                                    break;
                                default:
                                    wx.showToast({
                                        title: response.data.errMsg,
                                        icon: "none"
                                    });
                                    break;
                            }
                            console.log("微信登录获取openId返回值:");
                            console.log(response);
                            console.log("openId:" + app.globalData.openid);
                        },
                        fail: function() {
                            wx.showToast({
                                title: '网络异常...',
                                icon: "none"
                            })
                        }
                    })

                } else {
                    console.error('微信登录失败:' + res.errMsg);
                }
            }
        });
    },

    // 服务器端根据openid判断用户信息是否存在，不存在将用户微信信息存入数据库
    addWeiXinUserInfo: function() {
        console.log(app.globalData.userInfo);
        let that = this;
        let avatarUrl = app.globalData.userInfo.avatar_url;
        wx.request({
            url: app.globalData.urlRootPath + 'index/user/addUserInfo',
            data: {
                open_id: app.globalData.openid,
                nick_name: app.globalData.userInfo.nick_name, // 微信昵称
                avatar_url: avatarUrl === "" ? "default_avatar": avatarUrl, // 微信用户头像
                sex: parseInt(app.globalData.userInfo.sex) // 性别 0-未知，1-男性，2-女性
            },
            header: {
                'content-type': 'application/json'
            },
            success: function (res) {
                that.setData({
                    showLoading: false // 关闭加载动画、显示获取到数据
                });
                wx.hideLoading();
                switch (res.statusCode) {
                    case 200:
                        // 本地保存服务器端返回的用户信息
                        app.globalData.userInfo = res.data.userInfo;
                        break;
                    default:
                        wx.showToast({
                            title: res.data.errMsg,
                            icon: 'none',
                            duration: 2000
                        });
                        break;
                }

                console.log(res);
                console.log("服务器端处理用户授权信息并返回用户数据");

                // 由于request是异步网络请求，可能会在Page.onLoad执行结束才能返回数据
                // 这也就会导致在Page.onLoad获取不到request设置的全局变量
                // 因为Page.onLoad结束在request之前，这时候获取的变量是空值
                // 因此加入全局回调函数
                if (app.userInfoReadyCallBack !== '') {
                    app.userInfoReadyCallBack(res.data.userInfo);
                }

            },
            fail: function () {
                wx.showToast({
                    title: '网络异常...',
                    icon: "none"
                })
            }
        });
    },



    // 查看按钮点击事件
    showMorePunchCardProject: function () {
        let that = this;
        that.setData({
            moreProjectInfo: true, // 点击之后隐藏按钮
            projectHidden: false   // 显示隐藏的打卡圈子列表
        });
    },

    // 进入打卡详情页点击事件
    intoPunchCardDetail: function (e) {
        console.log(e);
       wx.navigateTo({
           url: '../punchCardDetailPage/index'
               + "?projectId=" + e.currentTarget.dataset.project_id
               + "&isCreator=" + e.currentTarget.dataset.is_creator
       })
    },
    // 创建新的打卡圈子按钮点击事件
    createNewPunchCardProject: function () {
        wx.navigateTo({
          url: '../createPunchCardProject/stepOne/index'
        });
    },

    // 获取我创建、参与的打卡圈子相关信息
    getMyPunchCardProject: function () {
        let that = this;
        wx.request({
            url: app.globalData.urlRootPath + 'index/User/getAllProject',
            method: 'post',
            data: {
              userId: app.globalData.userInfo.id
            },
            success: function (res) {
                console.log(res);
                switch (res.statusCode) {
                    case 200:
                        let punchCardProject = res.data.data.punchCardProject;

                        that.setData({
                            projectNum: punchCardProject.length,
                            // 圈子数量超过3个则显示查看更多按钮
                            moreProjectInfo: !(punchCardProject.length > 3),
                            // 超过3个打卡圈子则隐藏第三之后的打卡圈子
                            projectHidden: punchCardProject.length > 3,
                            punchCardProjectList: punchCardProject
                        });
                        console.log(that.data.moreProjectInfo);

                        break;
                    default :
                        wx.showToast({
                            title: res.data.errMsg,
                            icon: 'none'
                        });
                    break;
                }
            },
            fail: function () {
                wx.showToast({
                    title: '网络异常...',
                    icon: 'none'
                })
            }
        })
    }
});