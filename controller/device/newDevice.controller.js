angular.module('frontApp').controller('NewDeviceController',
        ['$scope', 'DeviceDAO', 'EmailDAO', 'ExpectedAlertDAO', 'ProductDAO', 'VendorDAO',
         function ($scope, DeviceDAO, EmailDAO, ExpectedAlertDAO, ProductDAO, VendorDAO)
         {
             'use strict';

             var ctrl = this;
             this.newDevice = {};
             ctrl.showAddButton = true;
             this.init = function ()
             {
                 ctrl.addNew = true;
                 ctrl.newDevice.name = '';
                 ctrl.newDevice.groupId = ctrl.groupId;
                 ctrl.newDevice.forwardEmail = true;
                 ExpectedAlertDAO.query().then(function (results)
                 {
                     ctrl.alertList = results.results;
                 });
                 VendorDAO.query().then(function (result)
                 {
                     ctrl.vendorList = result.results;
                 });
             };


             $scope.$watch(function ()
             {
                 return ctrl.newDevice.vendorId;
             }, function (newValue)
             {
                 if (newValue) {
                     ProductDAO.query(newValue).then(function (results)
                     {
                         ctrl.productList = results.results;
                     });
                 }
             });

             $scope.$watch(function ()
             {
                 return ctrl.newDevice;
             }, function (newValue)
             {
                 if (newValue.vendorId && newValue.productId && newValue.alertId && !ctrl.email) {
                     EmailDAO.getEmail().then(function (results)
                     {
                         ctrl.email = results.results;
                     });
                 }
             }, true);

             this.save = function ()
             {
                 ctrl.newDevice.email = ctrl.email;
                 DeviceDAO.save(ctrl.newDevice).then(function ()
                 {
                     ctrl.newDevice = {};
                     ctrl.addNew = false;
                     ctrl.email = null;
                     $scope.$emit('event:addDevice');
                 });
             };

             this.validate = function ()
             {
                 return !(ctrl.newDevice.name && ctrl.newDevice.vendorId && ctrl.newDevice.productId && ctrl.newDevice.alertId);
             };

             this.cancelAdd = function ()
             {
                 ctrl.addNew = false;
             };


         }]);
