(function ($) {
	$(function () {
		initMobileNav();
	});

	function initMobileNav() {
		$('#nav').mobileNav({
			hideOnClickOutside: true,
			menuActiveClass: 'nav-active',
			menuOpener: '.nav-opener',
			menuDrop: '.nav-drop'
		});
	}
})(jQuery);