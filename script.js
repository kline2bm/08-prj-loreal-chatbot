/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

const basePrompt =
  "You are a helpful assistant specialized in L’Oréal products, routines, and recommendations. Only answer questions related to these topics. If a question is unrelated to L’Oréal products, beauty routines, or beauty-related topics, politely refuse to answer and inform the user that you can only assist with L’Oréal-related inquiries.";
const messages = [
  {
    role: "system",
    content: basePrompt,
  },
];

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

  // Append user message to chat window and messages array
  appendMessage("user", userText);
  messages.push({ role: "user", content: userText });

  // Clear input field
  userInput.value = "";

  // Show loading message
  appendMessage("bot", "…thinking…");

  try {
    const response = await fetch(
      "https://08-prj-loreal-chatbot.kline2bm.workers.dev/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: messages,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Cloudflare Worker error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    const botMessage = data.choices[0].message.content.trim();

    // Remove the loading message
    const loadingMessage = chatWindow.querySelector(".bot-message:last-child");
    if (loadingMessage && loadingMessage.textContent === "…thinking…") {
      loadingMessage.remove();
    }

    // Append bot message to chat window and messages array
    appendMessage("bot", botMessage);
    messages.push({ role: "assistant", content: botMessage });
  } catch (error) {
    console.error("Error during fetch:", error);
    // Remove the loading message
    const loadingMessage = chatWindow.querySelector(".bot-message:last-child");
    if (loadingMessage && loadingMessage.textContent === "…thinking…") {
      loadingMessage.remove();
    }

    appendMessage("bot", "Sorry, there was an error. Please try again.");
  }
});

appendMessage("bot", "👋 Hello! How can I help you today?");
