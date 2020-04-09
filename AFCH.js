/**
 * 基於 https://github.com/Xi-Plus/twinkle/tree/2247413ab1f2d6f02140d3cfbcf1208a11e909dd 亂搞的小工具
 * 最近更改請見 https://github.com/sunny00217wm/AFCH/commits/master
 **/

(function () {

var VERSION = '{{subst:#time:YmdHis}}';
var PREFIX = 'User:Sunny00217/AFCH/';
var rebuildcache = localStorage.AFCHFTW_version !== VERSION;
var tests = [];

var ajax = function (title) {
	return $.ajax({
		url: 'https://zh.wikipedia.org/w/index.php?title=User:Sunny00217/AFCH/' + title + '&action=raw&ctype=text/javascript',
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

tests.push({ name: 'module.js', test: true }); // https://github.com/Xi-Plus/twinkle/blob/master/morebits.js - morebits.js
tests.push({ name: 'main.js', test: true }); // https://github.com/Xi-Plus/twinkle/blob/master/twinkle.js - twinkle.js
tests.push({ name: 'select2.min.js', test: true }); // https://github.com/Xi-Plus/twinkle/blob/master/select2.min.js - select2.min.js
/**
tests.push({ name: 'modules/twinklearv.js', test: true });
tests.push({ name: 'modules/twinklewarn.js', test: true });
tests.push({ name: 'modules/friendlyshared.js', test: true });
tests.push({ name: 'modules/friendlytag.js', test: true });
tests.push({ name: 'modules/friendlytalkback.js', test: true });
tests.push({ name: 'modules/twinklebatchdelete.js', test: true });
tests.push({ name: 'modules/twinklebatchundelete.js', test: true });
tests.push({ name: 'modules/twinkleblock.js', test: true });
tests.push({ name: 'modules/twinkleclose.js', test: true });
tests.push({ name: 'modules/twinkleconfig.js', test: true });
tests.push({ name: 'modules/twinklecopyvio.js', test: true });
tests.push({ name: 'modules/twinkledelimages.js', test: true });
tests.push({ name: 'modules/twinklediff.js', test: true });
tests.push({ name: 'modules/twinklefluff.js', test: true });
tests.push({ name: 'modules/twinkleimage.js', test: true });
tests.push({ name: 'modules/twinkleprotect.js', test: true });
**/
tests.push({ name: 'modules/twinklespeedy.js', test: true }); // https://github.com/Xi-Plus/twinkle/blob/master/modules/twinklespeedy.js - modules/twinklespeedy.js
/**
tests.push({ name: 'modules/twinklestub.js', test: true });
tests.push({ name: 'modules/twinkleunlink.js', test: true });
tests.push({ name: 'modules/twinklexfd.js', test: true });
**/

mw.loader.using(['mediawiki.user', 'mediawiki.util', 'mediawiki.notify', 'mediawiki.Title', 'jquery.ui', 'jquery.tipsy', 'jquery.chosen']).done(function () {
	mw.loader.load('https://zh.wikipedia.org/w/index.php?title=User:Sunny00217/AFCH/module.css&action=raw&ctype=text/css', 'text/css'); // https://github.com/Xi-Plus/twinkle/blob/master/morebits.css - morebits.css
	mw.loader.load('https://zh.wikipedia.org/w/index.php?title=User:Sunny00217/AFCH/select2.min.css&action=raw&ctype=text/css', 'text/css'); // https://github.com/Xi-Plus/twinkle/blob/master/select2.min.css - select2.min.css
	mw.loader.load('https://zh.wikipedia.org/w/index.php?title=User:Sunny00217/AFCH/main.css&action=raw&ctype=text/css', 'text/css'); // https://github.com/Xi-Plus/twinkle/blob/master/twinkle.css - twinkle.css

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
