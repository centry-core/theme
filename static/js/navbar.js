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
    props: ['instance_name', 'project_id', 'chapters'],
//     template: `
// <nav class="navbar navbar-expand-xl main-nav">
//     <div class="d-flex chapters">
//         <div class="logo"><img src="assets/ico/logo.svg"></div>
//         <select class="selectpicker" data-style="btn-chapters">
//             <option>Mustard</option>
//             <option>Ketchup</option>
//             <option>Relish</option>
//         </select>
//     </div>
//     <button class="navbar-toggler btn-primary" type="button" data-toggle="collapse" data-target="#chapterSelectNav"
//             aria-controls="chapterSelectNav" aria-expanded="false" aria-label="Toggle navigation">
//         <i class="fas fa-bars"></i>
//     </button>
//     <div class="collapse navbar-collapse" id="chapterSelectNav">
//         <div class="navbar-nav">
//             <a class="nav-link" href="#">Link 1</a>
//             <a class="nav-link" href="#">Link 2</a>
//             <a class="nav-link" href="#">Link 3</a>
//             <a class="nav-link disabled" href="#" tabindex="-1" aria-disabled="true">Disabled</a>
//         </div>
//     </div>
//
//     <select id="projectSelect" class="selectpicker" data-style="btn-projects" data-dropdown-align-right="true">
//         <option>Mustard</option>
//         <option>Ketchup</option>
//         <option>Relish</option>
//         <option>Some long ass creepy name</option>
//     </select>
//     <div class="vl"></div>
//     <div class="dropdown ml-1">
//         <button class="btn btn-primary dropdown-toggle" type="button" id="userDropDown" data-toggle="dropdown"
//                 aria-haspopup="true" aria-expanded="false">
//             <i class="far fa-user-circle"></i>
//         </button>
//         <div class="dropdown-menu dropdown-menu-right" aria-labelledby="userDropDown">
//             <button class="dropdown-item" type="button">Account page</button>
//             <button class="dropdown-item" type="button">Login Form</button>
//         </div>
//     </div>
// </nav>
//     `,
    template: `
    <slot></slot>
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
    methods: {}
}

register_component('Navbar', Navbar)