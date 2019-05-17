let app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        imgRootPath: app.globalData.imgBaseSeverUrl, // 服务器图片访问BaseURL
        userInfo: {},

        // 打卡日记列表信息显示
        punchCardDiaryList: [
            // 属性值说明
            // {
            //     id: '打卡日记记录id',
            //     text_content: '打卡日记文本内容',
            //     punch_card_time: '打卡时间',
            //     punch_card_address: '打卡地理位置信息',
            //     address_longitude: '经度',
            //     address_latitude: '纬度',
            //     visible_type: '日记可见类型', // 0-公开 圈子成员可见 1--仅圈主可见
            //     curr_diary_punch_card_day_num: '当前日记已坚持天数',
            //     is_repair_diary: '是否为补打卡日记', // 0--不是 1--是
            //     repair_punch_card_time: '补打卡时间',
            //     punchCardProject: {
            //         id: 0,// 日记所属的打卡圈子的圈子编号
            //         project_name:'圈子名称',
            //         cover_img_url: '圈子封面图片url'
            //     },
            //     publisher: {
            //         id: 0,// 日记发表者userId
            //         sex:'0--未知 1--男性 2--女性',
            //         nick_name:'',
            //         avatar_url: ''
            //     },
            //     diaryResource:{
            //         id: '打卡日记相关的资源文件记录id',
            //         resource_url: '资源文件路径信息',
            //         type: '1-图片 2-音频 3-视频'
            //     },
            //     like_user_num: 点赞总人数
            //     comment_num: 评论总数
            //     haveLike: 当前小程序使用者对本条日记的点赞情况 true已点赞 false未点赞
            //     // 每条日记只显示前十条点赞记录
            //     tenLikeInfo:[
            //         {
            //              id: 点赞记录id,
            //              admirer:{
            //                          id: 点赞者id,  nick_name: 点赞者昵称
            //                      }
            //         }
            //     ],
            //     该日记的所有评论
            //     allCommentInfo:[{
            //              id: 评论记录id
            //              pid: 该条评论所属一级评论的id
            //              diary_id: 日记记录id
            //              text_comment: 文本评论内容
            //              sound_comment: 音频评论内容文件路径
            //              create_time: 评论发表时间
            //              reviewer: {
            //                            id: 评论者用户id
            //                            nick_name: 评论者昵称
            //                            sex: 评论者性别
            //                            avatar_url: 评论者头像
            //                        }
            //              一级评论则不显示评论所回复的用户的信息 因为这是针对日记发表者进行评论的
            //              respondent: {
            //                            id: 评论所回复的用户id
            //                            nick_name: 评论所回复的用户昵称
            //                            sex: 评论所回复的用户性别
            //                            avatar_url: 评论所回复的用户头像
            //                        }
            //        }]
            // }
        ], // 从服务器获取的打卡日记数据集合
        diaryListPageNo: 1, // 当前已加载的页码
        diaryListDataNum: 2, // 每页显示的打卡日记条数
        showDiaryListLoading: true, // 控制页面初次加载时日记列表数据获取的加载动画
        emptyDiaryListNotice: false, // 控制还没有日记列表数据时的提示信息
        moreDiaryDataLoad: false, // 控制上拉加载更多打卡日记的加载动画
        notMoreDiaryData: false, // 打卡日记已全部加载
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function () {
        let that = this;

        // 关闭本页面右上角的转发按钮 想要转发只能通过button实现
        wx.hideShareMenu();

        that.setData({
            userInfo: app.globalData.userInfo,
        });
        
        // 获取我的打卡日记列表（第一页数据）
        let startTime = Date.now();         // 记录请求开始时间
        that.getMyPunchCardDiaryList(1, that.data.diaryListDataNum, function (res) {
            console.log(res);
            let respData = res.data;
            let endTime = Date.now(); // 请求结束时间
            switch (res.statusCode) {
                case 200:
                    that.data.punchCardDiaryList = []; // 清空列表

                    // 防止请求过快，设置一个定时器来让加载动画的切换平滑一点
                    if (endTime - startTime <= 1000)
                    {
                        setTimeout(function () {
                            that.setData({
                                emptyDiaryListNotice: false,
                                showDiaryListLoading: false, // 关闭初次获取打卡日记时的加载动画
                                punchCardDiaryList: respData.data,
                                diaryListPageNo: 1 // 设置当前已加载的页码为1
                            });
                        },500);
                    } else  {
                        that.setData({
                            emptyDiaryListNotice: false,
                            showDiaryListLoading: false,
                            punchCardDiaryList: respData.data,
                            diaryListPageNo: 1

                        });
                    }
                    break;

                case 400:
                    // 我还没有打卡日记数据，显示打卡日记列表为空的提示信息
                    if (endTime - startTime <= 1000)
                    {
                        setTimeout(function () {
                            that.setData({
                                emptyDiaryListNotice: true,  // 显示打卡日记列表为空的提示信息
                                showDiaryListLoading: false, // 关闭初次获取打卡日记时的加载动画
                            });
                        },1000);

                    } else  {
                        that.setData({
                            emptyDiaryListNotice: true,
                            showDiaryListLoading: false,
                        });
                    }
                    break;

                default:
                    wx.showToast({
                        title: respData.errMsg,
                        icon: 'none',
                        duration: 2000
                    });
                    break;
            }
        });

    },

    onShow: function () {},

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {},

    /**
     * 页面下拉刷新事件的处理函数
     */
    onPullDownRefresh: function () {
        let that = this;
        that.getMyPunchCardDiaryList(1, that.data.diaryListDataNum, function (res) {

            wx.stopPullDownRefresh(); // 请求成功停止下拉刷新

            let respData = res.data;
            switch (res.statusCode) {
                case 200:
                    that.data.punchCardDiaryList = []; // 清空列表
                    that.setData({
                        emptyDiaryListNotice: false,
                        showDiaryListLoading: false,
                        punchCardDiaryList: respData.data,
                        diaryListPageNo: 1,
                        notMoreDiaryData: false // 下拉刷新后需要重置打卡日记列表为未完全加载完毕状态
                    });

                    wx.showToast({
                        title: '获取新数据成功',
                        duration: 2000
                    });

                    break;

                case 400:
                    // 我还没有打卡日记数据，显示打卡日记列表为空的提示信息
                    that.setData({
                        emptyDiaryListNotice: true,
                        showDiaryListLoading: false,
                        notMoreDiaryData: false
                    });
                    break;

                default:
                    wx.showToast({
                        title: respData.errMsg,
                        icon: 'none',
                        duration: 2000
                    });
                    break;
            }
        });
    },


    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        // 上拉加载下一页打卡日记数据
        let that = this,
            nextPageNo = that.data.diaryListPageNo + 1;

        // 打卡日记已经全部加载则不再发起请求
        if (that.data.notMoreDiaryData === true)
            return;

        that.setData({
            moreDiaryDataLoad: true, // 显示加载下一页打卡日记数据的动画
        });

        that.getMyPunchCardDiaryList(nextPageNo, that.data.diaryListDataNum, function (res) {
            let respData = res.data;
            switch (res.statusCode) {
                case 200:
                    let length = respData.data.length;
                    // 说明当前请求的页码没有数据，则上一页码已经是最后一页
                    if (length <= 0) {
                        that.setData({
                            notMoreDiaryData: true, // 设置打卡日记列表已经全部加载完毕
                            moreDiaryDataLoad: false, // 关闭加载动画
                            diaryListPageNo: nextPageNo - 1
                        });
                        console.log(that.data.diaryListPageNo);

                    } else {
                        // 将新数据追加入已获取的打卡日记列表集合中
                        for (let i = 0; i < length; i++) {
                            that.data.punchCardDiaryList[that.data.punchCardDiaryList.length] =
                                respData.data[i];
                        }

                        that.setData({
                            notMoreDiaryData: false, // 说明当前请求的页码还不是尾页，是否已完全加载完毕也未知
                            moreDiaryDataLoad: false, // 关闭加载动画
                            punchCardDiaryList: that.data.punchCardDiaryList,
                            diaryListPageNo: nextPageNo
                        });
                        console.log(that.data.diaryListPageNo);

                    }
                    break;

                default:
                    wx.showToast({
                        title: respData.errMsg,
                        icon: 'none',
                        duration: 2000
                    });
                    break;
            }
        })
    },

    // 点击日记的分享按钮 分享打卡日记
    onShareAppMessage: function(options) {
        console.log(options);

        // 获取当前被分享的打卡日记相关数据
        let currDiary = options.target.dataset.diary;

        // 当前用户id
        let currUserId = parseInt(app.globalData.userInfo.id);
        // 与该打卡日记的用户id对比 检测当前用户是否为该日记的发表者
        let isDiaryPublisher = (currUserId === parseInt(currDiary.publisher.id));

        // 设置分享的标题
        let shareTitle = '';
        if (isDiaryPublisher) {
            // 分享的是自己的打卡日记
            shareTitle = '【' + app.globalData.userInfo.nick_name + '】的打卡日记';
        } else {
            shareTitle = currDiary.publisher.nick_name + '的打卡日记';
        }

        // 设置分享的图片的url
        let imgUrl = '';
        if (currDiary.diaryResource.length <= 0 || parseInt(currDiary.diaryResource[0].type) === 2) {
            // 资源列表为空或者资源列表第一个元素存放的不是图片（type=1）都说明该日记不存在图片资源
            //  分享一张已设置的图片
            imgUrl = 'http://myxu.xyz/SmallPunchMiniProgramAfterEnd/public/image_upload' +
                '/project_cover_img/sys_recommend/20181001/520d70c0a777ec055df58c3fed943b37.png';
        } else {
            // 存在图片资源 设置第一张图片为分享图片
            imgUrl = app.globalData.imgBaseSeverUrl + currDiary.diaryResource[0].resource_url;
        }
        console.log(imgUrl);

        return {
            title: shareTitle,
            path: '/pages/diaryDetailPage/index' + '?diaryId=' + currDiary.id,
            imageUrl: imgUrl
        };
    },


    // 进入我的主页，展示更为详细的用户信息
    intoUserInfoDetailPage: function (e) {
        console.log(e);
        wx.navigateTo({
            url: './personalHomePage/index'
                + "?visitedUserId=" + app.globalData.userInfo.id
        })
    },


    /**
     * * 获取指定页码的打卡日记列表
     * @param pageNo 需要获取打卡日记列表的页码
     * @param dataNum 每页的打卡日记条数
     * @param callback 请求成功的回调处理函数
     */
    getMyPunchCardDiaryList: function(pageNo,dataNum,callback) {
        wx.request({
            url: app.globalData.urlRootPath + 'index/User/getUserPunchCardDiaryList',
            method: 'post',
            data: {
                visitedUserId: app.globalData.userInfo.id, // 被查看打卡日记列表的用户的id
                visitorUserId: app.globalData.userInfo.id, // 查看者的id
                pageNo: parseInt(pageNo),
                dataNum: parseInt(dataNum),
                isDiaryCreator: 1, // 代表查询自己的打卡日记列表 0则代表查看他人的
            },
            success: function (res) {
                // 请求成功执行回调函数进行对应的处理
                callback && callback(res);
            },
            fail: function () {
                wx.showToast({
                    title: '网络异常,无法获取打卡日记',
                    icon: 'none',
                    duration: 2000
                });
            }
        });
    },

    // 打卡日记为空时，可以点击跳转到打卡圈子列表所处的首页
    intoPunchCardListPage: function() {
        wx.switchTab({
            url: '/pages/index/index'
        })
    },

    intoDiaryDetailPage: function () {
        wx.showToast({
            title: '进入打卡日记详情页'

        })
    },

    todoNotice: function () {
      wx.showToast({
          icon: 'none',
          title: '功能开发中',
          duration: 1000
      })
    },

});