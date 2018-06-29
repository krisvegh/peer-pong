var infoBox = (function() {
  function show(text) {
    $('.info-box').hide();
    $('.info-box p').html(text);
    $('.info-box').css('display', 'flex');
  }
  function hide() {
    $('.info-box').hide();
  }
  return {
    show,
    hide
  };
})();

var gameController = (function() {
  var velocity;
  var deviceMotion = 0;

  function setDeviceMotion(value) {
    deviceMotion = value;
    // console.log(value);
  }

  function restart() {
    Game.restart();
  }

  function getDeviceMotion() {
    return deviceMotion;
  }

  function start() {
    infoBox.hide();
    Game.start();
  }

  return {
    start,
    setDeviceMotion,
    getDeviceMotion,
    restart
  };
})();

var controller = (function() {
  function init() {
    infoBox.hide();
    $('#canvas').remove();
    $('.controller').show();
    $('.controller').on('click', function() {
      Answerer.dataChannel.send('start');
      bindMotionEvent();
      $('.controller').on('click', function() {
        Answerer.dataChannel.send('restart');
      })
    });

    function bindMotionEvent() {
      window.addEventListener("devicemotion", handleMotionEvent, true);
      function handleMotionEvent(e) {
        Answerer.dataChannel.send(e.accelerationIncludingGravity.y);
      }
    }
  }
  return {
    init
  };
})();

$(document).ready(function() {
  Game.showStartScreen();
  infoBox.show(`Please go to the following URL with your mobile:<br>${location.href}<span style="color: red">${Offerer.channelId}<span/>`);
});


