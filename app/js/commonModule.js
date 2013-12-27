
angular
    .module('common', [])
    .controller(
        'commonCtrl',
        [
            '$scope',
            '$http',
            function($scope, $http) {

                $scope.pageInfo = {
                    title: "",
                    selectedConnection: null,
                    errorMessage: ""
                };

                $http(
                    {
                        method: "GET",
                        url: "/api/connections"
                    }).then(function(result) {
                        $scope.connections = result.data.connections;
                        setLastSelectedConnection();
                    });

                if(Modernizr.localstorage) {
                    $scope.$watch("pageInfo.selectedConnection", function(connection){
                        if(connection && connection.name) {
                            localStorage.setItem("selectedConnection", connection.name);
                        }
                    });
                }

                function setLastSelectedConnection() {
                    var lastSelected;
                    if(Modernizr.localstorage) {
                        lastSelected = localStorage.getItem("selectedConnection");
                    }
                    if($scope.connections && $scope.connections.length > 0) {
                        var found = _.find($scope.connections, {name: lastSelected});
                        $scope.pageInfo.selectedConnection = found || $scope.connections[0];
                    }
                }
            }
        ]
    );
