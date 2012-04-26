function frankerReadabilityUnbindClick() {
	$('#rdb-application')[0].appendChild($('#rdb-article')[0]);
	$('#rdb-application')[0].appendChild($('#rdb-footer')[0]);
	$('#rdb-application')[0].removeChild($('#rdb-scrollwrap-outer')[0]);
	//$('article.article').unbind('click');
	//$('article.article').unbind('touchmove');
	//$('article.article').find('section.article-content, #menu-tip').unbind('click');
	//$('article.article').find('section.article-content, #menu-tip').unbind('touchmove');
}

function frankerReadabilityHideTip() {
	readability.mobile.single.hideMenuTip(true)
}

function frankerReadabilityToggleStyles() {
	window.scrollTo(0,0);
	if (document.location.href.indexOf("readability.com/") > 0) {
		$("#rdb-actions a[href='#settings']").trigger('click');	
	} else if (document.location.href.indexOf("instapaper.com/read/") > 0 || document.location.href.indexOf("instapaper.com/text") > 0) {
		dropMenu('textcontrolsmenu');
	}
	//readability.mobile.single.toggleStyles(true);
	//readability.mobile.single.toggleNav(true);
}

frankerReadabilityUnbindClick();
frankerReadabilityHideTip();