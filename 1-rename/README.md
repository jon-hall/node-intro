## 1 - rename

This example illustrates how node allows javascript to be used entirely out of the browser, to achieve tasks traditionally done in other scripting languages such as bash or perl.

#### The challenge
We have a series of files in the `/stuff` folder (and backups in the `stuff_backup` folder, should you have any accidents) which, for some reason, need renaming from `thf_xxx` to `wvk_xxx` (that is, replace `thf` with `wvk`).

Just to make it more awkward, there's also some files in there which we want to leave alone, since they don't have `thf` in their name.

#### Scripting with node
We're going to use node to solve this problem, by writing a simple javascript program that will rename the files as needed.

This time we have an empty `index.js` file ready, so the first thing is, once again to `require` in a module so we can start doing stuff. This time we'll bring in another built-in module - `fs` - the file system module which allows us to read and write files, along with lots of file-related stuff.

```js
var fs = require('fs');
```

#### Listing files
The first thing we need is a list of the files in `/stuff`, the `fs` method for doing this is `readdir`.

```js
var fs = require('fs');

// Readdir is async and so we receive the result in this callback
// The arguments passed in follow the standard node convention of an error
// followed by any results - if everything was ok, then err will be null
fs.readdir('./stuff', function(err, files) {
    // Handle the error, if present
    if(err) {
        throw err;
    }

    // TODO: Do things with 'files' - the list of all files and folders
    // in './stuff'
});
```

#### Working out which files to rename
We'll use regex to work out  the files we want to rename.

```js
var fs = require('fs'),
    thfRegex = /^thf/;

// Readdir is async and so we receive the result in this callback
// The arguments passed in follow the standard node convention of an error
// followed by any results - if everything was ok, then err will be null
fs.readdir('./stuff', function(err, files) {
    // Handle the error, if present
    if(err) {
        throw err;
    }

    files.forEach(function(file) {
        if(!thfRegex.test(file)) {
            // Skip files whose names don't contain the string to be replaced
            return;
        }

        // TODO: Rename file
    });
});
```

#### Renaming the files
The last step is to actually rename each of the eligible files, for which `fs` has the `rename` method.

```js
var fs = require('fs'),
    thfRegex = /^thf/;

// Readdir is async and so we receive the result in this callback
// The arguments passed in follow the standard node convention of an error
// followed by any results - if everything was ok, then err will be null
fs.readdir('./stuff', function(err, files) {
    // Handle the error, if present
    if(err) {
        throw err;
    }

    files.forEach(function(file) {
        if(!thfRegex.test(file)) {
            // Skip files whose names don't contain the string to be replaced
            return;
        }

        // Calculate the current name (relative to cwd), and the new name
        var relativeName = './stuff/' + file,
            newName = './stuff/' + file.replace(thfRegex, 'wvk');

        // Do the rename (also an async operation)
        fs.rename(relativeName, newName, function(err2) {
            // NOTE: This one is 'err2' so we don't shadow 'err'
            if(err2) {
                throw err2;
            }

            // Console.log in node supports a basic printf-type syntax
            console.log('Renamed "%s" to "%s"', relativeName, newName);
        });
    });

    // NOTE: Because we set-off a bunch of ASYNC operations in the loop
    // this actually logs FIRST!
    console.log('Renaming files...');
});
```
