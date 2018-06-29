'use strict';

var _typeof2 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/* global AAEvents ga enableInlineVideo */
var AAS = function () {

  var items = {};
  var actions = {};
  var events = {};
  var track = {};
  var competition = {};
  var carousel = {};
  var metaData = {};
  var units = [];
  var misc = {};

  return {
    actions: actions,
    carousel: carousel,
    competition: competition,
    events: events,
    items: items,
    metaData: metaData,
    misc: misc,
    track: track,
    units: units
  };
}();

////////////////////////////////////////


AAS.init = function () {
  var elems = document.querySelectorAll('.item, .page, #wrapper, .slider-item, video');
  for (var i = 0; i < elems.length; i++) {
    var el = elems[i];
    AAS.items[el.id] = document.getElementById(el.id);
  }
  AAS.track.initVideoTracking();
  AAS.track.initScrollTracking();
  if (AAS.misc.getParameterByName('rmb-preview') === 'true') {
    var scr = document.createElement('script');
    scr.src = 'https://s3-eu-west-1.amazonaws.com/awesomeads-studio-production/scripts/client-preview.js';
    scr.async = false;
    document.head.appendChild(scr);
  }
  AAS.initVideos();
};

AAS.initVideos = function () {
  var _typeof = typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol" ? function (obj) {
    return typeof obj === 'undefined' ? 'undefined' : _typeof2(obj);
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj === 'undefined' ? 'undefined' : _typeof2(obj);
  };
  var videos = document.querySelectorAll('video');
  var iOS8or9 = (typeof document === 'undefined' ? 'undefined' : _typeof(document)) === 'object' && 'object-fit' in document.head.style && !matchMedia('(-webkit-video-playable-inline)').matches;
  if (iOS8or9) {
    for (var _i = 0; _i < videos.length; _i++) {
      var _el = videos[_i];
      if (window.enableInlineVideo) {
        enableInlineVideo(_el);
      }
    }
  }
  for (var i = 0; i < videos.length; i++) {
    var vid = videos[i];
    (function (video) {
      var id = video.id;
      var playbutton = document.querySelector('#' + id + '-play');
      var soundOn = document.querySelector('#' + id + '-sound-on');
      var soundOff = document.querySelector('#' + id + '-sound-off');
      var videoReplay = document.querySelector('#' + id + '-replay');
      var videoLoading = document.querySelector('#' + id + '-loading');
      var videoLabel = video.dataset.label;

      playbutton.addEventListener('click', playVideoCLicked);
      soundOn.addEventListener('click', unmuteVideo);
      soundOff.addEventListener('click', muteVideo);
      video.addEventListener('play', onPlay);
      video.addEventListener('volumechange', volumechanged);
      video.addEventListener('ended', ended);
      videoReplay.addEventListener('click', replayClicked);
      video.addEventListener('waiting', showLoading);
      video.addEventListener('canplay', hideLoading);

      function showLoading() {
        videoLoading.style.display = 'block';
      }

      function hideLoading() {
        videoLoading.style.display = 'none';
      }

      function replayClicked(e) {
        e.stopPropagation();
        video.currentTime = 0;
        video.play();
        AAEvents.event('vide_replay_clicked(' + videoLabel + ')');
      }

      function volumechanged(e) {
        if (e.target.muted) {
          soundOn.style.display = 'block';
          soundOff.style.display = 'none';
        } else {
          soundOn.style.display = 'none';
          soundOff.style.display = 'block';
        }
      }

      function ended() {
        videoReplay.classList.remove('hide');
      }

      function onPlay() {
        videoReplay.classList.add('hide');
        playbutton.classList.add('hide');
      }

      function playVideoCLicked(e) {
        e.stopPropagation();
        video.play();
        video.muted = false;
        soundOn.style.display = 'none';
        soundOff.style.display = 'block';
      }

      function muteVideo(e) {
        e.stopPropagation();
        video.muted = true;
      }

      function unmuteVideo(e) {
        e.stopPropagation();
        video.muted = false;
      }
    })(vid);
  }
};

///////////////// actions ///////////////////////

AAS.actions.runIframeAction = function (event, receiverIds, configuration) {
  for (var i = 0; i < receiverIds.length; i++) {
    var receiverId = receiverIds[i];
    var el = AAS.items[receiverId];
    if (el.children.length) {
      var iframe = el.getElementsByTagName('iframe')[0];
      iframe.contentWindow.postMessage({ type: 'game-action', action: configuration }, '*');
    }
  }
};

AAS.actions.loadIframe = function (event, receiverIds, configuration) {
  for (var i = 0; i < receiverIds.length; i++) {
    var receiverId = receiverIds[i];
    var el = AAS.items[receiverId];
    if (!el.children.length) {
      var iframe = document.createElement('iframe');
      iframe.id = receiverId + '-iframe';
      iframe.src = './iframes/' + receiverId + '/content.html';
      iframe.scrolling = 'no';
      el.appendChild(iframe);
      iframe.contentWindow.AASItemId = receiverId;
    }
  }
};

AAS.actions.loadGame = AAS.actions.loadIframe;

AAS.actions.setCss = function (event, receiverIds, configuration) {
  for (var i = 0; i < receiverIds.length; i++) {
    var el = AAS.items[receiverIds[i]];
    if (configuration.transition) {
      el.style.transition = 'all ' + configuration.transitionDuration + 's ' + configuration.transitionEasing;
    }
    for (var j = 0; j < configuration.styles.length; j++) {
      var style = configuration.styles[j];
      el.style.setProperty(style.property, style.value);
    }
  }
};

AAS.actions.expand = function (event) {
  AAEvents.expand(AAS.units[0].width, AAS.units[0].height, AAS.metaData.expandingDirection, false);
  var contractedUnit = document.getElementById(AAS.units[0].unitId);
  var expandedUnit = document.getElementById(AAS.units[1].unitId);
  var expandedPage = document.getElementById(AAS.units[1].unitId).children[0];
  AAS.items.wrapper.className = 'expanded';
  AAS.items.wrapper.style.width = AAS.units[0].width + 'px';
  AAS.items.wrapper.style.height = AAS.units[0].height + 'px';
  contractedUnit.style.display = 'none';
  expandedUnit.style.display = 'block';
  expandedUnit.style.width = AAS.units[1] + 'px';
  expandedUnit.style.height = AAS.units[1] + 'px';
  expandedPage.style.display = 'block';
  if (window.hasSlick) {
    $('.slick-slider').slick('setPosition');
  }
};

AAS.actions.unexpand = function (event) {
  AAEvents.expand(AAS.units[0].widtg, AAS.units[0].height, AAS.metaData.expandingDirection);
  var contractedUnit = document.getElementById(AAS.units[0].unitId);
  var expandedUnit = document.getElementById(AAS.units[1].unitId);
  var expandedPage = document.getElementById(AAS.units[1].unitId).children[0];
  contractedUnit.style.display = 'block';
  expandedUnit.style.display = 'none';
  expandedUnit.style.width = AAS.units[1].width + 'px';
  expandedUnit.style.height = AAS.units[1].height + 'px';
  expandedPage.style.display = 'none';
  AAS.items.wrapper.style.width = AAS.units[1] + 'px';
  AAS.items.wrapper.style.height = AAS.units[1] + 'px';
  AAS.items.wrapper.className = '';
  AAS.actions.video.paueAll();
};

AAS.actions.goToPage = function (event, receiverUnit, configuration) {
  var unit = document.getElementById(receiverUnit[0]);
  var page = document.getElementById(configuration);
  for (var i = 0; i < unit.children.length; i++) {
    unit.children[i].style.display = "none";
  }
  page.style.display = "block";
  AAS.actions.pauseAllVideo();

  if (window.hasSlick) {
    $('.slick-slider').slick('setPosition');
  }
  page.dispatchEvent(AAS.events.pageActivated);
};

AAS.actions.pauseAllVideo = function () {
  var videos = document.getElementsByTagName('video');
  for (var i = 0; i < videos.length; i++) {
    var el = videos[i];
    el.pause();
  }
};

AAS.actions.clickThrough = function (event) {
  AAEvents.click();
};

AAS.actions.close = function (event) {
  AAEvents.close();
  AAS.items.wrapper.parentElement.removeChild(AAS.items.wrapper);
};

AAS.actions.showItem = function (event, receiverIds, configuration) {
  for (var i = 0; i < receiverIds.length; i++) {
    var el = AAS.items[receiverIds[i]];
    el.style.animation = 'none';
    el.style.display = 'block';
  }
  AAS.carousel.refresh();
};

AAS.actions.hideItem = function (event, receiverIds, configuration) {
  for (var i = 0; i < receiverIds.length; i++) {
    var el = AAS.items[receiverIds[i]];
    el.style.animation = 'none';
    el.style.display = 'none';
  }
};

AAS.actions.showItemWithAnimation = function (event, receiverIds, configuration) {
  for (var i = 0; i < receiverIds.length; i++) {
    var el = AAS.items[receiverIds[i]];
    el.style.removeProperty('animation');
    el.style.visibility = 'visible';
    el.style.display = 'block';
    el.classList.remove(receiverIds[i] + '-onHide-animation');
    el.classList.remove(receiverIds[i] + '-onAppear-animation');
    (function (elm, i) {
      setTimeout(function () {
        elm.classList.add(receiverIds[i] + '-onAppear-animation');
      }, 0);
    })(el, i);
  }
};

AAS.actions.hideItemWithAnimation = function (event, receiverIds, configuration) {
  for (var i = 0; i < receiverIds.length; i++) {
    var el = AAS.items[receiverIds[i]];
    el.style.removeProperty('animation');
    el.style.visibility = 'visible';
    el.style.display = 'block';
    el.classList.remove(receiverIds[i] + '-onHide-animation');
    el.classList.remove(receiverIds[i] + '-onAppear-animation');
    (function (elm, i) {
      setTimeout(function () {
        el.classList.add(receiverIds[i] + '-onHide-animation');
      }, 0);
    })(el, i);
  }
};

AAS.actions.carouselNext = function (event, receiverIds, configuration) {
  $(receiverIds.map(function (id) {
    return '#' + id;
  }).join()).slick('slickNext');
};

AAS.actions.carouselPrev = function (event, receiverIds, configuration) {
  $(receiverIds.map(function (id) {
    return '#' + id;
  }).join()).slick('slickPrev');
};

AAS.actions.carouselGoToSlide = function (event, receiverIds, configuration) {
  $(receiverIds.map(function (id) {
    return '#' + id;
  }).join()).slick('slickGoTo', Number(configuration) - 1);
};

AAS.actions.playVideo = function (event, receiverIds, configuration) {
  for (var i = 0; i < receiverIds.length; i++) {
    var el = document.querySelector('#' + receiverIds[i]);
    el.play();
  }
};

AAS.actions.pauseVideo = function (event, receiverIds, configuration) {
  for (var i = 0; i < receiverIds.length; i++) {
    var el = document.querySelector('#' + receiverIds[i]);
    el.pause();
  }
};

AAS.actions.replayVideo = function (event, receiverIds, configuration) {
  for (var i = 0; i < receiverIds.length; i++) {
    var el = document.querySelector('#' + receiverIds[i]);
    el.currentTime = 0;
    el.play();
  }
};

AAS.actions.toggleMuteVideo = function (event, receiverIds, configuration) {
  for (var i = 0; i < receiverIds.length; i++) {
    var el = document.querySelector('#' + receiverIds[i]);
    el.muted ? el.muted = false : el.muted = true;
  }
};

AAS.actions.muteVideo = function (event, receiverIds, configuration) {
  for (var i = 0; i < receiverIds.length; i++) {
    var el = document.querySelector('#' + receiverIds[i]);
    el.muted = true;
  }
};

AAS.actions.unMuteVideo = function (event, receiverIds, configuration) {
  for (var i = 0; i < receiverIds.length; i++) {
    var el = document.querySelector('#' + receiverIds[i]);
    el.muted = false;
  }
};

AAS.actions.seekVideo = function (event, receiverIds, configuration) {
  for (var i = 0; i < receiverIds.length; i++) {
    var el = document.querySelector('#' + receiverIds[i]);
    el.currentTime = Number(configuration);
  }
};

AAS.actions.linkOut = function (event, receiverIds, configuration) {
  window.open('http://' + configuration.replace(/^https?:\/\//g, ''), '_blank');
};

AAS.actions.openAsset = function (event, receiverIds, configuration) {
  window.open(location.href.split('/').slice(0, -1).join('/') + '/images/' + configuration, '_blank');
};

AAS.actions.actionsHandler = function (e) {
  if (e) {
    e.stopPropagation();
    if (~AAS.track.trackedEvents.indexOf(e.type) && !~AAS.events.eventsFired.indexOf(e)) {
      AAEvents.event(e.currentTarget.dataset.label + ' ' + e.type);
      AAS.events.eventsFired.push(e);
    }
  }
};

///////////////// Events ///////////////////////


AAS.events.addHandler = function (target, eventName, eventHandler, config) {
  if (eventName === 'scrollstart') {
    AAS.events.scrollStartHandler(eventHandler);
    return;
  }
  if (eventName === 'scrolledTo') {
    AAS.events.scrolledToHandler(config, eventHandler);
    return;
  }
  if (eventName === 'frameShown') {
    AAS.events.carouselFrameShownHandler(target, eventName, config, eventHandler);
    return;
  }
  if (eventName === 'load') {
    eventHandler();
  }
  if (target) {
    target.addEventListener(eventName, eventHandler, false);
  }
};

AAS.events.carouselFrameShownHandler = function (target, eventName, config, cb) {
  target.addEventListener(eventName, function (e) {
    if (e.detail === config - 1) {
      cb(e);
    }
  });
};

AAS.events.scrolledToHandler = function (scrollY, cb) {
  document.addEventListener('scroll', function handler(e) {
    if (window.scrollY > scrollY) {
      cb(e);
      document.removeEventListener('scroll', handler);
    }
  });
};

AAS.events.scrollStartHandler = function (cb) {
  document.addEventListener('scroll', function handler(e) {
    cb(e);
    document.removeEventListener('scroll', handler);
  });
};

AAS.events.removeHandler = function (target, eventName, eventHandler) {
  if (target) {
    target.removeEventListener(eventName, eventHandler, false);
  }
};

AAS.events.pageActivated = new Event('pageActivated');
AAS.events.pageDeActivated = new Event('pageDeActivated');
AAS.events.carouselAllFramesViewed = new Event('allFramesViewed');
AAS.events.carouselSlideShown = function (slideNr) {
  return new CustomEvent('frameShown', { detail: slideNr });
};
AAS.events.carouselLeftEdge = new Event('leftEdge');
AAS.events.carouselRighEdge = new Event('rightEdge');
AAS.events.eventsFired = [];

////////////////// Tracking //////////////////////


AAS.track.videoCompletion = function (e) {
  e.stopPropagation();
  var ct = parseInt(this.currentTime);
  var duration = this.duration;
  if (this.lastTime != ct) {
    if (ct == Math.round(duration * 75 / 100)) {
      AAEvents.event('75percent_video_completion(' + e.target.dataset.label + ')');
    } else if (ct === Math.round(duration * 50 / 100)) {
      AAEvents.event('50percent_video_completion(' + e.target.dataset.label + ')');
    } else if (ct === Math.round(duration * 25 / 100)) {
      AAEvents.event('25percent_video_completion(' + e.target.dataset.label + ')');
    }
  }
  this.lastTime = ct;
};

AAS.track.videoEnded = function (e) {
  e.stopPropagation();
  AAEvents.event('100percent_video_completion(' + e.target.dataset.label + ')');
};

AAS.track.initScrollTracking = function () {
  document.addEventListener('scroll', logScrollEvent);
  function logScrollEvent() {
    AAEvents.event('creative scrolled');
    document.removeEventListener('scroll', logScrollEvent);
  }
};

AAS.track.trackedEvents = ['click', 'mousedown', 'mouseenter', 'dblclick'];

AAS.track.initGoogleAnalytics = function () {
  var campaign = AAS.metaData.name;
  if (location.host === 'awesomeads-studio-production-superawesome.netdna-ssl.com' || location.host === 'campaigns.superawesome.club') {
    var env = 'production';
  } else {
    var env = 'development';
  }

  var id = env === 'production' ? 'UA-62479216-1' : 'UA-62479216-2';

  console.info('GA is running on ' + env + ' environment under ' + campaign + ' campaign name.');

  (function (i, s, o, g, r, a, m) {
    i['GoogleAnalyticsObject'] = r;i[r] = i[r] || function () {
      (i[r].q = i[r].q || []).push(arguments);
    }, i[r].l = 1 * new Date();a = s.createElement(o), m = s.getElementsByTagName(o)[0];a.async = 1;a.src = g;m.parentNode.insertBefore(a, m);
  })(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');

  ga('create', id, 'auto');
  ga('send', 'pageview');

  window.AAEvents = {
    event: function event(pref) {
      ga('send', 'event', campaign, 'Click', pref);
    },
    click: function click(pref) {
      ga('send', 'event', campaign, 'Click', pref);
    }
  };
};

AAS.track.customEvent = function (txt) {
  AAEvents.event(txt);
};

AAS.track.videoPlay = function (videoEl) {
  AAEvents.event('video_played(' + videoEl.target.dataset.label + ')');
};

AAS.track.initVideoTracking = function () {
  var videos = document.getElementsByTagName('video');
  for (var i = 0; i < videos.length; i++) {
    var el = videos[i];
    el.addEventListener('play', AAS.track.videoPlay);
    el.addEventListener('timeupdate', AAS.track.videoCompletion);
    el.addEventListener('ended', AAS.track.videoEnded);
  }
};

///////////////// Misc ///////////////////////

AAS.misc.getParameterByName = function (name, url) {
  if (!url) url = window.location.href;
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, " "));
};

AAS.misc.getItemLabels = function (itemIds) {
  return itemIds.map(function (itemId) {
    var el = document.getElementById(itemId);
    return el.dataset.label;
  }).join(',');
};

///////////////// Carousel ///////////////////////

AAS.carousel.init = function (id, options) {
  $('#' + id).slick(options);
  AAS.carousel.addHandlers(id);
};

AAS.carousel.addHandlers = function (itemId) {
  var slider = $('#' + itemId);
  var slidesSeen = new Set();
  slidesSeen.add(1);
  var allSlidesSeenFired = false;
  slider.on('afterChange', function (event, slick, currentSlide) {
    slidesSeen.add(currentSlide);
    if (slidesSeen.size === slick.slideCount && !allSlidesSeenFired) {
      slider[0].dispatchEvent(AAS.events.carouselAllFramesViewed);
    }
    slider[0].dispatchEvent(AAS.events.carouselSlideShown(currentSlide));
  });

  slider.on('swipe', function (event, slick, direction) {
    AAEvents.event('widget swiped ' + direction);
  });

  slider.on('edge', function (event, slick, direction) {
    if (direction === 'left') {
      slider[0].dispatchEvent(AAS.events.carouselRighEdge);
    } else {
      slider[0].dispatchEvent(AAS.events.carouselLeftEdge);
    }
  });
};

AAS.carousel.refresh = function () {
  if (window.hasSlick) {
    $('.slick-slider').slick('setPosition');
  }
};

///////////////// Competition ///////////////////////

AAS.competition.init = function (props) {
  var questions = props.questions;
  var answers = {};
  var submitButton = document.getElementById(props.submitButtonId);
  var emailInput = document.querySelector('.competition-email');
  var thankyouPopup = document.getElementById(props.thankYouPopupId);
  var checkboxes = [];
  for (var i = 0; i < props.checkboxes.length; i++) {
    var el = props.checkboxes[i];
    checkboxes.push(document.getElementById(el));
  }
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = checkboxes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var _el2 = _step.value;

      _el2.onclick = function (e) {
        e.stopPropagation();
      };
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  submitButton.onclick = function (e) {
    AAEvents.event('Submit button clicked');
    e.stopPropagation();
    validateForm();
  };
  submitButton.style.cursor = 'pointer';
  thankyouPopup.style.zIndex = '999999';
  emailInput.onclick = function (e) {
    e.stopPropagation();
  };
  function deselect(item) {
    var questionId = item.dataset.questionId;
    var answers = document.querySelectorAll('.' + questionId);
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = answers[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var answer = _step2.value;

        answer.classList.remove('selected');
      }
    } catch (err) {
      _didIteratorError2 = true;
      _iteratorError2 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion2 && _iterator2.return) {
          _iterator2.return();
        }
      } finally {
        if (_didIteratorError2) {
          throw _iteratorError2;
        }
      }
    }
  }
  function select(item) {
    deselect(item);
    item.classList.add('selected');
    answers[item.dataset.question] = item.dataset.answer;
  }
  var _iteratorNormalCompletion3 = true;
  var _didIteratorError3 = false;
  var _iteratorError3 = undefined;

  try {
    for (var _iterator3 = questions[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
      var question = _step3.value;
      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        var _loop = function _loop() {
          var answer = _step4.value;

          var el = document.querySelector('#' + answer.itemId);
          el.style.cursor = 'pointer';
          el.classList.add(question.questionId);
          el.dataset.question = question.question;
          el.dataset.questionId = question.questionId;
          el.dataset.answer = answer.answerTitle;
          el.onclick = function (e) {
            e.stopPropagation();
            select(el);
          };
        };

        for (var _iterator4 = question.answers[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          _loop();
        }
      } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion4 && _iterator4.return) {
            _iterator4.return();
          }
        } finally {
          if (_didIteratorError4) {
            throw _iteratorError4;
          }
        }
      }
    }
  } catch (err) {
    _didIteratorError3 = true;
    _iteratorError3 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion3 && _iterator3.return) {
        _iterator3.return();
      }
    } finally {
      if (_didIteratorError3) {
        throw _iteratorError3;
      }
    }
  }

  function enterCompetition(input) {
    return new Promise(function (resolve, reject) {
      $.post('https://campaigns.superawesome.club/extcomp', {
        email: emailInput.value,
        competition_id: AAS.metaData.name,
        entry: input.entry,
        creativeId: AAS.metaData.id
      }, function (data) {
        if (data === 'success') {
          resolve('success');
          AAS.actions.showItemWithAnimation(null, [thankyouPopup.id]);
        } else {
          if (data === 'Already played') {
            AAEvents.event('User rejected because already entered the competition');
            showInvalid('Thank You! You have already entered the competition.');
          }
          reject(data);
        }
      });
    });
  };
  function showInvalid(text) {
    var infoBox = document.createElement('div');
    infoBox.setAttribute('style', 'background-color:red; color: white; position:absolute; padding: 5px; font-family: helvetica; font-size: .8em; border-radius: 10px');
    infoBox.innerText = text;
    setTimeout(function () {
      submitButton.removeChild(infoBox);
    }, 3000);
    submitButton.appendChild(infoBox);
  }
  function validateForm() {
    var email = emailInput.value;

    if (!validateEmail(email)) {
      showInvalid('Please enter a valid e-mail address.');
      return false;
    } else if (!checkboxes.reduce(function (acc, val) {
      return acc && val.checked;
    }, true)) {
      showInvalid('Please make sure you have checked the required boxes.');
      return false;
    } else if (location.host === 'localhost:4200' || location.host === 's3-eu-west-1.amazonaws.com') {
      if (window.AAEvents) {
        window.AAEvents.event('Test: Form posted.');
        console.log('User form NOT posted due to test environment.');
        return false;
      }
    } else {
      enterCompetition({
        email: email,
        entry: JSON.stringify(answers)
      });
    }
  }
  function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }
};