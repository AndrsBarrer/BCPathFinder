import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

// Primevue
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'

import App from './App.vue'
import router from './router'

import Select from 'primevue/select'
import MultiSelect from 'primevue/multiselect'
import FloatLabel from 'primevue/floatlabel'

const app = createApp(App)

app.component('SelectComponent', Select)
app.component('MultiSelect', MultiSelect)
app.component('FloatLabel', FloatLabel)

app.use(PrimeVue, {
  theme: {
    preset: Aura,
  },
})

app.use(createPinia())
app.use(router)

app.mount('#app')
