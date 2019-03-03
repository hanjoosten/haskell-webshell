
function initWesh() {
  const terminal = document.querySelector('#terminal');
  const encoder = new TextEncoder();
  const loc = window.location;
  var new_uri;
  if (loc.protocol === "https:") {
    new_uri = "wss:";
  } else {
    new_uri = "ws:";
  }
  new_uri += "//" + loc.host + "/terminal/" + terminal.dataset.token;
  const ws = new WebSocket(new_uri);
  const t = new hterm.Terminal("light");
  var connected = false;

  t.onTerminalReady = function() {
    // Create a new terminal IO object and give it the foreground.
    // (The default IO object just prints warning messages about unhandled
    // things to the the JS console.)
    const io = t.io.push();
    function send(str) {
      if (connected) {
        ws.send(encoder.encode(str));
      } else {
        console.log(str);
      }
    }

    io.onVTKeystroke = send;

    io.sendString = send;

    io.onTerminalResize = (columns, rows) => {
      $.ajax({
        type: "POST",
        url: "/resize/" + terminal.dataset.token,
        data: JSON.stringify({
          "width": columns,
          "height": rows
        }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(data){
          console.log(data);
        },
        failure: function(data){
          console.log(data);
        }
      });
    };


  // You can call io.push() to foreground a fresh io context, which can
  // be uses to give control of the terminal to something else.  When that
  // thing is complete, should call io.pop() to restore control to the
  // previous io object.
  };

  ws.onopen = function(e) {
    console.log("Connected: ");
    console.log(e);
    connected = true;
  }
  // Listen for the close connection event
  ws.onclose = function(e) {
    console.log("Disconnected: ");
    console.log(e);
    connected = false;
  }

  // Listen for connection errors
  ws.onerror = function(e) {
    console.log("Error: ");
    console.log(e);
  }

  // Listen for new messages arriving at the client
  ws.onmessage = function(e) {
    t.io.print(e.data);
  }

  t.decorate(terminal);
  t.installKeyboard();

}

window.onload = function() {
  hterm.defaultStorage = new lib.Storage.Memory();
  lib.init(initWesh);
};
