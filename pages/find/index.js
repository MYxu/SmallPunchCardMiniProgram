let app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        showLoading: true, // 在未从服务器端获取到需要的数据之前则显示加载动画&&空白页面
        hiddenLoadingMore: true, // 触发上拉事件时控制显示、隐藏加载更多
        haveMore: true, // 控制显示、隐藏 没有更多数据提示信息

        // 服务器图片访问BaseURL
        imgRootPath: app.globalData.imgBaseSeverUrl,


        // 打卡圈子精选专题
        punchCardProjectSpecialSubject: [
            '精选打卡专题-1', '精选打卡专题-2', '精选打卡专题-3', '精选打卡专题-4',
            '精选打卡专题-5', '精选打卡专题-6', '精选打卡专题-7', '精选打卡专题-8',
        ],

        // 当前已经获取到的打卡圈子推荐列表数据
        punchCardProjectRecommendList: [
            // {
            //     id: 1,
            //     cover_img_url: 'default_cover_img',
            //     project_name: '项目名1',
            //     all_punch_card_num: 9999,
            //     attend_user_num: 99999,
            //     // TODO 参与打卡圈子报名费
            //
            // },
        ],

        currPageNo: 1, // 打卡圈子推荐列表当前页 用于上拉获取下一页数据
        dataNum: 10,  // 每次请求获取的打卡圈子数，也就是每页数据包含的打卡圈子个数
        onePagePunchCardProjectRecommendList: [], // 获取到的打卡圈子推荐列表的一页数据
        getDataRes: -1, // 用于记录获取数据的请求状态 -1未知 0--请求获取数据失败 1--请求并获取数据成功
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function () {
        let that = this;

        wx.showLoading({
            title: '加载中...'
        });

        // 页面第一次加载的时候获取系统推荐的打卡圈子列表第一页数据
        let pageNo = 1;
        that.getPunchCardProjectRecommendList(pageNo);
        let timeout = 20000;
        let id = setInterval(function () {
            timeout -= 500;
            if (that.data.getDataRes === 1) {
                //  请求并获取数据成功 将获取的数据添加到当前已经获取到的打卡圈子推荐列表数据中
                let length = that.data.punchCardProjectRecommendList.length;
                if (length > 0) {
                    // 清空数组，确保显示的就是第一页数据
                    that.data.punchCardProjectRecommendList.splice(0,length);
                }
                that.setData({
                    showLoading: false, // 隐藏加载时显示的全屏空白页，显示获取到内容
                    punchCardProjectRecommendList:
                    that.data.onePagePunchCardProjectRecommendList
                });
                clearInterval(id);

            } else if(that.data.getDataRes === 0) {
                // 请求获取数据失败
                clearInterval(id);
            }

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
        // 下拉刷新获取最新的数据
        // 获取最新的一页（即第一页）系统推荐打卡圈子列表数据
        let pageNo = 1,
            that = this;
        that.getPunchCardProjectRecommendList(pageNo);
        let timeout = 20000;
        let id = setInterval(function () {
            timeout -= 500;
            if (that.data.getDataRes === 1) {
                //  请求并获取数据成功 将获取的数据添加到当前已经获取到的打卡圈子推荐列表数据中
                let length = that.data.punchCardProjectRecommendList.length;
                if (length > 0) {
                    // 清空原有的数据
                    that.data.punchCardProjectRecommendList.splice(0,length);
                }
                let newData = that.data.onePagePunchCardProjectRecommendList;

                that.setData({
                    showLoading: false, // 隐藏加载时显示的全屏空白页，显示获取到内容
                    punchCardProjectRecommendList: newData,
                    currPageNo: pageNo
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
        // 上拉获取下一页推荐的打卡圈子数据
        let that = this,
            currPageNo = that.data.currPageNo;


        that.setData({
            haveMore: true, // 加载更多之前 假设还有数据可以加载
            hiddenLoadingMore: false // 显示加载更多动画
        });

        that.getPunchCardProjectRecommendList(currPageNo + 1);
        let timeout = 20000;
        let id = setInterval(function () {
            timeout -= 500;
            if (that.data.getDataRes === 1) {
                //  请求并获取数据成功 将获取的数据添加到当前已经获取到的打卡圈子推荐列表数据中
                let currentDataList = that.data.punchCardProjectRecommendList;

                let newData = that.data.onePagePunchCardProjectRecommendList,
                    newDataLength = newData.length;

                if (newDataLength > 0) {
                    // 追加形式添加数据
                    for (let i = 0; i < newDataLength; i++) {
                        currentDataList.push(newData[i]);
                    }
                    currPageNo += 1;
                } else {
                    // 没有更多数据了 显示底部的没有更多数据提示信息
                    that.data.haveMore = false;
                }


                that.setData({
                    punchCardProjectRecommendList: currentDataList,
                    currPageNo: currPageNo,
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

    // 进入打卡圈子搜索页
    intoSearchProjectPage: function () {
      wx.navigateTo({
          url: 'searchPunchCardProject/index'
      })
    },

    // 进入打卡圈子精选专题页
    intoProjectSpecialSubject: function (e) {
        console.log(e);
    },

    // 根据选择的打卡圈子父类类型查找、显示对应的打卡圈子
    searchProjectByType: function (e) {
        console.log(e);
        let type = e.currentTarget.dataset.type;

        wx.navigateTo({
            url: '/pages/find/showPunchCardProjectByType/index' + '?typeName=' + type
        })
    },

    // 获取下一页的打卡圈子推荐列表数据 每页最多十条数据
    getPunchCardProjectRecommendList: function (pageNo) {
        let that = this;
        wx.request({
            url: app.globalData.urlRootPath
                + 'index/PunchCardProject/getProjectListByRecommend',
            method: 'post',
            data: {
                nextPage: pageNo,
                dataNum: that.data.dataNum
            },
            success: function (res) {
                console.log(res);
                wx.hideLoading();
                switch (res.statusCode) {
                    case 200:
                        that.data.onePagePunchCardProjectRecommendList = []; // 先清空之前内容
                        that.setData({
                            onePagePunchCardProjectRecommendList: res.data.data
                        });
                        that.data.getDataRes = 1; // 标明获取数据成功
                        // console.log(that.data.onePagePunchCardProjectRecommendList);
                        break;
                    default :
                        // 获取数据失败则一直显示空白页

                        that.data.getDataRes = 0; // 标明获取数据失败
                        wx.showToast({
                            title: res.data.errMsg,
                            icon: 'none',
                            duration: 2000
                        });
                        setTimeout(function () {
                            wx.showToast({
                                title: '请下拉刷新重试！',
                                icon: 'none',
                                duration: 2000
                            });
                        },2000);
                        break;
                }
            },
            fail: function () {
                that.data.getDataRes = 0; // 标明获取数据失败
                wx.hideLoading();
                wx.showToast({
                    title: '网络异常!',
                    icon: 'none'
                });
            }

        })
    },

    // 创建新的打卡圈子按钮点击事件
    createNewPunchCardProject: function () {
        wx.navigateTo({
            url: '../createPunchCardProject/stepOne/index'
        });
    },


});