// We use the built-in 'readline' module for reading console input
var rl = require('readline'),
    ffi = require('ffi'),
    prompt = rl.createInterface(process.stdin, process.stdout, null),
    // WinAPI methods require various constants, so store them in named variables
    // Here we need the message id for the SETDRAW message along with the integer
    // values for FALSE and TRUE
    WM_SETREDRAW = 11,
    FALSE = 0,
    TRUE = 1,
    freezeRegex = /^freeze (\w+)/,
    handle;

// Get proxy functions for native WINAPI FindWindow and SendMessage functions

// ffi requires the name of a dll to call methods from, along with an object
// describing the methods we want access to - their names and an array which
// contains their return type and an array of input types
var winapi = new ffi.Library("User32", {
    "FindWindowA": ["int32", ["string", "string"]],
    "SendMessageA": ["int64", ["int32", "uint32", "int32", "int32"]]
});

// In order to loop calls to the async 'question' method, we use recursion as
// a naive approach. This is not a sustainable strategy as it eventually stack
// overflows, but is used here for code clarity.
function sendPrompt() {
    // We ask a question and receive the next entered line in a callback
    prompt.question("Type 'freeze <window title>', 'defrost', or 'exit':\n", function(answer) {
        var playOn = true;

        switch(answer) {
            case 'defrost':
                if(handle) {
                    // Re-enable drawing by sending SETDRAW with TRUE
                    winapi.SendMessageA(handle, WM_SETREDRAW, TRUE, 0);
                    handle = null;
                } else {
                    console.log("Please use 'freeze <window title>' before 'defrost'");
                }
                break;
            case 'exit':
                // These lines allow the program to terminate
                // Without them, it would run forever
                prompt.close();
                process.stdin.destroy();
                playOn = false;
                break;
            default:
                match = freezeRegex.exec(answer);
                if(match) {
                    if(handle) {
                        console.log("Already frozen, use 'defrost' to unfreeze target.");
                        break;
                    }

                    // Call find window to get the handle based on title
                    // Store in 'handle' for use in future answers

                    // Invoking the methods registered wif ffi is as simple as calling
                    // them like any other javascript method
                    handle = winapi.FindWindowA(null, match[1]);

                    // Use SendMessage to stop all paints for the window,
                    // effectively rendering it non-interactable

                    // Disable drawing by sending SETDRAW message with FALSE
                    winapi.SendMessageA(handle, WM_SETREDRAW, FALSE, 0);
                }
                break;
        }

        if(playOn) {
            // Keep prompting til exit
            sendPrompt();
        }
    });
}
// Start the loop by calling sendPrompt
sendPrompt();
