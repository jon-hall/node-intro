$(function() {
    var socket = io(),
        username;

    socket.on('username', function(name) {
        $('#username').html('now chatting as <em>' + (username = name) + '</em>');
    });

    socket.on('in', function(username) {
        announcement(username + ' has joined the chat');
    });

    socket.on('out', function(username) {
        announcement(username + ' has left the chat');
    });

    socket.on('msg', function(data) {
        message(data.username, data.msg);
    });

    $('#input').keydown(function(e) {
        if(e.keyCode !== 13) return; // Ignore anything other than enter
        var msg = $('#input').val();

        socket.emit('msg', msg);
        message(username, msg, true);

         $('#input').val('');
    });
});

function message(user, body, me) {
    me = me ? ' me' : '';
    $('#content').append($(
        '<div class="message-row' + me + '"><span class="message-user">' + user +
        ': </span><span class="message-body">' + body + '</span></div>'));
}

function announcement(message) {
    $('#content').append($('<div class="announcement">' + message + '</div>'));
}
