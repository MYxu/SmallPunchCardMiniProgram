// pages/mine/detailPage/userInfo.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
      // 当未获取到用户头像时使用默认头像
      defaultUserAvatar: '/images/default/userAvatar.png',

      // TODO 默认个人背景图
      defaultBgImg: '',

      // 兴趣标签数据
      personalLabelLists: '',

      // 主页访客中最新的五个用户头像地址
      latestFiveUserAvatarList:'',

      userInfo:'',

      hideCommentInputView:'none',
      sendBtnAttr: {
          'allowSend': true
      },

      // 打卡日记数据
      diaryLists: ''

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      this.setData({
          userInfo: app.globalData.userInfo,
          defaultUserAvatar: app.globalData.userInfo.avatar_url,

          //TODO 动态获取个人标签数据
          // personalLabelLists:[
          //     '小学生','大学生','外语','阅读',
          //     '托福雅思','国学','亲子幼教',
          //     '考院','音乐','绘画','运动健身'
          // ],
          // TODO 动态获取最新五个访客的头像地址
          latestFiveUserAvatarList: [
              app.globalData.userInfo.avatar_url,
              app.globalData.userInfo.avatar_url,
              app.globalData.userInfo.avatar_url,
              app.globalData.userInfo.avatar_url,
              app.globalData.userInfo.avatar_url
          ],
          // TODO 动态获取所有我参与的打卡圈子相关信息
          joinInPunchCardProjectList: [
              {
                  'punchCardProjectName': 'test1',
                  'punchCardDays':99,
                  'rank': '1',
                  'bgColor': '#73E68C'
              },
              {
                  'punchCardProjectName': 'test2',
                  'punchCardDays':6,
                  'rank': '100',
                  'bgColor': 'red'
              },
              {
                  'punchCardProjectName': 'test3',
                  'punchCardDays':79,
                  'rank': '5',
                  'bgColor': 'cornflowerblue'
              },
              {
                  'punchCardProjectName': 'test4',
                  'punchCardDays':0,
                  'rank': '暂无',
                  'bgColor': 'darkorange'
              }
          ],

          // TODO 这里的打卡日记数据应该从服务器端获取
          diaryLists: [
              {
                  diaryDetailContent: '这是打卡日记111111111,哈哈哈哈哈哈哈哈哈哈啦啦啦啦',
                  likeUserInfo: {
                      "num": 20,
                      "info": [
                          {"nick_name": 'MYXuu1', "open_id": 111},
                          {"nick_name": 'MYXuu2', "open_id": 222},
                          {"nick_name": 'MYXuu3', "open_id": 333},
                          {"nick_name": 'MYXuu4', "open_id": 111},
                          {"nick_name": 'MYXuu5', "open_id": 222},
                          {"nick_name": 'MYXuu6', "open_id": 333},
                          {"nick_name": 'MYXuu7', "open_id": 111},
                          {"nick_name": 'MYXuu8', "open_id": 222},
                          {"nick_name": 'MYXuu9', "open_id": 222},
                          {"nick_name": 'MYXuu10', "open_id": 333}
                      ]
                  },
                  commentInfo: [
                      {
                          "content": '超级赞dnf哈哈哈哈哈哈啦啦啦啦哈哈哈哈哈哈哈哈哈哈',
                          "sender": {'nick_name': 'MYXu', 'open_id': 123},
                          'receiver': ''
                      },
                      {
                          "content": '谢谢!',
                          "sender": {'nick_name': 'MYXuu', 'open_id': 456},
                          'receiver': {'nick_name': 'MYXu', 'open_id': 123}
                      },
                      {
                          "content": '啦啦啦啦啦啦啦啦绿绿绿绿绿绿绿绿绿绿绿绿绿绿绿绿绿绿',
                          "sender": {'nick_name': 'MYXu', 'open_id': 123},
                          'receiver': {'nick_name': 'MYXuu', 'open_id': 456}
                      },
                      {
                          "content": '测试一下啦啦啦啦啦啦啦啦绿啦绿绿绿绿绿绿绿绿绿绿绿绿绿绿绿绿绿绿绿' +
                          '绿绿绿绿绿绿绿绿绿绿绿绿绿绿绿绿绿绿绿绿绿绿绿绿绿绿绿绿',
                          "sender": {'nick_name': 'MYXu', 'open_id': 123},
                          'receiver': ''
                      }
                  ]
              },
              {
                  diaryDetailContent: '这是打卡日记222222222,哈哈哈哈哈哈哈哈哈哈啦啦啦啦',
                  likeUserInfo: {
                      "num": 20,
                      "info": [
                          {"nick_name": 'MYXuu1', "open_id": 111},
                          {"nick_name": 'MYXuu2', "open_id": 222},
                          {"nick_name": 'MYXuu3', "open_id": 333},
                          {"nick_name": 'MYXuu4', "open_id": 111},
                          {"nick_name": 'MYXuu5', "open_id": 222},
                          {"nick_name": 'MYXuu6', "open_id": 333},
                          {"nick_name": 'MYXuu7', "open_id": 111},
                          {"nick_name": 'MYXuu8', "open_id": 222},
                          {"nick_name": 'MYXuu9', "open_id": 222},
                          {"nick_name": 'MYXuu10', "open_id": 333}
                      ]
                  },
                  commentInfo: [
                      {
                          "content": '超级赞dnf哈哈哈哈哈哈啦啦啦啦哈哈哈哈哈哈哈哈哈哈',
                          "sender": {'nick_name': 'MYXu', 'open_id': 123},
                          'receiver': ''
                      },
                      {
                          "content": '谢谢',
                          "sender": {'nick_name': 'MYXuu', 'open_id': 456},
                          'receiver': {'nick_name': 'MYXu', 'open_id': 123}
                      },
                      {
                          "content": '啦啦啦啦啦啦啦啦绿绿绿绿绿绿绿绿绿绿绿绿绿绿绿绿绿绿',
                          "sender": {'nick_name': 'MYXu', 'open_id': 123},
                          'receiver': {'nick_name': 'MYXuu', 'open_id': 456}
                      }
                  ]

              }
          ]

      })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
      wx.setNavigationBarTitle({
          title: app.globalData.userInfo.nick_name + '的个人主页'
      })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

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

    onPageScroll: function (e) {
        this.setData({
            releaseFocus: false,
            hideCommentInputView:'none'
        })
    },




    // 进入我的主页，展示更为详细的用户信息
    intoUserInfoDetailPage: function (e) {
        console.log(e);
        wx.navigateTo({
            url: './detailPage/userInfo'
        })
    },

    //
    intoDiaryDetailPage: function () {
        wx.showToast({
            title: '进入打卡日记详情页'

        })
    },

    deleteDiary: function () {
        wx.showToast({
            title: '删除打卡日记'

        })

    },

    intoProjectDetailPage: function () {
        wx.showToast({
            title: '进入打卡圈子详情页'

        })
    },

    receiverComment: function(e){
        this.setData({
            releaseFocus: true,
            hideCommentInputView:'flex',
            replyTo:'回复XX',
            placeholderColor:'color:#C9C9C9;'
        })
    },
    // 发送评论
    sendComment: function () {
        wx.showToast({
            title: '发送成功'

        });
    },

    // 键盘输入时触发，检测输入内容是否为空，为空禁止发送按钮
    updateSendBtn: function (e) {
        console.log(e);
        if (e.detail.cursor !== 0) {
            this.setData({
                sendBtnAttr: {
                    'allowSend': false
                },
                placeholderColor:'color:transparent;'
            })
        } else {
            this.setData({
                sendBtnAttr: {
                    'allowSend': true
                },
                placeholderColor:'color:#C9C9C9;'
            })
        }
    }
    

});