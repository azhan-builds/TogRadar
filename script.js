const map = L.map('map').setView([65, 13], 5)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map)

const socket = new WebSocket('wss://api.entur.io/realtime/v2/vehicles/subscriptions', 'graphql-transport-ws')
const query = `
subscription {
  vehicles(mode: RAIL) {
    vehicleId
    lastUpdated
    delay
    line {
      lineRef
      lineName
      publicCode
    }
    location {
      latitude
      longitude
    }
  }
}
`

socket.onopen = () => {
    socket.send(JSON.stringify({
        type: 'connection_init',
        payload: {
            headers: {
                'ET-Client-Name': 'azhan-togradar'
            }
        }
    }))
}

socket.onmessage = (event) => {
    const msg = JSON.parse(event.data)
    if (msg.type === 'connection_ack') {
        socket.send(JSON.stringify({
            type: 'subscribe',
            id: '1',
            payload: {query}
        }))
    }
    if (msg.type === 'next') {
        console.log(msg.payload.data.vehicles)
    }
}