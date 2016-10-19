(function($) {
	$(function () {
		initMobileNav();
		initTabs();
		initCycleCarousel();
		initPlaceholder();
	});

	function initMobileNav() {
		$('#nav').mobileNav({
			menuActiveClass: 'active',
			menuOpener: '.opener'
		});
	}

	function initCycleCarousel() {
		$('.slideshow').scrollAbsoluteGallery({
			mask: '.mask',
			slider: '.slideset',
			slides: '.slide',
			btnPrev: 'a.btn-prev',
			btnNext: 'a.btn-next',
			pagerLinks: '.pagination li',
			stretchSlideToMask: true,
			pauseOnHover: true,
			maskAutoSize: true,
			autoRotation: true,
			switchTime: 3000,
			animSpeed: 500
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
