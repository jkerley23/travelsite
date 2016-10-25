(function($) {
	$(function() {
		initCycleCarousel();
		initTabs();
		initPlaceholder();
	});

	function initCycleCarousel() {
		$('.slideshow').scrollAbsoluteGallery({
			mask: '.mask',
			slider: '.slideset',
			slides: '.slide',
			btnPrev: 'a.ss-arrow.arrow-prev',
			btnNext: 'a.ss-arrow.arrow-next',
			swipeHint: '.slide-swipe-hint',
			pagerLinks: '.ss-pagination li',
			stretchSlideToMask: true,
			pauseOnHover: true,
			maskAutoSize: false,
			forceMaskHeightValue: '375px',
			animSpeed: 500,
			hideNextPrevButtonsIfTouchDevice: true,
			swipeThreshold: 90
		});
	}

	function initTabs() {
		$('ul.tabset').contentTabs({
			addToParent: true,
			tabLinks: 'a'
		});
	}

	function initPlaceholder() {
		$('input, textarea').placeholder();
	}
})(jQuery);
