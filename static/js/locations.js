const KubernetesLocation = {
    delimiters: ['[[', ']]'],
    props: ["cloud_settings", 'refresh_pickers'],
    data() {
        return this.initialState()
    },
    mounted() {
        this.get_namespaces()
        this.$nextTick(this.refresh_pickers)
    },

    watch: {
        'settings.namespace': {
            handler() {
                if (!this.settings.scaling_cluster)
                    this.get_capacity()
            },
            immediate: true,
        },
        settings(newValue) {
            this.$emit('update:cloud_settings', newValue)
        }
    },
    methods: {
        initialState() {
            return {
                refresh_btn_color: '#5933C6',
                settings: this.cloud_settings,
                namespaces: [],
                resources: {},
                error: {}
            }
        },
        set_error(error_data) {
            this.error = error_data
        },
        clear_errors() {
            this.error = {}
        },
        set_data(data) {
        },
        clear_data() {
            Object.assign(this.$data, this.initialState())
            this.$emit('clear_data')
        },
        get_capacity() {
            fetch("/api/v1/kubernetes/get_available_resources",
                {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(this.settings)
                }).then((resp) => {
                if (resp.ok) {
                    return resp.json()
                } else {
                    this.set_error({
                        msg: "Couldn't fetch available resources. It probably means the cluster uses auto-scaling."
                    })
                    console.warn("Couldn't fetch resources. Resp code: ", resp.status)
                }
            }).then((resources) => {
                this.resources = resources
                this.refresh_btn_color = '#5933C6'
            })
        },
        clear() {
            Object.assign(this.$data, this.initialState())
            this.$nextTick(this.refresh_pickers)
        },
        get_namespaces() {
            fetch("/api/v1/kubernetes/get_namespaces", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(this.settings),
            }).then((resp) => {
                if (resp.ok) {
                    return resp.json()
                } else {
                    console.warn("Couldn't fetch namespaces. Resp code: ", resp.status)
                }
            }).then((namespaces) => {
                this.namespaces = namespaces
            }).catch((error) => {
                console.log(error)
            }).finally(() => {
                this.$nextTick(this.refresh_pickers)
                this.$nextTick(this.refresh_pickers)
            });
        }

    },
    template: `
        <div class="form-group w-100-imp">
            <div class="custom-input mb-1"  style="width: 50%;">        
                <p class="custom-input_desc mb-1">Namespace</p>
                <div class="custom-input select-validation"
                    :class="{'invalid-select': this.error.msg}">
                    <select class="selectpicker bootstrap-select__b" 
                        v-model="settings.namespace"
                    >
                        <option v-for="item in namespaces">[[ item ]]</option>
                    </select>
                    <span class="select_error-msg">[[ error['msg'] ]]</span>
                    <p>
                        <h13>
                            <template v-if="!settings.scaling_cluster">
                            Available resources: 
                            runners - [[ resources["pods"] ]],
                            CPU - [[ resources["cpu"] ]],
                            memory - [[ resources["memory"] ]]Gb   
                            <a
                                style="cursor: pointer;"
                                :style="{color: refresh_btn_color}" 
                                @click="get_capacity"
                                @mouseenter="refresh_btn_color = '#6C44DD'"
                                @mousedown="refresh_btn_color = '#4627A0'"
                            >
                              Refresh
                            </a>
                            </template>
                            <template v-if="settings.scaling_cluster" >
                               Unable to count resources for auto-scaling cluster. 
                               Test may not work as expected if there is not enough scaling capacity.
                            </template>
                        </h13>
                    </p>
                </div>
            </div>
        </div>
    `
}

const AwsLocation = {
    delimiters: ['[[', ']]'],
    props: ["cloud_settings", 'refresh_pickers'],
    data() {
        return this.initialState()
    },
    mounted() {
        this.$nextTick(this.refresh_pickers)
    },
    watch: {
        settings(newValue) {
            this.$emit('update:cloud_settings', newValue)
        }
    },
    methods: {
        initialState() {
            return {
                settings: this.cloud_settings,
                aws_regions: [
                    "eu-north-1",
                    "ap-south-1",
                    "eu-west-3",
                    "eu-west-2",
                    "eu-west-1",
                    "ap-northeast-3",
                    "ap-northeast-2",
                    "me-south-1",
                    "ap-northeast-1",
                    "sa-east-1",
                    "ca-central-1",
                    "ap-east-1",
                    "ap-southeast-1",
                    "ap-southeast-2",
                    "eu-central-1",
                    "us-east-1",
                    "us-east-2",
                    "us-west-1",
                    "us-west-2",
                ],
                error: {}
            }
        },
        set_error(error_data) {
            this.error = error_data
        },
        clear_errors() {
            this.error = {}
        },
        set_data(data) {
        },
        clear_data() {
            Object.assign(this.$data, this.initialState())
            this.$emit('clear_data')
        },
        clear() {
            Object.assign(this.$data, this.initialState())
            this.$nextTick(this.refresh_pickers)
        },
    },
    template:
        `
    <div class="form-group w-100-imp">
            <div class="custom-input m-3">
                <p class="custom-input_desc mb-1">Instance type</p>
                <select class="selectpicker bootstrap-select__b" 
                    data-style="btn" 
                    v-model="settings.instance_type"
                >
                        <option value="spot">
                            Spot instance
                        </option>
                        <option value="on-demand">
                            On-demand instance
                        </option>
                </select>
            </div>
            <div class="custom-input m-3" >        
                <p class="custom-input_desc mb-1">AWS Region</p>
                <select class="selectpicker bootstrap-select__b" 
                    data-style="btn" 
                    v-model="settings.region_name"
                >
                        <option v-for="region in aws_regions">
                            [[region]]
                        </option>
                </select>
            </div>
            <div class="custom-input m-3" > 
                <p class="custom-input_desc mb-1">Security groups</p>
                <input type="text" v-model="settings.security_groups" 
                class="form-control form-control-alternative"  
                placeholder="Leave empty for default value"/>
            </div>
            <div class="custom-input m-3" > 
                <p class="custom-input_desc mb-1">Image ID</p>
                <input type="text" v-model="settings.image_id" 
                placeholder="Leave empty for default value"
                class="form-control form-control-alternative" />
            </div>
            <div class="custom-input m-3" > 
                <p class="custom-input_desc mb-1">Subnet ID</p>
                <input type="text" v-model="settings.subnet_id" 
                placeholder="Leave empty for default value"
                class="form-control form-control-alternative" />
            </div>
    </div>
    `,
}

const GcpLocation = {
    delimiters: ['[[', ']]'],
    props: ["cloud_settings", 'refresh_pickers'],
    data() {
        return this.initialState()
    },
    mounted() {
        this.get_zones()
        this.$nextTick(this.refresh_pickers)
    },
    watch: {
        settings(newValue) {
            this.$emit('update:cloud_settings', newValue)
        }
    },
    methods: {
        initialState() {
            return {
                settings: this.cloud_settings,
                gcp_zones: [this.cloud_settings.zone],
                error: {}
            }
        },
        set_error(error_data) {
            this.error = error_data
        },
        clear_errors() {
            this.error = {}
        },
        set_data(data) {
        },
        clear_data() {
            Object.assign(this.$data, this.initialState())
            this.$emit('clear_data')
        },
        clear() {
            Object.assign(this.$data, this.initialState())
            this.$nextTick(this.refresh_pickers)
        },
        get_zones() {
            fetch("/api/v1/gcp_integration/get_zones",
                {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(this.settings)
                }).then((resp) => {
                if (resp.ok) {
                    return resp.json()
                } else {
                    console.warn("Couldn't fetch zones. Resp code: ", resp.status)
                }
            }).then((result) => {
                this.gcp_zones = result
                this.$nextTick(this.refresh_pickers)
                this.$nextTick(this.refresh_pickers)
            }).catch((error) => {
                console.log(error)
            })
        },
    },
    template:
        `<div class="form-group w-100-imp">
            <div class="custom-input m-3">
                <p class="custom-input_desc mb-1">Instance type</p>
                <select class="selectpicker bootstrap-select__b" 
                    data-style="btn" 
                    v-model="settings.instance_type"
                >
                        <option value="spot">
                            Spot instance
                        </option>
                        <option value="on-demand">
                            On-demand instance
                        </option>
                </select>
            </div>
            <div class="custom-input m-3" >        
                <p class="custom-input_desc mb-1">GCP Zones</p>
                <select class="selectpicker bootstrap-select__b" 
                    data-style="btn" 
                    v-model="settings.zone"
                >
                        <option v-for="zone in gcp_zones">
                            [[zone]]
                        </option>
                </select>
            </div>
        </div>`
}
register_component('AwsLocation', AwsLocation)
register_component('GcpLocation', GcpLocation)
register_component('KubernetesLocation', KubernetesLocation)


const Locations = {
    delimiters: ['[[', ']]'],
    props: ['public_regions', 'cloud_settings', 'project_regions', 'cloud_regions', 'location', 'parallel_runners', 'cpu', 'memory', 'modal_id'],
    emits: ['update:location', 'update:parallel_runners', 'update:cpu', 'update:memory', 'update:cloud_settings'],
    template: `
    <div class="section">
    <div class="row">
        <div class="col">
            <p class="font-h5 font-bold font-uppercase">Load configuration</p>
            <p class="font-h6 font-weight-400">Specify engine region and load profile. CPU Cores and Memory are distributed for each parallel
                runner
            </p>
        </div>
    </div>
    <div class="d-flex py-4">
        <div class="custom-input w-100-imp displacement-ml-4">
            <p class="custom-input_desc font-semibold mb-1">Engine location</p>
            <select class="selectpicker bootstrap-select__b" data-style="btn" 
                v-model="location_"
            >
                <optgroup label="Public pool" v-if="public_regions_.length > 0">
                    <option v-for="item in public_regions_">[[ item ]]</option>
                </optgroup>
                <optgroup label="Project pool" v-if="project_regions_.length > 0">
                    <option v-for="item in project_regions_">[[ item ]]</option>
                </optgroup>
                <optgroup label="Cloud pool" v-if="cloud_regions_.length > 0">
                    <option v-for="item in cloud_regions_">[[ item.name ]]</option>
                </optgroup>
            </select>
        </div>
        
        <div class="custom-input ml-3">
            <p class="custom-input_desc font-semibold mb-1">Runners</p>
            <input-stepper 
                :default-value="parallel_runners"
                :uniq_id="modal_id + '_parallel'"
                @change="val => (parallel_runners_ = val)"
            ></input-stepper>
        </div>
        <div class="custom-input ml-3">
            <p class="custom-input_desc font-semibold mb-1">CPU Cores</p>
            <input-stepper 
                :default-value="cpu"
                :uniq_id="modal_id + '_cpu'"
                @change="val => (cpu_ = val)"
            ></input-stepper>
        </div>
        <div class="custom-input mx-3">
            <p class="custom-input_desc font-semibold mb-1">Memory, Gb</p>
            <input-stepper 
                :default-value="memory"
                :uniq_id="modal_id + '_memory'"
                @change="val => (memory_ = val)"
            ></input-stepper>
        </div>

    </div>
    <div class="row pl-1" v-if="is_cloud_location">
        <template v-if="cloud_settings_.integration_name === 'aws_integration'">
            <AwsLocation :cloud_settings="cloud_settings_" :refresh_pickers="refresh_pickers" 
                :key="cloud_settings_.id"
                @register="$root.register"
                instance_name="aws_integration"
            />
        </template>
        <template v-if="cloud_settings_.integration_name === 'kubernetes'">
            <KubernetesLocation :cloud_settings="cloud_settings_" :refresh_pickers="refresh_pickers" 
                :key="cloud_settings_.id"
                @register="$root.register"
                instance_name="kubernetes"
            />
        </template>
        <template v-if="cloud_settings_.integration_name === 'gcp_integration'">
            <GcpLocation :cloud_settings="cloud_settings_" :refresh_pickers="refresh_pickers" 
                :key="cloud_settings_.id"
                @register="$root.register"
                instance_name="gcp_integration"
            />
        </template>
    </div>
</div>
    `,
    data() {
        return {
            location_: 'default',
            parallel_runners_: 1,
            cpu_: 1,
            memory_: 4,
            public_regions_: ['default'],
            project_regions_: [],
            cloud_regions_: [],
        }
    },
    computed: {
        is_cloud_location() {
            return this.cloud_regions_.filter(el => el.name === this.location_).length !== 0;
        },
        chosen_location_settings() {
            if (!this.is_cloud_location) return {}
            return this.cloud_regions_.find(el => el.name === this.location_).cloud_settings
        }
    },
    mounted() {
        this.fetch_locations()
        if (this.$props.location) this.location_ = this.$props.location
        if (this.$props.parallel_runners) this.parallel_runners_ = this.$props.parallel_runners
        if (this.$props.cpu) this.cpu_ = this.$props.cpu
        if (this.$props.memory) this.memory_ = this.$props.memory
        if (this.$props.public_regions) this.public_regions_ = this.$props.public_regions
        if (this.$props.project_regions) this.project_regions_ = this.$props.project_regions
        if (this.$props.cloud_regions) this.cloud_regions_ = this.$props.cloud_regions
        this.$nextTick(this.refresh_pickers)
        this.$nextTick(this.refresh_pickers)
    },
    watch: {
        location_(newValue) {
            this.$emit('update:location', newValue)
            if (this.$props.cloud_settings.id === this.chosen_location_settings.id) {
                this.cloud_settings_ = {...this.chosen_location_settings, ...this.$props.cloud_settings}
            } else
                this.cloud_settings_ = this.chosen_location_settings
            this.$emit('update:cloud_settings', this.cloud_settings_)
        },
        location(newValue) {
            this.location_ = newValue
        },
        parallel_runners_(newValue) {
            this.$emit('update:parallel_runners', newValue)
        },
        parallel_runners(newValue) {
            this.parallel_runners_ = newValue
        },
        cpu_(newValue) {
            this.$emit('update:cpu', newValue)
        },
        cpu(newValue) {
            this.cpu_ = newValue
        },
        memory_(newValue) {
            this.$emit('update:memory', newValue)
        },
        memory(newValue) {
            this.memory_ = newValue
        },
        public_regions_(newValue) {
            this.$nextTick(this.refresh_pickers)
        },
        project_regions_(newValue) {
            this.$nextTick(this.refresh_pickers)
        },
        cloud_regions_(newValue) {
            this.$nextTick(this.refresh_pickers)
        },
    },
    methods: {
        async fetch_locations() {
            console.log('fetching locations')
            const resp = await fetch(`/api/v1/shared/locations/${getSelectedProjectId()}`)
            if (resp.ok) {
                const {public_regions, project_regions, cloud_regions} = await resp.json()
                this.public_regions_ = public_regions
                this.project_regions_ = project_regions
                this.cloud_regions_ = cloud_regions
            } else {
                console.warn('Couldn\'t fetch locations. Resp code: ', resp.status)
            }
        },
        refresh_pickers() {
            $(this.$el).find('.selectpicker').selectpicker('redner').selectpicker('refresh')
        }
    }
}

register_component('Locations', Locations)