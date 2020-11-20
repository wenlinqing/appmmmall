import Config from './config.js'

export default {
	/**
	 * 页面跳转
	 * @param {string} to 跳转链接 /pages/idnex/index
	 * @param {Object} param 参数 {key : value, ...}
	 * @param {string} mode 模式 
	 */
	redirectTo(to, param, mode) {
		let url = to;
		if (param != undefined) {
			Object.keys(param).forEach(function(key) {
				if (url.indexOf('?') != -1) {
					url += "&" + key + "=" + param[key];
				} else {
					url += "?" + key + "=" + param[key];
				}
			});
		}
		switch (mode) {
			case 'tabbar':
				// 跳转到 tabBar 页面，并关闭其他所有非 tabBar 页面。
				uni.switchTab({
					url: url
				})
				break;
			case 'redirectTo':
				// 关闭当前页面，跳转到应用内的某个页面。
				uni.redirectTo({
					url: url
				});
				break;
			case 'reLaunch':
				// 关闭所有页面，打开到应用内的某个页面。
				uni.reLaunch({
					url: url
				});
				break;
			default:
				// 保留当前页面，跳转到应用内的某个页面
				uni.navigateTo({
					url: url
				});
		}
	},
	/**
	 * 图片路径转换
	 * @param {String} img_path 图片地址
	 * @param {Object} params 参数，针对商品、相册里面的图片区分大中小，size: big、mid、small
	 */
	img(img_path, params) {
		var path = "";
		if (img_path != undefined && img_path != "") {
			if (params && img_path != this.getDefaultImage().default_goods_img) {
				// 过滤默认图
				let arr = img_path.split(".");
				let suffix = arr[arr.length - 1];
				arr.pop();
				arr[arr.length - 1] = arr[arr.length - 1] + "_" + params.size;
				arr.push(suffix);
				img_path = arr.join(".");
			}
			if (img_path.indexOf("http://") == -1 && img_path.indexOf("https://") == -1) {
				path = Config.imgDomain + "/" + img_path;
			} else {
				path = img_path;
			}
		}
		return path;
	},
	/**
	 * 时间戳转日期格式
	 * @param {Object} timeStamp
	 */
	timeStampTurnTime(timeStamp) {
		if (timeStamp != undefined && timeStamp != "" && timeStamp > 0) {
			var date = new Date();
			date.setTime(timeStamp * 1000);
			var y = date.getFullYear();
			var m = date.getMonth() + 1;
			m = m < 10 ? ('0' + m) : m;
			var d = date.getDate();
			d = d < 10 ? ('0' + d) : d;
			var h = date.getHours();
			h = h < 10 ? ('0' + h) : h;
			var minute = date.getMinutes();
			var second = date.getSeconds();
			minute = minute < 10 ? ('0' + minute) : minute;
			second = second < 10 ? ('0' + second) : second;
			return y + '-' + m + '-' + d + ' ' + h + ':' + minute + ':' + second;
		} else {
			return "";
		}
	},
	/**
	 * 倒计时
	 * @param {Object} seconds 秒
	 */
	countDown(seconds) {
		let [day, hour, minute, second] = [0, 0, 0, 0]
		if (seconds > 0) {
			day = Math.floor(seconds / (60 * 60 * 24))
			hour = Math.floor(seconds / (60 * 60)) - (day * 24)
			minute = Math.floor(seconds / 60) - (day * 24 * 60) - (hour * 60)
			second = Math.floor(seconds) - (day * 24 * 60 * 60) - (hour * 60 * 60) - (minute * 60)
		}
		if (day < 10) {
			// day = '0' + day
		}
		if (hour < 10) {
			// hour = '0' + hour
		}
		if (minute < 10) {
			// minute = '0' + minute
		}
		if (second < 10) {
			// second = '0' + second
		}
		return {
			d: day,
			h: hour,
			i: minute,
			s: second
		};
	},
	/**
	 * 数值去重
	 * @param {Array} arr 数组
	 * @param {string} field 字段
	 */
	unique(arr, field) {
		const res = new Map();
		return arr.filter((a) => !res.has(a[field]) && res.set(a[field], 1));
	},
	/**
	 * 判断值是否在数组中
	 * @param {Object} elem
	 * @param {Object} arr
	 * @param {Object} i
	 */
	inArray: function(elem, arr) {
		return arr == null ? -1 : arr.indexOf(elem);
	},
	/**
	 * 获取某天日期
	 * @param {Object} day
	 */
	getDay: function(day) {
		var today = new Date();
		var targetday_milliseconds = today.getTime() + 1000 * 60 * 60 * 24 * day;
		today.setTime(targetday_milliseconds);

		const doHandleMonth = function(month) {
			var m = month;
			if (month.toString().length == 1) {
				m = "0" + month;
			}
			return m
		}

		var tYear = today.getFullYear();
		var tMonth = today.getMonth();
		var tDate = today.getDate();
		var tWeek = today.getDay();
		var time = parseInt(today.getTime() / 1000);
		tMonth = doHandleMonth(tMonth + 1);
		tDate = doHandleMonth(tDate);

		const week = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
		return {
			't': time,
			'y': tYear,
			'm': tMonth,
			'd': tDate,
			'w': week[tWeek]
		};
	},
	/**
	 * 图片选择加上传
	 * @param number num
	 * @param {Object} params
	 * @param {Object} callback
	 * return array
	 */
	upload: function(num, params, callback) {
		var data = {
			token: uni.getStorageSync('token'),
			private_key: Config.privateKey
		}
		data = Object.assign(data, params);
		var imgs_num = num;
		var _self = this;
		uni.chooseImage({
			count: imgs_num,
			sizeType: ['compressed'], //可以指定是原图还是压缩图，默认二者都有
			sourceType: ['album', 'camera'], //从相册或者拍照
			success: async function(res) {
				const tempFilePaths = res.tempFilePaths;

				// typeof callback == 'function' && callback(tempFilePaths);

				var _data = data;
				var imgs = [];
				for (var i = 0; i < tempFilePaths.length; i++) {
					var path = await _self.upload_file_server(tempFilePaths[i], _data, params.path);
					imgs.push(path);
				}
				typeof callback == 'function' && callback(imgs);
			}
		});
	},
	//上传
	upload_file_server(tempFilePath, data, path) {
		return new Promise((resolve, reject) => {
			uni.uploadFile({
				url: Config.baseUrl + '/api/upload/' + path,
				filePath: tempFilePath,
				name: 'file',
				formData: data,
				success: function(res) {
					var path_str = JSON.parse(res.data);
					if (path_str.code >= 0) {
						resolve(path_str.data.pic_path);
					} else {
						reject("error");
					}
				}
			});

		});

	},
	/**
	 * 复制
	 * @param {Object} message
	 * @param {Object} callback
	 */
	copy(value, callback) {
		// #ifdef H5
		var oInput = document.createElement('input'); //创建一个隐藏input（重要！）
		oInput.value = value; //赋值
		document.body.appendChild(oInput);
		oInput.select(); // 选择对象
		document.execCommand("Copy"); // 执行浏览器复制命令
		oInput.className = 'oInput';
		oInput.style.display = 'none';
		this.showToast({
			title: '复制成功'
		});
		typeof callback == 'function' && callback();
		// #endif

		// #ifdef MP || APP-PLUS
		uni.setClipboardData({
			data: value,
			success: () => {
				typeof callback == 'function' && callback();
			}
		});
		// #endif
	},
	/**
	 * 是否是微信浏览器
	 */
	isWeiXin() {
		// #ifndef H5
		return false;
		// #endif
		var ua = navigator.userAgent.toLowerCase();
		if (ua.match(/MicroMessenger/i) == "micromessenger") {
			return true;
		} else {
			return false;
		}
	},

	/**
	 * 显示消息提示框
	 *  @param {Object} params 参数
	 */
	showToast(params = {}) {
		params.title = params.title || "";
		params.icon = params.icon || "none";
		params.position = params.position || 'bottom';
		uni.showToast(params);
	},
	/**
	 * 检测苹果X以上的手机
	 */
	isIPhoneX() {
		let res = uni.getSystemInfoSync();
		if (res.model.search('iPhone X') != -1) {
			return true;
		}
		return false;
	},
	/**
	 * 深度拷贝对象
	 * @param {Object} obj
	 */
	deepClone(obj) {
		const isObject = function(obj) {
			return typeof obj == 'object';
		}

		if (!isObject(obj)) {
			throw new Error('obj 不是一个对象！')
		}
		//判断传进来的是对象还是数组
		let isArray = Array.isArray(obj)
		let cloneObj = isArray ? [] : {}
		//通过for...in来拷贝
		for (let key in obj) {
			cloneObj[key] = isObject(obj[key]) ? this.deepClone(obj[key]) : obj[key]
		}
		return cloneObj
	},
	refreshBottomNav() {
		var bottomNav = uni.getStorageSync("bottom_nav");
		bottomNav = JSON.parse(bottomNav);
		for (var i = 0; i < bottomNav.list.length; i++) {
			var item = bottomNav.list[i];
			var obj = {
				index: i
			};
			obj.text = item.title;
			obj.iconPath = this.img(item.iconPath);
			obj.selectedIconPath = this.img(item.selectedIconPath);
			if (bottomNav.type == 1) {
				// 图文
			} else if (bottomNav.type == 2) {
				// 图片
			} else if (bottomNav.type == 3) {
				// 文字
			}
			uni.setTabBarItem(obj);
		}
	},
	/**
	 * 自定义模板的跳转链接
	 * @param {Object} link
	 */
	diyRedirectTo(link, method) {
		if (link == null || link == '' || !link.wap_url) return;
		if (link.wap_url.indexOf('http') != -1) {
			this.redirectTo('/otherpages/web/web?src=' + link.wap_url);
		}else {
			if(link.site_id){
				this.redirectTo(link.wap_url,{site_id:link.site_id});
			}else{
				this.redirectTo(link.wap_url);
			}
		}
	},
	/**
	 * 获取默认图
	 * @param {Object} link
	 */
	getDefaultImage() {
		let defaultImg = uni.getStorageSync('default_img');
		if (defaultImg) {
			defaultImg = JSON.parse(defaultImg);
			defaultImg.default_goods_img = this.img(defaultImg.default_goods_img);
			defaultImg.default_headimg = this.img(defaultImg.default_headimg);
			defaultImg.default_shop_img = this.img(defaultImg.default_shop_img);
			return defaultImg;
		} else {
			return {
				default_goods_img: '',
				default_headimg: '',
				default_shop_img: ''
			};
		}
	},

	/**
	 * 判断手机是否为iphoneX系列
	 */
	uniappIsIPhoneX() {
		let isIphoneX = false;
		let systemInfo = uni.getSystemInfoSync();
		// #ifdef MP || APP-PLUS
		if (systemInfo.model.search('iPhone X') != -1) {
			isIphoneX = true;
		}
		// #endif

		// #ifdef H5
		var u = navigator.userAgent;
		var isIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
		if (isIOS) {
			if (systemInfo.screenWidth == 375 && systemInfo.screenHeight == 812 && systemInfo.pixelRatio == 3) {
				isIphoneX = true;
			} else if (systemInfo.screenWidth == 414 && systemInfo.screenHeight == 896 && systemInfo.pixelRatio == 3) {
				isIphoneX = true;
			} else if (systemInfo.screenWidth == 414 && systemInfo.screenHeight == 896 && systemInfo.pixelRatio == 2) {
				isIphoneX = true;
			}
		}
		// #endif
		return isIphoneX;
	},
	/**
	 * 判断手机是否为iphoneX系列   	判断当前页面栈是否存在，如果存在，则返回该页面栈，否则跳转到该页面
	 */
	jumpPage(url) {
		let jump = true;
		let arr = getCurrentPages().reverse();
		for (let i = 0; i < arr.length; i++) {
			if (url.indexOf(arr[i].route) != -1) {
				jump = false;
				uni.navigateBack({
					delta: i
				});
				break;
			}
		}
		if (jump) {
			this.$util.diyRedirectTo(url);
		}
	},
	// 自定义返回事件
	goBack(){
		if(getCurrentPages().length > 1){
			uni.navigateBack()
		}else{
			uni.navigateTo({
				url: '/pages/index/index/index'
			})
		}
	}
}
