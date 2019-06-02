import {formatSeconds} from "../../../utils/common.js";

let app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    projectId: 0,

    // 记录成功提交日记基本信息后服务器返回的日记记录id，用于后续日记相关资源文件的上传
    diaryId: 0,
    diaryResourceInfo: [
      // {
      //     filePath: '', // 资源文件本地存储路径
      //     resourceType: 1, // 资源文件类型 1--图片 2--音频 3--视频
      // }
    ],  // 记录日记相关资源文件信息

    textContent: '',      // 用户输入的文本内容
    textContentLength: 0,
    chooseImg: [],        // 已选择的图片的本地路径

    audioRecordManager: '', // 全局唯一的录音管理器 RecorderManager
    innerAudioContext: '', // 用于播放所录音频的内部audio上下文InnerAudioContext
    hiddenAudioRecordView: true, // 控制音频录制视图
    hiddenAddAudioBtn: false, // 控制添加音频按钮的显示、隐藏
    timer: '', // 计时器
    audioRecordTimeCount: 0, // 音频时长计数（秒）
    sec: '00', // 计时器 秒
    min: '00', // 计时器 分
    showPauseAudioRecordBtn: true, // 控制显示、隐藏暂停录音按钮
    audioRecordFileSrc: '', // 录音结束后 本地存储的音频文件地址

    showAudioPlayView: false, // 完成录音后 显示该录音的播放视图
    audioPlayStatus: 'pause', // 音频播放状态 pause => 暂停播放中 & play => 播放中
    audioPlayCurrTime: 0,     // 音频当前播放时长 秒
    audioPlayCurrTimeStr: '00:00',  // 音频当前播放时长 字符串
    audioPlayEndTime: 0,      // 音频总时长 秒
    audioPlayEndTimeStr: '00:00',   // 音频总时长 字符串

    address: "",    // 用户选择的地理位置
    latitude: null, // 对应的纬度
    longitude: null, // 对应的经度

    diaryType: ['公开 其他成员可见', '仅圈主可见'], // 日记显示类型
    index: 0,

    disabledPublishBtn: true, // 禁用true、不禁用false发表日记按钮
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    let that = this;
    that.data.projectId = parseInt(options.projectId);
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
    console.log('onUnload');
    // TODO 在发表日记过程退出 提示退出则上传失败 或进行后续处理

  },

  // 用户的输入文本内容的输入监听事件
  editTextContent: function (e) {
    let that = this;
    that.data.textContent = e.detail.value;
    that.data.disabledPublishBtn = !(
        (that.data.textContent.length > 0 || that.data.chooseImg.length > 0) ||
        that.data.audioRecordFileSrc.length > 0
    );
    console.log(e.detail.value);

    that.setData({
      textContentLength: that.data.textContent.length,
      disabledPublishBtn: that.data.disabledPublishBtn
    });
  },

  // 选择图片
  chooseImage: function () {
    let that = this;

    // 当前可选的图片张数 总9张
    let remainNum = 9 - that.data.chooseImg.length;

    wx.chooseImage({
      count: remainNum,
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {

        that.data.disabledPublishBtn = !(
            (that.data.textContent.length > 0 || that.data.chooseImg.length > 0) ||
            that.data.audioRecordFileSrc.length > 0
        );

        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        that.setData({
          chooseImg: that.data.chooseImg.concat(res.tempFilePaths),
          disabledPublishBtn: that.data.disabledPublishBtn
        });

        console.log(that.data)
      }
    })
  },
  // 点击图片预览
  previewImage: function (e) {
    wx.previewImage({
      current: e.currentTarget.id, // 当前显示图片的http链接
      urls: this.data.chooseImg // 需要预览的图片http链接列表
    })
  },
  // 取消对应的已选图片 使用的catchtap 阻止事件冒泡去执行上层的图片预览事件
  cancelPictureUpload: function (e) {

    let that = this;
    let index = e.currentTarget.dataset.index;
    that.data.chooseImg.splice(index, 1); // 取消对应的图片

    // 设置日记发表按钮的状态（是否可以发表）
    that.data.disabledPublishBtn = !(
        (that.data.textContent.length > 0 || that.data.chooseImg.length > 0) ||
        that.data.audioRecordFileSrc.length > 0
    );

    that.setData({
      chooseImg: that.data.chooseImg,
      disabledPublishBtn: that.data.disabledPublishBtn
    });
  },

  // 录音计时器
  timer: function () {
    let that = this,
        intSec = that.data.audioRecordTimeCount % 60,
        intMin = Math.floor(that.data.audioRecordTimeCount / 60);
    if (that.data.audioRecordTimeCount >= 600) {
      that.endAudioRecord(); // 最长录音时间为十分钟
    }

    if (intSec < 10 && intSec >= 0)
      that.data.sec = '0' + intSec;
    else
      that.data.sec = '' + intSec;

    if (intMin < 10 && intMin >= 0)
      that.data.min = '0' + intMin;
    else
      that.data.min = '' + intMin;

    that.setData({
      sec: that.data.sec,
      min: that.data.min,
      audioRecordTimeCount: that.data.audioRecordTimeCount
    });

    that.data.timer = setTimeout(function () {
      that.data.audioRecordTimeCount += 1;
      that.timer();
    }, 1000);
  },

  // 点击开始录制音频
  startAudioRecord: function () {
    let that = this;
    that.setData({
      hiddenAudioRecordView: false,
      hiddenAddAudioBtn: true, // 点击添加录制音频的按钮后，隐藏该按钮
      audioRecordTimeCount: 0
    });

    that.data.audioRecordManager = wx.getRecorderManager();

    const options = {
      duration: 600000,//指定录音的时长，单位 ms
      sampleRate: 16000,//采样率
      numberOfChannels: 1,//录音通道数
      encodeBitRate: 96000,//编码码率
      format: 'mp3',//音频格式，有效值 aac/mp3
      frameSize: 50,//指定帧大小，单位 KB
    };

    //开始录音
    that.data.audioRecordManager.start(options);
    that.data.audioRecordManager.onStart(() => {
      that.timer();
      console.log('recorder start')
    });
    //错误回调
    that.data.audioRecordManager.onError((res) => {
      console.log(res);
    })
  },

  // 暂停录音
  pauseAudioRecord: function () {
    let that = this;
    clearTimeout(that.data.timer);
    that.data.audioRecordManager.pause();
    that.setData({
      showPauseAudioRecordBtn: false, // 暂停录音 此时显示继续录音按钮
    });
  },

  // 继续录音
  resumeAudioRecord: function () {
    let that = this;
    that.data.audioRecordManager.resume();
    that.timer();
    that.setData({
      showPauseAudioRecordBtn: true, // 正在录音 此时显示暂停录音按钮
    })
  },

  // 结束本次录音
  endAudioRecord: function () {
    let that = this;
    that.data.audioRecordManager.stop();
    that.data.audioRecordManager.onStop(function (res) {
      that.data.audioRecordFileSrc = res.tempFilePath;
      console.log(that.data.audioRecordFileSrc, 'audio record stop');

      // 设置日记发表按钮的状态（是否可以发表）
      that.data.disabledPublishBtn = !(
          (that.data.textContent.length > 0 || that.data.chooseImg.length > 0) ||
          that.data.audioRecordFileSrc.length > 0
      );

      that.setData({
        disabledPublishBtn: that.data.disabledPublishBtn
      });

    });
    clearTimeout(that.data.timer);
    that.data.audioPlayCurrTime = 0;
    that.data.audioPlayEndTime = that.data.audioRecordTimeCount;


    that.setData({
      hiddenAudioRecordView: true,
      showAudioPlayView: true, // 录音结束 显示该录音的播放视图
      audioPlayEndTimeStr: formatSeconds(that.data.audioPlayEndTime),
    });

    // 录音结束后 创建用于播放所录音频的 内部audio上下文对象
    that.data.innerAudioContext = wx.createInnerAudioContext();
    // 音频文件的播放数据初始化
    that.setData({
      audioPlayCurrTime: 0, // 当前播放时间为0
      audioPlayCurrTimeStr: formatSeconds(0),

      audioPlayEndTime: that.data.audioPlayEndTime, // 音频总时长
      audioPlayEndTimeStr: formatSeconds(that.data.audioPlayEndTime),

      audioPlayStatus: 'pause' // 设置音频的初始状态为暂停 显示播放按钮
    });

  },

  // 取消本次音频录制
  cancelAudioRecord: function () {
    let that = this;
    that.data.audioRecordManager.stop();
    clearTimeout(that.data.timer);
    that.data.audioRecordFileSrc = ''; // 重置录音文件的存储路径
    that.setData({
      hiddenAudioRecordView: true,
      hiddenAddAudioBtn: false,
      audioRecordTimeCount: 0, // 取消本次录音 重置计时器初始状态
      showPauseAudioRecordBtn: true,  // 重置录音的控制按钮初始状态为开始录音
    });
  },

  // 开始播放录制好的音频
  startAudioPlay: function () {
    let that = this;
    that.data.innerAudioContext.src = that.data.audioRecordFileSrc; // 设置音频文件播放源
    that.data.innerAudioContext.play();
    // 动态修改播放时间和进度条
    that.data.innerAudioContext.onPlay(function () {

      that.data.innerAudioContext.onTimeUpdate(function () {
        that.data.audioPlayCurrTime = Math.floor(that.data.innerAudioContext.currentTime);
        that.data.audioPlayEndTime = Math.floor(that.data.innerAudioContext.duration);
        that.setData({
          audioPlayCurrTimeStr: formatSeconds(that.data.audioPlayCurrTime),
          audioPlayEndTimeStr: formatSeconds(that.data.audioPlayEndTime),
          audioPlayCurrTime: that.data.audioPlayCurrTime,
          audioPlayEndTime: that.data.audioPlayEndTime
        });
      });
    });

    // 设置音频播放至结束后的回调函数 设置结束后的控制按钮为播放按钮
    that.data.innerAudioContext.onEnded(function () {
      that.data.innerAudioContext.offTimeUpdate();
      setTimeout(function () {
        that.setData({
          audioPlayCurrTimeStr: '00:00',
          audioPlayCurrTime: 0
        });
        console.log(that.data.audioPlayCurrTime);
      }, 500);

      that.setData({
        audioPlayStatus: 'pause',
      });
    });


    that.setData({
      audioPlayStatus: 'play'
    });
  },

  // 暂停播放录制好的音频
  pauseAudioPlay: function () {
    let that = this;
    that.data.innerAudioContext.pause();
    that.data.innerAudioContext.onPause(function () {
      // 取消监听音频播放进度更新事件
      that.data.innerAudioContext.offTimeUpdate();
    });
    that.setData({
      audioPlayStatus: 'pause'
    });
  },

  // 取消本次录音音频的上传
  cancelAudioRecordUpload: function () {
    let that = this;
    // 结束音频播放
    that.data.innerAudioContext.stop();
    // 销毁当前实例
    that.data.innerAudioContext.destroy();

    that.data.audioRecordFileSrc = ''; // 重置录音文件的存储路径

    // 设置日记发表按钮的状态（是否可以发表）
    that.data.disabledPublishBtn = !(
        (that.data.textContent.length > 0 || that.data.chooseImg.length > 0) ||
        that.data.audioRecordFileSrc.length > 0
    );

    that.setData({
      disabledPublishBtn: that.data.disabledPublishBtn,
      showAudioPlayView: false,
      hiddenAddAudioBtn: false, // 取消本次录音音频上传后 则需要重新显示添加录音音频上传按钮
      audioRecordTimeCount: 0,
      min: '00',
      sec: '00'
    });
  },


  // 选择视频
  chooseVideo: function () {
    wx.showToast({
      title: 'TODO'
    });
  },

  // 跳转到定位界面 结合腾讯地图进行位置选择
  chooseLocationAddress: function () {
    // 检测用户是否已经授权获取位置信息
    wx.getSetting({
      success: function (res) {
        // scope.userLocation === undefined 则说明用户第一次进入页面，尚未进行过位置信息授权
        // === false 则说明用户已经进入过该页面，但拒绝了授权获取位置信息
        // === true  则说明用户已经进入过该页面，并同意了授权获取位置信息
        console.log(res.authSetting['scope.userLocation']);

        if (res.authSetting['scope.userLocation'] === undefined) {
          // 当用户第一进入该页面时，wx.authorize会提前向用户发起授权请求
          // 无论用户选择了拒绝或者同意，再次进入页面后该授权窗口都不会被触发了
          wx.authorize(({
            scope: 'scope.userLocation',
            success: function (res) {
              // 只有授权成功后才能进入地图定位详细页面
              wx.navigateTo({
                url: "../../position/index"
              });
            },
            fail: function (error) {
              console.log(error);
            }
          }))
        }

        if (res.authSetting['scope.userLocation'] === false) {
          // 若是用户拒绝了第一次进入页面wx.authorize触发的授权请求
          // 之后的授权只能通过进入设置页面来手动打开位置信息授权
          wx.showModal({
            content: '您暂未开启地理位置信息的授权，是否开启',
            success: function (res) {
              if (res.confirm) {
                // 打开小程序对应的设置页面
                wx.openSetting({
                  success: function (res) {
                    if (res.authSetting['scope.userLocation'] === true) {
                      wx.showToast({
                        title: '授权成功',
                        icon: 'success',
                        duration: 1000
                      });
                      // 授权成功后进入地图定位界面
                      wx.navigateTo({
                        url: "../../position/index"
                      });
                    } else {
                      wx.showToast({
                        title: '授权失败',
                        icon: 'none',
                        duration: 1000
                      })
                    }
                  }
                })
              }
            }
          })
        }

        if (res.authSetting['scope.userLocation'] === true) {
          // 已经授权 直接进入地图定位界面
          wx.navigateTo({
            url: "../../position/index"
          });
        }
      },
      fail: function (error) {
        console.log(error)
      }
    });
  },

  // 取消已选择的地理位置
  cancelLocationAddress: function () {
    let that = this;
    that.setData({
      address: "",
      latitude: null,
      longitude: null
    })
  },

  // 设置日记可见类型：0--公开 其他成员可见 & 1--仅圈主可见
  chooseDiaryVisibleType: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value);
    this.setData({
      index: e.detail.value
    })
  },

  // 统计需要上传的日记资源文件 返回资源总数
  diaryResourceCount: function () {
    let that = this,
        resourceNum = 0;

    that.data.diaryResourceInfo = [];


    // 图片资源
    if (that.data.chooseImg.length > 0) {
      resourceNum += that.data.chooseImg.length;
      for (let i = 0; i < resourceNum; i++) {
        that.data.diaryResourceInfo[i] = {
          filePath: that.data.chooseImg[i],
          resourceType: 1
        };
      }
    }

    // 音频资源
    if (that.data.audioRecordFileSrc.length > 0) {
      resourceNum += 1;
      that.data.diaryResourceInfo[resourceNum - 1] = {
        filePath: that.data.audioRecordFileSrc,
        resourceType: 2
      };
    }

    // TODO 视频资源

    console.log(that.data.diaryResourceInfo);
    return resourceNum;
  },

  // 发表日记
  publishDiary: function () {
    let that = this;

    wx.showLoading({
      title: '正在处理...'
    });

    // 1.提交打卡日记基本信息至服务器，获取到该条打卡日记的记录id
    let addPunchCardDiary;
    addPunchCardDiary = new Promise(function (resolve) {
      wx.request({
        url: app.globalData.urlRootPath + 'index/PunchCardDiary/addPunchCardDiary',
        method: 'post',
        data: {
          project_id: that.data.projectId,
          user_id: app.globalData.userInfo.id,
          text_content: that.data.textContent,     // 打卡日记文件内容
          punch_card_address: that.data.address,   // 打卡日记的地理位置信息
          address_longitude: that.data.longitude,  // 地理位置对应的经度
          address_latitude: that.data.latitude, // 地理位置对应的纬度
          visible_type: parseInt(that.data.index),      // 打卡日记可见类型
          is_repair_diary: 0,                           // 0--非补打卡日记
        },
        success: function (res) {
          console.log(res);
          if (res.statusCode === 200) {
            that.data.diaryId = parseInt(res.data.data.diaryId);
            resolve(true);
          } else {
            wx.showToast({
              title: res.data.errMsg,
              icon: 'none',
              duration: 2000
            });
            resolve(false);
          }
        },
        fail: function () {
          wx.showToast({
            title: '网络异常!'
          });
          resolve(false);
        }
      });
    });

    // 2.在第一步完成后根据处理结果来进行 是否要上传该条打卡日记对应的资源文件如图片、TODO 视频、音频等
    addPunchCardDiary.then(function (res) {

      let result = '发表成功!';

      // 根据发布结果在返回圈子打卡详情页时进行通知更新获取最新数据
      let pages = getCurrentPages();
      let prePage = pages[pages.length - 2]; // 获取打卡详情页的页面对象
      let publishDiaryRes = false; // 假设发布失败

      // 打卡日记的基本信息已提交成功
      if (res === true) {
        // 1.若只有打卡日记没有资源文件上传 则此时已经发布成功 则设置通知更新
        publishDiaryRes = true;

        // 2.存在则进行处理打卡日记存在的资源文件 TODO 目前只支持上传图片资源
        let resourceNum = that.diaryResourceCount(); // 将需要上传的资源整合
        if (resourceNum > 0) {
          // 处理资源上传
          let successNum = 0;
          for (let i = 0; i < resourceNum; i++) {
            // 当前图片上传失败
            if (that.uploadDiaryResource(that.data.diaryResourceInfo[i]) === false) {
              // 只要一个资源上传失败发起请求删除前面相关所有提交包括日记的基本信息
              let deleteDiary = new Promise(function (resolve) {
                wx.request({
                  url: app.globalData.urlRootPath
                      + 'index/PunchCardDiary/deleteDiaryById',
                  method: 'post',
                  data: {
                    diaryId: that.data.diaryId,
                    projectId: that.data.projectId,
                    userId: that.globalData.userInfo.id
                  },
                  success: function (res) {
                    console.log(res);
                    resolve(true);
                  },
                  fail: function () {
                    wx.showToast({
                      title: '网络异常!'
                    });
                    resolve(false);
                  }

                })
              });
              deleteDiary.then(function (res) {
                console.log(res);
              });

              // 结束上传
              break;
            }
            successNum += 1;
          }

          // 假设资源文件也发布成功
          publishDiaryRes = true;


          if (successNum !== resourceNum) {
            result = "日记发表失败!";

            // 发表失败不进行更新
            publishDiaryRes = true;

          }
        }

        wx.showToast({
          title: result,
          duration: 1000
        });
        setTimeout(function () {
          prePage.setData({
            publishDiaryRes: publishDiaryRes
          });

          wx.navigateBack({
            delta: 1
          });
        }, 1000);
      }
    });
  },

  // 上传打卡日记存在的相关资源文件 1--图片 2--音频 3--视频
  uploadDiaryResource: function (currResFileInfo) {

    let that = this;

    wx.showLoading({
      title: '上传中...'
    });

    let uploadTask;
    uploadTask = new Promise(function (resolve) {
      wx.uploadFile({
        url: app.globalData.urlRootPath
            + 'index/PunchCardDiary/uploadDiaryResourceFile',
        filePath: currResFileInfo.filePath,
        name: 'diaryResourceFile',
        formData: {
          projectId: that.data.projectId,
          diaryId: that.data.diaryId,
          resourceType: currResFileInfo.resourceType, // 资源类型 1--图片 2--音频 3--视频
        },
        success: function (res) {
          if (res.statusCode === 200) {
            wx.hideLoading();
            resolve(true);
          } else {
            wx.showToast({
              title: res.data.errMsg,
              icon: 'none',
              duration: 2000
            });
            resolve(false);
          }
        },
        fail: function () {
          wx.showToast({
            title: '网络异常,上传失败!'
          });
          resolve(false);
        }
      });
    });

    // 返回上传结果
    let uploadRes = '';
    uploadTask.then(function (res) {
      uploadRes = res === true;
    });

    let timeout = 20000,
        id = setInterval(function () {
          timeout -= 500;
          if (uploadRes !== '') {
            clearInterval(id);
            return uploadRes;
          }
          if (timeout === 0) {
            clearInterval(id);
            return false;
          }
        }, 500);
  },

  // 资源文件存在上传失败则请求服务器进行删除之前的相关数据 包括日记基本信息记录
  deleteDiary: function () {
    let that = this;

    let deleteDiary = new Promise(function (resolve) {
      wx.request({
        url: app.globalData.urlRootPath
            + 'index/PunchCardDiary/deleteDiaryById',
        method: 'post',
        data: {
          projectId: that.data.projectId,
          diaryId: that.data.diaryId,
          userId: that.globalData.userInfo.id
        },
        success: function (res) {
          console.log(res);
          resolve(true);
        },
        fail: function () {
          wx.showToast({
            title: '网络异常!'
          });
          resolve(false);
        }

      })
    });

    deleteDiary.then(function (res) {
    });
    return true;
  }

});