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
    running: true
};

$(document).ready(function() {
	// DOM is ready
	var poke=window.POKE;


        // Functions
        var wiggle = function(item) {
            
            var flip = function() {
                flipHoriz(item);
            };
            
            window.setTimeout(flip,100);
            window.setTimeout(flip,200);
            window.setTimeout(flip,300);
            window.setTimeout(flip,400);  
        };
        
        var jump = function(item, times) {
            var timer = 0;
            var jumpSwitch = function() {
                item.toggleClass("jumping");
            };
            for (i=0; i<times*2; i++) {
                timer+=100;
                window.setTimeout(jumpSwitch,timer);
            }
        };
        
        var toggleDouble = function(item) {
            console.log(item);
            if (item.hasClass("flipped")) {
                item.toggleClass("doubleflipped");
            } else 
            item.toggleClass("double");
        };
        
        
        var flipHoriz = function(item) {
            console.log(item);
            item.toggleClass("flipped");
        };
        
        var someAnimation = function(item) {
            console.log("yes");
            var delay = 0;
            var i;
            for (i=0; i<100; i++){
              // add 2-5 second delay
              delay += Math.random() * (5000 - 2000) + 2000;
              type = Math.round(Math.random());
              console.log(delay);
                if (type == 0){
                    window.setTimeout((function() {
                        jump(item,2);
                    }),delay);
                } else window.setTimeout((function() {
                        wiggle(item)}),delay);
            }
        };
        
        someAnimation($("#pikaSprite1"));
        someAnimation($("#pikaSprite2"));
        
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
				$("#pokemonName").html(data.name);
			}
		});
	});
        
        $("#startButton").click(function() {
            poke.mode = "play";
            $("#setupContainer").addClass("hidden");
            $("#battleContainer").removeClass("hidden");
        });
        
        $(".selectable").click(function() {
            var clicked=$(this);
            if (poke.selected) {
                toggleDouble(poke.selected);
            };
            toggleDouble(clicked);
            poke.selected=clicked;
        });
                
        
        $("#submitButton2").click(function() {
            jump($("#pikaSprite2"),3);
//            $("#pokemonSprite").attr("src","sprites/pokemon/"+window.POKE.poke1.id+".png");
        });
        

        $("#pokemonSprite").mouseover(function() {
            
            item = $(this);
            wiggle(item);
        });

});