var Motion = (function () {
    var gn = new GyroNorm();
    var Y = 0;

    $(document).ready(function () {
        gn.init().then(function(){
            gn.start(function(data){
                Y = data.dm.y;
            });
        }).catch(function(err){
            console.log('DeviceOrientation or DeviceMotion is not supported by the browser or device', err);
        });

        var publicApi = {
            mY : function () {
                return Y;
            }
        };

        return publicApi;
    })();
});
