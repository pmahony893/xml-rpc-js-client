/*
 * This is free and unencumbered software released into the public domain.
 * For more information, please refer to <http://unlicense.org/>
 * License: http://unlicense.org/UNLICENSE
 */
;function AppCtrl($scope) {
	$scope.loading = true;
	$scope.init = function() {
		$scope.loading = false;
	}
	$scope.joyride = function(){
		jQuery(document).foundation('joyride', 'start');
	}
	$scope.copyMethod = function() {
		document.getElementById('clip').focus();
		document.execCommand('selectAll',false,null);
		document.execCommand('copy', false, null);
//		document.getElementById('clip').blur();
	}
	$scope.loadServers = function () {
		var servers = JSON.parse(localStorage.getItem('servers')) || {};
		$scope.server = undefined;
		$scope.servers = [];
		$scope.methods = [];
		$scope.method = undefined;
		$scope.params = null;
		for(url in servers) {
			$scope.servers.push({"url":url,"methods":servers[url]});
		}
	}
	$scope.removeServer = function (server) {
		var servers = JSON.parse(localStorage.getItem('servers'));
		delete servers[server.url];
		localStorage.setItem('servers',JSON.stringify(servers));
		$scope.loadServers();
	}
	$scope.serverChanged = function(){
		$scope.methods = [];
		$scope.method = undefined;
		$scope.params = null;
		$scope.status = undefined;
		$scope.responsexml = undefined;
	}
	$scope.setServer = function(server){
		$scope.server = server;
		$scope.serverChanged();
		$scope.methods = $scope.server.methods;
		$scope.method = $scope.server.methods[0];
		document.getElementsByTagName('body')[0].click(); // chiudo eventuale history
	}
	$scope.addServer = function (url,methods) {
		methods = methods || null;
		var servers = JSON.parse(localStorage.getItem('servers')) || {};
		if(servers[url] === undefined) {
			$scope.servers.push({"url":url,"methods":methods});
		}
		if(url !== null && methods !== null) {
			servers[url] = methods;		
			localStorage.setItem('servers',JSON.stringify(servers));
		}
	}
	$scope.loadMethods = function(){
		$scope._execRequest($scope.server.url, 'system.listMethods',null,function(response, status, jqXHR){
			var methods = response[0];
			$scope.methods = [];
			for(var i = 0, max = methods.length; i < max; i++) {
				$scope.methods.push(methods[i].toString());
			}
			$scope.method = methods[0];
			$scope.addServer($scope.server.url,$scope.methods);
		});
	}
	$scope._execRequest = function(url,method,params,successcb,errorcb) {
		$scope.status = {'status':'info','msg':'Sending request ...'};
		$scope.loading = true;
		$scope.responsexml = undefined;
		jQuery.xmlrpc({
			'url': url,
			'methodName': method,
			'params': params,
			success: function(response, status, jqXHR) {
				$scope.$apply(function(){
					document.getElementById('outputobj').innerHTML = '';
					Object.inspectInto(response[0], 'outputobj', 'Response object');
					if(Object.isFunction(successcb)){
						successcb(response, status, jqXHR);				
					}
					$scope.responsexml = prettify(jqXHR.responseText).replace(/\t/g,'  ');
					$scope.status = {'status':'success','msg':'Request status ' + jqXHR.status};
					$scope.loading = false;
				});
			},
			error: function(jqXHR, status, error) {
				$scope.$apply(function(){
					document.getElementById('outputobj').innerHTML = '';
					document.getElementById('outputobj').innerHTML = '';
					if(Object.isFunction(errorcb)) {
						errorcb(jqXHR, status, error);
					}
					$scope.responsexml = prettify(jqXHR.responseText).replace(/\t/g,'  ');
					$scope.status = {'status':'warning','msg':error.message};
					$scope.loading = false;
				});
			}
		});
	}
	$scope.methodHelp = function(){
			$scope._execRequest($scope.server.url, 'system.methodHelp',[$scope.method]);
	}
	$scope.methodSignature = function(){
			$scope._execRequest($scope.server.url, 'system.methodSignature',[$scope.method]);
	}
	$scope.execRequest = function(){
		try {
			var params = JSON.parse($scope.params);
		} catch (err) {
			$scope.error(err.message + " [tip: use valid JSON format]") ;
			return;
		}
		try {
		console.log(Object.prototype.toString.call(params));
			if(Object.prototype.toString.call(params) === '[object Null]') {
				params = [];
			}
			if(Object.prototype.toString.call(params) !== '[object Array]') {
				params = [params];
			}
			$scope._execRequest($scope.server.url, $scope.method,params);
		} catch (err) {
			$scope.error(err.message);			
		}
	}
	$scope.error = function(msg){
		$scope.status = {'status':'warning','msg':msg};
	}
	$scope.loadServers();
	$scope.$on('change',function(){console.log($scope)});
	$scope.$watch(function(){
		jQuery(window).resize();
	});
}
;(function($) {
	$(function(){
		$(window).resize(function(){
			var o = $('#output');
			o.height($('html').height() - o.offset().top - 57);
			if(o.height()<200) { o.height(200); }
		}).resize();
	});
	$(document).foundation();
})(jQuery);
