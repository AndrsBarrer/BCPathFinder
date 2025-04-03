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
  { name: 'Agua Prieta' },
  { name: 'Cabo San Lucas' },
  { name: 'Caborca' },
  { name: 'Cananea' },
  { name: 'Ciudad Constitucion' },
  { name: 'Ciudad Obregon' },
  { name: 'Ensenada' },
  { name: 'Guaymas' },
  { name: 'Guerrero Negro' },
  { name: 'Hermosillo' },
  { name: 'La Paz' },
  { name: 'Mexicali' },
  { name: 'Moctezuma' },
  { name: 'Mulege' },
  { name: 'Nogales' },
  { name: 'Puerto Penasco' },
  { name: 'Rosarito' },
  { name: 'San Carlos' },
  { name: 'San Felipe' },
  { name: 'San Jose del Cabo' },
  { name: 'San Luis Rio Colorado' },
  { name: 'San Quintin' },
  { name: 'Santa Ana' },
  { name: 'Santa Rosalia' },
  { name: 'Sonoyta' },
  { name: 'Tecate' },
  { name: 'Tijuana' },
])

// If the start/goal value is different than the old value, rerun the path finder
const start = ref(null)
const goal = ref(null)

const path = ref(null)
// For now this will be instant, but I should include a button that says GO
watch([start, goal], ([newStart, newGoal]) => {
  console.log('Updated:', newStart?.name, newGoal?.name)
  if (newStart && newGoal) {
    path.value = dfs(graph, newStart.name, newGoal.name)
    console.log('Path taken:', path)
  }
})

onMounted(() => {
  const map = L.map('map').setView([27.728771759148433, -113.14918884489447], 6)

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map)
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
    border: 10px solid red;
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
    border: 10px solid red;
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
