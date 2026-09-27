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

function popupText(v) {
  const code = v.line && v.line.publicCode ? v.line.publicCode: '?'
  const name = v.line && v.line.lineName ? v.line.lineName: ''
  const delay = v.delay
  let delayText
  if(delay == null) {
    delayText = 'delay unknown'
  } else if (delay > 60) {
    delayText = Math.round(delay/60) + ' min late'
  } else if (delay < -60) {
    delayText = Math.round(-delay/60) + ' min early'
  } else {
    delayText = 'on time'
  }
  return code + ' ' + name + '<br>' + delayText
}
function updateVehicles(vehicles) {
  const now = performance.now()

  for (const v of vehicles) {
      if (!v.vehicleId || !v.location || v.location.latitude == null || v.location.longitude == null) continue
      const pos = [v.location.latitude, v.location.longitude]
      let marker = markers[v.vehicleId]
      if (!marker) {
        marker = L.circleMarker(pos, {
          radius: 5,
          color: '#4dabf7',
          fillColor: '#4dabf7',
          fillOpacity:0.9
        }).addTo(map)
        marker.animDuration = 0
        marker.bindPopup(() => popupText(marker.data))
        markers[v.vehicleId] = marker
      } else {
        marker.animDuration = Math.min(Math.max(now - marker.lastUpdate, 1000), 90000)
      }
      marker.data = v
      marker.from = marker.getLatLng()
      marker.to = pos
      marker.animStart = now
      marker.lastUpdate = now
    }
    document.getElementById('count').textContent = Object.keys(markers).length + ' trains'
  }

function animate() {
    const now = performance.now()
    for (const id in markers) {
        const marker = markers[id]
        const elapsed = now - marker.animStart
        const t = marker.animDuration === 0 ? 1: Math.min(elapsed/marker.animDuration, 1)
        const lat= marker.from.lat + (marker.to[0]-marker.from.lat)*t
        const lng = marker.from.lng + (marker.to[1]-marker.from.lng) * t
        marker.setLatLng([lat, lng])
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