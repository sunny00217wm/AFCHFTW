/**
 * 基於 https://github.com/Xi-Plus/twinkle/tree/2247413ab1f2d6f02140d3cfbcf1208a11e909dd 亂搞的小工具
 * 最近更改請見 https://github.com/sunny00217wm/AFCH/commits/master
 **/

(function () {

var VERSION = '{{subst:#time:YmdHis}}';
/**{{subst:void|**/ //}}
var PREFIX = 'sunny00217wm/AFCHFTW/zhwp/'; // perfix on github {{subst:void|
/**}}
**{{subst:void}}/
var PREFIX = 'User:Sunny00217/AFCH/';{{subst:void|**/ //}}
var rebuildcache = localStorage.AFCHFTW_version !== VERSION;
var tests = [];

var ajax = function (title) {
	return $.ajax({
		/**{{subst:void|**/ //}}
		url: 'https://raw.githubusercontent.com/' + title , // source url on github {{subst:void|
		/**}}
		**{{subst:void}}/
		url: 'https://zh.wikipedia.org/w/index.php?title=User:Sunny00217/AFCH/' + title + '&action=raw&ctype=text/javascript',{{subst:void|**/ //}}
		dataType: 'text'
	});
};

var load = function (p) {
	var done = function (data) {
		if (rebuildcache || !localStorage['AFCHFTW_' + p.name]) {
			localStorage['AFCHFTW_' + p.name] = data;
		}
	};
	if (localStorage['AFCHFTW_' + p.name] && !rebuildcache) {
		return $.Deferred().resolve(localStorage['AFCHFTW_' + p.name]);
	}
	if (p.test) {
		return ajax(PREFIX + p.name).done(done);
	} else
		//fail
	}
};

var message = function (text) {
	console.log('[AFCHFTW]', text); // eslint-disable-line no-console
//    $('#simpleSearch input[type="search"]').attr('placeHolder', text);
};

tests.push({ name: 'morebits.js', test: true }); // https://github.com/Xi-Plus/twinkle/blob/master/morebits.js - morebits.js
tests.push({ name: 'afch.js', test: true }); // https://github.com/Xi-Plus/twinkle/blob/master/twinkle.js - twinkle.js
tests.push({ name: 'select2.min.js', test: true }); // https://github.com/Xi-Plus/twinkle/blob/master/select2.min.js - select2.min.js
tests.push({ name: 'modules/afch-config.js', test: true }); // https://github.com/Xi-Plus/twinkle/blob/master/modules/twinkleconfig.js - modules/twinkleconfig.js
	
tests.push({ name: 'modules/afch-submit.js', test: true }); 
	
tests.push({ name: 'modules/afch-clear.js', test: true }); 
	
tests.push({ name: 'modules/afch-speedy.js', test: true }); // https://github.com/Xi-Plus/twinkle/blob/master/modules/twinklespeedy.js - modules/twinklespeedy.js

mw.loader.using(['mediawiki.user', 'mediawiki.util', 'mediawiki.notify', 'mediawiki.Title', 'jquery.ui', 'jquery.tipsy', 'jquery.chosen']).done(function () {
	/**{{subst:void|**/ //}}
	mw.loader.load('https://raw.githubusercontent.com/sunny00217wm/AFCHFTW/zhwp/morebits.css&action=raw&ctype=text/css', 'text/css'); // https://github.com/Xi-Plus/twinkle/blob/master/morebits.css - morebits.css
	mw.loader.load('https://raw.githubusercontent.com/sunny00217wm/AFCHFTW/zhwp/select2.min.css&action=raw&ctype=text/css', 'text/css'); // https://github.com/Xi-Plus/twinkle/blob/master/select2.min.css - select2.min.css
	mw.loader.load('https://raw.githubusercontent.com/sunny00217wm/AFCHFTW/zhwp/afch.css&action=raw&ctype=text/css', 'text/css'); // https://github.com/Xi-Plus/twinkle/blob/master/twinkle.css - twinkle.css
	// use on github {{subst:void|
	/**}}
	**{{subst:void}}/
	mw.loader.load('https://zh.wikipedia.org/w/index.php?title=User:Sunny00217/AFCH/morebits.css&action=raw&ctype=text/css', 'text/css'); 
	mw.loader.load('https://zh.wikipedia.org/w/index.php?title=User:Sunny00217/AFCH/select2.min.css&action=raw&ctype=text/css', 'text/css'); 
	mw.loader.load('https://zh.wikipedia.org/w/index.php?title=User:Sunny00217/AFCH/afch.css&action=raw&ctype=text/css', 'text/css'); {{subst:void|**/ //}}

	var i = 0;
	// var finished = 0;
	var code = [];

	// all
	message('Loading AFCHFTW...');
	var promises = [];
	var done = function (x) {
		return function (data) {
			// finished++;
			// message('Loading AFCHFTW... (' + finished + '/' + tests.length + ')');
			code[x] = data;
		};
	};
	for (i = 0; i < tests.length; i++) {
		promises.push(load(tests[i]).done(done(i)));
	}
	$.when.apply($, promises).done(function () {
		localStorage.AFCHFTW_version = VERSION;
		eval(code.join('\n;\n'));
		message('AFCHFTW Done');
		if ($('#afch-config-titlebar').length) {
			$('#twinkle-config-titlebar').append('--版本：AFCHFTW ' + localStorage.AFCHFTW_version);
			$('#twinkle-config-titlebar').append('<button onclick="localStorage.AFCHFTW_version = \'\';location.reload();">清除快取</button>');
		}
	});
});

})();
