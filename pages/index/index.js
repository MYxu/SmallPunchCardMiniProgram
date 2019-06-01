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

        getPunchCardProjectListStatus: false, // 我参与或者创建的打卡圈子列表数据的获取状态标识
        punchCardProjectList: [], // 我参与或者创建的打卡圈子列表
        punchCardProjectIdList:[],// 我参与或者创建的打卡圈子ID列表
        moreProjectInfo: false, // 用于控制我的打卡圈子信息中的"查看更多"按钮的显示与隐藏
        projectNum: 0, // 我参与的打卡圈子数量
        projectHidden: true,// 隐藏第3个之后的所有打卡圈子，使用查看更多按钮来控制显示

        navigationToTopHeight: 80,     // 导航栏到顶部的高度 80 + (margin-top)20
        navigationBarFix: '',           // 用于设置导航栏吸附样式
        showFollowRecommendView: false, // 控制显示、隐藏用户推荐关注页面
        showDiaryRecommendView: true,   // 控制显示、隐藏打卡日记推荐页面

        // 终端的屏幕宽度
        windowWidth: app.globalData.windowWidth,
        // 计算出日记2张图片以上时图片显示的长、宽度 (15为margin-left\right 5为图片与图片之间的间距)
        diaryImgWidth: Math.floor((app.globalData.windowWidth-(15 * 2 + 5 * 3)) / 3),

        recommendDiaryList: [
            // 属性值说明
            // {
            //     id: '打卡日记记录id',
            //     text_content: '打卡日记文本内容',
            //     punch_card_time: '打卡时间',
            //     punch_card_address: '打卡地理位置信息',
            //     address_longitude: '经度',
            //     address_latitude: '纬度',
            //     like_user_num: 点赞总人数
            //     comment_num: 评论总数
            //     haveLike: 当前小程序使用者对本条日记的点赞情况 true已点赞 false未点赞
            //     likeRecordId: 当前小程序用户对本条打卡日记点赞记录的ID号
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
            //     recentThreeAttendUserList: {
            //         avatar_url: ''
            //     }
            // }
        ], // 推荐的打卡日记数据列表
        pageNo: 1,              // 已经加载的日记数据页码
        dataNum: 5,             // 每一页包含的日记条数
        recommendDiaryListLoading: true, // 推荐的打卡日记列表初次加载动画控制标志
        moreRecommendDiaryListLoad: false, // 控制上拉加载更多的推荐打卡日记数据的加载动画的显示 false 不显示
        notMoreRecommendDiaryData: false, // 推荐的打卡日记是否全部加载标志 true=>全部加载完毕
        emptyRecommendDiaryListNotice: false, // 没有存在推荐的打卡日记时 显示对应的提示页面

        placeholder: '写评论', // 评论框 评论为空时占位符
        hiddenCommentBox: true, // 控制评论框的显示、关闭
        diaryId: 0, // 当前被评论的日记ID编号
        diaryIndex: 0, // 当前被评论日记所处日记列表中下标索引
        pid: 0, // 当前评论所属的父级评论的id
        respondentId: 0, // 被评论用户的id编号
        commentText: '', // 评论内容

        /*
         * 用于检测日记的点赞、评论数据的改变
         * 当在首页点击对应的打卡日记，进入到日记详情页时
         * 然后在打卡日记详情页进行了点赞、取消点赞、评论、删除评论操作后
         * 日记详情页中会为上一个页面（首页）设置变量来标明数据发生了改变
         * 则在返回到首页后，首页则会根据这个变量去进行对应操作（即是否要更新日记数据）
         * true 需要更新 false 不需要更新
         */
        diaryLikeAndCommentStatus: false,
    },


    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function () {
        let that = this;

        // 关闭本页面右上角的转发按钮 想要转发只能通过button实现
        wx.hideShareMenu();

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
        // 获取动画实例 用于在切换导航栏功能的时候执行对应的动画
        this.animation = wx.createAnimation({
            duration: 400
        });
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        let that = this;
        console.log('diaryLikeAndCommentStatus:' + that.data.diaryLikeAndCommentStatus);

        // 由首页进入了其他页面然后返回 触发onShow函数
        if (that.data.punchCardProjectList.length > 0 && that.data.recommendDiaryList.length > 0) {
            // 1.其他页面没有更改数据 不需要重新获取数据
            if (that.data.diaryLikeAndCommentStatus === false)  {
                return false;
            }

            // 2.当前页面还没有打卡圈子、日记列表或者其他页面更改了数据 需要重新获取
        }

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
            // 获取当前用户参与的打卡圈子信息 && 获取打卡圈子列表成功后获取推荐的打卡日记列表数据（第一页）
            that.getMyPunchCardProject();

            // 重置用于检测日记的点赞、评论数据的变量
            that.data.diaryLikeAndCommentStatus = false;

            // 获取我的未读消息数
            that.getUnreadNewsNum();
        });
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        wx.stopPullDownRefresh();
        let that = this;
        that.setData({
            recommendDiaryListLoading: true, // 下拉刷新时需要重置初次获取推荐的打卡日记（第一页）的加载动画
            notMoreRecommendDiaryData: false, // 重置推荐的打卡日记列表未加载完毕状态
        });
        that.getMyPunchCardProject();

        // 重置用于检测日记的点赞、评论数据的变量
        that.data.diaryLikeAndCommentStatus = false;

        // 获取我的未读消息数
        that.getUnreadNewsNum();

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        // 上拉加载下一页打卡日记数据
        let that = this,
            nextPageNo = that.data.pageNo + 1;

        // 打卡日记已经全部加载则不再发起请求
        if (that.data.notMoreRecommendDiaryData === true)
            return;

        that.setData({
            moreDiaryDataLoad: true, // 显示加载下一页打卡日记数据的动画
        });
        wx.showLoading({
            title: '数据加载中...'
        });

        that.getRecommendDiaryList(nextPageNo, that.data.dataNum, function (res) {
            wx.hideLoading();
            let respData = res.data;
            switch (res.statusCode) {
                case 200:
                    let length = respData.data.length;
                    // 说明当前请求的页码没有数据，则上一页码已经是最后一页
                    if (length <= 0) {
                        that.setData({
                            notMoreRecommendDiaryData: true, // 设置打卡日记列表已经全部加载完毕
                            moreRecommendDiaryListLoad: false, // 关闭加载动画
                            pageNo: nextPageNo - 1
                        });

                    } else {
                        // 将新数据追加入已获取的打卡日记列表集合中
                        for (let i = 0; i < length; i++) {
                            that.data.recommendDiaryList[that.data.recommendDiaryList.length] =
                                respData.data[i];
                        }

                        that.setData({
                            notMoreRecommendDiaryData: false, // 说明当前请求的页码还不是尾页，是否已完全加载完毕也未知
                            moreRecommendDiaryListLoad: false, // 关闭加载动画
                            recommendDiaryList: that.data.recommendDiaryList,
                            pageNo: nextPageNo
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
        })


    },

    /*
     * 监听页面滚动的处理函数
     */
    onPageScroll: function (e) {
        let that = this;
        let scrollHeight = e.scrollTop;
        console.log("scroll:" + scrollHeight);

        // 导航栏到达顶部
        if (scrollHeight > that.data.navigationToTopHeight) {
            if (that.data.navigationBarFix === '') {
                that.setData({
                    navigationBarFix: 'navigation-bar-fix' // 设置吸附样式
                });
            }

        } else {
            that.setData({
                navigationBarFix: '' // 清除吸附样式
            });
        }
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

    // 点击头像进入我的个人主页
    intoPersonalHomePage: function(e) {
        console.log(e);

        // 传递被访问者的用户id, 在个人主页根据此id查询被访问者的个人信息
        let visitedUserId = e.currentTarget.dataset.userId;

        wx.navigateTo({
            url: '../mine/personalHomePage/index'
                + '?visitedUserId=' + visitedUserId
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
                that.setData({
                    showLoading: false, // 关闭获取用户信息&打卡圈子列表的加载动画、显示获取到数据
                    recommendDiaryListLoading: true, // 显示获取推荐打卡日记列表的加载动画
                });
                wx.hideLoading();

                switch (res.statusCode) {
                    case 200:
                        let punchCardProject = res.data.data.punchCardProjectList;

                        that.setData({
                            projectNum: punchCardProject.length,
                            // 圈子数量超过3个则显示查看更多按钮
                            moreProjectInfo: !(punchCardProject.length > 3),
                            // 超过3个打卡圈子则隐藏第三之后的打卡圈子
                            projectHidden: punchCardProject.length > 3,
                            punchCardProjectList: punchCardProject
                        });

                        // 将我参与、创建的打卡圈子ID存储到punchCardProjectIdList数组中
                        that.data.punchCardProjectIdList = [];
                        for (let i = 0; i < punchCardProject.length; i++) {
                            that.data.punchCardProjectIdList[i] =
                                parseInt(punchCardProject[i].id);
                        }

                        // 在打卡圈子列表获取成功后去获取推荐的打卡日记列表（第一页）
                        that.getRecommendDiaryList(1,that.data.dataNum,function (response) {
                            // 关闭初次获取推荐打卡日记列表时的加载动画
                            that.setData({
                                recommendDiaryListLoading: false
                            });

                            let respData = response.data;
                            switch (response.statusCode) {
                                case 200:
                                    that.data.recommendDiaryList = [];// 清空列表

                                    that.setData({
                                        emptyRecommendDiaryListNotice: false,
                                        recommendDiaryList: respData.data,
                                        pageNo: 1,
                                    });
                                    console.log(that.data.recommendDiaryList);
                                    break;

                                case 400:
                                    // 我还没有打卡日记数据，显示打卡日记列表为空的提示信息
                                    // TODO 这里需要配合视图层完成没有打卡日记时的显示 暂时未做处理
                                    that.setData({
                                        emptyRecommendDiaryListNotice: true
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

    // 查看更多打卡圈子按钮点击事件
    showMorePunchCardProject: function () {
        let that = this;
        that.setData({
            moreProjectInfo: true, // 点击之后隐藏按钮
            projectHidden: false   // 显示隐藏的打卡圈子列表
        });
    },


    // 查看我创建、参与的所有打卡圈子
    showMyPunchCardProjectList: function () {
        let that = this;
        wx.navigateTo({
            url: '/pages/index/allProjectList/index'
                + "?punchCardProjectList="
                + JSON.stringify(that.data.punchCardProjectList)
        });
    },

    // 点击精彩推荐按钮进入发现页
    intoFindMorePunchCardProject: function () {
        wx.switchTab({
           url: '/pages/find/index'
        });
    },

    // 点击导航栏用户关注推荐功能 切换显示对应页面
    showFollowRecommendView: function () {
        let that = this;
        // 动画：将标识当前选项卡的指示器移动到用户关注推荐选项(第一个) 需要向左移动
        // 34(bar width) + 30(bar margin-right) = 64px
        this.animation.translate(-64,0).step();
        that.setData({
                animation: this.animation.export(),
                showFollowRecommendView: true,        // 显示用户关注推荐页面
                showDiaryRecommendView: false,        // 隐藏打卡日记推荐页面
        });
    },

    // 点击导航栏日记推荐功能 切换显示对应页面
    showDiaryRecommendView: function () {
        let that = this;
        // 动画：将标识当前选项卡的指示器移动到日记推荐选项(第二个)，也就是指示器的默认初始位置
        // 距离屏幕最左边 20（margin-left） + 38(bar width) + 30(bar margin-right) = 88px
        this.animation.translate(0,0).step();
        that.setData({
            animation: this.animation.export(),
            showFollowRecommendView: false,        // 隐藏用户关注推荐页面
            showDiaryRecommendView: true,          // 显示打卡日记推荐页面
        });
    },

    /**
     * TODO 获取推荐的打卡日记列表 暂时只是从我参加或者创建的打卡圈子获取打卡日记
     * @param pageNo 需要获取打卡日记列表的页码
     * @param dataNum 每页的打卡日记条数
     * @param callback 请求成功的回调处理函数
     */
    getRecommendDiaryList: function (pageNo, dataNum,callback) {
        let that = this;
        wx.request({
            url: app.globalData.urlRootPath +
                'index/punchCardDiary/getDiaryListByRecommend',

            method: 'post',

            data: {
                userId: parseInt(that.data.userInfo.id),
                pageNo: pageNo,
                dataNum: dataNum,
                projectIdList: that.data.punchCardProjectIdList
                // projectIdList: []

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
        })

    },

    // 根据选择的打卡圈子标签，查找到对应的父类标签，显示该父类标签的所有打卡圈子
    searchProjectByType: function (e) {
        console.log(e);
        let parentName = e.currentTarget.dataset.parentName;

        wx.navigateTo({
            url: '/pages/find/showPunchCardProjectByType/index' + '?typeName=' + parentName
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



    // 预览日记图片
    previewDiaryImage: function(e){
        let that = this;
        let index = e.currentTarget.dataset.index; // 需要预览的图片所属日记的索引
        let diaryResourceList = that.data.recommendDiaryList[index].diaryResource,
            length = diaryResourceList.length;

        let ImgResourceList = [];
        index = 0;
        for (let i = 0; i < length; i++)
        {
            if (parseInt(diaryResourceList[i].type) === 1)
            // 加上图片访问的baseUrl  注意一定要改为http 不然预览网络图片一直黑屏
                ImgResourceList[index++] =
                    "https://myxu.xyz/SmallPunchMiniProgramAfterEnd/"
                    + diaryResourceList[i].resource_url;
        }

        console.log(e.currentTarget.dataset.index);
        wx.previewImage({
            // 当前显示图片的http链接
            current: "https://myxu.xyz/SmallPunchMiniProgramAfterEnd/"
                + e.currentTarget.dataset.imgUrl,

            // 需要预览的图片http链接列表
            urls: ImgResourceList,
            success: function(res) {
                console.log(res);
            },
            fail: function (res) {
                console.log(res);
            }
        })
    },

    // 处理用户的点赞、取消点赞点击事件
    dealUserLike: function(e) {
        console.log(e);
        let diaryIndex = e.currentTarget.dataset.diaryIndex,
            diaryId = e.currentTarget.dataset.diaryId,
            haveLike = e.currentTarget.dataset.haveLike,
            that = this;

        // 当前处理的推荐打卡日记
        let currDiary = that.data.recommendDiaryList[diaryIndex];
        console.log(diaryId);

        // 已经点赞 则需要取消点赞
        if (haveLike === true)
        {

            wx.request({
                url: app.globalData.urlRootPath + 'index/DiaryLike/cancelLike',
                method: 'post',
                data: {
                    likeRecordId: currDiary.likeRecordId,
                    diaryId: diaryId,
                },
                success: function (res) {
                    console.log(res);
                    let data = res.data;
                    switch (res.statusCode) {
                        case 200:
                            // 设置当前用户对当前这条日记未点赞 点赞总人数-1
                            that.data.recommendDiaryList[diaryIndex].haveLike = false;
                            that.data.recommendDiaryList[diaryIndex].like_user_num -= 1;
                            that.data.recommendDiaryList[diaryIndex].likeRecordId   = 0;

                            that.setData({
                                recommendDiaryList: that.data.recommendDiaryList
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
                    liked_user_id: that.data.recommendDiaryList[diaryIndex].publisher.id, // 被点赞者
                    'admirer_id': that.data.userInfo.id
                },
                success: function (res) {
                    console.log(res);
                    let data = res.data;
                    switch (res.statusCode) {
                        case 200:
                            // 设置当前用户对当前这条日记已点赞 点赞总人数+1
                            that.data.recommendDiaryList[diaryIndex].haveLike = true;
                            that.data.recommendDiaryList[diaryIndex].like_user_num =
                                parseInt(that.data.recommendDiaryList[diaryIndex].like_user_num) + 1;

                            // 点赞成功后本地保存点赞记录id
                            that.data.recommendDiaryList[diaryIndex].likeRecordId = data.data.like_record_id;
                            that.setData({
                                recommendDiaryList: that.data.recommendDiaryList
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
                        title: '网络异常',
                        icon: 'none',
                        duration: 2000
                    });
                }

            })
        }
    },

    // 点击评论按钮显示评论框
    showCommentBox: function(e) {
        console.log(e);
        let that = this;
        that.data.diaryId = parseInt(e.currentTarget.dataset.diaryId);
        that.data.diaryIndex = parseInt(e.currentTarget.dataset.diaryIndex);
        that.data.pid = parseInt(e.currentTarget.dataset.pid);
        that.data.respondentId = parseInt(e.currentTarget.dataset.respondentId);

        that.setData({
            hiddenCommentBox: false,
            commentText: '',
        });
    },

    // 监听评论内容的输入
    editComment: function (e) {
        let that = this;
        that.data.commentText = e.detail.value;

        that.setData({
            commentText: that.data.commentText
        });
    },

    // 显示评论框的时候，同时显示灰幕遮挡打卡日记列表，设置touchmove事件
    // 来阻拦对打卡日记列表的滑动
    preventTouchMove: function() {
        // 什么操作都不用进行即可阻拦
    },

    // 关闭评论框
    closeCommentBox: function() {
        let that = this;
        that.setData({
            hiddenCommentBox: true,
        });
    },

    // 点击评论发送按钮，发表对日记的一级评论 即对日记发表者进行评论，数据发送至服务器
    // 发表评论
    publishComment: function () {
        let  that = this;

        if (that.data.commentText <= 0) {
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
                text_comment: that.data.commentText,
                respondent_id: that.data.respondentId // 被评论者id
            },
            success: function (res) {
                console.log(res);
                let respData = res.data;
                // 关闭评论框
                that.closeCommentBox();

                switch (res.statusCode) {
                    case 200:
                        // 设置评论数+1
                        let currDiary = that.data.recommendDiaryList[that.data.diaryIndex];
                        currDiary.comment_num = parseInt(currDiary.comment_num) + 1;

                        that.setData({
                            recommendDiaryList: that.data.recommendDiaryList
                        });
                        wx.showToast({
                            title: '评论成功'
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
        })
    },

    // 用于阻止点击事件向上冒泡 用于在点击分享按钮的时候不再触发进入该打卡日记所属的打卡圈子详情页中
    preventTap:function () {
        // 不用进行任何操作
    },

    // 获取我的未读消息条数
    getUnreadNewsNum: function () {
      let that = this;
      wx.request({
          url: app.globalData.urlRootPath
              + 'index/UnreadNewsCount/getUnreadNewsNum',
          method: 'post',
          data: {
              user_id: that.data.userInfo.id
          },
          success: function (res) {
              let respData = res.data;
              if (res.statusCode === 200) {
                  let unreadLikeNewsNum = parseInt(respData.data.unreadLikeNewsNum);
                  let unreadCommentNewsNum = parseInt(respData.data.unreadCommentNewsNum);
                  if ((unreadLikeNewsNum + unreadCommentNewsNum) !== 0) {
                      // 在小程序tab页右上角设置文本 即未读的消息数
                      wx.setTabBarBadge({
                          index: 2,
                          text: unreadCommentNewsNum + unreadLikeNewsNum + ''
                      });
                  }

              } else {
              }
          },
          fail: function () {
              wx.showToast({
                  title: '网络异常,无法获取未读消息',
                  icon: 'none',
                  duration: 1000
              })
          }
      })
    },

});