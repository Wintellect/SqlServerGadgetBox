
angular
    .module('main', ['common'])
    .controller(
        'infoCtrl',
        [
            '$scope',
            '$http',
            function($scope, $http) {

                $scope.pageInfo.title = "SQL General Information";

                $scope.$watch("pageInfo.selectedConnection", function(connection){
                    if(connection && connection.id) {
                        $scope.version = null;
                        $scope.properties = null;
                        $http(
                            {
                                method: "GET",
                                url: "/api/generalInfo",
                                params: {
                                    connection: connection.id
                                }
                            }).then(function(result) {
                                $scope.version = result.data.version[0];
                                $scope.properties = result.data.properties;
                            }, function(result) {
                                $scope.pageInfo.errorMessage = result.data.error;
                            });
                    }
                });
            }
        ]
    );
