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
  }

  function restart() {
    Game.restart();
  }

  function getDeviceMotion() {
    return deviceMotion;
  }

  function startBall() {
    Game.ball.start();
    infoBox.hide();
  }

  function run() {
    Game.run();
  }

  return {
    run,
    setDeviceMotion,
    getDeviceMotion,
    restart,
    startBall
  };
})();

var controller = (function() {

  function init() {
    infoBox.hide();
    $('#canvas').remove();
    $('.controller').show();
    Answerer.dataChannel.send('run');
    bindMotionEvent();

    $('.controller').on('click', function() {
      Answerer.dataChannel.send('startBall');
      $('.controller').on('click', function() {
        Answerer.dataChannel.send('restart');
      })
    });

    function bindMotionEvent() {
      window.addEventListener("devicemotion", handleMotionEvent, true);
    }

    function handleMotionEvent(e) {
      console.log('motion, ', e);
      Answerer.dataChannel.send(e.accelerationIncludingGravity.y);
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


