const ArtifactSourceTab = {
    props: ['tab_id', 'instance_name'],
    data() {
        return {
            uid: undefined,
            file: null,
            highlight_drop_area: false
        }
    },
    mounted() {
        this.uid = new Date().getTime()
    },
    computed: {
        input_id() {
            return 'file_input_' + this.uid
        }
    },
    methods: {
        handle_file(event) {
            this.file = event.target?.files[0]
        },
        handle_delete_file() {
            this.file = null
            this.$refs.file_input.value = null
        },
        handle_drop(event) {
            this.file = event?.dataTransfer?.files[0]
            this.highlight_drop_area = false
        },
        set_error(error_data) {
            console.warn('TODO: handle settle error messages here', error_data)
        }
    },
    template: `
    <div class="tab-pane fade mt-2" role="tabpanel" aria-labelledby="nav-file-tab"
        :id="tab_id"
        @dragover.stop.prevent="() => highlight_drop_area = true"
        @dragleave.stop.prevent="() => highlight_drop_area = false"
        @drop.stop.prevent="handle_drop"
        :instance_name="instance_name"
    >
        <label class="form-control-label font-h5 font-weight-bold" 
            :for="input_id"
        >
            [File] or [Test package]
        </label>
        <p class="font-h6 text-gray-700 font-weight-400 mb-2">
            Upload .zip file with test script.
        </p>
        <div class="mb-3">
            <div class="drop-area" :class="{'highlight': highlight_drop_area}">
                <input type="file" class="form-control form-control-alternative"
                    accept=".zip"
                    ref="file_input"
                    :id="input_id" 
                    @change="handle_file"
                >
                <label class="mb-0 d-flex align-items-center justify-content-center"
                    :for="input_id" 
                >
                    Drag & drop file or <span>&nbsp;browse</span>
                </label>
                <div class="invalid-feedback" id="file_error"></div>
            </div>
            <div class="preview-area">
                <div class="preview-area_item" 
                    v-if="file"
                >
                    <span>{{ file?.name }}</span>
                    <button class="btn btn-16" 
                        style="background: url('/design-system/static/assets/ico/close_notify_icon.svg') no-repeat center"
                        @click="handle_delete_file"
                    ></button>
                </div>
            </div> 
        </div>
    </div>
    `
}

register_component('ArtifactSourceTab', ArtifactSourceTab)