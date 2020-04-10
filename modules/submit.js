(function($) {

AFCH.submit = function submit() {
	if (AFCH.test('submit') == 0) {
		return;
	}

	AFCH.addPortletLink(AFCH.submit.callback, AFCH.NameOfModule('submit'), 'afch-clear', wgULS('快速提交草稿', '快速提交草稿'));
};
  
AFCH.submit.callback = function submitCallback() {
	AFCH.submit.initDialog(AFCH.submit.initDialog.tosubmit);
};
  
AFCH.submit.callback.initDialog = function submitinitDialog (callbackfunc){
  var dialog;
  AFCH.clear.dialog = new Morebits.simpleWindow(AFCH.getPref('speedyWindowWidth'), AFCH.getPref('speedyWindowHeight'));
  dialog = AFCH.clear.dialog;
  dialog.setTitle(wgULS('进行维护清理', '進行維護清理'));
  dialog.setScriptName('AFCH');
  dialog.addFooterLink('AFCH', 'Wikipedia:建立條目專題/協助腳本');
  var form = new Morebits.quickForm(callbackfunc, AFCH.getPref('speedySelectionStyle') === 'radioClick' ? 'change' : null);
	
	var tagOptions = form.append({
		type: 'div',
		name: 'tag_options'
	});
  
  /**
  {
			name: 'submit_user',
			type: 'select',
			label: wgULS('适用类别：', '適用類別：'),
			list: wgULS([
				{ label: '请选择', value: '' },
				{ label: '标题繁简混用', value: '标题繁简混用。' },
				{ label: '消歧义使用的括号或空格错误', value: '消歧义使用的括号或空格错误。' },
				{ label: '间隔号使用错误', value: '间隔号使用错误。' },
				{ label: '标题中使用非常见的错别字', value: '标题中使用非常见的错别字。' },
				{ label: '移动侵权页面的临时页后所产生的重定向', subgroup: { {
        name: 'g16_pagename',
				type: 'input',
				label: wgULS('当前已提报侵犯著作权页面的名称：', '目前已提報侵犯著作權頁面的名稱：')
			} } }
			], [
				{ label: '請選擇', value: '' },
				{ label: '標題繁簡混用', value: '标题繁简混用。' },
				{ label: '消歧義使用的括號或空格錯誤', value: '消歧义使用的括号或空格错误。' },
				{ label: '間隔號使用錯誤', value: '间隔号使用错误。' },
				{ label: '標題中使用非常見的錯別字', value: '标题中使用非常见的错别字。' },
				{ label: '移動侵權頁面的臨時頁後所產生的重新導向', value: '移动侵权页面的临时页后所产生的重定向。' }
			])
		}
  **/
  var result = form.render();
  
  var statelem = pageobj.getStatusElement();
  
  statelem.status(wgULS('检查页面是否需更改...', '檢查頁面是否需變更...'));

  var text = pageobj.getPageText();
  if (text) {
    text = AFCH.clear(text);
    if (text == pageobj.getPageText()) {
      statelem.error(wgULS('清理结果前后相同，未更改。', '清理結果前後相同，未變更。'));
      return;
    }
    pageobj.setPageText(text);
    pageobj.setEditSummary('維護清理草稿[[:' + mw.config.get('wgPageName') + ']]' + AFCH.getPref('summaryAd'));
    pageobj.setWatchlist(params.watch);
    Morebits.wiki.actionCompleted.redirect = mw.config.get('wgPageName');
    Morebits.wiki.actionCompleted.notice = wgULS('清理完成', '清理完成');
  } else {
    statelem.error(wgULS('抓取页面内容失败。', '抓取頁面內容失敗。'));
  }
}
  
AFCH.submit.getParameters = function submitGetParameters(form, values) {
	var parameters = [];

	$.each(values, function(index, value) {
		var currentParams = [];
    if (value == 'submit_user') {
			var type = form['csd.r3_type'].value;
			if (!redirtype) {
				alert(wgULS('CSD R3：请选择适用类别。', 'CSD R3：請選擇適用類別。'));
				parameters = null;
				return false;
			}
			currentParams['1'] = redirtype;
		}
		if (form['csd.g8_pagename']) {
				var draft_page = form['csd.g8_pagename'].value;
				if (!draft_page || !draft_page.trim()) {
					alert(wgULS('CSD G8：请提供现有草稿的名称。\n提示：本功能仅用于因移动请求而删除页面，若要使用其他理由请用AFCH的自订理由。', 'CSD G8：請提供現有草稿的名稱。\n提示：本功能僅用於因移動請求而刪除頁面，若要使用其他理由請用AFCH的自訂理由。'));
					parameters = null;
					return false;
				}
				currentParams.pagename = draft_page;
			}
		parameters.push(currentParams);
	});
	return parameters;
};

  
})(jQuery);


// </nowiki>
