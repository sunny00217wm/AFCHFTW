(function($) {

AFCH.speedy = function speedy() {
	if (AFCH.test('clear') == 0) {
		return;
	}

	AFCH.addPortletLink(AFCH.clear.callback, wgULS('维护清理', '維護清理'), 'afch-clear', wgULS('进行维护清理', '進行維護清理'));
};
  
AFCH.clear.callback = function (){
  var dialog;
  AFCH.clear.dialog = new Morebits.simpleWindow(AFCH.getPref('speedyWindowWidth'), AFCH.getPref('speedyWindowHeight'));
  dialog = AFCH.clear.dialog;
  dialog.setTitle(wgULS('进行维护清理', '進行維護清理'));
  dialog.setScriptName('AFCH');
  dialog.addFooterLink('AFCH', 'Wikipedia:建立條目專題/協助腳本');
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
  
})(jQuery);


// </nowiki>
