var spawn = require('child_process').spawn,
    ffi = require('ffi');

var WM_SETREDRAW = 11,
    FALSE = 0,
    TRUE = 1;

// Get proxy functions for native WINAPI FindWindow and SendMessage functions
var winapi = new ffi.Library("User32", {
    "FindWindowA": ["int32", ["string", "string"]],
    "SendMessageA": ["int64", ["int32", "uint32", "int32", "int32"]]
});

// Spawn our test app
console.log('Spawning test app...');
var app = spawn(__dirname + '/testapp/testapp.exe');
setTimeout(function() {
    // Find the window handle for our test app
    var hWnd = winapi.FindWindowA(null, "TestApp");

    console.log('Window handle: ' + hWnd);

    // Use built-in readline API for getting user input
    var rl = require('readline');
    var i = rl.createInterface(process.stdin, process.stdout, null);

    function prompt() {
        i.question("Type 'freeze', 'defrost', or 'exit':\n", function(answer) {
            switch(answer) {
                case 'freeze':
                    // Use SendMessage to stop all paints for window - effectively
                    // rendering it non-interactable
                    winapi.SendMessageA(hWnd, WM_SETREDRAW, FALSE, 0);
                    prompt();
                    break;
                case 'defrost':
                    // Renable paints on window so it goes back to normal
                    winapi.SendMessageA(hWnd, WM_SETREDRAW, TRUE, 0);
                    prompt();
                    break;
                case 'exit':
                    // These three lines together allow the program to terminate. Without
                    // them, it would run forever.
                    i.close();
                    app.kill();
                    process.stdin.destroy();
                    break;
                default:
                    // Keep prompting til exit
                    prompt();
                    break;
            }
        });
    }
    prompt();
}, 5000 /* Wait a while for the app to spawn fully */);
