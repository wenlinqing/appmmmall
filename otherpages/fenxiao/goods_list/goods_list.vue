<template>
	<view :class="themeStyle">
		<view class="content">
			<view class="head-wrap">
				<!-- 搜索区域 -->
				<view class="search-wrap uni-flex uni-row">
					<view class="flex-item category-wrap" @click="showCategory = true">
						<view class="iconfont iconsort"></view>
					</view>
					<view class="flex-item input-wrap">
						<input class="uni-input" maxlength="50" v-model="keyword" confirm-type="search" @confirm="search()" placeholder="请输入您要搜索的商品" />
						<text class="iconfont iconIcon_search" @click.stop="search()"></text>
					</view>

					<view class="flex-item list-style" @click="changeListStyle()">
						<view class="iconfont" :class="{ iconapps: listStyle == 'largest', iconlist1: listStyle == '' }"></view>
					</view>
				</view>

				<!-- 排序 -->
				<view class="sort-wrap">
					<view class="comprehensive-wrap" :class="{ 'ns-text-color': orderType === '' }" @click="sortTabClick('')">
						<text :class="{ 'ns-text-color': orderType === '' }">默认</text>
					</view>
					<view :class="{ 'ns-text-color': orderType === 'sales' }" @click="sortTabClick('sales')">销量</view>
					<view class="price-wrap" @click="sortTabClick('discount_price')">
						<text :class="{ 'ns-text-color': orderType === 'discount_price' }">价格</text>
						<view class="iconfont-wrap">
							<view class="iconfont iconiconangledown-copy" :class="{ 'ns-text-color': priceOrder === 'asc' && orderType === 'discount_price' }"></view>
							<view class="iconfont iconiconangledown" :class="{ 'ns-text-color': priceOrder === 'desc' && orderType === 'discount_price' }"></view>
						</view>
					</view>
					<view :class="{ 'ns-text-color': orderType === 'screen' }" @click="sortTabClick('screen')" class="screen-wrap">
						<text>筛选</text>
						<view class="iconfont-wrap">
							<view class="iconfont iconshaixuan ns-text-color-gray"></view>
						</view>
					</view>
				</view>
			</view>

			<!-- top:350 -->
			<mescroll-uni top="210" ref="mescroll" @getData="getGoodsList">
				<block slot="list">
					<view class="goods-list" :class="listStyle">
						<view v-for="(item, index) in goodsList" :key="index" class="goods-item" @click="navToDetailPage(item)">
							<view class="image-wrap">
								<image :src="$util.img(item.sku_image, { size: 'mid' })" @error="imageError(index)" mode="aspectFill" />
							</view>
							<view class="goods-desc">
								<view class="goods-name">
									<text class="name">{{item.sku_name}}</text>
									<view class="good-share-money">
										<view class="level_money">
											<view class="money_sign">
												佣金:
											</view>
											<view class="money ns-text-color">
												￥{{item.commission_money}}
											</view>
										</view>
									</view>

								</view>
								<view class="goods-bottom">
									<view class="goods-price ns-text-color">
										<text class="ns-font-size-sm">￥</text>
										{{item.discount_price}}
									</view>
									<view class="goods-share ns-gradient-otherpages-fenxiao-goods-list" :class="themeStyle" v-if="!item.is_collect" @click.stop="followGoods(index,item.goods_id,item.sku_id,item.site_id)">
										<text>关注</text>
									</view>
									<view class="goods-share ns-gradient-otherpages-fenxiao-goods-list" :class="themeStyle" v-else @click.stop="delFollowTip(item.collect_id,index)">
										<text>已关注</text>
									</view>
								</view>
							</view>
						</view>
					</view>



					<view class="empty" v-if="goodsList.length==0">
						<ns-empty :isIndex="!1"></ns-empty>
					</view>
				</block>
			</mescroll-uni>

			<!-- 商品分类弹出框 -->
			<uni-drawer :visible="showCategory" mode="left" @close="showCategory = false">
				<scroll-view scroll-y class="category-list-wrap">
					<view>
						<text class="first" @click="selectedCategory(0, 0)" :class="{ 'selected ns-text-color': categoryId == 0}">全部分类</text>
						<view v-for="(item, index) in categoryList" :key="index" class="list-wrap">
							<text class="first" @click="selectedCategory(item.category_id, item.level)" :class="{ 'selected ns-text-color': item.category_id == categoryId  }">
								{{ item.category_name }}
							</text>
							<view v-for="(second_item, second_index) in item.child_list" :key="second_index">
								<text class="second" @click="selectedCategory(second_item.category_id, second_item.level)" :class="{ 'selected ns-text-color': second_item.category_id == categoryId }">
									{{ second_item.category_name }}
								</text>
								<view class="third" v-if="second_item.child_list != ''">
									<view v-for="(third_item, third_index) in second_item.child_list" :key="third_index">
										<uni-tag :inverted="true" :text="third_item.category_name" :type="third_item.category_id == categoryId ? 'primary' : 'default'"
										 @click="selectedCategory(third_item.category_id, third_item.level)" />
									</view>
								</view>
							</view>
						</view>
					</view>
				</scroll-view>
			</uni-drawer>

			<!-- 筛选弹出框 -->
			<uni-drawer :visible="showScreen" mode="right" @close="showScreen = false" class="screen-wrap">
				<view class="title ns-text-color-gray">筛选</view>
				<scroll-view scroll-y>
					<!-- 品牌筛选项 -->
					<view class="item-wrap" v-if="brandList.length > 0">
						<view class="label">
							<text>品牌</text>
							<view class="iconfont" :class="[showBrandMore ? 'iconiconangledown' : 'iconiconangledown-copy']" v-if="brandList.length > 1"
							 @click="showBrandMore = !showBrandMore"></view>
						</view>
						<view class="list">
							<template v-if="showBrandMore">
								<view v-for="(item, index) in brandList" :key="index">
									<uni-tag :inverted="true" :text="item.brand_name" :type="item.brand_id == brandId ? 'primary' : 'default'"
									 @click="brandId == item.brand_id ? (brandId = 0) : (brandId = item.brand_id)" />
								</view>
							</template>
							<template v-else>
								<view v-for="(item, index) in brandList" :key="index" v-if="index < 5">
									<uni-tag :inverted="true" :text="item.brand_name" :type="item.brand_id == brandId ? 'primary' : 'default'"
									 @click="brandId == item.brand_id ? (brandId = 0) : (brandId = item.brand_id)" />
								</view>
							</template>
						</view>
					</view>

					<!-- 包邮 -->
					<view class="item-wrap">
						<view class="label"><text>是否包邮</text></view>
						<view class="list">
							<uni-tag :inverted="true" text="包邮" :type="isFreeShipping ? 'primary' : 'default'" @click="isFreeShipping = !isFreeShipping" />
						</view>
					</view>

					<!-- 经营类型 -->
					<view class="item-wrap">
						<view class="label"><text>经营类型</text></view>
						<view class="list">
							<view>
								<uni-tag :inverted="true" text="平台自营" :type="isOwn === 1 ? 'primary' : 'default'" @click="isOwn === 1 ? (isOwn = 2) : (isOwn = 1)" />
							</view>
							<view class="">
								<uni-tag :inverted="true" text="合作店铺" :type="isOwn === 0 ? 'primary' : 'default'" @click="isOwn === 0 ? (isOwn = 2) : (isOwn = 0)" />
							</view>
						</view>
					</view>

					<!-- 属性筛选项 -->
					<view class="item-wrap" v-if="attributeList.length > 0">
						<view v-for="(item, index) in attributeList" :key="index">
							<view class="label">
								<text>{{ item.attr_name }}</text>
								<!-- iconiconangledown -->
								<view class="iconfont iconiconangledown-copy" v-if="item.child.length > 3"></view>
							</view>
							<view class="list">
								<view v-for="(child, child_index) in item.child" :key="child_index">
									<uni-tag :inverted="true" :text="child.attr_value_name" :type="isSelectedAttr(item.attr_id, child.attr_value_id) ? 'primary' : 'default'"
									 @click="selectedAttr(item.attr_id, child.attr_value_id)" />
								</view>
							</view>
						</view>
					</view>

					<!-- 价格筛选项 -->
					<view class="item-wrap">
						<view class="label"><text>价格区间(元)</text></view>
						<view class="price-wrap">
							<input class="uni-input" type="digit" v-model="minPrice" placeholder="最低价" />
							<text class="ns-text-color-gray">——</text>
							<input class="uni-input" type="digit" v-model="maxPrice" placeholder="最高价" />
						</view>
					</view>
				</scroll-view>
				<view class="footer" :class="{'safe-area':isIphoneX}">
					<view class="footer-box" @click="showScreen = false">
						取消
					</view>
					<view class="footer-box1 ns-bg-color" @click="screenData">
						确定
					</view>
				</view>
			</uni-drawer>
			<loading-cover ref="loadingCover"></loading-cover>
		</view>
	</view>
</template>

<script>
	import uniDrawer from '@/components/uni-drawer/uni-drawer.vue';
	import uniTag from '@/components/uni-tag/uni-tag.vue';
	import list from '../public/js/goods_list.js';
	import fenxiaoWords from 'common/js/fenxiao-words.js';

	export default {
		components: {
			uniDrawer,
			uniTag
		},
		computed: {
			//vueX页面主题
			themeStyle() {
				return 'theme-' + this.$store.state.themeStyle
			}
		},
		data() {
			return {};
		},
		onShow() {
			uni.setNavigationBarTitle({
				title: this.fenxiaoWords.concept + '中心'
			});
		},
		mixins: [list, fenxiaoWords],
	};
</script>

<style lang="scss">
	@import '../public/css/goods_list.scss';
</style>
