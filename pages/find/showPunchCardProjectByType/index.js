let app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        typeName: '',
        parentLabelName: '',
        isRecommend: false,

        punchCardProjectLists: [],
        pageNo: 1, // 打卡圈子列表数据页码
        pageSize: 8, // 打卡圈子列表数据页每一页条数
        showGetDataLoading: false, // 获取数据加载动画
        showMoreDataLoading: false, // 上拉加载更多打卡圈子数据的加载动画
        notMoreData: false, // 打卡圈子列表数据已全部加载标志

        childrenLabelList: [], // 用户所选打卡圈子父类型的所属子类型标签列表
    },


    onLoad: function (options) {
        let that = this;
        that.data.typeName = options.typeName;
        that.data.parentLabelName = options.typeName;

        // 开启获取打卡圈子列表的加载动画
        that.setData({
            showGetDataLoading: true
        });

        // 1.显示的是系统推荐的打卡圈子列表
        if (that.data.parentLabelName === '推荐')
        {
            that.setData({
                isRecommend: true
            });

            // 获取系统推荐类型的打卡圈子列表数据(页面初次显示的时候加载第一页)
            that.getRecommendList(1,that.data.pageSize,function (res) {
                let respData = res.data;
                switch (res.statusCode) {
                    case 200:
                        that.data.punchCardProjectLists = [];
                        that.setData({
                            showGetDataLoading: false, // 关闭获取数据加载动画
                            punchCardProjectLists: respData.data,
                            pageNo: 1
                        });
                        break;

                    // 暂无该类型的打卡圈子数据
                    case 400:
                        wx.showToast({
                            title: '暂无系统推荐的打卡圈子',
                            icon: 'none',
                            duration: 2000
                        });
                        that.setData({
                            showGetDataLoading: false, // 关闭获取数据加载动画
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

        } else {
            // 2.获取该类型的所有子类型标签
            let getChildrenLabel = new Promise(function (resolve) {
                wx.request({
                    url: app.globalData.urlRootPath + "index/ProjectTypeLabel/getChildrenLabel",
                    method: 'post',
                    data: {
                        parentLabelName: that.data.typeName
                    },
                    success: function (res) {
                        let respData = res.data;
                        switch (res.statusCode) {
                            case 200:
                                resolve(true);
                                for (let i = 0; i < respData.data.length; i++) {
                                    respData.data.selectedStatus = false;
                                }
                                let parentLabel = [{
                                    id: 0,
                                    label_name: '全部',
                                    selectedStatus: true
                                }];

                                that.setData({
                                    childrenLabelList: parentLabel.concat(respData.data)
                                });
                                break;

                            default:
                                resolve(false);
                                wx.showToast({
                                    title: respData.errMsg,
                                    icon: 'none',
                                    duration: 2000
                                });
                                break;
                        }
                    },
                    fail: function () {
                        resolve(false);
                        wx.showToast({
                            title: '网络异常!',
                            icon: 'none',
                            duration: 2000
                        });
                    }
                })

            });

            getChildrenLabel.then(function (res) {
                if (res === false)
                    return false;

                // 3.显示的用户所选择类型的打卡圈子列表(初次加载显示第一页数据)
                that.getProjectListByType(1,that.data.pageSize,function (res) {
                    let respData = res.data;
                    switch (res.statusCode) {
                        case 200:
                            that.data.punchCardProjectLists = [];
                            that.setData({
                                showGetDataLoading: false, // 关闭获取数据加载动画
                                punchCardProjectLists: respData.data,
                                pageNo: 1
                            });
                            break;

                        // 暂无该类型的打卡圈子数据
                        case 400:
                            wx.showToast({
                                title: '暂无打卡圈子',
                                icon: 'none',
                                duration: 2000
                            });
                            that.setData({
                                showGetDataLoading: false, // 关闭获取数据加载动画
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
                })

            });

        }
    },

    onReady: function () {
        let that = this;
        wx.setNavigationBarTitle({
            title: that.data.parentLabelName
        });
    },

    // 下拉刷新获取新的打卡圈子列表数据（同样是获取第一页数据）
    onPullDownRefresh: function () {
        let that = this;
        if (that.data.parentLabelName === "推荐")
        {
            that.getRecommendList(1,that.data.pageSize,function (res) {
                let respData = res.data;
                wx.stopPullDownRefresh();
                switch (res.statusCode) {
                    case 200:
                        that.data.punchCardProjectLists = []; // 清空原先获取的数据列表
                        that.setData({
                            punchCardProjectLists: respData.data,
                            pageNo: 1,
                            notMoreData: false, // 重置打卡圈子列表数据未加载
                        });
                        wx.showToast({
                            title: '获取新数据成功',
                            icon: 'none',
                            duration: 2000
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

        } else {
            // 重新获取最新一页的指定类型的打卡圈子列表
            that.getProjectListByType(1,that.data.pageSize,function (res) {
                let respData = res.data;
                wx.stopPullDownRefresh();
                switch (res.statusCode) {
                    case 200:
                        that.data.punchCardProjectLists = []; // 清空原先获取的数据列表
                        that.setData({
                            punchCardProjectLists: respData.data,
                            pageNo: 1,
                            notMoreData: false, // 重置打卡圈子列表数据未加载
                        });
                        wx.showToast({
                            title: '获取新数据成功',
                            icon: 'none',
                            duration: 2000
                        });
                        break;

                    // 暂无该类型的打卡圈子数据
                    case 400:
                        wx.showToast({
                            title: '暂无该类型的打卡圈子',
                            icon: 'none',
                            duration: 2000
                        });
                        that.setData({
                            showGetDataLoading: false, // 关闭获取数据加载动画
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
        }
    },

    // 下拉加载更多打卡圈子列表数据
    onReachBottom: function () {
        let that = this,
            nextPageNo = that.data.pageNo + 1;

        // 如果打卡圈子列表数据已加载完毕则不再进行请求
        if (that.data.notMoreData === true)
            return false;

        // 若第一页（onload的时候已获取）都没有数据则说明该类型暂无打卡圈子数据，不用进行请求获取数据
        if (that.data.pageNo === 1 && that.data.punchCardProjectLists.length <= 0)
            return false;

        // 显示加载下一页数据的加载动画
        that.setData({
            showMoreDataLoading: true
        });

        if (that.data.parentLabelName === "推荐")
        {
            that.getRecommendList(nextPageNo,that.data.pageSize,function (res) {
                let respData = res.data;
                switch (res.statusCode) {
                    case 200:
                        let length = respData.data.length;

                        // 当前请求页已经没有数据，说明上一页为最后一页数据
                        if (length <= 0) {
                            that.setData({
                                notMoreData: true, // 设置打卡圈子列表数据已经全部加载
                                showMoreDataLoading: false, // 关闭加载更多动画
                                pageNo: nextPageNo - 1, // 设置上一页的页号为尾页页号
                            });

                        } else {
                            // 将当前请求页的数据追加到前面已获取的数据列表中
                            for (let i = 0; i < length; i++) {
                                that.data.punchCardProjectLists[length + i] = respData.data[i];
                            }
                            that.setData({
                                notMoreData: false, // 下一页是否还存在数据未知
                                showMoreDataLoading: false,
                                pageNo: nextPageNo,
                                punchCardProjectLists: that.data.punchCardProjectLists
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

        } else {
            // 加载更多对应类型的打卡圈子列表数据
            that.getProjectListByType(nextPageNo,that.data.pageSize,function (res) {
                let respData = res.data;
                switch (res.statusCode) {
                    case 200:
                        let length = respData.data.length;

                        // 当前请求页已经没有数据，说明上一页为最后一页数据
                        if (length <= 0) {
                            that.setData({
                                notMoreData: true, // 设置打卡圈子列表数据已经全部加载
                                showMoreDataLoading: false, // 关闭加载更多动画
                                pageNo: nextPageNo - 1, // 设置上一页的页号为尾页页号
                            });

                        } else {
                            // 将当前请求页的数据追加到前面已获取的数据列表中
                            for (let i = 0; i < length; i++) {
                                that.data.punchCardProjectLists[length + i] = respData.data[i];
                            }
                            that.setData({
                                notMoreData: false, // 下一页是否还存在数据未知
                                showMoreDataLoading: false,
                                pageNo: nextPageNo,
                                punchCardProjectLists: that.data.punchCardProjectLists
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
        }
    },

    /**
     * 分页获取系统推荐的打卡圈子列表
     * @param pageNo
     * @param pageSize
     * @param successCallback
     */
    getRecommendList: function (pageNo,pageSize,successCallback) {
        wx.request({
            url: app.globalData.urlRootPath
                + 'index/PunchCardProject/getProjectListByRecommend',
            method: 'post',
            data: {
                nextPage: pageNo,
                dataNum: pageSize
            },
            success: function (res) {
                // 请求成功后执行对应的函数进行后续处理
                successCallback && successCallback(res);
            },
            fail: function () {
                wx.showToast({
                    title: '网络异常!',
                    icon: 'none',
                    duration: 2000
                });
            }
        });
    },

    /**
     * 根据用户选择的打卡圈子类型，分页获取对应类型的打卡圈子列表
     * @param pageNo
     * @param pageSize
     * @param successCallback
     */
    getProjectListByType: function (pageNo,pageSize,successCallback) {
        let that = this;
        wx.request({
            url: app.globalData.urlRootPath
                + 'index/PunchCardProject/getProjectListByType',
            method: 'post',
            data: {
                pageNo: pageNo,
                pageSize: pageSize,
                typeName: that.data.typeName === '全部' ?
                    that.data.parentLabelName: that.data.typeName
            },
            success: function (res) {
                // 请求成功后执行对应的函数进行后续处理
                successCallback && successCallback(res);
            },
            fail: function () {
                wx.showToast({
                    title: '网络异常!',
                    icon: 'none',
                    duration: 2000
                });
            }
        });
    },

    // 创建新的打卡圈子按钮点击事件
    createNewPunchCardProject: function () {
        wx.navigateTo({
            url: '/pages/createPunchCardProject/stepOne/index'
        });
    },

    /**
     * 点击标签导航进行打卡圈子分类展示（该父标签类型下的子标签类型）
     * @param e
     */
    selectTap: function (e) {
        let that = this,
            childrenIndex = e.currentTarget.dataset.index,
            labelName = e.currentTarget.dataset.labelName,
            offsetLeft = e.currentTarget.offsetLeft; // 当前所点击子类型标签与第一个类型标签的水平偏移值

        console.log(e);

        // 获取当前选择的打卡圈子类型元素的宽度
        let getTabWidth = new Promise(function (resolve) {
            wx.createSelectorQuery().selectAll('.children-label-item').boundingClientRect(function(rects){
                resolve(rects[childrenIndex].width);
            }).exec();
        });

        // 获取元素的宽度成功之后，结合当前类型节点与第一个节点的水平偏移量，计算出总水平偏移量，使之处于当前选择节点的中间位置
        getTabWidth.then(function (tabWidth) {
            let indicatorWidth = 16, // 指示器的宽度
            offset = (offsetLeft - 10) + parseInt((tabWidth - indicatorWidth) / 2); //总水平偏移量
            // 之所以offsetLeft-10 那是因为offsetLeft是针对标签的，而指示器本身就相对标签向左移动了10px，因此需要右移10px

            // 获取动画实例 用于在切换选择打卡圈子类型的时候执行对应移动的动画
            let animation = wx.createAnimation({
                duration: 400
            });

            console.log(offsetLeft);

            animation.translate(offset,0).step();
            that.setData({
                animation: animation.export()
            });
        });


        for (let i = 0; i < that.data.childrenLabelList.length; i++) {
            that.data.childrenLabelList[i].selectedStatus = (i === parseInt(childrenIndex));
        }

        that.setData({
            punchCardProjectLists: [],
            showGetDataLoading: true,
            childrenLabelList: that.data.childrenLabelList,
            notMoreData: false

        });
        that.data.notMoreData = false;
        that.data.pageNo = 1;
        that.data.typeName = labelName;

        that.getProjectListByType(1,that.data.pageSize,function (res) {
            let respData = res.data;
            switch (res.statusCode) {
                case 200:
                    that.data.punchCardProjectLists = [];
                    that.setData({
                        showGetDataLoading: false, // 关闭获取数据加载动画
                        punchCardProjectLists: respData.data,
                        pageNo: 1
                    });
                    break;

                // 暂无该类型的打卡圈子数据
                case 400:
                    wx.showToast({
                        title: '暂无打卡圈子',
                        icon: 'none',
                        duration: 2000
                    });
                    that.setData({
                        showGetDataLoading: false, // 关闭获取数据加载动画
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
    }
});