let app = getApp();
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        punchCardProjectItemData: {
            type: Object,
            // value: {
            //     id: 111,
            //     cover_img_url: 'default_cover_img',
            //     project_name: '啦啦啦啦啦啦',
            //     all_punch_card_num: 777,
            //     attend_user_num: 999
            // }
        }

    },

    /**
     * 组件的初始数据
     */
    data: {

        imgRootPath: app.globalData.imgBaseSeverUrl, // 服务器图片访问BaseURL

        // 打卡圈子子项右边圈子信息的宽度
        projectBaseInfoWidth: app.globalData.windowWidth - (10 + 100 + 5 + 10),

    },

    /**
     * 组件的方法列表
     */
    methods: {

        // 进入指定的打卡圈子的打卡详情页
        _intoPunchCardDetail: function (e) {
            console.log(e);
            wx.navigateTo({
                url: '/pages/punchCardDetailPage/index'
                    + "?projectId=" + e.currentTarget.dataset.projectId
                    + "&isCreator=" + -1 // 未知是否为创建者
            });
        },

    }
});
