var f,g;
var db;

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
var URN   = $rdf.Namespace("urn:");

var AUTHENDPOINT = "https://databox.me/";
var PROXY = "https://rww.io/proxy.php?uri={uri}";
var TIMEOUT = 5000;
var DEBUG = true;

var scope = {};
var gg;

$rdf.Fetcher.crossSiteProxyTemplate=PROXY;

var App = angular.module('myApp', [
  'lumx'
]);

App.config(function($locationProvider) {
  $locationProvider
    .html5Mode({ enabled: true, requireBase: false });
});

App.controller('Main', function($scope, $http, $location, $timeout, $sce, LxNotificationService, LxProgressService, LxDialogService) {

  // save app configuration if it's the first time the app runs
  $scope.initApp = function() {
    $scope.init();
  };

  $scope.TLSlogin = function() {
    $scope.loginTLSButtonText = 'Logging in...';
    $http({
      method: 'HEAD',
      url: AUTHENDPOINT,
      withCredentials: true
    }).success(function(data, status, headers) {
      // add dir to local list
      var user = headers('User');
      if (user && user.length > 0 && user.slice(0,4) == 'http') {
        LxNotificationService.success('Login Successful!');
        $scope.loggedIn = true;
        $scope.user = user;
      } else {
        LxNotificationService.error('WebID-TLS authentication failed.');
        console.log('WebID-TLS authentication failed.');
      }
      $scope.loginTLSButtonText = 'Login';
    }).error(function(data, status, headers) {
      LxNotificationService.error('Could not connect to auth server: HTTP '+status);
      console.log('Could not connect to auth server: HTTP '+status);
      $scope.loginTLSButtonText = 'Login';
    });
  };


  $scope.setVideo = function (uri) {
    $scope.video = uri;
    $('#video').empty().append('<iframe width="420" height="315" src="'+uri+'"></iframe>');
  };

  $scope.openDialog = function(elem, reset) {
      if (reset) {
          $scope.resetContact();
      }
      LxDialogService.open(elem);
      $(document).keyup(function(e) {
        if (e.keyCode===27) {
          LxDialogService.close(elem);
        }
      });
  };

  $scope.save = function() {
    var video = $scope.video;
    if (!video) {
      LxNotificationService.error('video is empty');
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
        data: '<#this> '+ SIOC('content') +' """' + video + '""" .',
    }).
    success(function(data, status, headers) {
      LxNotificationService.success('video saved');
      $location.search('storageURI', $scope.storageURI);
      $scope.setVideo(video);
    }).
    error(function(data, status, headers) {
      LxNotificationService.error('could not save video');
    });

  };

  $scope.logout = function() {
    $scope.init();
    LxNotificationService.success('Logout Successful!');
  };

  // set init variables
  $scope.init = function() {

    // start in memory DB
    g = $rdf.graph();
    f = $rdf.fetcher(g);
    // add CORS proxy
    var PROXY      = "https://data.fm/proxy?uri={uri}";
    var AUTH_PROXY = "https://rww.io/auth-proxy?uri=";
    //$rdf.Fetcher.crossSiteProxyTemplate=PROXY;
    var kb         = $rdf.graph();
    var fetcher    = $rdf.fetcher(kb);


    $scope.initialized = true;
    $scope.loggedIn = false;
    $scope.loginTLSButtonText = "Login";
    // display elements object

    var storageURI = 'https://video.databox.me/Public/.video/test';
    if ($location.search().storageURI) {
      storageURI = $location.search().storageURI;
    }
    $scope.storageURI = storageURI;

    f.nowOrWhenFetched(storageURI, undefined, function(ok, body) {
      var vid = g.statementsMatching(undefined, SIOC('content'));
      if (vid.length) {
        var video = vid[0].object.value;
        $scope.setVideo(video);
        //$scope.video = video;
      }
    });

  };

  $scope.initApp();

});
