(function($) {
$.fn.present = function(options) {

  var defaults = {
    'slideSelector': '.slide',
    'pointSelector': '.point',
    'pagerSelector': '#pager',
    'nextSelector': '#next',
    'prevSelector': '#prev',
    'presModeHideSelector': '#header, #footer',
    'wrap': false,
    'keys': {
      'prevSlide': 'up',
      'nextSlide': 'down',
      'forward': 'right',
      'backward': 'left',
      'resetSlide': 'ctrl+x',
      'resetPresentation': 'alt+ctrl+x',
      'presentationModeToggle': 'alt+ctrl+p'
    }
  };

  // definitions for slide transitions
  var slideTransitions = {
    'slide-from-top': function(oldSlide, newSlide, completeFunc, direction) { 
      oldSlide.slideUp(500, function () {
        newSlide.slideDown(500, completeFunc);
      });
    },
    'slide-horizontal': function(oldSlide, newSlide, completeFunc, direction) {
      var start = $(document).width() * (direction / Math.abs(direction));

      oldSlide.animate({ 'left': 0 - start, 'opacity': 0 }, 750, function() {
        $(this).removeAttr('style').hide();
      });

      newSlide.css({ 'left': start, 'opacity': 0 })
        .show()
        .animate({ 'left': 0, 'opacity': 1.0 }, 1000, completeFunc);
    },
    'slide-vertical': function(oldSlide, newSlide, completeFunc, direction) {
      var start = $(document).height() * (direction / Math.abs(direction));

      oldSlide.animate({ 'top': 0 - start, 'opacity': 0 }, 750, function() {
        $(this).removeAttr('style').hide();
      });

      newSlide.css({ 'top': start, 'opacity': 0 })
        .show()
        .animate({ 'top': 0, 'opacity': 1.0 }, 1000, completeFunc);
    },
    'fade': function(oldSlide, newSlide, completeFunc, direction) {
      oldSlide.fadeOut(500, function() {
        newSlide.fadeIn(1000, completeFunc);
      });
    }
  };

  // definitions for point transitions
  var pointTransitions = {
    'fade': function(point, direction) {
      var h = point.css('height');
      if(direction > 0) {
        point.css({ opacity: 0, height: 0 })
          .show()
          .animate({ opacity: 1.0, height: h }, 250);
      } else {
        point.animate({ opacity: 0, height: 0 }, 250, function() {
          point.hide()
            .css({ opacity: 1.0, height: h });
        });
      }
    }
  };

  var state, util, points, slides, control, scale;
  var container = this;

  // maintains presentation state
  state = {
    oldSlide: null,
    currentSlide: null,
    transitioning: false,
    slides: null,
    presentationMode: false
  };

  // misc utility functions
  util = (function() {
    var hash = function(v) {
      if(v) window.location.hash = '#' + v;
      return parseInt(window.location.hash.substr(1));
    };

    return {
      hash: hash
    };
  })();

  // point related functions
  points = (function() {

    // find points on the given slide optionally filtered
    var pointsOnSlide = function(slide, filter) {
      var p = slide.find(options.pointSelector)
      if(filter) p = p.filter(filter);
      return p;
    };

    // Find points and hide those too but only those on slides >= to current
    var hide = function(only) {
      var slides = only ? only : state.slides;
      var hide = only ? true : false;
      slides.each(function(k,v) {
        if(!hide) hide = (v == state.currentSlide[0]) ? true : false;
        if(hide) pointsOnSlide($(v)).hide();
        $(v).data('visited', !hide);
      });
    };

    // Show points relatively
    var changeRel = function(n) {
      var filter = n > 0 || state.currentSlide.data('visited') ? ':hidden' : ':visible';
      var points = pointsOnSlide(state.currentSlide, filter);
      var toShow = n > 0 ? points.get().slice(0, n) : points.get().slice(n, points.length - n);

      $(toShow).each(function(k, v) {
        v = $(v);
        var t = pointTransitions[v.data('transition')];
        if(t) {
          t(v, n);
        } else {
          n > 0 ? v.show() : v.hide();
        }
        n > 0 ? v.trigger('pointEntered') : v.trigger('pointExited');
      });

      if(pointsOnSlide(state.currentSlide, ':hidden').length == 0) {
        state.currentSlide.data('visited', true);
      }
    };

    return {
      hide: hide,
      changeRel: changeRel,
      onSlide: pointsOnSlide
    };
  })();

  slides = (function() {
    // Switch slide absolutely
    var change = function(newSlideNo, opts) {
      var direction = newSlideNo - util.hash();
      util.hash(newSlideNo);

      if(state.transitioning) {
        state.oldSlide.stop(false, true);
        state.currentSlide.stop(false, true);
      }

      var oldSlide = state.currentSlide;
      var newSlide = state.slides.filter(':nth-child(' + newSlideNo + ')');

      var t = null;
      if(!opts || (opts && !opts['quietly'])) {
        t = slideTransitions[newSlide.data('transition')];
      }

      if(t) {
        var overflow = $('body').css('overflow');
        $('body').css('overflow', 'hidden');
        state.transitioning = true;

        var completeFunc = function() { 
          state.transitioning = false;
          oldSlide.hide();
          oldSlide.trigger('slideExited');
          newSlide.show();
          newSlide.trigger('slideEntered');
          $('body').css('overflow', overflow);
        };

        t(oldSlide, newSlide, completeFunc, direction);
      } else {
        if(oldSlide) oldSlide.hide();
        newSlide.show();
        state.transitioning = false;
      }

      if(oldSlide && points.onSlide(oldSlide, ':hidden').length == 0) {
        oldSlide.data('visited', true);
      }

      state.oldSlide = oldSlide;
      state.currentSlide = newSlide;
    };

    // Switch slides relatively
    var changeRel = function(n) {
      var newSlide = util.hash() + n;

      if(options.wrap) {
        newSlide = newSlide % (state.slides.length + 1);
        newSlide = n > 0 && newSlide == 0 ? 1 : (newSlide || state.slides.length);
      } else if(newSlide <= 0 || newSlide > state.slides.length) {
        return false;
      }

      change(newSlide);
    };

    return {
      change: change,
      changeRel: changeRel
    };
  })();

  control = (function() {
    // Perform the next /prev action
    var go = function(n) {
      var filter = n > 0 || state.currentSlide.data('visited') ? ':hidden' : ':visible';
      var p = points.onSlide(state.currentSlide, filter);
      (p.filter(filter).length == 0) ? slides.changeRel(n) : points.changeRel(n);
    };

    // Reset presentation as if just entered
    var resetPresentation = function(n) {
      if(typeof n != 'number') n = null;
      slides.change(n || 1, { quietly: true });
      points.hide();
    };

    // Reset slide as if it had just been entered
    var resetSlide = function(slide) {
      if(slide.target) slide = null;
      if(typeof slide == 'number') slide = state.slides[slide - 1];
      points.hide(slide || state.currentSlide);
    };

    // Go forward n steps (if there are hidden points they will be shown, oterwise next slide)
    // Note: Will only operate on either points or slides
    // As such if there is one hidden point and forward(2) is called then the point will be shown but the slide will not change
    var forward = function(n) {
      if(typeof n != 'number') n = 1;
      go(n);
    };

    // Go back n steps (if there are visible points they will be hidden, oterwise previous slide)
    // Note: Will only operate on either points or slides
    // As such if there is one visible point and backward(2) is called then the point will be hidden but the slide will not change
    var backward = function(n) {
      if(typeof n != 'number') n = 1;
      go(0-n);
    };

    // Go forward n slides
    var nextSlide = function(n) {
      if(typeof n != 'number') n = 1;
      slides.changeRel(n);
    };

    // Go backwards n slides
    var prevSlide = function(n) {
      if(typeof n != 'number') n = 1;
      slides.changeRel(0-n);
    };

    var presentationModeToggle = function() {
      $(options.presModeHideSelector)[state.presentationMode ? 'show' : 'hide']('fade');
      state.presentationMode = !state.presentationMode;
    };

    return {
      resetPresentation: resetPresentation,
      resetSlide: resetSlide,
      forward: forward,
      backward: backward,
      nextSlide: nextSlide,
      prevSlide: prevSlide,
      presentationModeToggle: presentationModeToggle
    };
  })();

  scale = (function() {
    var oProp = null;
    var oCDim = null;

    var containerDimensions = function() {
      if(!oCDim) {
        oCDim = {
          w: container.width() / $(window).width(),
          h: container.height() /$(window).height()
        }
      }

      return {
        w: $(window).width() * oCDim.w,
        h: $(window).height() * oCDim.h
      };
    };

    var maxSlideDimensions = function() {
      var maxW = maxH = 0;
      state.slides.each(function(k,s) {
        s = $(s);
        var isCurrent = s.is(':visible');
        var style = null;

        if(!isCurrent) {
          style = s.attr('style');
          s.css({ visibility: 'hidden', position: 'absolute'}).show();
        }

        maxW = maxW < s.width() ? s.width() : maxW;
        maxH = maxH < s.height() ? s.height() : maxH;

        if(!isCurrent) {
          s.hide().attr('style', style);
        }
      });

      return { w: maxW, h: maxH };
    };

    var separateUnits = function(x) {
      var m = x.match(/([0-9]+)(.*)/);
      if(!m) m = { value: null, units: 'px' };
      return {
        value: m[1],
        units: m[2]
      };
    };

    var auto = function() {
      var c = containerDimensions();
      var m = maxSlideDimensions();

      var rW = c.w / m.w;
      var rH = c.h / m.h;
      var rM = rW > rH ? rH : rW;

      var fields = ['font-size'];
      var fieldsH = ['margin-top', 'margin-bottom', 'padding-top', 'padding-bottom', 'height', 'top', 'bottom'];
      var fieldsW = ['margin-left', 'margin-right', 'padding-left', 'padding-right', 'width', 'left', 'right'];

      var apply = function(elem, fields, r) {
        $.each(fields, function(k,f) {
          elem.each(function(k,e) { 
            e = $(e);
            var val = separateUnits(e.css(f));
            if((f == 'width' || f == 'height') && val.value == 0) {
              val = separateUnits(e[0][f] + 'px');
              console.log(f);
            }
            e.css(f, (val.value * r) + val.units);
          });
        });
      };

      apply(container, fields, rM);

      apply(container, fieldsH, rH);
      apply(container, fieldsW, rW);

      apply(container.find('img'), fieldsH, rM);
      apply(container.find('img'), fieldsW, rM);
    };

    return { auto: auto };
  })();

  // Plugin initialisation
  // Merge options wit defaults
  options = $.extend(defaults, options);
  if(options && options.keys) {
    options.keys = $.extend(defaults.keys, options.keys)
  }

  state.slides = this.find(options.slideSelector);
  state.slides.hide();

  control.resetPresentation(util.hash());

  // key bindings
  $.each(options.keys, function(k,v) {
    $(document).bind('keyup', v, control[k]);
  });

  // Next link hook
  $(options.nextSelector).click(function() {
    control.forward(1);
    return false;
  });

  // Prev link hook
  $(options.prevSelector).click(function() {
    control.backward(1);
    return false;
  });

  // Pager link creation + event hook
  var pagerLinks = state.slides.map(function(k,v) {
    return '<li><a href="#"' + (k+1) + '">' + (k+1) + '</a></li>';
  }).get().join("\n");

  $(options.pagerSelector).html(pagerLinks).click(function(e) {
    var t = parseInt($(e.target).text());
    if(util.hash() != t) slides.change(t);
    return false;
  });

  // Auto scale slide content to available screen area
  // (currently only deals with slides, not any surrounding chrome like header / footer)
  //$(document).ready(scale.auto);
  points.hide();
  //$(window).resize(scale.auto); // FIXME

  return this;
}
})(jQuery);

// vim:ts=2 sw=2 et