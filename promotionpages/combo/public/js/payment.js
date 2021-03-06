export default {
	data() {
		return {
			orderCreateData: {
				is_balance: 0,
				pay_password: '',
				platform_coupon_id:0
			},
			orderPaymentData: {
				shop_goods_list: {
					site_name: '',
					express_type: [],
					coupon_list: []
				},
				bunding_info: {
					bl_name: ''
				},
				member_account: {
					balance: 0,
					is_pay_password: 0
				}
			},
			sitePromotion:{},
			isSub: false,
			tempData: null,
			platCouponList:[],
			isFocus:false,
			
			selectCouponId:0,
			selectCouponMoney:'0.00',
			
			selectPlatCouponId:0,
			selectPlatCouponMoney:'0.00',
		};
	},
	methods: {
		/**
		 * 显示弹出层
		 * @param {Object} ref
		 */
		openPopup(ref) {
			if(ref=='PlatcouponPopup'){
				this.selectPlatCouponId=this.orderPaymentData.platform_coupon_id;
				this.selectPlatCouponMoney=this.orderPaymentData.platform_coupon_money; 
			}
			this.$refs[ref].open();
		},
		/**
		 * 关闭弹出层
		 * @param {Object} ref
		 */
		closePopup(ref) {
			if (this.tempData) {
				Object.assign(this.orderCreateData, this.tempData);
				Object.assign(this.orderPaymentData, this.tempData);
				this.tempData = null;
				this.$forceUpdate();
			}
			this.$refs[ref].close();
		},
		/**
		 * 选择收货地址
		 */
		selectAddress() {
			this.$util.redirectTo('/otherpages/member/address/address', {
				'back': '/promotionpages/combo/payment/payment'
			});
		},
		/**
		 * 获取订单初始化数据
		 */
		getOrderPaymentData() {
			this.orderCreateData = uni.getStorageSync('comboOrderCreateData');
			if (!this.orderCreateData) {
				this.$util.showToast({
					title: '未获取到创建订单所需数据!！',
					success: () => {
						setTimeout(() => {
							this.$util.redirectTo('/pages/index/index/index', {}, 'reLaunch');
						}, 1500)
					}
				});
				return;
			}

			this.orderCreateData.buyer_message = '';

			this.$api.sendRequest({
				url: '/bundling/api/ordercreate/payment',
				data: this.orderCreateData,
				success: res => {
					if (res.code >= 0) {
						this.orderPaymentData = res.data;
						this.handlePaymentData();
						if (this.$refs.loadingCover) this.$refs.loadingCover.hide();
					} else {
						this.$util.showToast({
							title: '未获取到创建订单所需数据!！',
							success: () => {
								setTimeout(() => {
									this.$util.redirectTo('/pages/index/index/index', {}, 'reLaunch');
								}, 1500)
							}
						});
					}
				},
				fail: res => {
					if (this.$refs.loadingCover) this.$refs.loadingCover.hide();
				}
			})
		},
		/**
		 * 处理结算订单数据
		 */
		handlePaymentData() {
			this.orderCreateData.delivery = {};
			this.orderCreateData.coupon = {};
			this.orderCreateData.is_balance = 0;
			this.orderCreateData.pay_password = '';

			var data = this.orderPaymentData;
			this.platCouponList=data.platform_coupon_list;
			if(this.platCouponList.length>0){
				this.orderCreateData.platform_coupon_id=this.platCouponList[0].platformcoupon_id;
				
				this.selectPlatCouponId=this.platCouponList[0].platformcoupon_id;
				this.selectPlatCouponMoney=this.platCouponList[0].money;
			}
			
			let h = new Date().getHours().toString();
			let m = new Date().getMinutes().toString();
			if (h.length == 1) {
				h = '0' + h;
			}
			if (m.length == 1) {
				m = '0' + m;
			}
			let nowTime = h + ':' + m;
			
			if(data.shop_goods_list.local_config){
				if (data.shop_goods_list.local_config.info && data.shop_goods_list.local_config.info.time_is_open == 1) {
					this.orderCreateData.delivery.showTimeBar=true;
					this.orderCreateData.delivery.buyer_ask_delivery_time=nowTime;
				}else{
					this.orderCreateData.delivery.showTimeBar=false;
				}
			}
			
			if (data.shop_goods_list.express_type != undefined && data.shop_goods_list.express_type[0] != undefined) {
				var express_type = data.shop_goods_list.express_type;
				this.orderCreateData.delivery.delivery_type = express_type[0].name;
				this.orderCreateData.delivery.delivery_type_name = express_type[0].title;
				this.orderCreateData.delivery.store_id = 0;
				// 如果默认配送方式是门店配送
				if (express_type[0].name == 'store') {
					if (express_type[0].store_list[0] != undefined) {
						this.orderCreateData.delivery.store_id = express_type[0].store_list[0].store_id;
					}
				}
			}
			
			if (data.shop_goods_list.coupon_list != undefined && data.shop_goods_list.coupon_list[0] != undefined) {
				var coupon_list = data.shop_goods_list.coupon_list;
				this.orderCreateData.coupon.coupon_id = coupon_list[0].coupon_id;
				this.orderCreateData.coupon.coupon_money = coupon_list[0].money;
				
				this.selectCouponId=coupon_list[0].coupon_id;
				this.selectCouponMoney=coupon_list[0].coupon_id;
			}

			Object.assign(this.orderPaymentData, this.orderCreateData);
			this.orderCalculate();
		},
		/**
		 * 订单计算
		 */
		orderCalculate() {
			let siteId=this.orderPaymentData.shop_goods_list.site_id;

			var deliveryObj={};
			deliveryObj[siteId]=this.orderCreateData.delivery
			
			var couponObj={};
			couponObj[siteId]=this.orderCreateData.coupon;
			
			var messageObj={};
			messageObj[siteId]=this.orderCreateData.buyer_message;
			
			var data = this.$util.deepClone(this.orderCreateData);
			data.delivery = JSON.stringify(deliveryObj);
			data.coupon = JSON.stringify(couponObj);
			data.buyer_message = JSON.stringify(messageObj);
			data.member_address = JSON.stringify(data.member_address);

			this.$api.sendRequest({
				url: '/bundling/api/ordercreate/calculate',
				data,
				success: res => {
					if (res.code >= 0) {
						this.orderPaymentData.delivery_money = res.data.delivery_money;
						this.orderPaymentData.coupon_money = res.data.coupon_money;
						this.orderPaymentData.invoice_money = res.data.invoice_money;
						this.orderPaymentData.promotion_money = res.data.promotion_money;
						this.orderPaymentData.order_money = res.data.order_money;
						this.orderPaymentData.balance_money = res.data.balance_money;
						this.orderPaymentData.pay_money = res.data.pay_money;
						this.orderPaymentData.goods_money = res.data.goods_money;
						this.orderPaymentData.platform_coupon_money = res.data.platform_coupon_money;
					} else {
						this.$util.showToast({
							title: res.message
						});
					}
				},
			})
		},
		/**
		 * 订单创建
		 */
		orderCreate() {
			if (this.verify()) {
				if (this.isSub) return;
				this.isSub = true;
				
				let siteId=this.orderPaymentData.shop_goods_list.site_id;

				var deliveryObj={};
				deliveryObj[siteId]=this.orderCreateData.delivery
				
				var couponObj={};
				couponObj[siteId]=this.orderCreateData.coupon;
				
				var messageObj={};
				messageObj[siteId]=this.orderCreateData.buyer_message;

				var data = this.$util.deepClone(this.orderCreateData);
				data.delivery = JSON.stringify(deliveryObj);
				data.coupon = JSON.stringify(couponObj);
				data.buyer_message = JSON.stringify(messageObj);
				data.member_address = JSON.stringify(data.member_address);

				this.$api.sendRequest({
					url: '/bundling/api/ordercreate/create',
					data,
					success: res => {
						if (res.code >= 0) {
							uni.removeStorage({
								key: 'comboOrderCreateData',
								success: () => {
									if (this.orderPaymentData.pay_money == 0) {
										this.$util.redirectTo('/pages/pay/result/result', {
											code: res.data
										}, 'redirectTo');
									} else {
										this.$util.redirectTo('/pages/pay/index/index', {
											code: res.data
										}, 'redirectTo');
									}
								}
							});
						} else {
							this.isSub = false;
							this.$util.showToast({
								title: res.message
							});
						}
					}
				})
			}
		},
		/**
		 * 订单验证
		 */
		verify() {
			if (!this.orderPaymentData.member_address) {
				this.$util.showToast({
					title: '请先选择您的收货地址'
				});
				return false;
			}

			if (JSON.stringify(this.orderCreateData.delivery) == "{}") {
				this.$util.showToast({
					title: '店铺未设置配送方式'
				});
				return false;
			}

			if (this.orderCreateData.delivery.delivery_type == 'store' && this.orderCreateData.delivery.store_id == 0) {
				this.$util.showToast({
					title: '店铺没有可提货的门店,请选择其他配送方式'
				});
				return false;
			}

			if (this.orderCreateData.is_balance == 1 && this.orderCreateData.pay_password == '') {
				setTimeout(() => {
					this.$refs.input.clear();
				}, 0)
				// this.$refs.payPassword.open();
				this.openPasswordPopup()
				return false;
			}
			return true;
		},
		/**
		 * 显示店铺优惠信息
		 * @param {Object} data
		 */
		openPromotion(data) {
			this.sitePromotion = data;
			this.$refs.PromotionPopup.open();
		},
		/**
		 * 选择平台优惠券
		 * @param {Object} item
		 */
		selectPlatCoupon(item){
			if(this.selectPlatCouponId != item.platformcoupon_id){
				this.selectPlatCouponId=item.platformcoupon_id;
				this.selectPlatCouponMoney=item.money;
			}else{
				this.selectPlatCouponId=0;
				this.selectPlatCouponMoney='0.00';
			}
			Object.assign(this.orderPaymentData, this.orderCreateData);
			this.$forceUpdate();
		},
		/**
		 * 显示活动优惠信息
		 * @param {Object} data
		 */
		openSitePromotion() {
			this.$refs.sitePromotionPopup.open();
		},
		/**
		 * 显示店铺配送信息
		 * @param {Object} index
		 */
		openSiteDelivery() {
			this.tempData = {
				delivery: this.$util.deepClone(this.orderPaymentData.delivery)
			};
			this.$refs.deliveryPopup.open();
		},
		/**
		 * 选择配送方式
		 */
		selectDeliveryType(data) {
			this.orderCreateData.delivery.delivery_type = data.name;
			this.orderCreateData.delivery.delivery_type_name = data.title;
			// 如果是门店配送
			if (data.name == 'store') {
				if (data.store_list[0] != undefined) {
					this.orderCreateData.delivery.store_id = data.store_list[0].store_id;
				}
			}
			Object.assign(this.orderPaymentData, this.orderCreateData);
			this.$forceUpdate();
		},
		/**
		 * 选择自提点 
		 */
		selectPickupPoint(store_id) {
			this.orderCreateData.delivery.store_id = store_id;
			Object.assign(this.orderPaymentData, this.orderCreateData);
			this.$forceUpdate();
		},
		/**
		 * 显示店铺优惠券信息
		 * @param {Object} siteId
		 * @param {Object} couponData
		 */
		openSiteCoupon() {
			this.tempData = {
				coupon: this.$util.deepClone(this.orderPaymentData.coupon)
			};
			this.selectCouponId=this.orderCreateData.coupon.coupon_id;
			this.selectCouponMoney=this.orderCreateData.coupon.coupon_money;
			this.$refs.couponPopup.open();
		},
		/**
		 * 选择优惠券
		 * @param {Object} item
		 */
		selectCoupon(item) {
			
			// if (this.orderCreateData.coupon.coupon_id != item.coupon_id) {
			// 	this.orderCreateData.coupon.coupon_id = item.coupon_id;
			// 	this.orderCreateData.coupon.coupon_money = item.money;
			// } else {
			// 	this.orderCreateData.coupon.coupon_id = 0;
			// 	this.orderCreateData.coupon.coupon_money = '0.00';
			// }
			
			if (this.selectCouponId != item.coupon_id) {
				this.selectCouponId = item.coupon_id;
				this.selectCouponMoney= item.money;
			} else {
				this.selectCouponId  = 0;
				this.selectCouponMoney = '0.00';
			}
			Object.assign(this.orderPaymentData, this.orderCreateData);
			this.$forceUpdate();
		},
		popupConfirm(ref) {
			this.$refs[ref].close();
			if(ref=='couponPopup'){
				this.orderCreateData.coupon.coupon_id = this.selectCouponId;
				this.orderCreateData.coupon.coupon_money = this.selectCouponMoney;
			}
			if(ref=='PlatcouponPopup'){
				this.orderPaymentData.platform_coupon_id=this.selectPlatCouponId;
				this.orderCreateData.platform_coupon_id=this.selectPlatCouponId;
				this.orderPaymentData.platform_coupon_money=this.selectPlatCouponMoney;
				this.orderCreateData.platform_coupon_money=this.selectPlatCouponMoney;
			}
			this.orderCalculate();
		},
		/**
		 * 使用余额
		 */
		useBalance() {
			if (this.orderCreateData.is_balance) this.orderCreateData.is_balance = 0;
			else this.orderCreateData.is_balance = 1;
			this.orderCalculate();
			this.$forceUpdate();
		},
		/**
		 * 设置支付密码
		 */
		setPayPassword() {
			this.$util.redirectTo('/otherpages/member/pay_password/pay_password', {
				back: '/promotionpages/combo/payment/payment'
			});
		},
		/**
		 * 暂不设置支付密码
		 */
		noSet() {
			this.orderCreateData.is_balance = 0;
			this.$refs.payPassword.close();
			this.orderCalculate();
			this.$forceUpdate();
		},
		/**
		 * 支付密码输入
		 */
		input(pay_password) {
			if (pay_password.length == 6) {
				uni.showLoading({
					title: '加载中...',
					mask: true
				})
				this.$api.sendRequest({
					url: '/api/member/checkpaypassword',
					data: {
						pay_password
					},
					success: res => {
						if (res.code >= 0) {
							this.orderCreateData.pay_password = pay_password;
							this.orderCreate();
						} else {
							uni.hideLoading();
							this.$util.showToast({
								title: res.message
							});
						}
					},
					fail: res => {
						uni.hideLoading();
					}
				})
			}
		},
		imageError(goodsIndex) {
			this.orderPaymentData.shop_goods_list.goods_list[goodsIndex].sku_image = this.$util.getDefaultImage().default_goods_img;
			this.$forceUpdate();
		},
		openPasswordPopup(){
			this.$refs.payPassword.open();
			setTimeout(()=>{
				this.isFocus = true;
			},500)
		},
	},
	onShow() {
		// 刷新多语言
		this.$langConfig.refresh();

		// 判断登录
		if (!uni.getStorageSync('token')) {
			this.$util.redirectTo('/pages/login/login/login');
		} else {
			this.getOrderPaymentData();
		}
	},
	computed: {
		promotionMoney() {
			return this.orderPaymentData.bunding_info.goods_money - this.orderPaymentData.bunding_info.bl_price;
		},
		
		themeStyle(){
			return 'theme-'+this.$store.state.themeStyle
		}
	},
	onHide(){
		if (this.$refs.loadingCover) this.$refs.loadingCover.show();
	},
	filters: {
		/**
		 * 金额格式化输出
		 * @param {Object} money
		 */
		moneyFormat(money) {
			return parseFloat(money).toFixed(2);
		},
		/**
		 * 店铺优惠摘取
		 */
		promotion(data) {
			let promotion = '';
			if (data) {
				Object.keys(data).forEach((key) => {
					promotion += data[key].content + '　';
				})
			}
			return promotion;
		}
	}
}