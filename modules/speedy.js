// <nowiki>
/**
 * 改自 https://github.com/Xi-Plus/twinkle/blob/9aff20e2388e9bea15aea7a8e02d3a37d36dd871/modules/speedy.js
 * 此版為方便使用
 * 若調的到TW的速刪模組則直接調
 * 不支援刪除
 * 要刪除請用TW
 * 僅包含草稿可以快速刪除的選項
 * 部分值若未偵測到設定則自動調用Twinkle設定
 **/
(function($) {

AFCH.speedy = function speedy() {
	if (AFCH.test('speedy') == 0) {
		return;
	}

	AFCH.addPortletLink(AFCH.speedy.callback, wgULS('速删', '速刪'), 'afch-csd', wgULS('请求快速删除', '請求快速刪除'));
};

// This function is run when the CSD tab/header link is clicked
AFCH.speedy.callback = function speedyCallback() {
	if (AFCH.LoadFromTW['speedymodule']){
		mw.notify('Try to call speedy module of TW ......');
		Twinkle.speedy.callback();
		return;
	}
	AFCH.speedy.initDialog(AFCH.speedy.callback.evaluateUser, true);
};

// Used by unlink feature
AFCH.speedy.dialog = null;

// The speedy criteria list can be in one of several modes
AFCH.speedy.mode = {
	userMultipleSubmit: 5,  // check boxes, subgroups, "Submit" button already pressent
	userMultipleRadioClick: 6,  // check boxes, subgroups, need to add a "Submit" button
	userSingleSubmit: 7,  // radio buttons, subgroups, submit when "Submit" button is clicked
	userSingleRadioClick: 8,  // radio buttons, subgroups, submit when a radio button is clicked

	// do we have a "Submit" button once the form is created?
	hasSubmitButton: function speedyModeHasSubmitButton(mode) {
		return mode === AFCH.speedy.mode.userMultipleSubmit ||
			mode === AFCH.speedy.mode.userMultipleRadioClick ||
			mode === AFCH.speedy.mode.userSingleSubmit;
	},
	// is db-multiple the outcome here?
	isMultiple: function speedyModeIsMultiple(mode) {
		return mode === AFCH.speedy.mode.userMultipleSubmit ||
			mode === AFCH.speedy.mode.userMultipleRadioClick;
	}
};

// Prepares the speedy deletion dialog and displays it
AFCH.speedy.initDialog = function speedyInitDialog(callbackfunc) {
	var dialog;
	AFCH.speedy.dialog = new Morebits.simpleWindow(AFCH.getPref('speedyWindowWidth'), AFCH.getPref('speedyWindowHeight'));
	dialog = AFCH.speedy.dialog;
	dialog.setTitle(wgULS('选择快速删除理由', '選擇快速刪除理由'));
	dialog.setScriptName('AFCH');
	dialog.addFooterLink(wgULS('快速删除方针', '快速刪除方針'), 'WP:CSD');
	dialog.addFooterLink('AFCH', 'Wikipedia:建立條目專題/協助腳本');

	var form = new Morebits.quickForm(callbackfunc, AFCH.getPref('speedySelectionStyle') === 'radioClick' ? 'change' : null);
	
	var tagOptions = form.append({
		type: 'div',
		name: 'tag_options'
	});

	tagOptions.append({
		type: 'checkbox',
		list: [
			{
				label: wgULS('如可能，通知创建者', '如可能，通知建立者'),
				value: 'notify',
				name: 'notify',
				tooltip: wgULS('一个通知模板将会被加入创建者的对话页，如果您启用了该理据的通知。', '一個通知模板將會被加入建立者的對話頁，如果您啟用了該理據的通知。'),
				event: function(event) {
					event.stopPropagation();
				}
			}
		]
	});
	tagOptions.append({
		type: 'checkbox',
		list: [
			{
				label: wgULS('应用多个理由', '應用多個理由'),
				value: 'multiple',
				name: 'multiple',
				tooltip: wgULS('您可选择应用于该页的多个理由。', '您可選擇應用於該頁的多個理由。'),
				event: function(event) {
					AFCH.speedy.callback.modeChanged(event.target.form);
					event.stopPropagation();
				}
			}
		]
	});
	tagOptions.append({
		type: 'checkbox',
		list: [
			{
				label: wgULS('清空页面', '清空頁面'),
				value: 'blank',
				name: 'blank',
				tooltip: wgULS('在标记模板前，先清空页面，适用于严重破坏或负面生者传记等。', '在標記模板前，先清空頁面，適用於嚴重破壞或負面生者傳記等。')
			}
		]
	});

	form.append({
		type: 'div',
		name: 'work_area',
		label: wgULS('初始化CSD模块失败，请重试，或将这报告给AFCHFTW开发者。', '初始化CSD模組失敗，請重試，或將這報告給AFCHFTW開發者。')
	});

	if (AFCH.getPref('speedySelectionStyle') !== 'radioClick') {
		form.append({ type: 'submit', className: 'tw-speedy-submit' }); // Renamed in modeChanged
	}

	var result = form.render();
	dialog.setContent(result);
	dialog.display();

	AFCH.speedy.callback.modeChanged(result);
};

AFCH.speedy.callback.getMode = function speedyCallbackGetMode(form) {
	var mode = AFCH.speedy.mode.userSingleSubmit;
	if (form.multiple.checked) {
		mode = AFCH.speedy.mode.userMultipleSubmit;
	} else {
		mode = AFCH.speedy.mode.userSingleSubmit;
	}
	if (AFCH.getPref('speedySelectionStyle') === 'radioClick') {
		mode++;
	}
	return mode;
};

AFCH.speedy.callback.modeChanged = function speedyCallbackModeChanged(form) {
	var namespace = mw.config.get('wgNamespaceNumber');

	// first figure out what mode we're in
	var mode = AFCH.speedy.callback.getMode(form);

	$('button.tw-speedy-submit').text(wgULS('标记页面', '標記頁面'));

	var work_area = new Morebits.quickForm.element({
		type: 'div',
		name: 'work_area'
	});

	if (mode === AFCH.speedy.mode.userMultipleRadioClick) {
		var evaluateType = 'evaluateUser';

		work_area.append({
			type: 'div',
			label: wgULS('当选择完成后，点击：', '當選擇完成後，點選：')
		});
		work_area.append({
			type: 'button',
			name: 'submit-multiple',
			label: wgULS('标记页面', '標記頁面'),
			event: function(event) {
				AFCH.speedy.callback[evaluateType](event);
				event.stopPropagation();
			}
		});
	}

	var radioOrCheckbox = AFCH.speedy.mode.isMultiple(mode) ? 'checkbox' : 'radio';

	if (!AFCH.speedy.mode.isMultiple(mode)) {
		work_area.append({ type: 'header', label: wgULS('自定义理由', '自訂理由') });
		work_area.append({ type: radioOrCheckbox, name: 'csd', list: AFCH.speedy.generateCsdList(AFCH.speedy.customRationale, mode) });
	}

	switch (namespace) {
		case 2:  // user
			work_area.append({ type: 'header', label: wgULS_U('用户页', '用戶頁', '使用者頁面') });
			work_area.append({ type: radioOrCheckbox, name: 'csd', list: AFCH.speedy.generateCsdList(AFCH.speedy.userList, mode) });
			break;
		case 118:  // draft
			work_area.append({ type: 'header', label: wgULS('草稿', '草稿') });
			work_area.append({ type: radioOrCheckbox, name: 'csd', list: AFCH.speedy.generateCsdList(AFCH.speedy.draftList, mode) });
			break;
		default:
			break;
	}
//AFCH
	// custom rationale lives under general criteria when tagging
	var generalCriteria = AFCH.speedy.generalList;
	if (true){
		generalCriteria = AFCH.speedy.customRationale.concat(generalCriteria);
	}
	work_area.append({ type: 'header', label: wgULS('常规', '常規') });
	work_area.append({ type: radioOrCheckbox, name: 'csd', list: AFCH.speedy.generateCsdList(generalCriteria, mode) });

	if (mw.config.get('wgIsRedirect')) {
		work_area.append({ type: 'header', label: wgULS('重定向','重新導向') });
		work_area.append({ type: radioOrCheckbox, name: 'csd', list: AFCH.speedy.generateCsdList(AFCH.speedy.redirectList, mode) });
	}

	var old_area = Morebits.quickForm.getElements(form, 'work_area')[0];
	form.replaceChild(work_area.render(), old_area);
};

AFCH.speedy.generateCsdList = function speedyGenerateCsdList(list, mode) {
	// mode switches
	var multiple = AFCH.speedy.mode.isMultiple(mode);
	var hasSubmitButton = AFCH.speedy.mode.hasSubmitButton(mode);

	var openSubgroupHandler = function(e) {
		$(e.target.form).find('input').prop('disabled', true);
		$(e.target.form).children().css('color', 'gray');
		$(e.target).parent().css('color', 'black').find('input').prop('disabled', false);
		$(e.target).parent().find('input:text')[0].focus();
		e.stopPropagation();
	};
	var submitSubgroupHandler = function(e) {
		var evaluateType = 'evaluateUser';
		AFCH.speedy.callback[evaluateType](e);
		e.stopPropagation();
	};

	return $.map(list, function(critElement) {
		var criterion = $.extend({}, critElement);

		// hack to get the g11 radio / checkbox right
		if (criterion.value === 'g11') {
			criterion.style = AFCH.getPref('enlargeG11Input') ? 'height: 2em; width: 2em; height: -moz-initial; width: -moz-initial; -moz-transform: scale(2); -o-transform: scale(2);' : '';
		}

		if (multiple) {
			if (criterion.hideWhenMultiple) {
				return null;
			}
			if (criterion.hideSubgroupWhenMultiple) {
				criterion.subgroup = null;
			}
		} else {
			if (criterion.hideWhenSingle) {
				return null;
			}
			if (criterion.hideSubgroupWhenSingle) {
				criterion.subgroup = null;
			}
		}

		if (criterion.hideWhenUser) {
			return null;
		}
		if (criterion.hideSubgroupWhenUser) {
			criterion.subgroup = null;
		}

		if (mw.config.get('wgIsRedirect') && criterion.hideWhenRedirect) {
			return null;
		}

		if (criterion.subgroup && !hasSubmitButton) {
			if ($.isArray(criterion.subgroup)) {
				criterion.subgroup.push({
					type: 'button',
					name: 'submit',
					label: wgULS('标记页面', '標記頁面'),
					event: submitSubgroupHandler
				});
			} else {
				criterion.subgroup = [
					criterion.subgroup,
					{
						type: 'button',
						name: 'submit',  // ends up being called "csd.submit" so this is OK
						label: wgULS('标记页面', '標記頁面'),
						event: submitSubgroupHandler
					}
				];
			}
			// FIXME: does this do anything?
			criterion.event = openSubgroupHandler;
		}
		
		return criterion;
	});
};

AFCH.speedy.customRationale = [
	{
		label: wgULS('自定义理由' , '自訂理由'),
		value: 'reason',
		tooltip: wgULS('该页至少应该符合一条快速删除的标准，并且您必须在理由中提到。这不是万能的删除理由。', '該頁至少應該符合一條快速刪除的標準，並且您必須在理由中提到。這不是萬能的刪除理由。'),
		subgroup: {
			name: 'reason_1',
			type: 'input',
			label: '理由：',
			size: 60
		}
		// hideWhenMultiple: true
	}
];
AFCH.speedy.draftList = [
	{
		label: wgULS('O7: 废弃草稿。', 'O7: 廢棄草稿。'),
		value: 'o7',
		tooltip: wgULS('任何六个月内无编辑之草稿。建议阁下以零编辑代替提删。', '任何六個月內無編輯之草稿。建議閣下以零編輯代替提刪。')
	}
];

AFCH.speedy.userList = [
	{
		label: wgULS('O1: 用户请求删除自己的用户页或其子页面。', 'O1: 使用者請求刪除自己的使用者頁面或其子頁面。'),
		value: 'o1',
		tooltip: wgULS('如果是从其他名字空间移动来的，须附有合理原因。', '如果是從其他命名空間移動來的，須附有合理原因。')
	}
];

AFCH.speedy.usertalkList = [
	{
		label: wgULS('O3: 已超过一个月未有编辑动作的匿名（IP）用户的用户讨论页', 'O3: 已超過一個月未有編輯動作的匿名（IP）使用者的使用者討論頁'),
		value: 'o3',
		tooltip: wgULS('避免给使用同一IP地址的用户带来混淆。不适用于用户讨论页的存档页面。', '避免給使用同一IP位址的使用者帶來混淆。不適用於使用者討論頁的存檔頁面。')
	}
];

AFCH.speedy.generalList = [
	{
		label: wgULS('G1: 没有实际内容的页面', 'G1: 沒有實際內容的頁面'),
		value: 'g1',
		tooltip: wgULS('如“adfasddd”。参见Wikipedia:胡言乱语。但注意：图片也算是内容。', '如「adfasddd」。參見Wikipedia:胡言亂語。但注意：圖片也算是內容。'),
		hideInNamespaces: [ 2, 3 ] // user, user talk
	},
	{
		label: wgULS('G2: 测试页面', 'G2: 測試頁面'),
		value: 'g2',
		tooltip: wgULS('例如：“这是一个测试。”', '例如：「這是一個測試。」'),
		hideInNamespaces: [ 2, 3 ] // user, user talk
	},
	{
		label: wgULS('G3: 纯粹破坏，包括但不限于明显的恶作剧、错误信息、人身攻击等', 'G3: 純粹破壞，包括但不限於明顯的惡作劇、錯誤資訊、人身攻擊等'),
		value: 'g3',
		tooltip: wgULS('包括明显的错误信息、明显的恶作剧、信息明显错误的图片，以及清理移动破坏时留下的重定向。', '包括明顯的錯誤資訊、明顯的惡作劇、資訊明顯錯誤的圖片，以及清理移動破壞時留下的重定向。')
	},
	{
		label: wgULS('G5: 曾经根据页面存废讨论、侵权审核或文件存废讨论结果删除后又重新创建的内容，而有关内容与已删除版本相同或非常相似，无论标题是否相同', 'G5: 曾經根據頁面存廢討論、侵權審核或檔案存廢討論結果刪除後又重新建立的內容，而有關內容與已刪除版本相同或非常相似，無論標題是否相同'),
		value: 'g5',
		tooltip: wgULS('该内容之前必须是经存废讨论删除，如之前属于快速删除，请以相同理由重新提送快速删除。该内容如与被删除的版本明显不同，而提删者认为需要删除，请交到存废讨论，如果提删者对此不肯定，请先联络上次执行删除的管理人员。不适用于根据存废复核结果被恢复的内容。在某些情况下，重新创建的条目有机会发展。那么不应提交快速删除，而应该提交存废复核或存废讨论重新评核。', '該內容之前必須是經存廢討論刪除，如之前屬於快速刪除，請以相同理由重新提送快速刪除。該內容如與被刪除的版本明顯不同，而提刪者認為需要刪除，請交到存廢討論，如果提刪者對此不肯定，請先聯絡上次執行刪除的管理人員。不適用於根據存廢覆核結果被恢復的內容。在某些情況下，重新建立的條目有機會發展。那麼不應提交快速刪除，而應該提交存廢覆核或存廢討論重新評核。'),
		subgroup: [
			{
				type: 'checkbox',
				list: [
					{
						name: 'g5_copyvio',
						value: 'g5_copyvio',
						label: wgULS('前次以侵权审核删除。若页面名称不同，请在“删除讨论位置”提供页面名称。勾选此项将自动张贴疑似侵权模板。', '前次以侵權審核刪除。若頁面名稱不同，請在「刪除討論位置」提供頁面名稱。勾選此項將自動張貼疑似侵權模板。')
					}
				]
			},
			{
				name: 'g5_1',
				type: 'input',
				label: wgULS('删除讨论位置：', '刪除討論位置：'),
				size: 60
			}
		],
		hideSubgroupWhenMultiple: true
	},
	{
		label: wgULS('G10: 原作者清空页面或提出删除，且实际贡献者只有一人', 'G10: 原作者清空頁面或提出刪除，且實際貢獻者只有一人'),
		value: 'g10',
		tooltip: wgULS('提请须出于善意，及附有合理原因。', '提請須出於善意，及附有合理原因。'),
		subgroup: {
			name: 'g10_rationale',
			type: 'input',
			label: wgULS('可选的解释：', '可選的解釋：'),
			tooltip: wgULS('比如作者在哪里请求了删除。', '比如作者在哪裡請求了刪除。'),
			size: 60
		},
		hideSubgroupWhenSysop: true
	},
	{
		label: wgULS('G11: 明显的广告宣传页面，或只有相关人物或团体的联系方法的页面', 'G11: 明顯的廣告宣傳頁面，或只有相關人物或團體的聯係方法的頁面'),
		value: 'g11',
		tooltip: wgULS('页面只收宣传之用，并须完全重写才能贴合百科全书要求。须注意，仅仅以某公司或产品为主题的条目，并不直接导致其自然满足此速删标准。', '頁面只收宣傳之用，並須完全重寫才能貼合百科全書要求。須注意，僅僅以某公司或產品為主題的條目，並不直接導致其自然滿足此速刪標準。')
	},
	{
		label: wgULS('G12: 未列明来源且语调负面的生者传记', 'G12: 未列明來源且語調負面的生者傳記'),
		value: 'g12',
		tooltip: wgULS('注意是未列明来源且语调负面，必须2项均符合。', '注意是未列明來源且語調負面，必須2項均符合。')
	},
	{
		label: wgULS('G15: 孤立页面，比如没有主页面的讨论页、指向空页面的重定向等', 'G15: 孤立頁面，比如沒有主頁面的討論頁、指向空頁面的重定向等'),
		value: 'g15',
		tooltip: wgULS('包括以下几种类型：1. 没有对应文件的文件页面；2. 没有对应母页面的子页面，用户页子页面除外；3. 指向不存在页面的重定向；4. 没有对应内容页面的讨论页，讨论页存档和用户讨论页除外；5. 不存在注册用户的用户页及用户页子页面，localhost对应IP用户的用户页和随用户更名产生的用户页重定向除外。请在删除时注意有无将内容移至他处的必要。不包括在主页面挂有{{CSD Placeholder}}模板的讨论页。', '包括以下幾種類型：1. 沒有對應檔案的檔案頁面；2. 沒有對應母頁面的子頁面，使用者頁面子頁面除外；3. 指向不存在頁面的重新導向；4. 沒有對應內容頁面的討論頁，討論頁存檔和使用者討論頁除外；5. 不存在註冊使用者的使用者頁面及使用者頁面子頁面，localhost對應IP使用者的使用者頁面和隨使用者更名產生的使用者頁面重新導向除外。請在刪除時注意有無將內容移至他處的必要。不包括在主頁面掛有{{CSD Placeholder}}模板的討論頁。')
	},
	{
		label: wgULS('G16: 页面与介绍相同事物的原页面同样侵权', 'G16: 頁面與介紹相同事物的原頁面同樣侵權'),
		value: 'g16',
		tooltip: wgULS('此条所适用的页面包括但不限于草稿页面、主名字空间（条目空间）页面、用户空间页面等介绍相同事物，且在原页面被提报侵权后创建的页面。提报时需同时附上已提报侵犯著作权页面的名称，除非一眼能看出已提报侵犯著作权页面。', '此條所適用的頁面包括但不限於草稿頁面、主命名空間（條目空間）頁面、使用者空間頁面等介紹相同事物，且在原頁面被提報侵權後建立的頁面。提報時需同時附上已提報侵犯著作權頁面的名稱，除非一眼能看出已提報侵犯著作權頁面。'),
		subgroup: [
			{
				name: 'g16_pagename',
				type: 'input',
				label: wgULS('当前已提报侵犯著作权页面的名称：', '目前已提報侵犯著作權頁面的名稱：')
			},
			{
				type: 'div',
				label: wgULS('若另一页面已依侵权审核删除，请使用CSD G5。标记首次侵权的页面，请使用AFCH的“侵权”功能。', '若另一頁面已依侵權審核刪除，請使用CSD G5。標記首次侵權的頁面，請使用AFCH的「侵權」功能。')
			}
		]
	}
];

AFCH.speedy.redirectList = [
	{
		label: wgULS('R2: 跨名字空间重定向。', 'R2: 跨命名空間的重新導向。'),
		value: 'r2',
		tooltip: wgULS('由条目的名字空间重定向至非条目名字空间，或者从草稿名字空间指向非草稿名字空间的重定向。', '由條目的命名空間重新導向至非條目命名空間，或者從草稿命名空間指向非草稿命名空間的重新導向。'),
		showInNamespaces: [ 0, 118 ] // main, draft
	},
	{
		label: wgULS('R3: 格式错误，或明显笔误的重定向。', 'R3: 格式錯誤，或明顯筆誤的重新導向。'),
		value: 'r3',
		tooltip: wgULS('非一眼能看出的拼写错误和翻译或标题用字的争议应交由存废讨论处理。', '非一眼能看出的拼寫錯誤和翻譯或標題用字的爭議應交由存廢討論處理。'),
		subgroup: {
			name: 'r3_type',
			type: 'select',
			label: wgULS('适用类别：', '適用類別：'),
			list: wgULS([
				{ label: '请选择', value: '' },
				{ label: '标题繁简混用', value: '标题繁简混用。' },
				{ label: '消歧义使用的括号或空格错误', value: '消歧义使用的括号或空格错误。' },
				{ label: '间隔号使用错误', value: '间隔号使用错误。' },
				{ label: '标题中使用非常见的错别字', value: '标题中使用非常见的错别字。' },
				{ label: '移动侵权页面的临时页后所产生的重定向', value: '移动侵权页面的临时页后所产生的重定向。' }
			], [
				{ label: '請選擇', value: '' },
				{ label: '標題繁簡混用', value: '标题繁简混用。' },
				{ label: '消歧義使用的括號或空格錯誤', value: '消歧义使用的括号或空格错误。' },
				{ label: '間隔號使用錯誤', value: '间隔号使用错误。' },
				{ label: '標題中使用非常見的錯別字', value: '标题中使用非常见的错别字。' },
				{ label: '移動侵權頁面的臨時頁後所產生的重新導向', value: '移动侵权页面的临时页后所产生的重定向。' }
			])
		},
	},
	{
		label: wgULS('R5: 指向本身或循环的重定向。', 'R5: 指向本身或循環的重新導向。'),
		value: 'r5',
		tooltip: '如A→B→C→……→A。'
	},
	{
		label: wgULS('R7: 明显与导向目标所涵盖的主题无关或比导向目标所涵盖的主题更广泛的重定向。', 'R7: 明顯與導向目標所涵蓋的主題無關或比導向目標所涵蓋的主題更廣泛的重新導向。'),
		value: 'r7',
		tooltip: wgULS('挂有{{关注度重定向}}或{{合并重定向}}模板的页面不适用，请改为提出存废讨论。如有用户对标题用字存在未解决的争议，则应交由存废讨论处理。', '掛有{{關注度重定向}}或{{合併重定向}}模板的頁面不適用，請改為提出存廢討論。如有使用者對標題用字存在未解決的爭議，則應交由存廢討論處理。')
	}
];

AFCH.speedy.normalizeHash = {
	'reason': 'db',
	'multiple': 'multiple',
	'multiple-finish': 'multiple-finish',
	'g1': 'g1',
	'g2': 'g2',
	'g3': 'g3',
	'g5': 'g5',
	'g10': 'g10',
	'g11': 'g11',
	'g12': 'g12',
	'g15': 'g15',
	'g16': 'g16',
	'o7': 'o7'
};

AFCH.speedy.callbacks = {
	getTemplateCodeAndParams: function(params) {
		var code, parameters, i;
		if (params.normalizeds.length > 1) {
			code = '{{delete';
			params.utparams = {};
			$.each(params.normalizeds, function(index, norm) {
				if (norm !== 'db') {
					code += '|' + norm.toUpperCase();
				}
				parameters = params.templateParams[index] || [];
				for (var i in parameters) {
					if (typeof parameters[i] === 'string') {
						code += '|' + parameters[i];
					}
				}
				$.extend(params.utparams, AFCH.speedy.getUserTalkParameters(norm, parameters));
			});
			code += '}}';
		} else {
			parameters = params.templateParams[0] || [];
			code = '{{delete';
			if (params.values[0] !== 'reason') {
				code += '|' + params.values[0];
			}
			for (i in parameters) {
				if (typeof parameters[i] === 'string') {
					code += '|' + parameters[i];
				}
			}
			code += '}}';
			params.utparams = AFCH.speedy.getUserTalkParameters(params.normalizeds[0], parameters);
		}

		return [code, params.utparams];
	},

	parseWikitext: function(title, wikitext, callback) {
		var query = {
			action: 'parse',
			prop: 'text',
			pst: 'true',
			text: wikitext,
			contentmodel: 'wikitext',
			title: title
		};

		var statusIndicator = new Morebits.status(wgULS('构造删除理由', '構造刪除理由'));
		var api = new Morebits.wiki.api(wgULS('解析删除模板', '解析刪除模板'), query, function(apiObj) {
			var reason = decodeURIComponent($(apiObj.getXML().querySelector('text').childNodes[0].nodeValue).find('#delete-reason').text().replace(/\+/g, ' '));
			if (!reason) {
				statusIndicator.warn(wgULS('未能从删除模板生成删除理由', '未能從刪除模板生成刪除理由'));
			} else {
				statusIndicator.info('完成');
			}
			callback(reason);
		}, statusIndicator);
		api.post();
	},
	
	user: {
		main: function(pageobj) {
			var statelem = pageobj.getStatusElement();

			// defaults to /doc for lua modules, which may not exist
			if (!pageobj.exists() && mw.config.get('wgPageContentModel') !== 'Scribunto') {
				statelem.error(wgULS('页面不存在，可能已被删除', '頁面不存在，可能已被刪除'));
				return;
			}

			var text = pageobj.getPageText();
			var params = pageobj.getCallbackParameters();

			statelem.status(wgULS('检查页面已有标记…', '檢查頁面已有標記…'));

			// check for existing deletion tags
			var textNoSd = text.replace(/\{\{\s*(db(-\w*)?|d|delete|deletebecause|speedy|csd|速刪|速删|快删|快刪)\s*(\|(?:\{\{[^{}]*\}\}|[^{}])*)?\}\}\s*/ig, '');
			if (text !== textNoSd && !confirm(wgULS('在页面上找到快速删除模板，要移除并添加新的吗？', '在頁面上找到快速刪除模板，要移除並添加新的嗎？'))) {
				statelem.error(wgULS('快速删除模板已被置于页面中。', '快速刪除模板已被置於頁面中。'));
				return;
			}
			text = textNoSd;

			var copyvio = /(?:\{\{\s*(copyvio|侵权|侵權)[^{}]*?\}\})/i.exec(text);
			if (copyvio && !confirm(wgULS('版权验证模板已被置于页面中，您是否仍想添加一个快速删除模板？', '版權驗證模板已被置於頁面中，您是否仍想加入一個快速刪除模板？'))) {
				statelem.error(wgULS('页面中已有版权验证模板。', '頁面中已有版權驗證模板。'));
				return;
			}

			var xfd = /(?:\{\{([rsaiftcmv]fd|md1|proposed deletion)[^{}]*?\}\})/i.exec(text);
			if (xfd && !confirm(wgULS('删除相关模板{{' + xfd[1] + '}}已被置于页面中，您是否仍想添加一个快速删除模板？', '刪除相關模板{{' + xfd[1] + '}}已被置於頁面中，您是否仍想加入一個快速刪除模板？'))) {
				statelem.error(wgULS('页面已被提交至存废讨论。', '頁面已被提交至存廢討論。'));
				return;
			}

			// given the params, builds the template and also adds the user talk page parameters to the params that were passed in
			// returns => [<string> wikitext, <object> utparams]
			var buildData = AFCH.speedy.callbacks.getTemplateCodeAndParams(params),
				code = buildData[0];
			params.utparams = buildData[1];

			var thispage = new Morebits.wiki.page(mw.config.get('wgPageName'));
			// patrol the page, if reached from Special:NewPages
			if (AFCH.getPref('markSpeedyPagesAsPatrolled')) {
				thispage.patrol();
			}

			// Wrap SD template in noinclude tags if we are in template space.
			// Won't work with userboxes in userspace, or any other transcluded page outside template space
			if (mw.config.get('wgNamespaceNumber') === 10) {  // Template:
				code = '<noinclude>' + code + '</noinclude>';
			}

			// Remove tags that become superfluous with this action
			text = text.replace(/\{\{\s*([Nn]ew unreviewed article|[Uu]nreviewed|[Uu]serspace draft)\s*(\|(?:\{\{[^{}]*\}\}|[^{}])*)?\}\}\s*/g, '');
			if (mw.config.get('wgNamespaceNumber') === 6) {
				// remove "move to Commons" tag - deletion-tagged files cannot be moved to Commons
				text = text.replace(/\{\{(mtc|(copy |move )?to ?commons|move to wikimedia commons|copy to wikimedia commons)[^}]*\}\}/gi, '');
			}

			if (params.copyvio) {
				code += '\n{{subst:Copyvio/auto|url=* 請管理員檢查已刪歷史內容及侵權來源：[[Special:Undelete/' + params.copyvio + ']]|OldRevision=' + mw.config.get('wgRevisionId') + '}}';
			}

			// Generate edit summary for edit
			var editsummary;
			if (params.normalizeds.length > 1) {
				editsummary = wgULS('请求快速删除（', '請求快速刪除（');
				$.each(params.normalizeds, function(index, norm) {
					if (norm !== 'db') {
						editsummary += '[[WP:CSD#' + norm.toUpperCase() + '|CSD ' + norm.toUpperCase() + ']]、';
					}
				});
				editsummary = editsummary.substr(0, editsummary.length - 1); // remove trailing comma
				editsummary += '）。';
			} else if (params.normalizeds[0] === 'db') {
				editsummary = wgULS('请求[[WP:CSD|快速删除]]：', '請求[[WP:CSD|快速刪除]]：') + params.templateParams[0]['1'];
			} else {
				editsummary = wgULS('请求快速删除', '請求快速刪除') + '（[[WP:CSD#' + params.normalizeds[0].toUpperCase() + '|CSD ' + params.normalizeds[0].toUpperCase() + ']]）';
			}

			pageobj.setPageText(code + (params.blank ? '' : '\n' + text));
			pageobj.setEditSummary(editsummary + AFCH.getPref('summaryAd'));
			pageobj.setWatchlist(params.watch);
			if (params.scribunto) {
				pageobj.setCreateOption('recreate'); // Module /doc might not exist
				if (params.watch) {
					// Watch module in addition to /doc subpage
					var watch_query = {
						action: 'watch',
						titles: mw.config.get('wgPageName'),
						token: mw.user.tokens.get('watchToken')
					};
					new Morebits.wiki.api(wgULS('将模块加入到监视清单', '將模組加入到監視清單'), watch_query).post();
				}
			}
			pageobj.save(AFCH.speedy.callbacks.user.tagComplete);
		},

		tagComplete: function(pageobj) {
			var params = pageobj.getCallbackParameters();

			// Notification to first contributor
			if (params.usertalk) {
				var callback = function(pageobj) {
					var initialContrib = pageobj.getCreator();

					// disallow warning yourself
					if (initialContrib === mw.config.get('wgUserName')) {
						Morebits.status.warn(wgULS('您（' + initialContrib + '）创建了该页，跳过通知', '您（' + initialContrib + '）建立了該頁，跳過通知'));
						initialContrib = null;

					// don't notify users when their user talk page is nominated
					} else if (initialContrib === mw.config.get('wgTitle') && mw.config.get('wgNamespaceNumber') === 3) {
						Morebits.status.warn(wgULS_U('通知页面创建者：用户创建了自己的对话页', '通知頁面建立者：用戶建立了自己的對話頁', '通知頁面建立者：使用者建立了自己的對話頁'));
						initialContrib = null;

					// quick hack to prevent excessive unwanted notifications. Should actually be configurable on recipient page...
					} else if (initialContrib === 'A2093064-bot' && params.normalizeds[0] === 'g15') {
						Morebits.status.warn(wgULS('通知页面创建者：由机器人建立，跳过通知', '通知頁面建立者：由機器人建立，跳過通知'));
						initialContrib = null;
//AFCH
					} else {
						var talkPageName = 'User talk:' + initialContrib;
						Morebits.wiki.flow.check(talkPageName, function () {
							var flowpage = new Morebits.wiki.flow(talkPageName, wgULS('通知页面创建者（' + initialContrib + '）', '通知頁面建立者（' + initialContrib + '）'));
							flowpage.setTopic('[[:' + Morebits.pageNameNorm + ']]的快速删除通知');
							flowpage.setContent('{{subst:db-notice|target=' + Morebits.pageNameNorm + '|flow=yes}}');
							flowpage.newTopic();
						}, function() {
							var usertalkpage = new Morebits.wiki.page(talkPageName, wgULS('通知页面创建者（' + initialContrib + '）', '通知頁面建立者（' + initialContrib + '）')),
								notifytext;

							notifytext = '\n{{subst:db-notice|target=' + Morebits.pageNameNorm;
							notifytext += (params.welcomeuser ? '' : '|nowelcome=yes') + '}}--~~~~';

							var editsummary = '通知：';
							if (params.normalizeds.indexOf('g12') === -1) {  // no article name in summary for G10 deletions
								editsummary += '页面[[' + Morebits.pageNameNorm + ']]';
							} else {
								editsummary += '一攻击性页面';
							}
							editsummary += '快速删除提名';

							usertalkpage.setAppendText(notifytext);
							usertalkpage.setEditSummary(editsummary + AFCH.getPref('summaryAd'));
							usertalkpage.setCreateOption('recreate');
							usertalkpage.setFollowRedirect(true);
							usertalkpage.append();
						});
					}

					// add this nomination to the user's userspace log, if the user has enabled it
					if (params.lognomination) {
						AFCH.speedy.callbacks.user.addToLog(params, initialContrib);
					}
				};
				var thispage = new Morebits.wiki.page(Morebits.pageNameNorm);
				thispage.lookupCreator(callback);
			// or, if not notifying, add this nomination to the user's userspace log without the initial contributor's name
			} else if (params.lognomination) {
				AFCH.speedy.callbacks.user.addToLog(params, null);
			}
		},


		addToLog: function(params, initialContrib) {
			var wikipedia_page = new Morebits.wiki.page('User:' + mw.config.get('wgUserName') + '/' + AFCH.getPref('speedyLogPageName'), wgULS_U('添加项目到用户日志', '加入項目到用戶日誌', '加入項目到使用者日誌'));
			params.logInitialContrib = initialContrib;
			wikipedia_page.setFollowRedirect(true);
			wikipedia_page.setCallbackParameters(params);
			wikipedia_page.load(AFCH.speedy.callbacks.user.saveLog);
		},
		
		saveLog: function(pageobj) {
			var text = pageobj.getPageText();
			var params = pageobj.getCallbackParameters();

			var appendText = '';

			// add blurb if log page doesn't exist
			if (!pageobj.exists()) {
				appendText +=
					'这是该用户使用[[WP:TW|Twinkle]]的速删模块做出的[[WP:CSD|快速删除]]提名列表。\n\n' +
					'如果您不再想保留此日志，请在[[' + AFCH.getPref('ConfigPageOfTW') + '|参数设置]]中关掉，并' +
					'使用[[WP:CSD#O1|CSD O1]]提交快速删除。\n';
				if (Morebits.userIsInGroup('sysop')) {
					appendText += '\n此日志并不记录用AFCH直接执行的删除。\n';
				}
			}

			// create monthly header
			var date = new Morebits.date(pageobj.getLoadTime());
			if (!date.monthHeaderRegex().test(text)) {
				appendText += '\n\n' + date.monthHeader(3);
			}

			appendText += '\n# [[:' + Morebits.pageNameNorm + ']]: ';
			if (params.normalizeds.length > 1) {
				appendText += '多个理由（';
			$.each(params.normalizeds, function(index, norm) {
				appendText += '[[WP:CSD#' + norm.toUpperCase() + '|' + norm.toUpperCase() + ']]、';
			});
			appendText = appendText.substr(0, appendText.length - 1);  // remove trailing comma
			appendText += '）';
			} else if (params.normalizeds[0] === 'db') {
				appendText += '自定义理由';
			} else {
				appendText += '[[WP:CSD#' + params.normalizeds[0].toUpperCase() + '|CSD ' + params.normalizeds[0].toUpperCase() + ']]';
			}

			if (params.logInitialContrib) {
				appendText += '；通知{{user|' + params.logInitialContrib + '}}';
			}
			appendText += ' ~~~~~\n';

			pageobj.setAppendText(appendText);
			pageobj.setEditSummary(wgULS('记录对[[', '記錄對[[') + Morebits.pageNameNorm + wgULS(']]的快速删除提名', ']]的快速刪除提名') + AFCH.getPref('summaryAd'));
			pageobj.setCreateOption('recreate');
			pageobj.append();
		}
	}
};

// validate subgroups in the form passed into the speedy deletion tag
AFCH.speedy.getParameters = function speedyGetParameters(form, values) {
	var parameters = [];

	$.each(values, function(index, value) {
		var currentParams = [];
		var redimage;
		switch (value) {
			case 'reason':
				if (form['csd.reason_1']) {
					var dbrationale = form['csd.reason_1'].value;
					if (!dbrationale || !dbrationale.trim()) {
						alert(wgULS('自定义理由：请指定理由。', '自訂理由：請指定理由。'));
						parameters = null;
						return false;
					}
					currentParams['1'] = dbrationale;
				}
				break;

			case 'a3':
				if (form['csd.a3_pagename'] && form['csd.a3_pagename'].value) {
					currentParams.pagename = form['csd.a3_pagename'].value;
				}
				break;

			case 'g5':
				if (form['csd.g5_1']) {
					var deldisc = form['csd.g5_1'].value;
					if (deldisc) {
						if ((!form.g5_copyvio || !form.g5_copyvio.checked) &&
							deldisc.substring(0, 9) !== 'Wikipedia' &&
							deldisc.substring(0, 3) !== 'WP:' &&
							deldisc.substring(0, 5) !== '维基百科:' &&
							deldisc.substring(0, 5) !== '維基百科:') {
							alert(wgULS('CSD G5：您提供的讨论页名必须以“Wikipedia:”开头。', 'CSD G5：您提供的討論頁名必須以「Wikipedia:」開頭。'));
							parameters = null;
							return false;
						}
						currentParams['1'] = deldisc;
					}
				}
				break;

			case 'g10':
				if (form['csd.g10_rationale'] && form['csd.g10_rationale'].value) {
					currentParams.rationale = form['csd.g10_rationale'].value;
				}
				break;

			case 'g16':
				if (form['csd.g16_pagename']) {
					var pagename = form['csd.g16_pagename'].value;
					if (!pagename || !pagename.trim()) {
						alert(wgULS('CSD G16：请提供页面名称。', 'CSD G16：請提供頁面名稱。'));
						parameters = null;
						return false;
					}
					currentParams.pagename = pagename;
				}
				break;

			case 'r3':
				if (form['csd.r3_type']) {
					var redirtype = form['csd.r3_type'].value;
					if (!redirtype) {
						alert(wgULS('CSD R3：请选择适用类别。', 'CSD R3：請選擇適用類別。'));
						parameters = null;
						return false;
					}
					currentParams['1'] = redirtype;
				}
				break;

			default:
				break;
		}
		parameters.push(currentParams);
	});
	return parameters;
};

// function for processing talk page notification template parameters
AFCH.speedy.getUserTalkParameters = function speedyGetUserTalkParameters(normalized, parameters) { // eslint-disable-line no-unused-vars
	var utparams = [];
	switch (normalized) {
		default:
			break;
	}
	return utparams;
};


AFCH.speedy.resolveCsdValues = function speedyResolveCsdValues(e) {
	var values = (e.target.form ? e.target.form : e.target).getChecked('csd');
	if (values.length === 0) {
		alert(wgULS('请选择一个理据！', '請選擇一個理據！'));
		return null;
	}
	return values;
};

AFCH.speedy.callback.evaluateUser = function speedyCallbackEvaluateUser(e) {
	var form = e.target.form ? e.target.form : e.target;

	if (e.target.type === 'checkbox' || e.target.type === 'text' ||
			e.target.type === 'select') {
		return;
	}

	var values = AFCH.speedy.resolveCsdValues(e);
	if (!values) {
		return;
	}
	// var multiple = form.multiple.checked;
	var normalizeds = [];
	$.each(values, function(index, value) {
		var norm = AFCH.speedy.normalizeHash[value];

		normalizeds.push(norm);
	});

	// analyse each criterion to determine whether to watch the page/notify the creator
	var watchPage = false;
	$.each(normalizeds, function(index, norm) {
		if (AFCH.getPref('watchSpeedyPages').indexOf(norm) !== -1) {
			watchPage = true;
			return false;  // break
		}
	});

	var notifyuser = false;
	if (form.notify.checked) {
		$.each(normalizeds, function(index, norm) {
			if (AFCH.getPref('notifyUserOnSpeedyDeletionNomination').indexOf(norm) !== -1) {
				notifyuser = true;
				return false;  // break
			}
		});
	}

	var welcomeuser = false;
	if (notifyuser) {
		$.each(normalizeds, function(index, norm) {
			if (AFCH.getPref('welcomeUserOnSpeedyDeletionNotification').indexOf(norm) !== -1) {
				welcomeuser = true;
				return false;  // break
			}
		});
	}

	var csdlog = false;
	if (AFCH.getPref('logSpeedyNominations')) {
		$.each(normalizeds, function(index, norm) {
			if (AFCH.getPref('noLogOnSpeedyNomination').indexOf(norm) === -1) {
				csdlog = true;
				return false;  // break
			}
		});
	}

	var blank = form.blank.checked;

	var copyvio = false;
	if (form.g5_copyvio && form.g5_copyvio.checked) {
		if (form['csd.g5_1'] && form['csd.g5_1'].value) {
			copyvio = form['csd.g5_1'].value;
		} else {
			copyvio = mw.config.get('wgPageName');
		}
		blank = true;
	}

	var params = {
		values: values,
		normalizeds: normalizeds,
		watch: watchPage,
		usertalk: notifyuser,
		welcomeuser: welcomeuser,
		lognomination: csdlog,
		templateParams: AFCH.speedy.getParameters(form, values),
		blank: blank,
		copyvio: copyvio
	};
	if (!params.templateParams) {
		return;
	}

	Morebits.simpleWindow.setButtonsEnabled(false);
	Morebits.status.init(form);

	Morebits.wiki.actionCompleted.redirect = mw.config.get('wgPageName');
	Morebits.wiki.actionCompleted.notice = wgULS('标记完成', '標記完成');

	// Modules can't be tagged, follow standard at TfD and place on /doc subpage
	params.scribunto = mw.config.get('wgPageContentModel') === 'Scribunto';
	var wikipedia_page = params.scribunto ? new Morebits.wiki.page(mw.config.get('wgPageName') + '/doc', wgULS('标记模块文档页', '標記模組文件頁')) : new Morebits.wiki.page(mw.config.get('wgPageName'), wgULS('标记页面', '標記頁面'));
	wikipedia_page.setCallbackParameters(params);
	wikipedia_page.load(AFCH.speedy.callbacks.user.main);
};
})(jQuery);


// </nowiki>
