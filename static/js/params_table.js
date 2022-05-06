var ParamsTable = {
    dataTypeFormatter(value, row, index, field) {
        const options = ['String', 'Number', 'List'].map(item =>
            `<option 
                value=${item} 
                ${item.toLowerCase() === value.toLowerCase() ? 'selected' : ''}
            >
                ${item}
            </option>
            `
        )
        return `
            <select class="selectpicker mr-2" data-style="btn-gray" onchange="updateCell(this, '${index}', '${field}')">
                ${options.join('')}
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
        <div class="d-flex justify-content-end">
            <button type="button" class="btn btn-16 btn-action" onclick="ParamsTable.deleteParams(${index}, this)">
                <i class="fas fa-trash-alt"></i>
            </button>
        </div>
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
