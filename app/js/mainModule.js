
angular
    .module('main', ['common'])
    .controller(
        'indexCtrl',
        [
            '$scope',
            '$http',
            function($scope, $http) {

                $scope.pageInfo.title = "Gadgets";

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
