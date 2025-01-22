// utils/nonStopWords.ts

const stopWords: Set<string> = new Set([
  "a", "about", "above", "across", "after", "afterwards", "again", "against", 
  "all", "almost", "alone", "along", "already", "also", "although", "always", 
  "am", "among", "amongst", "amoungst", "amount", "an", "and", "another", 
  "any", "anyhow", "anyone", "anything", "anyway", "anywhere", "are", "around", 
  "as", "at", "back", "be", "became", "because", "become", "becomes", 
  "becoming", "been", "before", "beforehand", "behind", "being", "below", 
  "beside", "besides", "between", "beyond", "bill", "both", "bottom", "but", 
  "by", "call", "can", "cannot", "cant", "co", "con", "could", "couldnt", 
  "cry", "de", "describe", "detail", "do", "done", "down", "due", "during", 
  "each", "eg", "eight", "either", "eleven", "else", "elsewhere", "empty", 
  "enough", "etc", "even", "ever", "every", "everyone", "everything", 
  "everywhere", "except", "few", "fifteen", "fifty", "fill", "find", "fire", 
  "first", "five", "for", "former", "formerly", "forty", "found", "four", 
  "from", "front", "full", "further", "get", "give", "go", "had", "has", 
  "hasnt", "have", "he", "hence", "her", "here", "hereafter", "hereby", 
  "herein", "hereupon", "hers", "herself", "him", "himself", "his", "how", 
  "however", "hundred", "i", "ie", "if", "in", "inc", "indeed", "interest", 
  "into", "is", "it", "its", "itself", "keep", "last", "latter", "latterly", 
  "least", "less", "ltd", "made", "many", "may", "me", "meanwhile", "might", 
  "mill", "mine", "more", "moreover", "most", "mostly", "move", "much", "must", 
  "my", "myself", "name", "namely", "neither", "never", "nevertheless", "next", 
  "nine", "no", "nobody", "none", "noone", "nor", "not", "nothing", "now", 
  "nowhere", "of", "off", "often", "on", "once", "one", "only", "onto", "or", 
  "other", "others", "otherwise", "our", "ours", "ourselves", "out", "over", 
  "own", "part", "per", "perhaps", "please", "put", "rather", "re", "really", 
  "regarding", "same", "say", "see", "seem", "seemed", "seeming", "seems", 
  "serious", "several", "she", "should", "show", "side", "since", "sincere", 
  "six", "sixty", "so", "some", "somehow", "someone", "something", "sometime", 
  "sometimes", "somewhere", "still", "such", "system", "take", "ten", "than", 
  "that", "the", "their", "them", "themselves", "then", "thence", "there", 
  "thereafter", "thereby", "therefore", "therein", "thereupon", "these", 
  "they", "thick", "thin", "third", "this", "those", "though", "three", 
  "through", "throughout", "thru", "thus", "to", "together", "too", "top", 
  "toward", "towards", "twelve", "twenty", "two", "un", "under", "until", "up", 
  "upon", "us", "very", "via", "was", "we", "well", "were", "what", "whatever", 
  "when", "whence", "whenever", "where", "whereafter", "whereas", "whereby", 
  "wherein", "whereupon", "wherever", "whether", "which", "while", "whither", 
  "who", "whoever", "whole", "whom", "whose", "why", "will", "with", "within", 
  "without", "would", "yet", "you", "your", "yours", "yourself", "yourselves",

  "youre", "youve", "youll", "thats", "thatll", "theres", "theres", "theyre", "theyve",
  "didnt", "doesnt", "dont", "hadnt", "hasnt", "havent",

  // 100 common nouns
  "dog", "cat", "house", "tree", "car", "city", "book", "movie", "computer", "phone", 
  "food", "person", "friend", "family", "child", "school", "student", "teacher", "government", "country", 
  "company", "job", "work", "health", "idea", "problem", "solution", "event", "week", "month", 
  "year", "business", "market", "language", "place", "household", "love", "opportunity", "dream", 
  "feeling", "personality", "adventure", "action", "decision", "issue", "value", "team", "role", 
  "plan", "success", "failure", "reason", "journey", "story", "information", "data", "history", 
  "culture", "method", "knowledge", "research", "education", "question", "answer", "product", 
  "service", "topic", "content", "result", "effort", "exercise", "growth", "action", "thought", 
  "process", "problem", "idea", "solution", "answer", "discussion", "result", "presentation", 
  "teamwork", "effort", "moment", "chance", "step", "strategy", "performance", "time", "effort", 
  "goal", "approach", "discovery", "study", "productivity", "decision", "attempt", "debate", 
  "conference", "debate", "argument", "perspective", "strategy", "mindset", "leadership", 
  "project", "vision", "innovation", "management", "understanding", "risk", "value", "contribution", 
  "progress", "trend", "impact", "effect", "success", "failure", "outcome", "benefit", 
  "opinion", "discussion", "assessment", "feedback", "organization",

  // 100 common adjectives
  "happy", "good", "big", "small", "new", "old", "young", "bright", "dark", "strong", 
  "weak", "high", "low", "long", "short", "fast", "slow", "hard", "soft", "friendly", 
  "kind", "nice", "beautiful", "ugly", "rich", "poor", "hot", "cold", "warm", "cool", 
  "clean", "dirty", "clear", "cloudy", "wet", "dry", "rich", "poor", "high", "low", 
  "smart", "stupid", "honest", "dishonest", "brave", "cowardly", "funny", "serious", 
  "gentle", "rough", "calm", "angry", "loud", "quiet", "lazy", "hardworking", "tall", 
  "short", "fat", "thin", "heavy", "light", "safe", "dangerous", "useful", "useless", 
  "beautiful", "handsome", "ugly", "modern", "ancient", "unique", "ordinary", "beautiful", 
  "boring", "exciting", "interesting", "beautiful", "polite", "rude", "sensitive", "insensitive", 
  "fun", "sad", "happy", "angry", "silly", "serious", "honorable", "disrespectful", "loyal", 
  "unfaithful", "optimistic", "pessimistic", "important", "insignificant", "popular", "unpopular", 
  "lucky", "unlucky", "comfortable", "uncomfortable", "famous", "unknown", "successful", 
  "unsuccessful", "healthy", "unhealthy", "interesting", "boring", "beautiful", "ugly",

  // 100 common verbs
  "run", "walk", "eat", "drink", "sleep", "think", "speak", "read", "write", "listen", 
  "talk", "see", "hear", "feel", "touch", "learn", "teach", "study", "help", "work", 
  "play", "build", "create", "destroy", "make", "take", "give", "receive", "send", 
  "bring", "carry", "move", "stop", "start", "finish", "begin", "end", "stay", "go", 
  "arrive", "leave", "travel", "ask", "answer", "call", "respond", "shout", "whisper", 
  "sing", "dance", "jump", "climb", "sit", "stand", "lie", "grow", "cut", "tear", 
  "push", "pull", "open", "close", "lock", "unlock", "watch", "observe", "find", "lose", 
  "search", "discover", "hide", "show", "enjoy", "love", "hate", "like", "dislike", 
  "believe", "doubt", "understand", "remember", "forget", "forgive", "apologize", "invite", 
  "accept", "refuse", "promise", "deny", "agree", "disagree", "argue", "fight", "win", 
  "lose", "help", "support", "assist", "join", "leave", "participate", "create", "organize", 
  "manage", "lead", "follow", "compete", "improve", "develop", "change", "adapt", 
  "share", "distribute", "borrow", "lend", "pay", "receive", "count", "measure", 
  "teach", "train", "motivate", "encourage", "criticize", "judge", "evaluate", "analyze"
]);

function extractVisibleTextFromHTML(htmlString: string) {
  const tempDiv = document.createElement("div");
  // Replace <br> and similar tags with spaces
  const normalizedHtml = htmlString.replace(/<br\s*\/?>/gi, '\n')
  .replace(/<\/?(p|div|h[1-6]|blockquote|li|section|article|aside|header|footer|nav)>/gi, '\n'); // Add newline for block elements

  tempDiv.innerHTML = normalizedHtml;
  // console.log(htmlString);
  return tempDiv.textContent || "";
}

/**
 * Extracts visible text from an HTML string and filters out stop words.
 * @param htmlString - The input HTML string.
 * @returns An array of non-stop words found in the visible text.
 */
export const getNonStopWords = (htmlString: string): string[] => {
  const textContent = extractVisibleTextFromHTML(htmlString
    .replace(/<a href=".*" class="u-url mention">@<span>.*<\/span><\/a>/g, ' ') // Matches, hides mentions
  )
    // Matches URLs starting with http:// or https://
    .replace(/https?:\/\/[^\s]+/g, ' ');
  // console.log(textContent);

  // Tokenize the text into words
  const words = textContent
    .toLowerCase()
    .match(/(?:#)?[a-z0-9_]+(?:'[a-z]+)?/g) || []; // Matches words, including contractions, and hashtags

  // Remove the apostrophe in contractions
  const cleanedWords = words.map(word => word.replace(/'/g, ''));
  // Filter out stop words and words that are less than 5 letters long
  const filteredWords = cleanedWords.filter((word) => !stopWords.has(word) && word.length >= 5);

  // Use a Set to return only unique words
  return [...new Set(filteredWords)];
};

/**
 * Checks if any of the non-stop words are in the list of muted words.
 * @param nonStopWords - An array of words to check.
 * @param mutedWords - An array of words to mute.
 * @returns True if any non-stop word is in the muted words list; otherwise, false.
 */
export const containsMutedWord = (nonStopWords: string[], mutedWords: string[]): boolean => {
  const mutedWordsSet = new Set(mutedWords); // Convert to set for O(1) lookups
  return nonStopWords.some(word => mutedWordsSet.has(word));
};

/**
 * Returns a list of muted words found in the non-stop words array.
 * @param nonStopWords - An array of words to check.
 * @param mutedWords - An array of words to mute.
 * @returns An array of muted words found in the non-stop words array.
 */
export const getMutedWordsFound = (nonStopWords: string[], mutedWords: string[]): string[] => {
  const mutedWordsSet = new Set(mutedWords); // Convert to set for O(1) lookups
  return nonStopWords.filter(word => mutedWordsSet.has(word));
};