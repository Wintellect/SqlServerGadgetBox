
angular
    .module('main', [])
    .controller(
        'infoCtrl',
        [
            '$scope',
            '$http',
            function($scope, $http) {

                $http(
                    {
                        method: "GET",
                        url: "/api/generalInfo"
                    }).then(function(result) {
                        $scope.version = result.data.version[0];
                        $scope.properties = result.data.properties;
                    });
            }
        ]
    );
