
angular
    .module('waitStatsVisualization', [])
    .directive(
        'sgWaitStatsVisualization',
        [
            function() {

                return {
                    restrict: 'E',
                    template: '<svg></svg>',
                    link: function(scope, element, attrs) {
                    }
                }
            }
        ]
    );
