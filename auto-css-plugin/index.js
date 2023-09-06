function showCss() {
	let str = window.AutoCss.getCssStr();
	str = str.replace(/^(\/\*[\s\S]+?\*\/)/gm, '<span style="color:#009926;font-size:14px;">$1</span></br>');
	str = str.replace(/\.([a-z0-9-:\s]+)/gm, '<span style="color:#990073">.$1</span>');
	str = str.replace(/\{/g, '&nbsp;{</br>');
	str = str.replace(/\}/g, '}</br></br>');
	str = str.replace(/;\s/g, ';</br>');
	str = str.replace(/(?<=<\/br>)\s*(?=[a-z])/gm, '&nbsp;&nbsp;');
	str = str.replace(/^\n/gm, '');
	str = str.replace(/(!important;)/g, '<span style="color:rgba(255,0,0,.45);">$1</span>');
	document.querySelectorAll('[data-html]').forEach((node) => {
		node.innerHTML = str;
	});
}

const obj = {
	fclassName: '',
	cOneclassName: '',
	cTwolassName: '',
};

const watchInputObj = {};
const watchObj = {};

// 简单版 proxy 只支持基础类型
const handlerProxy = {
	set(target, key, value) {
		Reflect.set(target, key, value);
		watchObj[key].forEach((node) => {
			node.className = value;
		});
		// 改变元素的值
		watchInputObj[key].forEach((node) => {
			node.value = value;
		});
		setTimeout(showCss, 500);
	},
	get(target, key) {
		return Reflect.get(target, key);
	},
};

const state = new Proxy(obj, handlerProxy);
const inputNodeList = document.querySelectorAll('[data-value]');
inputNodeList.forEach((node) => {
	const name = node.getAttribute('data-value');
	if (watchInputObj[name]) {
		watchInputObj[name].push(node);
	} else {
		watchInputObj[name] = [node];
	}
	// 改变对象的值
	node.addEventListener('keyup', ({ target }) => {
		state[name] = target.value;
	});
});

const wathNodeList = document.querySelectorAll('[data-showClass]');
wathNodeList.forEach((node) => {
	const name = node.getAttribute('data-showClass');
	if (watchObj[name]) {
		watchObj[name].push(node);
	} else {
		watchObj[name] = [node];
	}
});

function setState(obj) {
	for (const key in obj) {
		state[key] = obj[key];
	}
}

setState({
	fclassName: 'x-w-100p x-h-218 x-flex-around-center x-border-1 x-br-4 active:x-border-c-transparent x-select-none',
	cOneclassName: 'x-w-200 x-bg-red-55 x-flex-center-center x-h-64 x-br-8 hover:x-bg-009926 hover:x-c-fff x-cursor-pointer',
	cTwolassName: 'x-w-200 x-bg-red x-flex-center-center x-h-64 x-br-8 hover:x-bg-f2f3f7 x-cursor-pointer',
});

window.onload = () => {
	const AutoCss = new window.AutoCss({
		prefix: 'x', // class前缀,防止和项目中其他样式及UI框架样式冲突，默认是'x'
		beforeStr: '', // css 文本嵌入的文字
		afterStr: '', // css结束嵌入的文字
		/**
		 * 颜色配置 默认包含如下值
		 * red         : '#f00'
		 * white       : '#fff'
		 * black       : '#000'
		 * blue        : '#00f'
		 * transparent : 'transparent'
		 * 可以覆盖写入 相关颜色可自定义 如 bg-red bg-diy
		 */
		colors: {
			primary: '#2788e9',
			secondary: '#4d99ff',
			deep: '#016eff',
			success: '#40bb3f',
			warning: '#faad14',
			error: '#fe0000',
			info: '#909399',
			gray: '#f5f5f5',
			transparent: 'transparent',
		},
		borderColor: '#ddd',
		dirPath: 'src', // 必填项。源码根目录(必须存在此目录),默认为src,开发热更新使用。
		//generate: 'src/styles/auto.css', // 可选配置,样式文件生成地址,为空则直接注入到html文件中,不为空则将样式文件生成到指定位置,需自行引入。
		type: 'vue', // 必填项。项目类型 vue | react | d-mini-program (钉钉小程序) | wx-mini-program(微信小程序) | html
		pageWidth: '750', // 可选项。默认页面宽度 750，单位像素
		/**
		 * 可覆写规则 或自定义规则 详见进阶使用 详情请看README
		 */
		modifyRules: {
			primaryBox: ({ config, textToRgbText, getColorsKey, getColors, UNIT_ENUM_STR, NONNEGATIVE_NUMBER_REGEX_STR, DIRECTION_MAP }) => {
				return {
					regExp() {
						return new RegExp(`^${config.prefix}-primary-box$`);
					},
					render() {
						return {
							name: 'primaryBox',
							order: 900,
							css: ['height:100px', 'width:100px', 'border-radius:20px', 'background-color:red'],
						};
					},
					snippets: {
						//代码提示
						通用盒子: {
							prefix: `${config.prefix}-primary-box`, //代码提示触发前缀
							body: `${config.prefix}-primary-box`, //代码提示内容
						},
					},
				};
			},
		},
		/**
		 * 自定义媒体查询
		 * 可覆写或添加规则 以下为默认配置 如 md@bg-red or diy@bg-red
		 * sm : '(min-width: 640px)',
		 * md : '(min-width: 768px)',
		 * lg : '(min-width: 1024px)',
		 * xl : '(min-width: 1280px)'
		 */
		mediaQueries: {},
		/**
		 *  是否为所有css 添加 important
		 */
		important: true, // 默认为 false
		unit: 'px', // 可选项。默认单位px,p是百分比
		//单位转换配置
		//可以是对象或者函数
		// toAnyConfig: {
		//   unit: 'rem', // 默认转换后的单位
		//   rootValue: 16, // 表示根元素字体大小或基于输入参数返回根元素字体大小 1px -> 1/16rem
		//   unitPrecision: 5, // 允许小数单位精度
		//   minPixelValue: 1 // 不会被转换的最小值
		// },
		//函数必须返回num、unit字段
		// toAnyConfig: function ({ num, unit }) {
		// 	if (num > 1 && (unit == 'px' || unit == undefined)) {
		// 		return {
		// 			num: (num / 100).toFixed(4),
		// 			unit: 'rem',
		// 		};
		// 		// return {
		// 		// 	num: (num / 375).toFixed(4),
		// 		// 	unit: 'vw',
		// 		// };
		// 	}
		// 	return {
		// 		num,
		// 		unit,
		// 	};
		// },
	});
	console.log(AutoCss);
	AutoCss.start();
};
