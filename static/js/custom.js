window.activeProject = {
    backendUrl: '/api/v1/project-session',
    localStorageKey: 'selectedProject',
    fetch: async () => {
        const resp = await fetch(activeProject.backendUrl)
        if (resp.ok) {
            const projectData = await resp.json()
            return projectData.id
        }
        return null
    },
    get: async () => {
        let projectId = localStorage.getItem(activeProject.localStorageKey)
        if (projectId === null) {
            projectId = await activeProject.fetch().then(id => {
                id === null ?
                    activeProject.delete()
                    :
                    activeProject.set(id)
                return id
            })
        }
        return projectId
    },
    set: async id => {
        // console.log('setting proj id', id)
        const resp = await fetch(`${activeProject.backendUrl}/${id}`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: {}
        })
        if (resp.ok) {
            const resp_msg = await resp.json()
            localStorage.setItem(activeProject.localStorageKey, id)
            console.log(resp_msg)
            return id
        } else {
            activeProject.delete()
            return null
        }
    },
    delete: () => localStorage.removeItem(activeProject.localStorageKey)
}

window.getSelectedProjectId = () => localStorage.getItem(activeProject.localStorageKey)
$(document).on('vue_init', () => window.getSelectedProjectId = () => vueVm.project_id)

// function toggleAdvanced(id) {
//     $(`#${id}`).toggle();
// }

function removeParam(ev) {
    if (ev.target.parentNode.parentNode.classList.contains("flex-row")) {
        ev.target.parentNode.parentNode.remove();
    } else {
        ev.target.parentNode.parentNode.parentNode.remove();
    }
}

function addParam(id, key = "", value = "") {
    $(`#${id}`).append(
        `<div class="d-flex flex-row">
            <div class="flex-fill">
                <input type="text" class="form-control form-control-alternative" placeholder="${key}">
            </div>
            <div class="flex-fill pl-3">
                <input type="text" class="form-control form-control-alternative" placeholder="${value}">
            </div>
            <div class="m-auto pl-3">
                <button type="button" class="btn btn-32 btn-action" onclick="removeParam(event)"><i class="fas fa-minus"></i></button>
            </div>
        </div>
    `)
}

const wait_for = async (prop_name, root = window, poll_length = 1000) => {
    while (!root.hasOwnProperty(prop_name))
        await new Promise(resolve => setTimeout(resolve, poll_length))
    return root[prop_name]
}