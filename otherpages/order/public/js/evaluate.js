export default {
	data() {
		return {
			orderId: null,
			orderNo: "",
			memberName: "",
			memberNeadimg: "",
			isAnonymous: 0, //是否匿名发布  1.匿名，0.公开

			goodsList: [], //订单列表
			goodsEvalList: [], //评价列表

			imgList: [],
			isEvaluate: 0, //判断是否为追评

			flag: false, //防止重复点击 

			siteName: '', // 店铺名称
			shop_deliverycredit: 5, // 配送服务分值
			shop_desccredit: 5, // 描述相符分值
			shop_servicecredit: 5, // 服务态度分值
		};
	},
	methods: {
		//获取用户信息
		getUserInfo() {
			this.$api.sendRequest({
				url: '/api/member/info',
				success: res => {
					if (res.code == 0) {
						this.memberName = res.data.nickname;
						this.memberNeadimg = res.data.headimg;
					} else {
						this.$util.showToast({
							title: res.message
						})
					}
				}
			});
		},
		//获取订单信息
		getOrderInfo() {
			//获取订单信息
			let data = {
				order_id: this.orderId
			};
			this.$api.sendRequest({
				url: '/api/order/evluateinfo',
				data: data,
				success: res => {
					if (res.code == 0) {
						this.isEvaluate = res.data.evaluate_status
						this.orderNo = res.data.list[0].order_no;
						this.goodsList = res.data.list;
						this.siteName = res.data.list[0].site_name;
						if (this.isEvaluate) {
							for (let i = 0; i < res.data.list.length; i++) {
								let array = [];
								this.imgList.push(array)
								this.goodsEvalList.push({
									order_goods_id: res.data.list[i].order_goods_id,
									goods_id: res.data.list[i].goods_id,
									sku_id: res.data.list[i].sku_id,
									again_content: "",
									again_images: "",
									site_id: res.data.list[i].site_id
								});
							}
						} else {
							for (let i = 0; i < res.data.list.length; i++) {
								let array = [];
								this.imgList.push(array)
								this.goodsEvalList.push({
									content: '', // 评价内容
									images: "", //图片数组
									scores: 5, // 评分
									explain_type: 1, // 评价类型
									order_goods_id: res.data.list[i].order_goods_id,
									goods_id: res.data.list[i].goods_id,
									sku_id: res.data.list[i].sku_id,
									sku_name: res.data.list[i].sku_name,
									sku_price: res.data.list[i].price,
									sku_image: res.data.list[i].sku_image,
									site_id: res.data.list[i].site_id
								});
							}
						}
					} else {
						this.$util.showToast({
							title: "未获取到订单数据"
						})
						setTimeout(() => {
							this.$util.redirectTo('/pages/order/list/list', {}, "redirectTo");
						}, 1000)
					}
					if (this.$refs.loadingCover) this.$refs.loadingCover.hide();
				},
				fail() {
					if (this.$refs.loadingCover) this.$refs.loadingCover.hide();
				}
			});
		},
		//监听评分变化
		setStar(e) {
			this.goodsEvalList[e.index].scores = e.value;
			if (e.value >= 4) {
				this.goodsEvalList[e.index].explain_type = 1;
			} else if (1 < e.value && e.value < 4) {
				this.goodsEvalList[e.index].explain_type = 2
			} else {
				this.goodsEvalList[e.index].explain_type = 3
			}
		},
		//切换，是否匿名
		isAll() {
			this.isAnonymous ? this.isAnonymous = 0 : this.isAnonymous = 1
		},
		//添加图片
		addImg(e) {
			let size = this.imgList[e].length ? this.imgList[e].length : 0
			this.$util.upload(6 - size, {
				path: 'evaluateimg'
			}, res => {
				let arr = this.imgList[e]
				arr = arr.concat(res);
				this.imgList[e] = [];
				this.$set(this.imgList, e, arr)
				if (this.isEvaluate) {
					this.goodsEvalList[e].again_images = this.imgList[e].toString()
				} else {
					this.goodsEvalList[e].images = this.imgList[e].toString()
				}
			});
		},
		//删除图片
		deleteImg(i, j) {
			this.imgList[j].splice(i, 1);
			if (this.isEvaluate) {
				this.goodsEvalList[j].again_images = this.imgList[j].toString()
			} else {
				this.goodsEvalList[j].images = this.imgList[j].toString()
			}
		},
		// 图片预览
		preview(i, j) {
			let urls = this.imgList[j];
			for (let k = 0; k < urls.length; k++) {
				urls[k] = this.$util.img(urls[k])
			}
			uni.previewImage({
				urls: urls,
				current: i
			});
		},

		//提交评价
		save() {
			for (let i = 0; i < this.goodsEvalList.length; i++) {
				if (this.isEvaluate) {
					if (!this.goodsEvalList[i].again_content.trim().length) {
						this.$util.showToast({
							title: "商品的评价不能为空哦"
						});
						return;
					}
				} else {
					if (!this.goodsEvalList[i].content.trim().length) {
						this.$util.showToast({
							title: "商品的评价不能为空哦"
						});
						return;
					}
				}
			}
			let goodsEvaluate = JSON.stringify(this.goodsEvalList)
			let data = {
				order_id: this.orderId,
				goods_evaluate: goodsEvaluate,
			};
			if (!this.isEvaluate) {
				data.order_no = this.orderNo;
				data.member_name = this.memberName;
				data.member_headimg = this.memberNeadimg;
				data.is_anonymous = this.isAnonymous;
				data.shop_deliverycredit = this.shop_deliverycredit;
				data.shop_desccredit = this.shop_desccredit;
				data.shop_servicecredit = this.shop_servicecredit;
			}
			if (this.flag) return;
			this.flag = true;
			this.$api.sendRequest({
				url: this.isEvaluate ? '/api/goodsevaluate/again' : '/api/goodsevaluate/add',
				data: data,
				success: res => {
					if (res.code == 0) {
						this.$util.showToast({
							title: "评价成功"
						})
						setTimeout(() => {
							this.$util.redirectTo('/pages/order/list/list', {}, "redirectTo");
						}, 1000)
					} else {
						this.$util.showToast({
							title: res.message
						});
						this.flag = false;
					}
				},
				fail: res => {
					this.flag = false;
				}
			});
		},
		/**
		 * 店铺评分
		 * @param {Object} e
		 */
		shopScore(e) {
			this[e.index] = e.value;
		},
		imageError(index) {
			this.goodsList[index].sku_image = this.$util.getDefaultImage().default_goods_img;
			this.$forceUpdate();
		}
	}
};
