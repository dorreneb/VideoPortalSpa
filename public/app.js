var tenantName = "junction.sharepoint.com";

var videoPortalApp = angular.module("videoPortalApp", ['ngRoute', 'AdalAngular'])
	.factory('videosFactory', ['$http', function ($http) {
		var factory = {};

		var baseUrl = "https://" + tenantName + "/portals/hub/_api/videoService/";

		factory.getFeaturedVideos = function () {
			$http.defaults.useXDomain = true;
			delete $http.defaults.headers.common['X-Requested-With'];
			return $http.get(baseUrl + 'spotlightVideos?$top=4&$expand=Video');
		};
		factory.getPopularVideos = function () {
			$http.defaults.useXDomain = true;
			delete $http.defaults.headers.common['X-Requested-With'];
			return $http.get(baseUrl + 'search/popular?$top=10');
		};
		factory.getChannel = function (channelId) {
			$http.defaults.useXDomain = true;
			delete $http.defaults.headers.common['X-Requested-With'];
			return $http.get(baseUrl + 'channels(guid\'' + channelId + '\')?$expand=Videos,SpotlightVideos/Video');
		};
		factory.getPopularChannelVideos = function (channelId) {
			$http.defaults.useXDomain = true;
			delete $http.defaults.headers.common['X-Requested-With'];
			return $http.get(baseUrl + 'channels(guid\'' + channelId + '\')/search/popular');
		}
		factory.getChannelVideos = function (channelId) {
			$http.defaults.useXDomain = true;
			delete $http.defaults.headers.common['X-Requested-With'];
			return $http.get(baseUrl + 'channels(guid\'' + channelId + '\')?$expand=Videos');
		};
		factory.getRelatedVideos = function (channelId) {
			$http.defaults.useXDomain = true;
			delete $http.defaults.headers.common['X-Requested-With'];
			return $http.get(baseUrl + 'channels(guid\'' + channelId + '\')/search/related?$top=4');
		};
		factory.getVideo = function (channelId, videoId) {
			$http.defaults.useXDomain = true;
			delete $http.defaults.headers.common['X-Requested-With'];
			return $http.get(baseUrl + 'channels(guid\'' + channelId + '\')/videos(guid\'' + videoId + '\')');
		};
		factory.getPlaybackUrl = function(channelId, videoId) {
			$http.defaults.useXDomain = true;
			delete $http.defaults.headers.common['X-Requested-With'];
			return $http.get(baseUrl + 'channels(guid\'' + channelId + '\')/videos(guid\'' + videoId + '\')/getPlaybackUrl(1)');
		};
		factory.getStreamingToken = function(channelId, videoId) {
			$http.defaults.useXDomain = true;
			delete $http.defaults.headers.common['X-Requested-With'];
			return $http.get(baseUrl + 'channels(guid\'' + channelId + '\')/videos(guid\'' + videoId + '\')/getStreamingKeyAccessToken');						
		};
		factory.getChannelsAndVideos = function() {
			$http.defaults.useXDomain = true;
			delete $http.defaults.headers.common['X-Requested-With'];
			return $http.get(baseUrl + 'channels?$top=3&$expand=Videos');
		};
		factory.getChannels = function() {
			$http.defaults.useXDomain = true;
			delete $http.defaults.headers.common['X-Requested-With'];
			return $http.get(baseUrl + 'channels?$top=20');
		};

		return factory;
	}]);

videoPortalApp.config(['$routeProvider', '$httpProvider', 'adalAuthenticationServiceProvider', function ($routeProvider, $httpProvider, adalProvider) {  
	$routeProvider
		.when('/',
			{
				controller: 'HomeController',
				templateUrl: 'partials/home.html',
				requireADLogin: true
			})
		.when('/channels',
			{
				controller: 'ChannelsController',
				templateUrl: 'partials/channels.html',
				requireADLogin: true
			})
		.when('/channels/:channelId',
			{
				controller: 'ChannelController',
				templateUrl: 'partials/channel.html',
				requireADLogin: true
			})
		.when('/channels/:channelId/videos/:videoId',
			{
				controller: 'VideoController',
				templateUrl: 'partials/video.html',
				requireADLogin: true
			})
		.otherwise({redirectTo: '/' });

	var adalConfig = {
			tenant: 'common', 
			clientId: '5e188fc6-f4ac-40cb-9373-a75d7efa4e1c', 
			extraQueryParameter: 'nux=1',
			endpoints: {}
			//cacheLocation: 'localStorage', // enable this for IE, as sessionStorage does not work for localhost. 
	};
	adalConfig.endpoints["https://" + tenantName + "/portals/hub/_api/"] = "https://" + tenantName;

	adalProvider.init(adalConfig, $httpProvider); 

}]);

videoPortalApp.controller("HomeController", function($scope, $q, videosFactory) {
	var requests = {
		featuredVideos: videosFactory.getFeaturedVideos(),
		popularVideos: videosFactory.getPopularVideos(),
		channels: videosFactory.getChannelsAndVideos()
	};

	$q.all(requests).then(function (responses) {
		console.log("Requests completed");
		$scope.featuredVideos = responses.featuredVideos.data.value;
		$scope.popularVideos = responses.popularVideos.data.value;
		$scope.channels = responses.channels.data.value;
		//$scope.$apply();
	});
	/*
	videosFactory.getFeaturedVideos().success(function (results) {
		$scope.featuredVideos = results.value;
		console.log("Featured videos returned: " + $scope.featuredVideos.length);
		$scope.$apply();
	});
	videosFactory.getPopularVideos().success(function (results) {
		$scope.popularVideos = results.value;
		console.log("Popular videos returned: " + $scope.popularVideos.length);
		$scope.$apply();
	});
	videosFactory.getChannelsAndVideos().success(function (results) { 
		$scope.channels = results.value; 
		console.log("Channels returned: " + $scope.channels.length);
		$scope.$apply();
	});
*/
});

videoPortalApp.controller("ChannelsController", function($scope, videosFactory) {
	videosFactory.getChannels().success(function (results) {
		$scope.channels = results.value;
		console.log("Channels returned: " + $scope.channels.length);
	});
});

videoPortalApp.controller("ChannelController", function($scope, $routeParams, videosFactory) {
	videosFactory.getChannel($routeParams.channelId).success(function (results) {
		results.VideoCount = results.Videos.length;
		if (results.SpotlightVideos.length > 5) {
			results.SpotlightVideos.splice(5, results.SpotlightVideos.length - 5);	
		}
		$scope.channel = results;
	});
	videosFactory.getPopularChannelVideos($routeParams.channelId).success(function (results) {
		$scope.popularChannelVideos = results.value;
	})
	$scope.selectedView = 1;
});

videoPortalApp.controller("VideoController", function($scope, $routeParams, $sce, videosFactory) {

	function constructEmbedUrl() {
		var videoEmbedUrl = "//aka.ms/azuremediaplayeriframe?url=" + encodeURIComponent($scope.playbackUrl) + "&protection=aes&token=" + encodeURIComponent($scope.accessToken) + "&autoplay=false";
		$scope.videoEmbedUrl = $sce.trustAsResourceUrl(videoEmbedUrl);
	}

	videosFactory.getStreamingToken($routeParams.channelId, $routeParams.videoId).success(function (results) {
		console.log("Playback token returned");
		$scope.accessToken = results.value;
		if ($scope.playbackUrl) {
			constructEmbedUrl();
			
		}
	});
	videosFactory.getPlaybackUrl($routeParams.channelId, $routeParams.videoId).success(function (results) {
		console.log("Playback URL returned");
		$scope.playbackUrl = results.value;
		if ($scope.accessToken) {
			constructEmbedUrl();
			
		}
	});
	videosFactory.getChannel($routeParams.channelId).success(function (results) {
		console.log("Channel returned");
		results.VideoCount = results.Videos.length;
		$scope.channel = results;
		
	});
	videosFactory.getVideo($routeParams.channelId, $routeParams.videoId).success(function (results) { 
		$scope.video = results; 
		console.log("Video returned");
		
	});
	videosFactory.getRelatedVideos($routeParams.channelId).success(function (results) {
		$scope.relatedVideos = results.value; 
		console.log("Related Videos returned");
		
	});

});

videoPortalApp.directive("videoTile", function () {
	return {
		restrict: "E",
		scope: {
			spotlight: "@",
			title:"@",
			duration: "@",
			viewcount: "@",
			channelid: "@",
			videoid: "@",
			thumbnailurl: "@"

		},
		templateUrl: 'partials/videoTile.html'
	}
});
