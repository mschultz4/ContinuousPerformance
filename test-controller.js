// to document
// Starting in 3, 2, 1
// Mouse to F and J
// Instructions
// Missed non targets data

angular
    .module('ContinuousPerformanceTest', [])
    .controller('test', test);

function test($scope, $interval, $timeout){
    var seq = createSequence(config.length, config.percent);
    var num = 0;
    var startTime = new Date();
    $scope.stimulus = '';
    $scope.status = 'start';
    $scope.data = {
        id: '',
        targetsHit : 0,
        targetsMissed : 0,
        falseAlarms : 0,
        correctReject : 0,
        nonTargetsMissed: 0
    };

    //set up start button click event
    document.getElementById('startButton').addEventListener('click', runTest);
    
    function runTest(){
        $scope.status = 'in progress';
        
        // setup mouse click events
        document.addEventListener('contextmenu', stopDefault, false);
        document.addEventListener('mousedown', recordInput);
        
        // Start interval
        var stop = $interval(runInterval, config.intervalOnScreen + config.intervalBreak);
        
        function runInterval(){
            if(!$scope.stimulus.clicked && $scope.stimulus.target){
                $scope.data.targetsMissed++;
            }
            if(seq[num]){
                $scope.stimulus = seq[num];
                $timeout(function(){
                    $scope.stimulus.letter = ' ';
                    console.log(num + " " + $scope.stimulus.letter);
                }, config.intervalOnScreen);
                console.log(num + " " + $scope.stimulus.letter);
                num++;
            }else{
                $interval.cancel(stop);
                console.log(new Date() - startTime);
                localStorage[$scope.data.id] = angular.toJson($scope.data);
                $scope.status = 'complete';
                document.removeEventListener('contextmenu', stopDefault);
                document.removeEventListener('mousedown', recordInput);
            }
        }
        
        function recordInput(e){
            e.stopPropagation(); 
            e.preventDefault();
            if(!$scope.stimulus.clicked){
                if(e.button === 2 && $scope.stimulus.target){$scope.data.targetsHit++;}
                else if(e.button === 0 && $scope.stimulus.target) {$scope.data.targetsMissed++;}
                else if(e.button === 2 && !$scope.stimulus.target){$scope.data.falseAlarms++;}
                else{$scope.data.correctReject++;} 
                console.log(e.button);
            }
            $scope.stimulus.clicked = true;
        }

        function stopDefault(e) { 
            e.preventDefault();
        }
    }    
      
    function createSequence(len, perc){
        var sequence = [],
            stimuli = ['E', 'F', 'H', 'L', 'N', 'T', 'V', 'Y', 'Z']
            display = len * perc/100;
        
        //Insert AX combos
        for(var i = 0; i < display; i++){
            var loc = random(len);
            if(!sequence[loc] && !sequence[loc + 1] && loc != len - 1){
                sequence[loc] = {letter: 'A', target: false, clicked: false};
                sequence[loc  + 1] = {letter: 'X', target: true, clicked: false};
            }else {
                i -= 1;
            }
        }
        
        //Insert A* combos
        for(var i = 0; i < display; i++){
            var loc = random(len);
            var let = stimuli[random(9)];
            if(!sequence[loc] && !sequence[loc + 1] && loc != len - 1){
                sequence[loc] = {letter: 'A', target: false, clicked: false};
                sequence[loc  + 1] = {letter: let, target: false, clicked: false};
            }else {
                i -= 1;
            }
        }
        
        //Insert *X combos
        for(var i = 0; i < display; i++){
            var loc = random(len);
            var let = stimuli[random(9)];
            if(!sequence[loc] && !sequence[loc + 1] && loc != len - 1){
                sequence[loc] = {letter: let, target: false, clicked: false};
                sequence[loc  + 1] = {letter: 'X', target: false, clicked: false};
            }else {
                i -= 1;
            }
        }
        
        //Fill in remaining nodes with stimuli (not A or X)
        for(var i = 0; i < len; i++){
            var let = stimuli[random(9)];
            if(!sequence[i]){
                sequence[i] = {letter: let, target: false, clicked: false};
            }
        }
        
        return sequence;
    }

    function random(len){
        return Math.floor(Math.random() * len);
    }
}


console.log("Length: " + seq.length);
console.log("Total A: " + seq.filter(function(e){return e.letter === 'A';}).length);
console.log("Total X: " + seq.filter(function(e){return e.letter === 'X';}).length);
console.log("Total targets: " + seq.filter(function(e){return e.target === true;}).length);
console.log("Total AX: " + seq.filter(function(e, i){return e.letter === 'A' && seq[i + 1].letter === 'X';}).length);
console.log("Total A*: " + seq.filter(function(e, i){return e.letter === 'A' && seq[i + 1].letter !== 'X';}).length);
console.log("Total *X: " + seq.filter(function(e, i){return e.letter === 'X' && seq[i - 1].letter !== 'A';}).length);
console.log("Total XA: " + seq.filter(function(e, i){return e.letter === 'X' && seq[i + 1].letter === 'A';}).length);
console.log("Undefined: " + (600 - seq.filter(function(e){return true;}).length));
console.log("Defined: " + seq.filter(function(e){return true;}).length);