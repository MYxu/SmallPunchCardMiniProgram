let app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        userInfo: '',

        windowWidth: app.globalData.windowWidth,
        pageTitle: '', // 页面标题栏标题
        newsType: '', // 消息类型 日记点赞消息likeNews  日记评论消息 commentNews

        showDataLoading: true, // 控制显示页面加载数据时的加载动画以及显示空白页面
        emptyNewsList: false,     // 没有被点赞或者被评论的消息时，显示空内容提示
        emptyContentNotice: '暂无数据',

        myLikedList: [
            // 属性说明
            // {
            //     "id": 113,  // 点赞记录id
            //     "diary_id": 45, // 对应的日记记录id
            //     "liked_user_id": 1, // 被点赞者用户id 也就是当前用户id
            //     "create_time": "2019-05-11 14:52:45", // 点赞时间
            //     "admirer": {   // 点赞者信息
            //         "id": 9, // 点赞者用户id
            //         "avatar_url": "", // 点赞者用户头像
            //         "nick_name": "李圣英" // 点赞者昵称
            //     }
            // },
        ],

        myCommentedList:[
            // 属性说明
            // {
            //     "id": 55, // 评论id
            //     "diary_id": 45, // 所属日记id
            //     "respondent_id": 1, // 被评论者用户id 也是当前用户id
            //     "text_comment": "检测他人评论自己是否发送未读评论消息2", // 评论内容
            //     "create_time": "2019-05-11 14:55:39", // 评论时间
            //     "reviewer": { // 评论者信息
            //         "id": 9, // 用户id
            //         "avatar_url": "",// 用户头像地址
            //         "nick_name": "李圣英" // 昵称
            //     }
            // }
        ],
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        console.log(options);
        let that =  this;
        that.data.userInfo = app.globalData.userInfo;
        let pageTitle = options.pageTitle;

        that.data.newsType  = options.newsType;


        if (that.data.newsType === 'likeNews')
            that.data.emptyContentNotice = "暂无日记被点赞消息";

        if (that.data.newsType === 'commentNews')
            that.data.emptyContentNotice = "暂无日记被评论消息";

        that.setData({
            userInfo: that.data.userInfo,
            emptyContentNotice: that.data.emptyContentNotice,
            newsType: that.data.newsType
        });

        wx.setNavigationBarTitle({
            title: pageTitle
        });
    },



    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        let that = this;
        that.setData({
            showDataLoading: true,
            emptyNewsList: false,
            myLikedList: [],
            myCommentList:[]
        });
        // 根据newsType=likeNews||commentNews
        // 来获取当前用户所有日记被点赞||评论的数据列表
        console.log(that.data.newsType === 'likeNews');
        console.log(that.data.newsType);

        if (that.data.newsType === 'likeNews')
            that.getMyLikedList();
        else
            that.getMyCommentedList();
    },


    //获取当前用户所有打卡日记被点赞的记录消息
    getMyLikedList: function () {
        let that = this;
        wx.request({
            url: app.globalData.urlRootPath
                + 'index/DiaryLike/getMyLikedList',
            method: 'post',
            data: {
                user_id: that.data.userInfo.id,
            },
            success: function (res) {
                let respData = res.data;
                switch (res.statusCode) {
                    case 200:
                        that.data.myLikedList = respData.data;
                        that.setData({
                            showDataLoading: false,
                            emptyNewsList: false,
                            myLikedList: that.data.myLikedList
                        });
                        console.log(that.data.myLikedList);
                        break;
                    case 400:
                        that.setData({
                            showDataLoading: false,
                            emptyNewsList: true,
                        });
                        break;
                    default:
                        wx.showToast({
                            title: respData.errMsg,
                            icon: 'none'
                        });
                        setTimeout(function () {
                            wx.navigateBack({
                                delta: 1
                            });
                        },1000);
                        break
                }

            },
            fail: function () {
                wx.showToast({
                    title: '网络异常,无法设置消息已读',
                    icon: 'none',
                    duration: 1000
                })
            }
        });
    },

    //获取当前用户所有打卡日记被评论的记录消息
    getMyCommentedList: function () {
    let that = this;
    wx.request({
        url: app.globalData.urlRootPath
            + 'index/DiaryComment/getMyCommentedList',
        method: 'post',
        data: {
            user_id: that.data.userInfo.id,
        },
        success: function (res) {
            let respData = res.data;
            switch (res.statusCode) {
                case 200:
                    that.data.myCommentedList = respData.data;
                    that.setData({
                        showDataLoading: false,
                        emptyNewsList: false,
                        myCommentedList: that.data.myCommentedList
                    });
                    console.log(that.data.myCommentedList);
                    break;
                case 400:
                    that.setData({
                        showDataLoading: false,
                        emptyNewsList: true,
                    });
                    break;
                default:
                    wx.showToast({
                        title: respData.errMsg,
                        icon: 'none'
                    });
                    setTimeout(function () {
                        wx.navigateBack({
                            delta: 1
                        });
                    },1000);
                    break
            }

        },
        fail: function () {
            wx.showToast({
                title: '网络异常,无法设置消息已读',
                icon: 'none',
                duration: 1000
            })
        }
    })
    },

    // 点击头像进入指定用户的个人主页
    intoPersonalHomePage: function(e) {
        console.log(e);

        // 传递被访问者的用户id, 在个人主页根据此id查询被访问者的个人信息
        let visitedUserId = e.currentTarget.dataset.userId;

        wx.navigateTo({
            url: '/pages/mine/personalHomePage/index'
                + '?visitedUserId=' + visitedUserId
        })
    },

    // 进入指定的打卡日记详情页
    intoDiaryDetailPage:function (e) {
        console.log(e);
        let diaryId = e.currentTarget.dataset.diaryId;
        wx.navigateTo({
            url: '/pages/diaryDetailPage/index'
                + '?diaryId=' + diaryId
        });
    },





});