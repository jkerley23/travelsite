(function($, window, navigator, document) {
	$(function() {
		var site = $('head meta[data-siteidentifier]').data('siteidentifier') ||
			// Redo this fallback if more sites are added on:
			(window.location.href.indexOf('/soundslocal/') === -1 ? 'parachute' : 'soundslocal');

		initMobileMyMaps(site);
		initMobileNav(site);
	});

	function initMobileMyMaps(site) {
		var isTouchDevice = /Windows Phone/.test(navigator.userAgent) ||
				'ontouchstart' in window ||
				window.DocumentTouch && document instanceof DocumentTouch,

			minScrollerWidthRef = {
				parachute: '767px',
				soundslocal: '1023px'
			};

		$('iframe').insertClickToUncoverElement({
			addTouchEvents: isTouchDevice,
			blockerClass: 'unlockable-blocker',
			blockerText: (isTouchDevice ? 'Press and hold' : 'Click') + ' to unlock the map.',
			leaveScrollableArea: true,
			scrollerClass: 'blocker-scroller',
			enableScrollerAtWidth: minScrollerWidthRef[site],
			scrollerWidth: '50px',
			scrollerSide: 'left',
			doEnableQueryCallback: checkIfNeeded
		});

		function checkIfNeeded(jQueryElement) {
			var srcValue = jQueryElement.attr('src');
			return srcValue && srcValue.indexOf('embed/my-maps') !== -1;
		}
	}

	function initMobileNav(site) {
		//TODO: Change markdown and css of Parachute to combine these.
		var optionsRef = {
			parachute: {
				menuActiveClass: 'active',
				menuOpener: '.opener'
			},
			soundslocal: {
				hideOnClickOutside: true,
				menuActiveClass: 'nav-active',
				menuOpener: '.nav-opener',
				menuDrop: '.nav-drop'
			}
		};

		$('#nav').mobileNav(optionsRef[site]);
	}
})(jQuery, window, navigator, document);
