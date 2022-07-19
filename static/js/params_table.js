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
<!--        <div class="d-flex justify-content-end">-->
            <button type="button" class="btn btn-24 btn-action" onclick="ParamsTable.deleteParams(${index}, this)">
                <i class="fas fa-trash-alt"></i>
            </button>
<!--        </div>-->
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
        return {
            el,
            get: () => el.bootstrapTable('getData'),
            set: table_data => el.bootstrapTable('load', table_data),
            clear: () => el.bootstrapTable('load', []),
            setError: data => {
                const get_col_by_name = name => el.find(`thead th[data-field=${name}]`).index()
                const [_, row, col_name] = data.loc
                el.find(`tr[data-index=${row}] td:nth-child(${get_col_by_name(col_name) + 1}) input`)
                    .addClass('is-invalid')
                    .next('div.invalid-tooltip-custom')
                    .text(data.msg)

            },
            clearErrors: () => el.removeClass('is-invalid')
        }
    }
}


$(document).on('vue_init', () => {
    $('.params-table').on('all.bs.table', () => {
        $('.selectpicker').selectpicker('render')
    })
})