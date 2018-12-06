

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
	$loading = $(`<div class="sk-wave loading">
					<div class="sk-rect sk-rect1"></div>
					<div class="sk-rect sk-rect2"></div>
					<div class="sk-rect sk-rect3"></div>
					<div class="sk-rect sk-rect4"></div>
					<div class="sk-rect sk-rect5"></div>
				</div>`);
var index = {
	init: () => {//页面初始化
		let $height = $searchWrap.height() + $('.map-wrap').height();
		$addressList.css('top', $height);
		iNoBounce.enable();
	},
	mapInit: () => {//地图初始化
		var geolocation = new BMap.Geolocation();
		geolocation.getCurrentPosition(function(r) {
			if(this.getStatus() == BMAP_STATUS_SUCCESS) {
				var point = new BMap.Point(r.point);
				mainMap.centerAndZoom(r.point, 17);
			} else {
				alert('failed' + this.getStatus());
			}
		}, {
			enableHighAccuracy: true
		});
		mainMap.addEventListener('dragging', (type) => {
			moveend = true;
		});
		mainMap.addEventListener('moveend', (type, target, pixel, point) => {
//			console.log(mainMap.getCenter());
			//				console.log(type.target.zC);
//			marker.setPosition(mainMap.getCenter());
			if(moveend){
				geoc.getLocation(mainMap.getCenter(), (rs)=>{
					console.log(rs);
					index.localList(rs.address,rs.surroundingPois);
				});
			}
		});
		var geolocationControl = new BMap.GeolocationControl();
		geolocationControl.addEventListener('locationSuccess', function(e) {
			
		});
		geolocationControl.addEventListener('locationError', function(e) {
			
		});
		mainMap.addControl(geolocationControl);
		$('#container').append($('<i class="icon marker">&#xe613;</i>'));//手动添加地图中心点图标
	},
	search:()=>{//搜索条
		$searchword.on('focus',()=>{
			$searchWrap.removeClass('init-status');
			let listData = localStorage.getItem('historyList')?JSON.parse(localStorage.getItem('historyList')):[];
			index.drawResultList(listData);
			$searchList.show();
		});
		$('.cancle').on('tap',()=>{
			$searchWrap.addClass('init-status');
			$searchList.hide();
			$clearInput.hide();
			$searchword.val('');
			$searchList.find('ul').empty();
		});
		$searchword.on('input',()=>{
			if($searchword.val()!=''){
				$clearInput.show();
			}else{
				$clearInput.hide();
			}
		});
	},
	localList:(val,pois)=>{//搜索中心点地址
		$addressList.append($loading);
		let localFn = ()=>{
			console.log(local.getResults());
			index.drawAddressList(local.getResults().vr,pois);
		};
		let local = new BMap.LocalSearch(mainMap, { //智能搜索
			pageCapacity:20,
		  	onSearchComplete: localFn
		});
		local.search(val,{forceLocal:true});
	},
	drawAddressList:(data,pois)=>{//渲染地址列表
		let tpl = [],
		$list = $addressList.find('ul'),
		tmp = $.extend(true, [], data),
		addressArr = [];
		if(data.length!=0){
			data.forEach((item,dindex)=>{
				pois.forEach((poi,index)=>{
					if(poi.uid==item.uid){
						tmp.splice(dindex,1);
					}
				});
			});
		};
		addressArr = pois.concat(tmp);
		if(addressArr.length!=0){
			for(let item of addressArr){
				let title = item.title,
					address = item.address,
					$li;
				$li=$(`<li>
						<h2 class="poi-title">${title}</h2>
		    				<p class="poi-address">${address}</p>
		    				<i class="icon">&#xe6d0;</i>
		    			</li>`).data('poi',JSON.stringify(item));
		    		tpl.push($li);
			};
		};
		console.log(addressArr);
		tpl.push($('<li class="no-more">没有更多了...</li>'));
		$list.empty().append(tpl);
		setTimeout(()=>{
			$addressList.find('.loading').remove();
		},0);
	},
	addressClick:()=>{//地址点击事件
		$addressList.on('tap','li',function(){
			if($(this).hasClass('no-more') || $(this).hasClass('active')) return;
			let local = $(this).data('local'),
				poi = $(this).data('poi');
			$(this).addClass('active').siblings('li').removeClass('active');
			console.log(poi);
			alert(JSON.stringify(poi));
		});
	},
	autoComplete:()=>{//自动提示
		 let ac = new BMap.Autocomplete(    //建立一个自动完成的对象
			{'input' : 'searchword','location' : mainMap,type:'city', onSearchComplete:index.onSearchComplete}
		);
	},
	onSearchComplete:(e)=>{//自动提示完成
		index.drawResultList(e.vr);
	},
	searchResultClick:()=>{//自动提示结果点击事件
		$searchList.on('tap','li',function(){
			let local = $(this).data('local'),
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
	localSearch:(val)=>{//自动提示结果点击后刷新地图
		moveend = false;
		mainMap.clearOverlays();    //清除地图上所有覆盖物
		let localFn = ()=>{
			var pp = local.getResults().getPoi(0).point;    //获取第一个智能搜索的结果
			mainMap.centerAndZoom(pp, 17);
			geoc.getLocation(pp, (rs)=>{
				console.log(rs);
				index.localList(val,rs.surroundingPois);
			});
		};
		let local = new BMap.LocalSearch(mainMap, { //智能搜索
		  onSearchComplete: localFn
		});
		local.search(val);
	},
	drawResultList:(data)=>{//渲染自动提示列表
		if(data.length!=0){
			let $list = $searchList.find('ul'),
				tpl = [];
			for(let item of data){
				let name = item.business,
					province = item.province,
					city = item.city,
					district = item.district,
					street = item.street,
					$li;
				$li=$(`<li data-local="${province}${city}${district}${street}${name}">
						<i class="icon">&#xe960;</i>
		    				<p class="item">
	                        <span class="poi-title">${name}</span>
	                        <span class="poi-address">${province}${city}${district}${street}</span>
	                    </p>
		    			</li>`).data('poi',JSON.stringify(item));
		    		tpl.push($li);
			};
			$list.empty().append(tpl);
			$clearHistory.show();
		}
	},
	addHistory:(val)=>{//添加搜索历史
		let historyList = localStorage.getItem('historyList')?JSON.parse(localStorage.getItem('historyList')):[];
		if(historyList.length==10){
			historyList.pop();
		};
		if(historyList.length!=0){
			for(let index in historyList){
				if(JSON.stringify(historyList[index])==JSON.stringify(val)){
					historyList.splice(index,1);
				}
			};
		};
		historyList.unshift(val);
		console.log(historyList);
		localStorage.setItem('historyList',JSON.stringify(historyList));
	},
	clearHistoryList:()=>{//清除搜索历史
		$clearHistory.on('tap',function(){
			if(window.confirm('确认清空搜索历史？')){
				localStorage.removeItem('historyList');
				$(this).hide();
				$searchList.find('ul').empty();
			}
		});
		
	}
};


Zepto(function($){
	index.init();
	index.mapInit();
	index.addressClick();
	index.search();
	index.autoComplete();
	index.searchResultClick();
	index.clearHistoryList();
});
