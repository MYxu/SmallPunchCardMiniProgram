let app = getApp();
Page({
    data: {
        //判断小程序的API，回调，参数，组件等是否在当前版本可用。
        canIUse: wx.canIUse('button.open-type.getUserInfo')
    },
    onLoad: function() {
        let that = this;
        // 微信登录，获取用户openID
        // wx.login({
        //     success: function(res) {
        //         if (res.code) {
        //             wx.request({
        //                 url: app.globalData.urlRootPath +
        //                     'index/user/getOpenId',
        //                 data: {
        //                     code: res.code
        //                 },
        //                 success: function(response) {
        //                     if (response.statusCode !== 200) {
        //                         wx.showToast({
        //                             title: response.data.errMsg,
        //                             icon: "none"
        //                         })
        //                     } else {
        //                         app.globalData.openid = response.data.data.openid
        //                     }
        //                     console.log(response);
        //                     console.log(app.globalData.openid);
        //                 },
        //
        //                 fail: function() {
        //                     wx.showToast({
        //                         title: '网络异常...',
        //                         icon: "none"
        //                     })
        //                 }
        //             })
        //
        //         } else {
        //             console.error('微信登录失败:' + res.errMsg);
        //         }
        //     }
        // });

        // 查看是否授权
        // wx.getSetting({
        //     success: function(res) {
        //         // 用户已经授权
        //         if (res.authSetting['scope.userInfo']) {
        //
        //             // 获取用户信息
        //             wx.getUserInfo({
        //                 success: function(res) {
        //                     console.log("获取用户信息：");
        //                     console.log(res);
        //                     console.log(app.globalData.openid);
        //
        //                     // 保存用户微信信息至全局变量,同时保证字段名与表字段名一致
        //                     app.globalData.userInfo.avatar_url = res.userInfo.avatarUrl;
        //                     app.globalData.userInfo.nick_name = res.userInfo.nickName;
        //                     app.globalData.userInfo.sex = parseInt(res.userInfo.gender);
        //
        //                     // 为了防止在用户第一次授权的时候，服务器未能成功添加用户信息
        //                     // 在授权成功依旧根据openId检测，再次添加，添加成功返回服务器
        //                     // 数据库用户信息
        //                     that.addWeiXinUserInfo();
        //
        //                     // 进入首页
        //                     wx.switchTab({
        //                         url: '../index/index'
        //                         // url: '../mine/detailPage/userInfo'
        //                     })
        //                 }
        //             });
        //
        //         } // 没有授权则不进入首页，显示当前的授权页面,进行用户授权
        //     }
        // })
    },

    // 授权登录回调函数，返回值的detail.userInfo等同于wx.getUserInfo的用户信息
    bindGetUserInfo: function(e) {

        // 若是用户信息存在则说明授权成功
        if (e.detail.userInfo) {

            // 保存用户微信信息至全局变量,同时保证字段名与表字段名一致
            app.globalData.userInfo.avatar_url = e.detail.userInfo.avatarUrl;
            app.globalData.userInfo.nick_name = e.detail.userInfo.nickName;
            app.globalData.userInfo.sex = e.detail.userInfo.gender;

            // 一般而言，授权只有一次，也就是第一次，在授权成功后需要将微信的一些信息
            // 写入服务器端的数据库
            let that = this;
            that.addWeiXinUserInfo();


            //授权成功后，跳转进入小程序首页
            wx.switchTab({
                url: '../index/index'
            })

        } else {
            // 用户拒接授权
            wx.showModal({
                title: '警告',
                content: '您点击了拒绝授权，将无法进入小程序，请授权之后再进入!!!',
                showCancel: false,
                confirmText: '返回授权',
                success: function (res) {
                    if (res.confirm) {
                        console.log('用户点击了“返回授权”')
                    }
                }
            })
        }
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
                    showLoading: true
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


});