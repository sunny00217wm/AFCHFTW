//<nowiki>
AFCH.submit = function () {
	if (!AFCH.test('submit')) {
		return;
	}

	AFCH.addPortletLink(AFCH.submit.callback, AFCH.NameOfModule('submit'), 'afch-submit', wgULS('快速提交草稿', '快速提交草稿'));
};
 
AFCH.submit.callback = function (){
	var dialog;
	AFCH.clear.dialog = new AFCH.SimpleWindow(AFCH.windowclass('clear'));
	dialog = AFCH.clear.dialog;
	dialog.setTitle(wgULS('快速提交草稿', '快速提交草稿'));
	dialog.setScriptName('AFCH');
	dialog.addFooterLink('AFCH', 'Wikipedia:建立條目專題/協助腳本');
	var form = new AFCH.Morebits.quickForm(AFCH.submit.evaluate);
	
	form.append({ type: 'radio', name: 'submituser',
		list: [
			{
				label: wgULS('提交人：自己', '提交人：自己'),
				value: 'me'
			},
			{
				label: wgULS('提交人：页面创建者', '提交人：頁面建立者'),
				value: 'create'
			},
			{
				label: wgULS('提交人：其他用户', '提交人：其他用戶', '提交人：其他用户', '提交人：其他使用者'),
				value: 'other'
			}
		],
		event: AFCH.submit.changeTarget
	});

	form.append({
		type: 'field',
		label: '工作区',
		name: 'work_area'
	});

	var result = form.render();
	dialog.setContent(result);
	dialog.display();
	
	var evt = document.createEvent('Event');
	evt.initEvent('change', true, true);
	result.tbtarget[0].dispatchEvent(evt);
	/**
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
	**/
};

var submit_user = '';

AFCH.submit.changeTarget = function(e) {
	var value = e.target.values;
	var root = e.target.form;
	var old_area = AFCH.Morebits.quickForm.getElements(root, 'work_area')[0];

	if (root.submit_user) {
		submit_user = root.submit_user.value;
	}

	var work_area = new AFCH.Morebits.quickForm.element({
		type: 'field',
		label: wgULS('提交人信息', '提交人資訊'),
		name: 'work_area'
	});

	root.previewer.closePreview();

	if (value = 'other') {
		work_area.append({
			type: 'div',
			label: '',
			style: 'color: red',
			id: 'afch-submit-optout-message'
		});
		work_area.append({
			type: 'input',
			name: 'submit_user',
			label: wgULS('用户（必填）', '用戶（必填）', '用户（必填）', '使用者（必填）'),
			tooltip: wgULS('您代為提交的用户名，必填。', '您代為提交的用戶名，必填。', '您代為提交的用户名，必填。', '您代為提交的使用者名稱，必填。'),
			value: submit_user,
			required: true
		});
	}

	work_area = work_area.render();
	root.replaceChild(work_area, old_area);

	$('#afch-submit-optout-message').text(AFCH.submit.optout);
};
//https://github.com/Xi-Plus/twinkle/blob/master/modules/friendlytalkback.js#L293 +

// </nowiki>
