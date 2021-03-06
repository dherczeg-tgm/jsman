var DEBUGMODE = 0;

// The div ids to use for the different sections the game needs.
// you can change these if you use your own html/css
var GAMEWINDOWDIV = "gamewindow";
var BUTTONAREADIV = "buttonarea";
var GUESSAREADIV = "guessarea";
var HANGMANAREADIV = "hangmanarea";

var HANGMANWINDOW = document.getElementById(HANGMANAREADIV); // The div to display the hangman imgs in
var GAMEWINDOW = document.getElementById(GAMEWINDOWDIV); // The div to display the game in

var ALPHABET_LENGTH = 26; // Length of the alphabet to use for the game
var ALPHABET_STARTVALUE_ASCII = 65; // ASCII code for uppercase A

var BUTTONS = []; // The array that will hold the buttons with each character displayed on them
var BUTTONROWS = 2; // Display the guess buttons in 2 seperate rows

var WORDS = ["hallo welt", "baum", "laptop", "ferNseHER", "simpsons", "eiche", "fisch", "golfball", "jagdhuette", "smartphone", "ponyhof", "reitstiefel"];
var CURRENTWORD = ""; // The word, the user has to guess in this round of the game
var CURRENTGUESS = []; // Array of table cells which hold a single character each, display purposes only

var HANGMANSTATE = 0; // This state describes how many mistakes a user has made.
var MAXHANGMANSTATE = 6; // this value determines, how many tries a user has, before he loses the game, default = 5
var HANGMANIMAGES = ["./img/hang_1.gif", "./img/hang_2.gif", "./img/hang_3.gif", "./img/hang_4.gif", "./img/hang_5.gif", "./img/hang_6.gif", "./img/hang_7.gif"];

var GAMESTATE = 1; // 0 = lost, 1 = running, 2 = won, 3 = ended

/**
*
* Creates a new Array with the buttons containing the defined alphabet
* and returns it.
*
**/
function createButtonArray()
{
	var createdButtons = [];
	
	for(var i=0; i < ALPHABET_LENGTH; i++)
	{
		// Create the button-element and it's label in different steps
		var currentChar = String.fromCharCode(ALPHABET_STARTVALUE_ASCII + i);
		var currentButton = document.createElement("BUTTON");
		var currentButtonText = document.createTextNode(currentChar);
		
		// Set the button's class name, so we can style the buttons in the css
		currentButton.className = "gamebutton";
		currentButton.value = currentChar;
		// Set the button's onclick method, so the user can interact with the game
		currentButton.addEventListener("click", buttonPressedHandler);
		
		// Assign label to button
		currentButton.appendChild(currentButtonText);
		createdButtons.push(currentButton);
	}
	
	return createdButtons;
}

/**
*
* Adds the buttons contained in the given array to the
* HTML-Document and renders it in the user's webbrowser
* inside the given div, with the globally set BUTTONROWS variable
*
* @param {array} buttonArray The Array that contains the buttons to be rendered
* @param {string} divToRender The buttons will be rendered into a div with this name
*
**/
function renderButtonsFromArray(buttonArray, divToRender)
{
	// Create a table to hold the button rows in.
	var realDiv = document.getElementById(divToRender);
	var renderTable = document.createElement("table");
	renderTable.className = "buttonrendertable";
	
	if(buttonArray.length == 0)
		alert("Cant't render an empty array!")
	
	if(realDiv != null)
	{
		// If the given div is present in the document, check if
		// the number of buttons given can be divided nicely by
		// the number of rows given.
		if(buttonArray.length % BUTTONROWS == 0)
		{
			var buttonRowPointer = 0;
			var buttonsPerRow = (buttonArray.length)/BUTTONROWS;
			
			for(var i=0; i < BUTTONROWS; i++)
			{
				var buttonRow = document.createElement("tr");
				buttonRow.className = "buttonrenderrow";
				
				// Iterate through the number of buttons per row in each row
				// and give each button it's own cell in the table
				for(var u=0; u < buttonsPerRow; u++)
				{
					var buttonCell = document.createElement("td");
					buttonCell.className = "buttonrendercell";
					
					buttonCell.appendChild(buttonArray[buttonRowPointer*buttonsPerRow+u]);
					buttonRow.appendChild(buttonCell);
				}
				
				// append each row to the table
				renderTable.appendChild(buttonRow);
				buttonRowPointer++;
			}
		}
		else
			alert("The number of buttons given in the array can't be divided by the number\nof button rows set in the global variable!");
		
		realDiv.appendChild(renderTable);
	}
	else
		alert("The div, given for rendering the buttons in, doesn't exist in the document!\nDiv given: "+divToRender);
}

/**
*
* Searches character in word and returns the positions
* of the occurences in the string.
*
* @param {char} character the char to look after
* @param {string} word the word to search in
*
* @returns a numeric value, that tells us where the characters were found in word
*
**/
function findCharacterInWord(character, word)
{
	var charPositions = [];
	
	for(var i=0; i < word.length; i++)
	{
		// alternative: indexOf-Method
		// http://www.w3schools.com/jsref/jsref_indexof.asp
		// But this method is easier, might be slower:
		if(word[i] == character)
			charPositions.push(i);
	}
	
	return charPositions;
}

/**
*
* Returns a random item of the given array.
*
* @param {array} wordArray The array to return the random value from
*
**/
function getWord(wordArray)
{
	if(wordArray.length > 0)
	{
		// calculate a random number and multiplay it by the
		// length of available words. note that random does never
		// return a value larger than 0.99, so no +1 or -1 is needed,
		// because the index can never reach more than the length of
		// the words array due to the floor, and 0 is a perfectly fine
		// value when dealing with arrays.
		// http://www.w3schools.com/jsref/jsref_random.asp
		var index = Math.floor((Math.random() * wordArray.length));
	
		return wordArray[index];
	}
	else
		alert("Could not select a word from the array, because the array given is empty!")
}

/**
*
* Displays a guess in the guess section of the game window.
* A guess is displayed as dashes when the player hasn't guessed
* a correct char of the given word yet and displays the character
* on the correct position if the user has already guessed a correct char.
*
* @param {string} word the word to display
* @param {string} divToRender the id of the div to render the guess in
*
**/
function renderNewWord(word, divToRender)
{
	var realDiv = document.getElementById(divToRender);
	
	if(realDiv != null)
	{
		CURRENTWORD = word.toUpperCase();
		
		var wordTable = document.createElement("table");
		var wordTableRow = document.createElement("tr");
		
		wordTable.className = "guessrendertable";
		wordTableRow.className = "guessrenderrow";
		
		for(var i=0; i < CURRENTWORD.length; i++)
		{
			var currentCharCell = document.createElement("td");
			
			currentCharCell.className = "guessrendercell";
			
			if(CURRENTWORD[i]!=' ')
				currentCharCell.innerHTML = "_";
			else
				currentCharCell.innerHTML = " ";
			
			CURRENTGUESS.push(currentCharCell);
			
			wordTableRow.appendChild(currentCharCell);
		}
		
		wordTable.appendChild(wordTableRow);
		realDiv.appendChild(wordTable);
		
		if(DEBUGMODE == 1)
			console.log(CURRENTWORD);
	}
	else
		alert("The div, given for rendering the word in, doesn't exist in the document!\nDiv given: "+divToRender);
}

/**
*
* Checks if the player has won or lost a game.
*
**/
function checkGameState()
{
	if(HANGMANSTATE==MAXHANGMANSTATE)
	{
		if(confirm("You lost!\nThe correct word was: " + CURRENTWORD+"\n\nDo you want to play again?"))
			restartGame();
		else
			// Set the gamestate, because a user might click no on the dialog box
			// so if he returns to the game, he can't click any more buttons.
			GAMESTATE = 0;
	}
	else
	{
		for(var i=0; i < CURRENTGUESS.length; i++)
		{
			if(CURRENTGUESS[i].innerHTML == "_")
				return;
		}
		
		if(confirm("You won!\nDo you want to play again?"))
			restartGame();
		else
			GAMESTATE = 2;
	}
}

/**
*
* Handles mouse click inputs made by the user.
* works as the game loop method.
*
**/
function buttonPressedHandler(mouseClickEvent)
{
	if(GAMESTATE == 1)
	{
		var clickedButton = mouseClickEvent.target;
		var clickedChar = clickedButton.value;
		
		// Check if the character, selected by the user, is in the word he tries to guess
		var characterPositions = findCharacterInWord(clickedChar, CURRENTWORD);
	
		if(DEBUGMODE == 1)
			alert(characterPositions);
	
		if(characterPositions.length > 0)
		{
			for(var i=0; i < characterPositions.length; i++)
			{
				CURRENTGUESS[characterPositions[i]].innerHTML = clickedChar;
			}
		}
		else
		{
			HANGMANSTATE++;
			HANGMANWINDOW.innerHTML = '<img src="' + HANGMANIMAGES[HANGMANSTATE] + '">';
		}

		clickedButton.disabled = true;
		
		checkGameState();
	}
}

/**
*
* Looks for a button with the given value in the global
* BUTTONS array.
*
* @param {string} value the value to look for
* 
* @returns the button with the value or null if the button was not found or if it is disabled.
**/
function getButtonByValue(value)
{
	for(var i=0; i < BUTTONS.length; i++)
	{
		if(BUTTONS[i].value == value && !(BUTTONS[i].diasbled))
			return BUTTONS[i];
	}
	
	return null;
}

/**
*
* This method handles keyboard input. it 'clicks' the corresponding
* button (displayed on the screen) for the user.
*
**/
function keyboardInputHandler(keyPressEvent)
{
	// Get the char of the pressed key on the keyboard and
	// make it uppercase, so there are no misunderstandings
	// when looking for the corresponding button later (a or A???)
	var pressedKeyChar = (String.fromCharCode(keyPressEvent.which)).toUpperCase();
	var buttonOnScreen = getButtonByValue(pressedKeyChar);
	
	// If a button with this char was found (which is not disabled)
	// fire the button clicked event
	if(buttonOnScreen != null)
		buttonOnScreen.click();
}

/**
*
* Restarts the game by reloading the page.
*
**/
function restartGame()
{
	location.reload(true);
}

/**
*
* Starts a game. This is the "main-method" of this script,
* so don't forget to call this method from your html!
*
**/
function startGame()
{
	if(GAMEWINDOW != null)
	{
		BUTTONS = createButtonArray();
		
		renderButtonsFromArray(BUTTONS, BUTTONAREADIV);
		renderNewWord(getWord(WORDS), GUESSAREADIV);
		
		document.addEventListener("keydown", keyboardInputHandler);
		
		// Display the first image, so there is always one visible
		HANGMANWINDOW.innerHTML = '<img src="' + HANGMANIMAGES[HANGMANSTATE] + '">';
	}
	else
	{
		alert("Could not initialize the gamewindow div!");
	}
}