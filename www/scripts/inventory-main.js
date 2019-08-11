let adminApp = angular.module('inventoryMain', ['ckeditor']);
adminApp.config(['$httpProvider', function($httpProvider) {
    //initialize get if not there
    if (!$httpProvider.defaults.headers.get) {
        $httpProvider.defaults.headers.get = {};
    }

    // Answer edited to include suggestions from comments
    // because previous version of code introduced browser-related errors

    //disable IE ajax request caching
    $httpProvider.defaults.headers.get['If-Modified-Since'] = 'Mon, 26 Jul 1997 05:00:00 GMT';
    // extra
    $httpProvider.defaults.headers.get['Cache-Control'] = 'no-cache';
    $httpProvider.defaults.headers.get['Pragma'] = 'no-cache';

    $httpProvider.defaults.headers.common["X-Requested-With"] = 'XMLHttpRequest';
}]);

adminApp.controller('mainCtrl', ['$scope', '$http', '$q', '$timeout', '$animate', '$interval', function($scope, $http, $q, $timeout, $animate, $interval){
    let m = $scope.model = {
        itemData: {  "ItemName" : "", "ItemCategory" : "", "Sellin" : "", "Quality" : 0, "Sell Item" : 0 } 
    };

    let init = function(){
        //console.log('---------------In the INIT of mainCtrl-------------');

        // No auth. Go right in.
        m.loading = true;
        m.gossip = null;
        m.inventoryData = null;
        angular.copy(m.itemData, m.anItem);  // Deep Copy

        // Get inventory
        return $q.all([
            $http.get(`/api/v1/inventory/list`),
           // $http.get(`/api/v1/gossip/all`)
        ]).then(function(response){
            m.inventoryData = response[0].data;
            //console.log('m.inventoryData=', m.inventoryData);
            
            // Future features for gossip.
            //m.gossipData = values[1].data;
            m.loading = false;

        }).catch(function(response){
            swal({
                title: "Something went wrong.",
                text: "Sorry, the service is unavailable right now.",
                icon: "error",
                button: "Okay",
            });
            m.loading = false;
            throw response.data ? new Error(response.data.message) : response;
        });
    };

    $scope.getItemList = function(){
        m.loading = true;
        return $http.get(`/api/v1/inventory/list`).then(function(response){
            console.log('get item list - loading done');
            m.inventoryData = response.data;
            m.loading = false;
        });
    };

    $scope.incrementInventory = function(){
        m.loading = true;
        return $http.post(`/api/v1/inventory/increment`).then(function(response){
            console.log('incrementInventory()');
            $scope.getItemList();
        });
    };

    $scope.purchaseItem = function(itemObject){
        m.loading = true;
        //console.log('itemObject=',itemObject);
        return $http.post(`/api/v1/inventory/purchase`,itemObject).then(function(response){
            console.log('purchaseItem()');
            $scope.getItemList();
        });
    };

    $scope.sellItem = function(itemIndex){
        m.loading = true;
        //console.log('itemIndex=',itemIndex);

        return $http.delete(`/api/v1/inventory/${itemIndex}/sell`).then(function(response){
            console.log('sellItem()');
            $scope.getItemList();
        });
    };

    $scope.resetInventory = function(){
        m.loading = true;
        return $http.post(`/api/v1/inventory/reset`).then(function(response){
            console.log('resetInventory()');
            $scope.getItemList();
        });
    };

    $scope.getGossip = function(){
        m.loading = true;
        return $http.get(`/api/v1/inventory/gossip`).then(function(response){
            console.log('getGossip - loading done response.data=', response.data);
            m.gossip = response.data.gossip;
            m.loading = false;
        });
    };

    $scope.$watch(('model.inventoryData'), function(newVal, oldVal){
        if (newVal && newVal !== oldVal){

            // For future use
            //console.log("$watch(('model.inventoryData') - with NO auth");
            //console.log("$watch(('model.inventoryData') -newVal=", newVal);
            //console.log("$watch(('model.inventoryData') -oldVal=", oldVal);
        }
    }, true)

    init();

}]);

