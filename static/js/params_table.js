var ParamsTable = {
    checkboxFormatter (value, row, index, field) {
        const isChecked = value.checked ? 'checked' : ''
        return `
            <label
                class="mb-0 w-100 d-flex align-items-center custom-checkbox">
                <input
                    onchange="ParamsTable.updateCellCbx(this, '${index}', '${field}', ${value.title})" 
                    ${isChecked}
                    type="checkbox">
                <span class="w-100 d-inline-block ml-3">${value.title}</span>
            </label>
        `
    },
    updateCellCbx: (el, index, field, title) => {
        $(el.closest('table')).bootstrapTable(
            'updateCell',
            { index: +index, field: field, value: { title, checked: el.checked }}
        )
    },
    checkboxFormatterSimple (value, row, index, field, edit_mode = true) {
        const checked = value ? 'checked' : '';
        const disabled = edit_mode ? '' : 'disabled';
        return `
            <label
                class="mb-0 w-100 d-flex align-items-center custom-checkbox">
                <input
                    onchange="ParamsTable.updateCellCbxSimple(this, '${index}', '${field}')" 
                    ${disabled}
                    ${checked}
                    type="checkbox">
            </label>
        `
    },
    updateCellCbxSimple: (el, index, field) => {
        $(el.closest('table')).bootstrapTable(
            'updateCell',
            { index: +index, field: field, value: el.checked }
        )
    },
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
    removeParam: ev => {
        if (ev.target.parentNode.parentNode.classList.contains("flex-row")) {
            ev.target.parentNode.parentNode.remove();
        } else {
            ev.target.parentNode.parentNode.parentNode.remove();
        }
    },
    addEmptyParamsRow: source => {
        const $table = $(source).closest('.section').find('.params-table')
        $table.bootstrapTable(
            'append',
            {"name": "", "default": "", "type": "string", "description": "", "action": ""}
        )
        $table.removeClass('empty_data')
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
        const $table = $(source).closest('.params-table').bootstrapTable('remove', {
            field: '$index',
            values: [index]
        })
        $table.bootstrapTable('getData').length === 0 && $table.addClass('empty_data')
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
    const $pts = $('.params-table')
    $pts.on('all.bs.table', () => {
        $('.selectpicker').selectpicker('render')
    })
    $pts.on('post-body.bs.table', () => {
        $pts.each((_, t) => {
            t = $(t)
            t.bootstrapTable('getData').length === 0 ? t.addClass('empty_data') : t.removeClass('empty_data')
        })
    })
})
