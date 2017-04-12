'use strict';

angular.module('mms')
.factory('StompService', ['$rootScope', 'ApplicationService', 'ElementService', 'URLService','$http', StompService]);

/**
 * @ngdoc service
 * @name mms.StompService
 * @requires _
 *
 * @description
 * Provides messages from the activemq JMS bus
 */
function StompService($rootScope, ApplicationService, ElementService, URLService, $http) {
     var stompClient = {};
     var host;

    $http.get(URLService.getJMSHostname()).then(function successCallback(response) {
        if(response.data.connections[0].hasOwnProperty("uri")){
            var removeProtocol = response.data.connections[0].uri.replace(/.*?:\/\//g, "");
            host = 'wss://' + removeProtocol.substring(0, removeProtocol.length-6) + ':61614';
            stompConnect();
        }else{
            console.log('JSON does not contain the right key.  STOMP failed.');
        }
    }, function errorCallback(failed) {
        console.log("failed to connect to the JMS:  " + failed.status);
    });

    var stompSuccessCallback = function(message){
        var updateWebpage = angular.fromJson(message.body);
        var projectId = message.headers.projectId;
        var refId = message.headers.refId;
        if (updateWebpage.source !== ApplicationService.getSource()) {
            // $rootScope.$apply(function () {
                if (updateWebpage.refs.addedElements && updateWebpage.refs.addedElements.length > 0) {
                    refId = !refId ? 'master' : refId;
                    angular.forEach(updateWebpage.refs.addedElements, function (eltId) {
                        ElementService.getElement({
                            projectId: projectId,
                            refId: refId,
                            extended: true,
                            elementId: eltId
                        }, 1, true).then(function (data) {
                            $rootScope.$broadcast("element.updated", data, null, true);
                        });
                    });
                }
                if (updateWebpage.refs.updatedElements && updateWebpage.refs.updatedElements.length > 0) {
                    refId = !refId ? 'master' : refId;
                    angular.forEach(updateWebpage.refs.updatedElements, function (eltId) {
                        ElementService.getElement({
                            projectId: projectId,
                            refId: refId,
                            extended: true,
                            elementId: eltId
                        }, 1, true).then(function (data) {
                            $rootScope.$broadcast("element.updated", data, null, true);
                        });
                    });
                }
            // });
        }
        if(updateWebpage.refs.addedJobs  && updateWebpage.refs.addedJobs.length > 0 ){//check length of added jobs > 0
            var newJob = updateWebpage.refs.addedJobs;
            $rootScope.$broadcast("stomp.job", newJob);
        }
        if(updateWebpage.refs.updatedJobs  && updateWebpage.refs.updatedJobs.length > 0 ){//check length of added jobs > 0
            var updateJob = updateWebpage.refs.updatedJobs;
            $rootScope.$broadcast("stomp.updateJob", updateJob);
        }
        if(updateWebpage.refs.deletedJobs  && updateWebpage.refs.deletedJobs.length > 0 ){//check length of added jobs > 0
            var deleteJob = updateWebpage.refs.deletedJobs;
            $rootScope.$broadcast("stomp.deleteJob", deleteJob);
        }
        // this should happen in where...
        $rootScope.$on('$destroy', function() {
            stompClient.unsubscribe('/topic/master'/*, whatToDoWhenUnsubscribe*/);
        });
    };
    var stompFailureCallback = function(error){
        console.log('STOMP: ' + error);
        stompConnect();
        console.log('STOMP: Reconnecting in 10 seconds');
    };
    var stompConnect = function(){
        stompClient = Stomp.client(host);
        stompClient.debug = null;
        stompClient.connect("guest", "guest", function(){ // on success
            stompClient.subscribe("/topic/master", stompSuccessCallback );
        }, stompFailureCallback, '/');
    };

     return {

     };
 }
