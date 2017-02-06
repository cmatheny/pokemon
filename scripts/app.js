/**
 * 
 */
var POKE = {
    pokeApiUrl:"https://pokeapi.co/api/v2/",
    spriteUrl:"sprites/pokemon/",
    pokeIndexData: null,
    mode: "Select",
    running: true,
    animations: [],
    audio: [],
    party1: [],
    party2: [],
    browsePage: 0,
    noServer: false,
    maxPage: 39, // 39
    maxPoke: 783, // 783
    numBrowseButtons: 7, // Should be odd and probably 7 or less
    pokeData: [],
    __gold: 100,
    sfx: {},
    
    goldTagHandle: null,
    
    SaveData: {
        party: [],
        gold: 100
    },
    
    statWindow: {
        pokeData: null
    },
    
    Settings: {
        playAudio: true,
        playSfx: true
    },
    
    Cache: {
        pokeIndexData: [],
        pokeData: []
    },
    
    stopAnimations: function(which) {
        var i;
        if (which==="all") {
            for (i=0;i<POKE.animations.length;i++) {
                clearInterval(POKE.animations[i]);
            }
        }
    },
    
    Pokemon: function(pokeData, nickname, id, name, hp, maxHp, attack, defense,
            spAttack, spDefense, speed) {
        if ((!(typeof window === "undefined") && this === window) || 
                (!(typeof global === "undefined") && this === global)) {
            throw  Error("Constructor called as function");
        }

        if (!pokeData) {
            this.nickname=nickname;
            this.name = name;
            this.hp = hp;
            this.maxHp = maxHp;
            this.attack = attack;
            this.defense = defense;
            this.spAttack = spAttack;
            this.spDefense = spDefense;
            this.speed = speed;
            this.id = id;
            this.origData=null;
        } else {
            if (nickname) {
                this.nickname=nickname;
            } else this.nickname=pokeData.name;

            this.name = pokeData.name;
            this.hp = pokeData.stats[5].base_stat;
            this.maxHp = pokeData.stats[5].base_stat;
            this.attack = pokeData.stats[4].base_stat;
            this.defense = pokeData.stats[3].base_stat;
            this.spAttack = pokeData.stats[1].base_stat;
            this.spDefense = pokeData.stats[2].base_stat;
            this.speed = pokeData.stats[0].base_stat;
            this.id = pokeData.id;
            this.origData=pokeData;                
        }
        return this;
    },
    
    getGold: function() {
        return this.gold;
    },
    
    addGold: function(amount) {
        if (this.gold+amount < 0) {
            return false;
        }
        this.gold=this.gold+amount;
        // update display in sidebar
        this.goldTagHandle.html(this.gold);        
        return true;
    },
    
    Audio: function(src, auto, loop, pushTo) {
        auto = auto || false;
        loop = loop || false;
        audioElement = document.createElement("audio");
        audioElement.setAttribute("src",src);
        if (auto) {
            audioElement.setAttribute("autoplay", "autoplay");
        }
        if (loop) {
            audioElement.setAttribute("loop","loop")
        }
        
        this.audio=audioElement;
        this.play=function(){this.audio.play()};
        this.pause=function(){this.audio.pause()};
        this.restart=function(){
            this.audio.pause();
            this.audio.currentTime = 0;
            this.audio.play();
        };
        
        if (pushTo) {
            pushTo.push(this);
        }
        
        return this;
    }
};

$(document).ready(function() {
	// DOM is ready
	var poke=POKE;
        
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
        
        var attackAnim = function(item, times, sound) {
            var timer = 0;
            var i;
            
            var attackSwitch = function() {
                item.toggleClass("attacking");
            };
            
            if (sound&&poke.Settings.playSfx) {
                poke.sfx.attack.play();
            }
        
            for (i=0; i<times*2; i++) {
                timer+=90;
                window.setTimeout(attackSwitch,timer);
            }
        };
        
        var jump = function(item, times, doAttack, sound) {
            var timer = 0;
            var i;
            
            if (sound&&poke.Settings.playSfx) {
                poke.sfx.jump.play();
            }
            
            var jumpSwitch = function() {
                item.toggleClass("jumping");
            };
            
             if (doAttack) {
                 attackAnim(item, times);
             }
             
            for (i=0; i<times*2; i++) {
                timer+=120;
                window.setTimeout(jumpSwitch,timer);
            }
        };
        
        var flipHoriz = function(item) {
            item.toggleClass("flipped");
        };
        
        
        var comboAttack = function(item, sound) {
            if (!item.hasClass("block")) {
                item.addClass("block");
                comboAttack(item);
                // block for 2 sec
                window.setTimeout(function() {item.removeClass("block");},1500);
                
                if (sound&&poke.Settings.playSfx) {
                    poke.sfx.comboAttack.play();
                }
                wiggle(item,2);
                window.setTimeout(function(){jump(item,1);},400);
                window.setTimeout(function(){attackAnim(item,2);},650);
            }

        };
        
        
        var someAnimation = function(item,sound) {
            var delay;
            var times;
            var jumpSound = sound;
            // 1-2:jump, 4-5:wiggle, 3-6:attack, 7:jumpAttack, 8:wigglejump, 9:combo!
            type = Math.round(Math.random()*9);
            if (type===0) return;
            // 0-2 seconds to delay (3-5 total)
            delay = Math.random()*2000;
            
            if ([1,2,3,7,8].includes(type)){
                // do it 2-4 times
                times = Math.round(Math.random()*2+2);
                if (type===7) jumpSound = false;
                window.setTimeout((function() {
                    jump(item,times,false,jumpSound);
                }),delay);
            };
            
            if ([4,5,8].includes(type)) {
                // do it 2-4 times
                times = Math.round(Math.random()*2+2);
                
                window.setTimeout((function() {
                    wiggle(item,times,sound);
                }),delay);
            };
            
            if ([3,6,7].includes(type)){
                // do it 2-4 times
                times = Math.round(Math.random()*2+2);
                attackAnim(item,times,sound);
            };
            
            if (type === 9) {
                comboAttack(item,sound);
            };
            
        };
        
        
        var startAnimation = function(item,interval,delay) {
            // calls someAnimation() on item at the specified interval in ms
            // if Delay is specified, it will wait that long before the first call
            // array of two numbers for delay will pick a random number between the two
            var max;
            var min;
            if (Array.isArray(delay)) {
                if (delay.length===2) {
                    max = Math.max.apply(Math, delay);
                    min = Math.min.apply(Math, delay);
                    delay=Math.random()*(max-min)+min;
                } else delay = undefined;
            }
            window.setTimeout(function(){
                someAnimation(item);
                poke.animations.push(setInterval(function(){someAnimation(item);},interval));
            },delay);
        };
        
        
        var stopAllAnimations = function() {
            while (poke.animations.length>0) {
                console.log(poke.animations.length+" left.");
                clearInterval(poke.animations.pop());
            }
        };
        
        
        var pokeRequest = function() {
            
            var finish = function() {
                $("#browseButton").addClass("active");
                $("#browseButton").html("Browse Pokemon");
                return;
            };
            
            if (poke.Cache.pokeIndexData.results && 
                    poke.Cache.pokeIndexData.results.length>0) {
                poke.pokeIndexData=poke.Cache.pokeIndexData;
                console.log("Loaded from cache.");
                finish();
                return;
            }            
            
            console.log("Loading from PokeAPI...");
            
            $.ajax({
                method: "GET",
                url: poke.pokeApiUrl+"pokemon/?limit="+poke.maxPoke,
                
                success: function(data) {
                    poke.pokeIndexData=data;
                    poke.Cache.pokeIndexData=poke.pokeIndexData;
                    localStorage['pokeIndexCache'] = JSON.stringify(poke.Cache.pokeIndexData);
                    finish();
                },
                
                failure: function() {
                    setTimeout(pokeRequest,2000);
                }
            });
            
        };
        
        
        var pokeStatRequest = function(pokeId) {
            
            var finish = function() {
                var statWindow= $("#statWindow");
                
                poke.statWindow.pokeData = poke.Cache.pokeData[pokeId];
                fillStatPage(pokeId);
                statWindow.removeClass("hidden");
                $("#browseContainer .btn").removeAttr("disabled");
            };
            
            if (poke.Cache.pokeData[pokeId]) {
                finish();
                console.log("Loaded from cache.");
            } else {
            
                loading(true);
                console.log("Loading from PokeAPI...");
                
                $.ajax({
                    method: "GET",
                    url: poke.pokeData[pokeId].url,
                    
                    success: function(data) {
                        poke.Cache.pokeData[pokeId] = data;
                        localStorage['pokeDataCache'] = JSON.stringify(poke.Cache.pokeData);
                        loading(false);
                        finish();
                    },
                    
                    failure: function() {
                    setTimeout(pokeStatRequest(pokeId),2000);
                    }
                    
                });
            }
        };
        
        
        var loading = function(boolVal) {
            if (boolVal) {
                $("#loadingSign").removeClass("hidden");
            } else $("#loadingSign").addClass("hidden");
        };
        
        
        // Toggle button between green and gray (must be one of those to begin with)
        var buttonDisable = function(buttonObject) {
            buttonObject.addClass("btn-secondary");
            buttonObject.removeClass("btn-success");
        };
        
        
        var buttonEnable = function(buttonObject) {
            buttonObject.removeClass("btn-secondary");
            buttonObject.addClass("btn-success");
        };
        
        
        var waitForPage = function() {
            if (!poke.pokeIndexData[poke.browsePage]) {
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
            var range = (poke.numBrowseButtons-1)/2;
            var lowPage = Math.max(0,poke.browsePage-range);
            var highPage = Math.min(poke.maxPage+1,poke.browsePage+range);
            if (highPage === poke.maxPage+1) {
                lowPage = poke.maxPage - 2*range;
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
        
        
        var fillStatPage = function() {
            var temp = poke.statWindow.pokeData;
            $("#statWindowSprite").removeClass("hidden");
            comboAttack($("#statWindowSprite"));
            $("#statWindowName").html(temp.name);
            $("#statWindowAttack").html(temp.stats[4].base_stat);
            $("#statWindowDefense").html(temp.stats[3].base_stat);
            $("#statWindowSpAtt").html(temp.stats[2].base_stat);
            $("#statWindowSpDef").html(temp.stats[1].base_stat);
            $("#statWindowSpeed").html(temp.stats[0].base_stat);
            $("#statWindowHP").html(temp.stats[5].base_stat);
            $("#statWindow .btn").removeAttr("disabled");
        };
        
        
        var fillBrowseContainer = function(pageNum) {
            var row;
            var col;
            var thisImage;
            var thisText;
            var index = 0;
            var resultsIndex = pageNum*20-1;
            var pokeName;
            var pokeId;
            var pokeUrlArray;
            var imgArray = [];
            var imgUrl;
            poke.browsePage=pageNum;           
            
            for (row=0;row<4;row++) {
                for (col=0;col<5;col++) {
                    index=col+5*row;
                    resultsIndex++;

                    
                    thisImage=$("div.browse img")[index];
                    thisText=$("div.browse .browseText")[index];
                    if (resultsIndex >= poke.maxPoke) {
                        pokeId = "none";
                        pokeName="";
                    } else {
                        pokeName=poke.pokeIndexData.results[resultsIndex].name;
                        pokeUrlArray=poke.pokeIndexData.results[resultsIndex].url.split("/");
                        pokeId=pokeUrlArray[6];
                        poke.pokeData[pokeId]=poke.pokeIndexData.results[resultsIndex];
                    }
                    
                    imgUrl = "sprites/pokemon/"+pokeId+".png";
                    $(thisImage).attr("src",imgUrl);
                    $(thisText).html(pokeName);
                    imgArray[index] = $(thisImage);
                    }

                }
            
            if (poke.mode !== "Browse") {
                var i;
                for (i=0;i<imgArray.length;i++) {
                    startAnimation(imgArray[i],5000,[300,6000]);
                }
                poke.mode = "Browse";
                
            
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
            
        };
        
        var getNickname = function() {
            $("#statWindow .btn").attr("disabled","disabled");
            $("#nicknameWindow").removeClass("hidden");
            var input = $("#nicknameTextbox");
            input.removeAttr("disabled");
            input.focus();
        };
        
        var addToParty = function() {
            var temp = new poke.Pokemon (poke.statWindow.pokeData);
            var nickWindow = $("#nicknameTextbox");
            
            // get nickname from textbox
            temp.nickname = nickWindow.val() || temp.name;
            $("#nicknameTextbox").attr("disabled","disabled");
            nickWindow.val("");

            poke.party1.push(temp);
            addToSidebar(temp);
            
            $("#nicknameWindow").addClass("hidden");
            $("#statWindow").addClass("hidden");
        };
        
        var addToSidebar = function(pokemon,side) {
            side = side || "left";
            var index = 4-$("#"+side+"Container > .pokeRow.hidden").length;
            
            var sidebarRow = $("#"+side+"Sidebar"+index);
            var fields = sidebarRow.find("div.text-right");
            sidebarRow.removeClass("hidden");
            
            $(fields[0]).html(pokemon.nickname);
            $(fields[1]).html(pokemon.name);
            $(fields[2]).html(pokemon.maxHp + "/" + pokemon.maxHp);
            
            if (index === 3) {
                finishSetup();
            }
        };
        
        var finishSetup = function() {
            
            var i;
            var partySprites;
            poke.mode = "Play";
            $("#browseContainer").addClass("hidden");
            $("#setupContainer").addClass("hidden");
            $("#battleContainer").removeClass("hidden");
            
            // load in party images
            partySprites = $(".partySprites.friendly");
            for (i=0; i<poke.party1.length; i++) {
                $(partySprites[i]).attr("src","sprites/pokemon/"+poke.party1[i].id+".png");
            }
            
            // load in enemy party/images
            
            // display combat log and buttons

        };
        
        var setSfx = function(value) {
           var audioImg = $("#sfxImg");
            var audioBtn = $("#sfxButton");
            value = value || poke.Settings.playSfx;
            if (value === "toggle") {
                value = !poke.Settings.playSfx;
            }
            if (value === true) {
                audioBtn.removeClass("btn-danger");
                audioImg.attr("src","sprites/sfx-on.png");
                poke.Settings.playSfx=true;
                localStorage["pokeSettings"]=JSON.stringify(poke.Settings);
            } else if  (value === false) {
                audioBtn.addClass("btn-danger");
                audioImg.attr("src","sprites/sfx-off.png");
                poke.Settings.playSfx=false;
                localStorage["pokeSettings"]=JSON.stringify(poke.Settings);
            } 
        };
        
        var setAudio = function(value) {
            var audioImg = $("#audioImg");
            var audioBtn = $("#audioButton");
            value = value || poke.Settings.playAudio;
            if (value === "toggle") {
                value = !poke.Settings.playAudio;
            }
            if (value === true) {
                poke.bgm.restart();
                audioBtn.removeClass("btn-danger");
                audioImg.attr("src","sprites/audio-on.png");
                poke.Settings.playAudio=true;
                localStorage["pokeSettings"]=JSON.stringify(poke.Settings);
            } else if  (value === false) {
                poke.bgm.pause();
                audioBtn.addClass("btn-danger");
                audioImg.attr("src","sprites/audio-off.png");
                poke.Settings.playAudio=false;
                localStorage["pokeSettings"]=JSON.stringify(poke.Settings);
            }
        };

        var saveGame = function() {
            poke.SaveData.gold = poke.gold;
            poke.SaveData.party = poke.party1;
            localStorage["pokeSave"] = JSON.stringify(poke.SaveData);
        };
        
        var loadCache = function() {
            var cache = localStorage["pokeDataCache"];
            if (cache) poke.Cache.pokeData = JSON.parse(cache);
            var cache2 = localStorage["pokeIndexCache"];
            if (cache2) poke.Cache.pokeIndexData = JSON.parse(cache2);
        };
        
        var loadSettings = function() {
            var settings = localStorage["pokeSettings"];
            if (settings) {
                poke.Settings = JSON.parse(settings);
            }
            setAudio();
            setSfx();
        };
        
        var loadSave = function() {
            var i;
            var save = localStorage["pokeSave"];
            if (save) poke.SaveData = JSON.parse(save);
            poke.gold=poke.SaveData.gold;
            poke.party1=poke.SaveData.party;
            for (i=0;i<poke.party1.length;i++) {
                console.log(i);
                addToSidebar(poke.party1[i]);
            }
        };
        
        var generateSfx = function() {
            var path="audio/sfx/";
            poke.sfx.jump = new poke.Audio(path+"Mimic1.wav");
            poke.sfx.attack = new poke.Audio(path+"Cut.wav");
            poke.sfx.comboAttack = new poke.Audio(path+"MegaPunch.wav")
        };
        
        // generate browsing table tags
        var generateBrowseTable = function() {
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
            $("#browseContainer").append("<div class=\"row tinyBrowseRow\"></div>");
            
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
        };
        
        
        loadCache();
        loadSave();
        console.log(poke.Cache.pokeData);
        console.log(poke.Cache.pokeIndexData);
        console.log(poke.SaveData);
        
        if (!poke.noServer) {
            pokeRequest();
        };
        
        poke.bgm=new poke.Audio('audio/battle-trainer.mp3',false,poke.audio);
        loadSettings();
        generateSfx();
    
        // Pika dance
        var pika1=$("#pikaSprite1");
        var pika2=$("#pikaSprite2");
        comboAttack(pika1,true);
        comboAttack(pika2);
        poke.animations.push(setInterval(function() {
            someAnimation(pika1,true);
        },2000));
        poke.animations.push(setInterval(function() {
            someAnimation(pika2,true);
        },2000));
        
        poke.goldTagHandle = $("#goldAmount");
        generateBrowseTable();
        
        //Event handlers
        $("#browseButton").click(function() {

            poke.stopAnimations("all");
            if (!$("#browseButton").hasClass("active")) {
                return;
            } else fillBrowseContainer(0);
            
            $("#setupContainer").addClass("hidden");
            $("#stopButton").addClass("hidden");
            $("#browseContainer").removeClass("hidden");
        });
        
        
        $("#browseContainer .browseImg").click(function() {
            var id;
            var url = $($(this).children()[0]).attr("src");
            if (url === (poke.spriteUrl + "none.png")) return;
            $("#browseContainer .btn").attr("disabled","disabled");
            var imgSprite = $("#statWindowSprite");
            id = url.split("/")[2].split(".")[0];
            
            pokeStatRequest(id);
            
            imgSprite.attr("src",url);
        });
        
        $("#browseContainer .buttonRow .btn").click(function() {
            var target=event.target;
            var buttonVal = $(target).html();           
            
            if (buttonVal === "&lt;&lt;") {
                poke.browsePage=0;
            } else if (buttonVal === "&lt; 10") {
                poke.browsePage=Math.max(0,poke.browsePage-10);
            } else if (buttonVal === "&lt; Prev") {
                if (poke.browsePage > 0) {
                    poke.browsePage--;
                }
            } else if (buttonVal === "Next &gt;") {
                if (poke.browsePage < poke.maxPage) {
                    poke.browsePage++;
                }
            } else if (buttonVal === "10 &gt;") {
                poke.browsePage=Math.min(poke.maxPage,poke.browsePage+10);
            } else if (buttonVal === "&gt;&gt;") {
                poke.browsePage=poke.maxPage;
                console.log(poke.maxPage);
            } else if ($.isNumeric(buttonVal)) {
                poke.browsePage=buttonVal-1;
            }
            fillBrowseContainer(poke.browsePage);
        });


        $("#statWindowAddBtn").click(getNickname);

        $("#nicknameSubmit").click(addToParty);

        $("#nicknameTextbox").on("keypress", function(e) {
            if (e.key === "Enter"){
                addToParty();
            }
        });
        
        $("#stopButton").click(function() {
            stopAllAnimations();
            $(this).addClass("hidden");
        });
        
        
        $(".selectable").click(function() {
            var clicked=$(this);
            
            if (poke.selected) {
                poke.selected.toggleClass("double");
            };

            poke.selected=clicked;
            poke.selected.toggleClass("double");
        });
        

        $("#statWindowSprite").mouseover(function() {
            comboAttack($(this));
        });
        
        $("#statWindowBackBtn").click(function() {
            $("#statWindow").addClass("hidden");
        });
        
        $("#settingsButton").click(function() {
            $("#settingsWindow").removeClass("hidden");
        });
        
        $("#sfxButton").click(function() {
            setSfx("toggle");
        });
        
        $("#audioButton").click(function() {
            setAudio("toggle");
        });
        
        $("#settingsWindow button").click(function() {
            var clicked = $(this).html();
            if (clicked==="About PBA") {
                $("#aboutWindow").removeClass("hidden");
            } else if (clicked==="Save Game") {
                saveGame();
            } else if (clicked==="Clear Cache") {
                localStorage.removeItem("pokeIndexCache");
                localStorage.removeItem("pokeDataCache");
            } else if (clicked==="Clear Save Data") {
                localStorage.removeItem("pokeSave");
                location.reload();
            } else if ($(this).hasClass("btn-close")) {
                $("#settingsWindow").addClass("hidden");
            }
        });
        
        $("#aboutWindow button").click(function() {
            $("#aboutWindow").addClass("hidden");
        });
});