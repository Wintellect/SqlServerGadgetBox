
angular
    .module('main', ['common'])
    .controller(
        'activeCtrl',
        [
            '$scope',
            '$http',
            function($scope, $http) {

                $scope.pageInfo.title = "Who Is Active?";

                $scope.data = { };

                var socket = io.connect('');
                socket.on('whoIsActive', function (data) {
                    console.log(data);
                    $scope.$apply(function() {
                        $scope.data = data;
                    });
                });
            }
        ]
    );
