let app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        showLoading: true, // 在未从服务器端获取到打卡圈子信息之前则显示加载动画&&空白页面
        imgRootPath: app.globalData.imgBaseSeverUrl, // 服务器图片访问BaseURL
        projectId: 0,
        joinInPunchCardProjectFlag: -1, // 当前用户是否已经加入该打卡圈子标志 -1--未知、0--未加入、1--已加入
        isCreator: -1, // 当前用户是否为圈子创建者 -1--未知、 0--参与者、1--代表当前用户为创建者

        // 打卡圈子基本信息
        projectInfo: {
            project_name: '',
            cover_img_url: 'default_cover_img',
            IntrInfoList: [],
            attendUserNum: 0,
            punchCardNum: 88888888
        },

        // 圈主基本信息
        creatorInfo: {
            creator_id: 0,
            nick_name: "",
            sex: 0,
            avatar_url: '',
            introduce: ''
        },

        // 最新加入打卡圈子的三个用户信息
        attendUserInfo: [
            // 数据格式
            // {
            //     id: '用户id',
            //     nick_name: '用户名',
            //     avatar_url: '用户头像url',
            //     pivot: {
            //         id: '用户加入打卡圈子的记录id',
            //         attend_time: '加入时间'
            //     }
            // }
        ],

        haveCollect: false,      // 是否已经收藏该打卡圈子 false--未收藏
        hiddenReportBtn: true, // 显示--true、隐藏--false 举报按钮
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        console.log(options);
        let that = this;
        // 一定传递打卡圈子的projectId, isCreator是否为创建者若未知直接传递-1(未知)即可，
        // 后续在获取打卡圈子的详细信息的时候获取到
        that.setData({
            projectId: parseInt(options.projectId),
            isCreator: parseInt(options.isCreator),
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
        let that = this;

        wx.showLoading({
            title:'加载中...'
        });

        let promise = [];

        // 1.获取当前用户是否已经加入该打卡圈子的相关信息
        promise[0] = new Promise(function (resolve) {

            let id = setTimeout(function () {
                resolve(false);
            },20000);

            wx.request({
               url: app.globalData.urlRootPath + 'index/User/checkUserIsAttend',
               method: 'post',
               data: {
                   userId: app.globalData.userInfo.id,
                   projectId: that.data.projectId
               },
               success:function (res) {
                   clearTimeout(id);
                   switch (res.statusCode) {
                       case 200:
                           let checkRes = res.data.data.checkUserIsAttendRes;
                           that.setData({
                               joinInPunchCardProjectFlag: checkRes === true ? 1 : 0
                           });
                           resolve(true);
                           break;
                       default:
                           resolve(false);
                           break;
                   }

               },
               fail:function () {
                   wx.hideLoading();
                   wx.showToast({
                       title: '网络异常...',
                       icon: "none"
                   });
                   clearTimeout(id);
                   resolve(false);
               }
            });


        });
        // 2.获取该打卡圈子的相关信息 & 圈主的基本信息
        promise[1] = new Promise(function (resolve) {
            let id = setTimeout(function () {
                resolve(false);
            },20000);

            wx.request({
                url: app.globalData.urlRootPath + 'index/PunchCardProject/getProjectInfoById',
                method: 'post',
                data: {
                    projectId: that.data.projectId,
                    userId: app.globalData.userInfo.id
                },
                success:function (res) {
                    clearTimeout(id);
                    switch (res.statusCode) {
                        case 200:
                            let data = res.data.data;

                            let attendUserList = data.attendUserList;
                            // 对参与的用户数据进行根据加入时间降序排序，因为返回的数据顺序是时间升序排序的
                            // 因此只要对数组的首尾元素对换即可,同时只要对换floor(length/2)即可 floor向下取整
                            let length = attendUserList.length;
                            for (let i = 0; i < Math.floor(length/2) ; i++)
                            {
                                let temp = attendUserList[i];
                                attendUserList[i] = attendUserList[length-i-1];
                                attendUserList[length-i-1] = temp;
                            }

                            let isCreatorFlag=parseInt(data.creator_id)===app.globalData.userInfo.id;

                            that.setData({
                                'projectInfo.project_name': data.project_name,
                                'projectInfo.cover_img_url' : data.cover_img_url,
                                'projectInfo.IntrInfoList' : data.projectIntrInfo,
                                'projectInfo.attendUserNum' : attendUserList.length,

                                'creatorInfo.creator_id' : data.creator_id,
                                'creatorInfo.nick_name' : data.creator_nick_name,
                                'creatorInfo.sex' : parseInt(data.creator_sex),
                                'creatorInfo.avatar_url' : data.creator_avatar_url,
                                'creatorInfo.introduce' : data.creator_introduce,

                                attendUserInfo: attendUserList,
                                isCreator: isCreatorFlag ? 1:0
                            });
                            // console.log(that.data.attendUserInfo);
                            resolve(true);
                            break;
                        default:
                            resolve(false);
                            break;
                    }
                },
                fail:function () {
                    wx.hideLoading();
                    wx.showToast({
                        title: '网络异常...',
                        icon: "none"
                    });
                    clearTimeout(id);
                    resolve(false);
                }
            });
        });

        // 获取当前用户是否已参加该打卡圈子、该打卡圈子信息皆成功后关闭加载动画，显示对应内容
        Promise.all(promise).then(function (res) {
            console.log(res);

            // 打卡圈子 && 该用户是否已加入打卡圈子信息皆获取成功
            if (res[0] && res[1]) {
                that.setData({
                    showLoading: false
                });

                wx.setNavigationBarTitle({
                    title: that.data.joinInPunchCardProjectFlag === 0 ? '圈子详情' : '打卡详情页'
                });

                wx.hideLoading();
            } else {
                wx.hideLoading();
                wx.showToast({
                    title: '无法获取圈子信息!',
                    icon: 'none',
                    duration: 1000,
                    complete: function () {
                       setTimeout(function () {
                           wx.switchTab({
                               url: '../index/index'
                           })
                       },1000);
                    }
                })
            }
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
        // 修改navigateBack按钮的返回事件，直接关闭其他非tabBar页面，回到首页tab
        wx.switchTab({
            url: "../../index/index"
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
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    },

    // 返回首页
    intoIndexPage: function () {
        wx.switchTab({
            url: '../index/index'
        })
    },

    // 进入发表打卡日记页面
    intoPublishPunchCardDiaryPage: function () {


    },

    // 进入发现页
    intoFindPage: function () {
        wx.switchTab({
            url: '../find/index'
        })
    },

    // 收藏、取消收藏该圈子
    dealCollect: function () {
      // TODO 收藏、取消收藏该圈子
      let that = this;
      that.setData({
          haveCollect: !that.data.haveCollect
      });
    },

    // 显示、隐藏举报按钮
    showReportBtn: function () {
        let that = this;
        that.setData({
            hiddenReportBtn: !that.data.hiddenReportBtn
        });
        wx.showToast({
            title: 'TODO',
            icon: 'none'
        });
    },

    // 加入打卡圈子
    attendPunchCardProject: function() {
        wx.showToast({
            title: 'TODO',
            icon: 'none'
        });
    },


    // 处理举报事件
    reportPunchCardProject: function () {
        wx.showToast({
            title: 'TODO',
            icon: 'none'
        })
    }


});