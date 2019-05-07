let app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        prePage: '', // 发表评论页面的上一个页面

        diaryId: 0,        // 需要评论的日记记录id
        diaryIndex:0,      // 需要评论的日记在总的日记数据集中的索引
        diaryList: [],     // 当前圈子的打卡日记数据集

        textComment: '',      // 用户输入的文本内容评论
        textCommentLength: 0,
        placeholder: '', // 文本评论内容的输入提示
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        console.log(options);
        let that = this;
        that.data.diaryId = options.diaryId;
        that.data.diaryIndex = options.diaryIndex;
        that.data.pid = options.pid;
        that.data.respondentId = options.respondentId;

        that.setData({
            placeholder: options.placeholder
        });

        // 获取发表页面的上一个页面
        let pages = getCurrentPages();
        that.data.prePage = pages[pages.length - 2];

        // 获取日记总数据集
        that.data.diaryList = that.data.prePage.data.punchCardDiaryList;

        console.log(that.data);
    },

    onUnload: function() {
        // 返回圈子的打卡详情页时告知为由评论也返回，
        // 在打卡详情页的onShow中不要进行打卡日记的重新获取
        let that = this;
        that.data.prePage.setData({
           commentPageReturn: true
        });

    },

    // 用户的文本类型评论内容的输入监听事件
    editTextComment: function(e) {
        let that = this;
        that.data.textComment = e.detail.value;
        that.setData({
            textCommentLength: that.data.textComment.length
        });
    },

    // 取消评论
    cancelComment: function () {
        // 通知圈子的打卡详情页不进行获取新数据
        wx.navigateBack({
            delta: 1
        });
    },

    // 发表评论
    publishComment: function () {
        let  that = this;

        if (that.data.textCommentLength <= 0) {
            wx.showToast({
                title: '评论内容不能为空!',
                icon: 'none',
                duration: 2000
            });
            return false;
        }
        wx.request({
            url: app.globalData.urlRootPath + 'index/DiaryComment/addComment',
            method: 'post',
            data: {
                diary_id: that.data.diaryId,
                pid: that.data.pid,
                reviewer_id: app.globalData.userInfo.id, // 评论者id
                text_comment: that.data.textComment,
                respondent_id: that.data.respondentId // 被评论者id
            },
            success: function (res) {
                console.log(res);
                let respData = res.data;
                switch (res.statusCode) {
                    case 200:
                        // 将新的评论数据追加至本地日记数据集对应的评论列表中
                        let newCommentInfo = respData.data;
                        let commentInfo = that.data.diaryList[that.data.diaryIndex].allCommentInfo;
                        commentInfo[commentInfo.length] = newCommentInfo;

                        that.data.diaryList[that.data.diaryIndex].allCommentInfo = commentInfo;

                        that.data.prePage.setData({
                            punchCardDiaryList: that.data.diaryList
                        });
                        wx.showToast({
                            title: '评论成功'
                        });
                        wx.navigateBack({
                            delta: 1
                        });
                        console.log(respData);
                        break;
                    default:
                        wx.showToast({
                            title: respData.errMsg,
                            icon: 'none',
                            duration: 2000
                        });
                        break;
                }
            },
            fail: function () {
                wx.showToast({
                    title: '网络异常',
                    icon: 'none',
                    duration: 2000
                });
            }
        })
    }


});