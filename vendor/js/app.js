$(document).foundation();


//*** GENERAL VARIABLES/ARRAYS/OBJECTS ***/

//Array to convert between days of the week and numbers
var daysNumbers = ['M','T','W','H','F','S'];

//Class colors
var classColors = ['#bfd7ff','#bdd3b8', '#fffdc1' , '#ffe6b2', '#ffafaf', '#d0c4ff', '#dbdbdb', '#a8ffcc'];

//Activity Period object
var activityPeriod = {
    classID: 0,
    className: 'Activity Period',
    color: '#f48342',
    allottedTimes: [[
        'T',
        1245,
        1415
    ], [
        'H',
        1245,
        1415
    ]]
};

//Array with all class data
var classes = [];

//Array with current selection of classes
var currentSelection = [];


//*** STARTUP ***/

//Open modal when document ready
$(document).ready(function(){
    //Show introduction modal
    $('.warningReveal').foundation('open');
});

//Get JSON
$.getJSON( "data/classes.json", function( data ) {

    //Push class data to array
    for (var i = 0; i < data.length; i++) {
        classes.push(data[i]);
    }

    //Add activity period to current selection
    currentSelection.push(activityPeriod);

    //Give activity period an ID
    activityPeriod.classID=classes.length;

    //Add activity period to the list of classes
    classes.push(activityPeriod);

    //Add activity period to the visual schedule
    addClass(classes.length-1, activityPeriod.color);

});

//Setup Search Type
var searchSelection = $('#searchType').find(":selected").val();

//Autocomplete Setup on start
var options = {
    url: 'data/'+searchSelection+'.js',

    list: {
        match: {
            enabled: true
        },
        onKeyEnterEvent: function(){
            searchClasses();
        }
    },
    theme: "square"
};
$("#autocomplete").easyAutocomplete(options);


/***FUNCTIONS***/

//Gets rid of class options
function resetOptions(){
    $(".classOption").remove();
    var currentOptions = [];
}

//Creates options
function createOptions(collegeClass, selected){

    //Class options block html
    var classBlock ='';

    if (selected == true){
        //Add selected class
        classBlock = '<div class="classOption-selected" id="classOption-ID-'+collegeClass.classID+'">';
    }else{
        //Don't add selected class
        classBlock = '<div class="classOption" id="classOption-ID-'+collegeClass.classID+'">';
    }

    //General class option HTML
    classBlock += '<div class="expanded row"> <div class="large-8 classOption-left collapse small-6 columns">';
    classBlock += '<p class="classOption-time">'+ collegeClass.className+' / '+collegeClass.courseCode+' / '+collegeClass.sectionNumber+'</p>';
    classBlock += '<p class="classOption-time">'+collegeClass.teacherName+'</p>';
    classBlock += '<p class="classOption-time"><i class="fi-star"></i> '+collegeClass.teacherRating+'/5 | '+collegeClass.teacherNumberRatings+'</p>';
    classBlock += '</div><div class="large-4 classOption-right collapse small-6 columns">';

    //Add times to class option HTML
    collegeClass.allottedTimes.forEach(function(time){
        //Create string from int time and add :
        var startTime = String(time[1]);
        startTime = startTime.substr(0,startTime.length-2)+':'+startTime.substr(-2,2);
        //Create string from int time and add :
        var endTime = String(time[2]);
        endTime = endTime.substr(0,endTime.length-2)+':'+endTime.substr(-2,2);
        //Add to HTML
        classBlock += '<p class="classOption-time">'+time[0]+': '                                     +startTime+'-'+endTime+'</p>';
    });

    //Add to class options container
    $('.classOptions').append(classBlock);

    //Create border if selected
    if (selected==true){
        $('#classOption-ID-'+collegeClass.classID).css("border-left", "solid 6px "+collegeClass.color);
    }
}

//Find classes that match search query
function searchClasses(){

    //Delete current options
    resetOptions();

    //Get search query
    var searchQuery = $('#autocomplete').val();

    //Get search option
    var searchOption = $('#searchType').find(":selected").val();

    //Search for complementary classes
    if (searchQuery == 'COM'){
        classes.forEach(function(element){
            //Complementary class codes start with letters except for those 2
            if (element.courseCode.charAt(0).match(/[a-z]/i)|| element.courseCode=="504-LBQ-03" || element.courseCode =="520-LAA-03"){
                //Create options element for each matched class
                createOptions(element);
            }
        });
    //Search for other classes
    }else{
        classes.forEach(function(element){
            if (element[searchOption]==searchQuery){
                //Create options element for each matched class
                createOptions(element);
            }
        });
    }
}

//Find where each class block should go
function findScheduleBlock (element){

    //Get number associated to day (ex: M->1)
    var day = daysNumbers.indexOf(element[0]);

    //Get starting block number (815 will be the 1st block, 8:45 the second, etc.)
    var startTime =  element[1]-815;
    var startConstant = ((Math.floor(startTime/100))*2);
    var startNumber = startConstant + (startTime-startConstant*50)/30;

    //Get ending block number
    var endTime = element[2]-815;
    var endConstant = (Math.floor(endTime/100))*2;
    var endNumber = endConstant + ((endTime-endConstant*50)/30)-1;

    //Return array with day number + starting block number + ending block number
    var times = [day, startNumber,endNumber];
    return times;
}

//Add class to visual schedule
function addClass(classID, classColor){

    //Get class object
    var chosenClass = classes[classID];

    //For each alloted time, create block on visual schedule
    chosenClass.allottedTimes.forEach(function(element){

        //Get numbers array
        var scheduleBlock = findScheduleBlock(element);
        var day = scheduleBlock[0];
        var startNumber = scheduleBlock[1];
        var endNumber = scheduleBlock[2];

        //Increase rowspan and background color of first block
        $('.c'+day+'.r'+startNumber).attr('rowspan', endNumber-startNumber+1);
        $('.c'+day+'.r'+startNumber).css('background-color', classColor);
        //Insert class name
        $('.c'+day+'.r'+startNumber).html('<p class="scheduleText">'+chosenClass.className+'</p>');

        //Delete unnecessary cells
        for (i=startNumber+1; i<=endNumber; i++){
            $('.c'+day+'.r'+i).css('display', 'none');
        }

    });
}

//Removes class from schedule
function deleteClass(id){

    //Get class object
    var classDeleted = classes[id];

    //Get each schedule block
    classDeleted.allottedTimes.forEach(function(element){

        //Get schedule block
        var scheduleBlock = findScheduleBlock(element);
        var day = scheduleBlock[0];
        var startNumber = scheduleBlock[1];
        var endNumber = scheduleBlock[2];

        //Edit corresponding first cell
        $('.c'+day+'.r'+startNumber).attr('rowspan', 0);
        $('.c'+day+'.r'+startNumber).css('background-color', 'white');
        $('.c'+day+'.r'+startNumber).html('');

        //Add deleted cells
        for(i=startNumber+1; i<=endNumber; i++){
            $('.c'+day+'.r'+i).css('display', 'table-cell');
        }
    })
}

//Check for overlap between 2 classes
function classOverlap(classID1, classID2){

    //Get class objects from IDs
    var class1 = classes[classID1];
    var class2 = classes[classID2];

    //Whether there is overlap
    var overlap = false;

    //Check overlap for each
    class1.allottedTimes.forEach(function(dayTime1){
        class2.allottedTimes.forEach(function(dayTime2){
            if (dayTime1[0]==dayTime2[0] &&
                ((dayTime1[1]>=dayTime2[1] && dayTime1[1]<dayTime2[2])||
                (dayTime1[2]<=dayTime2[2])&& dayTime1[2]>dayTime2[1])){
                overlap = true;
            }
        })
    });

    //Return whether there is overlap and the two classes
    return [overlap, class1, class2];
}

//Check for overlap between class and current schedule
function scheduleOverlap (classID){

    //Whether there is overlap
    var overClasses = [false];

    //Check for overlap with each class of schedule
    currentSelection.forEach(function(class2){

        var classOverlapArray = classOverlap(class2.classID, classID);
        if(classOverlapArray[0]){
            //If overlap, set overlap variable to true
            overClasses[0]= true;
            //Add class objects to returned array to be able to notify which classes are causing the issue
            overClasses.push(classOverlapArray[1]);
            overClasses.push(classOverlapArray[2]);
        }

    });
    return overClasses;
}

//Generate save code and open modal
function saveClasses(classArray){

    //Save code string
    var saveCode = '';

    //Add class ID of each class in array
    classArray.forEach(function(element){
        //Check for activity period
        if (element.classID != classes.length-1){
            saveCode += element.classID+'-';
        }
    });

    //Remove last '-'
    saveCode = saveCode.substr(0,saveCode.length-1);

    //Remove current save code
    $('.saveReveal h4').remove();

    //Add new save code
    $('.saveReveal').append('<h4>Your Save Code is: '+saveCode);

    //Open modal
    $('.saveReveal').foundation('open');
}

//Load schedule from code
function loadSchedule (code){
    //Make sure code format is valid
    if (code.match(/[a-z]/i)){
        alert('Invalid Code Format');
    }
    //
    classColors = ['#bfd7ff','#bdd3b8', '#fffdc1' , '#ffe6b2', '#ffafaf', '#d0c4ff', '#dbdbdb', '#a8ffcc'];

    //Delete all classes except activity period
    currentSelection.forEach(function(element, index){
        if (element.classID != classes.length-1){
            deleteClass(element.classID);
        }
    });

    //Get ID of each class
    var loadClasses = code.split('-');

    //Delete all selected/not selected options
    $('.classOption-selected').remove();
    $('.classOption').remove();

    //Go through each class by id
    loadClasses.forEach(function(element){

        //Get class object from ID
        var loadClass = classes[parseInt(element)];

        //Set color for each class object
        loadClass.color = classColors[0];

        //Remove color
        classColors.splice(0,1);

        //Add class to visual schedule
        addClass(loadClass.classID, loadClass.color);

        //Add selected version of class to options
        createOptions(loadClass, true);

        //Remove duplicates
        currentSelection = currentSelection.filter(function(Class){
            return Class.classID != loadClass.classID;
        });


        //Add class to current selection
        currentSelection.push(loadClass);
    });

}


//*** EVENTS ***/

//Search classes on icon click
$(document).on('click','.search-magnifying-glass', function(){
    searchClasses();
});
//Shows results for query when return key is pressed
$("#autocomplete").keypress(function(event) {
    if (event.which == 13){
        searchClasses();
    }
});

//Change search type on select change
$('select').change(function(){
    var searchSelection = $('#searchType').find(":selected").val();
    var options = {
        url: 'data/'+searchSelection+'.js',

        list: {
            match: {
                enabled: true
            },
            onKeyEnterEvent: function(){
                searchClasses();
            }
        },
        theme: "square"
    };
    $("#autocomplete").easyAutocomplete(options);
});

//When selected class is clicked
$(document).on('click','.classOption-selected', function() {

    //Get ID of class
    var classOptionID = parseInt($(this).attr('id').match(/\d/g).join(""));

    //Remove selected class and put back normal class
    $(this).removeClass('classOption-selected');
    $(this).addClass('classOption');

    //Delete class from visual schedule
    deleteClass(classOptionID);

    //Add back color
    classColors.push(classes[classOptionID].color);

    //Remove from current selection
    currentSelection = currentSelection.filter(function(element){
        return element.classID != classOptionID;
    });

    //Change back border
    $(this).css({
        "border-color": 'lightgray',
        "border-width": "1px",
        "border-style": "solid"
    });
});
//Add class to schedule when clicked and remove it when clicked again
$(document).on('click','.classOption', function() {

    //Get class ID
    var classOptionID = parseInt($(this).attr('id').match(/\d/g).join(""));

    //Check for overlap
    var overlap = scheduleOverlap(classOptionID);

    if (!overlap[0]) {
        //Change border
        $(this).css("border-left", "solid 6px"+classColors[0]);
        addClass(classOptionID, classColors[0]);
        //Change object color
        classes[classOptionID].color = classColors[0];
        //Add to array of classes
        currentSelection.push(classes[classOptionID]);
        //Switch to next color
        classColors.shift();
        //Add selected CSS class
        $(this).addClass('classOption-selected');
        $(this).removeClass('classOption');
    }else{
        //Alert if conflict
        alert('Conflict between '+overlap[1].className+'-'+overlap[1].sectionNumber+' and '+overlap[2].className+'-'+overlap[2].sectionNumber);
    }
});

//Load schedule when enter key pressed
$('.loadSchedule-input').keypress(function(event){
    if (event.which ==13){
        loadSchedule($('.loadSchedule-input').val());
    }
});
//Open load schedule modal when button is clicked
$('.loadButton').on('click', function(event){
    event.preventDefault();
    $('.loadReveal').foundation('open');
});
//Load schedule when button clicked
$('.loadQuery-button').on('click', function(event){
    event.preventDefault();
    loadSchedule($('.loadSchedule-input').val());
});

//Call save class function on button click
$(document).on('click','.saveButton', function(event) {
    event.preventDefault();
    saveClasses(currentSelection);
});

//Edit and open export modal when button is clicked
$('.exportButton').on('click', function(event){
    event.preventDefault();

    //Remove existing HTML in container
    $('.exportClasses').html('');

    //Get classes other than AP
    var currentClasses = currentSelection.filter(function(Class){
        return Class.classID != classes.length-1;
    });

    //Create li for each class with course code and section number
    currentClasses.forEach(function(element){
        //HTML
        var exportClass = '';
        exportClass += '<li>';
        exportClass += element.courseCode+ ' -> ';
        exportClass += element.sectionNumber;
        exportClass += '</li>';
        //Append to container
        $('.exportClasses').append(exportClass);
    });

    //Open export modal
    $('.exportReveal').foundation('open');
});

//Show instructions
$('.instructionButton').on('click', function(event){
    event.preventDefault();
    $('.revealInstructions').foundation('open');
});
