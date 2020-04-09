/**
 * 半自動提交草稿 verson beta
 * 作者：Sunny00217
 * 點擊後自動提交草稿
 * 暫時只支援添加模板
 * [[User:Sunny00217/submitAFCdraft.js|穩定版本]]
**/
(function() {
	if ((mw.config.get('wgPageName').match(/^Draft:/)||mw.config.get('wgPageName').match(/^User:(.*)\//))
    	&& mw.config.get('wgAction') == 'view'
    	&& mw.config.get('wgRevisionId') == mw.config.get('wgCurRevisionId')
    ) {
		let link = mw.util.addPortletLink(
			'p-cactions',
			'#',
			'提交草稿（beta版）'
		);
		$(link).on('click', function() {
			this.remove();
			edit();
		});
    } else {
		return;
	}
	
	var getPageContent = new Promise(function(resolve, reject) {
        new mw.Api().get({
            action: 'query',
            prop: 'revisions',
            rvprop: ['content', 'timestamp'],
            titles: mw.config.get('wgPageName'),
            formatversion: '2',
            curtimestamp: true
        }).then(function(data) {
            var page, revision;
            if (!data.query || !data.query.pages) {
                mw.notify('未能抓取頁面內容（unknown）');
                reject('unknown');
            }
            page = data.query.pages[0];
            if (!page || page.invalid) {
                mw.notify('未能抓取頁面內容（invalidtitle）');
                reject('invalidtitle');
            }
            if (page.missing) {
                mw.notify('未能抓取頁面內容（nocreate-missing）');
                reject('nocreate-missing');
            }
            revision = page.revisions[0];
            var content = revision.content;
            var basetimestamp = revision.timestamp;
            var curtimestamp = data.curtimestamp;
            resolve({
                content: content,
                basetimestamp: basetimestamp,
                curtimestamp: curtimestamp
            });
        });
    });
    
    var clean = function ( newtext ) {
    	var text = newtext,
    		commentRegex,
			commentsToRemove = [
				'请不要移除这一行代码',
				'請勿刪除此行，並由下一行開始編輯',
				'Please leave this line alone!',
				'Important, do not remove this line before (template|article) has been created.',
				'Just press the "Save page" button below without changing anything! Doing so will submit your article submission for review. ' +
					'Once you have saved this page you will find a new yellow \'Review waiting\' box at the bottom of your submission page. ' +
					'If you have submitted your page previously,(?: either)? the old pink \'Submission declined\' template or the old grey ' +
					'\'Draft\' template will still appear at the top of your submission page, but you should ignore (them|it). Again, please ' +
					'don\'t change anything in this text box. Just press the \"Save page\" button below.'
			];
		commentRegex = new RegExp( '<!-{2,}\\s*(' + commentsToRemove.join( '|' ) + ')\\s*-{2,}>', 'gi' );
		text = text.replace( /\[\[([Cc]at|CAT|[Cc]ategory|CATEGORY|分[类類]):/gi, '[[:$1:' )
			.replace(/\[\[:([Cc]at|CAT|[Cc]ategory|CATEGORY|分[类類]):使用创建条目精灵建立的页面\]\]/,'')
			.replace( commentRegex, '' )
			//.replace( /== Request review at \[\[WP:AFC\]\] ==/gi, '' )
			// Remove sandbox templates
			.replace( /\{\{(userspacedraft|userspace draft|user sandbox|用戶沙盒|用户沙盒|draft copyvio|七日草稿|7D draft|Draft|草稿|Please leave this line alone \(sandbox heading\))(?:\{\{[^{}]*\}\}|[^}{])*\}\}/ig, '' )
			// Remove html comments (<!--) that surround categories
			.replace( /<!--\s*((\[\[:{0,1}(Category:.*?)\]\]\s*)+)-->/gi, '$1' )
			// Remove spaces/commas between <ref> tags
			.replace( /\s*(<\/\s*ref\s*\>)\s*[,]*\s*(<\s*ref\s*(name\s*=|group\s*=)*\s*[^\/]*>)[ \t]*$/gim, '$1$2' )
			// Remove whitespace before <ref> tags
			.replace( /[ \t]*(<\s*ref\s*(name\s*=|group\s*=)*\s*.*[^\/]+>)[ \t]*$/gim, '$1' )
			// Move punctuation before <ref> tags
			.replace( /\s*((<\s*ref\s*(name\s*=|group\s*=)*\s*.*[\/]{1}>)|(<\s*ref\s*(name\s*=|group\s*=)*\s*[^\/]*>(?:<[^<\>]*\>|[^><])*<\/\s*ref\s*\>))[ \t]*([.!?,;:])+$/gim, '$6$1' )
			// Replace {' + '{http://example.com/foo}' + '} with "* http://example.com/foo" (common newbie error)
			.replace( /\n\{\{(http[s]?|ftp[s]?|irc|gopher|telnet)\:\/\/(.*?)\}\}/gi, '\n* [$1://$3 $1://$3]' );

		// Convert http://-style links to other wikipages to wikicode syntax
		// FIXME: Break this out into its own core function? Will it be used elsewhere?
		function convertExternalLinksToWikilinks( text ) {
			var linkRegex = /\[{1,2}(?:https?:)?\/\/(?:zh.wikipedia.org\/(wiki|zh|zh-hans|zh-hant|zh-cn|zh-my|zh-sg|zh-tw|zh-hk|zh-mo)|zhwp.org)\/([^\s\|\]\[]+)(?:\s|\|)?((?:\[\[[^\[\]]*\]\]|[^\]\[])*)\]{1,2}/ig,
				linkMatch = linkRegex.exec( text ),
				title, displayTitle, newLink;

			while ( linkMatch ) {
				title = decodeURI( linkMatch[ 1 ] ).replace( /_/g, ' ' );
				displayTitle = decodeURI( linkMatch[ 2 ] ).replace( /_/g, ' ' );

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
			.replace(/{{[Aa]FC submission\|\|(.*)}}/,'')
			.replace(/{{[Aa]FC submission\|t\|(.*)}}/,'')
			.replace('<!-- 请不要移除这一行代码 -->)','')
			.replace( /(?:[\t ]*(?:\r?\n|\r)){3,}/ig, '\n\n' )
			.replace( /^\s*/, '' );
		return text;
    };
	
	function edit() {
		new mw.Api().edit(mw.config.get('wgPageName'), function(revision) {
            var newtext = revision.content;
            newtext = '{' + '{AFC submission|||u=' + mw.config.get('wgUserName') + '|ns=' + '{{subst:' + 'NAMESPACENUMBER}}' + '|ts=' + '{{subst:' + 'LOCALTIMESTAMP}}' + '}}\n' + clean(newtext);
            return {
                summary: '半自動提交草稿[[' + mw.config.get('wgPageName') + ']]（測試版） via [[User:Sunny00217/submitAFCdraft.js/beta.js]]',
				text: newtext,
				token: mw.user.tokens.get('csrfToken'),
				minor: true
            };
        }).then(function() {
			mw.notify('已提交');
        }, function(e) {
			if (e == 'editconflict') {
    			mw.notify('提交時發生編輯衝突');
			} else {
    			mw.notify('提交時發生未知錯誤：' + e);
    			}
        });
    }
    
})();
// </nowiki>