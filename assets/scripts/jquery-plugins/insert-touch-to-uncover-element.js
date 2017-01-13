(function($, Hammer, window) {
	if(!$) {
		throw new Error('jQuery is required for this plugin.');
	}

	// Attach plugin to jQuery
	$.fn.insertClickToUncoverElement = function(opt){
		return this.each(function(){
			$(this).data('InsertClickToUncoverElement', new InsertClickToUncoverElement($.extend(opt,{holder:this})));
		});
	};

	function InsertClickToUncoverElement(options) {
		var element, doEnableQueryCallback, blocker, blockerClass, touchHandler, blockerDisabled;

		if(options.addTouchEvents && !Hammer) {
			console.error('Hammer.JS is required to handle touch events. Continuing without touch functionality.');
			options.addTouchEvents = false;
		}

		// Default options
		this.options = $.extend({
			addTouchEvents: false,
			blockerClass: 'unlockable-blocker',
			blockerText: 'Click to unlock.',
			leaveScrollableArea: false,
			scrollerClass: 'blocker-scroller',
			enableScrollerAtWidth : '767px',
			scrollerWidth: '50px',
			scrollerSide: 'left'
		}, options);

		element = $(options.holder);
		doEnableQueryCallback = options.doEnableQueryCallback;

		if(!doEnableQueryCallback || doEnableQueryCallback(element)) {
			blockerClass = options.blockerClass;
			element.before('<div class="' + blockerClass + '" data-text="' + options.blockerText + '"></div>');

			blocker = $(element.prev('.' + blockerClass));
			sizeBlockerToElement();

			if(options.addTouchEvents) {
				touchHandler = new Hammer.Manager(blocker[0]); // Need to pass in the raw element.
				touchHandler.add(new Hammer.Press());
				touchHandler.on('press', disableBlocker);
			} else {
				blocker.click(disableBlocker);
			}

			$(window).resize(handleResizeOrOrientationChange);
			$(window).on('orientationchange', handleResizeOrOrientationChange);
		}

		function handleResizeOrOrientationChange() {
			setScrollerVisibilityPerWindowSize();
			sizeBlockerToElement();
		}

		function setScrollerVisibilityPerWindowSize() {
			if(!(blockerDisabled && options.leaveScrollableArea)) return;

			if(window.innerWidth > parseInt(options.enableScrollerAtWidth, 10)) {
				blocker.hide();
			} else {
				blocker.show();
			}
		}

		function sizeBlockerToElement() {
			if(!blockerDisabled) {
				blocker.css('width', element.css('width'));
			}

			blocker.css('height', element.css('height'));
			blocker.css('left', element.css('left'));
		}


		function disableBlocker(event) {
			var scrollerClass, targetWidth, oldWidth, oldLeft;

			if(blockerDisabled) return;
			blockerDisabled = true;

			if(event && event.stopPropagation) { // Not present in Hammer.js events
				event.stopPropagation();
			}

			if(options.leaveScrollableArea) {
				scrollerClass = options.scrollerClass;
				targetWidth = parseInt(options.scrollerWidth, 10);

				if(scrollerClass) {
					blocker.addClass(scrollerClass);
				}

				blocker.css('width', targetWidth);

				if(options.scrollerSide.toLowerCase() === 'right') {
					oldWidth = parseInt(blocker.css('width'), 10);
					oldLeft = parseInt(blocker.css('left'), 10);
					blocker.css('left', oldWidth + oldLeft - targetWidth + 'px');
				}

				setScrollerVisibilityPerWindowSize();
			} else {
				blocker.hide();
			}
		}
	}

}(window.jQuery, window.Hammer, window));