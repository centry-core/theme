window.activeProject = {
    backendUrl: () => new URL('/api/v1/projects/session', location.origin),
    localStorageKey: 'selectedProject',
    fetch: async () => {
        const resp = await fetch(activeProject.backendUrl())
        if (resp.ok) {
            const projectData = await resp.json()
            return projectData.id
        }
        return null
    },
    get: async () => {
        let projectId = localStorage.getItem(activeProject.localStorageKey)
        if (projectId === null) {
            projectId = await activeProject.fetch()
        }
        projectId === null ?
            await activeProject.delete(false)
            :
            activeProject.set_local(projectId)
        return projectId
    },
    set: async id => {
        // console.log('setting proj id', id)
        const resp = await fetch(`${activeProject.backendUrl()}/${id}`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: {}
        })
        if (resp.ok) {
            // const resp_msg = await resp.json()
            activeProject.set_local(id)
            return id
        } else {
            await activeProject.delete(false)
            return null
        }
    },
    set_local: id => localStorage.setItem(activeProject.localStorageKey, id),
    delete: async (make_request = true) => {
        const projectId = localStorage.getItem(activeProject.localStorageKey)
        localStorage.removeItem(activeProject.localStorageKey)
        make_request && await fetch(`${activeProject.backendUrl()}/${projectId}`, {
            method: 'DELETE',
        })
    }
}

window.getSelectedProjectId = () => localStorage.getItem(activeProject.localStorageKey)
$(document).on('vue_init', () => window.getSelectedProjectId = () => vueVm.project_id)

window.wait_for = async (prop_name, root = window, poll_length = 500) => {
    while (!root.hasOwnProperty(prop_name))
        await new Promise(resolve => setTimeout(resolve, poll_length))
    return root[prop_name]
}

const format_numbers = () => {
    const number_formatter = Intl.NumberFormat('en', {notation: 'compact'})
    $('.compact-format').each((_, i) => {
        if (!isNaN(i.innerText)) {
            i.innerText = number_formatter.format(i.innerText)
        }
    })
}
$(document).on('vue_init', format_numbers)