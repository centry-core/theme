// var projectSelectId = '#projectSelect';


// function getProjectNameFromId(projectId) {
//     return $(projectSelectId).find(`[project_id=${projectId}]`).val()
// }


// function setSelectedProjectOnPage(projectId) {
//
//     $(projectSelectId).selectpicker('val', getProjectNameFromId(projectId))
// }


// async function loadProject() {
//     const projectId = await getSelectedProjectIdFromBackend();
//     localStorage.setItem(selectedProjectLocalStorageKey, projectId);
//     setSelectedProjectOnPage(projectId);
// };


// async function setProject(projectId) {
//     localStorage.setItem(selectedProjectLocalStorageKey, projectId)
//     await setSelectedProjectOnBackend(projectId)
// };

//
// $(document).ready(() => {
//     // Chapter dropdown init
//     $('#chapterSelect').on('change', event => {
//         location.search = $(event.target).find('option:selected').attr('data-href')
//     })
//
//     // Project dropdown init
//     // loadProject();
//     $(projectSelectId).on('change', event => {
//         // setProject($(event.target).find(':selected').attr('project_id')).then(() => location.reload())
//     });
// })

const Navbar_centry = {
    delimiters: ['[[', ']]'],
    props: [
        'instance_name',
        'sections', 'subsections',
        'user', 'logo_url',
        'active_section', 'active_subsection',
        'active_project'
    ],
    template: `
<nav class="navbar navbar-expand main-nav">
    <div class="d-flex chapters">
        <a class="logo" href="/">
            <img :src="logo_url" alt="centry">
        </a>
        <select class="selectpicker" data-style="btn-chapters" 
            name="section_select"
            @change="handle_section_change" 
            :value="active_section"
            >
            <option v-for="section in sections" :value="section.key" :key="section.key">[[ section.name ]]</option>
        </select>
    </div>

    <ul class="navbar-nav w-100" style="overflow-x: scroll">
        <li class="nav-item active" v-for="subsection in subsections" :key="subsection.key">
            <a :href="get_subsection_href(subsection.key)"
               :class="{'nav-link': true, active: subsection.key === active_subsection }"
            >
                [[ subsection.name ]]
                <span v-if="subsection.key === active_subsection" class="sr-only">(current)</span>
            </a>
        </li>
    </ul>

    <select class="selectpicker" data-style="btn-projects" data-dropdown-align-right="true"
        name="project_select"
        id="project_select"
        v-if="projects.length > 0"
        :value="active_project"
        @change="handle_project_change"
    >
        <option v-for="project in projects" 
            :value="project.id" 
            :key="project.id"
        >
            [[ project.name ]]
        </option>
    </select>
    <div class="vl"></div>
    <div class="dropdown ml-1">
        <button class="btn btn-primary dropdown-toggle" type="button"
                id="userDropDown" data-toggle="dropdown"
                aria-haspopup="true" aria-expanded="false">
            <i class="far fa-user-circle"></i>
        </button>
        <div class="dropdown-menu dropdown-menu-right" aria-labelledby="userDropDown">
            <h6 class="dropdown-header">[[ user.name ]]</h6>
            <h9 class="dropdown-header">[[ user.email ]]</h9>
            <div class="dropdown-divider"></div>
            <button class="dropdown-item" type="button" @click.prevent="handle_logout">Logout</button>
            
        </div>
    </div>
</nav>
    `,
    data() {
        return {
            projects: [],
        }
    },
    async mounted() {
        await this.fetch_projects()
    },
    watch: {
        projects(newValue, oldValue) {
            this.$nextTick(() => $('#project_select').selectpicker('refresh'))
        }
    },
    methods: {
        get_section_href(section_key) {
            return `/-/${section_key}`
        },
        get_subsection_href(subsection_key) {
            // if (subsection_key === this.active_subsection) {
            //     return '#'
            // }
            return `${this.get_section_href(this.active_section)}/${subsection_key}`
        },
        handle_section_change(event) {
            location.href = this.get_section_href(event.target.value)
        },
        async handle_logout() {
            await activeProject.delete()
            location.href = '/forward-auth/logout'
        },
        async fetch_projects() {
            const resp = await fetch('/api/v1/projects/project/')
            if (resp.ok) {
                const data = await resp.json()
                this.projects = data
                // $('#project_select').selectpicker('refresh')
            }
        },
        async handle_project_change(event) {
            const new_id = await activeProject.set(event.target.value)
            new_id !== null && location.reload()
        }
    }
}

register_component('Navbar', Navbar_centry)
