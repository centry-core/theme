const vueCoreApp = {
    delimiters: ['[[', ']]'],
    components: {
    },
    mounted() {
        this.patchActiveProject()
        activeProject.get().then(id => {
            this.project_id = id
        })
        console.info('VueApp mounted')
    },
    data() {
        return {
            project_id: undefined,
            registered_components: {},
        }
    },
    watch: {
        async project_id(newValue, oldValue) {
            console.log('project_id changed', oldValue, '->', newValue)
            if (oldValue !== undefined) {
                newValue !== null && await activeProject.set(newValue)
            }
        }
    },
    methods: {
        // set_data_key(key) {
        //     // Object.assign(this.$data, {...this.$data, ...this.string_to_object(key)})
        //     Object.assign(this.$data, {...this.$data, [key]: {}})
        // },
        register(name, component, bind_data = true) {
            console.debug('VueApp adding to registered_components', name, component)
            this.registered_components[name] = component
            bind_data && Object.assign(this.$data, {...this.$data, [name]: component.$data})
        },

        patchActiveProject() {
            console.debug('VueApp patching activeProject...')
            const memoized = {}
            memoized.get = activeProject.get
            activeProject.get = async () => {
                const result = await memoized.get()
                this.project_id = result
                return result
            }
            memoized.set = activeProject.set
            activeProject.set = async id => {
                const result = await memoized.set(id)
                this.project_id = result
                return result
            }
            memoized.delete = activeProject.delete
            activeProject.delete = async (make_request = true) => {
                this.project_id = null
                await memoized.delete(make_request)
            }
        }
    }
}
const vueAppFactory = appObject => Vue.createApp(appObject)

window.vueApp = vueAppFactory(vueCoreApp)

const register_component = (name, component) => {
    component.props ?
        !component.props.includes('instance_name') && component.props.push('instance_name')
        :
        component.props = ['instance_name']
    console.debug('register_component', name, component)
    const original_func = component.mounted
    component.mounted = function () {
        this.instance_name && this.$emit('register', this.instance_name, this)
        original_func && original_func.bind(this)()
    }
    component.emits ?
        !component.emits.includes('register') && component.emits.push('register')
        :
        component.emits = ['register']
    // window.vueApp.component(name.toLowerCase(), component) // maybe we should move to lower-register components only
    window.vueApp.component(name, component)
}
window.vueApp.config.compilerOptions.isCustomElement = tag => ['h9', 'h13', 'h7', 'h12'].includes(tag)


$(() => {
    window.vueVm = vueApp.mount('#vue_mountpoint')
    document.dispatchEvent(new Event('vue_init'))
})
