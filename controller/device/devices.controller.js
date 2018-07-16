angular.module('frontApp').controller('DevicesController',
        ['$scope', 'filterDevice', 'DeviceDAO', function ($scope, filterDevice, DeviceDAO)
        {
            'use strict';
            var ctrl = this;
            var group;
            this.devices = {filter: {}};
            var firstCall = true;
            ctrl.loadData = true;
            this.init = function (groupId)
            {
                ctrl.displaySpinner = true;
                group = groupId;
            };
            this.refresh = function ()
            {
                DeviceDAO.query(group, ctrl.devices.filter).then(function (result)
                {
                    ctrl.loadData = false;
                    ctrl.devices.list = result.results;

                });
            };

            this.getDevices = function ()
            {
                if (firstCall) {
                    firstCall = false;
                    this.refresh();
                }
            };

            $scope.$on('event:addDevice', function ()
            {
                ctrl.refresh();
            });


            $scope.$watch(function ()
            {
                return filterDevice;
            }, function (newValue)
            {
                ctrl.devices.filter.productId = newValue.productId;
                ctrl.devices.filter.vendorId = newValue.vendorId;
                ctrl.devices.filter.alertId = newValue.alertId;
                ctrl.devices.filter.issues = newValue.issues;
                ctrl.devices.filter.query = newValue.query;
                //TODO change function should return only devices correct not more data
                if (!firstCall) {
                    firstCall = false;
                    ctrl.getDevices(group);
                }
            }, true);
        }]);
