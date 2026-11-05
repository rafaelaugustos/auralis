import { createApp, h, registerElement } from 'nativescript-vue'
import App from './App.vue'
import { AuroraView } from './scene/aurora-view'
import { GradientTitle } from './native/gradient-title'
import './app.css'

registerElement('AuroraView', () => AuroraView)
registerElement('GradientTitle', () => GradientTitle)
createApp({ render: () => h('Frame', {}, [h(App)]) }).start()
