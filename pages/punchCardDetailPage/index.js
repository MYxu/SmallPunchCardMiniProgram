let app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        showLoading: true, // 在未从服务器端获取到打卡圈子信息之前则显示加载动画&&空白页面
        imgRootPath: app.globalData.imgBaseSeverUrl, // 服务器图片访问BaseURL

        showUpdateProjectNameModel: false, // 控制显示、隐藏修改圈子名称的自定义模态框
        newProjectNameCheckFlag: false, // 修改后的圈子名是否合法标志

        // 头部封面图右边部分圈子信息的宽度
        projectInfoRightWidth: app.globalData.windowWidth - (10 + 110 + 10 + 10 ),

        projectId: 0,
        joinInPunchCardProjectFlag: -1, // 当前用户是否已经加入该打卡圈子标志 -1--未知、0--未加入、1--已加入
        isCreator: -1, // 当前用户是否为圈子创建者 -1--未知、 0--参与者、1--代表当前用户为创建者


        hiddenDiaryInfo: false, // 是否隐藏日记选项卡的用户打卡日记列表信息 默认初始显示用户的打卡日记列表
        hiddenProjectDetailInfo: true, // 是否隐藏圈子简介选项卡信息
        hiddenAttendUserList: true, // 是否隐藏成员选项卡列表信息

        // 打卡圈子基本信息
        projectInfo: {
            project_name: '',
            cover_img_url: 'default_cover_img',
            IntrInfoList: [], // {id:'简介记录id',content:'简介内容',order:'排序',type:'简介类型'}
            attendUserNum: 1,
            punchCardNum: 88888888
        },

        // 圈主基本信息
        creatorInfo: {
            creator_id: 0,
            nick_name: "",
            sex: 0,
            avatar_url: '',
            introduce: '',
            weChat: ''// 圈主微信号
        },

        // 用户打卡日记列表
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
            //     have_sticky: '是否置顶', // 0--不置顶
            //     is_repair_diary: '是否为补打卡日记', // 0--不是 1--是
            //     repair_punch_card_time: '补打卡时间',
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
            //     }
            // }
        ],
        diaryListPageNo: 1, // 当前已经加载的页号
        diaryListDataNum: 1, // 每页显示的数据条数
        hiddenLoadingMore: true, // 触发上拉事件时控制显示、隐藏加载更多
        haveMore: true, // 控制显示、隐藏 没有更多数据提示信息
        getDataRes: -1, // 用于记录获取数据的请求状态 -1未知 0--请求获取数据失败 1--请求并获取数据成功
        onePageDiaryListData: [], // 获取到的打卡圈子日记列表的一页数据

        // 最新加入打卡圈子的三个用户信息
        attendUserInfo: [
            // 数据格式
            // {
            //     id: '用户id',
            //     nick_name: '用户名',
            //     avatar_url: '用户头像url',
            //     sex: 0-未知，1-男性，2-女性
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
        // 获取动画实例 用于在切换显示打卡圈子内容的时候执行对应的动画
        this.animation = wx.createAnimation({
            duration: 400
        });
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

                            let isCreatorFlag = parseInt(data.creator_id)
                                === parseInt(app.globalData.userInfo.id);

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
                                'creatorInfo.weChat' : data.weixin_num,

                                attendUserInfo: attendUserList,
                                isCreator: isCreatorFlag ? 1:0
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


        // 获取第一页打卡日记列表
        that.data.punchCardDiaryList = []; // 清空原先的数据
        that.getPunchCardDiaryList(1,that.data.diaryListDataNum);

        let timeout = 20000;
        let id = setInterval(function () {
            timeout -= 500;
            if (that.data.getDataRes === 1) {
                let newData = that.data.onePageDiaryListData;

                that.setData({
                    showLoading: false, // 隐藏加载时显示的全屏空白页，显示获取到内容
                    punchCardDiaryList: newData
                });
                clearInterval(id);

            } else if(that.data.getDataRes === 0) {
                // 请求获取数据失败
                clearInterval(id);
            }

            // 获取超时
            if (timeout === 0) {
                wx.showToast({
                    title: '请求超时,无法获取数据,请下拉重试!',
                    icon: 'none',
                    duration: 2000
                });
                clearInterval(id);
            }
        },500);
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
        // 下拉刷新，重新获取第一页的打卡日记列表
        let that = this;
        that.data.punchCardDiaryList = []; // 清空原先的数据
        that.getPunchCardDiaryList(1,that.data.diaryListDataNum);

        let timeout = 20000;
        let id = setInterval(function () {
            timeout -= 500;
            if (that.data.getDataRes === 1) {
                let newData = that.data.onePageDiaryListData;

                that.setData({
                    showLoading: false, // 隐藏加载时显示的全屏空白页，显示获取到内容
                    punchCardDiaryList: newData
                });
                wx.stopPullDownRefresh();
                wx.showToast({
                    title: '获取新数据成功',
                    icon: 'none',
                    duration: 2000
                });
                clearInterval(id);

            } else if(that.data.getDataRes === 0) {
                // 请求获取数据失败
                wx.stopPullDownRefresh();
                clearInterval(id);
            }

            // 获取超时
            if (timeout === 0) {
                wx.stopPullDownRefresh();
                wx.showToast({
                    title: '请求超时,无法获取数据,请下拉重试!',
                    icon: 'none',
                    duration: 2000
                });
                clearInterval(id);
            }
        },500);
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        let that = this;
        let currPunchCardDiaryList = that.data.punchCardDiaryList;

        that.setData({
            haveMore: true, // 加载更多之前 假设还有数据可以加载
            hiddenLoadingMore: false // 显示加载更多动画
        });

        // 获取下一页数据
        that.getPunchCardDiaryList(that.data.diaryListPageNo+1,that.data.diaryListDataNum);
        let timeout = 20000;
        let id = setInterval(function () {
            timeout -= 500;
            if (that.data.getDataRes === 1) {
                //  请求并获取数据成功 将获取的数据添加到当前已经获取到的打卡圈子日记列表数据中
                let newData = that.data.onePageDiaryListData,
                    newDataLength = newData.length;

                if (newDataLength > 0) {
                    // 追加形式添加数据
                    for (let i = 0; i < newDataLength; i++) {
                        currPunchCardDiaryList.push(newData[i]);
                    }
                } else {
                    // 没有更多数据了 显示底部的没有更多数据提示信息
                    that.data.haveMore = false;
                }

                that.setData({
                    punchCardProjectRecommendList: currPunchCardDiaryList,
                    haveMore: that.data.haveMore,
                    hiddenLoadingMore: true // 关闭加载更多动画
                });
                clearInterval(id);

            } else if(that.data.getDataRes === 0) {
                // 请求获取数据失败
                that.setData({
                    haveMore: true,
                    hiddenLoadingMore: true // 关闭加载更多动画
                });
                clearInterval(id);
            }

            // 获取超时
            if (timeout === 0) {
                that.setData({
                    haveMore: true,
                    hiddenLoadingMore: true // 关闭加载更多动画
                });
                wx.showToast({
                    title: '加载超时...',
                    icon: 'none',
                    duration: 2000
                });
                clearInterval(id);
            }
        },500);


    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    },

    // 获取打卡圈子的打卡日记
    getPunchCardDiaryList: function(pageNo,dataNum) {
        console.log(dataNum);
        let that = this;
        wx.request({
            url: app.globalData.urlRootPath_local
                + 'index/punchCardDiary/getDiaryListByProjectId',
            method: 'post',
            data: {
                isCreator: that.data.isCreator,
                pageNo: pageNo,
                dataNum: dataNum,
                projectId: that.data.projectId
            },
            success: function (res) {
                console.log(res);
                let data = res.data;
                switch (res.statusCode) {
                    case 200:
                        // 若是当前页pageNo没有数据则说明总页数为pageNo-1
                        if (data.data.length <= 0)
                            pageNo = pageNo-1;

                        // 清空之前的数据
                        that.data.onePageDiaryListData = [];

                        that.setData({
                            onePageDiaryListData: data.data,
                            diaryListPageNo: pageNo
                        });
                        that.data.getDataRes = 1; // 标明获取数据成功
                        break;
                    default:
                        wx.showToast({
                            title: data.errMsg,
                            icon: 'none',
                            duration: 2000
                        });
                        that.data.getDataRes = 0; // 标明获取数据失败
                        break;
                }
                console.log(res);
            },
            fail: function () {
                that.data.getDataRes = 0; // 标明获取数据失败
                wx.showToast({
                    title: '网络异常,无法获取打卡日记',
                    icon: 'none',
                    duration: 2000
                });
            }
        })


    },


    // 修改圈子封面图片
    updateProjectCoverImg: function() {
        wx.showToast({
            title: 'todo',
            icon: 'none'
        })

    },


    // 阻止模态框之外的页面点击事件
    preventTab: function () {

    },

    // 弹出框蒙层截断touchmove事件
    preventTouchMove: function() {

    },

    // 显示修改圈子名称的自定义模态框
    showUpdateProjectNameModal: function() {
        let that = this;
        that.setData({
            showUpdateProjectNameModel: true
        })
    },

    // 输入框失去焦点时检测输入的圈子名称正确性
    checkInputProjectName: function(e) {
        let that = this;

        // 检测是否为十五个汉字以内的字符
        let reg = /^[\u4e00-\u9fa5]{1,15}$/;
        if(reg.test(e.detail.value)){
            that.setData({
                newProjectName: e.detail.value,
                newProjectNameCheckFlag: true
            })

        } else {
            let title = "圈子名称格式错误!";
            if (e.detail.value.length > 15)
                title = "圈子名称限制十五字符!";

            if (e.detail.value.length === 0)
                title = "请填写圈子名称";

            that.data.newProjectNameCheckFlag = false;

            wx.showToast({
                title: title,
                icon: "none"
            })
        }
    },

    // 取消修改圈子名称，隐藏模态框
    onCancel: function () {
        let that = this;
        that.setData({
            newProjectNameCheckFlag: false,
            showUpdateProjectNameModel: false
        })
    },

    // 确认修改
    onConfirm: function () {
        let that = this;
        if (that.data.newProjectNameCheckFlag === false) {
            wx.showToast({
                title: '新圈子名称格式错误!',
                icon: "none"
            });
            return false;
        }

        wx.showLoading({
            title: '处理中...'
        });

        // 新圈子名合法则提交服务器
        wx.request({
            'url': app.globalData.urlRootPath + 'index/PunchCardProject/updateName',
            data: {
                'project_id': that.data.projectId,
                'project_name': that.data.newProjectName
            },
            success: function (response) {
                wx.hideLoading();
                console.log(response);

                switch (response.statusCode) {
                    case 200:
                        // 服务器修改成功后客户端再重新渲染圈子名称
                        that.setData({
                            newProjectNameCheckFlag: false,
                            'projectInfo.project_name': that.data.newProjectName,
                            showUpdateProjectNameModel: false
                        });
                        break;

                    default:
                        wx.showToast({
                            title: response.data.errMsg,
                            icon: "none"
                        });
                        break;
                }
            },
            fail: function () {
                wx.showToast({
                    title: '网络异常...'
                });
            }
        });
    },

    // 进入指定用户的个人主页
    intoPersonalHomePage: function(e) {
        console.log(e);
        // 传递被访问者的用户id, 在个人主页根据此id查询被访问者的个人信息
        let visitedUserId = parseInt(e.currentTarget.dataset.userId);

        wx.navigateTo({
            url: '../mine/personalHomePage/index'
                + '?visitedUserId=' + visitedUserId
        });
    },

    // 处理用户关注、取消关注
    dealUserFollow: function() {
        wx.showToast({
            title: 'todo',
            icon: 'none'
        })
    },

    // 处理用户关注、取消关注
    contactCreator: function() {
        wx.showToast({
            title: 'todo',
            icon: 'none'
        })
    },

    // 点击日记选项卡，展示参与用户的打卡日记
    showPunchCardDiary: function() {
        console.log(1);
        let that = this;

        // 动画：将标识当前选项卡的指示器移动到日记选项，指示器的默认初始位置就是在日记选项，重置即可
        this.animation.translate(0,0).step();
        that.setData({
            animation: this.animation.export(),
            hiddenDiaryInfo: false,        // 显示用户的打卡日记列表
            hiddenProjectDetailInfo: true, // 隐藏圈子详情内容
            hiddenAttendUserList: true     // 隐藏圈子参加用户列表
        });
    },


    // 点击详情选项卡，展示打卡圈子详情信息：创建者详情、圈子简介详情
    showPunchCardProjectDetailInfo: function() {
        console.log(2);

        let that = this;

        // 动画：将标识当前选项卡的指示器移动到详情选项
        let x,  // 需要偏移的x轴长度
            width = app.globalData.windowWidth, // 屏幕宽度
            oneTabWidth = width * 0.3; // 一个选项卡所占屏幕宽度

        // x轴偏移距离计算 参考选项卡的css布局画图即可推导出
        // 移动到近邻的选项卡的偏移量为一个选项卡的宽度
        // 则从第一个选项卡移动到第n个选项卡需要的偏移量为(n-1)*(一个选项卡的宽度)
        x = oneTabWidth;

        this.animation.translate(x,0).step();
        that.setData({
            animation: this.animation.export(),
            hiddenDiaryInfo: true,          // 隐藏用户的打卡日记列表
            hiddenProjectDetailInfo: false, // 显示圈子详情内容
            hiddenAttendUserList: true      // 隐藏圈子参加用户列表
        });

    },

    // 修改圈主介绍
    updateCreatorInfo: function (e) {
        console.log(e);
        let  that = this;
        wx.navigateTo({
            url: '../createPunchCardProject/stepThree/updateCreatorInfo/index'
                + "?projectId=" + that.data.projectId
                + "&creatorIntrInfo=" + that.data.creatorInfo.introduce
                + "&weixinNum=" + that.data.creatorInfo.weChat
        });
    },

    // 修改圈子详情介绍
    updateProjectIntrInfo: function() {
        let  that = this;
        let projectIntrInfo = that.data.projectInfo.IntrInfoList;
        if (projectIntrInfo !== "")
            projectIntrInfo = JSON.stringify(that.data.projectInfo.IntrInfoList);
        wx.navigateTo({
            url: '../createPunchCardProject/stepThree/updateProjectIntrInfo/index'
                + "?projectId=" + that.data.projectId
                + "&projectIntrInfo=" + projectIntrInfo
        });
    },

    // 预览圈子简介图片
    previewProjectIntrImage: function(e){
        let that = this;

        let intrInfoList = that.data.projectInfo.IntrInfoList,
            length = intrInfoList.length;

        let projectIntrImgList = [];
        let index = 0;
        for (let i = 0; i < length; i++)
        {
            if (parseInt(intrInfoList[i].type) === 2)
                // 加上图片访问的baseUrl  注意一定要改为http 不然预览网络图片一直黑屏
                projectIntrImgList[index++] =
                    "http://myxu.xyz/SmallPunchMiniProgramAfterEnd/"
                    + intrInfoList[i].content;
        }

        console.log(e.currentTarget.dataset.imgUrl);
        wx.previewImage({
            // 当前显示图片的http链接
            current: "http://myxu.xyz/SmallPunchMiniProgramAfterEnd/"
                + e.currentTarget.dataset.imgUrl,

            // 需要预览的图片http链接列表
            urls: projectIntrImgList,
            fail: function (res) {
                console.log(res);
            }
        })
    },

    // 点击成员选项卡，展示参与打卡的用户
    showAttendUserList: function() {
        console.log(3);
        let that = this;

        // 动画：将标识当前选项卡的指示器移动到成员选项
        let x,  // 需要偏移的x轴长度
            width = app.globalData.windowWidth, // 屏幕宽度
            oneTabWidth = width * 0.3; // 一个选项卡所占屏幕宽度
        x = 2 * oneTabWidth;
        this.animation.translate(x,0).step();
        that.setData({
            animation: this.animation.export(),
            hiddenDiaryInfo: true,         // 隐藏用户的打卡日记列表
            hiddenProjectDetailInfo: true, // 隐藏圈子详情内容
            hiddenAttendUserList: false    // 显示圈子参加用户列表
        });
    },

    // 创建者查看&管理上传的微信群二维码
    showWeChatGroupQRCodeImg: function() {
        wx.showToast({
            title: 'TODO',
            icon: 'none'
        })
    },

    // 打卡成员获取创建者上传的微信群二维码
    getWeChatGroupQRCodeImg: function() {
        wx.showToast({
            title: 'TODO',
            icon: 'none'
        })
    },

    // 创建者上传微信群二维码
    uploadWeChatGroupQRCodeImg: function() {
        wx.showToast({
            title: 'TODO',
            icon: 'none'
        })
    },

    // 进入搜索成员页面
    intoSearchAttendUserPage: function() {
      wx.showToast({
          title: 'TODO',
          icon: 'none'
      })
    },

    // 返回首页
    intoIndexPage: function () {
        wx.switchTab({
            url: '../index/index'
        })
    },

    // 进入发表打卡日记页面
    intoPublishPunchCardDiaryPage: function () {
        let that = this;
        wx.navigateTo({
            url: './publishPunchCardDiary/index'
                + '?projectId=' + that.data.projectId
        })
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