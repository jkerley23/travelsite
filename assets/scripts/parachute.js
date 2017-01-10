(function($) {
    $(function() {
        initCycleCarousel();
        initTabs();
        initPlaceholder();
    });

    function initCycleCarousel() {
        var slideShow = $('.slideshow'),
            fullScreenButtonClassName = '.fullscreen-button',
            fullScreenButton = slideShow.find(fullScreenButtonClassName),
            slideShowOptions = {
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
                forceMaskHeightValue: '500px',
                animSpeed: 500,
                hideNextPrevButtonsIfTouchDevice: true,
                swipeThreshold: 90
            },
            modalOptions = {
                fadeDuration: 250,
                fadeDelay: 0.8,
                closeClass: 'close-button'
            },
            slideshowFullscreenClone;

        slideShow.scrollAbsoluteGallery(slideShowOptions);
        fullScreenButton.on('click', popUpSlideshow);

        function popUpSlideshow(event) {
            event.preventDefault();
            event.stopPropagation();

            slideshowFullscreenClone = slideShow.clone()
                .modal(modalOptions)
                .on($.modal.OPEN, setGalleryOnModal)
                .on($.modal.AFTER_CLOSE, clearClone);

            function setGalleryOnModal() {
                var cloneSlideshowOptions = $.extend({}, slideShowOptions, {forceMaskHeightValue: '85%'});

                slideshowFullscreenClone.scrollAbsoluteGallery(cloneSlideshowOptions)
                    .find(fullScreenButtonClassName)
                    .hide();
            }

            function clearClone() {
                slideshowFullscreenClone = null;
            }
        }
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
