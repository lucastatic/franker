var frankerUserStyle;
var frankerInjectBefore = false;
var frankerInjectBrackets = true;

// ==== Message Management ====

function frankerInjectHandleMessage(msgEvent) {
	switch (msgEvent.name) {
		// main (frankate selection)
		case "frankateSelection":
			frankerInjectFrankate();
			break;
		case "frankateSelectionResponse":
			if (msgEvent.message.length == 0) {
				alert('Franker error: No translation received.\nEither autodetect failed or Google Translate does not support this language pair.');
				return;
			}
			if (frankerCoreGetSelectedText(document, true) == "") {
				break;
			}
			frankerCoreInjectTranslation(document, msgEvent.message, frankerUserStyle, frankerInjectBefore, frankerInjectBrackets);
			frankerInjectTranslateNextSentence();
			break;

		// settings (shortcuts and style)
		case "shortcutFrankateSelectionValue":
			frankerInjectSetShortcut(msgEvent, frankerInjectFrankate);
			break;
		case "shortcutFrankateClearValue":
			frankerInjectSetShortcut(msgEvent, frankerInjectClear);
			break;
		case "styleDestinationValue":
			frankerUserStyle = msgEvent.message;
			break;
		case "injectBeforeValue":
			frankerInjectBefore = msgEvent.message;
			break;
		case "injectBracketsValue":
			frankerInjectBrackets = msgEvent.message;
			break;

		// extra (frankate page)
		case "frankatePage":
			frankerInjectFrankatePage();
			break;
		case "shortcutFrankatePageValue":
			frankerInjectSetShortcut(msgEvent, frankerInjectFrankatePage);
			break;
		case "statePageEnabledValue":
			if (msgEvent.message == true && document.location.href.indexOf("translate.googleusercontent.com", 0) >= 0) {
				frankerInjectTransformGoogleTranslationBlocks();
			}
			break;
	}
}


// ==== Shortcuts ====

function frankerInjectSetShortcut(msgEvent, func) {
	var values = msgEvent.message.split(":");
	if (values.length > 1) {
		shortcut.remove(values[1]);
	}
	shortcut.remove(values[0]); // must remove first to ensure we do not duplicate the shortcut
	shortcut.add(values[0], func, {
			'type':'keydown',
			'propagate':false,
			'disable_in_input':true,
			'target':document
	});
}

function frankerInjectFrankate() {
	if (frankerCoreInit(document) == 0) {
		frankerInjectCoverShow();
		frankerInjectTranslateNextSentence();
	} else if (window == window.top) {
		alert('Franker error: No text selected.\nPlease, select text and try again.');
	}
}

function frankerInjectTranslateNextSentence() {
	var srcText = "";
	while (srcText == "") {
		if (frankerCoreSelectNextSentence(document) != 0) {
			frankerInjectCoverHide();
			return;
		}
		srcText = frankerCoreGetSelectedText(document, true);
	}
	safari.self.tab.dispatchMessage("frankateSelectionRequest", srcText);
}

function frankerInjectClear() {
	frankerCoreClean(document);
}


// ==== Extra ====

function frankerInjectFrankatePage() {
	safari.self.tab.dispatchMessage("frankatePageRequest", "");
}

function frankerInjectTransformGoogleTranslationBlocks() {
	var spans = document.getElementsByTagName('span');
	var i;
	for (i = 0; i < spans.length; i++) {
		if (spans[i].getAttribute('onmouseover')) {
			var dstSpan = spans[i];
			var srcSpan = spans[i+1];
			dstSpan.setAttribute('class', 'franker-dst-text');
			dstSpan.setAttribute("style", frankerUserStyle);
			dstSpan.removeAttribute('onmouseover');
			dstSpan.removeAttribute('onmouseout');
			// moving the source text's span out of the current span (not required now)
			dstSpan.parentNode.insertBefore(srcSpan, dstSpan);
			dstSpan.textContent = ' (' + dstSpan.textContent.replace(/^\s*/, "").replace(/\s*$/, "") + ') '; 
		}
		if (spans[i].className == "google-src-text") {
		 	spans[i].style.display = "inline !important";
		}
	}
}


// ==== Cover ====

function frankerInjectPutInCenter(element) { 
	var d = document; 
	var rootElm = d.body; //(d.documentelement && d.compatMode == 'CSS1Compat') ? d.documentelement : d.body; 
	var vpw = self.innerWidth ? self.innerWidth : rootElm.clientWidth; // viewport width 
	var vph = self.innerHeight ? self.innerHeight : rootElm.clientHeight; // viewport height 
	var myDiv = element; //d.getelementById(id); 
	myDiv.style.position = 'absolute'; 
	myDiv.style.left = ((vpw - 100) / 2) + 'px';  
	myDiv.style.top = (rootElm.scrollTop + (vph - 100)/2 ) + 'px'; 
}

function frankerInjectCoverShow() {
	var cover = document.getElementById('frankercover');
	cover.style.height = document.body.clientHeight+"px";
	cover.style.display = "block";
	var coverText = document.getElementById('frankercovertext');
	frankerInjectPutInCenter(coverText);
	coverText.style.display = "block";
}

function frankerInjectCoverHide() {
	document.getElementById('frankercover').style.display = "none";
	document.getElementById('frankercovertext').style.display = "none";
}


// ==== Initial ====

function init() {
	// - listener -
	safari.self.addEventListener("message", frankerInjectHandleMessage, false);

	// - settings -
	safari.self.tab.dispatchMessage("shortcutFrankateSelectionRequest", "");
	safari.self.tab.dispatchMessage("shortcutFrankateClearRequest", "");
	safari.self.tab.dispatchMessage("styleDestinationRequest", "");
	safari.self.tab.dispatchMessage("injectBeforeRequest", "");
	safari.self.tab.dispatchMessage("injectBracketsRequest", "");

	safari.self.tab.dispatchMessage("shortcutFrankatePageRequest", "");
	safari.self.tab.dispatchMessage("statePageEnabledRequest", "");

	// - cover -
	var cover = document.createElement('div');
	cover.id = "frankercover";
	cover.setAttribute("onmousedown","var event = arguments[0] || window.event; event.preventDefault();");

	var coverText = document.createElement('div');
	coverText.id = "frankercovertext";
	coverText.appendChild(document.createTextNode("Frankating..."));
	
	cover.appendChild(coverText);
	document.body.appendChild(cover);
}

// filtering out weird pages (like facebook blocks on dn.se)
if (document.body != null) {
	init();
}