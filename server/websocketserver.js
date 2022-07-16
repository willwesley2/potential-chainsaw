const { WebSocketServer, OPEN } = require('ws');
const HeartBeat = require('./heartbeat');

module.exports = function(server) {
  const wss = new WebSocketServer({ server })
  const registerHeartbeat = HeartBeat(wss);

  wss.on('connection', function connection(ws, req) {
    registerHeartbeat(ws);

    ws.on('message', function message(data) {
      console.log('received: %s', data);
      sendEveryone(makeMessage(req.socket.remoteAddress, data));
    });

    sendEveryone(makeMessage('SERVER', 'Welcome ' + req.socket.remoteAddress))
    ws.on('close', function wsclose() {
      sendEveryone(makeMessage('SERVER', 'Bye ' + req.socket.remoteAddress))
    })
  });

  function makeMessage(who, data) {
    return [
      JSON.stringify({
        data: `${data}`,
        who: who
      }),
      { binary: false }
    ];
  }

  function sendEveryone(message) {
    wss.clients.forEach(function(client) {
      if (client.readyState === OPEN) {
        client.send(...message);
      }
    });
  }
}
