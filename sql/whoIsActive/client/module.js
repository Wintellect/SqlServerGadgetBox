
angular
    .module('main', ['common'])
    .controller(
        'activeCtrl',
        [
            '$scope',
            '$http',
            function($scope, $http) {

                $scope.pageInfo.title = "Who Is Active?";

            }
        ]
    );
