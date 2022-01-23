//Get every elemet, that will be needed
let continueBTN = $("#continueGameBTN");
let newGameBTN = $("#newGameBTN");
let userInput = $("#userInputField");
let questText = $("#userQuestText");
let progressCountText = $("#progressText");
let fields = $(("[id^='field']"));
let saveBTN = $("#saveBTN");

//Get last progress from LocalStorage
let progressCount = Number(getLocalStorage());
//Highlight and rotate to position 
highlight(fields[progressCount-1]);
changeViewDeg();
//Print progress on page
progressCountText.html(progressCount)

//set eventlisteners for Buttons / continue game or start from start
continueBTN.click(() => weiter())
newGameBTN.click(() => neuesSpiel())

//hide not used element (Quest), only show when continue game is pressed
hideElements()


async function weiter() {
    //show hidden elements on click
    showElements();
    //wait for frage to return, is user answered right or wrong bool
    if(await frage()){
        //if not 9 progressconut goes up ++ , else reset to 1 and reset perspective
        if(progressCount < 9){
            progressCount++;
        }
        else{
            progressCount = 1;
            $(".gameField").css("perspective","50em");   
        }
        //save progress in LocalStorage
        setLocalStorage();
        //print on page
        progressCountText.html(progressCount)
        //hightlight new tile
        highlight(fields[progressCount-1]);
        //and change position acordingly
        changeViewDeg()
    }
    else{
        alert("NICHT WEITER")
    }
    //reset input
    userInput.val("");
    hideElements()

}

//Reset current progress and adjust gamefield acording to 
function neuesSpiel() {
    //toogle hightlights turn last one of and turn on first
    highlight(fields[progressCount-1],true);
    highlight(fields[0],true);
    progressCount = 1;
    //ajust position of floor acording to progressCount
    changeViewDeg();
    //set new Progress in LocalStorage
    setLocalStorage();
    progressCountText.html(progressCount)
    hideElements();
    //reset perspective to normal
    $(".gameField").css("perspective","50em");   
}

async function frage(){
    //array with scopes of ranges for numbers to be generated
    let maxValueArray = [[51,1],[101,51,51,1],[11,1,5,2]];
    let num1 = 0;
    let num2 = 0;

    //generate numbers random according to text for CB-Kompetenzen
    if(progressCount != 2){
        if(progressCount != 8 && progressCount != 9 ){  
            num1 = getRandomInt(maxValueArray[0][0],maxValueArray[0][1]);      
            num2 = getRandomInt(maxValueArray[0][0],maxValueArray[0][1]);    
        }
        else{
            num1 = getRandomInt(maxValueArray[2][0],maxValueArray[2][1]);   
            if(progressCount == 9){
                num2= getRandomInt(maxValueArray[2][2],maxValueArray[2][3]);
            }     
        }
    }
    else{
        num1 = getRandomInt(maxValueArray[1][0],maxValueArray[1][1]);
        num2 = getRandomInt(maxValueArray[1][2],maxValueArray[1][3]);      
    }

    //init question and realResult 
    let outputString;
    let realResult;
    
    //set questiontext and real result
    switch(progressCount){
        case 1: outputString = 
            `${num1} + ${num2} = ?`;
            realResult = num1+num2;
            break;
        case 2: 
            outputString = `${num1} - ${num2} = ?`;
            realResult = num1-num2;
            break;
        case 3:
            outputString = `${num1} * ${num2} = ?`;
            realResult = num1*num2;
            break;
        case 4:
            outputString = `${num2*num1} / ${num1} = ?`;
            realResult = num2;
            break;
        case 5: case 6: case 7:  
            let num3 = getRandomInt(maxValueArray[0][0],maxValueArray[0][1]);
            outputString = `${num1} + ${num2} + ${num3} = ?`;
            realResult = num1+num2+num3;
            break;
        case 8:
            outputString = `Wurzel aus ${Math.pow(num1, 2)} = ?`;
            realResult = num1;
            break;
        case 9:
            outputString = `Wie oft ${num1} mit sich selbst mulitplizieren, dass ${Math.pow(num1, num2)} rauskommt`;
            realResult = num2;
            break;
    } 
    $(questText).html(outputString)
    userInput.focus();
    //get user answer
    let answer = await getUserInput();
    //check if user was right or wrong and return bool
    return checkResults(answer, realResult);

}

//Set current progress in Local Storage
function setLocalStorage() {
    localStorage.setItem("level", progressCount);
}

//Set last progress value from LocalStorage
function getLocalStorage() {
    let position = localStorage.getItem("level");
    if(position == null){
       position = 1; 
    }
    return position;
}

//Generate ramdom int for questions
function getRandomInt(max, min) {
    return Math.floor(Math.random() * (max-min))+ min;
}


//compare userresult and realresult and return bool
function checkResults(userAnswer,realResult){
    if(userAnswer === realResult){
        return true;
    }
    else{
        return false;     
    }
}

//waits for user to click show question and return value
async function getUserInput() {
    let isInputRight = new Promise((resolve) =>{
        $("#saveBTN").click(function() {
            resolve(Number(userInput.val()));
        });
        });
    let result;
    await isInputRight.then((resolve) => result = resolve);
    return result;
}

//hide unneeded elements
function hideElements(){
    $(questText).hide();
    $(userInput).hide();
    $(saveBTN).hide();
}

//show hidden elements when needed
function showElements(){
    $(questText).show();
    $(userInput).show();
    $(saveBTN).show();
}

//highlight current level tile
function highlight(toBeHighlighted, onlyToggle = false){
    if (!onlyToggle){
        if(progressCount==1){
            if($(fields[8]).hasClass("highlighted")){
                $(fields[8]).removeClass('highlighted');
            }
        }
        else{
            $(toBeHighlighted).prev().removeClass('highlighted');
        }
    }    
    toBeHighlighted.classList.toggle("highlighted");
}

//calculate deg for floor and numbers and sets css style acordingly
function changeViewDeg(){
    //array with multiplikators of 45deg / -45deg (from 1 to 9)
    let degMultiplikatorsFloor = [3,4,5,2,6,1,0,-1,-2]
    let degFloor = (-45)*degMultiplikatorsFloor[progressCount-1];
    let degNumbers = (45)*degMultiplikatorsFloor[progressCount-1];

    $(".floor p").css("transform",`rotateZ(${degNumbers}deg)`); 
    if(progressCount != 9){
        $(".floor").css("transform",`translateY(-20vh) rotateX(50deg) rotateZ(${degFloor}deg)`);
    } 
    else{
        $(".floor").css("transform",`translateY(-20vh) rotateX(30deg) rotateZ(${degFloor}deg)`);  
        $(".gameField").css("perspective","50em");      
    }
}