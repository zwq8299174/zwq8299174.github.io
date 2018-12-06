


'use strict';
requirejs.config({
//	urlArgs:'v=' +  stamp,
	baseUrl: './js',
	//test
	//baseUrl: 'http://www.xxx.com/static/js/lib',
	// paths选项设定。“module / name ':”path“指定。扩展（js）指定。
	paths: {
//基础lib----------------
		'zepto': 'zepto.min',
		'touch': 'touch',
		'iNoBounce': 'inobounce.min',
		'domReady':'domReady'
	},
	// shim选项设定。模块间的依存关系定义。
	shim: {
		'touch': {
			// jQuery依赖，所以paths设定了“module / name”指定。
			deps: ['zepto']
		}
	},
	//启动应用程序
	deps: [
		//'common'
	],
	waitSeconds: 0
});
