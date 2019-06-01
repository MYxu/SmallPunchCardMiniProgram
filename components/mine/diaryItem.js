let app = getApp();
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        diaryItemData: {
            type: Object,
            // value: { // 属性值说明
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
        },
        diaryItemIndex: {
            type: Number
        },
        userInfo: {
            type: Object
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        imgRootPath: app.globalData.imgBaseSeverUrl, // 服务器图片访问BaseURL

        // 日记存在两张以上图片时每张图片显示的长、宽度
        diaryImgWidth: Math.floor((app.globalData.windowWidth-(10+40+8+5+5+5+10))/3),
        diaryImgCount: 0, // 打卡日记的图片张数
        hiddenMoreDiaryOperateBtn: true, // 控制对日记更多操作按钮显示、隐藏
    },

    /*
     * 组件的周期函数
     *
     * 在组件实例化后统计该组件也就是该条打卡日记拥有的图片资源数
     */
    attached: function () {
        let that = this;
        let diaryResource = that.data.diaryItemData.diaryResource;

        that.data.diaryImgCount = 0;
        for (let i = 0; i <diaryResource.length ; i++) {
            if (parseInt(diaryResource[i].type) === 1) { // type = 1 为图片资源
                that.data.diaryImgCount += 1;
            }
        }
        that.setData({
            diaryImgCount: that.data.diaryImgCount
        });
    },

    /**
     * 组件的方法列表
     */
    methods: {

        // 进入指定用户的个人主页
        _intoPersonalHomePage: function(e) {
            console.log(e);
            // 传递被访问者的用户id, 在个人主页根据此id查询被访问者的个人信息
            let visitedUserId = parseInt(e.currentTarget.dataset.userId);

            wx.navigateTo({
                url: '../mine/personalHomePage/index'
                    + '?visitedUserId=' + visitedUserId
            });
        },

        // 进入指定的打卡日记详情页
        _intoDiaryDetailPage:function (e) {
            console.log(e);
            let diaryId = e.currentTarget.dataset.diaryId;
            wx.navigateTo({
                url: '/pages/diaryDetailPage/index'
                    + '?diaryId=' + diaryId
            });
        },

        // 阻止模态框之外的页面点击事件
        _preventTab: function () {},

        // 弹出框蒙层截断touchmove事件
        _preventTouchMove: function() {},


        // 弹出模态对话框，显示更多的日记操作按钮 删除、投诉
        _showDiaryOperateBtn: function(e) {
            console.log(e);
            let that = this;
            let diaryIndex  = e.currentTarget.dataset.diaryIndex,
                publisherId = e.currentTarget.dataset.publisherId;

            that.setData({
                hiddenMoreDiaryOperateBtn: false, // 显示更多操作按钮

                // 当前用户为日记发表者 显示删除日记按钮
                hiddenDeleteDiaryBtn: !(parseInt(that.data.userInfo.id) === parseInt(publisherId)),

                // 显示投诉日记按钮 显示条件 当前用户不为日记发表者
                hiddenComplainDiaryBtn: !(parseInt(that.data.userInfo.id) !== parseInt(publisherId)),

                // 当前操作所针对的日记的日记数据集下标索引
                currDiaryIndex: diaryIndex
            });
        },

        // 隐藏模态对话框
        _closeDiaryOperateBtn: function() {
            let that = this;
            that.setData({
                hiddenMoreDiaryOperateBtn: true
            });
        },

        // 删除打卡日记
        _deleteDiary: function(e) {
            console.log(e);
            let that = this;
            let diaryIndex = e.currentTarget.dataset.diaryIndex;
            wx.showModal({
                title: '温馨提示',
                content: '打卡日记删除后不可恢复,请谨慎删除!',
                confirmText: '确认删除',
                confirmColor: '#E53935',
                success: function (res) {
                    // 关闭更多按钮模态框
                    that._closeDiaryOperateBtn();

                    // 确认删除
                    if (res.confirm) {
                        wx.request({
                            url: app.globalData.urlRootPath
                                + 'index/PunchCardDiary/deleteDiaryById',
                            method: 'post',
                            data: {
                                projectId: that.data.diaryItemData.punchCardProject.id,
                                diaryId: that.data.diaryItemData.id,
                                userId: parseInt(that.data.diaryItemData.publisher.id)
                            },
                            success: function (res) {
                                console.log(res);
                                let data = res.data;
                                switch (res.statusCode) {
                                    case 200:
                                        // 获取当前组件所处的页面
                                        let pages = getCurrentPages(),
                                            currPage = pages[pages.length - 1];

                                        // 获取当前页面获取到的日记总数据集
                                        let diaryList = currPage.data.punchCardDiaryList;

                                        // 删除本地该条打卡日记
                                        diaryList.splice(diaryIndex,1);

                                        currPage.setData({
                                            punchCardDiaryList: diaryList
                                        });

                                        break;
                                    default:
                                        wx.showToast({
                                            title: data.errMsg,
                                            icon: 'none',
                                            duration: 2000
                                        });
                                        break;
                                }
                            },
                            fail: function () {
                                wx.showToast({
                                    title: '网络异常!'
                                });
                            }
                        });
                    }
                }
            });
        },

        // 投诉打卡日记
        _complainDiary: function(e) {
            wx.showToast({
                title: 'TODO'
            })
        },

        // 预览日记图片
        _previewDiaryImage: function(e){
            let that = this,
                diaryResourceList = that.data.diaryItemData.diaryResource,
                length = diaryResourceList.length,
                ImgResourceList = [],
                index = 0;

            for (let i = 0; i < length; i++)
            {
                if (parseInt(diaryResourceList[i].type) === 1)
                // 加上图片访问的baseUrl  注意一定要改为http 不然预览网络图片一直黑屏
                    ImgResourceList[index++] =
                        that.data.imgRootPath + diaryResourceList[i].resource_url;
            }

            wx.previewImage({
                // 当前显示图片的http链接
                current: that.data.imgRootPath
                    + e.currentTarget.dataset.imgUrl,

                // 需要预览的图片http链接列表
                urls: ImgResourceList,
                success:function() {
                    console.log('url:' + that.data.imgRootPath + e.currentTarget.dataset.imgUrl);
                },
                fail: function (res) {
                    console.log(res);
                }
            })
        },

        // 点击打卡地址进入地图
        _intoPunchCardAddress: function() {
            let that = this;
            wx.openLocation({
                longitude: parseFloat(that.data.diaryItemData.address_longitude),
                latitude: parseFloat(that.data.diaryItemData.address_latitude)
            })
        },

        // 进入打卡圈子的打卡详情页
        _intoProjectDetailPage: function () {
            let that = this;
            wx.navigateTo({
                url: '/pages/punchCardDetailPage/index'
                    + "?projectId=" + that.data.diaryItemData.punchCardProject.id
                    + "&isCreator=" + -1
            });
        },

        // 处理用户的点赞、取消点赞点击事件
        _dealUserLike: function(e) {
            console.log(e);
            let diaryIndex = e.currentTarget.dataset.diaryIndex,
                diaryId = e.currentTarget.dataset.diaryId,
                haveLike = e.currentTarget.dataset.haveLike,
                that = this;

            let tenLikeInfo = that.data.diaryItemData.tenLikeInfo,
                likeRecordId = 0;

            // 已经点赞 则需要取消点赞
            if (haveLike === true)
            {
                // 获取该用户的点赞记录id
                let i = 0;
                for (i; i < tenLikeInfo.length; i++) {
                    let admirer = tenLikeInfo[i].admirer;
                    if (parseInt(that.data.userInfo.id) === parseInt(admirer.id)) {
                        likeRecordId = tenLikeInfo[i].id;
                        break;
                    }
                }
                wx.request({
                    url: app.globalData.urlRootPath + 'index/DiaryLike/cancelLike',
                    method: 'post',
                    data: {
                        likeRecordId: likeRecordId,
                        diaryId: diaryId,
                    },
                    success: function (res) {
                        console.log(res);
                        let data = res.data;
                        switch (res.statusCode) {
                            case 200:
                                // 取消成功后则对页面的本地点赞数据的更新
                                let detail = {};
                                // 设置当前用户对当前这条日记未点赞 点赞总人数-1
                                detail.haveLike = false;
                                detail.like_user_num = that.data.diaryItemData.like_user_num - 1;

                                // 清除当前日记的该用户的点赞信息
                                tenLikeInfo.splice(i,1);
                                detail.tenLikeInfo = tenLikeInfo;

                                // 当前被取消点赞的日记的下标索引
                                detail.diaryIndex = diaryIndex;

                                that._dealSuccessUpdateLocalData(detail);

                                break;
                            default:
                                wx.showToast({
                                    title: data.errMsg,
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
                });

            } else {
                // 进行点赞
                wx.request({
                    url: app.globalData.urlRootPath + 'index/DiaryLike/like',
                    method: 'post',
                    data: {
                        diary_id: diaryId,
                        liked_user_id: that.data.diaryItemData.publisher.id, // 被点赞者
                        'admirer_id': that.data.userInfo.id
                    },
                    success: function (res) {
                        console.log(res);
                        let data = res.data;
                        switch (res.statusCode) {
                            case 200:
                                // 点赞成功后则对页面进行本地点赞数据的更新
                                let detail = {};

                                // 设置当前用户对当前这条日记已点赞 点赞总人数+1
                                detail.haveLike = true;
                                detail.like_user_num = that.data.diaryItemData.like_user_num + 1;


                                // 将该条点赞记录添加至最点赞记录首部
                                let newLikeInfo =
                                    [{
                                        id: data.data.like_record_id,
                                        admirer:{
                                            id: that.data.userInfo.id, nick_name: that.data.userInfo.nick_name
                                        }
                                    }];

                                for (let i = 0; i < tenLikeInfo.length; i++) {
                                    newLikeInfo[newLikeInfo.length] = tenLikeInfo[i];
                                }
                                detail.tenLikeInfo = newLikeInfo;

                                // 当前被点赞的日记的下标索引
                                detail.diaryIndex = diaryIndex;

                                that._dealSuccessUpdateLocalData(detail);

                                break;
                            default:
                                wx.showToast({
                                    title: data.errMsg,
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
        },

        // 组件触发点赞||取消点赞事件并服务器处理成功后，主页面需要进行本地点赞数据更新
        _dealSuccessUpdateLocalData: function (data) {

            // 获取当前组件所处的页面
            let pages = getCurrentPages(),
                currPage = pages[pages.length - 1];

            // 获取当前页面获取到的日记总数据集
            let diaryList = currPage.data.punchCardDiaryList;

            // 修改对应打卡日记的本地点赞数据
            diaryList[data.diaryIndex].haveLike = data.haveLike;
            diaryList[data.diaryIndex].like_user_num = data.like_user_num;
            diaryList[data.diaryIndex].tenLikeInfo = data.tenLikeInfo;

            currPage.setData({
                punchCardDiaryList: diaryList
            });
        },

        // 点击评论按钮，发表对日记的一级评论 即对日记发表者进行评论
        _publishComment: function(e) {
            console.log(e);

            let paramStr = "?diaryId=" + e.currentTarget.dataset.diaryId
                + '&diaryIndex=' + e.currentTarget.dataset.diaryIndex
                + '&pid=' + e.currentTarget.dataset.pid
                + '&respondentId=' + e.currentTarget.dataset.respondentId
                + '&placeholder=' + '写评论';

            wx.navigateTo({
                url: '/pages/publishComment/index' + paramStr
            });
        },

        // 点击某条评论信息进行回复 若是点击了自己发表的评论信息则显示删除按钮
        _replyComment: function(e) {

            let commentId = e.currentTarget.dataset.commentId,  // 所点击的评论的记录id
                commentIndex = e.currentTarget.dataset.commentIndex, // 该评论在当前日记评论数据中的下标索引
                diaryId = e.currentTarget.dataset.diaryId,      // 评论记录所属日记的记录id
                diaryIndex = e.currentTarget.dataset.diaryIndex,// 日记对应的下标索引
                pid = e.currentTarget.dataset.pid,              // 一级、二级评论的标志id
                reviewerId = e.currentTarget.dataset.reviewerId,// 该条评论的评论者userId
                reviewerNickName = e.currentTarget.dataset.reviewerNickName; // 该条记录评论者的用户昵称

            // 如果该评论为小程序当前用户所发表显示删除按钮
            if (parseInt(app.globalData.userInfo.id) === parseInt(reviewerId)) {
                wx.showModal({
                    title: '',
                    content: '确定删除评论?',
                    success: function (res) {
                        // 确认删除
                        if (res.confirm)
                        {
                            wx.request({
                                url: app.globalData.urlRootPath
                                    + 'index/DiaryComment/deleteComment',
                                method: 'post',
                                data: {
                                    diaryId: diaryId,
                                    commentId: commentId
                                },
                                success: function (res) {
                                    console.log(res);
                                    let respData = res.data;
                                    switch (res.statusCode) {
                                        case 200:
                                            // 获取当前组件所处的页面
                                            let pages = getCurrentPages(),
                                                currPage = pages[pages.length - 1];

                                            // 获取当前页面获取到的日记总数据集
                                            let diaryList = currPage.data.punchCardDiaryList;

                                            // 将本地打卡日记数据集中的对应的评论记录删除
                                            diaryList[diaryIndex].allCommentInfo.splice(commentIndex,1);

                                            currPage.setData({
                                                punchCardDiaryList: diaryList
                                            });

                                            wx.showToast({
                                                title: '删除评论成功'
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
                                },
                                fail: function () {
                                    wx.showToast({
                                        title: '网络异常',
                                        icon: 'none',
                                        duration: 2000
                                    });
                                }
                            });
                        }
                    }
                });
                return true;
            }

            // 否则进入评论发表界面对该评论进行回复
            // 若新评论回复的是二级评论，那新评论与它所回复的二级评论属于相同的二级评论
            // 否则所回复的是一级评论，即新评论为所回复的一级评论的二级评论
            pid = parseInt(pid) === 0 ? commentId : pid;
            let paramStr = "?diaryId=" + diaryId
                + '&diaryIndex=' + diaryIndex
                + '&pid=' + pid
                + '&respondentId=' + reviewerId
                + '&placeholder=' + '回复: @' + reviewerNickName;

            wx.navigateTo({
                url: '/pages/publishComment/index' + paramStr
            });
        },

    }
});
