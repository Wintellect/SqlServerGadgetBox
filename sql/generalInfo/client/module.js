
angular
    .module('main', ['common'])
    .controller(
        'infoCtrl',
        [
            '$scope',
            '$http',
            function($scope, $http) {

                $scope.pageInfo.title = "SQL General Information";

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
