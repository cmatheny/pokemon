/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * 
 */
var POKE = {
    mode: "Select",
    running: true,
    animations: []
};

$(document).ready(function() {
	// DOM is ready
	var poke=window.POKE;


        // Functions
        var wiggle = function(item,times) {
            var i;
            var timer = 0;
            console.log(times);
            var flip = function() {
                flipHoriz(item);
            };
            
            for (i=0; i<times*2; i++) {
                timer+=70;
                window.setTimeout(flip,timer);
            }
        };
        
        var jump = function(item, times) {
            var timer = 0;
            var i;
            
            var jumpSwitch = function() {
                item.toggleClass("jumping");
            };
            
            console.log(times);
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
        
        
        var someAnimation = function(item) {
            var delay;
            var times;

            // 0-3:jump, 4-7:wiggle, 8:wigglejump!
            type = Math.round(Math.random()*8);
            
            // 0-2 seconds to delay (2-4 total)
            delay = Math.random()*2000;
            
            if (type < 4 || type === 8){
                // do it 2-4 times
                times = Math.round(Math.random()*2+2);
                
                window.setTimeout((function() {
                    jump(item,times);
                }),delay);
            };
            
            if(type >=4) {
                // do it 2-4 times
                times = Math.round(Math.random()*2+2);
                
                window.setTimeout((function() {
                    wiggle(item,times);
                }),delay);
            };
            
        };
        
        poke.animations[0] = setInterval(function() {
            someAnimation($("#pikaSprite1"))
        },2000);
        
        poke.animations[1] = setInterval(function() {
            someAnimation($("#pikaSprite2"))
        },2000);
        
        //Event handlers
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
				window.POKE.poke1=data;
                                $("#pokemonSprite").attr("src","sprites/pokemon/"+window.POKE.poke1.id+".png");
                                $("#pokemonSprite").removeClass("hidden");
                                $("#startButton").removeClass("hidden");
				$("#pokemonName").html(data.name);
			}
		});
	});
        
        $("#startButton").click(function() {
            poke.mode = "play";
            $("#setupContainer").addClass("hidden");
            $("#battleContainer").removeClass("hidden");
        });

        $("#stopButton").click(function() {
            clearInterval(poke.animations[0]);
            clearInterval(poke.animations[1]);
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
            
            item = $(this);
            wiggle(item,2);
        });

});