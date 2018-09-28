Page({

    /**
     * 页面的初始数据
     */
    data: {
        projectIntrInfoList: [
            // {order: 1, type: 'textarea', content: ''},
            // {order: 1, type: 'textarea', content: ''},
        ]

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

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

    // 在数组后面追加数据
    addDataToArray: function(type) {
        let that = this;
        let length = that.data.projectIntrInfoList.length;
        that.data.projectIntrInfoList[length] = {
            order: length,
            type: type,
            content: ''
        };

        that.setData({
            projectIntrInfoList: that.data.projectIntrInfoList
        });

        console.log(that.data.projectIntrInfoList);
    },

    // 向编辑区域添加一个文字简介编辑域textarea,
    // 实际为向projectIntrInfoList数组后面添加一条type为textarea的数据项
    addTextEditArea: function () {
        let that = this;
        that.addDataToArray('textarea');
    },

    // 对指定编辑区域进行上移
    orderUp: function(e) {
        console.log(e);
        let that = this;
        let index = parseInt(e.currentTarget.dataset.index);

        // 处于首位的编辑区域不可上移
        if (0 === index)
            return false;

        let arrObjTemp = that.data.projectIntrInfoList[index];
        that.data.projectIntrInfoList[index] = that.data.projectIntrInfoList[index - 1];
        that.data.projectIntrInfoList[index - 1] = arrObjTemp;

        that.setData({
            projectIntrInfoList: that.data.projectIntrInfoList
        });
    },
    // 对指定编辑区域进行下移
    orderDown: function(e) {
        console.log(e);
        let that = this;
        let index = parseInt(e.currentTarget.dataset.index);

        // 处于末尾的编辑区域不可下移
        if (that.data.projectIntrInfoList.length === (index + 1))
            return false;

        let arrObjTemp = that.data.projectIntrInfoList[index];
        that.data.projectIntrInfoList[index] = that.data.projectIntrInfoList[index + 1];
        that.data.projectIntrInfoList[index + 1] = arrObjTemp;

        that.setData({
            projectIntrInfoList: that.data.projectIntrInfoList
        });
    },

    // 删除指定编辑区域
    deleteEditArea: function(e) {
        console.log(e);
        let that = this;
        let index = parseInt(e.currentTarget.dataset.index);
        that.data.projectIntrInfoList.splice(index,1);
        that.setData({
            projectIntrInfoList: that.data.projectIntrInfoList
        });
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


});