/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// Set initial message
chatWindow.textContent = "👋 Hello! How can I help you today?";

// Function to append a message to the chat window
function appendMessage(sender, message) {
  const messageElem = document.createElement("div");
  messageElem.classList.add("chat-message");
  messageElem.classList.add(sender === "user" ? "user-message" : "bot-message");
  messageElem.textContent = message;
  chatWindow.appendChild(messageElem);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const userText = userInput.value.trim();
  if (!userText) return;

  // Append user message
  appendMessage("user", userText);

  // Clear input field
  userInput.value = "";

  // Show loading message
  appendMessage("bot", "…thinking…");

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          { role: "user", content: userText }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const botMessage = data.choices[0].message.content.trim();

    // Remove the loading message
    const loadingMessage = chatWindow.querySelector(".bot-message:last-child");
    if (loadingMessage && loadingMessage.textContent === "…thinking…") {
      loadingMessage.remove();
    }

    // Append bot message
    appendMessage("bot", botMessage);

  } catch (error) {
    // Remove the loading message
    const loadingMessage = chatWindow.querySelector(".bot-message:last-child");
    if (loadingMessage && loadingMessage.textContent === "…thinking…") {
      loadingMessage.remove();
    }

    appendMessage("bot", "Sorry, there was an error. Please try again.");
    console.error(error);
  }
});
