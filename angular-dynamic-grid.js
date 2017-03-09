/*
Copyright 2017 Predicate (Dennis Seller)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated 
documentation files (the "Software"), to deal in the Software without restriction, including without limitation 
the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, 
and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO 
THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, 
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.*/
(function() {
    var module = angular.module('ngDynamicGrid', []);
    module.component('dynamicGridContainer', dynamicGridContainer());
    
    function dynamicGridContainer() {
        dynamicGridContainer.$inject = ['$scope', '$element'];
        function dynamicGridContainerController($scope, $element) {
            var vm = this;
            vm.guideLines = [];

            /**
             * Gets the container width (in pixels).
             * @returns {number} The container width.
             */
            function getContainerWidth() {
                return $element[0].firstChild.clientWidth;
            };

            /**
             * Gets the container height (in pixels).
             * @returns {number} The container height.
             */
            function getContainerHeight() {
                return $element[0].firstChild.clientHeight;
            };

            /**
             * Adds a vertical guide line to the collection.
             * @param {number} x The x-coordinate of the new guide line. 
             */
            function addVGuideLine(x) {
                vm.guideLines.push({
                    x1: x,
                    y1: 0,
                    x2: x,
                    y2: getContainerHeight()
                });
            };

            /**
             * Adds a horizontal guide line to the collection.
             * @param {number} y The y-coordinate of the new guide line.
             */
            function addHGuideLine(y) {
                 vm.guideLines.push({
                    x1: 0,
                    y1: y,
                    x2: getContainerWidth(),
                    y2: y
                });
            };

            /**
             * The main thinking function. Is called every frame.
             */
            function think() {
                vm.guideLines = [];

                // If there is no foreground object, do nothing.
                if (!vm.active || !vm.fgObj || !vm.fgObj.x || !vm.fgObj.y)
                    return;

                // Determine the center of the foreground object.
                vm.fgObj.cx = vm.fgObj.x + (vm.fgObj.w / 2);
                vm.fgObj.cy = vm.fgObj.y + (vm.fgObj.h / 2);
                
                // Loop through all other objects and see if we can
                // align the foreground object to it.
                _(vm.objects).forEach(function (item) {

                    // ----2----
                    // |   6   |
                    // 1   x-5-3
                    // |       |
                    // ----4----

                    // Calculate center coordinates of items.
                    item.cx = item.x + (item.w / 2);
                    item.cy = item.y + (item.h / 2);

                    var cmpMatrix = [
                        // 1
                        [vm.fgObj.x, item.x, addVGuideLine],
                        [vm.fgObj.x, item.x + item.w, addVGuideLine],
                        [vm.fgObj.x, item.cx, addVGuideLine],

                        // 2
                        [vm.fgObj.y, item.y, addHGuideLine],
                        [vm.fgObj.y, item.y + item.h, addHGuideLine],
                        [vm.fgObj.y, item.cy, addHGuideLine],

                        // 3
                        [vm.fgObj.x + vm.fgObj.w, item.x, addVGuideLine],
                        [vm.fgObj.x + vm.fgObj.w, item.x + item.w, addVGuideLine],
                        [vm.fgObj.x + vm.fgObj.w, item.cx, addVGuideLine],

                        // 4
                        [vm.fgObj.y + vm.fgObj.h, item.y, addHGuideLine],
                        [vm.fgObj.y + vm.fgObj.h, item.y + item.h, addHGuideLine],
                        [vm.fgObj.y + vm.fgObj.h, item.cy, addHGuideLine],

                        // 5
                        [vm.fgObj.cx, item.x, addVGuideLine],
                        [vm.fgObj.cx, item.x + item.w, addVGuideLine],
                        [vm.fgObj.cx, item.cx, addVGuideLine],

                        // 6
                        [vm.fgObj.cy, item.y, addHGuideLine],
                        [vm.fgObj.cy, item.y + item.h, addHGuideLine],
                        [vm.fgObj.cy, item.cy, addHGuideLine]
                    ];

                    // Loop through all entries in the comparison matrix,
                    // and perform the alignment check. If aligned, invoke the callback.
                    for (var idx in cmpMatrix) {
                        var item = cmpMatrix[idx];
                        if (isAligned(item[0], item[1])) {
                            item[2](item[1]);
                        }
                    }
                });
            };

            /**
             * Calculates whether the first parameter falls within the specified margin of the second parameter.
             * @param {number} fgCoordinate The coordinate of the foreground object.
             * @param {number} otherCoordinate The coordinate of the object to compare with.
             * @returns {bool} Whether this is true.
             */
            function isAligned(fgCoordinate, otherCoordinate) {
                return fgCoordinate > (otherCoordinate - vm.margin) &&
                       fgCoordinate < (otherCoordinate + vm.margin);
            };

            // Assign watchers to X and Y coordinate of the foreground object.
            $scope.$watch(function() { return vm.fgObj.x; }, think);
            $scope.$watch(function() { return vm.fgObj.y; }, think);
            $scope.$watch(function() { return vm.active; }, think);
        }

        return {
            bindings: {
                active: '<',
                objects: '<',
                debug: '<',
                fgObj: '<',
                margin: '<',
                bgImage: '<'
            },
            template: '<div class="dynamic-grid-container" style="position: absolute;">\
                        <div ng-transclude></div>\
                         <svg style="position:absolute; width:100%; height: 100%;">\
                           <line ng-repeat="line in $ctrl.guideLines"\
                                 ng-attr-x1="{{line.x1}}"\
                                 ng-attr-y1="{{line.y1}}"\
                                 ng-attr-x2="{{line.x2}}"\
                                 ng-attr-y2="{{line.y2}}"\
                                 style="stroke-width: 1px; stroke: #808080;"\
                                 stroke-dasharray="5"/>\
                           <g ng-if="$ctrl.debug">\
                             <rect ng-repeat="obj in $ctrl.objects"\
                                 style="fill:none;stroke-width:4px;stroke:#ffff00;"\
                                 stroke-dasharray="5"\
                                 ng-attr-x="{{obj.x}}"\
                                 ng-attr-y="{{obj.y}}"\
                                 ng-attr-width="{{obj.w}}"\
                                 ng-attr-height="{{obj.h}}">\
                              </rect>\
                              <circle ng-attr-cx="{{ $ctrl.fgObj.cx }}"\
                                      ng-attr-cy="{{ $ctrl.fgObj.cy }}"\
                                      r="10"\
                                      style="fill:#ff0000;"/>\
                            </g>\
                         </svg>\
                         <img src="{{$ctrl.bgImage}}" ng-style="{ opacity: $ctrl.active ? 0.15 : 1 }" />\
                       </div>',
            controller: dynamicGridContainerController,
            transclude: true,
            scope: false,
            controllerAs: '$ctrl'
        };
    };
})();