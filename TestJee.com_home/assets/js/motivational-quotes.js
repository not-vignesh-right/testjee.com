// Motivational Quotes System
const motivationalQuotes = [
    "IIT won't crack itself—start studying.",
    "Netflix later, NTA first.",
    "Your calculator misses you.",
    "Sleep is temporary, rank is permanent.",
    "JEE fears consistent students.",
    "One more question, less regret.",
    "Procrastination isn't in the syllabus.",
    "Your phone won't clear JEE.",
    "Rank > Reels.",
    "Study now, meme later.",
    "Physics won't understand itself.",
    "Chemistry remembers those who revise.",
    "Maths loves practice, not excuses.",
    "JEE doesn't care about mood swings.",
    "Coffee helps, concepts decide.",
    "Formula sheet > Cheat sheet.",
    "Hard work has no skip button.",
    "IIT doesn't accept 'almost prepared'.",
    "One mock a day keeps panic away.",
    "Panic less, practice more.",
    "Your future self is watching.",
    "Silly mistakes = expensive mistakes.",
    "Rank improves when excuses disappear.",
    "Top ranks hate procrastinators.",
    "Brain before phone.",
    "JEE checks preparation, not confidence quotes.",
    "Comfort zone isn't exam-friendly.",
    "Less drama, more diagrams.",
    "IIT prefers notebooks over notes apps.",
    "Sleep after revision, not before.",
    "Study like Wi-Fi is down.",
    "Focus mode beats motivation mode.",
    "IIT likes disciplined humans.",
    "Concepts don't ghost—revise them.",
    "No revision = surprise exam.",
    "Laugh later, solve now.",
    "Rank doesn't care about effort stories.",
    "JEE rewards consistency, not mood.",
    "Pro tip: study daily.",
    "Brilliance needs backup practice.",
    "Dreams need deadlines.",
    "One more revision won't hurt.",
    "Study hard, brag later.",
    "IIT isn't impressed by excuses.",
    "Distraction is the real negative marking.",
    "Mocks reveal truth, not ego.",
    "Brain needs training, not motivation.",
    "Less scrolling, more solving.",
    "Study first, overthink later.",
    "Engineers are made, not streamed.",
    "Dream IIT. Work Daily.",
    "Consistency Creates Rank.",
    "Focus Beats Everything.",
    "No Shortcuts. Only Effort.",
    "Study Now. Shine Later.",
    "Discipline Builds Engineers.",
    "Small Steps. Big Rank.",
    "Crack Concepts First.",
    "Pressure Builds Champions.",
    "Effort Never Fails.",
    "Practice Makes Rank.",
    "Master Basics. Win JEE.",
    "Daily Effort Matters.",
    "Revise. Repeat. Rise.",
    "Hard Work Pays.",
    "Trust the Process.",
    "Accuracy Brings Success.",
    "Learn Deep. Rank High.",
    "Focus Is Power.",
    "One Goal. IIT.",
    "Calm Mind. Clear Rank.",
    "Outwork Your Doubts.",
    "Engineers Are Built.",
    "Consistency Over Motivation.",
    "Stay Focused. Stay Strong.",
    "Concepts Create Confidence.",
    "Grind Today. Glory Tomorrow.",
    "Smart Study Wins.",
    "Fail. Learn. Improve.",
    "Your Rank Awaits.",
    "Keep Solving Daily.",
    "Pressure Makes Progress.",
    "मेहनत ही रास्ता।",
    "Practice Beats Fear.",
    "Focus Decides Future.",
    "One Year. One Goal.",
    "Rank Follows Discipline.",
    "Learn More. Fear Less.",
    "Preparation Creates Confidence.",
    "No Excuses. Just Study.",
    "Stay Hungry. Learn More.",
    "Consistent Effort Wins.",
    "Build Concepts Daily.",
    "Revision Is Power.",
    "Study Smart. Score Big.",
    "Strong Basics. Strong Rank.",
    "Believe. Prepare. Achieve.",
    "Effort Creates Opportunity.",
    "One Step Closer.",
    "Today Decides Tomorrow."
];

let lastQuoteIndex = -1;
let quoteElement = null;
let quoteInterval = null;

function initQuoteRotation() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startQuoteRotation);
    } else {
        startQuoteRotation();
    }
}

function startQuoteRotation() {
    quoteElement = document.getElementById('motivationalQuote');
    if (!quoteElement) return;

    // Set initial random quote
    updateQuote();

    // Add click handler to manually change quote
    quoteElement.style.cursor = 'pointer';
    quoteElement.title = 'Click for a new quote';
    quoteElement.addEventListener('click', function () {
        updateQuote();
        // Reset auto-rotation timer
        if (quoteInterval) {
            clearInterval(quoteInterval);
        }
        quoteInterval = setInterval(updateQuote, 5000);
    });

    // Auto-rotate every 5 seconds with random quotes
    quoteInterval = setInterval(updateQuote, 5000);
}

function getRandomQuote() {
    let randomIndex;
    do {
        randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
    } while (randomIndex === lastQuoteIndex && motivationalQuotes.length > 1);

    lastQuoteIndex = randomIndex;
    return motivationalQuotes[randomIndex];
}

function updateQuote() {
    if (!quoteElement) return;

    // Fade out
    quoteElement.style.opacity = '0';

    setTimeout(() => {
        // Update with random quote
        quoteElement.textContent = getRandomQuote();

        // Fade in
        quoteElement.style.opacity = '1';
    }, 300);
}

// Initialize on page load
initQuoteRotation();

// Clean up on page unload
window.addEventListener('beforeunload', () => {
    if (quoteInterval) {
        clearInterval(quoteInterval);
    }
});
