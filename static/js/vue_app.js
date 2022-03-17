window.vueApp = Vue.createApp({
    delimiters: ['[[', ']]'],
    components: {
    },
    mounted() {
        console.info('Vue App mounted')
    },
    data() {
        return {
            lr_table: {
                data: [
                    {
                        id: 1,
                        name: 'Item 1',
                        price: '$1'
                    }
                ],
                columns: [
                    {
                        title: 'Item ID',
                        field: 'id'
                    },
                    {
                        field: 'name',
                        title: 'Item Name'
                    }, {
                        field: 'price',
                        title: 'Item Price'
                    }
                ],
                options: {
                    search: true,
                    showColumns: true
                }
            },
            page_size: 10,
            navbar_secondary: {},
            navbar_main: {},
            registered_components: {},
        }
    },
    // watch: {
    //     page_size(new_value, old_value) {
    //         const el = $($('table')[3])
    //         // const ps = el[0].dataset.pageSize
    //         new_value > 0 && el.bootstrapTable('refresh', {pageSize: new_value, silent: true})
    //     }
    // },
    methods: {
        set_data_key(key) {
            console.log('set_data_key', key)
            // Object.assign(this.$data, {...this.$data, ...this.string_to_object(key)})
            Object.assign(this.$data, {...this.$data, [key]: {}})
        },
        register(name, component, bind_data = true) {
            console.log('register called', name, component)
            this.registered_components[name] = component
            bind_data && Object.assign(this.$data, {...this.$data, [name]: component.$data})
        }

    }
})

const register_component = (name, component) => {
    console.log('registering', name, component)
    const original_func = component.mounted
    component.mounted = function () {
        this.instance_name && this.$emit('register', this.instance_name, this)
        original_func && original_func.bind(this)()
    }
    component.emits ?
        !component.emits.includes('register') && component.emits.push('register')
        :
        component.emits = ['register']
    window.vueApp.component(name, component)
}
window.vueApp.config.compilerOptions.isCustomElement = tag => ['h9', 'h13', 'h7'].includes(tag)
// window.vueApp.config.errorHandler = (err, instance, info) => {
//   console.warn('VUE ERROR', err, instance, info)
// }
// window.vueApp.config.globalProperties.register = (name, component, bind_data = true) => vueVm.register(name, component, bind_data = true)
// window.vueApp.config.globalProperties.string_to_object = (str, separator='.') => str.split(separator).reverse().reduce(
//     (accum, value) => ({[value]: {...accum}}),
//     {}
// )
// window.vueApp.config.warnHandler = (msg, instance, trace) => {
//     const dataNode = msg.match(/Property "(?<dataNode>.*)" was accessed during render but is not defined on instance/)?.groups.dataNode
//     if (dataNode === undefined){
//         console.warn(msg)
//     } else {
//         instance.set_data_key(dataNode)
//         console.log('inst', instance)
//     }
// }

$(document).ready(() => {
    window.vueVm = vueApp.mount('#vue_mountpoint')
})