angular
.module('chatroom', [])
.controller('mainController', ['$scope', '$http', '$window', '$timeout', function($scope, $http, $window, $timeout){

  // first, establish the socket connection
  var server = io('http://localhost:5000'); // change this if you are hosting on a remote server

  // hide chatroom until the nickname is entered
  $scope.gotNickname = false;

  // on connect
  server.on('connect', function(data){
    
    $timeout(function(){  // temporary fix for angular
      document.getElementById('nickname').focus();
    }, 300);

    $scope.nicknameSubmitHandler = function () {
      if($scope.nickname){
        if($scope.nickname.trim() === ''){
          $scope.nickname = '';
          console.log('Please enter nickname.');
        } else {
          console.log('Got nickname: ' + $scope.nickname);
          server.emit('join', $scope.nickname);
          $scope.nicknames = [ {nickname: $scope.nickname} ];
          $scope.gotNickname = true;

          angular.element(document.querySelector('#chatters')).append("<li id='me'>"+$scope.nickname+"</li>");
          $timeout(function(){  // temporary fix for angular
            document.getElementById('chatInput').focus();
          }, 300);
        }
      } else {
        console.log('Please enter nickname.');
      }
    };

  });

  // on new chatter
  server.on('add chatter', function(nickname){
    console.log('Got add chatter request for ' + nickname);

    $scope.nicknames.push({nickname: nickname});

    angular.element(document.querySelector('#chatters')).append("<li>"+nickname+"</li>");

    $scope.$apply();
  });

  // on remove chatter
  server.on('remove chatter', function(nickname){
    if(nickname !== null && typeof nickname !== 'undefined'){
      console.log('Someone left: ' + nickname);

      console.log('$scope.nicknames', $scope.nicknames);

      for(var i=0, l=$scope.nicknames.length; i<l; i++){
        if($scope.nicknames[i].nickname === nickname){
          $scope.nicknames.splice(i,1);
          $scope.$apply();
          break;
        }
      }
    }
  });

  server.on('messages', function(message) {
    if(/null/.test(message) === true || /undefined/.test(message) === true){ // temporary fix
      return false;
    }

    angular.element(document.querySelector('#chatLog')).append("<p>" + message + "</p>");
    var chatLogDiv = document.getElementById("chatLog");
    chatLogDiv.scrollTop = chatLogDiv.scrollHeight - chatLogDiv.clientHeight;
  });

  $scope.submitHandler = function($event){
    $event.preventDefault();

    angular.element(document.querySelector('#chatLog')).append("<p class='italic'><strong>Me: </strong>" + $scope.chatInput + "</p>");
    
    var chatLogDiv = document.getElementById("chatLog");
    chatLogDiv.scrollTop = chatLogDiv.scrollHeight;

    server.emit("messages", $scope.chatInput);

    $scope.chatInput = "";
  };

  $window.addEventListener("beforeunload", function (event) {
    return $window.confirm("Do you really want to close?");
  });

}]);