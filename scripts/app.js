/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * 
 */
var POKE = {
    browseIndex:0,
    pokeApiUrl:"https://pokeapi.co/api/v2/",
    browseContext: null,
    mode: "Select",
    running: true,
    animations: [],
    party1: [],
    party2: []
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
                timer+=120;
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
            window.setTimeout(function(){jump(item,2);},400);
            window.setTimeout(function(){attack(item,1);},850);
        };
        
        
        var someAnimation = function(item) {
            var delay;
            var times;

            // 0-3:jump, 4-7:wiggle, 8:wigglejump, 9:combo!
            type = Math.round(Math.random()*9);
            
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

        var pokeRequest = function(index) {
            console.log("loading page");
            if (index !== undefined) {
                poke.browseIndex=index;
                }
                
            $.ajax({
                method: "GET",
                url: poke.pokeApiUrl+"pokemon/?limit=20&offset="+poke.browseIndex,
                success: function(data) {
                    if (poke.browseIndex===0) {
                        $("#browseButton").addClass("active");
                        $("#browseButton").html("Browse Pokemon");
                    }
                    poke.browseIndex+=20;
                    poke.browseContext=data;
                    console.log(data);
                }
            });
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
            
            for (row=0;row<4;row++) {
                $("#browseContainer").append("<div class=\"row browseRow\"></div>");
                thisRow=$($("#browseContainer").children(".row")[row]);
                thisRow.append("<div class=\"col-xs-1\">Border</div>");
                    for (col=0;col<5;col++) {
                        thisRow.append("<div class=\"col-xs-2 browse text-center\"></div>");
                        cell = $("div.browse").last();
                        $(cell).append("<div class=\"row browseImg\"><img src=\"\"></div><div class=\"row browseText\">empty</div>");
                    }
                thisRow.append("<div class=\"col-xs-1\">Border</div>");
            }
            $("#browseContainer").append("<div class=\"row browseRow buttonRow\"></div>");
            
            buttonRow=$("#browseContainer .buttonRow")[0];
            console.log(buttonRow)
            $(buttonRow).append("<div class=\"col-xs-1\"></div>");
            $(buttonRow).append("<div class=\"col-xs-10 text-center\">"+
                    "<button id=\"browsePrev\" class=\"btn btn-success browseBtn\">< Previous</button>"+
                    "<button id=\"browseNext\" class=\"btn btn-success browseBtn\">Next ></button>"+
            "</div>");
            
            nextButton=$("#browseNext");
            for (col=0;col<8;col++){
                nextButton.before("<button class=\"btn btn-success browseBtnSm\">"+(col+1)+"</button>");
            }
        })();
        
        console.log($("#browseContainer"));
        // Pika dance
        var pika1=$("#pikaSprite1");
        var pika2=$("#pikaSprite2");
        comboAttack(pika1);
        comboAttack(pika2);
        poke.animations[0] = setInterval(function() {
            someAnimation(pika1);
        },3000);
        
        poke.animations[1] = setInterval(function() {
            someAnimation(pika2);
        },3000);
        
        
        pokeRequest();
        

        
//        $("#loadNextButton").click(function(){
//            
//            var input;
//            console.log("loading2");
//        });
        
        //Event handlers
        $("#browseButton").click(function() {
            var row;
            var col;
            var thisImage;
            var thisText;
            var index;
            var pokeName;
            var pokeId;
            var pokeUrlArray;
            
            if (!$("#browseButton").hasClass("active")) {
                return;
            }
//            console.log($("#browseContainer"));

            for (row=0;row<4;row++) {
                for (col=0;col<5;col++) {
                    index=col+5*row;
                    pokeUrlArray=poke.browseContext.results[index].url.split("/");
                    pokeName=pokeUrlArray[7];
                    pokeId=pokeUrlArray[6];
                    pokeName=poke.browseContext.results[index].name;
                    thisImage=$("div.browse img")[index];
                    thisText=$("div.browse .browseText")[index];
                    $(thisImage).attr("src","sprites/pokemon/"+pokeId+".png");
                    $(thisText).html(pokeName);
                }
            }
            console.log($("#browseContainer"));
            $("#setupContainer").addClass("hidden");
            $("#stopButton").addClass("hidden");
            $("#browseContainer").removeClass("hidden");
            pokeRequest();
            
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
            var buttonArray = $(this).find(".btn");
            console.log(target);
            if (target === buttonArray[0]) {
                console.log("prev");
            } else if (target === buttonArray[buttonArray.length-1]) {
                console.log("next");
            }
            if ($(target).hasClass("btn")) {
                
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
            clearInterval(poke.animations[0]);
            clearInterval(poke.animations[1]);
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