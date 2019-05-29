// index.js
// 获取应用实例
const app = getApp()
// 页面对象
var that

Page({
    /**
     * 页面的初始数据
     */
    data: {
        // 图片文件数组
        files: [],
        // 图片URL地址数组
        urls: [],
        // 最多图片数
        max: 3
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function () {
        that = this
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

    /**
     * 选择图片
     */
    chooseImage: () => {
        wx.chooseImage({
            count: that.data.max,   // 可选取图片数量
            sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
            sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
            success: function (res) {
                // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
                that.setData({
                    files: that.data.files.concat(res.tempFilePaths)
                });
            }
        })
    },

    /**
     * 图片显示
     * @param e 当前选中的图片对象
     */
    previewImage: e => {
        wx.previewImage({
            current: e.currentTarget.id, // 当前显示图片的http链接
            urls: that.data.files // 需要预览的图片http链接列表
        })
    },

    /**
     * 上传按钮点击处理函数
     */
    bindUploadTap: () => {
        if (that.data.files.length === 0) { // 未选择图片
            wx.showToast({
                title: '请先选择图片!',
                icon: 'none'
            })
            return
        }
        wx.showLoading({
            title: '图片上传中...'
        })
        // 初始化图片URL地址数组
        that.setData({
            urls: []
        })
        // 执行图片上传递归函数
        that.uploadImage(0)
    },

    /**
     * 图片上传
     * @param index 当前图片下标
     */
    uploadImage: index => {
        if (index < that.data.files.length) {   // 如果当前下标未大于选取的图片数
            wx.uploadFile({
                url: 'http://127.0.0.1/upload',
                filePath: that.data.files[index],
                // 与后台接收图片文件的参数名相同
                name: 'file',
                success: res => {
                    console.log(res)
                    // 将服务器返回的结果转换成为JSON对象
                    var response = JSON.parse(res.data)
                    console.log(response)
                    if (response.code === app.globalData.code.SUCCESS) {    // 操作成功
                        that.setData({
                            urls: that.data.urls.concat([response.data])
                        })
                        // 递归调用自身
                        that.uploadImage(index + 1)
                    } else if (response.code === app.globalData.code.FAIL) {    // 操作失败
                        wx.showToast({
                            title: response.msg,
                            icon: 'none'
                        })
                    }
                }
            })
        } else {
            wx.hideLoading()
            wx.showToast({
                title: '图片上传完成!'
            })
            console.log('图片URL地址：')
            console.log(that.data.urls)
        }
    }
})