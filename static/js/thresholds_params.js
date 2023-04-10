var ThresholdParamsTable = {
    thresholdTypeFormatter(value, row, index, field) {
        const is_disabled = row._name_class?.toLowerCase().includes('disabled')
        let options = is_disabled ? [value] : ['Critical', 'High', 'Medium', 'Low', 'Info', 'Errors']

        options = options.reduce((accum, item,) => {
            return `${accum}<option
                value='${item.toLowerCase()}'
                    ${item.toLowerCase() === value.toLowerCase() && 'selected'}
                >
                    ${item}
                </option>`

            }
            ,
            ''
        )
        return `
            <select 
                class="selectpicker bootstrap-select__b mr-2 ${row._name_class}" 
                data-style="btn" 
                ${is_disabled && 'disabled'}
                onchange="ThresholdParamsTable.updateCell(this, '${index}', '${field}')"
                >
                    ${options}
            </select>
        `
    },
    comparisonTypeFormatter(value, row, index, field) {
        const is_disabled = row._comparison_class?.toLowerCase().includes('disabled')
        let options = is_disabled ? [value] : ['eq', 'lte', 'gte', 'lt', 'gt']
        let opts_mapping = {
            "eq":"==",
            'lt':"<",
            'lte':"<=",
            'gte':">=",
            'gt':">"
        }
        options = options.reduce((accum, item,) => {
            return `${accum}<option value='${item}'
                ${item === value && 'selected'}
                >
                    ${opts_mapping[item]}
                </option>`
            }
            ,
            ''
        )
        return `
            <select 
                class="selectpicker bootstrap-select__b mr-2 ${row._comparison_class}" 
                data-style="btn" 
                ${is_disabled && 'disabled'}
                onchange="ThresholdParamsTable.updateCell(this, '${index}', '${field}')"
                >
                    ${options}
            </select>
        `
    },
    addEmptyParamsRow: source => {
        $(source).closest('.section').find('.params-table').bootstrapTable(
            'append',
            {"name": "", "comparison": "", "value": "", "action": ""}
        )
    },

    parametersDeleteFormatter(value, row, index) {
        return `
            <button type="button" class="btn btn-24 btn-action" onclick="ThresholdParamsTable.deleteParams(${index}, this)">
                <i class="fas fa-trash-alt"></i>
            </button>
        `
    },
    inputFormatter(value, row, index, field) {
        return `
            <input type="text" class="form-control form-control-alternative" 
                onchange="ThresholdParamsTable.updateCell(this, ${index}, '${field}')" value="${value}">
            <div class="invalid-tooltip invalid-tooltip-custom"></div>
        `
    },
    deleteParams: (index, source) => {
        $(source).closest('.params-table').bootstrapTable('remove', {
            field: '$index',
            values: [index]
        })
    },
    updateCell: (el, row, field) => $(el.closest('table')).bootstrapTable(
        'updateCell',
        {index: row, field: field, value: el.value}
    ),
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
            get: () => el.bootstrapTable('getData'),
            set: table_data => el.bootstrapTable('load', table_data),
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
                    if(row !== undefined && col_name !== undefined) {
                        el.find(
                            `tr[data-index=${row}] td:nth-child(${get_col_by_name(col_name) + 1}) input`
                        )
                            .addClass('is-invalid')
                            .next('div.invalid-tooltip-custom')
                            .text(data_obj.msg)
                    } else {
                        root_error === 'test_parameters' && error_div.append(`<span>${data_obj.msg}</span><br/>`)
                    }
                }
                if (Array.isArray(data)) {
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