/**
* The main app
*/
var App = angular.module('Video', [
  'lumx'
]);

App.config(function($locationProvider) {
  $locationProvider
  .html5Mode({ enabled: true, requireBase: false });
});

App.controller('Main', function($scope, $http, $location, $timeout, LxNotificationService, LxProgressService, LxDialogService) {
  // Namespaces
  var CHAT  = $rdf.Namespace("https://ns.rww.io/chat#");
  var CURR  = $rdf.Namespace("https://w3id.org/cc#");
  var DCT   = $rdf.Namespace("http://purl.org/dc/terms/");
  var FACE  = $rdf.Namespace("https://graph.facebook.com/schema/~/");
  var FOAF  = $rdf.Namespace("http://xmlns.com/foaf/0.1/");
  var LIKE  = $rdf.Namespace("http://ontologi.es/like#");
  var LDP   = $rdf.Namespace("http://www.w3.org/ns/ldp#");
  var MBLOG = $rdf.Namespace("http://www.w3.org/ns/mblog#");
  var OWL   = $rdf.Namespace("http://www.w3.org/2002/07/owl#");
  var PIM   = $rdf.Namespace("http://www.w3.org/ns/pim/space#");
  var RDF   = $rdf.Namespace("http://www.w3.org/1999/02/22-rdf-syntax-ns#");
  var RDFS  = $rdf.Namespace("http://www.w3.org/2000/01/rdf-schema#");
  var SIOC  = $rdf.Namespace("http://rdfs.org/sioc/ns#");
  var SOLID = $rdf.Namespace("http://www.w3.org/ns/solid/app#");
  var TMP   = $rdf.Namespace("urn:tmp:");

  var f,g;

  /**
  * Init app
  */
  $scope.initApp = function() {
    $scope.init();
  };

  /**
  * TLS Login with WebID
  */
  $scope.TLSlogin = function() {
    var AUTHENDPOINT = "https://databox.me/";
    $scope.loginTLSButtonText = 'Logging in...';
    $http({
      method: 'HEAD',
      url: AUTHENDPOINT,
      withCredentials: true
    }).success(function(data, status, headers) {
      var header = 'User';
      var scheme = 'http';
      var user = headers(header);
      if (user && user.length > 0 && user.slice(0,scheme.length) === scheme) {
        $scope.notify('Login Successful!');
        $scope.loggedIn = true;
        $scope.user = user;
        $scope.fetchVideo();
      } else {
        $scope.notify('WebID-TLS authentication failed.', 'error');
      }
      $scope.loginTLSButtonText = 'Login';
    }).error(function(data, status, headers) {
      $scope.notify('Could not connect to auth server: HTTP '+status);
      $scope.loginTLSButtonText = 'Login';
    });
  };

  /**
  * Logout
  */
  $scope.logout = function() {
    $scope.init();
    $scope.notify('Logout Successful!');
  };

  /**
  * Notify
  * @param  {String} message the message to display
  * @param  {String} type the type of notification, error or success
  */
  $scope.notify = function(message, type) {
    console.log(message);
    if (type === 'error') {
      LxNotificationService.error(message);
    } else {
      LxNotificationService.success(message);
    }
  };

  /**
  * Set video in UI
  */
  $scope.setVideo = function (uri) {
    $scope.video = uri;
    var width = $('#video').width();
    if (width > 425) {
      width = 425;
    }
    var height = Math.round(( width * 3 ) / 4);
    var iframe = '<iframe width="' + width + '" height="' + height +
                 '" src="'+uri+'"></iframe>';
    $('#video').empty().append(iframe);
    $location.search('storageURI', $scope.storageURI);
  };

  /**
  * openDialog opens a dialog box
  * @param  {String} elem  The element to display
  */
  $scope.openDialog = function(elem) {
    LxDialogService.open(elem);
    $(document).keyup(function(e) {
      if (e.keyCode===27) {
        LxDialogService.close(elem);
      }
    });
  };

  /**
  * Save video
  */
  $scope.save = function() {
    var video = $scope.video;
    if (!video) {
      $scope.notify('video is empty', 'error');
      return;
    }
    console.log(video);

    $http({
      method: 'PUT',
      url: $scope.storageURI,
      withCredentials: true,
      headers: {
        "Content-Type": "text/turtle"
      },
      data: '<#this> ' + SIOC('content') + ' """' + video + '""" .',
    }).
    success(function(data, status, headers) {
      $scope.notify('video saved');
      $location.search('storageURI', $scope.storageURI);
    }).
    error(function(data, status, headers) {
      $scope.notify('could not save video', 'error');
    });

  };

  /**
  * Set Initial variables
  */
  $scope.init = function() {

    $scope.initialized = true;
    $scope.loggedIn = false;
    $scope.loginTLSButtonText = "Login";

    // start in memory DB
    g = $rdf.graph();
    f = $rdf.fetcher(g);

    $scope.storageURI = 'https://video.databox.me/Public/.video/test';
    if ($location.search().storageURI) {
      $scope.storageURI = $location.search().storageURI;
    }

  };

  /**
   * Fetches the video
   */
  $scope.fetchVideo = function() {
    f.nowOrWhenFetched($scope.storageURI, undefined, function(ok, body) {
      var video = g.any($rdf.sym($scope.storageURI + '#this'), SIOC('content'));
      $scope.setVideo(video);
    });
  };

  $scope.initApp();

});
