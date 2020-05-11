//<nowiki>
AFCH.clear = function () {
	if (!AFCH.test('clear')) {
		return;
	}

	AFCH.addPortletLink(AFCH.clear.callback, AFCH.NameOfModule('clear'), 'afch-clear', wgULS('快速提交草稿', '快速提交草稿'));
};
 
AFCH.clear.callback = function (){
	var dialog;
	AFCH.clear.dialog = new AFCH.SimpleWindow(AFCH.windowclass('clear'));
	dialog = AFCH.clear.dialog;
	dialog.setTitle(wgULS('进行维护清理', '進行維護清理'));
	dialog.setScriptName('AFCH');
	dialog.addFooterLink('AFCH', 'Wikipedia:建立條目專題/協助腳本');
	var form = new AFCH.Morebits.quickForm();
  	var result = form.render();
	var pageobj = AFCH.Wikipedia.api;
  
	var statelem = pageobj.getStatusElement();
  
	statelem.status(wgULS('检查页面是否需更改...', '檢查頁面是否需變更...'));

	AFCH.text = new AFCH.cleantext(pageobj.getPageText());
	
	if (AFCH.text.get) {
		if (AFCH.text.before == AFCH.text.after) {
			statelem.error(wgULS('清理结果前后相同，未更改。', '清理結果前後相同，未變更。'));
			return;
		}
		pageobj.setPageText();
		pageobj.setEditSummary('維護清理草稿[[:' + mw.config.get('wgPageName') + ']]');
    		//pageobj.setWatchlist(params.watch);
    		AFCH.Wikipedia.actionCompleted.notice = wgULS('清理完成', '清理完成') + '$diff';
	} else {
		statelem.error(wgULS('抓取页面内容失败。', '抓取頁面內容失敗。'));
	}
}
// </nowiki>
