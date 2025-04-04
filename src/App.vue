<template>
  <div class="main-container">
    <!-- <h2>BCPathFinder</h2> -->
    <div class="content">
      <div class="selector-card">
        <!-- <div class="selector-card-heading">Where to?</div> -->

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
      <div class="map-container">
        <div class="route-card">
          <h5>Path</h5>
          <div v-for="(item, index) in path" :key="`city-${index}`">{{ item }}</div>
        </div>

        <div id="map"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
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
console.log('Graph that has been created:', graph)

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
  { name: 'San Carlos', lat: 24.7942, lng: -112.131 },
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

// TODO
// If it follows road, I can use the distance given in the map
// If it doesnt follow the road, calculate the distance given the coordinates

// Linear distance between cities given the coordinates, its an equation because of the curvature of the earth

// If the start/goal value is different than the old value, rerun the path finder
const start = ref(null)
const goal = ref(null)

const path = ref(null)

const map = ref(null) // Store map reference

const polylineSegments = ref<L.Polyline[]>([]) // Stores all segment polylines
const timeouts = ref<number[]>([]) // Stores all timeout IDs

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

    // Stop all pending animations
    timeouts.value.forEach(clearTimeout)
    timeouts.value = [] // Reset timeout list

    // Remove previous segments before drawing new ones
    polylineSegments.value.forEach((segment) => map.value.removeLayer(segment))
    polylineSegments.value = [] // Reset segment array

    pointList.forEach((point, index) => {
      if (index === 0) return // Skip the first point since we need a pair

      const timeoutId = setTimeout(() => {
        const segment = [pointList[index - 1], point] // Get previous & current point

        const segmentLine = new L.polyline(segment, {
          color: '#09397b',
          weight: 3,
          opacity: 0.5,
          smoothFactor: 10,
        })

        segmentLine.addTo(map.value)
        polylineSegments.value.push(segmentLine) // Store segment for removal
      }, index * 200) // Delay each segment by 200ms

      timeouts.value.push(timeoutId) // Track timeout for cancellation
    })
  }
})

onMounted(() => {
  map.value = L.map('map').setView([29.44643394178572, -113.84859151327343], 6)

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map.value)
})
</script>

<style lang="scss" scoped>
.main-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  height: 100dvh;
  width: 100vw;
  width: 100dvw;

  .content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100vh;
    height: 100dvh;
    width: 100vw;
    width: 100dvw;

    .selector-card {
      display: flex;
      width: clamp(100px, 100vw, 1000px);
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
      background: rgba(0, 0, 0, 0.2);

      .selectors {
        display: flex;
        gap: 10px;
        align-items: center;
      }
      div {
        width: 100%;
      }
    }
  }

  .map-container {
    position: relative; /* Ensure this is relative so absolute positioning works inside */
    display: flex;
    width: 100%;
    height: 100%;
    justify-content: center;
    align-items: center;
    box-sizing: border-box;

    #map {
      width: 100%;
      height: 100%;
      min-width: 300px;
      z-index: 0; /* Ensure the map stays behind */
    }
  }

  .route-card {
    position: absolute; // Puts it on top of the map
    bottom: 0px;
    right: 0%;
    min-height: 200px;
    max-width: 600px;
    width: calc(100% - 30px);
    margin: 10px 15px;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
    background: rgba(0, 0, 0, 0.8);
    z-index: 2; /* Ensure it's above the map */
  }
}

@media screen and (max-width: 768px) {
  .selectors {
    display: flex;
    flex-direction: column;
  }
}
</style>
