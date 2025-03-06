const vueCoreApp = {
    delimiters: ['[[', ']]'],
    components: {},
    data() {
        return {
            user: {},
            project_id: undefined,
            mode: undefined,
            registered_components: {},
            custom_data: {}
        }
    },
    mounted() {
        this.mode = this.$el.parentElement.dataset.mode
        // this.project_id = this.mode === 'administration' ? this.mode : this.$el.parentElement.dataset.projectId
        this.project_id = parseInt(this.$el.parentElement.dataset.projectId)

        this.patchActiveProject()
        // activeProject.get().then(id => {
        //     this.project_id = id
        // })
        console.info('VueApp mounted')
        $(() => document.dispatchEvent(new Event('vue_init')))
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
        },
        build_api_url(plugin, file_name, options = {}) {
            const opts = Object.assign({
                mode: this.mode || 'default',
                api_version: 1,
                trailing_slash: false,
                skip_mode: false
            }, options)
            const {mode, api_version, trailing_slash, skip_mode} = opts
            const struct = []
            if (window.url_prefix.trim()) {
              struct.push(window.url_prefix)
              struct.push('api')
            } else {
              struct.push('/api')
            }
            struct.push(`v${api_version}`)
            struct.push(plugin)
            struct.push(file_name)
            !skip_mode && struct.push(mode)
            !!trailing_slash && struct.push('')
            return struct.join('/')
        }
    }
}
const vueAppFactory = appObject => Vue.createApp(appObject)

window.vueApp = vueAppFactory(vueCoreApp)

const register_component = (name, component) => {
    const patch_component_props = component => {
        if (component.props !== undefined) {
            if (Array.isArray(component.props)) {
                !component.props.includes('instance_name') && component.props.push('instance_name')
            } else {
                if (!('instance_name' in component.props)) {
                    component.props.instance_name = {type: String}
                }
            }
        } else {
            component.props = ['instance_name']
        }
    }
    const patch_component_mounted = component => {
        const original_func = component.mounted
        component.mounted = function () {
            this.instance_name && this.$emit('register', this.instance_name, this)
            original_func && original_func.bind(this)()
        }
        component.emits ?
            !component.emits.includes('register') && component.emits.push('register')
            :
            component.emits = ['register']
    }
    patch_component_props(component)
    patch_component_mounted(component)
    console.debug('register_component', name, component)
    // window.vueApp.component(name.toLowerCase(), component) // maybe we should move to lower-register components only
    window.vueApp.component(name, component)
}
window.vueApp.config.compilerOptions.isCustomElement = tag => ['h9', 'h13', 'h7', 'h12'].includes(tag)
window.vueApp.config.globalProperties.window = window
window.vueApp.config.globalProperties.navigator = navigator
// window.vueApp.config.productionTip = false
// window.vueApp.config.devtools = false


$(() => {
    window.vueVm = vueApp.mount('#vue_mountpoint')
    window.V = window.vueVm
})
