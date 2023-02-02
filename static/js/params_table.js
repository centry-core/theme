var ParamsTable = {
    dataTypeFormatter(value, row, index, field) {
        const is_disabled = row._type_class?.toLowerCase().includes('disabled')
        let options = is_disabled ? [value] : ['String', 'Number', 'List']

        options = options.reduce((accum, item,) =>
                `${accum}<option
                value='${item}'
                ${item.toLowerCase() === value.toLowerCase() && 'selected'}
            >
                ${item}
            </option>
            `,
            ''
        )
        return `
            <select 
                class="selectpicker bootstrap-select__b mr-2 ${row._type_class}" 
                data-style="btn" 
                ${is_disabled && 'disabled'}
                onchange="ParamsTable.updateCell(this, '${index}', '${field}')"
                >
                    ${options}
            </select>
        `
    },
    addEmptyParamsRow: source => {
        $(source).closest('.section').find('.params-table').bootstrapTable(
            'append',
            {"name": "", "default": "", "type": "string", "description": "", "action": ""}
        )
    },

    parametersDeleteFormatter(value, row, index) {
        return `
            <button type="button" class="btn btn-default btn-xs btn-table btn-icon__xs" onclick="ParamsTable.deleteParams(${index}, this)">
                <i class="icon__18x18 icon-delete"></i>
            </button>
        `
    },
    inputFormatter(value, row, index, field) {
        return `
            <input type="text" class="form-control form-control-alternative" 
                onchange="ParamsTable.updateCell(this, ${index}, '${field}')" value="${value}">
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
