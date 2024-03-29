/**
 * This is required for element rendering to be possible
 * @type {PlatformElement}
 */
(function() {
    console.log('frontend', PlatformElement);
    var Accordion = PlatformElement.extend({
        initialize: function() {
            this.activeIndex = this.settings.get('active_index');

            // if we have any iframes, we get an overlay
            this.$el.children('.platform-element-overlay').hide();

            this.fixBoxStyleBorders();
            this.setupAccordion();
        },

         /**
         * Listens to size modifications in the content areas
         * and resizes them as needed
         */
        listenToContentChanges: function() {
            this.currentContent = this.getAccordion()
                .children('[data-item="' + this.settings.get('active_index') +  '"]')
                .children('.accordion__content');
            if (this.currentContent[0]) {
                this.contentInterval = setInterval(function() {
                    if (this.currentContent[0].scrollHeight + 20 != parseInt(this.currentContent.css('max-height'))) {
                        this.currentContent.css('max-height', this.currentContent[0].scrollHeight + 20 + 'px');
                    }
                }.bind(this), 50);
            }
        },

        /**
         * Simplistic jQuery usage to animate and control which
         * accordion item is currently open
         */
        setupAccordion: function() {
            var view = this;

            $titles = this.getTitles();
            $events = $._data($titles[0], "events");

            // if we already have set up click events, don't set more up
            if ($events && $events.click && $events.click[0]) {
                return;
            }

            $titles.on('touchstart click', function(e) {
                clearInterval(view.contentInterval);

                // remove "hover" state on touch events
                if (e.type == "touchstart") {
                    view.getAccordion().removeClass('no-touch');
                }

                e.stopPropagation();
                e.preventDefault();

                var isActive = $(this).parent().hasClass('active');

                // handles closing
                view.getTitles().each(function() {
                    var $this = $(this);
                    var $next = $(this).next();
                    var eachIsActive = $(this).parent().hasClass('active');

                    $next.css({
                        'max-height': 0 + 'px'
                    });

                    if (eachIsActive) {
                        setTimeout(function() {
                            $this.parent().removeClass('active');
                        }, 250);
                    }
                });

                // handles opening
                if (!isActive) {
                    $(this).parent().addClass('active');
                    var $next = $(this).next();
                    $next.css({
                        'max-height': $next[0].scrollHeight + 20 + 'px' // 20 to compensate for padding
                    });

                    setTimeout(function() {
                        $(window).resize();
                    }, 250);

                    view.listenToContentChanges();
                }
                
            });

            this.getTitles().on('touchend', function() {
                this.getAccordion().addClass('no-touch');
            }.bind(this));
        },

        /**
         * When using the 'Box' style, to avoid
         * thick borders on the top and bottom of
         * elements, we just shift all the elements up
         * 'i' pixels. Preferable over doing it through css
         * because all the items need all 4 borders on hover.
         */
        fixBoxStyleBorders: function() {
            var view = this;

            // only do it if the style is 'box'
            if (this.settings.get('style') == 'box') {
                this.getAccordion().filter('.accordion--box').children().each(function(i) {
                    $(this).css({
                        'top': -i
                    });
                });
            }
        },

        // these functions exist so that if there's nested accordions, we don't accidentally select child accordions.
        getAccordion: function() {
            return this.$el.children();
        },

        getTitles: function() {
            return this.$el.children()
                .children()
                .children('.accordion__title');
        },

        getContent: function() {
            return this.$el.children()
                .children()
                .children('.accordion__content');
        }
    });

    return Accordion;
})();
