var ParamsTable = {
    dataTypeFormatter(value, row, index, field) {
        const is_disabled = row._type_class?.toLowerCase().includes('disabled')
        let options = is_disabled ? [value] : ['String', 'Number', 'List']

        options = options.reduce((accum, item, ) =>
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
                onchange="updateCell(this, '${index}', '${field}')"
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
                onchange="updateCell(this, ${index}, '${field}')" value="${value}">
            <div class="invalid-tooltip invalid-tooltip-custom"></div>
        `
    },
    deleteParams: (index, source) => {
        $(source).closest('.params-table').bootstrapTable('remove', {
            field: '$index',
            values: [index]
        })
    }
}

$(document).on('vue_init', () => {
    $('.params-table').on('all.bs.table', () => {
        $('.selectpicker').selectpicker('render')
    })
})