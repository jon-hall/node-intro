## 2 - ffi

This example is included to show-off something that I thought was mind-blowing when I first discovered it - the ability to call native methods from javascript seamlessly using the excellent [node-ffi](https://github.com/node-ffi/node-ffi) package.

#### What it'll do

The app does a couple of things - it sets up a way to call some native Windows APIs, and it provides a simple command-line interface that allows us to disable or enable repainting on a target window (specified using its title).

#### Prerequisites
In order to do this exercise you'll need to set your system up so [node-gyp](https://github.com/nodejs/node-gyp) works correctly, since this involves interfacing with native code (`node-gyp` is a tool which allows compiling C++ sources on a variety of platforms).

In order to make sure the example will work on your system you need to follow the steps for installation in the `node-gyp` README *(see link above)* - this mainly involves installing python and the VC++ compiler tools if you don't have them.

#### NPM install
Once your machine is ready, you can run (from a prompt in the `2-ffi` directory)
```sh
npm install
```
This will read the `package.json` file present in the directory and install any necessary (non built-in) dependencies listed in the file - in this case `node-ffi`.

#### Creating a command-line prompt
The built-in API for reading input from the command-line is a tad clunky, but here is how we set up a looping prompt with it.
```js
// We use the built-in 'readline' module for reading console input
var rl = require('readline'),
    prompt = rl.createInterface(process.stdin, process.stdout, null);

// In order to loop calls to the async 'question' method, we use recursion as
// a naive approach. This is not a sustainable strategy as it eventually stack
// overflows, but is used here for code clarity.
function sendPrompt() {
    // We ask a question and receive the next entered line in a callback
    prompt.question("Type 'freeze <window title>', 'defrost', or 'exit':\n", function(answer) {
        switch(answer) {
            // We will add cases to deal with the various answers later
            default:
                // Keep prompting til exit
                sendPrompt();
                break;
        }
    });
}
// Start the loop by calling sendPrompt
sendPrompt();
```

#### Calling native methods
Before we move onto dealing with the answers to the prompt, we'll bring in `node-ffi` and set-up our WinAPI method calls, ready to perform them in response to prompt answers.

The two methods we'll be needing are:
 - [FindWindow](https://msdn.microsoft.com/en-us/library/windows/desktop/ms633499.aspx) - which allows us to get a window's handle using it's title.
 - [SendMessage](https://msdn.microsoft.com/en-us/library/windows/desktop/ms644950.aspx) - Which allows us to use Windows' messaging system to send messages to a window, using the window's handle.  Two messages we can send to a window are *disable painting* and *enable painting* - the effects of which can be observed by the window becoming 'un-interactable' when painting is disabled.

```js
// 'require' in ffi
var ffi = require('ffi');

// WinAPI methods require various constants, so store them in named variables
// Here we need the message id for the SETDRAW message along with the integer
// values for FALSE and TRUE
var WM_SETREDRAW = 11,
    FALSE = 0,
    TRUE = 1;

// Get proxy functions for native WINAPI FindWindow and SendMessage functions

// ffi requires the name of a dll to call methods from, along with an object
// describing the methods we want access to - their names and an array which
// contains their return type and an array of input types
var winapi = new ffi.Library("User32", {
    "FindWindowA": ["int32", ["string", "string"]],
    "SendMessageA": ["int64", ["int32", "uint32", "int32", "int32"]]
});

/*prompt code omitted for brevity*/
```

#### Handling answers
We'll now add some basic code for handling prompt answers.
```js
// We use the built-in 'readline' module for reading console input
var rl = require('readline'),
    prompt = rl.createInterface(process.stdin, process.stdout, null),
    freezeRegex = /^freeze (\w+)/;

// In order to loop calls to the async 'question' method, we use recursion as
// a naive approach. This is not a sustainable strategy as it eventually stack
// overflows, but is used here for code clarity.
function sendPrompt() {
    // We ask a question and receive the next entered line in a callback
    prompt.question("Type 'freeze <window title>', 'defrost', or 'exit':\n", function(answer) {
        var playOn = true;
        switch(answer) {
            case 'defrost':
                // TODO: Re-enable paints on window so it goes back to normal
                break;
            case 'exit':
                // These lines allow the program to terminate
                // Without them, it would run forever
                prompt.close();
                process.stdin.destroy();
                playOn = false;
                break;
            default:
                freezing = freezeRegex.exec(answer);
                if(freezing) {
                    // TODO: Freeze target window based on match[1]
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
```

#### The finished product
Combining the two above pieces of code, we're able to easily invoke the methods we registered with `node-ffi` to complete the app.
```js
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
```

#### Running the app
Use
```sh
node index.js
```

to start the app, then enter commands to see it in action!
