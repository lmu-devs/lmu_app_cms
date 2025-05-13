import InterfaceComponent from './interface.vue'
import OptionsComponent from './options.vue'

export default {
    id: 'link-with-favicon',
    name: 'Link with Favicon',
    icon: 'link',
    description: 'A link field with favicon support',
    component: InterfaceComponent,
    options: OptionsComponent,
    types: ['json'],
    group: 'standard',
}
