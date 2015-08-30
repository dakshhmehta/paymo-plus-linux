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
		},
		addTimeEntry: function(task, entry){
			var _task = {
				task_id: task.id,
				date: entry.date.format(),
				duration: entry.seconds,
				description: entry.title
			};

			console.log(entry.date);

			return $http.post(url + '/entries', _task);
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

	$scope.apikey = '606b70a1019a0d88780ddd479ea10282';

	$scope.entries = [];

	$scope.t_query = '';

	$scope.authorize = function(){
		Paymo.init($scope.apikey);

		Paymo.getProjectsWithTasks().success(function(data){
			$scope.projects = data.projects;
			console.log($scope.projects);
		});
	};

	$scope.processFile = function(){
		console.log($scope.csvFile);

		$scope.entries = [];

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
							time: moment(results.data[i][2], "YYYY-MM-DD").add(results.data[i][1], 's'),
							seconds: parseInt(results.data[i][1]),
							date: moment(results.data[i][2], "YYYY-MM-DD")
						});
					});
				}
			}
		});

		console.log($scope.entries);
	};

	$scope.toggleSelection = function(timeEntry){
		timeEntry.selected = !timeEntry.selected;
	};

	$scope.countSelectedEntries = function(){
		var secs = 0;

		angular.forEach($scope.entries, function(entry){
			if(entry.selected == true)
				secs += Math.round(entry.seconds);
		});

		return secs;
	};

	$scope.countEntries = function(){
		var secs = 0;

		angular.forEach($scope.entries, function(entry){
			if(!isNaN(entry.seconds) && entry.title.toLowerCase().indexOf($scope.t_query.toLowerCase()) >= 0)
				secs += Math.round(entry.seconds);
		});

		return secs;
	}

	$scope.selectAllTasks = function(){	
		angular.forEach($scope.entries, function(entry){
			if(entry.title.toLowerCase().indexOf($scope.t_query.toLowerCase()) >= 0)
				entry.selected = true;
		});
	};

	$scope.deSelectAllTasks = function(){	
		angular.forEach($scope.entries, function(entry){
			if(entry.title.toLowerCase().indexOf($scope.t_query.toLowerCase()) >= 0)
				entry.selected = false;
		});
	};

	$scope.linkTime = function(task){
		angular.forEach($scope.entries, function(entry, index){
			if(entry.selected == true){
				console.log(index);

				Paymo.addTimeEntry(task, entry);
				$scope.entries.splice(index, 1);
			}
		});

		$scope.$apply();
	};
}]);

/* Notepad
		"Accept": "application/json",

// API Key: c6587fa23e45185f2bdf34f74581e904
*/