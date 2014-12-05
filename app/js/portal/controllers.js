'use strict';

/* Controllers */

angular.module('myApp')
.controller('ToolbarCtrl', ['$scope', '$rootScope', '$timeout', 'UxService',
function($scope, $rootScope, $timeout, UxService) {   
    $scope.tbApi = {};
    $rootScope.tbApi = $scope.tbApi;

    $scope.buttons = [];

    $timeout(function() {
      $scope.tbApi.addButton(UxService.getToolbarButton("element.viewer"));
      $scope.tbApi.addButton(UxService.getToolbarButton("configurations"));
    }, 500);

    $scope.onClick = function(button) {
    };
}])
.controller('NavTreeCtrl', ['$scope', '$rootScope', '$location', '$timeout', '$state', '$anchorScroll', 'ElementService', 'ViewService', 'UtilsService', 'growl', '$modal', '$q', '$filter', 'ws', 'sites', 'config', 'configSnapshots',
function($scope, $rootScope, $location, $timeout, $state, $anchorScroll, ElementService, ViewService, UtilsService, growl, $modal, $q, $filter, ws, sites, config, configSnapshots) {
    $scope.ws = ws;
    $scope.sites = sites;

    $scope.buttons = [{
        action: function(){ $scope.treeApi.expand_all(); },        
        tooltip: "Expand All",
        icon: "fa-caret-square-o-down",
        permission: true
    }, {
        action: function(){ $scope.treeApi.collapse_all(); },
        tooltip: "Collapse All",
        icon: "fa-caret-square-o-up",
        permission: true
    }, {
        action: function(){ $scope.toggleFilter(); },
        tooltip: "Filter Sites",
        icon: "fa-filter",
        permission: true
    }];

    $scope.filterOn = false;
    $scope.toggleFilter = function() {
        $scope.filterOn = !$scope.filterOn;
    };

    $scope.tooltipPlacement = function(arr) {
        arr[0].placement = "bottom-left";
        for(var i=1; i<arr.length; i++){
            arr[i].placement = "bottom";
        }
    };
    var treeApi = {};
    $scope.tooltipPlacement($scope.buttons);
    $scope.treeApi = treeApi;


    var addDocOrSnapshots = function(site, siteNode) {
        ViewService.getSiteDocuments(site, false, ws)
        .then(function(docs) {
            if (config === 'latest') {
                docs.forEach(function(doc) {
                    var docNode = {
                        label : doc.name,
                        type : "view",
                        data : doc,
                        children : []
                    };
                    siteNode.children.unshift(docNode);
                });
            } else {
                var docids = [];
                docs.forEach(function(doc) {
                    docids.push(doc.sysmlid);
                });
                configSnapshots.forEach(function(snapshot) {
                    if (docids.indexOf(snapshot.sysmlid) > -1) {
                        snapshot.name = snapshot.sysmlname;
                        var snapshotNode = {
                            label : snapshot.sysmlname,
                            type : 'snapshot',
                            data : snapshot,
                            children : []
                        };
                        siteNode.children.unshift(snapshotNode);
                    }
                });
            }
        }, function(reason) {

        });
        
    };

    var dataTree = UtilsService.buildTreeHierarchy(sites, "sysmlid", "site", "parent", addDocOrSnapshots);

    $scope.my_data = dataTree;

    $scope.my_tree_handler = function(branch) {
        if (branch.type === 'site') {
            $state.go('portal.site', {site: branch.data.sysmlid});
        } else if (branch.type === 'view') {

        } else if (branch.type === 'snapshot') {

        }
        
    };

    $scope.tree_options = {
        types: {
            "section": "fa fa-file-o fa-fw",
            "view": "fa fa-file fa-fw",
            "site": "fa fa-sitemap fa-fw",
            "snapshot" : "fa fa-camera fa-fw"
        }
    };

    $timeout(function() {
        $scope.treeApi.refresh();
    }, 5000);

}])
.controller('SiteCtrl', ['$rootScope', '$scope', '$stateParams', 'documents', 'config', 'configSnapshots',
function ($rootScope, $scope, $stateParams, documents, config, configSnapshots) {
    $scope.ws = $stateParams.ws;
    $scope.site = $stateParams.site;
    $scope.documents = documents;
    var docids = [];
    documents.forEach(function(doc) {
        docids.push(doc.sysmlid);
    });
    $scope.configSnapshots = configSnapshots;
    $scope.buttons = [];
    $scope.config = config;
    $rootScope.tree_initial = $scope.site;
    $scope.snapshots = [];
    if (config !== 'latest') {
        configSnapshots.forEach(function(snapshot) {
            if (docids.indexOf(snapshot.sysmlid) > -1)
                $scope.snapshots.push(snapshot);
        });
    }
}])
.controller('ToolCtrl', ['$scope', '$rootScope', '$timeout', 'configurations', 'ws',
function($scope, $rootScope, $timeout, configurations, ws) {   
    $scope.ws = ws;
    $scope.show = {configs:true};
    $scope.configurations = configurations;
}]);
