/**
 * vim: set noet sts=0 sw=8:
 * +-------------------------------------------------------------------------+
 * |                       === 警告：全局小工具文件 ===                      |
 * |                      对此文件的修改会影响许多用户。                     |
 * |                           修改前请联系维护者。                          |
 * +-------------------------------------------------------------------------+
 *
 * 从Github导入[https://github.com/sunny00217wm/AFCHFTW]
 * 基於 [https://github.com/Xi-Plus/twinkle] 的修改
 *
 * ----------
 *
 * 这是经过亂改的Twinkle，但本質並非Twinkle，而是被改成[[WP:AFCH]]的另一版本
 *
 * 维护者：~~~
 */
// <nowiki>

/* global Morebits */

(function (window, document, $) { // Wrap with anonymous function

/**
不認為有必要
if (!Morebits.userIsInGroup('autoconfirmed') && !Morebits.userIsInGroup('confirmed')) {
	return;
}
**/

var AFCH = {};

window.AFCH = AFCH;

AFCH.LoadFromTW = {};

AFCH.LoadFromTWTest =  function TestLoadTW(module, modulename) {
	if (Twinkle[module] !== undefined){
		AFCH.LoadFromTW[module] = true
	}
	AFCH.LoadFromTW[module] = false
};

AFCH.LoadFromTWTest(Twinkle.getPref, 'getPref')
AFCH.LoadFromTWTest(Twinkle.getPref['configPage'], 'ConfigPageOfTW')
AFCH.LoadFromTWTest(Twinkle.speedy.callback, 'speedymodule')
	
AFCH.defaultConfig = {};

AFCH.defaultConfig = {
	// General
	summaryAd: ' ([[WP:AFCH|AFCH]])',
	userTalkPageMode: 'tab',
	dialogLargeFont: false,
	disabledModules: [],

	// CSD
	speedySelectionStyle: 'buttonClick',
	watchSpeedyPages: [ ],
	markSpeedyPagesAsPatrolled: true,
	ConfigPageOfTW: 'Wikipedia:Twinkle/参数设置',

	// these next two should probably be identical by default
	notifyUserOnSpeedyDeletionNomination: [ 'db', 'g1', 'g2', 'g3', 'g5', 'g11', 'g16' ],
	welcomeUserOnSpeedyDeletionNotification: [ 'db', 'g1', 'g2', 'g3', 'g5', 'g11', 'g16' ],
	promptForSpeedyDeletionSummary: [],
	openUserTalkPageOnSpeedyDelete: [ ],
	deleteTalkPageOnDelete: true,
	deleteRedirectsOnDelete: true,
	deleteSysopDefaultToDelete: false,
	speedyWindowHeight: 500,
	speedyWindowWidth: 800,
	logSpeedyNominations: false,
	speedyLogPageName: 'CSD日志',
	noLogOnSpeedyNomination: [ 'o1' ],
	enlargeG11Input: false,

	// Hidden preferences
	revertMaxRevisions: 50,
	batchMax: 5000,
	batchdeleteChunks: 50,
	batchProtectChunks: 50,
	batchundeleteChunks: 50,
	proddeleteChunks: 50,
	revisionTags: '',
	ConfigPage: 'User:Sun00217/沙盒/AFCHSETTING',
	
	projectNamespaceName: mw.config.get('wgFormattedNamespaces')[4],
	sandboxPage: 'Wikipedia:沙盒',
};
	
AFCH.getPref = function twinkleGetPref(name) {
	//要是可以讀到TW的ConfigPage就直接回傳
	if (name == 'ConfigPageOfTW') {
		if (AFCH.LoadFromTW['ConfigPageOfTW']){
			return Twinkle.getPref['configPage']
		}
	}
	
	if (typeof AFCH.prefs === 'object' && AFCH.prefs[name] !== undefined) {
		return AFCH.prefs[name];
	}
	
	if (AFCH.LoadFromTW['getPref']) {
		if (typeof Twinkle.prefs === 'object' && Twinkle.prefs[name] !== undefined) {
			return Twinkle.prefs[name];
		}
		
		if (typeof window.TwinkleConfig === 'object' && window.TwinkleConfig[name] !== undefined) {
			return window.TwinkleConfig[name];
		}
		/**
		if (typeof window.FriendlyConfig === 'object' && window.FriendlyConfig[name] !== undefined) {
			return window.FriendlyConfig[name];
		}
		**/
	}
	return AFCH.defaultConfig[name];
};
	
var afchModules = [
	'clear',
	//附帶功能：速刪
	'speedy',
];
	
AFCH.NameOfModule = function (module) {
	switch (module) {
		case 'clear' :
			return wgULS('维护清理', '維護清理');
			break;
		case 'speedy' :
			return wgULS('速删', '速刪');
			break;
		case 'submit' :
			return wgULS('提交草稿', '提交草稿');
			break;
	}
}
	
AFCH.test = function (module) {
	var test = AFCH.tests
	switch (module) {
		case 'clear' :
			return (test.IsActionActions && test.IsDraft && AFCH.tests.IsJoinUser && AFCH.tests.findAFCTemplate);
			break;
		case 'speedy' :
			return (test.IsActionActions && test.IsDraft && AFCH.tests.IsJoinUser);
			break;
		case 'submit' :
			return (test.IsActionActions && test.IsDraft && !AFCH.tests.findAFCTemplate);
			break;
	}
}
	
AFCH.makeLinkElementToPage = function ( pagename, displayTitle, newTab ) {
	var actualTitle = pagename.replace( /_/g, ' ' );

	newTab = ( typeof newTab === 'undefined' ) ? true : newTab;

	return $( '<a>' )
		.attr( 'href', mw.util.getUrl( actualTitle ) )
		.attr( 'id', 'afch-cat-link-' + pagename.toLowerCase().replace( / /g, '-' ).replace( /\//g, '-' ) )
		.attr( 'title', actualTitle )
		.text( displayTitle || actualTitle )
		.attr( 'target', newTab ? '_blank' : '_self' );
}
	
AFCH.norighterror = function (module) {
	if (mw.config.get('wgPageName') == AFCH.getPref('ConfigPage')) {
		return;
	}
	mw.notify(
		$( '<div>' )
			.append( wgULS('AFHC的模块', 'AFHC的模組') + module + wgULS_U('无法加载，因为用户“', '無法載入，因為用戶「', '無法載入，因為使用者「') + mw.config.get('wgUserName') + wgULS('”没有列在','」沒有列在') )
			.append( AFCH.makeLinkElementToPage( 'Wikipedia:建立條目專題/參與者' ) )
			.append( wgULS('中。\n您可以在那里申请使用AFC辅助脚本的进阶权限。','中。\n您可以在那裡申請使用AFC輔助腳本的進階權限。') )
			.append( $( '<span>' )
				.append( wgULS('如要禁用此模块，请前往','如要禁用此模組，請前往')
				.append( AFCH.makeLinkElementToPage( AFCH.getPref('ConfigPage'), wgULS('此脚本的参数设置页', '此腳本的偏好設定頁') ) )
				.append( wgULS('将模块','將模組') + module +  wgULS('关闭。','關閉。') ); )
			.append( wgULS('如果您有任何问题或疑虑，请在','如果您有任何問題或疑慮，請在') )
			.append( AFCH.makeLinkElementToPage( 'WT:AFC', wgULS('寻求帮助','尋求幫助') ) )
			.append( '!' ),
		{
			title: wgULS_U('AFCH错误：用户不在允许列表中却啟用了进阶功能', 'AFCH錯誤：用戶不在允許列表中卻啟用了進階功能', 'AFCH錯誤：使用者不在允許列表中卻啟用了進階功能') + module + '！！！',
			autoHide: false
		}
	);
}

AFCH.tests = {}

AFCH.tests.IsActionActions = function () {
	if (mw.config.get('wgAction') == 'view' && mw.config.get('wgArticleId') && mw.config.get('wgRevisionId') == mw.config.get('wgCurRevisionId')){
		return true;
	}
	return false;
}
	
AFCH.tests.IsDraft = function () {
	if (mw.config.get('wgNamespaceNumber') == 2 && mw.config.get('wgPageContentModel') == "wikitext" || mw.config.get('wgNamespaceNumber') == 118){
		return true;
	}
	return false;
}

AFCH.tests.IsJoinUser = function (module) {
	var html = AFCH.getPageHtml('Wikipedia:建立條目專題/參與者');
	if (!html) {
		console.info( 'AFCH error: Could\'n get html from "Wikipedia:建立條目專題/參與者". Only could using basic skills.');
		mw.notify(wgULS('未能抓取页面“', '未能抓取頁面「') + AFCH.makeLinkElementToPage( 'Wikipedia:建立條目專題/參與者' ) + wgULS('”的内容。将带入基本功能。', '」的內容。將帶入基本功能。'));
		return false;
	}
	
	var find_user = html.match( new RegExp( `<a href="\\/wiki\\/(User:|User_talk:|Special:%E7%94%A8%E6%88%B7%E8%B4%A1%E7%8C%AE\\/)${ mw.util.wikiUrlencode(mw.config.get('wgUserName')) }"`, 'gi' ) )
	if (find_user){
		return true;
	}
	return false;
}
	
AFCH.tests.findAFCNewTemplate = function (module) {
	if (!AFCH.tests.IsDraft) {
		return;
	}
	var html = AFCH.getPageHtml(mw.config.get('wgPageName'));
	if (!html) {
		console.info( 'AFCH error: Could\'n get html from "' + mw.config.get('wgPageName') + '".');
		return;
	}
	if (AFCH.matchtemplate.new(html) !== ''){
		return true;
	}
	return false;
}

AFCH.cleartext = function ( title, post ) {
	var text = AFCH.getPageText(title),
	html = AFCH.getPageHtml(title),
    commentRegex,
	commentsToRemove = [
		'请不要移除这一行代码',
		'請勿刪除此行，並由下一行開始編輯',
		'請勿任意刪除以上代碼，並由下一行開始編輯',
		'Please leave this line alone!',
		'Important, do not remove this line before (template|article) has been created.',
		'Just press the "Save page" button below without changing anything! Doing so will submit your article submission for review. ' + 'Once you have saved this page you will find a new yellow \'Review waiting\' box at the bottom of your submission page. ' + 'If you have submitted your page previously,(?: either)? the old pink \'Submission declined\' template or the old grey ' + '\'Draft\' template will still appear at the top of your submission page, but you should ignore (them|it). Again, please ' + 'don\'t change anything in this text box. Just press the \"Save page\" button below.'
		];
	commentRegex = new RegExp( '<!-{2,}\\s*(' + commentsToRemove.join( '|' ) + ')\\s*-{2,}>', 'gi' );
	text = text.replace( commentRegex, '' )
		.replace( "'''此处改为条目主题'''是一个", '' )
		//.replace( /== Request review at \[\[WP:AFC\]\] ==/gi, '' )
		// Remove sandbox templates
		.replace( /\{\{(userspacedraft|userspace draft|user sandbox|用戶沙盒|用户沙盒|draft copyvio|七日草稿|7D draft|Draft|草稿|Please leave this line alone \(sandbox heading\))(?:\{\{[^{}]*\}\}|[^}{])*\}\}/ig, '' )
		// Remove spaces/commas between <ref> tags
		.replace( /\s*(<\/\s*ref\s*\>)\s*[,]*\s*(<\s*ref\s*(name\s*=|group\s*=)*\s*[^\/]*>)[ \t]*$/gim, '$1$2' )
		// Remove whitespace before <ref> tags
		.replace( /[ \t]*(<\s*ref\s*(name\s*=|group\s*=)*\s*.*[^\/]+>)[ \t]*$/gim, '$1' )
		// Move punctuation before <ref> tags
		.replace( /\s*((<\s*ref\s*(name\s*=|group\s*=)*\s*.*[\/]{1}>)|(<\s*ref\s*(name\s*=|group\s*=)*\s*[^\/]*>(?:<[^<\>]*\>|[^><])*<\/\s*ref\s*\>))[ \t]*([.!?,;:])+$/gim, '$6$1' )
		// Replace {' + '{http://example.com/foo}' + '} with "* http://example.com/foo" (common newbie error)
		.replace( /\n\{\{(http[s]?|ftp[s]?|irc|gopher|telnet)\:\/\/(.*?)\}\}/gi, '\n* [$1://$3 $1://$3]' )
		.replace( /<(\/|)[Bb][Rr](\/|)>/, '<br />' )
		.replace( /<(\/|)[Hh][Rr](\/|)>/, '<hr />' )
		.replace( /\n\n\n\n/, '\n\n\n\n' )
		.replace( /\n\n\n\n/, '\n\n\n\n' )
		.replace( /\[\[([Cc]at|CAT|[Cc]ategory|CATEGORY|分[类類]):/gi, '[[:Category:' )
		.replace( /\[\[([Cc]at|CAT|[Cc]ategory|CATEGORY|分[类類]):/gi, '[[:Category:' )
		.replace( /\[\[([Cc]at|CAT|[Cc]ategory|CATEGORY|分[类類]):/gi, '[[:Category:' )
		.replace(/\[\[:([Cc]at|CAT|[Cc]ategory|CATEGORY|分[类類]):使用创建条目精灵建立的页面\]\]/,'')
		.replace(/\[\[:([Cc]at|CAT|[Cc]ategory|CATEGORY|分[类類]):用条目向导创建的草稿\]\]/,'')
		// Remove html comments (<!--) that surround categories
		.replace( /<!--\s*((\[\[:(Category:.*?)\]\])+)\s*-->/gi, '$1' );
	var cagetory = {}
	cagetory.link = text.match( /\[\[:Category:(.*)\]\]/ )
	cagetory.box = text.match( /{{AFC_submission\/CategoryBox\n(.*)}}/ )
	cagetory.inbox = cagetory.box[1].match( /\|(.*)(\n){0,1}/ )
	var cagetories = ''
	if ( post ) {
		for ( var i=1, cagetory.link[i] !== null, i++ ) {
			cagetories += '[[Category:' + cagetory[i] + ']]\n'
		}
		for ( var i=1, cagetory.inbox[i] !== null, i++ ) {
			cagetories += '[[Category:' + cagetory[i] + ']]\n'
		}
	} else {
		cagetories = '{{AFC submission/CategoryBox\n'
		for ( var i=1, cagetory.link[i] !== null, i++ ) {
			cagetories += '|' + cagetory[i] + '\n'
		}
		for ( var i=1, cagetory.inbox[i] !== null, i++ ) {
			cagetories += '|' + cagetory[i] + '\n'
		}
		cagetories += '}}'
	}
	text = text.replace( /\[\[:Category:(.*)\]\]/, '' )
		.replace( /{{AFC_submission\/CategoryBox\n(.*)}}/, '' );
	
			
	// Convert http://-style links to other wikipages to wikicode syntax
	// FIXME: Break this out into its own core function? Will it be used elsewhere?
	function convertExternalLinksToWikilinks( text ) {
		var linkRegex = /\[{1,2}(?:https?:)?\/\/(?:zh.wikipedia.org\/(wiki|zh|zh-hans|zh-hant|zh-cn|zh-my|zh-sg|zh-tw|zh-hk|zh-mo)\/|zhwp.org\/((wiki|zh|zh-hans|zh-hant|zh-cn|zh-my|zh-sg|zh-tw|zh-hk|zh-mo)\/|(?!w)))([^\s\|\]\[]+)(?:\s|\|)?((?:\[\[[^\[\]]*\]\]|[^\]\[])*)\]{1,2}/ig,
			linkMatch = linkRegex.exec( text ),
			title, displayTitle, newLink;

		while ( linkMatch ) {
			title = decodeURI( linkMatch[ 4 ] ).replace( /_/g, ' ' );
			displayTitle = decodeURI( linkMatch[ 5 ] ).replace( /_/g, ' ' );

				// Don't include the displayTitle if it is equal to the title
			if ( displayTitle && title !== displayTitle ) {
				newLink = '[[' + title + '|' + displayTitle + ']]';
			} else {
				newLink = '[[' + title + ']]';
			}

			text = text.replace( linkMatch[ 0 ], newLink );
			linkMatch = linkRegex.exec( text );
		}

		return text;
	}
	text = convertExternalLinksToWikilinks( text );
	text = text
		.replace( /(?:[\t ]*(?:\r?\n|\r)){3,}/ig, '\n\n' )
		.replace( /^\s*/, '' )
		.replace( /{{AFC_submission\|(.*)}}/, '' )
		.replace( /{{AFC_comment\|(.*)}}/, '' )
		.replace( '<hr />', '' )
		.replace( /\n\n/, '\n' )
		.replace( /\n\n/, '\n' );
	if ( !post ){
		text = AFCH.matchtemplate.pending(html) + AFCH.matchtemplate.declined(html) + AFCH.matchtemplate.comment(html) + '<!-- 請勿任意刪除以上代碼，並由下一行開始編輯 -->\n' + text + cagetories
	}
	return text;
}
	
AFCH.matchtemplate = {}
	
AFCH.matchtemplate.pending = function (html) {
	var data = html.match(/<template:Template:AFC_submission>\|(.*)<\/template>/ );
						//<template:Template:AFC_submission>| ...  </template>
						//{{AFC_submission||...}}
	if (data[1]){
		var wt = data[1] + '\n';
	}
	return wt || ''
}

AFCH.matchtemplate.new = AFCH.matchtemplate.pending
	
AFCH.matchtemplate.declined = function (html) {
	var data = html.match(/<template:Template:AFC_submission>d\|(.*)<\/template>/ );
						//<template:Template:AFC_submission>d| ...  </template>
						//{{AFC_submission|d|...}}
	var wt = '';
	for ( var i=1, data[i] !== null, i++ ) {
		wt += data[i].replace( '&lt;', '<' ).replace( '&gt;', '>' ) + '\n';
	}
	return wt
}
	
AFCH.matchtemplate.comment = function (html) {
	var data = html.match(/<template:Template:AFC_comment>1=(.*)<\/template>/ );
						//<template:Template:AFC_comment>1= ...  </template>
						//{{AFC_comment|1=...}}
	var wt = '';
	for ( var i=1, data[i] !== null, i++ ) {
		wt += data[i].replace( '&lt;', '<' ).replace( '&gt;', '>' ) + '\n';
	}
	if ( wt !== '' ) {
		wt += '<hr />'
	}
	return wt;
}

AFCH.initCallbacks = [];
AFCH.addInitCallback = function twinkleAddInitCallback(func) {
	AFCH.initCallbacks.push(func);
};

// now some skin dependent config.
switch (mw.config.get('skin')) {
	case 'vector':
		AFCH.defaultConfig.portletArea = 'right-navigation';
		AFCH.defaultConfig.portletId = 'p-afch';
		AFCH.defaultConfig.portletName = 'AFCH';
		AFCH.defaultConfig.portletType = 'menu';
		AFCH.defaultConfig.portletNext = 'p-search';
		break;
	case 'timeless':
		AFCH.defaultConfig.portletArea = '#page-tools .sidebar-inner';
		AFCH.defaultConfig.portletId = 'p-twinkle';
		AFCH.defaultConfig.portletName = 'AFCH';
		AFCH.defaultConfig.portletType = null;
		AFCH.defaultConfig.portletNext = 'p-userpagetools';
		break;
	default:
		AFCH.defaultConfig.portletArea = null;
		AFCH.defaultConfig.portletId = 'p-cactions';
		AFCH.defaultConfig.portletName = null;
		AFCH.defaultConfig.portletType = null;
		AFCH.defaultConfig.portletNext = null;
}

/**
 * **************** AFCH.addPortlet() ****************
 *
 * Adds a portlet menu to one of the navigation areas on the page.
 * This is necessarily quite a hack since skins, navigation areas, and
 * portlet menu types all work slightly different.
 *
 * Available navigation areas depend on the skin used.
 * Monobook:
 *  "column-one", outer div class "portlet", inner div class "pBody". Existing portlets: "p-cactions", "p-personal", "p-logo", "p-navigation", "p-search", "p-interaction", "p-tb", "p-coll-print_export"
 *  Special layout of p-cactions and p-personal through specialized styles.
 * Vector:
 *  "mw-panel", outer div class "portal", inner div class "body". Existing portlets/elements: "p-logo", "p-navigation", "p-interaction", "p-tb", "p-coll-print_export"
 *  "left-navigation", outer div class "vectorTabs" or "vectorMenu", inner div class "" or "menu". Existing portlets: "p-namespaces", "p-variants" (menu)
 *  "right-navigation", outer div class "vectorTabs" or "vectorMenu", inner div class "" or "menu". Existing portlets: "p-views", "p-cactions" (menu), "p-search"
 *  Special layout of p-personal portlet (part of "head") through specialized styles.
 * Modern:
 *  "mw_contentwrapper" (top nav), outer div class "portlet", inner div class "pBody". Existing portlets or elements: "p-cactions", "mw_content"
 *  "mw_portlets" (sidebar), outer div class "portlet", inner div class "pBody". Existing portlets: "p-navigation", "p-search", "p-interaction", "p-tb", "p-coll-print_export"
 *
 * @param String navigation -- id of the target navigation area (skin dependant, on vector either of "left-navigation", "right-navigation", or "mw-panel")
 * @param String id -- id of the portlet menu to create, preferably start with "p-".
 * @param String text -- name of the portlet menu to create. Visibility depends on the class used.
 * @param String type -- type of portlet. Currently only used for the vector non-sidebar portlets, pass "menu" to make this portlet a drop down menu.
 * @param Node nextnodeid -- the id of the node before which the new item should be added, should be another item in the same list, or undefined to place it at the end.
 *
 * @return Node -- the DOM node of the new item (a DIV element) or null
 */
AFCH.addPortlet = function(navigation, id, text, type, nextnodeid) {
	// sanity checks, and get required DOM nodes
	var root = document.getElementById(navigation) || document.querySelector(navigation);
	if (!root) {
		return null;
	}

	var item = document.getElementById(id);
	if (item) {
		if (item.parentNode && item.parentNode === root) {
			return item;
		}
		return null;
	}

	var nextnode;
	if (nextnodeid) {
		nextnode = document.getElementById(nextnodeid);
	}

	// verify/normalize input
	var skin = mw.config.get('skin');
	if (skin !== 'vector' || (navigation !== 'left-navigation' && navigation !== 'right-navigation')) {
		type = null; // menu supported only in vector's #left-navigation & #right-navigation
	}
	var outerDivClass, innerDivClass;
	switch (skin) {
		case 'vector':
			// XXX: portal doesn't work
			if (navigation !== 'portal' && navigation !== 'left-navigation' && navigation !== 'right-navigation') {
				navigation = 'mw-panel';
			}
			outerDivClass = navigation === 'mw-panel' ? 'portal' : type === 'menu' ? 'vectorMenu' : 'vectorTabs';
			break;
		case 'modern':
			if (navigation !== 'mw_portlets' && navigation !== 'mw_contentwrapper') {
				navigation = 'mw_portlets';
			}
			outerDivClass = 'portlet';
			break;
		case 'timeless':
			outerDivClass = 'mw-portlet';
			innerDivClass = 'mw-portlet-body';
			break;
		default:
			navigation = 'column-one';
			outerDivClass = 'portlet';
			break;
	}

	// Build the DOM elements.
	var outerDiv = document.createElement('div');
	outerDiv.setAttribute('role', 'navigation');
	outerDiv.setAttribute('aria-labelledby', id + '-label');
	outerDiv.className = outerDivClass + ' emptyPortlet';
	outerDiv.id = id;
	if (nextnode && nextnode.parentNode === root) {
		root.insertBefore(outerDiv, nextnode);
	} else {
		root.appendChild(outerDiv);
	}

	var h5 = document.createElement('h3');
	h5.id = id + '-label';
	var ul = document.createElement('ul');

	if (outerDivClass === 'vectorMenu') {

		// add invisible checkbox to keep menu open when clicked
		// similar to the p-cactions ("More") menu
		var chkbox = document.createElement('input');
		chkbox.className = 'vectorMenuCheckbox';
		chkbox.setAttribute('type', 'checkbox');
		chkbox.setAttribute('aria-labelledby', id + '-label');
		outerDiv.appendChild(chkbox);

		var span = document.createElement('span');
		span.appendChild(document.createTextNode(text));
		h5.appendChild(span);

		var a = document.createElement('a');
		a.href = '#';

		$(a).click(function(e) {
			e.preventDefault();
		});

		h5.appendChild(a);
		outerDiv.appendChild(h5);

		ul.className = 'menu';
		outerDiv.appendChild(ul);

	} else {

		h5.appendChild(document.createTextNode(text));
		outerDiv.appendChild(h5);
		if (innerDivClass) {
			var innerDiv = document.createElement('div');
			innerDiv.className = innerDivClass;
			innerDiv.appendChild(ul);
			outerDiv.appendChild(innerDiv);
		} else {
			outerDiv.appendChild(ul);
		}

	}

	return outerDiv;

};


/**
 * **************** AFCH.addPortletLink() ****************
 * Builds a portlet menu if it doesn't exist yet, and add the portlet link.
 * @param task: Either a URL for the portlet link or a function to execute.
 */
AFCH.addPortletLink = function(task, text, id, tooltip) {
	if (AFCH.getPref('portletArea') !== null) {
		AFCH.addPortlet(AFCH.getPref('portletArea'), AFCH.getPref('portletId'), AFCH.getPref('portletName'), AFCH.getPref('portletType'), AFCH.getPref('portletNext'));
	}
	var link = mw.util.addPortletLink(AFCH.getPref('portletId'), typeof task === 'string' ? task : '#', text, id, tooltip);
	$('.client-js .skin-vector #p-cactions').css('margin-right', 'initial');
	if ($.isFunction(task)) {
		$(link).click(function (ev) {
			task();
			ev.preventDefault();
		});
	}
	if ($.collapsibleTabs) {
		$.collapsibleTabs.handleResize();
	}
	return link;
};


/**
 * **************** General initialization code ****************
 */

var scriptpathbefore = mw.util.wikiScript('index') + '?title=',
	scriptpathafter = '&action=raw&ctype=text/javascript&happy=yes';

// Retrieve the user's Twinkle preferences
$.ajax({
	url: scriptpathbefore + 'User:' + encodeURIComponent(mw.config.get('wgUserName')) + '/afchoptions.js' + scriptpathafter,
	dataType: 'text'
})
	.fail(function () {
		mw.notify('未能加载afchoptions.js');
	})
	.done(function (optionsText) {

		// Quick pass if user has no options
		if (optionsText === '') {
			return;
		}

		// Twinkle options are basically a JSON object with some comments. Strip those:
		optionsText = optionsText.replace(/(?:^(?:\/\/[^\n]*\n)*\n*|(?:\/\/[^\n]*(?:\n|$))*$)/g, '');

		// First version of options had some boilerplate code to make it eval-able -- strip that too. This part may become obsolete down the line.
		if (optionsText.lastIndexOf('window.Twinkle.prefs = ', 0) === 0) {
			optionsText = optionsText.replace(/(?:^window.AFCH.prefs = |;\n*$)/g, '');
		}

		try {
			var options = JSON.parse(optionsText);
			if (options) {
				if (options.twinkle || options.friendly) { // Old preferences format
					AFCH.prefs = $.extend(options.twinkle, options.friendly);
				} else {
					AFCH.prefs = options;
				}
				// v2 established after unification of Twinkle/Friendly objects
				AFCH.prefs.optionsVersion = AFCH.prefs.optionsVersion || 1;
			}
		} catch (e) {
			mw.notify('未能解析afchoptions.js');
		}
	})
	.always(function () {
		$(AFCH.load);
	});

// Developers: you can import custom Twinkle modules here
// For example, mw.loader.load(scriptpathbefore + "User:UncleDouggie/morebits-test.js" + scriptpathafter);

AFCH.load = function () {
	// Don't activate on special pages other than those on the whitelist so that
	// they load faster, especially the watchlist.
	var specialPageWhitelist = [ 'Block', 'Contributions', 'AbuseLog', 'Recentchanges', 'Recentchangeslinked' ]; // wgRelevantUserName defined for non-sysops on Special:Block
	if (Morebits.userIsSysop) {
		specialPageWhitelist = specialPageWhitelist.concat([ 'DeletedContributions', 'Prefixindex', 'BrokenRedirects' ]);
	}
	if (mw.config.get('wgNamespaceNumber') === -1 &&
		specialPageWhitelist.indexOf(mw.config.get('wgCanonicalSpecialPageName')) === -1) {
		return;//
	}

	// Prevent clickjacking
	if (window.top !== window.self) {
		return;
	}

	// Set custom Api-User-Agent header, for server-side logging purposes
	Morebits.wiki.api.setApiUserAgent('AFCH~zh~/2.0 (' + mw.config.get('wgDBname') + ')');

	// Load all the modules in the order that the tabs should appear
	var disabledModules = AFCH.getPref('disabledModules').concat();
	afchModules.filter(function(mod) {
		return disabledModules.indexOf(mod) === -1;
	}).forEach(function(module) {
		var test = AFCH.tests
		if (test.IsDraft && test.IsActionActions) {
			if (AFCH.test(module)){
				AFCH[module]();
			} else if (!test.IsJoinUser) {
				AFCH.norighterror(AFCH.NameOfModule(module))
			}
		}
	});

	AFCH.config.init(); // Can't turn off

	AFCH.addPortletLink(mw.util.wikiScript('index') + '?title=' + AFCH.getPref('configPage'), wgULS('设置', '設定'), 'afch-config', wgULS('设置AFCH参数', '設定AFCH參數'));

	// Run the initialization callbacks for any custom modules
	AFCH.initCallbacks.forEach(function (func) {
		func();
	});
	AFCH.addInitCallback = function (func) {
		func();
	};

	// Increases text size in Twinkle dialogs, if so configured
	if (AFCH.getPref('dialogLargeFont')) {
		mw.util.addCSS('.morebits-dialog-content, .morebits-dialog-footerlinks { font-size: 100% !important; } ' +
			'.morebits-dialog input, .morebits-dialog select, .morebits-dialog-content button { font-size: inherit !important; }');
	}
};

/** AFCH.getPageText / AFCH.getPageHtml **/
//https://github.com/WPAFC/afch-rewrite/blob/0594efad9d5337f6c1418509ad55e9fc3210fca1/src/modules/core.js#L513
AFCH.getPageText = function (pagename) {
	new mw.Api().get({
		action: 'query',
		prop: 'revisions',
		format: 'json',
		indexpageids: true,
		titles: (pagename || mw.config.get('wgPageName'))
	})
		.done( function ( data ) {
			var rev, id = data.query.pageids[ 0 ];
			if ( id && data.query.pages ) {
				// The page might not exist; resolve with an empty string
				if ( id === '-1' ) {
					console.error(`AFCH error:Title "${ pagename }" might not exist.
[type = AFCH.getPageText,
code = new mw.Api().get({
		action: 'query',
		prop: 'revisions',
		format: 'json',
		indexpageids: true,
		titles: '${ pagename }'
})
]`);
				}
				
				rev = data.query.pages[ id ].revisions[ 0 ];
				var text =  rev[ '*' ];
			} else if (data.error.info) {
				console.error(`AFCH error:Get a error which is "${ data.error.info }" while AFCH getting title "${ pagename }".
[type = AFCH.getPageText,
code = new mw.Api().get({
		action: 'query',
		prop: 'revisions',
		format: 'json',
		indexpageids: true,
		titles: '${ pagename }'
})
]`);
			} else {
				console.error( 'AFCH error: Get unknow error(While getting ' + pagename + ')');
				console.error(`AFCH error:Get a unknow error while AFCH getting title "${ pagename }".
[type = AFCH.getPageText,
code = new mw.Api().get({
		action: 'query',
		prop: 'revisions',
		format: 'json',
		indexpageids: true,
		titles: '${ pagename }'
})
]`);
			}
		} )
		.fail( function ( err ) {
			console.error(`AFCH error:Get a error which is "${ err }" while AFCH getting title "${ pagename }".
[type = AFCH.getPageText,
code = new mw.Api().get({
		action: 'query',
		prop: 'revisions',
		format: 'json',
		indexpageids: true,
		titles: '${ pagename }'
})
]`);
		} );

		if (text){
			return text
		} else {
			return null
		}
};
	
AFCH.getPageHtml = function (pagename) {
	new mw.Api().get({
		action: 'parse',
		format: 'json',
		titles: (pagename || mw.config.get('wgPageName')),
		prop: 'text|parsewarnings',
		wrapoutputclass: '',
		pst: '1',
		disablelimitreport: '1',
		disableeditsection: '1',
		disabletoc: '1'
	})
		.done( function ( data ) {
			var rev, id = data.parse.pageids[ 0 ];
			if ( id ) {
				// The page might not exist; resolve with an empty string
				if ( id === '-1' ) {
					console.error(`AFCH error:Title "${ pagename }" might not exist.
[type = AFCH.getPageHtml,
code = new mw.Api().get({
	action: 'parse',
	format: 'json',
	titles: ${ pagename },
	prop: 'text|parsewarnings',
	wrapoutputclass: '',
	pst: '1',
	disablelimitreport: '1',
	disableeditsection: '1',
	disabletoc: '1'
})
]`);
				}
				var html =  data.parse.text;
			} else if (data.parsewarnings[0]) {
				console.error(`AFCH error:Get a error which is "${ data.parsewarnings[0] }" while AFCH getting title "${ pagename }" html.
[type = AFCH.getPageHtml,
code = new mw.Api().get({
	action: 'parse',
	format: 'json',
	titles: ${ pagename },
	prop: 'text|parsewarnings',
	wrapoutputclass: '',
	pst: '1',
	disablelimitreport: '1',
	disableeditsection: '1',
	disabletoc: '1'
})
]`);
			} else {
console.error(`AFCH error:Get a unknow error while AFCH getting title "${ pagename }" html.
[type = AFCH.getPageHtml,
code = new mw.Api().get({
	action: 'parse',
	format: 'json',
	titles: ${ pagename },
	prop: 'text|parsewarnings',
	wrapoutputclass: '',
	pst: '1',
	disablelimitreport: '1',
	disableeditsection: '1',
	disabletoc: '1'
})
]`);
			}
		} )
		.fail( function ( err ) {
		console.error(`AFCH error:Get a error which is "${ err }" while AFCH getting title "${ pagename }" html.
[type = AFCH.getPageHtml,
code = new mw.Api().get({
	action: 'parse',
	format: 'json',
	titles: ${ pagename },
	prop: 'text|parsewarnings',
	wrapoutputclass: '',
	pst: '1',
	disablelimitreport: '1',
	disableeditsection: '1',
	disabletoc: '1'
})
]`);
		} );
		if (text){
			return decodeURI(html).replace( '&lt;', '<' ).replace( '&gt;', '>' )
		} else {
			return null
		}
};

}(window, document, jQuery)); // End wrap with anonymous function

// </nowiki>


