import { useState } from 'react';

const gamesData = {
  2014: [
    { name: "Donkey Kong Country: Tropical Freeze", desc: "", rating: 7 },
    { name: "Bumpee's Party", desc: "", rating: 5 },
    { name: "Child of Light", desc: "", rating: 7 },
    { name: "Mario Kart 8", desc: "", rating: 8 },
    { name: "Shovel Knight", desc: "", rating: 8 },
    { name: "Tomb Raider", desc: "", rating: 7 },
    { name: "Smash 3DS", desc: "", rating: 8 },
    { name: "Puppeteer", desc: "Amazing Music! Great personality and voice acting. Gameplay was a little lackluster.", rating: 6 },
    { name: "Bayonetta", desc: "", rating: 7 },
    { name: "Smash Wii U", desc: "", rating: 8 },
    { name: "Bayonetta 2", desc: "", rating: 8 },
  ],
  2015: [
    { name: "Captain Toad's Treasure Tracker", desc: "", rating: 7 },
    { name: "Punch-Out!!", desc: "Great character animation, lots of information conveyed with subtle movements, definitely sense of progression.", rating: 7 },
    { name: "Teslagrad", desc: "Game full of great ideas, a little hampered by slow down and some bugs. Great ideas, puzzles, atmosphere.", rating: 6 },
    { name: "Journey", desc: "Breathtaking art, deep, rich in symbolism. Went into it completely blind, did not know anything about the game, and that was the right way to do it. Had an experience unique to me - loved the touch and go online interaction with other people experiencing their \"life\" too.", rating: 10 },
    { name: "Advance Wars", desc: "Got for free from Club Nintendo rewards. Fun, quick mission experience, very nostalgic. Good in short bursts.", rating: 6 },
    { name: "Affordable Space Adventures", desc: "Great game with a group of friends, watching Sarah and Emily discover puzzles, helping as the scientist. Every person fit their role perfectly when we played. Lots of screaming and excitement.", rating: 8 },
    { name: "Splatoon", desc: "Great, simple but deep multiplayer online experience. Love the sounds and art style, great addictive one-more-round gameplay, and lots of customization. Incredible long term drip of free content. Still playing consistently months and months after release.", rating: 10 },
    { name: "The Order", desc: "Visually stunning, incredible cinematics. Transitions from watching to gameplay are seamless. Story was ok, and gameplay was average.", rating: 6 },
    { name: "Batman: Arkham Knight", desc: "Huge expansive, living city. Love the nods to Batman heroes and villains. Incredible use of a video game to convey a story - does things that can only be done in this medium.", rating: 8 },
    { name: "Peggle 2", desc: "More Peggle.", rating: 6 },
    { name: "Runbow", desc: "Fun, crazy, if not slightly shallow multiplayer party game. Great for laughs, anyone can pick up.", rating: 6 },
    { name: "Super Mario Maker", desc: "Amazing tool with tons of potential, easy to use for anyone, lots of hidden secrets and tricks. Really impressed with some stages - however many of them are crap.", rating: 7 },
    { name: "Final Fantasy VI", desc: "", rating: 7 },
    { name: "Broken Age", desc: "Impressive story and animation. Not good for long, binge sessions, but great in short bursts. Engaging, surprising story.", rating: 7 },
    { name: "Mini Metro", desc: "", rating: 8 },
  ],
  2016: [
    { name: "Infamous: Second Son", desc: "Tight, exciting gameplay, with a variety of powers. Predictable, bland story wasn't a problem because of fun, engaging combat and traversal. Lame characters.", rating: 7 },
    { name: "The Witcher 3: Wild Hunt", desc: "Huge, interesting world full of life. Combat and controls are a little clunky, but very immersive world. Overwhelming at times.", rating: 7 },
    { name: "Pokemon Picross", desc: "Engrossing, addictive, and cerebral. Tricks me into thinking I'm doing something productive.", rating: 7 },
    { name: "Final Fantasy X", desc: "A comfort-food of a game, great to dive back in and replay a solid game.", rating: 7 },
    { name: "Yoshi's Wooly World", desc: "", rating: 7 },
    { name: "BroForce", desc: "A fun, mindless game with funny ideas. Doesn't feel particularly tight control wise or bug free, but is a fun co-op romp.", rating: 6 },
    { name: "Gauntlet", desc: "Great pick up and play multiplayer fun.", rating: 6 },
    { name: "Toto Temple Deluxe", desc: "Simple controls but rapid, frantic gameplay. Fun, but does not last forever.", rating: 5 },
    { name: "Zelda: Link Between Worlds", desc: "Incredible world packed with secrets - but not too big that I'm overwhelmed. Takes the Zelda formula and flips some of it on it's head, in new, innovative ways. Great direction for the series.", rating: 9 },
    { name: "Tropico 5", desc: "Great game and a lot of fun. Surprised at how well a city builder worked on a console. Very story driven.", rating: 7 },
    { name: "Gravity Rush", desc: "Beautiful, well designed world that unfortunately suffers from poor programing and mechanics.", rating: 5 },
    { name: "Star Fox Guard", desc: "A small idea that they tried to stretch into a full game. Still a fun side attraction, but not worth buying without the other game.", rating: 4 },
    { name: "Swords and Soldiers 2", desc: "Surprising polish and charm for a small indie developer, beautiful hand drawn graphics.", rating: 6 },
    { name: "Overwatch", desc: "Incredible character design and polish makes this multiplayer only shooter well worth the price. Focus on fun, no matter what class. Still playing it months later.", rating: 10 },
    { name: "Mirror's Edge: Catalyst", desc: "Went in with low expectations, was pleasantly surprised to find a polished, fun, beautiful open world game.", rating: 7 },
    { name: "Pokemon: GO", desc: "Unbelievably huge social phenomenon. Was able to see people of all ages running from Pokestop to Pokestop. Disappointed that people in more urban areas have bigger advantages.", rating: 8 },
    { name: "The Last of Us: Remastered", desc: "A well polished, story intense experience.", rating: 8 },
    { name: "Overcooked!!", desc: "Fun, frantic, cooperative multiplayer game with simple mechanics. Huge sense of accomplishment. Certain levels are brilliantly designed.", rating: 9 },
    { name: "Terreria", desc: "Scratches an itch I didn't know I really had. Fun to explore, learn the ropes as I go. A little overwhelming.", rating: 6 },
    { name: "Abzu", desc: "Started off not as interested as I expected, but ended up loving the narrative and images. Beautiful graphics, nice twists in a surprisingly engaging story.", rating: 7 },
    { name: "Rise of the Tomb Raider", desc: "More than worth the wait. Beautiful graphics, fun, varied gameplay, awesome setting. Great, fun game to explore.", rating: 9 },
    { name: "Civilization 6", desc: "Couldn't fully enjoy because of hardware limitations. Seems like a great new direction. A lot of fun, but radical and complicated enough that it's intimidating.", rating: 7 },
    { name: "Guitar Hero Live", desc: "Picked up on a whim. Love the fact that they're trying something new with the reboot. Especially love their method of DLC.", rating: 6 },
    { name: "Super Mario Run", desc: "Surprisingly innovative - the biggest change in the 2D Mario genre. Simple and easy to beat but layers of depth.", rating: 7 },
  ],
  2017: [
    { name: "Stories: Path of Destinies", desc: "Very interesting concept for a game. Love the multipath, quick level, replayability structure. Fun combat, bright sharp graphics. A bit too much down time.", rating: 6 },
    { name: "Reign", desc: "Unique way to tell a narrative. I love the simple mechanics and humor, but difficult to understand how to do better.", rating: 5 },
    { name: "Clash Royale", desc: "Addictive free to play game that combines deck building, tower defense, and clash of clans.", rating: 6 },
    { name: "Everyone's Gone to the Rapture", desc: "Slower paced than I'd like, even for a walking simulator. Very slow walking speed. Lack of guidance resulted in backtracking.", rating: 4 },
    { name: "Assassin's Creed: Syndicate", desc: "A great entry in the franchise. Fixes a lot of problems, polished fun experience. In some ways, just too damn big! Long loading times.", rating: 7 },
    { name: "Cities in Motion", desc: "Found myself obsessed with the game. Thinking about going home after work and playing. I would turn it on intending to play for a few minutes and end up playing all night.", rating: 9 },
    { name: "Fire Emblem: Heroes", desc: "Boiled down the Fire Emblem formula. Love the short mission structure, but too open ended from the beginning! Kind of overwhelming.", rating: 6 },
    { name: "Stardew Valley", desc: "Started on a whim. Became instantly obsessed - spent my time at work thinking about what I was going to do on my farm. Sunk more than 30 hours. Love being able to play on the go.", rating: 9 },
    { name: "Life is Strange", desc: "Only episode 1", rating: 5 },
    { name: "Zelda: Breath of the Wild", desc: "Breathtakingly beautiful, massive world that is a dream, not a chore, to explore. Two months later continues to be one of the best games I've ever played. Fun gameplay, engaging yet manageable story. Constantly surprised.", rating: 10 },
    { name: "Super Bomberman R", desc: "Slightly lacking in the polish department, but still a passable Bomberman game. Not worth the full price tag. UPDATE: With a recent patch, much more reasonable.", rating: 5 },
    { name: "World of Goo", desc: "Still an awesome, fun puzzle game. Great showcase for pointer technology on the Switch.", rating: 7 },
    { name: "Snake Pass", desc: "Beautiful graphics and smart, innovative controls. A game where the gameplay itself is a puzzle. Feels like a skill I need to practice and learn.", rating: 6 },
    { name: "Minecraft: Switch Edition", desc: "Finally understand the hype behind Minecraft. Fun to build your own fort. Good for relaxing, meditative.", rating: 7 },
    { name: "ARMS", desc: "Interesting take on a new franchise. I appreciate the steady stream of free content, but steep learning curve that requires me to keep 'in practice'.", rating: 6 },
    { name: "Tales from the Borderlands", desc: "Interesting story full of twists and turns, ended just in time. Characters I cared about - so much that I shed a tear at the finale.", rating: 8 },
    { name: "Until Dawn", desc: "Awesome production values for a choose-your-own-adventure type game. Definitely a game I would enjoy playing as a group.", rating: 7 },
    { name: "Splatoon 2", desc: "Enjoyable if not samey multiplayer as Splatoon 1. Great multiplayer, solid improvements. Disappointed by the soundtrack.", rating: 7 },
    { name: "Hatoful Boyfriend", desc: "Surprisingly fun story based dating game. The novelty doesn't get old because of quick run throughs.", rating: 6 },
    { name: "Kingdom: New Lands", desc: "A game where you are taught nothing and have to figure out mechanics yourself. I love the tower defense gameplay. Great, interesting graphic style.", rating: 7 },
    { name: "Mario Odyssey", desc: "Great, solid platformer. Love the world, Mario's solid controls. Main story was really short. Moons felt a little too easy. Wished for a little more linear, compact experience.", rating: 8 },
    { name: "Rocket League", desc: "", rating: 7 },
  ],
  2018: [
    { name: "Picross S", desc: "Exactly what is to be expected from a Picross game. Perfect for traveling and being in handheld mode. Nice colors.", rating: 7 },
    { name: "Shovel Knight: Specter of Torment", desc: "Tight controls, awesome music, and a surprisingly deep story. Definitely a worthy successor. Makes me feel like a badass.", rating: 9 },
    { name: "Mario + Rabbids: Kingdom Battle", desc: "Not wowed", rating: 5 },
    { name: "Oxenfree", desc: "Wonderful, open, story game with layers and layers of mystery. Amazing to look online and see all the fan theories. Great soundtrack and genuinely unsettling. Incredibly atmospheric, and emotionally moving.", rating: 9 },
    { name: "Fortnite", desc: "Not floored, but being free and playing with friends got me playing more than I would have otherwise. Fun in the way any game is fun hanging out with friends, but not very satisfying for me.", rating: 5 },
    { name: "Madden 18", desc: "Huge barrier of entry - hard to understand what to do when. Still want to go back.", rating: 4 },
    { name: "Steamworld Dig 2", desc: "An improvement over the first game in terms of gameplay and mechanics. I liked the constructed world, found the story much more engaging.", rating: 7 },
    { name: "Rime", desc: "Went in with higher expectations than I should have. Checks all the boxes but failed to capture me or engage me.", rating: 5 },
    { name: "Final Fantasy XV", desc: "Beautiful setting and engaging characters. I struggled to understand the combat.", rating: 6 },
    { name: "Kamiko", desc: "Exactly what I expected out of such a low cost game. Short, sweet, and to the point. Very repetitive but in a meditative way.", rating: 6 },
    { name: "Ratchet and Clank", desc: "Wonderful production values and character. The jokes end up being a little juvenile, but solidly made.", rating: 7 },
    { name: "Kingdoms and Castles", desc: "Light, fun part city builder part tower defense game. Great visuals.", rating: 7 },
    { name: "Owlboy", desc: "Incredible setting, soundtrack, atmosphere, and characters. Love the fluid motions of the SNES style graphics. Gameplay is average, but engaging story. Wonderful experience.", rating: 9 },
    { name: "Mario Tennis Aces", desc: "Solid multiplayer and surprisingly robust single player, but lower production values than I expected for a Nintendo game.", rating: 6 },
    { name: "Octopath: Traveler", desc: "Music, graphics, and gameplay drive the game forward where the inconsistent story can't. Amazing orchestrated soundtrack.", rating: 7 },
    { name: "Celeste", desc: "Fun, tight platformer with a very charming and touching story. Especially love the music, which transforms depending on what part of the level.", rating: 9 },
    { name: "Minit", desc: "Fun, bite sized minute long play sessions. Satisfying progression, really unique take. Great experience despite its short length.", rating: 8 },
    { name: "Nefarious", desc: "Great idea for a game, but poor execution.", rating: 3 },
    { name: "The Room", desc: "Noticeably older, but still a fun escape the room type challenge. Fun, low key puzzle solving.", rating: 6 },
    { name: "Super Smash Bros Ultimate", desc: "", rating: 9 },
    { name: "Katamari: Rerolled", desc: "", rating: 7 },
  ],
  2019: [
    { name: "The Messenger", desc: "Platforming game with a lot to love, but didn't hook me like other retro-style indie platformers. Love the soundtrack and big twists. Bangin soundtrack.", rating: 6 },
    { name: "God of War", desc: "Incredibly beautiful graphics, fun gameplay, and interesting story. Really fun and hard to put down. Good game for people to watch.", rating: 9 },
    { name: "Picross S 2", desc: "Similar to the original Picross S. Great for unwinding and focusing. I like the addition of huge, multi-puzzle Picrosses.", rating: 7 },
    { name: "Tetris 99", desc: "Enjoyable, quick play game fun in short bursts. Love the competitive battle royal feel. Addicting one more round feel. Solid classic Tetris.", rating: 8 },
    { name: "Cribbage with Grandpa", desc: "Great way to learn how to play cribbage. A simple card game with style. Lots of charm.", rating: 7 },
    { name: "Final Fantasy IX", desc: "Slower start than I remember. Great soundtrack, appreciate the quality of life improvements. Works really well on the go.", rating: 8 },
    { name: "Night in the Woods", desc: "Did not live up to my hype despite universal praise. Great art style and atmosphere, but long loading times and kind of a dull story. Jokes did not land.", rating: 5 },
    { name: "Moonlighter", desc: "Great graphics, world, and fun gameplay made this hard to put down. Loved the balance of dungeoning at night and selling items during the day. Wonderful soundtrack.", rating: 9 },
    { name: "Golf Story", desc: "Cute, humourous, and light. The golf game didn't grab me, but the dialogue and humor kept me hooked.", rating: 6 },
    { name: "Cuphead", desc: "Graphics shine above all else, but tight controls and incredible soundtrack make this just as fun to watch as play. Definite sense of accomplishment when I was done.", rating: 9 },
    { name: "Overcooked 2", desc: "Great follow up to one of my favorite multiplayer games. Improvements all around, with less frustrating levels.", rating: 8 },
    { name: "911 Operator", desc: "Simple gameplay that feels unfair at times because of random generation. Love the concept but becomes a click on the problem simulator.", rating: 5 },
    { name: "Streets of Rogue", desc: "Simple gameplay, but incredibly complex system that really feels like you can do anything. Great story generating game. Lots of work went into the programing. Also legitimately funny.", rating: 8 },
    { name: "Fire Emblem: Three Houses", desc: "A huge game with as much focus on strategy battles as story and character development. More interested in battle sections than running around the monastery.", rating: 7 },
    { name: "Bastion", desc: "Great hack and slash with enough variety and flavor. The narration keeps things interesting. Difficulty was customizable enough that I always felt just challenged enough.", rating: 8 },
    { name: "Untitled Goose Game", desc: "Wonderful little stealth/puzzle indie game. Great for mini-stories to share with friends. Short, but satisfying. Strangely nauseating camera, wonderful dynamic soundtrack.", rating: 8 },
    { name: "Link's Awakening", desc: "Great style and character. A little easy, but very charming. Presentation trumped otherwise pretty average gameplay.", rating: 7 },
    { name: "Luigi's Mansion 3", desc: "Impressive graphics and animation, but disappointed with the very easy difficulty level.", rating: 6 },
    { name: "Batman: Telltale Series", desc: "Interesting animation style, interesting enough to pick up and play through every once and awhile.", rating: 6 },
    { name: "deBlob", desc: "Fun, mindless type game. Love the presentation and music. The 40+ minute levels make it hard to pick up and play.", rating: 5 },
    { name: "Pokemon Sword", desc: "Great presentation and exciting to get back into Pokemon. Incredibly easy, unfortunately.", rating: 6 },
  ],
  2020: [
    { name: "GRIS", desc: "Beautiful art and music. Found myself stopping every scene to take in the beauty. Each frame could be a work of art. Gameplay is just enough to keep interest.", rating: 8 },
    { name: "The Lion's Song", desc: "Thoughtful, interesting story based point and click adventure. Loved how the stories intertwined. Great sense of puzzle solving.", rating: 8 },
    { name: "West of Loathing", desc: "Constantly surprised at how much I found myself laughing out loud. Fun, simple RPG, but the real joy was in the descriptions. Fun in short bursts before bed.", rating: 8 },
    { name: "Ape Out", desc: "Incredible visual and music style. Loved how the music seemed to react in real time. Great sense of impact. Memorable levels.", rating: 9 },
    { name: "Animal Crossing: New Horizons", desc: "Possibly the best Animal Crossing game yet. Lots of things to do but paced perfectly. Small changes bring quality of life adjustments. Played daily through end of May.", rating: 9 },
    { name: "Spider-man", desc: "Top notch in every single area. Great controls for fighting and swinging. Web slinging and fighting both feel intuitive and satisfying. Found myself stopping and admiring the scenery. Incredible pacing.", rating: 10 },
    { name: "After Party", desc: "Started off slow, hooked me in the middle, then failed to deliver by the end. Loved Oxenfree, but not hooked by this game's more comic tone. Humor was very hit or miss.", rating: 5 },
    { name: "Legends of Runeterra", desc: "Leave it to League of Legends to finally get me into a deck-building card game. I love the Hearthstone-like simplicity.", rating: 7 },
    { name: "Child of Light", desc: "Great to go back and revisit. Glad to start on the correct difficulty. Incredible soundtrack.", rating: 8 },
    { name: "Mario Kart 8 Deluxe", desc: "Unequivocally the best Mario Kart. Incredible soundtrack, detail in course design, and beautiful graphics.", rating: 9 },
    { name: "Transistor", desc: "Beautiful graphics, great world and soundtrack, and compelling story and gameplay. Great follow up to Bastion. In love with the vocals for the soundtrack. Fun, unique gameplay.", rating: 9 },
    { name: "What Remains of Edith Finch", desc: "Blew me away with the level of detail, atmosphere, and story. The best walking simulator I've ever played, and one of the best narratives in a game. Wonder mix of observation and mastercraft guided narrative.", rating: 10 },
    { name: "War Groove", desc: "Great little Advance Wars clone that dripped with personality. Lots of care went into the story, animation, and world building.", rating: 7 },
    { name: "Transport Fever", desc: "Got the hang of it more quickly. Still scratched a very specific itch.", rating: 6 },
    { name: "Indivisible", desc: "Great personality and characters, interesting world. Gorgeous graphics and smooth animations. Story started slow but had interesting moments.", rating: 7 },
    { name: "Paper Mario: Origami King", desc: "Great game bursting with charm. Loved the world and solving mini-puzzles to find Toads. Was not as big of a fan of the battle mechanics. The music, world, and writing more than make up for it.", rating: 8 },
    { name: "Heave Ho", desc: "Great, simple multiplayer game. Seems like anyone could enjoy it.", rating: 7 },
    { name: "Super Mario 64", desc: "Great to go back and play this classic. Surprised how well the platforming held up. Legitimately fun all these years later.", rating: 8 },
    { name: "Return to Obra Dinn", desc: "Undeniably one of the most innovative games I've ever played. Great, unique gameplay which delivered real Aha moments. Made me feel clever but still provided a real challenge. Great charm and interesting presentation.", rating: 10 },
    { name: "Final Fantasy VII Remake", desc: "One of the most triple-A games I've ever played. High production values in every aspect. One of the strongest soundtracks I've ever heard. Made it a classic.", rating: 9 },
    { name: "Ring Fit Adventure", desc: "Great idea and strong execution. Wish it was easier to just jump into exercises. Repetition got boring quickly.", rating: 5 },
    { name: "Paradise Killer", desc: "A great, open-world detective game, with a setting almost as interesting as the murder mystery. Gameplay was average, but the characters, story, and writing more than make up for it. Good length. Awesome soundtrack.", rating: 8 },
    { name: "Mini Motorways", desc: "Simple, clean, and surprisingly relaxing variant on Mini Metro. Not groundbreaking but fun.", rating: 6 },
    { name: "Jackbox Party Pack 7", desc: "One of the best Jackbox packs in recent memory. Blather Round might rank in my top Jackbox games of all time.", rating: 8 },
  ],
  2021: [
    { name: "Slay the Spire", desc: "An addicting, deck building roguelike. Loved how easy it was to create combos. Really engaging gameplay, a little generic in style.", rating: 8 },
    { name: "Ys VIII: Lacrimosa of Dana", desc: "Started really enjoying it. Great world exploration, interesting characters. But slowly fell off because of repetitive gameplay and boring story. Unable to finish.", rating: 5 },
    { name: "80 Days", desc: "A wonderful, bite sized adventure. Great writing and engaging narrative that adapts to decisions. Love the story, found myself immediately starting another journey.", rating: 8 },
    { name: "Hades", desc: "Incredibly polished and deep experience. Everything people said was true - deep, engaging gameplay. Love how it encourages you to try different styles. Love the character designs.", rating: 9 },
    { name: "Astro's Playroom", desc: "Great, short, engaging experience that would be considered a solid platformer even without the PS5 showcase. Oozing with personality, very Nintendo vibe.", rating: 8 },
    { name: "Final Fantasy XIV", desc: "Fun and exciting to see everything that could come. A little overwhelming and confusing interface.", rating: 6 },
    { name: "Maneater", desc: "Atmospheric experience with clever writing, and satisfying gameplay loop. Love the voice acting. A little stale by the end. Great AA title.", rating: 8 },
    { name: "Control", desc: "An artful, mysterious, and intriguing world action game that takes risks I don't normally see. Some strange design choices hamper what is otherwise a great experience. Love the world they created.", rating: 8 },
    { name: "Hyrule Warriors: Age of Calamity", desc: "Went in with lower expectations. Happy to find huge variety character to character. More relaxing than engaging. Great to pick up and play.", rating: 7 },
    { name: "No Man's Sky", desc: "Enticing open-world that succeeded in sucking me in. I love exploring new planets, going on missions with friends. Super impressed with how far the game has come.", rating: 8 },
    { name: "New Pokemon Snap", desc: "Charming, gorgeous game. Lots of improvements. Multiple categories made it feel more useful to try runs again. Made the whole game feel like a puzzle.", rating: 8 },
    { name: "The Red Lantern", desc: "A lot of potential, but ultimately a pretty average indie game. Great art and vibe. Loved watching the dogs grow and change. Frustrated with the repetitive nature.", rating: 5 },
    { name: "Cities Skylines (PS4)", desc: "Great to finally play a version optimized for the system without crashing.", rating: 7 },
    { name: "Star Renegades", desc: "Interesting take on roguelike, but not appealing because of lack of variety and little progression. Great visuals and soundtrack. Great battle mechanics - each fight like a puzzle.", rating: 6 },
    { name: "SP!NG", desc: "A light, simple physics based phone game. Enjoyable in very short bursts. Unlocking new icons was surprisingly engaging.", rating: 6 },
    { name: "13 Sentinels: Aegis Rim", desc: "Beautiful art, interesting and intriguing story, and great localization/voice acting. Completely nails the story-driven section, but left me dreading the real-time strategy parts.", rating: 8 },
    { name: "Pokemon UNITE", desc: "Interesting take on a Pokemon MOBA. Accessible and fun from the get-go. Not overly complicated. Developers have listened to feedback.", rating: 7 },
    { name: "Urban Flow", desc: "A neat, simple, clean pick up and play game. More of a zen experience. Great vibes, awesome soundtrack. Ended up going all the way through.", rating: 7 },
    { name: "Ghost of Tsushima", desc: "Excited to play. Playing on PS5 on 4K TV, visuals really shine.", rating: 9 },
    { name: "Metroid Dread", desc: "Tight controls and challenging gameplay make me feel like a badass. Moving around feels good and helps motivate exploring. Great sense of mood. Great ending sequence and challenging final boss.", rating: 10 },
    { name: "Eastward", desc: "A pleasant, Zelda-like adventure game in an incredible world. Incredible art style and sprite work. Strong graphics, soundtrack, and atmosphere.", rating: 7 },
    { name: "Hextech Mayhem", desc: "An off-beat rhythm game with a more flexible mechanic I've never seen before. Easy to beat a level, but plenty to unlock. Great soundtrack.", rating: 7 },
    { name: "Picross S 3", desc: "More Picross. First time I've played color picross, definitely a different beast. Zen, great for chilling.", rating: 7 },
    { name: "It Takes Two", desc: "Love the variety of areas and gameplay. Each world feels distinct. Interesting puzzles and boss fights. Some questionable choices, but does well for the experience. Story not doing it for me.", rating: 7 },
    { name: "Mario Party Superstars", desc: "A breath of fresh air for Mario Party. Lots of quality of life changes. Almost all minigames are hits.", rating: 8 },
    { name: "Shovel Knight: Pocket Dungeon", desc: "An awesome mix of roguelite and puzzle game. Hard to resist that one more try feeling. Gameplay is deep but quick paced.", rating: 8 },
  ],
  2022: [
    { name: "Life is Strange: True Colors", desc: "Fun, narrative based adventure game. Good twists and turns. Fun to see how different choices led to different results.", rating: 7 },
    { name: "Deep Rock Galactic", desc: "A good mission based multiplayer game. Stylized graphics hid unpolished parts. Core gameplay loop was interesting.", rating: 6 },
    { name: "Banjo-Kazooie", desc: "Shocked at how well this game stands up decades later - definitely ahead of its time. Music is top-notch. Shocked at how much I remembered.", rating: 9 },
    { name: "Pokemon Legends: Arceus", desc: "A refreshing update to the Pokemon formula I didn't realize I needed. A lot of quality of life improvements. Renewed sense of wonder and exploration.", rating: 9 },
    { name: "Donut County", desc: "Played on iPad. Slightly disappointed how easy things were. Never felt like much of a puzzle.", rating: 4 },
    { name: "Disco Elysium", desc: "Thought provoking and unique style of RPG that felt like playing a DND campaign with a creative narrator. Constantly impressed with how dialogue references previous choices. Great setting and memorable characters.", rating: 10 },
    { name: "Kirby 64: Crystal Shards", desc: "Surprisingly difficult for a Kirby game. Love the mixing of abilities, and the soundtrack is one of the best in the series.", rating: 7 },
    { name: "Micetopia", desc: "Simple Metroidvania with charming graphics, but lacking depth and polish. Easy to die and unforgiving checkpoints.", rating: 3 },
    { name: "Yooka-Laylee and the Impossible Lair", desc: "Solid platformer reminiscent of Donkey Kong Country. Completing levels is easy but finding secret coins is fun. Love the modifiers.", rating: 7 },
    { name: "Mario Strikers: Battle League", desc: "Fun and polished gameplay in what feels like an otherwise incomplete game. Lack of unlockables makes it hard to feel motivated.", rating: 5 },
    { name: "Pokemon: Puzzle League", desc: "Fun, Panel de Pon game. Up-resing does not work well on N64 NSO. Still great to have online multiplayer version. Put quite a bit of time into it.", rating: 7 },
    { name: "Before Your Eyes", desc: "Great to see a new mechanic, especially when it fits well with theming and story. Great example of ludo-narrative consonance. A bit overhyped.", rating: 7 },
    { name: "Mom Hid My Game!", desc: "Great for pass and play. Fun to solve together as a group. Surprised by the sudden shift in tone.", rating: 7 },
    { name: "AI: The Somnium Files", desc: "Played as VGPT in-person event. Took turns on the sticks and discussed the adventure in-person.", rating: 6 },
    { name: "Splatoon 3", desc: "", rating: 8 },
    { name: "Hypnospace Outlaw", desc: "Played for VGPT but did not complete. Enjoyed parts a lot - novel concept and great 90s internet theming. But gameplay grew tedious and puzzles too intricate.", rating: 5 },
    { name: "KLONOA Phantasy Reverie", desc: "Won as a prize. Something comforting about side scrolling 3D games. Fun music and style.", rating: 7 },
    { name: "Return to Monkey Island", desc: "A great return to form. Unique way to make diverging storylines cannon. The art style grew on me pretty quickly.", rating: 8 },
    { name: "Live A Live", desc: "Great music and amazing art style/graphics. Individual chapters began very easy. Loved how things were brought together in the end. All-star soundtrack.", rating: 8 },
    { name: "Hot Wheels: Unleashed", desc: "Arcadey, fun racing game. Controls and drifting felt surprisingly deep. Interesting to see the number of cars to unlock.", rating: 7 },
    { name: "Overwatch 2", desc: "Enjoying the remixed gameplay. I do miss the loot box system; battlepass does not feel as rewarding. New heroes feel fresh.", rating: 7 },
    { name: "Pilotwings 64", desc: "A nice relaxing game. Easy to pick up and do a few levels. Sounds very nostalgic. Top tier soundtrack.", rating: 7 },
    { name: "Escape Academy", desc: "First game on my new PC! Neat gameplay mechanic with co-op focused puzzles. Could use more polish, but core gameplay captured the escape room feeling.", rating: 7 },
    { name: "Vampire Survivors", desc: "The drug equivalent of a video game. An addicting loop of building up weapons. One of the most roguelite games I've ever played. Addicting as hell.", rating: 9 },
    { name: "Unpacking", desc: "A light gaming experience that was more of a game than I expected. Short and satisfying. Great use of sound. Great use of gameplay to tell a story. A bit textbook in terms of actual story.", rating: 8 },
  ],
  2023: [
    { name: "Wildfire", desc: "Impressive, systems-based 2D stealth game with awesome fantasy theme and mechanics. Feel like a badass outsmarting guards. Levels are short and multipathed.", rating: 8 },
    { name: "Hitman", desc: "Surprisingly fun. Stealth and sneaking was less frustrating than expected. More of a fan of handcrafted scenarios than systemic world.", rating: 7 },
    { name: "Iconoclasts", desc: "Indie darling with surprisingly deep story. Gameplay mechanics were interesting but not enough to hold my attention.", rating: 5 },
    { name: "Ghost of Tsushima", desc: "Finally beaten! Incredible world to explore. Great balance of guidance and stumbling upon things. Incredible variety. Amazing story.", rating: 10 },
    { name: "Kuru Kuru Kururin", desc: "Great game in small bursts. Fun to experience a new GBA title. Really gives me that just one more try feeling. Impressed with the level design.", rating: 8 },
    { name: "Humankind", desc: "Super stylish game. A little bit of work to get over Civilization bias. Enjoyed it, glad it exists and was trying new things.", rating: 6 },
    { name: "Warioware: Microgames", desc: "Still a classic. Still remember almost each game. Not as sharp as I used to be.", rating: 7 },
    { name: "Super Mario Land 2: 6 Golden Coins", desc: "A Gameboy classic I had never played that surprisingly holds up. Polished, deep, and enjoyable. Some major slowdown.", rating: 7 },
    { name: "Brothers: A Tale of Two Sons", desc: "An interesting game idea hampered by poor performance and tedious gameplay. Controls got in the way of enjoying the experience.", rating: 4 },
    { name: "Hogwarts Legacy", desc: "Incredible world building and attention to detail. Kind of a dream game since childhood. Constantly surprised at how much content is in the game.", rating: 9 },
    { name: "Triangle Strategy", desc: "Great game that fell on the backburner. Cool graphics and music, impressive voice acting, fun gameplay. A little story-heavy to start.", rating: 7 },
    { name: "Terra Nil", desc: "Interesting take on city builder. A bit frustrating to have a goal to optimize but also a teach as you go tutorial. Randomly generated maps caused frustration.", rating: 5 },
    { name: "Yakuza 0", desc: "Played for VGPT. Started as love/hate. Story and world building great, but combat feels clunky and button-mashy. Ended up kind of down on the game. Story was compelling though.", rating: 6 },
    { name: "Transport Fever 2", desc: "A game that has taken over my life. Viscerally satisfying to complete production lines. Find myself thinking about the game even after shutting it off.", rating: 9 },
    { name: "Cadence of Hyrule", desc: "Played as NSO free trial. Lots of charm and care went into the game. Soundtrack was boppin. Surprisingly challenging.", rating: 6 },
    { name: "Picross S4", desc: "More Picross! Soundtrack gives me big Layton vibes. Could these games be my biggest hours to dollar ratio?", rating: 7 },
    { name: "Zelda: Tears of the Kingdom", desc: "A masterpiece of a game, and it knows it. Bold, confident opening that was very un-Nintendo-like.", rating: 10 },
    { name: "Kirby Tilt 'n' Tumble", desc: "A fun, surprising release on NSO. Motion controls work surprisingly well. Great to be able to play a Kirby game I missed.", rating: 6 },
    { name: "Jurassic World Evolution 2", desc: "Scratches the same itch as city builders. Two thirds through and it's beginning to feel same-y.", rating: 5 },
    { name: "Frostpunk", desc: "An interesting take on city-builder that felt more like a management sim. Less focus on creativity and more about solving problems.", rating: 6 },
    { name: "Shovel Knight Dig", desc: "A fun, skill-based roguelike that rewards getting better. Great graphics and style and another boppin soundtrack. Love how it feels like its own unique game.", rating: 8 },
    { name: "Get In the Car, Loser!", desc: "An interesting concept with positive aspects but ultimately didn't make for a fun game. Didn't enjoy the battle system at all. Writing felt very online.", rating: 4 },
    { name: "Sea of Stars", desc: "Modern-day retro-style JRPG. Love the graphics and world. Wheels is more addicting than the base game. Interesting story, dialogue is average.", rating: 8 },
    { name: "F-Zero 99", desc: "Great version of F-Zero. One of the better 99 series I've played. Somehow avoids feeling chaotic.", rating: 8 },
    { name: "Super Mario Bros Wonder", desc: "Whimsical. Most refreshing Mario I've played in a long long time. Love how they add a final Remix step. Still an incredibly solid platformer. Completed 100%ing - a rarity for me. Loved it!", rating: 10 },
    { name: "Cities: Skylines II", desc: "A great refresh. More excited for potential than actual product released. Pleasantly surprised not to experience performance issues. Update: have since encountered quite a bit of bugs.", rating: 6 },
    { name: "Victoria III", desc: "Played on free weekend. Intrigued by the concept but a bit overwhelmed. Some systems were easy, others were difficult. Not motivated to purchase.", rating: 4 },
    { name: "Mole Mania", desc: "Love this quick pick up and play Miyamoto game. Quick little puzzles, very clever mechanics. Great on the Pocket.", rating: 8 },
    { name: "Super Mario RPG", desc: "A very faithful remake of one of my favorite games. Great polish on graphics and especially soundtrack. Worth replaying just because I like the original so much.", rating: 8 },
    { name: "Danganronpa: Trigger Happy Havoc", desc: "Interesting story - gameplay is Phoenix Wright style but throws in unnecessary action-type elements. Very creepy vibes and surprising twists.", rating: 7 },
    { name: "Suika Game", desc: "The definition of a podcast game. Fun, short, simple, but addicting.", rating: 6 },
    { name: "Jackbox Party Pack 8", desc: "One of the best Jackbox Packs I've played. Especially loved Poll Mine and Job Job.", rating: 8 },
  ],
  2024: [
    { name: "The Finals", desc: "Fun, multiplayer shooter, but a bit too serious for me. Requires too much team coordination with randos.", rating: 5 },
    { name: "Powerwash Simulator", desc: "Expected to like this a lot more. Thought it would be relaxing but just ended up tedious. Majority of time spent hunting for small specks of dirt.", rating: 4 },
    { name: "Cassette Beasts", desc: "Some parts resonate with me - deeper combat and interesting mechanics - but left me with new appreciation for Pokemon games. Grew to like it more over time. Banger soundtrack.", rating: 6 },
    { name: "Cyberpunk 2077", desc: "Playing on PS5 after 3 years of patches. A pretty smooth, seamless, AAA experience. Intrigued by exploring Night City. Love the world and narrative they've built.", rating: 8 },
    { name: "Final Fantasy XVI", desc: "Incredible world and lore. Exciting just to be in a world and walk around. Seems like endless depth put into everything.", rating: 8 },
    { name: "Celeste 64", desc: "Nice little package of a game. Great homage to Celeste. Sometimes didn't feel as tight as the original. Challenge-wise, very well balanced.", rating: 6 },
    { name: "Nobody Saves the World", desc: "Started off VERY hot. Immediately hooked by art style, polish, and tight controls. Infectious gameplay loop perfectly tuned to my sensibilities.", rating: 9 },
    { name: "Citizen Sleeper", desc: "Liked this a lot more than I expected. Approachable and engaging. Kept me playing with one more cycle loops. Enjoyed the story and characters as well.", rating: 9 },
    { name: "Against the Storm", desc: "Received as a birthday gift. Very deep with lots of mechanics - had a hard time keeping track of everything. Haven't been able to win a run yet.", rating: 6 },
    { name: "We ♥ Katamari Reroll", desc: "Great game to stream. Fun to play classic Katamari with quality of life enhancements. Some courses more frustrating than fun.", rating: 7 },
    { name: "Steamworld Build", desc: "Interesting idea but less in my wheelhouse than expected. Felt less like a city builder and more like resource management. More of a grind than a feedback loop.", rating: 4 },
    { name: "Pokemon Pinball", desc: "Played on Analogue Pocket. Perfect for a quick 20 minutes. Enough control for agency but random enough that each game is different. Addicted to catching each Pokemon.", rating: 8 },
    { name: "Wildermyth", desc: "Great battle system and unique DND style storytelling. Would have loved more time in the oven for UI. Really enjoyed the battle system like a mix of DND and Fire Emblem.", rating: 7 },
    { name: "Drill Dozer", desc: "Played on Analogue Pocket after Pepper Grinder hype. Less of an action game and more like a puzzle platformer. Fun, but not the greatest platformer ever as I've heard.", rating: 6 },
    { name: "Stitch", desc: "Great for a time wasting game. Not overly difficult but satisfying like Picross. Great sound effects and visuals.", rating: 7 },
    { name: "Harvest Moon 64", desc: "Started on a whim and immediately hooked again. Feels very quaint after Stardew Valley, but less intimidating. Kind of turned it into a good zen game.", rating: 7 },
    { name: "The Outer Wilds", desc: "Logan described it as a walking sim in space. Each run felt like learning something new. Mission log was helpful. Ended up falling off because of a lack of direction.", rating: 6 },
    { name: "TUNIC", desc: "A top-down Zelda like that feels like a mystery I am unraveling. Love the instruction booklet unlocks. Fun, gorgeous world. Not a huge fan of the combat.", rating: 8 },
    { name: "DK: King of Swing", desc: "A Nintendo title I missed. Interesting spinoff better in short bursts. Often felt like I wasn't in total control. Short levels kept things from getting frustrating.", rating: 6 },
    { name: "Paper Mario: Thousand Year Door", desc: "One of my all-time favorite games, brought back and made even better. Quality of life upgrades and incredible new soundtrack make it even better.", rating: 10 },
    { name: "Unspottable", desc: "Really simple, but unsurprisingly fun party game. Love how quick the rounds are. Not too deep but enjoyable in its simplicity.", rating: 7 },
    { name: "Peglin", desc: "Bought after Indie World. Intrigued by the combination of gameplay. A little RNG heavy. Feels very indie - charming but unfinished.", rating: 7 },
    { name: "Tactical Breach Wizards", desc: "Went in with almost no expectations. Really pleasantly surprised by every aspect. Great, smart gameplay that's creative and fun. Dialogue is funny without making me roll my eyes.", rating: 9 },
    { name: "Yes, Your Grace", desc: "Played on the airplane. Enjoyed what I played. Can tell it was going to involve tough choices. Not randomly generated which I appreciated.", rating: 6 },
    { name: "Balatro", desc: "Played when it dropped on Apple Arcade. Love playing it on touch screen. Fun to pick up for a run or two. Find myself gravitating towards similar strats. Still an addicting loop.", rating: 8 },
    { name: "Zelda: Echoes of Wisdom", desc: "Fun, creative Zelda game. A great twist on the top-down formula. Loved how puzzles didn't have a set solution. Great soundtrack and art style.", rating: 9 },
    { name: "Deponia", desc: "Finally picked up after seeing it on sale for years. Exactly what it seemed like - a point-and-click like Monkey Island. A little slow at times. Thinks it's funnier than it is.", rating: 5 },
    { name: "Persona 5 Royal", desc: "Only scratched the surface. Played the first 10 hours - essentially the tutorial. Stylish as hell, but didn't get deep enough to get sucked into the loop.", rating: 7 },
    { name: "Pokemon TCG Pocket", desc: "", rating: 7 },
    { name: "Jackbox Survey Scramble", desc: "One of my favorite modes fleshed out into its own game. Fun in small or large groups. Worried there isn't enough content long term.", rating: 7 },
    { name: "Warioware: Twisted!", desc: "Played on Analogue Pocket. Just as fun as I remembered. Sad that rumble no longer works.", rating: 7 },
    { name: "Marvel Rivals", desc: "Very late contender for Game of the Year. Downloaded on a whim. Blown away by the style. Feels very big budget. Fun gameplay and huge variety of characters. Playing it daily.", rating: 8 },
  ],
  2025: [
    { name: "Pikmin 4", desc: "Started during holiday season. Love the productive feeling Pikmin gives me. Every day feels like I'm getting stuff done. Dandori Battles provide difficulty I was looking for.", rating: 8 },
    { name: "Inscryption", desc: "Gifted from Ben. A little clouded by my knowledge that this is more than just a deck-builder. Still impressed with the gameplay and narrative.", rating: 8 },
    { name: "Marvel Rivals", desc: "Continued to play into 2025. Would have been more prominent on lists if I started earlier. Love how quick it is to jump into a match.", rating: 8 },
    { name: "Signalis", desc: "A mix of 2D survival horror game and an escape room. Great features that made backtracking less painful. Interesting setting with drip-feed of plot. Inventory was tedious. Good length.", rating: 7 },
    { name: "The Stanley Parable: Ultra Deluxe", desc: "Clever, humorous game that uses the video game genre in a unique way. Fun to pop in and do a run or two. Impressed with how developers expected people to mess around.", rating: 8 },
    { name: "Prince of Persia: The Lost Crown", desc: "Tight controls and great vibe. Fun despite not being super into the genre. Definitely a game that rewards learning combos. Going to be a challenging experience.", rating: 8 },
    { name: "Civilization VII", desc: "Ignored the hate and bought it day one. Great to have a new Civilization game to dive into. Some early kinks to work out. The split into eras seems made for me. Excited to see how it evolves.", rating: 8 },
    { name: "Narita Boy", desc: "Started but pretty quickly put down. Interesting art style and vibe, but gameplay and story moved too slowly. Already felt lost and annoyed with backtracking.", rating: 3 },
    { name: "Super Mario Sunshine", desc: "Jumped in during winter for summer vibes. Some shines quick and easy to grab, making it good pick-up-and-play. Others are brutally difficult.", rating: 7 },
    { name: "Monorail Stories", desc: "Short, slice-of-life story game with multiple endings. Liked the pixel art style and impressed with full voice acting for the size of the game.", rating: 7 },
    { name: "The Islanders", desc: "Simple, fun, and meditative city builder/puzzler. Interesting to find ways to optimize placement.", rating: 7 },
    { name: "Split Fiction", desc: "Fun co-op adventure with light gameplay and story made up for with great set pieces and variety. Love the creativity in design. Sometimes too-long segments but culminated in a bombastic ending.", rating: 8 },
    { name: "Triangle Strategy", desc: "Playing for VGPT. Fun twist on decision-making with the need to convince others. Battles are challenging and fun. Dialogue is somewhat awkward.", rating: 7 },
    { name: "Katamari Damacy Rolling LIVE", desc: "Great return to form for Katamari. Love the premise - the King wants to be a streamer. Format works well for phone game. Love the revamped menu screen.", rating: 8 },
    { name: "Metroid Prime: Remastered", desc: "Great remaster of a game I appreciate more now. Surprised at how quick the pacing in the beginning goes. No getting lost so far. Stopped playing when I died after a half hour without a save point.", rating: 8 },
    { name: "Portal 2", desc: "Played on Switch. Fun puzzle game. Unfortunately buggy and crashed a few times. A little motion-sickness inducing.", rating: 7 },
    { name: "Clair Obscur: Expedition 33", desc: "Wonderful, deep RPG with obvious influences from early 2000s RPGs. Some rough edges but nothing that brings down the incredible experience. Great story, dialogue, pacing, graphics, music, and gameplay.", rating: 10 },
    { name: "Mario Kart World", desc: "Great launch game for Switch 2. Going to become a staple for the next decade. At first, not sure about traveling between courses. Over time, more and more refreshing. One of the best soundtracks I've heard in a long time.", rating: 9 },
    { name: "Switch 2 Welcome Tour", desc: "Love the quirky and strange Nintendo that comes through. Enjoyed the quizzes, demos, and info more than the games included. Felt like an engineer's dream.", rating: 6 },
    { name: "Cobalt Core", desc: "Surprisingly addicting roguelike game. Feels like a mashup of Slay the Spire and FTL. Love how customizable the gameplay styles are.", rating: 9 },
    { name: "Donkey Kong Bananza", desc: "An excellent 3D adventure game that hooks me with the just one more thing feeling. Always something around the corner. Satisfying digging and platforming mechanics.", rating: 8 },
    { name: "UFO 50", desc: "Finally released on Switch. Have been playing one game at a time and soaking in each experience. Love the lore and backstory behind the games.", rating: 9 },
    { name: "Ticket to Ride", desc: "Bought on Switch on sale. Fun to hop into online games. A quick round of a board game I love but hate setting up.", rating: 7 },
    { name: "Subway Builder", desc: "One of the first games I've played this early in development. Fun to mess around but less of a game and more of a sandbox. Exciting to see what updates come.", rating: 5 },
    { name: "Date Everything!", desc: "Played for VGPT. Some funny moments but overall a little meme-y for me. Gameplay itself is non-existent.", rating: 4 },
    { name: "Ghost of Yotei", desc: "Prestige gaming from the opening scene. Strong main character that I was attached to more quickly than Jin.", rating: 9 },
    { name: "Japanese Rural Life", desc: "Started as a time-waster on a flight, made the hours melt away. Great mix of crafting, farming, and relationships. Great pixel art style.", rating: 8 },
    { name: "Kirby Air Riders", desc: "Bursting with character. Fun and nostalgic throwback to the gamecube original. Packed with content.", rating: 8 },
    { name: "Dispatch", desc: "Played for VGPT. A fun choice-based narrative game. Well acted and genuinely funny at times. Choices felt impactful. Strategy aspect was fun but felt a little guess-y. Good length.", rating: 7 },
    { name: "Shovel Knight: King of Cards", desc: "Bought after some concerning news about Yacht Club games. Immediately hooked back into tight platforming. New mobility instantly clicks.", rating: 8 },
    { name: "Monster Train", desc: "Played on Apple Arcade. Felt like a better version of Slay the Spire. More information on how actions would play out, and more variety in characters.", rating: 8 },
  ],
};

export default function GamingTimeline() {
  const [selectedGame, setSelectedGame] = useState(null);
  const [hoveredGame, setHoveredGame] = useState(null);
  
  const years = Object.keys(gamesData).sort((a, b) => b - a);
  
  const getPosition = (rating) => {
    const min = 3;
    const max = 10;
    const normalized = (rating - min) / (max - min);
    return 5 + normalized * 90;
  };
  
  const getColor = (rating) => {
    if (rating >= 9) return 'bg-emerald-500';
    if (rating >= 7) return 'bg-blue-500';
    if (rating >= 5) return 'bg-amber-500';
    return 'bg-red-400';
  };
  
  const getBorderColor = (rating) => {
    if (rating >= 9) return 'border-emerald-400';
    if (rating >= 7) return 'border-blue-400';
    if (rating >= 5) return 'border-amber-400';
    return 'border-red-300';
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-2">Gaming Timeline</h1>
        <p className="text-center text-gray-400 mb-4 text-sm">
          ← Liked Less | Liked More →
        </p>
        
        <div className="flex justify-center gap-4 mb-6 text-xs">
          <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-400"></span> Disliked (3-4)</div>
          <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-500"></span> Mixed (5-6)</div>
          <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-500"></span> Liked (7-8)</div>
          <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-emerald-500"></span> Loved (9-10)</div>
        </div>
        
        <div className="relative">
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-700 -translate-x-1/2"></div>
          
          {years.map(year => (
            <div key={year} className="mb-8">
              <div className="sticky top-0 z-10 bg-gray-900/95 py-2 border-b border-gray-700 mb-4">
                <h2 className="text-xl font-bold text-center text-purple-400">{year}</h2>
              </div>
              
              <div className="flex flex-col gap-1">
                {[...gamesData[year]].reverse().map((game, idx) => {
                  const left = getPosition(game.rating);
                  const isSelected = selectedGame?.name === game.name && selectedGame?.year === year;
                  const isHovered = hoveredGame?.name === game.name && hoveredGame?.year === year;

                  return (
                    <div
                      key={`${year}-${idx}`}
                      className="relative h-7"
                    >
                      <button
                        onClick={() => setSelectedGame(isSelected ? null : { ...game, year })}
                        onMouseEnter={() => setHoveredGame({ ...game, year })}
                        onMouseLeave={() => setHoveredGame(null)}
                        className={`absolute px-2 py-1 rounded text-xs font-medium transition-all border-2 ${getColor(game.rating)} ${getBorderColor(game.rating)}
                          ${isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900 scale-110 z-20' : ''}
                          ${isHovered ? 'scale-105 brightness-110 z-10' : ''}
                          hover:brightness-110 text-white shadow-lg whitespace-nowrap`}
                        style={{
                          left: `${left}%`,
                          transform: 'translateX(-50%)',
                        }}
                      >
                        {game.name.length > 25 ? game.name.substring(0, 23) + '...' : game.name}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        
        {selectedGame && (
          <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-600 p-4 shadow-2xl max-h-64 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-xl font-bold">{selectedGame.name}</h3>
                  <p className="text-gray-400">{selectedGame.year}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${getColor(selectedGame.rating)}`}>
                    {selectedGame.rating}/10
                  </span>
                  <button 
                    onClick={() => setSelectedGame(null)}
                    className="text-gray-400 hover:text-white text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>
              <p className="text-gray-300 leading-relaxed">
                {selectedGame.desc || "No detailed notes for this game."}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
