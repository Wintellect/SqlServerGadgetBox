
angular
    .module('main', ['common', 'waitStatsVisualization'])
    .controller(
        'waitStatsCtrl',
        [
            '$scope',
            '$http',
            function($scope, $http) {

                var socket;

                $scope.pageInfo.title = "Wait Stats";

                socket = io.connect('/waitStats');
                socket.on('waitStats', function (result) {
                    $scope.$apply(function() {
                        if(result.error) {
                            $scope.pageInfo.errorMessage = result.error;
                        }
                        else {
                            $scope.data = result.data;
                        }
                    });
                });

                $scope.$watch("pageInfo.selectedConnection", function(connection){
                    if(connection && connection.id) {
                        $scope.data = { };
                        socket.emit('setConnection', { connection: connection.id });
                    }
                });
            }
        ]
    );
