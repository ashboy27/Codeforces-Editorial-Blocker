document.addEventListener("DOMContentLoaded", function () {
    let toggleButton = document.getElementById("toggle");
    let statusText = document.getElementById("status");
    let quoteText = document.getElementById("quote");
    let confirmationBox = document.getElementById("confirmation-box");
    let confirmationMessage = document.getElementById("confirmation-message");
    let yesButton = document.getElementById("yes-button");
    let noButton = document.getElementById("no-button");

    const quotes = [
        "Success is no accident.",
        "Hard work beats talent when talent doesn’t work hard.",
        "The only way to do great work is to love what you do.",
        "You don’t have to be great to start, but you have to start to be great.",
        "Dream big, work hard, stay focused.",
        "The best way to predict the future is to create it.",
        "Progress is impossible without change.",
        "Discipline is choosing between what you want now and what you want most.",
        "Don't count the days, make the days count.",
        "The secret of getting ahead is getting started.",
        "Believe you can and you're halfway there.",
        "Difficult roads often lead to beautiful destinations.",
        "Don’t watch the clock; do what it does—keep going.",
        "Failure is not the opposite of success; it’s part of success.",
        "Success usually comes to those who are too busy to be looking for it.",
        "Great things never come from comfort zones.",
        "It always seems impossible until it’s done.",
        "If opportunity doesn’t knock, build a door.",
        "Your limitation—it’s only your imagination.",
        "Do what you can, with what you have, where you are.",
        "You only fail when you stop trying.",
        "Act as if what you do makes a difference—it does.",
        "Push yourself, because no one else is going to do it for you.",
        "Every champion was once a contender that refused to give up.",
        "Doubt kills more dreams than failure ever will.",
        "Stay hungry, stay foolish.",
        "Small steps in the right direction can turn out to be the biggest step of your life.",
        "The harder you work for something, the greater you’ll feel when you achieve it.",
        "Be stronger than your excuses.",
        "Success doesn’t come from what you do occasionally, it comes from what you do consistently."

    ];

    function getRandomQuote() {
        return quotes[Math.floor(Math.random() * quotes.length)];
    }

    quoteText.innerText = getRandomQuote();

    chrome.storage.sync.get(["enabled"], function (data) {
        if (data.enabled) {
            statusText.innerText = "Status: ON";
            toggleButton.innerText = "Disable Blocking";
        } else {
            statusText.innerText = "Status: OFF";
            toggleButton.innerText = "Enable Blocking";
        }
    });

    
    let questions = [
        "Have you read the constraints properly?",
        "Have you thought of every edge case?",
        "Have you tried identifying a pattern?",
        "Have you considered applying Binary Search?",
        "Have you thought of a Greedy approach?",
        "Have you tried solving a smaller version of the problem?",
        "Did you check if this problem is similar to a known one you've solved?",
        "Are you absolutely sure you want to disable blocking?",
        "Are you REALLY REALLY REALLY sure you want to rely on someone else for your solution?"
    ];

    let currentQuestionIndex = 0;
    let penaltyActive = false;

    function askNextQuestion(callback) {
        if (currentQuestionIndex < questions.length) {
            confirmationMessage.innerText = questions[currentQuestionIndex];
            confirmationBox.style.display = "block";

            if (currentQuestionIndex === questions.length - 1) {
                makeYesButtonUnclickable();
            } else {
                resetYesButton(); 
            }

            yesButton.onclick = function () {
                if (yesButton.classList.contains("unclickable")) return; 

                currentQuestionIndex++;
                confirmationBox.style.display = "none";
                askNextQuestion(callback);
            };

            noButton.onclick = function () {
                confirmationBox.style.display = "none";
                currentQuestionIndex = 0;
                toggleButton.disabled = false;
                resetYesButton();
            };
        } else {
            resetYesButton();
            startPenaltyTimer(callback);
        }
    }

    function startPenaltyTimer(callback) {
        penaltyActive = true;
        let waitTime =  2*60; 
        toggleButton.disabled = true;
        confirmationMessage.innerText = `You must wait 2 minutes before disabling.DONOT CLOSE THE EXTENSION. Time left: ${formatTime(waitTime)}`;
        confirmationBox.style.display = "block";
        yesButton.style.display = "none"; 
        noButton.style.display = "none"; 

        let interval = setInterval(() => {
            waitTime--;
            confirmationMessage.innerText = `You must wait 2 minutes before disabling.DONOT CLOSE THE EXTENSION. Time left: ${formatTime(waitTime)}`;

            if (waitTime <= 0) {
                clearInterval(interval);
                confirmationBox.style.display = "none";
                toggleButton.disabled = false;
                callback();
            }
        }, 1000);
    }

    function formatTime(seconds) {
        let minutes = Math.floor(seconds / 60);
        let secs = seconds % 60;
        return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
    }

    toggleButton.addEventListener("click", function () {
        chrome.storage.sync.get(["enabled"], function (data) {
            let newState = !data.enabled;

            if (!newState) {
                toggleButton.disabled = true;
                currentQuestionIndex = 0;
                askNextQuestion(function () {
                    chrome.storage.sync.set({ enabled: newState }, function () {
                        statusText.innerText = "Status: OFF";
                        toggleButton.innerText = "Enable Blocking";
                        chrome.tabs.reload();
                    });
                });
                return;
            }

            chrome.storage.sync.set({ enabled: newState }, function () {
                statusText.innerText = newState ? "Status: ON" : "Status: OFF";
                toggleButton.innerText = newState ? "Disable Blocking" : "Enable Blocking";
                chrome.tabs.reload();
            });
        });
    });


    function makeYesButtonUnclickable() {
        yesButton.classList.add("unclickable"); 
        yesButton.innerText = "Wait...";
        let startTime = Date.now();

        let interval = setInterval(() => {
            let elapsed = (Date.now() - startTime) / 1000;
            if (elapsed >= 10) {
                clearInterval(interval);
                yesButton.classList.remove("unclickable");
                yesButton.innerText = "Yes";
                yesButton.style.animation = "";
            }
        }, 100);

        yesButton.style.animation = "shake 0.1s infinite";
    }

    function resetYesButton() {
        yesButton.classList.remove("unclickable");
        yesButton.innerText = "Yes";
        yesButton.style.animation = "";
    }
});
