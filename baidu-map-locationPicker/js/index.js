'use strict';

var mainMap = new BMap.Map('container'),
    geoc = new BMap.Geocoder(),
    marker,
    moveend = true,
    $searchWrap = $('.search-wrap'),
    $addressList = $('.address-list'),
    $searchword = $('#searchword'),
    $searchList = $('.search-list'),
    $clearInput = $('.clear-input'),
    $clearHistory = $('.clear-history'),
    $loading = $('<div class="sk-wave loading">\n\t\t\t\t\t<div class="sk-rect sk-rect1"></div>\n\t\t\t\t\t<div class="sk-rect sk-rect2"></div>\n\t\t\t\t\t<div class="sk-rect sk-rect3"></div>\n\t\t\t\t\t<div class="sk-rect sk-rect4"></div>\n\t\t\t\t\t<div class="sk-rect sk-rect5"></div>\n\t\t\t\t</div>');
var index = {
	init: function init() {
		//页面初始化
		var $height = $searchWrap.height() + $('.map-wrap').height();
		$addressList.css('top', $height);
		iNoBounce.enable();
	},
	mapInit: function mapInit() {
		//地图初始化
		var geolocation = new BMap.Geolocation();
		geolocation.getCurrentPosition(function (r) {
			if (this.getStatus() == BMAP_STATUS_SUCCESS) {
				var point = new BMap.Point(r.point);
				mainMap.centerAndZoom(r.point, 17);
			} else {
				alert('failed' + this.getStatus());
			}
		}, {
			enableHighAccuracy: true
		});
		mainMap.addEventListener('dragging', function (type) {
			moveend = true;
		});
		mainMap.addEventListener('moveend', function (type, target, pixel, point) {
			//			console.log(mainMap.getCenter());
			//				console.log(type.target.zC);
			//			marker.setPosition(mainMap.getCenter());
			if (moveend) {
				geoc.getLocation(mainMap.getCenter(), function (rs) {
					console.log(rs);
					index.localList(rs.address, rs.surroundingPois);
				});
			}
		});
		var geolocationControl = new BMap.GeolocationControl();
		geolocationControl.addEventListener('locationSuccess', function (e) {});
		geolocationControl.addEventListener('locationError', function (e) {});
		mainMap.addControl(geolocationControl);
		$('#container').append($('<i class="icon marker">&#xe613;</i>')); //手动添加地图中心点图标
	},
	search: function search() {
		//搜索条
		$searchword.on('focus', function () {
			$searchWrap.removeClass('init-status');
			var listData = localStorage.getItem('historyList') ? JSON.parse(localStorage.getItem('historyList')) : [];
			index.drawResultList(listData);
			$searchList.show();
		});
		$('.cancle').on('tap', function () {
			$searchWrap.addClass('init-status');
			$searchList.hide();
			$clearInput.hide();
			$searchword.val('');
			$searchList.find('ul').empty();
		});
		$searchword.on('input', function () {
			if ($searchword.val() != '') {
				$clearInput.show();
			} else {
				$clearInput.hide();
			}
		});
	},
	localList: function localList(val, pois) {
		//搜索中心点地址
		$addressList.append($loading);
		var localFn = function localFn() {
			console.log(local.getResults());
			index.drawAddressList(local.getResults().vr, pois);
		};
		var local = new BMap.LocalSearch(mainMap, { //智能搜索
			pageCapacity: 20,
			onSearchComplete: localFn
		});
		local.search(val, { forceLocal: true });
	},
	drawAddressList: function drawAddressList(data, pois) {
		//渲染地址列表
		var tpl = [],
		    $list = $addressList.find('ul'),
		    tmp = $.extend(true, [], data),
		    addressArr = [];
		if (data.length != 0) {
			data.forEach(function (item, dindex) {
				pois.forEach(function (poi, index) {
					if (poi.uid == item.uid) {
						tmp.splice(dindex, 1);
					}
				});
			});
		};
		addressArr = pois.concat(tmp);
		if (addressArr.length != 0) {
			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;

			try {
				for (var _iterator = addressArr[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					var item = _step.value;

					var title = item.title,
					    address = item.address,
					    $li = void 0;
					$li = $('<li>\n\t\t\t\t\t\t<h2 class="poi-title">' + title + '</h2>\n\t\t    \t\t\t\t<p class="poi-address">' + address + '</p>\n\t\t    \t\t\t\t<i class="icon">&#xe6d0;</i>\n\t\t    \t\t\t</li>').data('poi', JSON.stringify(item));
					tpl.push($li);
				}
			} catch (err) {
				_didIteratorError = true;
				_iteratorError = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion && _iterator.return) {
						_iterator.return();
					}
				} finally {
					if (_didIteratorError) {
						throw _iteratorError;
					}
				}
			}

			;
		};
		console.log(addressArr);
		tpl.push($('<li class="no-more">没有更多了...</li>'));
		$list.empty().append(tpl);
		setTimeout(function () {
			$addressList.find('.loading').remove();
		}, 0);
	},
	addressClick: function addressClick() {
		//地址点击事件
		$addressList.on('tap', 'li', function () {
			if ($(this).hasClass('no-more') || $(this).hasClass('active')) return;
			var local = $(this).data('local'),
			    poi = $(this).data('poi');
			$(this).addClass('active').siblings('li').removeClass('active');
			console.log(poi);
			alert(JSON.stringify(poi));
		});
	},
	autoComplete: function autoComplete() {
		//自动提示
		var ac = new BMap.Autocomplete( //建立一个自动完成的对象
		{ 'input': 'searchword', 'location': mainMap, type: 'city', onSearchComplete: index.onSearchComplete });
	},
	onSearchComplete: function onSearchComplete(e) {
		//自动提示完成
		index.drawResultList(e.vr);
	},
	searchResultClick: function searchResultClick() {
		//自动提示结果点击事件
		$searchList.on('tap', 'li', function () {
			var local = $(this).data('local'),
			    poi = $(this).data('poi');
			console.log(poi);
			$searchWrap.addClass('init-status');
			$searchList.hide();
			$clearInput.hide();
			$searchword.val('');
			index.localSearch(local);
			index.addHistory(poi);
			$searchword.blur();
		});
	},
	localSearch: function localSearch(val) {
		//自动提示结果点击后刷新地图
		moveend = false;
		mainMap.clearOverlays(); //清除地图上所有覆盖物
		var localFn = function localFn() {
			var pp = local.getResults().getPoi(0).point; //获取第一个智能搜索的结果
			mainMap.centerAndZoom(pp, 17);
			geoc.getLocation(pp, function (rs) {
				console.log(rs);
				index.localList(val, rs.surroundingPois);
			});
		};
		var local = new BMap.LocalSearch(mainMap, { //智能搜索
			onSearchComplete: localFn
		});
		local.search(val);
	},
	drawResultList: function drawResultList(data) {
		//渲染自动提示列表
		if (data.length != 0) {
			var $list = $searchList.find('ul'),
			    tpl = [];
			var _iteratorNormalCompletion2 = true;
			var _didIteratorError2 = false;
			var _iteratorError2 = undefined;

			try {
				for (var _iterator2 = data[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
					var item = _step2.value;

					var name = item.business,
					    province = item.province,
					    city = item.city,
					    district = item.district,
					    street = item.street,
					    $li = void 0;
					$li = $('<li data-local="' + province + city + district + street + name + '">\n\t\t\t\t\t\t<i class="icon">&#xe960;</i>\n\t\t    \t\t\t\t<p class="item">\n\t                        <span class="poi-title">' + name + '</span>\n\t                        <span class="poi-address">' + province + city + district + street + '</span>\n\t                    </p>\n\t\t    \t\t\t</li>').data('poi', JSON.stringify(item));
					tpl.push($li);
				}
			} catch (err) {
				_didIteratorError2 = true;
				_iteratorError2 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion2 && _iterator2.return) {
						_iterator2.return();
					}
				} finally {
					if (_didIteratorError2) {
						throw _iteratorError2;
					}
				}
			}

			;
			$list.empty().append(tpl);
			$clearHistory.show();
		}
	},
	addHistory: function addHistory(val) {
		//添加搜索历史
		var historyList = localStorage.getItem('historyList') ? JSON.parse(localStorage.getItem('historyList')) : [];
		if (historyList.length == 10) {
			historyList.pop();
		};
		if (historyList.length != 0) {
			for (var _index in historyList) {
				if (JSON.stringify(historyList[_index]) == JSON.stringify(val)) {
					historyList.splice(_index, 1);
				}
			};
		};
		historyList.unshift(val);
		console.log(historyList);
		localStorage.setItem('historyList', JSON.stringify(historyList));
	},
	clearHistoryList: function clearHistoryList() {
		//清除搜索历史
		$clearHistory.on('tap', function () {
			if (window.confirm('确认清空搜索历史？')) {
				localStorage.removeItem('historyList');
				$(this).hide();
				$searchList.find('ul').empty();
			}
		});
	}
};

Zepto(function ($) {
	index.init();
	index.mapInit();
	index.addressClick();
	index.search();
	index.autoComplete();
	index.searchResultClick();
	index.clearHistoryList();
});