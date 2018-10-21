let app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        // 用于访问服务器图片
        imgRootPath: app.globalData.imgBaseSeverUrl,

        projectId: 0,
        projectIntrInfoList: [
            // {order: 0, type: 1, content: 'text'},
            // {order: 1, type: 2, content: 'imgUrl'},
            // {order: 2, type: 3, content: 'soundFileUrl'},
            // {order: 3, type: 4, content: 'videoFileUrl'},
            // 具有id、project_id这两个字段的简介记录是已经保存至数据库中的，若本地删除则同时也要删除数据库中的
            // {id: 1,project_id: 2 ,order: 4, type: 4, content: 'videoFileUrl'},
        ],
        deleteIntrInfoIdList: [], // 记录数据库中需要被删除的圈子简介id
        isExistProjectIntrInfo: false,// 根据stepThree页面传递的projectIntrInfo来判断是否存在简介记录

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let that = this;
        that.data.projectId = options.projectId;
        console.log(options);

        if (options.projectIntrInfo !== "") {
            that.setData({
                isExistProjectIntrInfo: true,
                projectIntrInfoList: JSON.parse(options.projectIntrInfo)
            });
        }

        console.log(that.data.projectIntrInfoList);

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

    // 在数组后面追加数据 type: '1'--文字 '2'--图片 '3'--音频 '4'--视频
    addDataToArray: function(type,content) {
        let that = this;
        let length = that.data.projectIntrInfoList.length;
        that.data.projectIntrInfoList[length] = {
            order: length,
            type: type,
            content: content
        };

        that.setData({
            projectIntrInfoList: that.data.projectIntrInfoList
        });

        console.log(that.data.projectIntrInfoList);
    },

    // 向编辑区域添加一个文字简介编辑域textarea(type=2 为文字),
    // 实际为向projectIntrInfoList数组后面添加一条type为textarea的数据项
    addTextEditArea: function () {
        let that = this;
        that.addDataToArray('1','');
    },

    // 向编辑区域添加图片简介,type='2' 为图片
    addImageEditArea: function() {
        let that = this;
        // 打开相册进行选择、或者拍照
        wx.chooseImage({
            count: 9,
            success: function (res) {
                console.log(res);
                // 将拍摄、选择的图片的路径信息添加至projectIntrInfoList中进行预览
                for (let i = 0; i < res.tempFilePaths.length ; i++) {
                    that.addDataToArray('2',res.tempFilePaths[i]);
                }
            }
        });
    },

    // 对指定编辑区域进行上移
    orderUp: function(e) {
        console.log(e);
        let that = this;
        let index = parseInt(e.currentTarget.dataset.index);

        // 处于首位的编辑区域不可上移
        if (0 === index)
            return false;

        // 修改被改变位置的两条数据的排序号
        that.data.projectIntrInfoList[index].order =
            parseInt(that.data.projectIntrInfoList[index].order) - 1;

        that.data.projectIntrInfoList[index - 1].order =
            parseInt(that.data.projectIntrInfoList[index - 1].order) + 1;

        let arrObjTemp = that.data.projectIntrInfoList[index];
        that.data.projectIntrInfoList[index] = that.data.projectIntrInfoList[index - 1];
        that.data.projectIntrInfoList[index - 1] = arrObjTemp;

        that.setData({
            projectIntrInfoList: that.data.projectIntrInfoList
        });
        console.log(that.data.projectIntrInfoList);
    },
    // 对指定编辑区域进行下移
    orderDown: function(e) {
        console.log(e);
        let that = this;
        let index = parseInt(e.currentTarget.dataset.index);

        // 处于末尾的编辑区域不可下移
        if (that.data.projectIntrInfoList.length === (index + 1))
            return false;


        // 修改被改变位置的两条数据的排序号
        that.data.projectIntrInfoList[index].order =
            parseInt(that.data.projectIntrInfoList[index].order) + 1;

        that.data.projectIntrInfoList[index + 1].order =
            parseInt(that.data.projectIntrInfoList[index + 1].order) - 1;

        let arrObjTemp = that.data.projectIntrInfoList[index];
        that.data.projectIntrInfoList[index] = that.data.projectIntrInfoList[index + 1];
        that.data.projectIntrInfoList[index + 1] = arrObjTemp;

        that.setData({
            projectIntrInfoList: that.data.projectIntrInfoList
        });
        console.log(that.data.projectIntrInfoList);
    },

    // 删除指定编辑区域
    deleteEditArea: function(e) {
        console.log(e);
        let that = this;
        let index = parseInt(e.currentTarget.dataset.index);

        // 如果该记录存在于数据库中则需要记录至deleteIntrInfoIdList中，在保存新记录的同时需要从服务器端删除
        if (that.data.projectIntrInfoList[index].id)
            that.data.deleteIntrInfoIdList.push(parseInt(that.data.projectIntrInfoList[index].id));

        that.data.projectIntrInfoList.splice(index,1);

        // 重新设置简介的排序位置
        for (let i = 0; i < that.data.projectIntrInfoList.length ; i++)
            that.data.projectIntrInfoList[i].order = i;

        that.setData({
            projectIntrInfoList: that.data.projectIntrInfoList
        });
        console.log(that.data.projectIntrInfoList);
    },

    // 监听textarea编辑区域的输入事件
    getTextInput: function (e) {
        console.log(e);
        let that = this;
        that.data.projectIntrInfoList[e.currentTarget.dataset.index].content = e.detail.value;
        that.setData({
            projectIntrInfoList: that.data.projectIntrInfoList
        });
    },

    // 保存圈子信息至服务器
    updateProjectIntrInfo: function () {
        let that = this;

        wx.showLoading({
            title: "加载中...",
            mask: true
        });

        // 若是存在需要从数据库中删除的简介记录则先删除
        if (that.data.deleteIntrInfoIdList.length > 0)  {
            wx.request({
                url: app.globalData.urlRootPath + 'index/PunchCardProject/deleteProjectIntr',
                method: "post",
                data:{
                    projectId: parseInt(that.data.projectId),
                    deleteIdList:that.data.deleteIntrInfoIdList,
                },
                success: function (res) {
                    console.log(res);
                    switch (res.statusCode) {
                        case 200:
                            // 删除成功进行新数据的添加、原先数据的更新
                            that.saveTheLastIntrInfo();
                            break;
                        default:
                            wx.hideLoading();
                            wx.showToast({
                                title: res.data.errMsg,
                                icon: "none"
                            });
                    }
                },
                fail: function () {
                    wx.hideLoading();
                    wx.showToast({
                       title: "网络异常!",
                       icon: "none"
                    });
                }
            });
        } else {
            // 进行新数据的添加、原先数据的更新
            that.saveTheLastIntrInfo();
        }

    },

    //保存最新编辑的内容
    saveTheLastIntrInfo: function () {
        let that = this,
            length = that.data.projectIntrInfoList.length,
            projectIntrInfo = that.data.projectIntrInfoList;

        console.log(that.data.projectIntrInfoList);

        // 根据projectIntrInfoList中的简介记录是否存在id or project_id 来
        // 切分出新的简介记录（需要add）、已经保存至服务器的旧简介记录（很难判断是否有改变，这里直接旧记录都update）
        let newProjectIntrInfo = [],oldProjectIntrInfo = [];
        for (let i = 0; i < length ; i++)
        {
            if (projectIntrInfo[i].id)
                oldProjectIntrInfo.push(projectIntrInfo[i]);
            else
                newProjectIntrInfo.push(projectIntrInfo[i])
        }


        // 添加新记录
        let uploadTask = [];
        let index = 0;
        for (let i = 0; i < newProjectIntrInfo.length; i++)
        {
            // 添加新数据： 上传图片、添加图片简介
            if (parseInt(newProjectIntrInfo[i].type) === 2) {
                uploadTask[index++] = new Promise(function (resolve) {
                    wx.uploadFile({
                        url: app.globalData.urlRootPath
                            + "index/PunchCardProject/addProjectIntr",
                        filePath: newProjectIntrInfo[i].content,
                        name: "images",
                        formData: {
                            project_id: parseInt(that.data.projectId),
                            order: parseInt(newProjectIntrInfo[i].order),
                            type: parseInt(newProjectIntrInfo[i].type)
                        },
                        success: function (res) {
                            console.log(res);
                            resolve(res);
                        },
                        fail: function (res) {
                            console.log(res);
                        }
                    });
                });
            } else if (parseInt(newProjectIntrInfo[i].type) === 1) {
                //添加新数据： 添加文本简介
                uploadTask[index++] = new Promise(function (resolve) {
                    wx.request({
                        url: app.globalData.urlRootPath
                            + 'index/PunchCardProject/addProjectIntr',
                        method: "post",
                        data: {
                            project_id: parseInt(that.data.projectId),
                            order: parseInt(newProjectIntrInfo[i].order),
                            type: parseInt(newProjectIntrInfo[i].type),
                            content: newProjectIntrInfo[i].content
                        },
                        success: function (res) {
                            resolve(res);
                        },
                        fail: function () {

                        }
                    });
                });
            }
        }

        // 更新旧数据
        uploadTask[index] = new Promise(function (resolve) {
            wx.request({
                url: app.globalData.urlRootPath
                    + 'index/PunchCardProject/updateProjectIntr',
                method: "post",
                data: {
                    projectIntrInfo: oldProjectIntrInfo
                },
                success: function (res) {
                    resolve(res);
                },
                fail: function () {

                }
            });
        });


        Promise.all(uploadTask).then(function (res) {
            // 对于出错的不进行更新
            wx.hideLoading();
            console.log(res);
            wx.navigateBack({
                delta: 1
            })
        });
    },

});