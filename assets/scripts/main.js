(function($) {
	$(function () {
		initMobileMyMaps();
	});

	function initMobileMyMaps() {
		var isTouchDevice = /Windows Phone/.test(navigator.userAgent) ||
			'ontouchstart' in window ||
			window.DocumentTouch && document instanceof DocumentTouch;

		$('iframe').insertClickToUncoverElement({
			addTouchEvents: isTouchDevice,
			blockerClass: 'unlockable-blocker',
			blockerText: (isTouchDevice ? 'Press and hold' : 'Click') + ' to unlock the map.',
			leaveScrollableArea: true,
			scrollerClass: 'blocker-scroller',
			enableScrollerAtWidth: '767px',
			scrollerWidth: '50px',
			scrollerSide: 'left',
			doEnableQueryCallback: checkIfNeeded
		});

		function checkIfNeeded($Element) {
			var srcValue = $Element.attr('src');
			return srcValue && srcValue.indexOf('embed/my-maps') !== -1;
		}
	}
})(jQuery);
