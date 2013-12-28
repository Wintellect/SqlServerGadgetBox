
angular
    .module('main', ['common', 'usageVisualization'])
    .controller(
        'activeCtrl',
        [
            '$scope',
            '$http',
            function($scope, $http) {

                var socket;

                $scope.pageInfo.title = "Who Is Active?";

                $scope.data = { };
                $scope.usageType = "rdwr";
                $scope.barLegendText = "";

                socket = io.connect('/whoIsActive');
                socket.on('whoIsActive', function (result) {
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

                $scope.$watch("usageType", function(usageType){
                    $scope.barLegendText = "";
                    switch(usageType) {
                        case "cpu":
                            $scope.barLegendText = "CPU";
                            break;
                        case "tempdb":
                            $scope.barLegendText = "Allocations | Current";
                            break;
                        case "rdwr":
                            $scope.barLegendText = "Physical Reads | Writes";
                            break;
                        case "mem":
                            $scope.barLegendText = "Memory Usage";
                            break;
                    }
                });
            }
        ]
    )
    .directive(
        'sgBindText',
        [
            function() {
                return {
                    restrict: 'A',
                    link: function(scope, element, attrs) {
                        scope.$watch(attrs.sgBindText, function(v) {
                            element.text(v);
                            var r = element[0];
                            if (r.offsetWidth < r.scrollWidth) {
                                element.attr('title', v);
                            }
                            else {
                                element.removeAttr('title');
                            }
                        });
                    }
                }
            }
        ]
    );
