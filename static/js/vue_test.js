const SimpleList = {
    data() {
        return {
            selectedItems1: [],
            itemsList1: [
                {id: 1, title: 'Step 1'},
                {id: 2, title: 'Step 2'}
            ]
        }
    },
    watch: {
        selectedItems1: (val) => {
            console.log(`SELECTED ITEMS: ${val}`)
        }
    },
    template: `
            <div id="simpleList" class="dropdown_simple-list">
                <button class="btn btn-select dropdown-toggle" type="button"
                      data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                <span v-if="selectedItems1.length > 0">{{ selectedItems1.length }} selected</span>
                <span v-else class="complex-list_empty">Select Step</span>
                </button>
                <ul class="dropdown-menu close-outside"
                    v-if="itemsList1.length > 0">
                    <li class="dropdown-menu_item d-flex align-items-center px-3" v-for="item in itemsList1" :key="item.id">
                        <label
                            class="mb-0 w-100 d-flex align-items-center custom-checkbox">
                            <input
                                :value="item.title"
                                v-model="selectedItems1"
                                type="checkbox">
                            <span class="w-100 d-inline-block ml-3">{{ item.title }}</span>
                        </label>
                    </li>
                </ul>
                <div class="dropdown-menu py-0" v-else>
                    <span class="px-3 py-2 d-inline-block">There are no any steps.</span>
                </div>
            </div>`
}

const vueApp = Vue.createApp({
    delimiters: ['[[', ']]'],
    components: {
        SimpleList
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
            }
        }
    }
})

vueApp.config.compilerOptions.isCustomElement = tag => ['h9', 'h13', 'h7'].includes(tag)

$(document).ready(() => {
    window.vueVm = vueApp.mount('#vue_mountpoint')
})
