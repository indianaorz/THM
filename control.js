var w = 20;
var h = 11;
var size = 50;
var padding = 24;

var SERVERURI = "https://thmserver20191231015825.azurewebsites.net/highscore";//"https://localhost:44345/highscore";

var topHighscoreScount = 50;

var scorePerBlock = 2.5;
var increasePerChain = 2;
var easyDifficultyMult = .1;
var hardDifficultyMult = 2;
var meanDifficultyMult = 3;

var classes = ["one","two","three"];
var blockText = [".","..","..."];

var hiddenPoints = [500, 1000, 1500, 2000, 3000];

var currentScore;
var playArea;
var scoreDisplay;
var playAreaContainer;
var blocks = [];
var mouseX;
var mouseY;

var username;

var highscoresData;
var highscores;

(function() {
    document.onmousemove = handleMouseMove;
    function handleMouseMove(event) {
        var eventDoc, doc, body;

        event = event || window.event; // IE-ism

        // If pageX/Y aren't available and clientX/Y are,
        // calculate pageX/Y - logic taken from jQuery.
        // (This is to support old IE)
        if (event.pageX == null && event.clientX != null) {
            eventDoc = (event.target && event.target.ownerDocument) || document;
            doc = eventDoc.documentElement;
            body = eventDoc.body;

            event.pageX = event.clientX +
              (doc && doc.scrollLeft || body && body.scrollLeft || 0) -
              (doc && doc.clientLeft || body && body.clientLeft || 0);
            event.pageY = event.clientY +
              (doc && doc.scrollTop  || body && body.scrollTop  || 0) -
              (doc && doc.clientTop  || body && body.clientTop  || 0 );
        }

        // Use event.pageX / event.pageY here
        mouseX = event.pageX;
        mouseY = event.pageY;
    }
})();

for(var i = 0, l = w; i < l; i++){
    blocks[i] = [];
    for(var j = 0, l2 = h; j < l2; j++){
        blocks[i][j] = {};
    }
}

function toggleScore(){
    document.getElementById("highscores").classList.toggle("hidden");
    document.getElementById("highscores-back").classList.toggle("hidden");
}
var difficulty;
function signin(){
    username = document.getElementById("username").value;
    localStorage.setItem("username",username);
    document.getElementById("content").classList.remove("hidden");
    document.getElementById("sign-in").classList.add("hidden");
    document.getElementById("sign-in-parent").classList.add("hidden");
    var e = document.getElementById("difficulty");
     difficulty= e.options[e.selectedIndex].value;
    console.log(difficulty);

    if(difficulty == "easy"){
        classes = classes.splice(0,2);
        blockText = blockText.splice(0,2);
        hiddenPoints = hiddenPoints.splice(0,3);
        scorePerBlock *= easyDifficultyMult;
    }
    if(difficulty == "hard"){
        classes.push("four");
        blockText.push(".v");
        scorePerBlock *= hardDifficultyMult;
        hiddenPoints.push(1000);
    }
    
    if(difficulty == "mean"){
        classes.push("four");
        blockText.push(".v");
        classes.push("five");
        blockText.push("v");
        hiddenPoints.push(1000);
        hiddenPoints.push(3000);
        scorePerBlock *= meanDifficultyMult;
    }
    
    StartGame();
}

function reportWindowSize(){
    var value = window.innerWidth / ((w* size + (padding * 2)));
    value *= .85;
    playArea.style.transform = "scale(" + value + ")";
    playAreaContainer.style.left = (window.innerWidth - ((w* size + (padding * 2)))) / 2 + "px";
    playAreaContainer.style.top = (window.innerWidth - ((h* size + (padding * 2)))) / 4 + "px";
}

function GetHighscores(){
    $.get(SERVERURI,function(data){
        if(null != data){
            highscoreData = data;
            SetHighscores(highscoreData);
        }
    });
}

function SetHighscores(highscoresData){
    if(null == highscoresData){
        return;
    }
    highscoresData.sort((a,b) => (a.score < b.score) ? 1 : -1);

    while(highscores.firstChild){
        highscores.removeChild(highscores.firstChild);
    }

    highscoresData.forEach(function(score, i){
        if(i<topHighscoreScount){
            var scoreNode = document.createElement("li");
            scoreNode.textContent = score.score + " ------------- " + score.user + " - " + score.difficulty;
            if(score.difficulty == "easy"){
                scoreNode.style.color = "rgb(0,0,180)";
            }
            if(score.difficulty == "hard"){
                scoreNode.style.color = "rgb(0,180,0)";
            }
            if(score.difficulty == "mean"){
                scoreNode.style.color = "rgb(180,0,0)";

            }
            if(Date.now() - new Date(highscoresData[i].date) < 10000){
                scoreNode.classList.add("new");
            }
            highscores.appendChild(scoreNode);
        }
    });
}


$(document).ready(function(){
    playArea = document.getElementById("play-area");
    playAreaContainer = document.getElementById("play-container");
    scoreDisplay = document.getElementById("score-display");
    highscores= document.getElementById("highscores-data");
    currentScore = document.getElementById("current-score");


    document.getElementById("sign-in-parent").style.height = window.innerHeight + "px";

    playArea.style.width = w * size + "px";
    playArea.style.height = h * size + "px";

    window.onresize = reportWindowSize;
    reportWindowSize();
    
    currentScore.textContent = 0;

    GetHighscores();

    document.getElementById("username").value = localStorage.getItem("username");

});

function StartGame(){
    score = 0;
    currentScore.textContent = score;
    while(playArea.firstChild){
        playArea.removeChild(playArea.firstChild);
    }
    for(var x = 0; x < w; x++){
        for(var y = 0; y < h; y++){
            var block = document.createElement("div");
            block.classList.add("square");
            block.classList.add("transition");

            block.classList.add(classes[Math.floor(Math.random() * classes.length)]);

            block.style.left = x * size + padding + "px";
            block.style.top = y * size + padding + "px";

            playArea.appendChild(block);

            for(var i = 0; i < classes.length; i++){
                if(block.classList.contains(classes[i])){
                    block.textContent = blockText[i];
                }
            }

            block.onmouseover = "hoverblock(this)";

            blocks[x][y] = block;
        }
    }

    var square = document.getElementsByClassName("square");

    for(var i = 0; i < square.length; i++){
        square[i].addEventListener('mouseover',hoverblock);
    }

    playArea.addEventListener('click',clearblocks);

    activeHiddenpoints = [];
    hiddenPoints.forEach(function(hiddenPoint){
        var hp = document.createElement("div");
        hp.textContent = hiddenPoint;
        hp.classList.add("hidden-point");
        hp.classList.add("transition");
        var intersects = true;
        while(intersects){
            var left = Math.max(.15,Math.min(Math.random(),.85)) * w * size + padding;
            var top = Math.max(.15,Math.min(Math.random(),.85)) * h * size + padding;
            
            var r1 = {
                left: left,
                right:left+size * 2,
                top: top,
                bottom: top + size * 3
            };

            var anyIntersect = false;
            activeHiddenpoints.forEach(function(otherPoint){
                
                var r2 = {
                    left: parseInt(otherPoint.style.left),
                    right: parseInt(otherPoint.style.left) + size * 2,
                    top: parseInt(otherPoint.style.top),
                    bottom: parseInt(otherPoint.style.top) + size* 3
                };
                if(intersectRect(r1,r2)){
                    anyIntersect = true;
                }
            });

            if(!anyIntersect){
                intersects = false;
            }

            hp.style.left =  left + "px";
            hp.style.top =  top + "px";
        }
        playArea.appendChild(hp);
        activeHiddenpoints.push(hp);
    });
}

var activeHiddenpoints = [];

function checkMoreMoves(){
    resetChecked();
    var moves = 0;
    for(var x = 0; x < w; x++){
        for(var y = 0; y < h; y++){
            var number;
            classes.forEach(function(c){
                if(blocks[x][y].classList.contains(c)){
                    number = c;
                }
            });
            if(!blocks[x][y].classList.contains("cleared")){
                moves += checkAdjacentMoves(x,y,number);
            }
        }
    }
    resetChecked();
    return (moves > 0);
}

function checkAdjacentMoves(x,y,number){
    var moves = 0;
    moves += checkBlockMoves(x,y+1,number);
    moves += checkBlockMoves(x,y-1,number);
    moves += checkBlockMoves(x+1,y,number);
    moves += checkBlockMoves(x-1,y,number);
    return moves;
}

function checkBlockMoves(x,y,number){
    var moves = 0;
    if(x < 0
        || y < 0
        || x >= w
        || y >= h){
            return 0;
        }
    var block = blocks[x][y];
    if(undefined == block
        || block.classList.contains("cleared")){
            return 0;
        }

    var n;

    classes.forEach(function (c){
        if(block.classList.contains(c)){
            n = c;
        }
    });

    if(n == number
        && !block.classList.contains("checked")){
            block.classList.add("checked");
            ++moves;
            moves += checkAdjacentMoves(x,y,n);
    }

    return moves;
}

function clearblocks(){
    
    for(var x = 0; x < w; x++){
        for(var y = 0; y < h; y++){
            if(blocks[x][y].classList.contains("hover")
            && !blocks[x][y].classList.contains("cleared")){
                blocks[x][y].classList.add("cleared");
                AddScore(Math.ceil(scorePerBlock * increasePerChain * (hoverCount - 1)));
                incrementAdjacent(x,y);
            }
        }
    }
    resetChanged();
    CheckHiddenPoints();
    if(!checkMoreMoves()){
        EndGame();
    }
}

function CheckHiddenPoints(){
    activeHiddenpoints.forEach(function (hiddenPoint){
        var intersected = false;
        var r1 = {
            left: parseInt(hiddenPoint.style.left),
            right: parseInt(hiddenPoint.style.left) + parseInt(hiddenPoint.offsetWidth),
            top: parseInt(hiddenPoint.style.top),
            bottom: parseInt(hiddenPoint.style.top) + parseInt(hiddenPoint.offsetHeight)
        };
        for(var x = 0; x < w; x++){
            for(var y = 0; y < h; y++){
                var block = blocks [x][y];
                if(!block.classList.contains("cleared")){
                    var r2 = {
                        left: parseInt(block.style.left),
                        right: parseInt(block.style.left) + size,
                        top: parseInt(block.style.top),
                        bottom: parseInt(block.style.top) + size
                    };
                    if(intersectRect(r1,r2)){
                        intersected = true;
                    }
                }
            }
        }
        if(!intersected
            &&!hiddenPoint.classList.contains("uncovered")){
                hiddenPoint.classList.add("uncovered");
                AddScore(parseInt(hiddenPoint.textContent));
            }
    });
}
var score = 0;
function AddScore(value){
    score += value;
    currentScore.textContent = score;
    scoreDisplay.style.left = (mouseX - 20) - window.scrollX + "px";
    scoreDisplay.style.top = (mouseY- 20) - window.scrollY+ "px";
    if(scoreDisplay.classList.contains("visible")){
        scoreDisplay.textContent = parseInt(scoreDisplay.textContent) + value;
    }
    else{
        scoreDisplay.textContent = value;
    }
    scoreDisplay.classList.add("visible");
    setTimeout(function(){
        scoreDisplay.classList.remove("visible");
    }, "1000");
}

function intersectRect(r1,r2){
    return !(r2.left > r1.right ||
        r2.right < r1.left ||
        r2.top > r1.bottom ||
        r2.bottom < r1.top);
}

function EndGame(){
    var body = {
        "score": score,
        "date":new Date().toISOString(),
        "user":username,
        "difficulty":difficulty
    };
    $.ajax({
        type:"POST",
        url:SERVERURI,
        data: JSON.stringify(body),
        crossDomain: true,
        success: function(highscoresData){
            SetHighscores(highscoresData);
            alert("No More Moves! Score: " + currentScore.textContent);
            StartGame();
        },
        error: function(data){
            console.log(JSON.stringify(data));
        },
        dataType:"json",
        contentType:"application/json; charset=utf-8"
    });
}

function resetHover(){
    hoverCount = 0;
    for(var x = 0; x < w; x++){
        for(var y = 0; y < h; y++){
            blocks[x][y].classList.remove("hover");
        }
    }
}

function resetChecked(){
    hoverCount = 0;
    
    for(var x = 0; x < w; x++){
        for(var y = 0; y < h; y++){
            blocks[x][y].classList.remove("checked");
        }
    }
}
function resetChanged(){    
    for(var x = 0; x < w; x++){
        for(var y = 0; y < h; y++){
            blocks[x][y].classList.remove("changed");
        }
    }
}

function incrementAdjacent(x,y){
    incrementBlock(x+1,y);
    incrementBlock(x-1,y);
    incrementBlock(x,y+1);
    incrementBlock(x,y-1);
}

function incrementBlock(x,y){
    if(x < 0
        || y < 0
        || x >= w
        || y >= h){
            return;
        }
    var block = blocks[x][y];
    if(undefined == block
        || block.classList.contains("changed")
        || block.classList.contains("cleared")){
            return;
        }

    var n;

    for(var i = 0; i < classes.length; i++){
        if(block.classList.contains(classes[i])
        && !block.classList.contains("changed")){
            block.classList.remove(classes[i]);
            if(i + 1 >= classes.length){
                block.classList.add(classes[0]);
            }
            else{
                block.classList.add(classes[i+1]);
            }
            for(var i = 0; i < classes.length; i++){
                if(block.classList.contains(classes[i])){
                    block.textContent = blockText[i];
                }
            }
            block.classList.add("changed");
        }
    }
}

var hoverCount = 0;

function hoverblock(e){
    resetHover();
    var block = e.target;
    if(block.classList.contains("cleared")){
        return;
    }

    var coordX = 0;
    var coordY = 0;
    
    for(var x = 0; x < w; x++){
        for(var y = 0; y < h; y++){
            if(blocks[x][y] == block){
                coordX = x;
                coordY = y;
            }
        }
    }

    var number;
    classes.forEach(function(c){
        if(block.classList.contains(c)){
            number = c;
        }
    });

    block.classList.add("hover");
    ++hoverCount;
    checkAdjacent(coordX, coordY, number);
    if(hoverCount == 1){
        resetHover();
    }
}


function checkAdjacent(x,y, number){
    checkBlock(x+1,y, number);
    checkBlock(x-1,y, number);
    checkBlock(x,y+1, number);
    checkBlock(x,y-1, number);
}


function checkBlock(x,y,number){
    if(x < 0
        || y < 0
        || x >= w
        || y >= h){
            return;
        }
    var block = blocks[x][y];
    if(undefined == block
        || block.classList.contains("cleared")){
            return;
        }

    var n;

    classes.forEach(function(c){
        if(block.classList.contains(c)){
            n = c;
        }
    });

    if(n == number
        && !block.classList.contains("hover")){
            block.classList.add("hover");
            ++hoverCount;
            checkAdjacent(x,y,n);
        }
}
