**记录下遇到的问题，后期做汇总**

#### 1、设置元素高度等同于宽度(宽度使用百分比)

原本的音频组件并没有对不同机型做适配，现在进行适配就碰到了一个问题。由于组件用于多个页面，所以组件根元素是不能写死宽度的，组件里面的子元素宽度也只能用百分比。在此过程中，播放、暂停按钮的icon图片要设置宽、高一致，也就是宽度使用百分比下(动态变化)，要怎 么设置元素高度等同于宽度。

```
<view class="audio-control-btn" catchtap="startAudioPlay">
	<image src="/images/button/audio_play_2.png"></image>
</view>
```
```
.audio-control-btn {
    /**
     * 个人理解是：
     * 1、在父级元素中设置高度为0，设置padding-bottom的百分比来撑开元素高度，
     *    由于padding-bottom、padding-top这两个属性的百分比是【根据元素宽度计算】的，所以只要
     *    padding-bottom的百分比跟宽度百分比一致，这时候得到就是一个正方形的父级元素了
     * 2、最后还要分别设置父级、子级元素relative|absolute定位属性，现在我还没搞懂原理(不设置不行)
     */
    width: 60%;
    height: 0;
    padding-bottom: 60%;
    position: relative;
}
.audio-control-btn > image {
    width: 100%;
    height: 100%;
    position: absolute;
}
```

记录于：**2020-03-27 01:29:08 星期五**
