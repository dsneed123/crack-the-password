import React, { useState, useEffect, useRef } from ‘react’;
import { Lock, RotateCcw, Lightbulb, Trophy, CheckCircle, XCircle, AlertCircle } from ‘lucide-react’;

const PasswordCracker = () => {
const [secretCode, setSecretCode] = useState(’’);
const [currentGuess, setCurrentGuess] = useState([’’, ‘’, ‘’]);
const [guesses, setGuesses] = useState([]);
const [gameWon, setGameWon] = useState(false);
const [showHint, setShowHint] = useState(false);
const [isSubmitting, setIsSubmitting] = useState(false);
const inputRefs = useRef([]);

// Generate a random 3-digit code with unique digits
const generateSecretCode = () => {
const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const code = [];

```
for (let i = 0; i < 3; i++) {
const randomIndex = Math.floor(Math.random() * digits.length);
code.push(digits[randomIndex]);
digits.splice(randomIndex, 1);
}

return code.join('');
```

};

// Initialize game
useEffect(() => {
setSecretCode(generateSecretCode());
}, []);

// Focus first input on game start/reset
useEffect(() => {
if (!gameWon && inputRefs.current[0]) {
inputRefs.current[0].focus();
}
}, [gameWon, guesses.length]);

// Generate feedback for a guess
const generateFeedback = (guess, secret) => {
const guessDigits = guess.split(’’);
const secretDigits = secret.split(’’);

```
let correctPosition = 0;
let correctDigitWrongPosition = 0;

// Count correct positions
for (let i = 0; i < 3; i++) {
if (guessDigits[i] === secretDigits[i]) {
correctPosition++;
}
}

// Count correct digits in wrong positions
const secretCopy = [...secretDigits];
const guessCopy = [...guessDigits];

// Remove correctly positioned digits
for (let i = 2; i >= 0; i--) {
if (guessDigits[i] === secretDigits[i]) {
secretCopy.splice(i, 1);
guessCopy.splice(i, 1);
}
}

// Count remaining matches
for (let digit of guessCopy) {
const index = secretCopy.indexOf(digit);
if (index !== -1) {
correctDigitWrongPosition++;
secretCopy.splice(index, 1);
}
}

return { correctPosition, correctDigitWrongPosition };
```

};

const getFeedbackText = (correctPosition, correctDigitWrongPosition) => {
if (correctPosition === 3) {
return “Perfect! You cracked the code!”;
} else if (correctPosition === 0 && correctDigitWrongPosition === 0) {
return “Nothing is correct”;
} else if (correctPosition === 1 && correctDigitWrongPosition === 0) {
return “One number is correct and well placed”;
} else if (correctPosition === 0 && correctDigitWrongPosition === 1) {
return “One number is correct but wrongly placed”;
} else if (correctPosition === 0 && correctDigitWrongPosition === 2) {
return “Two numbers are correct but wrongly placed”;
} else if (correctPosition === 0 && correctDigitWrongPosition === 3) {
return “All numbers are correct but wrongly placed”;
} else if (correctPosition === 1 && correctDigitWrongPosition === 1) {
return “One correct & well placed, one correct but wrong position”;
} else if (correctPosition === 1 && correctDigitWrongPosition === 2) {
return “One correct & well placed, two correct but wrong positions”;
} else if (correctPosition === 2 && correctDigitWrongPosition === 0) {
return “Two numbers are correct and well placed”;
} else if (correctPosition === 2 && correctDigitWrongPosition === 1) {
return “Two correct & well placed, one correct but wrong position”;
}
return “Invalid feedback state”;
};

const handleInputChange = (index, value) => {
if (!/^\d?$/.test(value)) return;

```
const newGuess = [...currentGuess];
newGuess[index] = value;
setCurrentGuess(newGuess);

// Auto-focus next input
if (value && index < 2) {
inputRefs.current[index + 1]?.focus();
}
```

};

const handleKeyDown = (e, index) => {
if (e.key === ‘Backspace’ && !currentGuess[index] && index > 0) {
inputRefs.current[index - 1]?.focus();
}
if (e.key === ‘Enter’ && currentGuess.every(digit => digit !== ‘’)) {
handleSubmitGuess();
}
};

const handleSubmitGuess = async () => {
const guess = currentGuess.join(’’);
if (guess.length !== 3) return;

```
// Check for duplicate digits
const uniqueDigits = new Set(guess);
if (uniqueDigits.size !== 3) {
alert('Each digit must be unique!');
return;
}

setIsSubmitting(true);

// Small delay for better UX feedback
await new Promise(resolve => setTimeout(resolve, 300));

const feedback = generateFeedback(guess, secretCode);
const feedbackText = getFeedbackText(feedback.correctPosition, feedback.correctDigitWrongPosition);

const newGuess = {
guess: guess,
feedback: feedbackText,
correctPosition: feedback.correctPosition,
correctDigitWrongPosition: feedback.correctDigitWrongPosition
};

setGuesses([...guesses, newGuess]);

if (guess === secretCode) {
setGameWon(true);
} else {
setCurrentGuess(['', '', '']);
}

setIsSubmitting(false);
```

};

const resetGame = () => {
setSecretCode(generateSecretCode());
setCurrentGuess([’’, ‘’, ‘’]);
setGuesses([]);
setGameWon(false);
setShowHint(false);
};

const generateHint = () => {
if (guesses.length === 0) return “Enter your first guess to get started!”;

```
const excludedDigits = new Set();
const includedDigits = new Set();

guesses.forEach(({ guess, correctPosition, correctDigitWrongPosition }) => {
if (correctPosition === 0 && correctDigitWrongPosition === 0) {
guess.split('').forEach(digit => excludedDigits.add(digit));
} else if (correctPosition > 0 || correctDigitWrongPosition > 0) {
guess.split('').forEach(digit => {
if (!excludedDigits.has(digit)) {
includedDigits.add(digit);
}
});
}
});

let hints = [];
if (excludedDigits.size > 0) {
hints.push(`❌ Not in code: ${Array.from(excludedDigits).sort().join(', ')}`);
}
if (includedDigits.size > 0) {
hints.push(`✅ In the code: ${Array.from(includedDigits).sort().join(', ')}`);
}
if (hints.length === 0) {
hints.push("🤔 Try different combinations!");
}

return hints.join('\n');
```

};

const getGuessIcon = (correctPosition, correctDigitWrongPosition) => {
if (correctPosition === 3) return <CheckCircle className="w-5 h-5 text-green-500" />;
if (correctPosition === 0 && correctDigitWrongPosition === 0) return <XCircle className="w-5 h-5 text-red-500" />;
return <AlertCircle className="w-5 h-5 text-orange-500" />;
};

const isValidGuess = currentGuess.every(digit => digit !== ‘’) && new Set(currentGuess).size === 3;

return (
<div className="min-h-screen bg-slate-50 py-8 px-4">
<div className="max-w-lg mx-auto">

```
{/* Header */}
<div className="text-center mb-8">
<div className="inline-flex items-center gap-3 mb-3">
<div className="p-2 bg-blue-100 rounded-lg">
<Lock className="w-6 h-6 text-blue-600" />
</div>
<h1 className="text-2xl font-bold text-slate-800">Code Breaker</h1>
</div>
<p className="text-slate-600">Crack the 3-digit code with unique numbers</p>

{!gameWon && guesses.length > 0 && (
<div className="mt-4 inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm border">
<div className="w-2 h-2 bg-blue-500 rounded-full"></div>
<span className="text-sm font-medium text-slate-700">Attempt {guesses.length + 1}</span>
</div>
)}
</div>

{/* Main Game Card */}
<div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

{/* Input Section */}
{!gameWon && (
<div className="p-6 border-b border-slate-100">
<div className="space-y-4">
<div className="flex justify-center gap-3">
{[0, 1, 2].map(i => (
<input
key={i}
ref={el => inputRefs.current[i] = el}
type="text"
inputMode="numeric"
maxLength="1"
value={currentGuess[i]}
onChange={(e) => handleInputChange(i, e.target.value)}
onKeyDown={(e) => handleKeyDown(e, i)}
className="w-16 h-16 text-center text-2xl font-bold border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors bg-slate-50 focus:bg-white"
disabled={isSubmitting}
/>
))}
</div>

<div className="flex flex-col gap-3">
<button
onClick={handleSubmitGuess}
disabled={!isValidGuess || isSubmitting}
className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
>
{isSubmitting ? (
<>
<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
Checking...
</>
) : (
'Submit Guess'
)}
</button>

<div className="flex gap-2">
<button
onClick={() => setShowHint(!showHint)}
className="flex-1 py-2.5 bg-amber-100 text-amber-700 rounded-lg font-medium hover:bg-amber-200 transition-colors flex items-center justify-center gap-2"
>
<Lightbulb className="w-4 h-4" />
{showHint ? 'Hide' : 'Hint'}
</button>

<button
onClick={resetGame}
className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
>
<RotateCcw className="w-4 h-4" />
New Game
</button>
</div>
</div>
</div>
</div>
)}

{/* Hint Section */}
{showHint && !gameWon && (
<div className="p-4 bg-amber-50 border-b border-amber-100">
<div className="flex items-start gap-3">
<Lightbulb className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
<div>
<div className="font-medium text-amber-800 mb-1">Smart Hint</div>
<pre className="text-sm text-amber-700 whitespace-pre-wrap leading-relaxed">{generateHint()}</pre>
</div>
</div>
</div>
)}

{/* Victory Section */}
{gameWon && (
<div className="p-6 bg-green-50 border-b border-green-100">
<div className="text-center space-y-4">
<div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
<Trophy className="w-8 h-8 text-green-600" />
</div>
<div>
<h2 className="text-xl font-bold text-green-800 mb-1">Success!</h2>
<p className="text-green-700">
Code <span className="font-mono font-bold text-lg">{secretCode}</span> cracked in {guesses.length} {guesses.length === 1 ? 'attempt' : 'attempts'}
</p>
</div>
<button
onClick={resetGame}
className="px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors"
>
Play Again
</button>
</div>
</div>
)}

{/* Guess History */}
{guesses.length > 0 && (
<div className="p-6">
<h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
<div className="w-2 h-2 bg-slate-400 rounded-full"></div>
Previous Attempts
</h3>
<div className="space-y-3 max-h-64 overflow-y-auto">
{guesses.map((entry, index) => (
<div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
<div className="flex items-center gap-3">
<span className="text-xs font-medium text-slate-500 bg-white px-2 py-1 rounded-md min-w-[2rem] text-center">
{index + 1}
</span>
<div className="flex gap-1">
{entry.guess.split('').map((digit, i) => (
<div key={i} className="w-8 h-8 bg-white border border-slate-200 rounded-md flex items-center justify-center text-sm font-bold text-slate-800">
{digit}
</div>
))}
</div>
</div>
<div className="flex items-center gap-2">
{getGuessIcon(entry.correctPosition, entry.correctDigitWrongPosition)}
<span className="text-sm text-slate-600 text-right max-w-[140px]">
{entry.feedback}
</span>
</div>
</div>
))}
</div>
</div>
)}

{/* Instructions */}
<div className="p-6 bg-slate-50 border-t border-slate-100">
<div className="text-sm text-slate-600 space-y-2">
<div className="font-medium text-slate-700 mb-2">How to play:</div>
<div className="grid grid-cols-1 gap-1">
<div>• Enter 3 unique digits (0-9)</div>
<div>• Use clues to find the secret code</div>
<div>• Press Enter or click Submit</div>
</div>
</div>
</div>
</div>
</div>
</div>
```

);
};

export default PasswordCracker;