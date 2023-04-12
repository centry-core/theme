const NavbarCentry = {
    delimiters: ['[[', ']]'],
    props: [
        'instance_name',
        'sections', 'subsections', 'modes',
        'user', 'logo_url',
        'active_section', 'active_subsection',
        'active_project', 'active_mode', 'active_parameter',
        'is_admin_user',
    ],
    template: `
<nav class="navbar navbar-expand main-nav justify-content-between" style="position: fixed; top: 0; width: 100%; z-index: 1000;">
    <div class="d-flex chapters">
        <a class="logo" href="/">
            <img :src="logo_url" alt="centry">
        </a>
        <select class="selectpicker" data-style="btn-chapters"
            name="section_select"
            ref="sectionSelect"
            @change="handle_section_change"
            :value="active_section"
            >
            <option v-for="section in sections" :value="section.key" :key="section.key">[[ section.name ]]</option>
        </select>
    </div>

    <ul class="navbar-nav w-100" style="overflow-x: scroll; padding-top: 10px" v-if="!isDeveloperMode">
        <li class="nav-item active" v-for="subsection in subsections" :key="subsection.key">
            <a :href="get_subsection_href(subsection.key)"
               :class="{'nav-link': true, active: subsection.key === active_subsection }"
            >
                [[ subsection.name ]]
                <span v-if="subsection.key === active_subsection" class="sr-only">(current)</span>
            </a>
        </li>
    </ul>
    
    <div>
         <select 
            class="font-weight-400 mr-2"
            data-style="btn"
            data-dropdown-align-right="true"
            name="project_select"
            id="project_select"
            v-if="is_project_mode"
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
    </div>
    
    <div>
        [[ active_mode ]]
    </div>
    
    <div class="dropdown ml-1 mr-3">
        <button class="btn btn-xs btn-table btn-icon__xs" type="button"
                id="userDropDown" data-toggle="dropdown"
                aria-haspopup="true" aria-expanded="false">
            <i class="icon__16x16 icon-user"></i>
        </button>
        <div class="dropdown-menu dropdown-menu-right" aria-labelledby="userDropDown">
            <span class="dropdown-item-text px-3 font-h5">[[ user.name ]]</span>
            <span class="dropdown-item-text px-3 font-h5">[[ user.email ]]</span>
            <div v-if="modes.length > 0" class="dropdown-divider"></div>
            <template v-if="modes.length > 0">
                <a
                    v-for="mode in modes"
                    :href="mode.href"
                    class="dropdown-item"
                >
                    <span class="d-inline-block">[[ mode.name ]]</span>
                    <i v-if="mode.key === active_mode" class="icon__16x16 icon-check__16"></i>
                </a>
            </template>
            <div class="dropdown-divider"></div>
            <button class="dropdown-item" type="button" @click.prevent="handle_logout">Logout</button>
        </div>
    </div>
</nav>
    `,
    data() {
        return {
            projects: [],
            isAdmin: false,
        }
    },
    async mounted() {
        this.isAdmin = this.is_admin_user
    },
    computed: {
        is_project_mode() {
            return ['default', 'project'].includes(this.active_mode)
        },
        isDeveloperMode() {
            return this.active_mode === 'developer';
        }
    },
    watch: {
        projects(newValue, oldValue) {
            this.$nextTick(() => $('#project_select').selectpicker('refresh'))
        },
        active_mode(newValue) {
            this.$nextTick(async () => {
                if (this.is_project_mode) {
                    await this.fetch_projects()
                }
            })
        }
    },
    methods: {
        get_section_href(section_key) {
            if (this.is_project_mode) {
                return `/-/${section_key}`
            } else if (this.active_parameter === null) {
                return `/~/${this.active_mode}/~/${section_key}`
            } else {
                return `/~/${this.active_mode}/~/${this.active_parameter}/~/${section_key}`
            }
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
            const api_url = this.$root.build_api_url('projects', 'project', {
                trailing_slash: true
            })
            // todo: use api_url
            // const resp = await fetch(api_url)
            const resp = await fetch('/api/v1/projects/project/')
            if (resp.ok) {
                this.projects = await resp.json()
            }
        },
        async handle_project_change(event) {
            const new_id = await activeProject.set(event.target.value)
            if (!new_id) return

            // get current plugins list
            // const newProject = this.projects.filter(proj => proj.id === new_id)[0]
            const newProject = this.projects.find(proj => proj.id.toString() === new_id.toString())
            const newSections = newProject.plugins
            const currentSection = this.$refs.sectionSelect.value

            const withinSections = newSections.filter(section => section === currentSection).length > 0
            if (!withinSections && newSections.length > 0 && !this.isAdmin) {
                const newSection = newSections[0]
                location.href = this.get_section_href(newSection)
                this.$refs.sectionSelect.value = newSection
            } else {
                location.reload()
            }
        }
    }
}

register_component('Navbar', NavbarCentry)
