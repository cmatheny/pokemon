/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * 
 */
var POKE = {
    pokeApiUrl:"https://pokeapi.co/api/v2/",
    browseContext: [],
    mode: "Select",
    running: true,
    animations: [],
    party1: [],
    party2: [],
    browsePage: 0,
    loadPage: 0,
    noServer: false,
    maxPage: 0, //37
    numBrowseButtons: 7 // Should be odd and probably 7 or less
};

$(document).ready(function() {
	// DOM is ready
	var poke=window.POKE;


        // Functions
        var wiggle = function(item,times) {
            var i;
            var timer = 0;
            var flip = function() {
                flipHoriz(item);
            };
            
            for (i=0; i<times*2; i++) {
                timer+=100;
                window.setTimeout(flip,timer);
            }
        };
        
        var attack = function(item, times) {
            var timer = 0;
            var i;
            
            var attackSwitch = function() {
                item.toggleClass("attacking");
            };

            for (i=0; i<times*2; i++) {
                timer+=90;
                window.setTimeout(attackSwitch,timer);
            }
        };
        
        var jump = function(item, times, doAttack) {
            var timer = 0;
            var i;
            
            var jumpSwitch = function() {
                item.toggleClass("jumping");
            };
            
             if (doAttack) {
                 attack(item, times);
             }
             
            for (i=0; i<times*2; i++) {
                timer+=120;
                window.setTimeout(jumpSwitch,timer);
            }
        };
        
        var toggleDouble = function(item) {
            if (item.hasClass("flipped")) {
                item.toggleClass("doubleflipped");
            } else 
            item.toggleClass("double");
        };
        
        
        var flipHoriz = function(item) {
            item.toggleClass("flipped");
        };
        
        
        var comboAttack = function(item) {
            wiggle(item,2);
            window.setTimeout(function(){jump(item,1);},400);
            window.setTimeout(function(){attack(item,2);},650);
        };
        
        
        var someAnimation = function(item) {
            var delay;
            var times;

            // 0-3:jump, 4-7:wiggle, 8:wigglejump, 9:combo!
            type = Math.round(Math.random()*9);
            if (type===0) return;
            // 0-2 seconds to delay (3-5 total)
            delay = Math.random()*2000;

            if (type<4 || type===8){
                // do it 2-4 times
                times = Math.round(Math.random()*2+2);
                
                window.setTimeout((function() {
                    jump(item,times);
                }),delay);
            };
            
            if (type>=4 && type<9) {
                // do it 2-4 times
                times = Math.round(Math.random()*2+2);
                
                window.setTimeout((function() {
                    wiggle(item,times);
                }),delay);
            }; 
            if (type === 9) {
                comboAttack(item);
            };
            
        };
        
        var startAnimation = function(item,interval) {
            someAnimation(item);
            poke.animations.push(setInterval(function(){someAnimation(item);},interval));
        }
        
        var pokeRequest = function(page) {

            if (page !== undefined) {
                poke.loadPage=page;
                }
            
            if (poke.browseContext[poke.loadPage]) {
                console.log("Already loaded.");
                return;
            }
            
            console.log("loading page");        
            $.ajax({
                method: "GET",
                url: poke.pokeApiUrl+"pokemon/?limit=20&offset="+poke.loadPage*20,
                success: function(data) {
                    if (poke.loadPage===0) {
                        $("#browseButton").addClass("active");
                        $("#browseButton").html("Browse Pokemon");
                    }
                    poke.browseContext[poke.loadPage]=data;
                    console.log(poke.browseContext);
                    poke.loadPage++;
                    console.log(data);
                    if (poke.loadPage < poke.maxPage+1) {
                        window.setTimeout(pokeRequest,200);
                    }
                },
                failure: function() {
                    window.setTimeout(pokeRequest,2000);
                }
            });
        };
        
        // Toggle button between green and gray (must be one of those to begin with)
        var buttonDisable = function(buttonObject) {
            buttonObject.addClass("btn-secondary");
            buttonObject.removeClass("btn-success")
        };
        
        var buttonEnable = function(buttonObject) {
            buttonObject.removeClass("btn-secondary");
            buttonObject.addClass("btn-success")
        };
        
        var waitForPage = function() {
            if (!poke.browseContext[poke.browsePage]) {
                $("#loadingSign").removeClass("hidden");
                pokeRequest(poke.browsePage);
                window.setTimeout(waitForPage,1000);
            } else {
                $("#loadingSign").addClass("hidden");
                fillBrowseContainer(poke.browsePage);
            }
        };
        
        var setBrowseButtons = function() {
            var currPage = poke.browsePage;
            var lowPage = Math.max(0,poke.browsePage-3);
            var highPage = Math.min(poke.maxPage+1,poke.browsePage+3);
            if (highPage === poke.maxPage+1) {
                lowPage = poke.maxPage - 6;
            }
            var pageIndex = lowPage;
            var index;
            var buttonObject;
            for (index=0; index<poke.numBrowseButtons; index++) {
                buttonObject=$(poke.buttonArray[index]);
                if (pageIndex === currPage) {
                    buttonObject.addClass("btn-primary");
                    buttonObject.removeClass("btn-success");
                } else {
                    buttonObject.addClass("btn-success");
                    buttonObject.removeClass("btn-primary");
                }

                $(poke.buttonArray[index]).html(pageIndex+1);
                pageIndex++;
            }
        };
        
        var fillBrowseContainer = function(pageNum) {
            var row;
            var col;
            var thisImage;
            var thisText;
            var index;
            var pokeName;
            var pokeId;
            var pokeUrlArray;
            poke.browsePage=pageNum;
            console.log("page: "+(poke.browsePage+1));            
            console.log(poke.browseContext);
            
            for (row=0;row<4;row++) {
                for (col=0;col<5;col++) {
                    index=col+5*row;
                    pokeUrlArray=poke.browseContext[poke.browsePage].results[index].url.split("/");
                    pokeId=pokeUrlArray[6];
                    pokeName=poke.browseContext[poke.browsePage].results[index].name;
                    thisImage=$("div.browse img")[index];
                    thisText=$("div.browse .browseText")[index];
                    $(thisImage).attr("src","sprites/pokemon/"+pokeId+".png");
                    $(thisText).html(pokeName);
                    console.log($(thisImage));
                    startAnimation($(thisImage),5000);
                    // poke.animations.push(setInterval(function(){someAnimation($(thisImage));},10));
                }
            }
            
            setBrowseButtons();
            if (poke.browsePage === 0) {
                buttonDisable($("#browsePrev"));
                buttonDisable($("#browseLeft10"));
                buttonDisable($("#browseFirst"));
            } else {
                buttonEnable($("#browsePrev"));
                buttonEnable($("#browseLeft10"));
                buttonEnable($("#browseFirst"));
            }
            if (poke.browsePage === poke.maxPage) {
                buttonDisable($("#browseNext"));
                buttonDisable($("#browseRight10"));
                buttonDisable($("#browseLast"));
            } else {
                buttonEnable($("#browseNext"));
                buttonEnable($("#browseRight10"));
                buttonEnable($("#browseLast"));
            }
            
            console.log($("#browseContainer"));
            
        };
        
        

        
        // On page load
        // generate browsing table tags
        (function() {
            var row;
            var col;
            var thisRow;
            var cell;
            var buttonRow;
            var nextButton;
            
            // Generate pokemon browsing table
            $("#browseContainer").append("<div class=\"row tinyBrowseRow\"></div>");
            for (row=0;row<4;row++) {
                $("#browseContainer").append("<div class=\"row browseRow\"></div>");
                thisRow=$($("#browseContainer").children(".browseRow")[row]);
                thisRow.append("<div class=\"col-xs-1\"></div>");
                    for (col=0;col<5;col++) {
                        thisRow.append("<div class=\"col-xs-2 browse text-center\"></div>");
                        cell = $("div.browse").last();
                        $(cell).append("<div class=\"row btn browseImg\"><img class=\"sprite\" src=\"\"></div><div class=\"row browseText\"></div>");
                    }
                thisRow.append("<div class=\"col-xs-1\"></div>");
            }
            $("#browseContainer").append("<div class=\"row browseRow buttonRow\"></div>");
            
            // Generate browse buttons
            buttonRow=$("#browseContainer .buttonRow")[0];
            $(buttonRow).append("<div class=\"col-xs-12 text-center\">"+
                    "<button id=\"browseFirst\" class=\"btn btn-secondary browseBtnMd\"><<</button>"+
                    "<button id=\"browseLeft10\" class=\"btn btn-secondary browseBtnMd\">< 10</button>"+
                    "<button id=\"browsePrev\" class=\"btn btn-secondary browseBtn\">< Prev</button>"+
                    "<button id=\"browseNext\" class=\"btn btn-success browseBtn\">Next ></button>"+
                    "<button id=\"browseRight10\" class=\"btn btn-success browseBtnMd\">10 ></button>"+
                    "<button id=\"browseLast\" class=\"btn btn-success browseBtnMd\">>></button>"+
                    "</div>");
            
            nextButton=$("#browseNext");
            // inserts button before Next > button, to preserve ordering
            for (col=0;col<poke.numBrowseButtons;col++){
                nextButton.before("<button class=\"btn btn-success browseBtnNum browseBtnSm\">"+(col+2)+"</button>");
            }
            poke.buttonArray = $("#browseContainer .browseBtnNum");
        })();
        
        // Pika dance
        var pika1=$("#pikaSprite1");
        var pika2=$("#pikaSprite2");
        comboAttack(pika1);
        comboAttack(pika2);
        poke.animations.push(setInterval(function() {
            someAnimation(pika1);
        },3000));
        
        poke.animations.push(setInterval(function() {
            someAnimation(pika2);
        },3000));
        
        if (!poke.noServer) {
            pokeRequest();
        };
        

        
//        $("#loadNextButton").click(function(){
//            
//            var input;
//            console.log("loading2");
//        });
        
        //Event handlers
        $("#browseButton").click(function() {

            
            if (!$("#browseButton").hasClass("active")) {
                return;
            } else fillBrowseContainer(0);
            
            $("#setupContainer").addClass("hidden");
            $("#stopButton").addClass("hidden");
            $("#browseContainer").removeClass("hidden");
        });
        
        $("#browseContainer img").click(function() {
            console.log(this);
            var id;
            var statWindow= $("#statWindow");
            var url = $(this).attr("src")
            id = url.split("/")[2].split(".")[0];
            // loadStats(id);
            
            statWindow.removeClass("hidden");
            $("#statWindowSprite").attr("src",url);
            comboAttack($("#statWindowSprite"));
            
        });
        
	$("#submitButton").click(function() {
		
                $(this).html("Loading...");
		var input = $("#userInput").val();
		$.ajax({
			method:"GET",
			url:"https://pokeapi.co/api/v2/pokemon/" + input + "/",
			success: function(data){
				var button=$("#submitButton");
				button.removeClass("btn-success");
				button.addClass("btn-danger");
				button.html("Done");
                                console.log(data);
				window.POKE.tempPoke=data;
                                $("#pokemonSprite").attr("src","sprites/pokemon/"+window.POKE.tempPoke.id+".png");
                                $("#pokemonSprite").removeClass("hidden");
                                $("#addButton").removeClass("hidden");
                                $("#pokemonName").removeClass("hidden");
                                $("#pokemonName").html(data.name);
                                $("#pokemonRename").removeClass("hidden")
				$("#pokemonRename").attr("value","Enter Name");
                                comboAttack($("#pokemonSprite"));
                                
			}
		});
	});
        
        $("#browseContainer .buttonRow").click(function() {
            var target=event.target;
            var buttonVal = $(target).html();

            console.log(buttonVal);            
            
            if (buttonVal === "&lt;&lt;") {
                poke.browsePage=0;
                waitForPage();
            } else if (buttonVal === "&lt; 10") {
                poke.browsePage=Math.max(0,poke.browsePage-10);
                waitForPage();
            } else if (buttonVal === "&lt; Prev") {
                if (poke.browsePage > 0) {
                    poke.browsePage--;
                    waitForPage();
                }
            } else if (buttonVal === "Next &gt;") {
                if (poke.browsePage < poke.maxPage) {
                    poke.browsePage++;
                    waitForPage();
                }
            } else if (buttonVal === "10 &gt;") {
                poke.browsePage=Math.min(poke.maxPage,poke.browsePage+10);
                waitForPage();
            } else if (buttonVal === "&gt;&gt;") {
                poke.browsePage=poke.maxPage;
                console.log(poke.maxPage);
                waitForPage();
            } else if ($.isNumeric(buttonVal)) {
                poke.browsePage=buttonVal-1;
                waitForPage();
            }
        });

        $("#addButton").click(function() {
            var index = poke.party1.length;
            var temp = poke.tempPoke;
            var fields = $("#leftSidebar"+index).find("div.text-right");
            console.log(fields);
            var maxHP = temp.stats[5].base_stat;

            $(fields[0]).html($("#pokemonRename").val());
            $(fields[1]).html(temp.name);
            $(fields[2]).html(maxHP + "/" + maxHP);
            poke.party1.push(temp);
            if (index === 3) {
                $("#addButton").addClass("hidden");
                $("#startButton").removeClass("hidden");
            }
        });
        
        $("#startButton").click(function() {
            var i;
            var partySprites;
            poke.mode = "play";
            $("#setupContainer").addClass("hidden");
            $("#stopButton").addClass("hidden");
            $("#battleContainer").removeClass("hidden");
            
            // load in party images
            partySprites = $(".partySprites.friendly");
            for (i=0; i<poke.party1.length; i++) {
                $(partySprites[i]).attr("src","sprites/pokemon/"+poke.party1[i].id+".png");
            }
            
            // load in enemy party/images
            
            // display combat log and buttons
        });


        $("#stopButton").click(function() {
            while (poke.animations.length) {
                clearInterval(poke.animations.pop());
                clearInterval(poke.animations.pop());
        }
            $(this).addClass("hidden");
        });
        
        
        $(".selectable").click(function() {
            var clicked=$(this);
            if (poke.selected) {
                toggleDouble(poke.selected);
            };
            toggleDouble(clicked);
            poke.selected=clicked;
        });
        

        $("#pokemonSprite").mouseover(function() {
            thisElement=$(this);
            if (!$(this).hasClass("block")) {
                thisElement.addClass("block");
                item = $(this);
                comboAttack(item);
                // block for 2 sec
                window.setTimeout(function() {thisElement.removeClass("block");},2000);
            }
        });

});