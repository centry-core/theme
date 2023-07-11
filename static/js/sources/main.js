const SourceCard = {
    Manager: id => {
        const el = $('#' + id)
        const tab_mapping = {
            git_ssh: {
                tab_id: 'git-ssh-tab',
                input_mapping: {
                    repo: '#repo',
                    private_key: '#repo_key',
                    branch: '#repo_branch',
                    password: '#repo_ssh_pass',
                },
            },
            git_https: {
                tab_id: 'git-https-tab',
                input_mapping: {
                    repo: '#repo',
                    branch: '#repo_branch_https',
                    username: '#repo_user',
                    password: '#repo_pass',
                },
            },
            artifact: {
                tab_id: 'nav-file-tab',
                input_mapping: {},
            },
            local: {
                tab_id: 'nav-local-file-tab',
                input_mapping: {
                    path: '#local_file'
                },
            },
            container: {
                tab_id: 'nav-container-image-tab',
                input_mapping: {
                    image_name: '#container_image'
                },
            }
        }
        const get_active_tab = (active_tab_id = undefined) => {
            if (!active_tab_id) {
                active_tab_id = el.find('#nav-tab a.nav-item.active').attr('id')
                if (active_tab_id === 'nav-git-tab') {
                    active_tab_id = el.find('#git-type-tab .nav-item a.active').attr('id')
                }
            }
            return Object.entries(tab_mapping).find(item => item[1].tab_id === active_tab_id)[0]
        }
        return {
            el,
            tab_mapping,
            get_active_tab,
            get: () => {
                const active_tab = get_active_tab()
                let mapping_obj
                if (active_tab === 'artifact') {
                    const instance_name = el.find('div[instance_name]').attr('instance_name')
                    mapping_obj = {
                        name: active_tab,
                        file_name: V[instance_name].file?.name,
                    }
                    if (V[instance_name].file.size) {
                        mapping_obj.file = V[instance_name].file
                    }
                } else {
                    mapping_obj = Object.entries(tab_mapping[active_tab].input_mapping).reduce(
                        (acc, item) => {
                            acc[item[0]] = el.find(item[1]).val()
                            return acc
                        }, {name: active_tab}
                    )
                }
                return mapping_obj
            },
            set: data => {
                Object.entries(data).forEach(([k, v]) => {
                    if (k !== 'name') {
                        const input_id = tab_mapping[data.name]?.input_mapping[k]
                        if (['file_name', 'bucket'].includes(k)) {
                            if (k === "file_name") {
                                const instance_name = el.find('div[instance_name]').attr('instance_name')
                                V[instance_name].file = {name: v}
                            }
                            return
                        }
                        input_id && el.find(input_id).val(v)
                        !input_id && console.error('Unknown source:', data.name, k)
                    }
                })

                if (data.name.includes('git')) {
                    el.find('a#nav-git-tab').tab('show')
                }
                el.find('a#' + tab_mapping[data.name]?.tab_id).tab('show')
            },
            clear: () => {
                const artifact_instance_name = el.find('div[instance_name]').attr('instance_name')
                V.registered_components[artifact_instance_name]?.handle_delete_file()
                el.find('input#repo').val('')
                el.find('input#repo_key').val('')
                el.find('input#repo_branch').val('')
                el.find('input#repo_branch_https').val('')
                el.find('input#repo_user').val('')
                el.find('input#repo_pass').val('')
                el.find('input#repo_ssh_pass').val('')
                el.find('input#file').val('')
                el.find('input#local_file').val('')
                el.find('input#container_image').val('')
                el.find('a#nav-git-tab').tab('show')
                el.find('a#' + tab_mapping['git_ssh']?.tab_id).tab('show')
            },
            setError: data => {
                const active_tab = get_active_tab()
                if (active_tab === 'artifact') {
                    const artifact_instance_name = el.find('div[instance_name]').attr('instance_name')
                    V.registered_components[artifact_instance_name]?.set_error(data)
                } else {
                    data.forEach(({loc, msg}) => {
                        const input_mapping = tab_mapping[active_tab]?.input_mapping
                        input_mapping && loc.forEach(l => {
                            if (l in input_mapping) {
                                el.find(input_mapping[l]).addClass('is-invalid')
                                el.find(input_mapping[l] + '_error').text(msg)
                            }
                        })
                    })
                }

            },
            clearErrors: () => {
                Object.values(tab_mapping).reduce((acc, item) => {
                    acc = [...acc, ...Object.values(item.input_mapping)]
                    return acc
                }, []).forEach(item => {
                    el.find(item).removeClass('is-invalid')
                    el.find(item + '_error').text()
                })
            }
        }
    }
}
