angular.module('frontApp').controller('DeviceController',
        ['$modal', '$scope', 'DeviceDAO', 'ProductDAO', function ($modal, $scope, DeviceDAO, ProductDAO)
        {
            'use strict';
            var ctrl = this, editDevice = {}, firstCall = true;
            this.editDevice = function (device)
            {
                ctrl.edit = true;
                angular.extend(editDevice, device);
                queryProducts(ctrl.device.vendorId);
                device.edit = true;
            };
            this.saveDevice = function (device)
            {
                DeviceDAO.save(device).then(function (results)
                {
                    device.name = results.results.name;
                    device.alert = results.results.alert;
                    device.product = results.results.product;
                    device.vendor = results.results.vendor;
                    device.issues = results.results.issues;
                    device.enable = results.results.enable;
                    device.edit = false;
                    ctrl.edit = false;
                });
            };
            this.displayEmail = function ()
            {
                $modal.open({
                    templateUrl: 'views/device/displayEmails.modal.tpl.html',
                    size: 'lg',
                    controller: 'EmailsController',
                    controllerAs: 'emailCtrl',
                    resolve: {
                        device: function ()
                        {
                            return ctrl.device;
                        }
                    }
                });
            };

            this.removeDevice = function (deviceId)
            {
                DeviceDAO.remove(deviceId).then(function ()
                {
                    ctrl.getDevices();
                });
            };

            this.cancelEditDevice = function (device)
            {
                device.name = editDevice.name;
                device.product = editDevice.product;
                device.vendor = editDevice.vendor;
                device.alert = editDevice.alert;
                device.edit = false;
                ctrl.edit = false;
            };

            function queryProducts(newValue)
            {
                ProductDAO.query(newValue).then(function (results)
                {
                    ctrl.productList = results.results;
                });
            }

            this.validate = function ()
            {
                return !(ctrl.device.name && ctrl.device.productId && ctrl.device.vendorId);
            };

            $scope.$watch(function ()
            {
                return ctrl.device.vendorId;
            }, function (newValue)
            {
                if (!firstCall && newValue) {
                    queryProducts(newValue);
                }
                firstCall = false;
            });
        }]);
