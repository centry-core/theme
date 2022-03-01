var backendUrl = '/api/v1/project-session';
var projectSelectId = '#projectSelect';


async function setSelectedProjectOnBackend(projectId) {
    const resp = await fetch(`${backendUrl}/${projectId}`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: {}
    });
    if (resp.ok) {
        return await resp.json()
    }

}


async function getSelectedProjectIdFromBackend() {
    const resp = await fetch(backendUrl);
    if (resp.ok) {
        const projectData = await resp.json();
        return projectData.id
    }
    return null
}


function getProjectNameFromId(projectId) {
    return $(projectSelectId).find(`[project_id=${projectId}]`).val()
}


function setSelectedProjectOnPage(projectId) {
    localStorage.setItem(selectedProjectLocalStorageKey, projectId);
    $(projectSelectId).selectpicker('val', getProjectNameFromId(projectId))
}


async function loadProject() {
    const projectId = await getSelectedProjectIdFromBackend();
    setSelectedProjectOnPage(projectId);
};


async function setProject(projectId) {
    localStorage.setItem(selectedProjectLocalStorageKey, projectId);
    await setSelectedProjectOnBackend(projectId);
};


$(document).ready(() => {
    // Chapter dropdown init
    $('#chapterSelect').on('change', event => {
        location.search = $(event.target).find('option:selected').attr('data-href')
    })

    // Project dropdown init
    loadProject();
    $(projectSelectId).on('change', event => {
        setProject($(event.target).find(':selected').attr('project_id')).then(() => location.reload())
    });
})

const NavbarApp = {
    delimiters: ['[[', ']]'],
    props: ['modelValue'],
    emits: ['update:modelValue'],
    template: `
        <div id="1234">
            <div>
                Component data: [[ $data ]]
            </div>
            <div>
<!--            <button @click="tst2">tst2</button>-->
<!--            <button @click="log(this.$props)">Component PROPS</button>-->

    <!--                    :q="q" :count="1" -->
    <!--                    :some_input="some_input" -->
                <div>
                    modelValue input:
                    <input @input="modelValue.some_input = $event.target.value" :value="modelValue.some_input">
                </div>
                <div>
                    naitve input:
                    <input @input="some_input = $event.target.value" :value="some_input">
                </div>
                <slot :q="q"></slot>
            </div>
        </div>
    `,
    mounted() {
        this.rnd = ~~(Math.random() * 100)
        console.log('navbar app mounted', this.$props, this.$data)
        this.$emit('update:modelValue', this.$data)
    },
    // created() {
    //     console.log('navbar app created', this.$props, this.$data)
    //     // this.$emit('update:modelValue', this.$data)
    // },
    data() {
        return {
            q: 123,
            rnd: 0,
            some_input: 'Initial State',
        }
    },
    methods: {
        // report_to_parent(e) {
        //     console.log('report_to_parent', e.target.value)
        //     this.some_input = e.target.value
        //     // this.$emit('update:navbar_main', this.$data)
        // },
        log(val) {
            console.log(val)
        },
        tst2() {
            this.log(this.modelValue)
        }
    },
    // watch: {
    //     some_input(new_value, old_value) {
    //         console.log(old_value, '-->', new_value, this.$data)
    //         this.$emit('update:navbar_main', this.$data)
    //     }
    // }
}

// let handler = {
//     get: function (target, name) {
//         console.log('handler.get', target, name)
//         if (!target.hasOwnProperty(name)) {
//             target[name] = new Proxy({}, handler)
//         }
//         return target[name]
//         // return target.hasOwnProperty(name) ? target[name] : new Proxy({}, handler)
//     }
// }
//
// const NavBarVue = Vue.createApp({
//     delimiters: ['[[', ']]'],
//     // components: {'NavbarApp': NavbarApp},
//     data() {
//         return {navbar_secondary: {}, navbar_main: {}}
//         // return new Proxy({}, handler)
//         return {}
//     }
// })
//
//
//
// NavBarVue.component('NavbarApp', NavbarApp)
// const NavbarVm = NavBarVue.mount('#testNavBarNav')
// NavbarVm.data['navbar_secondary'] = new Proxy({}, handler)
// NavbarVm.data['navbar_main'] = new Proxy({}, handler)

vueApp.component('NavbarApp', NavbarApp)