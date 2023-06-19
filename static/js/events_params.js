var EventParamsTable = {
    sourceFormatter(value, row, index, field) {
        options = EventParamsTable.generateOptions(value)
        return `
            <select
                class="selectpicker bootstrap-select__b mr-2" 
                data-style="btn"
                data-select-class="event_source_column"
                onchange="EventParamsTable.updateCell(this, '${index}', '${field}')"
            >
                <option>Select</option>
                ${options}
            </select>
        `
    },

    targetFormatter(value, row, index, field) {
        options = EventParamsTable.generateOptions(value)
        return `
            <select
                class="selectpicker bootstrap-select__b mr-2" 
                data-style="btn"
                data-select-class="event_target_column"
                onchange="EventParamsTable.updateCell(this, '${index}', '${field}')"
            >
                <option>Select</option>
                ${options}
            </select>
        `
    },

    eventFormatter(value, row, index, field) {
        options = EventParamsTable.generateEventOptions(value)
        return `
            <select
                class="selectpicker bootstrap-select__b mr-2" 
                data-style="btn"
                id="event_column"
                onchange="EventParamsTable.updateCell(this, '${index}', '${field}')"
            >
                <option>Select</option>
                ${options}
            </select>
        `
    },

    generateOptions(currentItemValue){
        columns = vueVm.registered_components?.boards_wrapper?.currentBoard.columns
        if (!columns || columns.length==0)
            return

        return columns.reduce((acc, curr) => {
            selected = curr.id == currentItemValue ? "selected" : ""
            return acc + `<option value="${curr.id}"${selected}>${curr.name}</option>`
        }, '')
    },

    generateEventOptions(currentItemValue){
        columns = [{'id': 'notify', 'name': 'Notify'}, {'id': 'send_email', 'name':'Send email'}]
        return columns.reduce((acc, curr) => {
            selected = curr.id == currentItemValue ? "selected" : ""
            return acc + `<option value="${curr.id}"${selected}>${curr.name}</option>`
        }, '')
    },

    addEmptyParamsRow: source => {
        $(source).closest('.section').find('.params-table').bootstrapTable(
            'append',
            {"source": null, "target": null, "event": null, "action": null}
        )
    },

    parametersDeleteFormatter(value, row, index) {
        return `
            <button type="button" class="btn btn-24 btn-action" onclick="EventParamsTable.deleteParams(${index}, this)">
                <i class="fas fa-trash-alt"></i>
            </button>
        `
    },

    deleteParams: (index, source) => {
        $(source).closest('.params-table').bootstrapTable('remove', {
            field: '$index',
            values: [index]
        })
    },

    updateCell: (el, row, field) => {
        const $table = $(el).closest('.section').find('.params-table')
        $table.bootstrapTable(
            'updateCell',
            {index: row, field: field, value: el.value}
        )
    },

    Manager: id => {
        const el = $('#' + id)
        const error_div = el.closest('div.col').find('.test_parameters_error')
        const get_col_by_name = name => el.bootstrapTable('getVisibleColumns').find(i => i.field.toLowerCase().trim() === name.toLowerCase())?.fieldIndex
        const get_col_by_title = name => el.bootstrapTable('getVisibleColumns').find(i => i.title.toLowerCase().trim() === name.toLowerCase())?.fieldIndex
        return {
            el,
            error_div,
            get_col_by_name,
            get_col_by_title,
            get: () => {
                data = el.bootstrapTable('getData')
                return data.map(row => {
                    return {
                        'event_name': row['event'], 
                        'values': {
                            'old_value': row['old_value'],
                            'new_value': row['new_value'],
                        }
                    }
                })

            },
            set: table_data => {
                el.bootstrapTable('load', table_data)
            },
            clear: () => el.bootstrapTable('load', []),
            clearValues: () => {
                oldValues = el.bootstrapTable('getData')
                newValues = oldValues.reduce((acc, curr) => {
                    curr['value'] = ""
                    curr['comparison'] = "eq"
                    acc.push(curr)
                    return acc
                },[])
                el.bootstrapTable('load', newValues)
            },
            setValues: (values) => {
                oldValues = el.bootstrapTable('getData')
                newValues = oldValues.reduce((acc, curr) => {
                    thresholdName = curr['name'].toLowerCase()
                    curr['value'] = values[thresholdName]['value']
                    curr['comparison'] = values[thresholdName]['comparison']
                    acc.push(curr)
                    return acc
                },[])
                el.bootstrapTable('load', newValues)
            },
            setError: data => {
                const _set_error = data_obj => {
                    const [root_error, row, col_name] = data_obj.loc
                    console.log(data_obj.msg)
                    
                    console.log(root_error, row, col_name)

                    if(row !== undefined && col_name !== undefined) {
                        el.find(
                            `tr[data-index=${row}] td:nth-child(${get_col_by_name(col_name) + 1}) input`
                        )
                            .addClass('is-invalid')
                            .next('div.invalid-tooltip-custom')
                            .text(data_obj.msg)
                    } else {
                        root_error === '__root__' && error_div.append(`<span>${data_obj.msg}</span><br/>`)
                    }
                }

                if (Array.isArray(data)) {
                    console.log(data)
                    data.forEach(item =>{
                        _set_error(item)
                    })
                } else {
                    _set_error(data)
                }
            },
            clearErrors: () => {
                el.removeClass('is-invalid')
                error_div.empty()
            }
        }
    }
}


$(document).on('vue_init', () => {
    $('.params-table').on('all.bs.table', () => {
        $('.selectpicker').selectpicker('render')
    })
})