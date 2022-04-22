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

const Navbar = {
    delimiters: ['[[', ']]'],
    props: [
        'instance_name', 'project_id',
        'sections', 'subsections',
        'user', 'logo_url',
        'active_section', 'active_subsection'
    ],
    template: `
    <nav class="navbar navbar-expand main-nav">
        
        <div class="d-flex chapters">
            <a class="logo" href="/">
                <img :src="logo_url" alt="centry">
            </a>
            <select class="selectpicker" data-style="btn-chapters" @change="handle_section_change" :value="active_section">
                <option v-for="section in sections" :value="section.key" :key="section.key">[[ section.name ]]</option>
            </select>
        </div>

        <ul class="navbar-nav w-100" >
            <li class="nav-item active" v-for="subsection in subsections" :key="subsection.key">
                <a 
                    :href="get_subsection_href(subsection.key)" 
                    :class="{'nav-link': true, active: subsection.key === active_subsection }"
                >
                    [[ subsection.name ]] 
                    <span v-if="subsection.key === active_subsection" class="sr-only">(current)</span>
                </a>
            </li>
        </ul>

<!--        <select class="selectpicker" data-style="btn-projects" data-dropdown-align-right="true">-->
<!--            <option project_id="{{ item.id }}">{{ item.name }}</option>-->
<!--        </select>-->
        
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
                <button class="dropdown-item" type="button" 
                    v-for="action_name in ['Action (dummy)', 'Another action (dummy)', 'Logout (dummy)']"
                >
                    [[ action_name ]]
                </button>
            </div>
        </div>
    </nav>
    `,
    mounted() {
        // this.project_id = activeProject.get
        console.log('navbar props', this.$props)
    },
    data() {
        return {
            project_name: '',
        }
    },
    watch: {
        project_id(newValue, oldValue) {
            console.log('PROJECT ID CHANGED! ', oldValue, '->', newValue)
            // this.project_name = $(projectSelectId).find(`[project_id=${newValue}]`).val() // todo: change to select from internal props data
        },
        project_name(newValue, oldValue) {
            console.log('PROJECT NAME CHANGED! ', oldValue, '->', newValue)
        }
    },
    methods: {
        get_section_href(section_key) {
            return `/-/${section_key}`
        },
        get_subsection_href(subsection_key) {
            if (subsection_key === this.active_subsection) {
                return '#'
            }
            return `${this.get_section_href(this.active_section)}/${subsection_key}`
        },
        handle_section_change(event) {
            location.href = this.get_section_href(event.target.value)
        }
    }
}

register_component('Navbar', Navbar)