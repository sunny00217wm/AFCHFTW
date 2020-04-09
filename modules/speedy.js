// <nowiki>
//https://github.com/Xi-Plus/twinkle/blob/9aff20e2388e9bea15aea7a8e02d3a37d36dd871/modules/twinklespeedy.js

(function($) {


/*
 ****************************************
 *** twinklespeedy.js: CSD module
 ****************************************
 * Mode of invocation:     Tab ("CSD")
 * Active on:              Non-special, existing pages
 *
 * NOTE FOR DEVELOPERS:
 *   If adding a new criterion, add it to the appropriate places at the top of
 *   twinkleconfig.js.  Also check out the default values of the CSD preferences
 *   in twinkle.js, and add your new criterion to those if you think it would be
 *   good.
 */

Twinkle.speedy = function twinklespeedy() {
	// Disable on:
	// * special pages
	// * Flow pages
	// * non-existent pages
	if (mw.config.get('wgNamespaceNumber') < 0 || mw.config.get('wgPageContentModel') === 'flow-board' || !mw.config.get('wgArticleId')) {
		return;
	}

	Twinkle.addPortletLink(Twinkle.speedy.callback, wgULS('速删', '速刪'), 'tw-csd', Morebits.userIsSysop ? wgULS('快速删除', '快速刪除') : wgULS('请求快速删除', '請求快速刪除'));
};

// This function is run when the CSD tab/header link is clicked
Twinkle.speedy.callback = function twinklespeedyCallback() {
	Twinkle.speedy.initDialog(Morebits.userIsSysop ? Twinkle.speedy.callback.evaluateSysop : Twinkle.speedy.callback.evaluateUser, true);
};

// Used by unlink feature
Twinkle.speedy.dialog = null;
// Used throughout
Twinkle.speedy.hasCSD = !!$('#delete-reason').length;

// The speedy criteria list can be in one of several modes
Twinkle.speedy.mode = {
	sysopSingleSubmit: 1,  // radio buttons, no subgroups, submit when "Submit" button is clicked
	sysopRadioClick: 2,  // radio buttons, no subgroups, submit when a radio button is clicked
	sysopMultipleSubmit: 3, // check boxes, subgroups, "Submit" button already present
	sysopMultipleRadioClick: 4, // check boxes, subgroups, need to add a "Submit" button
	userMultipleSubmit: 5,  // check boxes, subgroups, "Submit" button already pressent
	userMultipleRadioClick: 6,  // check boxes, subgroups, need to add a "Submit" button
	userSingleSubmit: 7,  // radio buttons, subgroups, submit when "Submit" button is clicked
	userSingleRadioClick: 8,  // radio buttons, subgroups, submit when a radio button is clicked

	// are we in "delete page" mode?
	// (sysops can access both "delete page" [sysop] and "tag page only" [user] modes)
	isSysop: function twinklespeedyModeIsSysop(mode) {
		return mode === Twinkle.speedy.mode.sysopSingleSubmit ||
			mode === Twinkle.speedy.mode.sysopMultipleSubmit ||
			mode === Twinkle.speedy.mode.sysopRadioClick ||
			mode === Twinkle.speedy.mode.sysopMultipleRadioClick;
	},
	// do we have a "Submit" button once the form is created?
	hasSubmitButton: function twinklespeedyModeHasSubmitButton(mode) {
		return mode === Twinkle.speedy.mode.sysopSingleSubmit ||
			mode === Twinkle.speedy.mode.sysopMultipleSubmit ||
			mode === Twinkle.speedy.mode.sysopMultipleRadioClick ||
			mode === Twinkle.speedy.mode.userMultipleSubmit ||
			mode === Twinkle.speedy.mode.userMultipleRadioClick ||
			mode === Twinkle.speedy.mode.userSingleSubmit;
	},
	// is db-multiple the outcome here?
	isMultiple: function twinklespeedyModeIsMultiple(mode) {
		return mode === Twinkle.speedy.mode.userMultipleSubmit ||
			mode === Twinkle.speedy.mode.sysopMultipleSubmit ||
			mode === Twinkle.speedy.mode.userMultipleRadioClick ||
			mode === Twinkle.speedy.mode.sysopMultipleRadioClick;
	}
};

// Prepares the speedy deletion dialog and displays it
Twinkle.speedy.initDialog = function twinklespeedyInitDialog(callbackfunc) {
	var dialog;
	Twinkle.speedy.dialog = new Morebits.simpleWindow(Twinkle.getPref('speedyWindowWidth'), Twinkle.getPref('speedyWindowHeight'));
	dialog = Twinkle.speedy.dialog;
	dialog.setTitle(wgULS('选择快速删除理由', '選擇快速刪除理由'));
	dialog.setScriptName('Twinkle');
	dialog.addFooterLink(wgULS('快速删除方针', '快速刪除方針'), 'WP:CSD');
	dialog.addFooterLink(wgULS('常见错误', '常見錯誤'), 'Wikipedia:管理员错误自查表/快速删除');
	dialog.addFooterLink(wgULS('Twinkle帮助', 'Twinkle說明'), 'WP:TW/DOC#speedy');

	var form = new Morebits.quickForm(callbackfunc, Twinkle.getPref('speedySelectionStyle') === 'radioClick' ? 'change' : null);
	if (Morebits.userIsSysop) {
		form.append({
			type: 'checkbox',
			list: [
				{
					label: wgULS('只标记，不删除', '只標記，不刪除'),
					value: 'tag_only',
					name: 'tag_only',
					tooltip: wgULS('如果您只想标记此页面而不是将其删除', '如果您只想標記此頁面而不是將其刪除'),
					checked: !(Twinkle.speedy.hasCSD || Twinkle.getPref('deleteSysopDefaultToDelete')),
					event: function(event) {
						var cForm = event.target.form;
						var cChecked = event.target.checked;
						// enable/disable talk page checkbox
						if (cForm.talkpage) {
							cForm.talkpage.disabled = cChecked;
							cForm.talkpage.checked = !cChecked && Twinkle.getPref('deleteTalkPageOnDelete');
						}
						// enable/disable redirects checkbox
						cForm.redirects.disabled = cChecked;
						cForm.redirects.checked = !cChecked;
						// enable/disable delete multiple
						cForm.delmultiple.disabled = cChecked;
						cForm.delmultiple.checked = false;
						// enable/disable open talk page checkbox
						cForm.openusertalk.disabled = cChecked;
						cForm.openusertalk.checked = false;

						// enable/disable notify checkbox
						cForm.notify.disabled = !cChecked;
						cForm.notify.checked = cChecked;
						// enable/disable multiple
						cForm.multiple.disabled = !cChecked;
						cForm.multiple.checked = false;

						Twinkle.speedy.callback.modeChanged(cForm);

						event.stopPropagation();
					}
				}
			]
		});

		var deleteOptions = form.append({
			type: 'div',
			name: 'delete_options'
		});
		deleteOptions.append({
			type: 'header',
			label: wgULS('删除相关选项', '刪除相關設定')
		});
		if (mw.config.get('wgNamespaceNumber') % 2 === 0 && mw.config.get('wgNamespaceNumber') !== 2) {  // hide option for user pages, to avoid accidentally deleting user talk page
			deleteOptions.append({
				type: 'checkbox',
				list: [
					{
						label: wgULS('删除讨论页', '刪除討論頁'),
						value: 'talkpage',
						name: 'talkpage',
						tooltip: wgULS('删除时附带删除此页面的讨论页。', '刪除時附帶刪除此頁面的討論頁。'),
						checked: Twinkle.getPref('deleteTalkPageOnDelete'),
						event: function(event) {
							event.stopPropagation();
						}
					}
				]
			});
		}
		deleteOptions.append({
			type: 'checkbox',
			list: [
				{
					label: wgULS('删除重定向', '刪除重定向'),
					value: 'redirects',
					name: 'redirects',
					tooltip: wgULS('删除到此页的重定向。', '刪除到此頁的重定向。'),
					checked: Twinkle.getPref('deleteRedirectsOnDelete'),
					event: function(event) {
						event.stopPropagation();
					}
				}
			]
		});
		deleteOptions.append({
			type: 'checkbox',
			list: [
				{
					label: wgULS('应用多个理由删除', '應用多個理由刪除'),
					value: 'delmultiple',
					name: 'delmultiple',
					tooltip: wgULS('您可选择应用于该页的多个理由。', '您可選擇應用於該頁的多個理由。'),
					event: function(event) {
						Twinkle.speedy.callback.modeChanged(event.target.form);
						event.stopPropagation();
					}
				}
			]
		});
		deleteOptions.append({
			type: 'checkbox',
			list: [
				{
					label: wgULS('开启用户对话页', '開啟用戶對話頁'),
					value: 'openusertalk',
					name: 'openusertalk',
					tooltip: wgULS('此项的默认值为您的开启对话页设置。在您选择应用多条理由删除时此项将保持不变。', '此項的預設值為您的開啟對話頁設定。在您選擇應用多條理由刪除時此項將保持不變。'),
					checked: false
				}
			]
		});
	}

	var tagOptions = form.append({
		type: 'div',
		name: 'tag_options'
	});

	if (Morebits.userIsSysop) {
		tagOptions.append({
			type: 'header',
			label: wgULS('标记相关选项', '標記相關選項')
		});
	}

	tagOptions.append({
		type: 'checkbox',
		list: [
			{
				label: wgULS('如可能，通知创建者', '如可能，通知建立者'),
				value: 'notify',
				name: 'notify',
				tooltip: wgULS('一个通知模板将会被加入创建者的对话页，如果您启用了该理据的通知。', '一個通知模板將會被加入建立者的對話頁，如果您啟用了該理據的通知。'),
				checked: !Morebits.userIsSysop || !(Twinkle.speedy.hasCSD || Twinkle.getPref('deleteSysopDefaultToDelete')),
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
					Twinkle.speedy.callback.modeChanged(event.target.form);
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
		label: wgULS('初始化CSD模块失败，请重试，或将这报告给Twinkle开发者。', '初始化CSD模組失敗，請重試，或將這報告給Twinkle開發者。')
	});

	if (Twinkle.getPref('speedySelectionStyle') !== 'radioClick') {
		form.append({ type: 'submit', className: 'tw-speedy-submit' }); // Renamed in modeChanged
	}

	var result = form.render();
	dialog.setContent(result);
	dialog.display();

	Twinkle.speedy.callback.modeChanged(result);
};

Twinkle.speedy.callback.getMode = function twinklespeedyCallbackGetMode(form) {
	var mode = Twinkle.speedy.mode.userSingleSubmit;
	if (form.tag_only && !form.tag_only.checked) {
		if (form.delmultiple.checked) {
			mode = Twinkle.speedy.mode.sysopMultipleSubmit;
		} else {
			mode = Twinkle.speedy.mode.sysopSingleSubmit;
		}
	} else {
		if (form.multiple.checked) {
			mode = Twinkle.speedy.mode.userMultipleSubmit;
		} else {
			mode = Twinkle.speedy.mode.userSingleSubmit;
		}
	}
	if (Twinkle.getPref('speedySelectionStyle') === 'radioClick') {
		mode++;
	}

	return mode;
};

Twinkle.speedy.callback.modeChanged = function twinklespeedyCallbackModeChanged(form) {
	var namespace = mw.config.get('wgNamespaceNumber');

	// first figure out what mode we're in
	var mode = Twinkle.speedy.callback.getMode(form);
	var isSysopMode = Twinkle.speedy.mode.isSysop(mode);

	if (Twinkle.speedy.mode.isSysop(mode)) {
		$('[name=delete_options]').show();
		$('[name=tag_options]').hide();
		$('button.tw-speedy-submit').text(wgULS('删除页面', '刪除頁面'));
	} else {
		$('[name=delete_options]').hide();
		$('[name=tag_options]').show();
		$('button.tw-speedy-submit').text(wgULS('标记页面', '標記頁面'));
	}

	var work_area = new Morebits.quickForm.element({
		type: 'div',
		name: 'work_area'
	});

	if (mode === Twinkle.speedy.mode.userMultipleRadioClick || mode === Twinkle.speedy.mode.sysopMultipleRadioClick) {
		var evaluateType = Twinkle.speedy.mode.isSysop(mode) ? 'evaluateSysop' : 'evaluateUser';

		work_area.append({
			type: 'div',
			label: wgULS('当选择完成后，点击：', '當選擇完成後，點選：')
		});
		work_area.append({
			type: 'button',
			name: 'submit-multiple',
			label: isSysopMode ? wgULS('删除页面', '刪除頁面') : wgULS('标记页面', '標記頁面'),
			event: function(event) {
				Twinkle.speedy.callback[evaluateType](event);
				event.stopPropagation();
			}
		});
	}

	var radioOrCheckbox = Twinkle.speedy.mode.isMultiple(mode) ? 'checkbox' : 'radio';

	if (isSysopMode && !Twinkle.speedy.mode.isMultiple(mode)) {
		work_area.append({ type: 'header', label: wgULS('自定义理由', '自訂理由') });
		work_area.append({ type: radioOrCheckbox, name: 'csd', list: Twinkle.speedy.generateCsdList(Twinkle.speedy.customRationale, mode) });
	}

	switch (namespace) {
		case 0:  // article
			work_area.append({ type: 'header', label: wgULS('条目', '條目') });
			work_area.append({ type: radioOrCheckbox, name: 'csd', list: Twinkle.speedy.generateCsdList(Twinkle.speedy.articleList, mode) });
			break;

		case 2:  // user
			work_area.append({ type: 'header', label: wgULS('用户页', '使用者頁面') });
			work_area.append({ type: radioOrCheckbox, name: 'csd', list: Twinkle.speedy.generateCsdList(Twinkle.speedy.userList, mode) });
			break;

		case 3:  // user talk
			if (mw.util.isIPAddress(mw.config.get('wgRelevantUserName'))) {
				work_area.append({ type: 'header', label: wgULS('用户讨论页', '使用者討論') });
				work_area.append({ type: radioOrCheckbox, name: 'csd', list: Twinkle.speedy.generateCsdList(Twinkle.speedy.usertalkList, mode) });
			}
			break;

		case 6:  // file
			work_area.append({ type: 'header', label: wgULS('文件', '檔案') });
			work_area.append({ type: radioOrCheckbox, name: 'csd', list: Twinkle.speedy.generateCsdList(Twinkle.speedy.fileList, mode) });
			if (!Twinkle.speedy.mode.isSysop(mode)) {
				work_area.append({ type: 'div', label: wgULS('标记CSD F3、F4、F6、F8、F9、F10，请使用Twinkle的“图权”功能。', '標記CSD F3、F4、F6、F8、F9、F10，請使用Twinkle的「圖權」功能。') });
			}
			break;

		case 14:  // category
			work_area.append({ type: 'header', label: wgULS('分类', '分類') });
			work_area.append({ type: radioOrCheckbox, name: 'csd', list: Twinkle.speedy.generateCsdList(Twinkle.speedy.categoryList, mode) });
			break;

		case 118:  // draft
			work_area.append({ type: 'header', label: wgULS('草稿', '草稿') });
			work_area.append({ type: radioOrCheckbox, name: 'csd', list: Twinkle.speedy.generateCsdList(Twinkle.speedy.draftList, mode) });
			break;

		default:
			break;
	}

	// custom rationale lives under general criteria when tagging
	var generalCriteria = Twinkle.speedy.generalList;
	if (!Twinkle.speedy.mode.isSysop(mode)) {
		generalCriteria = Twinkle.speedy.customRationale.concat(generalCriteria);
	}
	work_area.append({ type: 'header', label: wgULS('常规', '常規') });
	work_area.append({ type: radioOrCheckbox, name: 'csd', list: Twinkle.speedy.generateCsdList(generalCriteria, mode) });

	if (mw.config.get('wgIsRedirect') || Morebits.userIsSysop) {
		work_area.append({ type: 'header', label: '重定向' });
		work_area.append({ type: radioOrCheckbox, name: 'csd', list: Twinkle.speedy.generateCsdList(Twinkle.speedy.redirectList, mode) });
	}

	var old_area = Morebits.quickForm.getElements(form, 'work_area')[0];
	form.replaceChild(work_area.render(), old_area);

	// if sysop, check if CSD is already on the page and fill in custom rationale
	if (isSysopMode && Twinkle.speedy.hasCSD) {
		var customOption = $('input[name=csd][value=reason]')[0];
		if (customOption) {
			if (Twinkle.getPref('speedySelectionStyle') !== 'radioClick') {
				// force listeners to re-init
				customOption.click();
				customOption.parentNode.appendChild(customOption.subgroup);
			}
			customOption.subgroup.querySelector('input').value = decodeURIComponent($('#delete-reason').text()).replace(/\+/g, ' ');
		}
	}
};

Twinkle.speedy.generateCsdList = function twinklespeedyGenerateCsdList(list, mode) {
	// mode switches
	var isSysopMode = Twinkle.speedy.mode.isSysop(mode);
	var multiple = Twinkle.speedy.mode.isMultiple(mode);
	var hasSubmitButton = Twinkle.speedy.mode.hasSubmitButton(mode);

	var openSubgroupHandler = function(e) {
		$(e.target.form).find('input').prop('disabled', true);
		$(e.target.form).children().css('color', 'gray');
		$(e.target).parent().css('color', 'black').find('input').prop('disabled', false);
		$(e.target).parent().find('input:text')[0].focus();
		e.stopPropagation();
	};
	var submitSubgroupHandler = function(e) {
		var evaluateType = Twinkle.speedy.mode.isSysop(mode) ? 'evaluateSysop' : 'evaluateUser';
		Twinkle.speedy.callback[evaluateType](e);
		e.stopPropagation();
	};

	return $.map(list, function(critElement) {
		var criterion = $.extend({}, critElement);

		// hack to get the g11 radio / checkbox right
		if (criterion.value === 'g11') {
			criterion.style = Twinkle.getPref('enlargeG11Input') ? 'height: 2em; width: 2em; height: -moz-initial; width: -moz-initial; -moz-transform: scale(2); -o-transform: scale(2);' : '';
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

		if (isSysopMode) {
			if (criterion.hideWhenSysop) {
				return null;
			}
			if (criterion.hideSubgroupWhenSysop) {
				criterion.subgroup = null;
			}
		} else {
			if (criterion.hideWhenUser) {
				return null;
			}
			if (criterion.hideSubgroupWhenUser) {
				criterion.subgroup = null;
			}
		}

		if (mw.config.get('wgIsRedirect') && criterion.hideWhenRedirect) {
			return null;
		}

		if (criterion.showInNamespaces && criterion.showInNamespaces.indexOf(mw.config.get('wgNamespaceNumber')) < 0) {
			return null;
		} else if (criterion.hideInNamespaces && criterion.hideInNamespaces.indexOf(mw.config.get('wgNamespaceNumber')) > -1) {
			return null;
		}

		if (criterion.subgroup && !hasSubmitButton) {
			if ($.isArray(criterion.subgroup)) {
				criterion.subgroup.push({
					type: 'button',
					name: 'submit',
					label: isSysopMode ? wgULS('删除页面', '刪除頁面') : wgULS('标记页面', '標記頁面'),
					event: submitSubgroupHandler
				});
			} else {
				criterion.subgroup = [
					criterion.subgroup,
					{
						type: 'button',
						name: 'submit',  // ends up being called "csd.submit" so this is OK
						label: isSysopMode ? wgULS('删除页面', '刪除頁面') : wgULS('标记页面', '標記頁面'),
						event: submitSubgroupHandler
					}
				];
			}
			// FIXME: does this do anything?
			criterion.event = openSubgroupHandler;
		}

		if (isSysopMode) {
			var originalEvent = criterion.event;
			criterion.event = function(e) {
				if (multiple) {
					return originalEvent(e);
				}

				var normalizedCriterion = Twinkle.speedy.normalizeHash[e.target.value];
				$('[name=openusertalk]').prop('checked',
					Twinkle.getPref('openUserTalkPageOnSpeedyDelete').indexOf(normalizedCriterion) !== -1
				);
				if (originalEvent) {
					return originalEvent(e);
				}
			};
		}

		return criterion;
	});
};

Twinkle.speedy.customRationale = [
	{
		label: wgULS('自定义理由' + (Morebits.userIsSysop ? '（自定义删除理由）' : ''), '自訂理由' + (Morebits.userIsSysop ? '（自訂刪除理由）' : '')),
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

Twinkle.speedy.fileList = [
	{
		label: wgULS('F1: 重复的档案（完全相同或缩小），而且不再被条目使用', 'F1: 重複的檔案（完全相同或縮小），而且不再被條目使用'),
		value: 'f1',
		subgroup: {
			name: 'f1_filename',
			type: 'input',
			label: wgULS('与此文件相同的文件名：', '與此檔案相同的檔案名：'),
			tooltip: wgULS('可不含“File:”前缀。', '可不含「File:」前綴。')
		}
	},
	{
		label: wgULS('F3: 来源不明的文件', 'F3: 來源不明的檔案'),
		value: 'f3',
		hideWhenUser: true
	},
	{
		label: wgULS('F4: 未知版权或版权无法被查证的文件', 'F4: 未知版權或版權無法被查證的檔案'),
		value: 'f4',
		hideWhenUser: true
	},
	{
		label: wgULS('F5: 被高分辨率或SVG档案取代的图片', 'F5: 被高解析度或SVG檔案取代的圖片'),
		value: 'f5',
		subgroup: {
			name: 'f5_filename',
			type: 'input',
			label: wgULS('新文件名：', '新檔案名：'),
			tooltip: wgULS('可不含“File:”前缀。', '可不含「File:」前綴。')
		}
	},
	{
		label: wgULS('F6: 没有被条目使用的非自由版权档案', 'F6: 沒有被條目使用的非自由版權檔案'),
		value: 'f6',
		hideWhenUser: true
	},
	{
		label: wgULS('F7: 与维基共享资源档案重复的档案', 'F7: 與維基共享資源檔案重複的檔案'),
		value: 'f7',
		subgroup: {
			name: 'f7_filename',
			type: 'input',
			label: wgULS('维基共享资源上的文件名：', '維基共享資源上的檔案名：'),
			value: Morebits.pageNameNorm,
			tooltip: wgULS('如与本文件名相同则可留空，可不含“File:”前缀。', '如與本檔案名相同則可留空，可不含「File:」字首。')
		},
		hideWhenMultiple: true
	},
	{
		label: wgULS('F8: 明显侵权之文件', 'F8: 明顯侵權之檔案'),
		value: 'f8',
		hideWhenUser: true
	},
	{
		label: wgULS('F9: 没有填写任何合理使用依据的非自由著作权文件', 'F9: 沒有填寫任何合理使用依據的非自由著作權檔案'),
		value: 'f9',
		hideWhenUser: true
	},
	{
		label: wgULS('F10: 可被替代的非自由著作权文件', 'F10: 可被替代的非自由著作權檔案'),
		value: 'f10',
		hideWhenUser: true
	}
];

Twinkle.speedy.articleList = [
	{
		label: wgULS('A1: 内容空泛（包括但不限于没有定义）。', 'A1: 內容空泛（包括但不限於沒有定義）。'),
		value: 'a1',
		tooltip: wgULS('条目的内容笼统，或甚至根本没有提及条目主体，使条目不能用以区分其他事物。例如：“他是一个很有趣的人，他创建了工厂和庄园。并且，顺便提一下，他的妻子也很好。”', '條目的內容籠統，或甚至根本沒有提及條目主體，使條目不能用以區分其他事物。例如：「他是一個很有趣的人，他建立了工廠和莊園。並且，順便提一下，他的妻子也很好。」')
	},
	{
		label: wgULS('A2: 内容只包括外部链接、参见、图书参考、分类、模板、跨语言链接的条目', 'A2: 內容只包括外部連結、參見、圖書參考、分類、模板、跨語言連結的條目'),
		value: 'a2',
		tooltip: wgULS('请注意：有些维基人创建条目时会分开多次保存，请避免删除有人正在工作的页面。带有{{inuse}}的不适用。', '請注意：有些維基人建立條目時會分開多次儲存，請避免刪除有人正在工作的頁面。帶有{{inuse}}的不適用。')
	},
	{
		label: wgULS('A3: 复制自其他中文维基计划，或是与其他中文维基计划内容相同的文章。', 'A3: 複製自其他中文維基計劃，或是與其他中文維基計劃內容相同的文章。'),
		value: 'a3',
		subgroup: {
			name: 'a3_pagename',
			type: 'input',
			label: wgULS('现有条目名：', '現有條目名：'),
			tooltip: wgULS('请加上跨 wiki 字首。不自动加上连结，若需要请自行加上[[]]。', '請加上跨 wiki 字首。不自動加上連結，若需要請自行加上[[]]。'),
			size: 60
		}
	},
	{
		label: wgULS('A5: 条目建立时之内容即与其他现有条目内容完全相同，且名称不适合做为其他条目之重定向。', 'A5: 條目建立時之內容即與其他現有條目內容完全相同，且名稱不適合做為其他條目之重定向。'),
		value: 'a5',
		tooltip: wgULS('条目被建立时，第一个版本的内容与当时其他现存条目完全相同，且这个条目的名称不适合改为重定向，就可以提送快速删除。如果名称可以作为重定向，就应直接改重定向，不要提送快速删除。如果是多个条目合并产生的新条目，不适用。如果是从主条目拆分产生的条目，不适用；如有疑虑，应提送存废讨论处理。', '條目被建立時，第一個版本的內容與當時其他現存條目完全相同，且這個條目的名稱不適合改為重定向，就可以提送快速刪除。如果名稱可以作為重定向，就應直接改重定向，不要提送快速刪除。如果是多個條目合併產生的新條目，不適用。如果是從主條目拆分產生的條目，不適用；如有疑慮，應提送存廢討論處理。'),
		subgroup: {
			name: 'a5_pagename',
			type: 'input',
			label: wgULS('现有条目名：', '現有條目名：'),
			size: 60
		}
	},
	{
		label: wgULS('A6: 复制自其他维基百科语言版本，且完全没有翻译。', 'A6: 複製自其他維基百科語言版本，且完全沒有翻譯。'),
		value: 'a6',
		tooltip: wgULS('如果并不是复制于任何其他的维基百科语言版本，请换用{{notmandarin}}。带有{{inuse}}和{{translating}}模板的不适用。', '如果並不是複製於任何其他的維基百科語言版本，請換用{{notmandarin}}。帶有{{inuse}}和{{translating}}模板的不適用。'),
		subgroup: {
			name: 'a6_pagename',
			type: 'input',
			label: wgULS('现有条目名：', '現有條目名：'),
			tooltip: wgULS('请加上跨 wiki 字首。不自动加上连结，若需要请自行加上[[]]。', '請加上跨 wiki 字首。不自動加上連結，若需要請自行加上[[]]。'),
			size: 60
		}
	}
];

Twinkle.speedy.categoryList = [
	{
		label: wgULS('O4: 空的分类（没有条目也没有子分类）。', 'O4: 空的分類（沒有條目也沒有子分類）。'),
		value: 'o4',
		tooltip: wgULS('不适用于Category:不要删除的分类中的空分类。', '不適用於Category:不要刪除的分類中的空分類。')
	}
];

Twinkle.speedy.draftList = [
	{
		label: wgULS('O7: 废弃草稿。', 'O7: 廢棄草稿。'),
		value: 'o7',
		tooltip: wgULS('任何六个月内无编辑之草稿。', '任何六個月內無編輯之草稿。')
	}
];

Twinkle.speedy.userList = [
	{
		label: wgULS('O1: 用户请求删除自己的用户页或其子页面。', 'O1: 使用者請求刪除自己的使用者頁面或其子頁面。'),
		value: 'o1',
		tooltip: wgULS('如果是从其他名字空间移动来的，须附有合理原因。', '如果是從其他命名空間移動來的，須附有合理原因。')
	}
];

Twinkle.speedy.usertalkList = [
	{
		label: wgULS('O3: 已超过一个月未有编辑动作的匿名（IP）用户的用户讨论页', 'O3: 已超過一個月未有編輯動作的匿名（IP）使用者的使用者討論頁'),
		value: 'o3',
		tooltip: wgULS('避免给使用同一IP地址的用户带来混淆。不适用于用户讨论页的存档页面。', '避免給使用同一IP位址的使用者帶來混淆。不適用於使用者討論頁的存檔頁面。')
	}
];

Twinkle.speedy.generalList = [
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
		label: wgULS('G8: 管理员因技术原因删除页面', 'G8: 管理員因技術原因刪除頁面'),
		value: 'g8',
		tooltip: wgULS('包括解封用户后删除用户页、因用户夺取而删除、删除MediaWiki页面、因移动请求而删除页面。', '包括解封使用者後刪除使用者頁面、因使用者奪取而刪除、刪除無用的MediaWiki頁面、因移動請求而刪除頁面。'),
		hideWhenUser: true
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
		label: wgULS('G13: 翻译拙劣', 'G13: 翻譯拙劣'),
		value: 'g13',
		tooltip: wgULS('不适用于所有的讨论名字空间、草稿名字空间和用户名字空间。', '不適用於所有的討論命名空間、草稿命名空間和使用者命名空間。'),
		hideInNamespaces: [ 1, 2, 3, 5, 7, 9, 11, 13, 15, 101, 118, 119, 829 ] // all talk, user, draft
	},
	{
		label: wgULS('G14: 超过两周没有进行任何翻译的非现代标准汉语页面', 'G14: 超過兩周沒有進行任何翻譯的非現代標準漢語頁面'),
		value: 'g14',
		tooltip: wgULS('包括所有未翻译的外语、汉语方言以及文言文。', '包括所有未翻譯的外語、漢語方言以及文言文。'),
		hideWhenUser: true,
		showInNamespaces: [ 0, 4, 12 ] // main, wikipedia, help
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
				label: wgULS('若另一页面已依侵权审核删除，请使用CSD G5。标记首次侵权的页面，请使用Twinkle的“侵权”功能。', '若另一頁面已依侵權審核刪除，請使用CSD G5。標記首次侵權的頁面，請使用Twinkle的「侵權」功能。')
			}
		]
	}
];

Twinkle.speedy.redirectList = [
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
		hideSubgroupWhenSysop: true
	},
	{
		label: wgULS('R5: 指向本身或循环的重定向。', 'R5: 指向本身或循環的重新導向。'),
		value: 'r5',
		tooltip: '如A→B→C→……→A。'
	},
	{
		label: wgULS('R6: 移动文件而产生的重定向，且页面标题不匹配文件名称指引。', 'R6: 移動檔案而產生的重新導向，且頁面標題不符合檔案名稱指引。'),
		value: 'r6',
		showInNamespaces: [ 6 ] // file
	},
	{
		label: wgULS('R7: 明显与导向目标所涵盖的主题无关或比导向目标所涵盖的主题更广泛的重定向。', 'R7: 明顯與導向目標所涵蓋的主題無關或比導向目標所涵蓋的主題更廣泛的重新導向。'),
		value: 'r7',
		tooltip: wgULS('挂有{{关注度重定向}}或{{合并重定向}}模板的页面不适用，请改为提出存废讨论。如有用户对标题用字存在未解决的争议，则应交由存废讨论处理。', '掛有{{關注度重定向}}或{{合併重定向}}模板的頁面不適用，請改為提出存廢討論。如有使用者對標題用字存在未解決的爭議，則應交由存廢討論處理。')
	}
];

Twinkle.speedy.normalizeHash = {
	'reason': 'db',
	'multiple': 'multiple',
	'multiple-finish': 'multiple-finish',
	'g1': 'g1',
	'g2': 'g2',
	'g3': 'g3',
	'g5': 'g5',
	'g8': 'g8',
	'g10': 'g10',
	'g11': 'g11',
	'g12': 'g12',
	'g13': 'g13',
	'g14': 'g14',
	'g15': 'g15',
	'g16': 'g16',
	'a1': 'a1',
	'a2': 'a2',
	'a3': 'a3',
	'a5': 'a5',
	'a6': 'a6',
	'r2': 'r2',
	'r3': 'r3',
	'r5': 'r5',
	'r6': 'r6',
	'r7': 'r7',
	'f1': 'f1',
	'f3': 'f3',
	'f4': 'f4',
	'f5': 'f5',
	'f6': 'f6',
	'f7': 'f7',
	'o1': 'o1',
	'o3': 'o3',
	'o4': 'o4',
	'o7': 'o7'
};

Twinkle.speedy.callbacks = {
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
				$.extend(params.utparams, Twinkle.speedy.getUserTalkParameters(norm, parameters));
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
			params.utparams = Twinkle.speedy.getUserTalkParameters(params.normalizeds[0], parameters);
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

	sysop: {
		main: function(params) {
			var reason;

			if (!params.normalizeds.length && params.normalizeds[0] === 'db') {
				reason = prompt(wgULS('输入删除理由：', '輸入刪除理由：'), '');
				Twinkle.speedy.callbacks.sysop.deletePage(reason, params);
			} else {
				var code = Twinkle.speedy.callbacks.getTemplateCodeAndParams(params)[0];
				Twinkle.speedy.callbacks.parseWikitext(mw.config.get('wgPageName'), code, function(reason) {
					if (params.promptForSummary) {
						reason = prompt(wgULS('输入删除理由，或点击确定以接受自动生成的：', '輸入刪除理由，或點選確定以接受自動生成的：'), reason);
					}
					Twinkle.speedy.callbacks.sysop.deletePage(reason, params);
				});
			}
		},
		deletePage: function(reason, params) {
			var thispage = new Morebits.wiki.page(mw.config.get('wgPageName'), wgULS('删除页面', '刪除頁面'));

			if (mw.config.get('wgPageName') === mw.config.get('wgMainPageTitle')) {
				var statusElement = thispage.getStatusElement();
				new mw.Api().getToken('block').then(function(token) {
					statusElement.status('The Enrichment Center is required to remind you that you will be baked. 恭喜您！您是继[[User:燃玉]]之后又一个通过Twinkle删除首页的管理员！');

					var mbApi = new Morebits.wiki.api('颁发荣誉', {
						action: 'block',
						user: mw.config.get('wgUserName'),
						reason: '试图[[Wikipedia:不要删除首页|像User:燃玉那样创造奇迹]]' + Twinkle.getPref('deletionSummaryAd'),
						allowusertalk: true,
						expiry: '31 hours',
						tags: Twinkle.getPref('revisionTags'),
						token: token
					}, function() {
						statusElement.info(wgULS('请记得阅读[[Wikipedia:不要删除首页]]。', '請記得閱讀[[Wikipedia:不要刪除首頁]]。'));
					});
					mbApi.post();
				}, function() {
					statusElement.error(wgULS('未能抓取操作令牌', '未能擷取操作權杖'));
				});
			} else {
				if (reason === null) {
					return Morebits.status.error(wgULS('询问理由', '詢問理由'), wgULS('用户取消操作。', '用戶取消操作。'));
				} else if (!reason || !reason.replace(/^\s*/, '').replace(/\s*$/, '')) {
					return Morebits.status.error(wgULS('询问理由', '詢問理由'), wgULS('你不给我理由…我就…不管了…', '你不給我理由…我就…不管了…'));
				}

				var deleteMain = function() {
					thispage.setEditSummary(reason + Twinkle.getPref('deletionSummaryAd'));
					thispage.setTags(Twinkle.getPref('revisionTags'));
					thispage.deletePage(function() {
						thispage.getStatusElement().info('完成');
						Twinkle.speedy.callbacks.sysop.deleteTalk(params);
					});
				};

				// look up initial contributor. If prompting user for deletion reason, just display a link.
				// Otherwise open the talk page directly
				if (params.openUserTalk) {
					thispage.setCallbackParameters(params);
					thispage.lookupCreation(function() {
						Twinkle.speedy.callbacks.sysop.openUserTalkPage(thispage);
						deleteMain();
					});
				} else {
					deleteMain();
				}
			}
		},
		deleteTalk: function(params) {
			// delete talk page
			if (params.deleteTalkPage &&
					params.normalized !== 'f7' &&
					params.normalized !== 'o1' &&
					document.getElementById('ca-talk').className !== 'new') {
				var talkpage = new Morebits.wiki.page(Morebits.wikipedia.namespaces[mw.config.get('wgNamespaceNumber') + 1] + ':' + mw.config.get('wgTitle'), wgULS('删除讨论页', '刪除討論頁'));
				talkpage.setEditSummary('[[WP:CSD#G15|G15]]: 孤立页面: 已删除页面“' + Morebits.pageNameNorm + '”的讨论页' + Twinkle.getPref('deletionSummaryAd'));
				talkpage.setTags(Twinkle.getPref('revisionTags'));
				talkpage.deletePage();
				// this is ugly, but because of the architecture of wiki.api, it is needed
				// (otherwise success/failure messages for the previous action would be suppressed)
				window.setTimeout(function() {
					Twinkle.speedy.callbacks.sysop.deleteRedirects(params);
				}, 1800);
			} else {
				Twinkle.speedy.callbacks.sysop.deleteRedirects(params);
			}
		},
		deleteRedirects: function(params) {
			// delete redirects
			if (params.deleteRedirects) {
				var query = {
					'action': 'query',
					'titles': mw.config.get('wgPageName'),
					'prop': 'redirects',
					'rdlimit': 5000  // 500 is max for normal users, 5000 for bots and sysops
				};
				var wikipedia_api = new Morebits.wiki.api(wgULS('获取重定向列表…', '取得重定向清單…'), query, Twinkle.speedy.callbacks.sysop.deleteRedirectsMain,
					new Morebits.status(wgULS('删除重定向', '刪除重定向')));
				wikipedia_api.params = params;
				wikipedia_api.post();
			}

			// prompt for protect on G11
			var $link, $bigtext;
			if (params.normalized === 'g11') {
				$link = $('<a/>', {
					'href': '#',
					'text': wgULS('点击这里施行保护', '點選這裡施行保護'),
					'css': { 'fontSize': '130%', 'fontWeight': 'bold' },
					'click': function() {
						Morebits.wiki.actionCompleted.redirect = null;
						Twinkle.speedy.dialog.close();
						mw.config.set('wgArticleId', 0);
						Twinkle.protect.callback();
					}
				});
				$bigtext = $('<span/>', {
					'text': wgULS('白纸保护该页', '白紙保護該頁'),
					'css': { 'fontSize': '130%', 'fontWeight': 'bold' }
				});
				Morebits.status.info($bigtext[0], $link[0]);
			}

			// promote Unlink tool
			if (mw.config.get('wgNamespaceNumber') === 6 && params.normalized !== 'f7') {
				$link = $('<a/>', {
					'href': '#',
					'text': wgULS('点击这里前往反链工具', '點選這裏前往反鏈工具'),
					'css': { 'fontWeight': 'bold' },
					'click': function() {
						Morebits.wiki.actionCompleted.redirect = null;
						Twinkle.speedy.dialog.close();
						Twinkle.unlink.callback(wgULS('取消对已删除文件 ', '取消對已刪除檔案 ') + Morebits.pageNameNorm + ' 的使用');
					}
				});
				$bigtext = $('<span/>', {
					'text': wgULS('取消对已删除文件的使用', '取消對已刪除檔案的使用'),
					'css': { 'fontWeight': 'bold' }
				});
				Morebits.status.info($bigtext[0], $link[0]);
			} else if (params.normalized !== 'f7') {
				$link = $('<a/>', {
					'href': '#',
					'text': wgULS('点击这里前往反链工具', '點選這裏前往反鏈工具'),
					'css': { 'fontWeight': 'bold' },
					'click': function() {
						Morebits.wiki.actionCompleted.redirect = null;
						Twinkle.speedy.dialog.close();
						Twinkle.unlink.callback(wgULS('取消对已删除页面 ', '取消對已刪除頁面 ') + Morebits.pageNameNorm + wgULS(' 的链接', ' 的連結'));
					}
				});
				$bigtext = $('<span/>', {
					'text': wgULS('取消对已删除页面的链接', '取消對已刪除頁面的連結'),
					'css': { 'fontWeight': 'bold' }
				});
				Morebits.status.info($bigtext[0], $link[0]);
			}
		},
		openUserTalkPage: function(pageobj) {
			pageobj.getStatusElement().unlink();  // don't need it anymore
			var user = pageobj.getCreator();
			var params = pageobj.getCallbackParameters();

			var query = {
				'title': 'User talk:' + user,
				'action': 'edit',
				'preview': 'yes',
				'vanarticle': Morebits.pageNameNorm
			};

			if (params.normalized === 'db' || Twinkle.getPref('promptForSpeedyDeletionSummary').indexOf(params.normalized) !== -1) {
				// provide a link to the user talk page
				var $link, $bigtext;
				$link = $('<a/>', {
					'href': mw.util.wikiScript('index') + '?' + $.param(query),
					'text': wgULS('点此打开User talk:', '點此開啟User talk:') + user,
					'target': '_blank',
					'css': { 'fontSize': '130%', 'fontWeight': 'bold' }
				});
				$bigtext = $('<span/>', {
					'text': wgULS('通知页面创建者', '通知頁面建立者'),
					'css': { 'fontSize': '130%', 'fontWeight': 'bold' }
				});
				Morebits.status.info($bigtext[0], $link[0]);
			} else {
				// open the initial contributor's talk page
				var statusIndicator = new Morebits.status(wgULS('打开用户' + user + '对话页编辑表单', '開啟用戶' + user + '對話頁編輯表單'), wgULS('打开中…', '開啟中…'));

				switch (Twinkle.getPref('userTalkPageMode')) {
					case 'tab':
						window.open(mw.util.wikiScript('index') + '?' + $.param(query), '_blank');
						break;
					case 'blank':
						window.open(mw.util.wikiScript('index') + '?' + $.param(query), '_blank', 'location=no,toolbar=no,status=no,directories=no,scrollbars=yes,width=1200,height=800');
						break;
					case 'window':
					/* falls through */
					default:
						window.open(mw.util.wikiScript('index') + '?' + $.param(query),
							window.name === 'twinklewarnwindow' ? '_blank' : 'twinklewarnwindow',
							'location=no,toolbar=no,status=no,directories=no,scrollbars=yes,width=1200,height=800');
						break;
				}

				statusIndicator.info('完成');
			}
		},
		deleteRedirectsMain: function(apiobj) {
			var xmlDoc = apiobj.getXML();
			var $snapshot = $(xmlDoc).find('redirects rd');
			var total = $snapshot.length;
			var statusIndicator = apiobj.statelem;

			if (!total) {
				statusIndicator.status(wgULS('未发现重定向', '未發現重定向'));
				return;
			}

			statusIndicator.status('0%');

			var current = 0;
			var onsuccess = function(apiobjInner) {
				var now = parseInt(100 * ++current / total, 10) + '%';
				statusIndicator.update(now);
				apiobjInner.statelem.unlink();
				if (current >= total) {
					statusIndicator.info(now + '（完成）');
					Morebits.wiki.removeCheckpoint();
				}
			};

			Morebits.wiki.addCheckpoint();

			$snapshot.each(function(key, value) {
				var title = $(value).attr('title');
				var page = new Morebits.wiki.page(title, wgULS('删除重定向 "', '刪除重定向 "') + title + '"');
				page.setEditSummary('[[WP:CSD#G15|G15]]: 孤立页面: 重定向到已删除页面“' + Morebits.pageNameNorm + '”' + Twinkle.getPref('deletionSummaryAd'));
				page.setTags(Twinkle.getPref('revisionTags'));
				page.deletePage(onsuccess);
			});
		}
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
			var buildData = Twinkle.speedy.callbacks.getTemplateCodeAndParams(params),
				code = buildData[0];
			params.utparams = buildData[1];

			var thispage = new Morebits.wiki.page(mw.config.get('wgPageName'));
			// patrol the page, if reached from Special:NewPages
			if (Twinkle.getPref('markSpeedyPagesAsPatrolled')) {
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
			pageobj.setEditSummary(editsummary + Twinkle.getPref('summaryAd'));
			pageobj.setTags(Twinkle.getPref('revisionTags'));
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
			pageobj.save(Twinkle.speedy.callbacks.user.tagComplete);
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
						Morebits.status.warn(wgULS('通知页面创建者：用户创建了自己的对话页', '通知頁面建立者：用戶建立了自己的對話頁'));
						initialContrib = null;

					// quick hack to prevent excessive unwanted notifications. Should actually be configurable on recipient page...
					} else if (initialContrib === 'A2093064-bot' && params.normalizeds[0] === 'g15') {
						Morebits.status.warn(wgULS('通知页面创建者：由机器人建立，跳过通知', '通知頁面建立者：由機器人建立，跳過通知'));
						initialContrib = null;

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
							usertalkpage.setEditSummary(editsummary + Twinkle.getPref('summaryAd'));
							usertalkpage.setTags(Twinkle.getPref('revisionTags'));
							usertalkpage.setCreateOption('recreate');
							usertalkpage.setFollowRedirect(true);
							usertalkpage.append();
						});
					}

					// add this nomination to the user's userspace log, if the user has enabled it
					if (params.lognomination) {
						Twinkle.speedy.callbacks.user.addToLog(params, initialContrib);
					}
				};
				var thispage = new Morebits.wiki.page(Morebits.pageNameNorm);
				thispage.lookupCreator(callback);
			// or, if not notifying, add this nomination to the user's userspace log without the initial contributor's name
			} else if (params.lognomination) {
				Twinkle.speedy.callbacks.user.addToLog(params, null);
			}
		},

		// note: this code is also invoked from twinkleimage
		// the params used are:
		//   for CSD: params.values, params.normalizeds  (note: normalizeds is an array)
		//   for DI: params.fromDI = true, params.templatename, params.normalized  (note: normalized is a string)
		addToLog: function(params, initialContrib) {
			var wikipedia_page = new Morebits.wiki.page('User:' + mw.config.get('wgUserName') + '/' + Twinkle.getPref('speedyLogPageName'), wgULS('添加项目到用户日志', '加入項目到用戶日誌'));
			params.logInitialContrib = initialContrib;
			wikipedia_page.setFollowRedirect(true);
			wikipedia_page.setCallbackParameters(params);
			wikipedia_page.load(Twinkle.speedy.callbacks.user.saveLog);
		},

		saveLog: function(pageobj) {
			var text = pageobj.getPageText();
			var params = pageobj.getCallbackParameters();

			var appendText = '';

			// add blurb if log page doesn't exist
			if (!pageobj.exists()) {
				appendText +=
					'这是该用户使用[[WP:TW|Twinkle]]的速删模块做出的[[WP:CSD|快速删除]]提名列表。\n\n' +
					'如果您不再想保留此日志，请在[[' + Twinkle.getPref('configPage') + '|参数设置]]中关掉，并' +
					'使用[[WP:CSD#O1|CSD O1]]提交快速删除。\n';
				if (Morebits.userIsSysop) {
					appendText += '\n此日志并不记录用Twinkle直接执行的删除。\n';
				}
			}

			// create monthly header
			var date = new Morebits.date(pageobj.getLoadTime());
			if (!date.monthHeaderRegex().test(text)) {
				appendText += '\n\n' + date.monthHeader(3);
			}

			appendText += '\n# [[:' + Morebits.pageNameNorm + ']]: ';
			if (params.fromDI) {
				if (params.normalized === 'f3 f4') {
					appendText += '图版[[WP:CSD#F3|CSD F3]]+[[WP:CSD#F4|CSD F4]]（{{tl|no source no license/auto}}）';
				} else {
					appendText += '图版[[WP:CSD#' + params.normalized.toUpperCase() + '|CSD ' + params.normalized.toUpperCase() + ']]（{{tl|' + params.templatename + '}}）';
				}
			} else {
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
			}

			if (params.logInitialContrib) {
				appendText += '；通知{{user|' + params.logInitialContrib + '}}';
			}
			appendText += ' ~~~~~\n';

			pageobj.setAppendText(appendText);
			pageobj.setEditSummary(wgULS('记录对[[', '記錄對[[') + Morebits.pageNameNorm + wgULS(']]的快速删除提名', ']]的快速刪除提名') + Twinkle.getPref('summaryAd'));
			pageobj.setTags(Twinkle.getPref('revisionTags'));
			pageobj.setCreateOption('recreate');
			pageobj.append();
		}
	}
};

// validate subgroups in the form passed into the speedy deletion tag
Twinkle.speedy.getParameters = function twinklespeedyGetParameters(form, values) {
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

			case 'a5':
				if (form['csd.a5_pagename']) {
					var otherpage = form['csd.a5_pagename'].value;
					if (!otherpage || !otherpage.trim()) {
						alert(wgULS('CSD A5：请提供现有条目的名称。', 'CSD A5：請提供現有條目的名稱。'));
						parameters = null;
						return false;
					}
					currentParams.pagename = otherpage;
				}
				break;

			case 'a6':
				if (form['csd.a6_pagename'] && form['csd.a6_pagename'].value) {
					currentParams.pagename = form['csd.a6_pagename'].value;
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

			case 'f1':
				if (form['csd.f1_filename']) {
					redimage = form['csd.f1_filename'].value;
					if (!redimage || !redimage.trim()) {
						alert(wgULS('CSD F1：请提供另一文件的名称。', 'CSD F1：請提供另一檔案的名稱。'));
						parameters = null;
						return false;
					}
					currentParams.filename = redimage.replace(/^\s*(Image|File|文件|檔案):/i, '');
				}
				break;

			case 'f5':
				if (form['csd.f5_filename']) {
					redimage = form['csd.f5_filename'].value;
					if (!redimage || !redimage.trim()) {
						alert(wgULS('CSD F5：请提供另一文件的名称。', 'CSD F5：請提供另一檔案的名稱。'));
						parameters = null;
						return false;
					}
					currentParams.filename = redimage.replace(/^\s*(Image|File|文件|檔案):/i, '');
				}
				break;

			case 'f7':
				if (form['csd.f7_filename']) {
					var filename = form['csd.f7_filename'].value;
					if (filename && filename !== Morebits.pageNameNorm) {
						if (filename.indexOf('Image:') === 0 || filename.indexOf('File:') === 0 ||
							filename.indexOf('文件:') === 0 || filename.indexOf('檔案:') === 0) {
							currentParams['1'] = filename;
						} else {
							currentParams['1'] = 'File:' + filename;
						}
					}
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
Twinkle.speedy.getUserTalkParameters = function twinklespeedyGetUserTalkParameters(normalized, parameters) { // eslint-disable-line no-unused-vars
	var utparams = [];
	switch (normalized) {
		default:
			break;
	}
	return utparams;
};


Twinkle.speedy.resolveCsdValues = function twinklespeedyResolveCsdValues(e) {
	var values = (e.target.form ? e.target.form : e.target).getChecked('csd');
	if (values.length === 0) {
		alert(wgULS('请选择一个理据！', '請選擇一個理據！'));
		return null;
	}
	return values;
};

Twinkle.speedy.callback.evaluateSysop = function twinklespeedyCallbackEvaluateSysop(e) {
	var form = e.target.form ? e.target.form : e.target;

	if (e.target.type === 'checkbox' || e.target.type === 'text' ||
			e.target.type === 'select') {
		return;
	}

	var tag_only = form.tag_only;
	if (tag_only && tag_only.checked) {
		Twinkle.speedy.callback.evaluateUser(e);
		return;
	}

	var values = Twinkle.speedy.resolveCsdValues(e);
	if (!values) {
		return;
	}

	var normalizeds = values.map(function(value) {
		return Twinkle.speedy.normalizeHash[value];
	});

	// analyse each criterion to determine whether to watch the page, prompt for summary, or open user talk page
	var watchPage, promptForSummary;
	normalizeds.forEach(function(norm) {
		if (Twinkle.getPref('watchSpeedyPages').indexOf(norm) !== -1) {
			watchPage = true;
		}
		if (Twinkle.getPref('promptForSpeedyDeletionSummary').indexOf(norm) !== -1) {
			promptForSummary = true;
		}
	});

	var params = {
		values: values,
		normalizeds: normalizeds,
		watch: watchPage,
		deleteTalkPage: form.talkpage && form.talkpage.checked,
		deleteRedirects: form.redirects.checked,
		openUserTalk: form.openusertalk.checked,
		promptForSummary: promptForSummary,
		templateParams: Twinkle.speedy.getParameters(form, values)
	};
	if (!params.templateParams) {
		return;
	}

	Morebits.simpleWindow.setButtonsEnabled(false);
	Morebits.status.init(form);

	Twinkle.speedy.callbacks.sysop.main(params);
};

Twinkle.speedy.callback.evaluateUser = function twinklespeedyCallbackEvaluateUser(e) {
	var form = e.target.form ? e.target.form : e.target;

	if (e.target.type === 'checkbox' || e.target.type === 'text' ||
			e.target.type === 'select') {
		return;
	}

	var values = Twinkle.speedy.resolveCsdValues(e);
	if (!values) {
		return;
	}
	// var multiple = form.multiple.checked;
	var normalizeds = [];
	$.each(values, function(index, value) {
		var norm = Twinkle.speedy.normalizeHash[value];

		normalizeds.push(norm);
	});

	// analyse each criterion to determine whether to watch the page/notify the creator
	var watchPage = false;
	$.each(normalizeds, function(index, norm) {
		if (Twinkle.getPref('watchSpeedyPages').indexOf(norm) !== -1) {
			watchPage = true;
			return false;  // break
		}
	});

	var notifyuser = false;
	if (form.notify.checked) {
		$.each(normalizeds, function(index, norm) {
			if (Twinkle.getPref('notifyUserOnSpeedyDeletionNomination').indexOf(norm) !== -1) {
				notifyuser = true;
				return false;  // break
			}
		});
	}

	var welcomeuser = false;
	if (notifyuser) {
		$.each(normalizeds, function(index, norm) {
			if (Twinkle.getPref('welcomeUserOnSpeedyDeletionNotification').indexOf(norm) !== -1) {
				welcomeuser = true;
				return false;  // break
			}
		});
	}

	var csdlog = false;
	if (Twinkle.getPref('logSpeedyNominations')) {
		$.each(normalizeds, function(index, norm) {
			if (Twinkle.getPref('noLogOnSpeedyNomination').indexOf(norm) === -1) {
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
		templateParams: Twinkle.speedy.getParameters(form, values),
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
	wikipedia_page.load(Twinkle.speedy.callbacks.user.main);
};
})(jQuery);


// </nowiki>
