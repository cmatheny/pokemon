/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * 
 */
var POKE = {
    mode: "Select"
    
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
        
        
        //Event handlers
	$("#submitButton").click(function() {
		
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
        
        $("body").click(function() {
            $("#pokeContainer").removeClass("hidden");
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
            $("#pokemonSprite").attr("src","sprites/pokemon/"+window.POKE.poke1.id+".png");
        });
        

        $("#pokemonSprite").mouseover(function() {
            
            item = $(this);
            wiggle(item);
        });

});