
angular
    .module('main', [])
    .controller(
        'indexCtrl',
        [
            '$scope',
            '$http',
            function($scope, $http) {

                $scope.descriptionUrl = null;
                $scope.setDescription = function(url) {
                    $scope.descriptionUrl = url;
                };

                $http(
                    {
                        method: "GET",
                        url: "/api/gadgetCatalog"
                    }).then(function(result) {
                        $scope.gadgets = result.data.gadgets;
                    });
            }
        ]
    );
