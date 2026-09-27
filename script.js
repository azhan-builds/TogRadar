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
const markers = {}
function updateVehicles(vehicles) {
    for (const v of vehicles) {
        if (!v.vehicleId || !v.location) continue
        const pos = [v.location.latitude, v.location.longitude]
        if (markers[v.vehicleId]) {
            markers[v.vehicleId].target = pos
        } else {
            const marker = L.circleMarker(pos, {
                radius: 5,
                color: '#4dabf7',
                fillColor: '#4dabf7',
                fillOpacity: 0.9
            } ).addTo(map)
            marker.target = pos
            markers[v.vehicleId] = marker
        }
    }
}

function animate() {
    for (const id in markers) {
        const marker = markers[id]
        const current = marker.getLatLng()
        const target = marker.target
        const newLat= current.lat + (target[0] - current.lat )*0.1
        const newLng = current.lng + (target[1] - current.lng)*0.1
        marker.setLatLng([newLat, newLng])
    }
    requestAnimationFrame(animate)
}
animate()

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
      payload: { query }
    }))
  }

  if (msg.type === 'next') {
    updateVehicles(msg.payload.data.vehicles)
  }
}