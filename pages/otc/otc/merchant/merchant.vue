<template>
	<view class="container">
		<view class="list-cell b-b m-t" @click="navTo('/pages/otc/merchant/apply')" hover-class="cell-hover" :hover-stay-time="50">
			<text class="cell-tit">修改资料</text>
			<text class="cell-more yticon icon-you"></text>
		</view>
		<view class="list-cell b-b m-t" @click="navTo('/pages/otc/merchant/advertList')" hover-class="cell-hover" :hover-stay-time="50">
			<text class="cell-tit">广告列表</text>
			<text class="cell-more yticon icon-you"></text>
		</view>
		<view class="list-cell" @click="navTo('/pages/otc/merchant/addAdvert')" hover-class="cell-hover" :hover-stay-time="50">
			<text class="cell-tit">发币广告</text>
			<text class="cell-more yticon icon-you"></text>
		</view>
		<view class="list-cell log-out-btn" @click="toLogout">
			<text class="cell-tit">退出商家</text>
		</view>
	</view>
</template>

<script>
	import {  
	    mapMutations  
	} from 'vuex';
	import util from '@/common/function';
	export default {
		data() {
			return {
				
			};
		},
		onLoad() {
			this.mineInfoRequest()
		},
		methods:{
			//获取个人信息
			mineInfoRequest() {
				var self = this;
				this.$http.post('/index/login/index').then(function(response) {
					self.userinfo = response;
					self.username = util.cutPhone(response.tel ? response.tel : response.mail);
					uni.stopPullDownRefresh();
					//这里只会在接口是成功状态返回
				}).catch(function(error) {
					//这里只会在接口是失败状态返回，不需要去处理错误提示
					uni.showToast({
						title: error.msg,
						duration: 2000,
						icon: 'none'
					});
					console.log('错误信息', error);
					uni.stopPullDownRefresh();
				});
			},
			...mapMutations(['logout']),

			navTo(url){
				uni.navigateTo({
					url: url
				})
			},
			//退出登录
			toLogout(){
				uni.showModal({
				    content: '确定要退出登录么',
				    success: (e)=>{
				    	if(e.confirm){
				    		this.logout();
				    		setTimeout(()=>{
				    			uni.navigateBack();
				    		}, 200)
				    	}
				    }
				});
			},
			//switch
			switchChange(e){
				let statusTip = e.detail.value ? '打开': '关闭';
				this.$api.msg(`${statusTip}消息推送`);
			},

		}
	}
</script>

<style lang='scss'>
	page{
		background: $page-color-base;
	}
	.list-cell{
		display:flex;
		align-items:baseline;
		padding: 20upx $page-row-spacing;
		line-height:60upx;
		position:relative;
		background: #fff;
		justify-content: center;
		&.log-out-btn{
			margin-top: 40upx;
			.cell-tit{
				color: $uni-color-primary;
				text-align: center;
				margin-right: 0;
			}
		}
		&.cell-hover{
			background:#fafafa;
		}
		&.b-b:after{
			left: 30upx;
		}
		&.m-t{
			margin-top: 16upx; 
		}
		.cell-more{
			align-self: baseline;
			font-size:$font-lg;
			color:$font-color-light;
			margin-left:10upx;
		}
		.cell-tit{
			flex: 1;
			font-size: $font-base + 2upx;
			color: $font-color-dark;
			margin-right:10upx;
		}
		.cell-tip{
			font-size: $font-base;
			color: $font-color-light;
		}
		switch{
			transform: translateX(16upx) scale(.84);
		}
	}
</style>
