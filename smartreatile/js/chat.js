document.addEventListener("DOMContentLoaded", () => {
    const chatToggle = document.getElementById("chat-toggle-btn");
    const chatWindow = document.getElementById("chat-window");
    const closeBtn = document.getElementById("close-chat-btn");
    const sendBtn = document.getElementById("send-btn");
    const chatInput = document.getElementById("chat-input");
    const chatBox = document.getElementById("chat-box");

    // Toggle chat visibility
    chatToggle.addEventListener("click", () => {
        chatWindow.classList.toggle("hidden");
        chatToggle.style.display = "none";
    });

    closeBtn.addEventListener("click", () => {
        chatWindow.classList.add("hidden");
        chatToggle.style.display = "block";
    });

    // Handle sending message
    const sendMessage = async () => {
        const text = chatInput.value.trim();
        if (!text) return;

        // Display User Message
        appendMessage(text, "user-message");
        chatInput.value = "";

        // Call the FastAPI Backend
        try {
            const response = await fetch("http://127.0.0.1:8000/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ message: text })
            });
            
            const data = await response.json();
            appendMessage(data.response, "ai-message");

        } catch (error) {
            appendMessage("Sorry, the backend server is not responding.", "ai-message");
            console.error("Chat API Error:", error);
        }
    };

    sendBtn.addEventListener("click", sendMessage);
    chatInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") sendMessage();
    });

    function appendMessage(text, className) {
        const div = document.createElement("div");
        div.className = `message ${className}`;
        div.innerText = text;
        chatBox.appendChild(div);
        chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll to bottom
    }
});
async function getPriceEstimate() {
  const originalPriceEl = document.getElementById('originalPrice');
  const ageEl = document.getElementById('itemAge');
  const conditionEl = document.getElementById('itemCondition');
  const resultBox = document.getElementById('priceResultBox');
  const priceMain = document.getElementById('priceResultMain');
  const priceRange = document.getElementById('priceResultRange');

  const originalPrice = parseFloat(originalPriceEl.value);
  const age = parseInt(ageEl.value);
  const condition = parseInt(conditionEl.value);

  // If fields are empty, alert the user
  if (!originalPrice || isNaN(age)) {
    alert("Please provide valid numbers for both original price and age.");
    return;
  }

  // Show a "Calculating" loading state on the UI
  resultBox.classList.remove('hidden');
  resultBox.style.borderColor = 'rgba(59, 130, 246, 0.4)';
  resultBox.style.background = 'rgba(59, 130, 246, 0.08)';
  priceMain.innerText = 'Calculating...';
  priceRange.innerText = 'Consulting local campus pricing...';

  try {
    // Send the numbers to your FastAPI backend
    const res = await fetch('http://127.0.0.1:8000/api/predict-price', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        original_price: originalPrice,
        age_months: age,
        condition: condition
      })
    });

    if (!res.ok) throw new Error('Model inference failed');
    const data = await res.json();

    // If successful, change the UI to green and show the AI's price
    resultBox.style.borderColor = 'rgba(34, 197, 94, 0.3)';
    resultBox.style.background = 'rgba(34, 197, 94, 0.08)';
    priceMain.innerText = `₹${data.suggested_price}`;
    priceRange.innerText = `Suggested Market Range: ${data.range}`;
    
  } catch (err) {
    // If the backend is off, turn the UI red and show an error
    console.error(err);
    resultBox.style.borderColor = 'rgba(239, 68, 68, 0.3)';
    resultBox.style.background = 'rgba(239, 68, 68, 0.08)';
    priceMain.innerText = 'Offline';
    priceRange.innerText = 'Verify backend server is active on port 8000.';
  }
}