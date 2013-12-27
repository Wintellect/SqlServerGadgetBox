
angular
    .module('main', ['common'])
    .controller(
        'activeCtrl',
        [
            '$scope',
            '$http',
            function($scope, $http) {

                var socket;

                $scope.pageInfo.title = "Who Is Active?";

                $scope.data = { };

                socket = io.connect('/whoIsActive');
                socket.on('whoIsActive', function (data) {
                    $scope.$apply(function() {
                        $scope.data = data;
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
