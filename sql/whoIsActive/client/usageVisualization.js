
angular
    .module('usageVisualization', [])
    .directive(
        'sgUsageVisualization',
        [
            function() {

                return {
                    restrict: 'E',
                    template: '<svg></svg>',
                    link: function(scope, element, attrs) {

                        var vx = 1000, vy = 700,
                            currentData = [],
                            usageType = attrs.usageType || "rdwr",
                            svg;

                        scope.$watch(attrs.visualizationData, function(data) {
                            if(data && data.length) {
                                currentData = mapData(data);
                                updateVisualization();
                            }
                        });

                        scope.$watch(attrs.usageType, function(t){
                            usageType = t;
                            if(currentData && currentData.length) {
                                updateVisualization();
                            }
                        });

                        function mapData(data) {
                            return _.chain(data)
                                .map(function(item, idx) {
                                    return {
                                        id: item["session_id"],
                                        user: {
                                            name: item["login_name"],
                                            host: item["host_name"],
                                            database: item["database_name"],
                                            program: item["program_name"]
                                        },
                                        sqlTxt: item['sql_text'],
                                        cpu: parseNumber(item["CPU"]),
                                        tempdb: {
                                            allocations: parseNumber(item["tempdb_allocations"]),
                                            current: parseNumber(item["tempdb_current"])
                                        },
                                        reads: parseNumber(item["reads"]),
                                        physicalReads: parseNumber(item["physical_reads"]),
                                        writes: parseNumber(item["writes"]),
                                        memory: parseNumber(item["used_memory"])
                                    };
                                })
                                .sortBy(function(item){
                                    return item.id;
                                })
                                .value();
                        }

                        function parseNumber(v) {
                            return (v || "0").replace(/,/g,'') - 0;
                        }

                        function updateVisualization() {
                            switch(usageType) {
                                case "cpu":
                                    renderVisualization({
                                        getMaxValues: function(d) {
                                            return d.cpu;
                                        },
                                        barCount: 1,
                                        getBarValue: function(idx) {
                                            return function(d) {
                                                switch(idx) {
                                                    case 0: return d.cpu;
                                                }
                                            }
                                        }
                                    });
                                    break;
                                case "tempdb":
                                    renderVisualization({
                                        getMaxValues: function(d) {
                                            return Math.max(d.tempdb.allocations, d.tempdb.current);
                                        },
                                        barCount: 2,
                                        getBarValue: function(idx) {
                                            return function(d) {
                                                switch(idx) {
                                                    case 0: return d.tempdb.allocations;
                                                    case 1: return d.tempdb.current;
                                                }
                                            }
                                        }
                                    });
                                    break;
                                case "rdwr":
                                    renderVisualization({
                                        getMaxValues: function(d) {
                                            return Math.max(d.physicalReads, d.writes);
                                        },
                                        barCount: 2,
                                        getBarValue: function(idx) {
                                            return function(d) {
                                                switch(idx) {
                                                    case 0: return d.physicalReads;
                                                    case 1: return d.writes;
                                                }
                                            }
                                        }
                                    });
                                    break;
                                case "mem":
                                    renderVisualization({
                                        getMaxValues: function(d) {
                                            return d.memory;
                                        },
                                        barCount: 1,
                                        getBarValue: function(idx) {
                                            return function(d) {
                                                switch(idx) {
                                                    case 0: return d.memory;
                                                }
                                            }
                                        }
                                    });
                                    break;
                                default:
                                    clearAndInitializeVisualization();
                                    break;
                            }
                        }

                        function clearAndInitializeVisualization() {
                            element.find("svg").empty();
                            svg = d3.select(element[0]).selectAll("svg");
                            svg
                                .attr("viewBox", [0, 0, vx, vy].join(" "))
                                .attr("preserveAspectRatio", "xMidYMin meet");
                        }

                        function renderVisualization(h) {

                            var margin = {
                                    top: 20,
                                    bottom: 40,
                                    left: 100,
                                    right: 20
                                },
                                maxY, yScale, yScaleRev,
                                yAxis, xScale, xAxis,
                                i;

                            clearAndInitializeVisualization();
                            updateLegend();

                            maxY = function() {
                                var v = d3.max(currentData, h.getMaxValues);
                                return (v + v * 0.15) || 1;
                            }();
                            yScale = d3.scale.linear()
                                .domain([0, maxY])
                                .range([margin.top, vy - margin.bottom]);
                            yScaleRev = d3.scale.linear()
                                .domain([0, maxY])
                                .range([vy - margin.bottom, margin.top]);

                            yAxis = d3.svg.axis().scale(yScaleRev).orient("left");
                            svg.append("g")
                                .attr("class", "y axis")
                                .attr("transform", [
                                    "translate(",
                                    margin.left,
                                    ",",
                                    0,
                                    ")"
                                ].join(""))
                                .call(yAxis);

                            xScale = d3.scale.ordinal()
                                .domain(_.map(currentData, function(d){
                                    return d.id;
                                }))
                                .rangeBands([margin.left, vx - margin.right], 0.1);
                            xAxis = d3.svg.axis().scale(xScale).orient("bottom");

                            svg.append("g")
                                .attr("class", "x axis")
                                .attr("transform", [
                                    "translate(",
                                    0,
                                    ",",
                                    vy - margin.bottom,
                                    ")"
                                ].join(""))
                                .call(xAxis);

                            var bars = svg.append("g").selectAll("g"),
                                colors = d3.scale.category20();

                            var barItems = bars.data(currentData, function(d) {
                                return d.id;
                            });

                            var barGroup = barItems.enter().append("g");

                            var barWidth = xScale.rangeBand() / h.barCount,
                                makeBar = function(idx, getValue) {
                                    return function(selection) {
                                        var group = selection.append("g");
                                        group
                                            .append("rect")
                                            .attr("x", function(d){
                                                return xScale(d.id) + (barWidth*idx);
                                            })
                                            .attr("width", barWidth)
                                            .attr("y", function(d){
                                                return yScale(maxY) - yScale(getValue(d));
                                            })
                                            .attr("height", function(d){
                                                return yScale(getValue(d));
                                            })
                                            .attr("fill", function(d, i) {
                                                return colors(i);
                                            });
                                        group
                                            .append("text")
                                            .attr("x", function(d){
                                                return xScale(d.id) + (barWidth*idx) + (barWidth/2);
                                            })
                                            .attr("y", function(d){
                                                return yScale(maxY) - yScale(getValue(d));
                                            })
                                            .attr("dy", "-0.20em")
                                            .style("text-anchor", "middle")
                                            .text(getValue);
                                    };
                                }

                            for(i=0; i<h.barCount; i++) {
                                barGroup.call(makeBar(i, h.getBarValue(i)));
                            }
                        }

                        function updateLegend() {

                            var legendItems = d3
                                    .selectAll(attrs.legend)
                                    .selectAll("li")
                                    .data(currentData, function(d) {
                                        return d.id;
                                    }),
                                legendText = function(d) {
                                    return [
                                        "[", d.id, "] ",
                                        d.user.name,
                                        " (", d.user.database, ")"
                                    ].join("");
                                },
                                colors = d3.scale.category20();

                            legendItems
                                .text(legendText)
                                .style("background-color", function(d,i){
                                    return colors(i);
                                })
                                .attr("title", function(d){
                                    return d.sqlTxt;
                                });

                            legendItems
                                .enter()
                                .append("li")
                                .classed("list-group-item", true)
                                .text(legendText)
                                .style("background-color", function(d,i){
                                    return colors(i);
                                })
                                .attr("title", function(d){
                                    return d.sqlTxt;
                                });

                            legendItems
                                .exit()
                                .remove();
                        }
                    }
                }
            }
        ]
    );
