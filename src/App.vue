<template>
  <div class="main-container">
    <div class="map-container">
      <div id="map"></div>
    </div>
    <div class="info-container">
      <div class="selector-card">
        <div class="selector-card-heading">Where to?</div>

        <!-- This contains the row for From and To selectors -->
        <div class="selectors">
          <div>
            <FloatLabel class="w-full md:w-56" variant="in">
              <SelectComponent
                id="on_label"
                v-model="start"
                :options="cities"
                optionLabel="name"
                filter
                :maxSelectedLabels="3"
                class="w-full"
              />
              <label for="on_label">From</label>
            </FloatLabel>
          </div>
          to
          <div>
            <FloatLabel class="w-full md:w-56" variant="in">
              <SelectComponent
                id="on_label"
                v-model="goal"
                :options="cities"
                optionLabel="name"
                filter
                :maxSelectedLabels="3"
                class="w-full"
              />
              <label for="on_label">To</label>
            </FloatLabel>
          </div>
        </div>
      </div>
      <div class="route-card">
        <div v-for="(item, index) in path" :key="`city-${index}`">{{ item }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import { useDFS } from './composables/useDFS.js'

const { Graph, Stack, dfs } = useDFS()

// No need to add distances, DFS does not need distances
const graph = new Graph()
graph.addEdge('Tijuana', 'Rosarito')
graph.addEdge('Tijuana', 'Tecate')
graph.addEdge('Rosarito', 'Ensenada')
graph.addEdge('Ensenada', 'Tecate')
graph.addEdge('Ensenada', 'San Felipe')
graph.addEdge('Ensenada', 'San Quintin')
graph.addEdge('San Quintin', 'Guerrero Negro')
graph.addEdge('Guerrero Negro', 'San Felipe')
graph.addEdge('San Felipe', 'Mexicali')
graph.addEdge('Mexicali', 'Tecate')
graph.addEdge('Guerrero Negro', 'Santa Rosalia')
graph.addEdge('Santa Rosalia', 'Mulege')
graph.addEdge('Mulege', 'Ciudad Constitucion')
graph.addEdge('Ciudad Constitucion', 'San Carlos')
graph.addEdge('Ciudad Constitucion', 'La Paz')
graph.addEdge('La Paz', 'Cabo San Lucas')
graph.addEdge('Cabo San Lucas', 'San Jose del Cabo')
graph.addEdge('San Jose del Cabo', 'La Paz')
graph.addEdge('Mexicali', 'San Luis Rio Colorado')
graph.addEdge('San Luis Rio Colorado', 'Sonoyta')
graph.addEdge('Sonoyta', 'Puerto Penasco')
graph.addEdge('Puerto Penasco', 'Caborca')
graph.addEdge('Caborca', 'Sonoyta')
graph.addEdge('Caborca', 'Santa Ana')
graph.addEdge('Santa Ana', 'Nogales')
graph.addEdge('Santa Ana', 'Cananea')
graph.addEdge('Santa Ana', 'Hermosillo')
graph.addEdge('Cananea', 'Nogales')
graph.addEdge('Cananea', 'Agua Prieta')
graph.addEdge('Agua Prieta', 'Moctezuma')
graph.addEdge('Hermosillo', 'Moctezuma')
graph.addEdge('Hermosillo', 'Guaymas')
graph.addEdge('Guaymas', 'Ciudad Obregon')
console.log(graph)

const cities = ref([
  { name: 'Agua Prieta', lat: 31.3256, lng: -109.5481 },
  { name: 'Cabo San Lucas', lat: 22.8905, lng: -109.9167 },
  { name: 'Caborca', lat: 30.7167, lng: -112.1667 },
  { name: 'Cananea', lat: 30.9813, lng: -110.2936 },
  { name: 'Ciudad Constitucion', lat: 25.0325, lng: -111.6622 },
  { name: 'Ciudad Obregon', lat: 27.4939, lng: -109.9389 },
  { name: 'Ensenada', lat: 31.8667, lng: -116.6 },
  { name: 'Guaymas', lat: 27.9194, lng: -110.9044 },
  { name: 'Guerrero Negro', lat: 27.9708, lng: -114.0375 },
  { name: 'Hermosillo', lat: 29.0729, lng: -110.9559 },
  { name: 'La Paz', lat: 24.1426, lng: -110.3128 },
  { name: 'Mexicali', lat: 32.6245, lng: -115.4523 },
  { name: 'Moctezuma', lat: 29.8011, lng: -109.6744 },
  { name: 'Mulege', lat: 26.8889, lng: -111.9817 },
  { name: 'Nogales', lat: 31.3076, lng: -110.9422 },
  { name: 'Puerto Penasco', lat: 31.3172, lng: -113.5361 },
  { name: 'Rosarito', lat: 32.36, lng: -117.0513 },
  { name: 'San Carlos', lat: 27.9608, lng: -111.0561 },
  { name: 'San Felipe', lat: 31.0253, lng: -114.8466 },
  { name: 'San Jose del Cabo', lat: 23.0589, lng: -109.6972 },
  { name: 'San Luis Rio Colorado', lat: 32.4561, lng: -114.7714 },
  { name: 'San Quintin', lat: 30.5592, lng: -115.9494 },
  { name: 'Santa Ana', lat: 30.5392, lng: -111.1236 },
  { name: 'Santa Rosalia', lat: 27.3394, lng: -112.2694 },
  { name: 'Sonoyta', lat: 31.8672, lng: -112.8492 },
  { name: 'Tecate', lat: 32.5686, lng: -116.6336 },
  { name: 'Tijuana', lat: 32.5149, lng: -117.0382 },
])

// If the start/goal value is different than the old value, rerun the path finder
const start = ref(null)
const goal = ref(null)

const path = ref(null)

const map = ref(null) // Store map reference
const polylineLayer = ref(null) // Store the active polyline

// For now this will be instant, but I should include a button that says GO
watch([start, goal], ([newStart, newGoal]) => {
  if (newStart && newGoal) {
    path.value = dfs(graph, newStart.name, newGoal.name)

    if (!path.value || path.value.length < 2) return

    const pathArray = Array.from(path.value)

    // Get the coordinates for the full path
    const pointList = pathArray
      .map((cityName) => cities.value.find((c) => c.name === cityName))
      .filter((city) => city) // Remove undefined values
      .map((city) => new L.LatLng(city.lat, city.lng))

    // Remove previous polyline if it exists
    if (polylineLayer.value) {
      map.value.removeLayer(polylineLayer.value)
    }

    // Draw new polyline
    polylineLayer.value = new L.polyline(pointList, {
      color: 'red',
      weight: 3,
      opacity: 0.5,
      smoothFactor: 1,
    })

    polylineLayer.value.addTo(map.value) // Use map.value
  }
})

onMounted(() => {
  map.value = L.map('map').setView([27.728771759148433, -113.14918884489447], 6)

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map.value)
})
</script>

<style lang="scss" scoped>
.main-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  height: 100dvh;
  width: 100vw;
  width: 100dvw;

  .map-container {
    display: flex;
    width: 40%;
    height: 60%;
    justify-content: center;
    align-items: center;
    padding: 0px;
    box-sizing: border-box;

    #map {
      width: 100%;
      height: 100%;
      min-width: 300px;
    }
  }

  .info-container {
    display: flex;
    flex-direction: column;
    margin: 10px 20px;
  }

  .route-card {
    min-height: 200px;
    padding: 20px;
    background-color: var(--accent);
    border-radius: 10px;
  }

  .selector-card {
    display: flex;
    flex-direction: column;
    width: 100%;
    min-width: 300px;
    box-sizing: border-box;

    margin: 10px 0px;
    padding: 20px;
    background-color: var(--accent);
    border-radius: 10px;

    .selector-card-heading {
      margin-bottom: 10px;
    }

    .selectors {
      display: flex;
      flex-direction: column;
      gap: 10px;
      align-items: center;
    }
    div {
      width: 100%;
    }
  }
}

// When the map should take up a bigger space and the selectors should be moved down,
// and the selectors should go into columns so they fit on the screen
@media (max-width: 768px) {
  .main-container {
    flex-direction: column;
  }

  .map-container {
    display: flex;
    width: 100%;
    // height: 50vh;
    justify-content: center;
    align-items: center;
    padding: 20px;
    box-sizing: border-box;

    #map {
      width: 100%;
      height: 100%;
      min-height: 300px;
      min-width: 400px;
    }
  }
}
</style>
