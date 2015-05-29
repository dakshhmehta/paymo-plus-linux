var app = angular.module('pml', ['file-model'])
	.value('csvParser', Papa)
	.value('moment', moment);

// Services
app.factory('Paymo', ['$http', function($http){
	var url = 'https://app.paymoapp.com/api';
	var api = null;

	return {
		init: function(api_key){
			api = api_key;
			$http.defaults.headers.common['Accept'] = 'application/json';
			$http.defaults.headers.common['Authorization'] = 'Basic '+btoa(api_key+':x');
		},
		getTasks: function(project_id){
			return $http.get(url + '/tasks?where=project.id = '+project_id);
		},
		getProjectsWithTasks: function(){
			return $http.get(url + '/projects?include=tasks&where=active = true and tasks.complete = false');
		}
	};
}]);

String.prototype.toHHMMSS = function () {
    var sec_num = parseInt(this, 10); // don't forget the second param
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    var time    = hours+':'+minutes+':'+seconds;

    return time;
}

app.controller('AppCtrl', ['$scope', 'Paymo', 'csvParser', 'moment', function($scope, Paymo, csvParser, moment){
	console.log('Application Controller added');

	$scope.apikey = 'c6587fa23e45185f2bdf34f74581e904';

	$scope.entries = [];

	$scope.totalTime = 0;

	$scope.authorize = function(){
		Paymo.init($scope.apikey);

		Paymo.getProjectsWithTasks().success(function(data){
			$scope.projects = data.projects;
			console.log($scope.projects);
		});
	};

	$scope.processFile = function(){
		console.log($scope.csvFile);

		$scope.$apply(function(){
			$scope.entries = [];
			$scope.totalTime = 0;
		});

		$scope.toHHMMSS = function(secs){
			seconds = "" + secs;
			return seconds.toHHMMSS();
		};


		csvParser.parse($scope.csvFile, {
			complete: function(results) {
				for(i = 0; i < results.data.length; i++){
					$scope.$apply(function(){
						$scope.entries.push({
							title: results.data[i][0],
							time: moment().add(results.data[i][1], 's'),
							seconds: results.data[i][1]
						});

						if(! isNaN(parseInt($scope.totalTime) + parseInt(results.data[i][1])))
							$scope.totalTime = parseInt($scope.totalTime) + parseInt(results.data[i][1]);
					});
				}
			}
		});

		console.log($scope.entries);
	};
}]);

/* Notepad
		"Accept": "application/json",

// API Key: c6587fa23e45185f2bdf34f74581e904
*/