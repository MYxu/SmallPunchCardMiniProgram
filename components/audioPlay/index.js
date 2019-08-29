import {formatSeconds} from "../../utils/common";

let app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    audioFileInfo: {
      type: Object,
      // 属性说明: {
      //     resource_url: '音频文件的路径',
      //     id: '资源文件id',
      //     type:  '资源文件类型'
      // }
    },
    audioName: {
      type: String
    },
    audioPlayStatusFlag: {
      type: String
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    resRootPath: app.globalData.imgBaseSeverUrl, // 服务器资源访问BaseURL

    innerAudioContext: '', // 用于播放所录音频的内部audio上下文InnerAudioContext
    audioPlayStatus: 'pause', // 音频播放状态 pause => 暂停播放中 & play => 播放中
    audioPlayCurrTime: 0,     // 音频当前播放时长 秒
    audioPlayCurrTimeStr: '00:00',  // 音频当前播放时长 字符串
    audioPlayEndTime: 0,      // 音频总时长 秒
    audioPlayEndTimeStr: '00:00',   // 音频总时长 字符串
  },

  // 在音频未播放之前获取总时长
  attached: function () {
    let that = this;
    let innerAudioContext = that.getInnerAudioContext();

    // 设置音频文件播放源
    innerAudioContext.src = that.data.resRootPath + that.data.audioFileInfo.resource_url;

    //音频进入可以播放状态，但不保证后面可以流畅播放
    // innerAudioContext.onCanplay(() => {
    //     innerAudioContext.duration //类似初始化-必须触发-不触发此函数延时也获取不到
    //     setTimeout(function () {
    //         that.data.audioPlayEndTime = Math.floor(innerAudioContext.duration);
    //         that.setData({
    //             audioPlayEndTime: innerAudioContext.duration,
    //             audioPlayEndTimeStr: formatSeconds(that.data.audioPlayEndTime)
    //         });
    //     }, 1000)  //这里设置延时100毫秒获取
    // });

    console.log('audioPlayComponent attached');
  },
  
  observers: {
    'audioPlayStatusFlag': function (audioPlayStatusFlag) {
      console.log('音频组件--'+ this.data.audioFileInfo.id +'播放状态'+ audioPlayStatusFlag);
      if (audioPlayStatusFlag === 'play') {
        this.startAudioPlayNoNotify()
      }

      if (audioPlayStatusFlag === 'pause') {
        this.pauseAudioPlayNoNotify()
      }
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {

    // 获取用于播放所录音频的内部audio上下文InnerAudioContext
    getInnerAudioContext: function () {
      let that = this;

      if (that.data.innerAudioContext === '')
        that.data.innerAudioContext = wx.createInnerAudioContext();

      return that.data.innerAudioContext;
    },

    // 开始播放录制好的音频
    startAudioPlay: function () {
      let that = this;
      let innerAudioContext = that.getInnerAudioContext();

      // 设置音频文件播放源
      innerAudioContext.src = that.data.resRootPath + that.data.audioFileInfo.resource_url;

      innerAudioContext.play();

      // 动态修改播放时间和进度条
      innerAudioContext.onPlay(function () {

        innerAudioContext.onTimeUpdate(function () {
          that.data.audioPlayCurrTime = Math.floor(innerAudioContext.currentTime);
          that.data.audioPlayEndTime = Math.floor(innerAudioContext.duration);
          that.setData({
            audioPlayCurrTimeStr: formatSeconds(that.data.audioPlayCurrTime),
            audioPlayEndTimeStr: formatSeconds(that.data.audioPlayEndTime),
            audioPlayCurrTime: that.data.audioPlayCurrTime,
            audioPlayEndTime: that.data.audioPlayEndTime
          });
        });
      });

      // 设置音频播放至结束后的回调函数 设置结束后的控制按钮为播放按钮
      innerAudioContext.onEnded(function () {
        innerAudioContext.offTimeUpdate();
        setTimeout(function () {
          that.setData({
            audioPlayCurrTimeStr: '00:00',
            audioPlayCurrTime: 0
          });
        }, 500);

        that.setData({
          audioPlayStatus: 'pause',
        });

        console.log('音频暂停');
        // 音频组件播放状态发生改变，通知父级组件或者使用该组件的页面
        let eventDetail = {
          audioId: that.data.audioFileInfo.id,
          audioPlayStatus: 'pause'
        };
        that.triggerEvent('audioStatusChangeNotice', eventDetail);
      });

      that.setData({
        audioPlayStatus: 'play'
      });

      console.log('音频播放');
      // 音频组件播放状态发生改变，通知父级组件或者使用该组件的页面
      let eventDetail = {
        audioId: that.data.audioFileInfo.id,
        audioPlayStatus: 'play'
      };
      that.triggerEvent('audioStatusChangeNotice', eventDetail);
    },
    startAudioPlayNoNotify: function () {
      let that = this;
      let innerAudioContext = that.getInnerAudioContext();

      // 设置音频文件播放源
      innerAudioContext.src = that.data.resRootPath + that.data.audioFileInfo.resource_url;

      innerAudioContext.play();

      // 动态修改播放时间和进度条
      innerAudioContext.onPlay(function () {

        innerAudioContext.onTimeUpdate(function () {
          that.data.audioPlayCurrTime = Math.floor(innerAudioContext.currentTime);
          that.data.audioPlayEndTime = Math.floor(innerAudioContext.duration);
          that.setData({
            audioPlayCurrTimeStr: formatSeconds(that.data.audioPlayCurrTime),
            audioPlayEndTimeStr: formatSeconds(that.data.audioPlayEndTime),
            audioPlayCurrTime: that.data.audioPlayCurrTime,
            audioPlayEndTime: that.data.audioPlayEndTime
          });
        });
      });

      // 设置音频播放至结束后的回调函数 设置结束后的控制按钮为播放按钮
      innerAudioContext.onEnded(function () {
        innerAudioContext.offTimeUpdate();
        setTimeout(function () {
          that.setData({
            audioPlayCurrTimeStr: '00:00',
            audioPlayCurrTime: 0
          });
        }, 500);

        that.setData({
          audioPlayStatus: 'pause',
        });

        console.log('音频暂停');
      });

      that.setData({
        audioPlayStatus: 'play'
      });
    },

    // 暂停播放录制好的音频
    pauseAudioPlay: function () {
      let that = this;
      let innerAudioContext = that.getInnerAudioContext();
      innerAudioContext.pause();
      innerAudioContext.onPause(function () {
        // 取消监听音频播放进度更新事件
        innerAudioContext.offTimeUpdate();
      });

      that.setData({
        audioPlayStatus: 'pause'
      });

      console.log('音频暂停');
      // 音频组件播放状态发生改变，通知父级组件或者使用该组件的页面
      let eventDetail = {
        audioId: that.data.audioFileInfo.id,
        audioPlayStatus: 'pause'
      };
      that.triggerEvent('audioStatusChangeNotice', eventDetail);
    },
    pauseAudioPlayNoNotify: function () {
      let that = this;
      let innerAudioContext = that.getInnerAudioContext();
      innerAudioContext.pause();
      innerAudioContext.onPause(function () {
        // 取消监听音频播放进度更新事件
        innerAudioContext.offTimeUpdate();
      });

      that.setData({
        audioPlayStatus: 'pause'
      });
    },
  }
});
