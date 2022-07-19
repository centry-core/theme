const SourceCard = {
    Manager: id => {
        const el = $('#' + id)
        const tab_mapping = {
            git_ssh: {
                tab_id: 'nav-git-tab',
                input_mapping: {
                    repo: '#repo',
                    private_key: '#repo_key',
                    branch: '#repo_branch'
                },
            },
            git_https: {
                tab_id: 'nav-git-https-tab',
                input_mapping: {
                    repo: '#repo_https',
                    branch: '#repo_branch_https',
                    username: '#repo_user',
                    password: '#repo_pass',
                },
            },
            artifact: {
                tab_id: 'nav-file-tab',
                input_mapping: {
                    file: '#file'
                },
            },
            local: {
                tab_id: 'nav-local-file-tab',
                input_mapping: {
                    path: '#local_file'
                },
            }
        }
        const get_active_tab = () => {
            const active_tab_id = el.find('#nav-tab a.nav-item.active').attr('id')
            return Object.entries(tab_mapping).find(item => item[1].tab_id === active_tab_id)[0]
        }
        return {
            el,
            tab_mapping,
            get_active_tab,
            get: () => {
                console.log('SOURCE get', this)

                // const reverse_tab_mapping = Object.entries(tab_mapping).reduce(
                //     (acc, item) => {
                //         acc[item[1]] = item[0]
                //         return acc
                //     }, {})

                const active_tab = get_active_tab()
                return Object.entries(tab_mapping[active_tab].input_mapping).reduce(
                    (acc, item) => {
                        acc[item[0]] = el.find(item[1]).val()
                        return acc
                    }, {name: active_tab})
                // switch (active_tab) {
                //     case 'git_ssh':
                //
                //     case 'git_https':
                //         return {
                //             name: 'git_https',
                //             repo: el.find('input#repo_https').val(),
                //             branch: el.find('input#repo_branch_https').val(),
                //             username: el.find('input#repo_user').val(),
                //             password: el.find('input#repo_pass').val(),
                //         }
                //     case 'artifact':
                //         return {
                //             name: 'artifact',
                //             file: $('input#file').val(),
                //         }
                //     case 'bucket':
                //         return {
                //             name: 'bucket',
                //             path: $('input#local_file').val(),
                //         }
                //     default:
                // }
                // return {}
            },
            set: data => {
                console.log('SOURCE set', data)

                Object.entries(data).forEach(([k, v]) => {
                    if (k !== 'name') {
                        const input_id = tab_mapping[data.name]?.input_mapping[k]
                        input_id && el.find(input_id).val(v)
                        !input_id && console.error('Unknown source:', data.name, k)
                    }
                })
                // switch (data.name) {
                //     case 'git_ssh':
                //
                //         el.find('input#repo').val(data.repo)
                //         el.find('input#repo_key').val(data.private_key)
                //         el.find('input#repo_branch').val(data.branch)
                //         break
                //     case 'git_https':
                //         el.find('input#repo_https').val(data.repo)
                //         el.find('input#repo_branch_https').val(data.branch)
                //         el.find('input#repo_user').val(data.username)
                //         el.find('input#repo_pass').val(data.password)
                //         break
                //     case 'artifact':
                //         // $('input#file').val()
                //         break
                //     case 'bucket':
                //         el.find('input#local_file').val(data.path)
                //         break
                //     default:
                //         console.error('Unknown source:', data.name)
                // }
                el.find('a#' + tab_mapping[data.name]?.tab_id).tab('show')
            },
            clear: () => {
                console.log('SOURCE clear')
                el.find('input#repo').val('')
                el.find('input#repo_key').val('')
                el.find('input#repo_branch').val('')
                el.find('input#repo_https').val('')
                el.find('input#repo_branch_https').val('')
                el.find('input#repo_user').val('')
                el.find('input#repo_pass').val('')
                el.find('input#file').val('')
                el.find('input#local_file').val('')
                el.find('a#' + tab_mapping['git_ssh']?.tab_id).tab('show')
            },
            setError: data => {
                // x = [
                //     {
                //         "loc": [
                //             "__root__",
                //             "repo"
                //         ],
                //         "msg": "none is not an allowed value",
                //         "type": "type_error.none.not_allowed"
                //     },
                //     {
                //         "loc": [
                //             "__root__",
                //             "private_key"
                //         ],
                //         "msg": "none is not an allowed value",
                //         "type": "type_error.none.not_allowed"
                //     }
                // ]
                const active_tab = get_active_tab()
                console.log('SOURCE setError', data, active_tab)
                data.forEach(({loc, msg}) => {
                    const input_mapping = tab_mapping[active_tab]?.input_mapping
                    input_mapping && loc.forEach(l => {
                        if (l in input_mapping) {
                            el.find(input_mapping[l]).addClass('is-invalid')
                            el.find(input_mapping[l] + '_error').text(msg)
                        }
                    })
                })
            },
            clearErrors: () => {
                // el.removeClass('is-invalid')
                console.log('SOURCE clearErrors')
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