
const startButton = document.getElementById('startButton');
const quitButton = document.getElementById('quitButton');
const outputDiv = document.getElementById('output');
const responseDiv = document.getElementById('response');

let conversationHistory = [];
let recognitionActive = true;

const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition || window.mozSpeechRecognition || window.msSpeechRecognition)();
recognition.lang = 'ar-SA'; 

recognition.onstart = () => {
    startButton.textContent = 'جاري الاستماع...'; 
};

recognition.onresult = async (event) => {
    const transcript = event.results[0][0].transcript;
    outputDiv.textContent = transcript;

    // Add user's message to conversation history
    conversationHistory.push({ role: "user", content: transcript });

    // Process Text with OpenAI API
    const openAiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ADD-YOUR-API-KEY-HERE 
        }, // MAKE SURE TO REPLACE THIS WITH YOUR API KEY
        body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: conversationHistory,
            max_tokens: 150
        })
    });

    const openAiData = await openAiResponse.json();
    const aiText = openAiData.choices[0].message.content.trim();
    responseDiv.textContent = aiText;

    conversationHistory.push({ role: "assistant", content: aiText });

    // Text to Speech
    const utterance = new SpeechSynthesisUtterance(aiText);
    utterance.lang = 'ar-SA'; 
    const arabicVoice = getArabicVoice();
    if (arabicVoice) {
        utterance.voice = arabicVoice;
    }
    speechSynthesis.speak(utterance);

    // Restart recognition after speech synthesis ends if still active
    utterance.onend = () => {
        if (recognitionActive) {
            recognition.start();
        }
    };
};

recognition.onend = () => {
    if (recognitionActive) {
        startButton.textContent = 'ابدأ التحدث'; 
    }
};

startButton.addEventListener('click', () => {
    recognitionActive = true;
    recognition.start();
});

quitButton.addEventListener('click', () => {
    recognitionActive = false;
    recognition.stop();
    startButton.textContent = 'ابدأ التحدث'; // Reset the start button text
});

function getArabicVoice() {
    const voices = window.speechSynthesis.getVoices();
    return voices.find(voice => voice.lang === 'ar-SA'); 
}

window.speechSynthesis.onvoiceschanged = () => {
    console.log('Voices loaded');
};
