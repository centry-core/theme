const Locations = {
    delimiters: ['[[', ']]'],
    props: ['public_regions', 'project_regions', 'location', 'parallel_runners', 'cpu', 'memory'],
    emits: ['update:location', 'update:parallel_runners', 'update:cpu', 'update:memory'],
    template: `
<div class="section">
    <div class="row">
        <div class="col">
            <h7>Load configuration</h7>
            <p>
                <h13>
                Specify engine region and load profile. CPU Cores and Memory are distributed for each parallel runner
                </h13>
            </p>
        </div>
    </div>
    <div class="row pt-2">
        <div class="col-6 pl-0">
            <label class="form-control-label">
                Engine location
                <div class="w-100-imp">
                    <select class="selectpicker bootstrap-select__b" data-style="btn" 
                        :value="location"
                        @change="e => {
                            location_ = e.target.value
                            $emit('update:location', location_)
                        }"
                    >
                        <optgroup label="Public pool" v-if="public_regions_.length > 0">
                            <option v-for="item in public_regions_">[[ item ]]</option>
                        </optgroup>
                        <optgroup label="Project pool" v-if="project_regions_.length > 0">
                            <option v-for="item in project_regions_">[[ item ]]</option>
                        </optgroup>
                    </select>
                </div>
            </label>

        </div>
        <div class="col-2">
            <label class="form-control-label">Runners</label>
            <div class="input-group">
                <div class="input-group-prepend">
                    <button class="btn btn-37 btn-outline-secondary" type="button"
                        @click="parallel_runners > 1 && parallel_runners--"
                    ><i class="fas fa-minus"></i></button>
                </div>
                <input type="number" class="form-control form-control-borderless nospin"
                    :value="parallel_runners"
                    @change="e => {
                        parallel_runners_ = e.target.value
                        $emit('update:parallel_runners', parallel_runners_)
                    }"
                >
                <div class="input-group-append">
                    <button class="btn btn-37 btn-outline-secondary" type="button"
                        @click="parallel_runners++"
                    ><i class="fas fa-plus"></i></button>
                </div>
            </div>
        </div>
        <div class="col-2">
            <label class="form-control-label">CPU Cores</label>
            <div class="input-group">
                <input type="number" data-tag="cpu" class="form-control form-control-alternative nospin" placeholder="1"
                    :value="cpu"
                    @change="e => {
                        cpu_ = e.target.value
                        $emit('update:cpu', cpu_)
                    }"
                >
            </div>
        </div>
        <div class="col-2">
            <label class="form-control-label">Memory, Gb</label>
            <div class="input-group">
                <input type="number" data-tag="memory" class="form-control form-control-alternative nospin" placeholder="4"
                    :value="memory"
                    @change="e => {
                        memory_ = e.target.value
                        $emit('update:memory', memory_)
                    }"
                >
            </div>
        </div>
    </div>
    <div class="row pt-2">
        <div class="col">
            <button type="button" class="btn btn-sm btn-secondary">
                <i class="fas fa-plus mr-2"></i>Add Location
            </button>
        </div>
    </div>
</div>
    `,
    data() {
        return {
            location_: 'default',
            parallel_runners_: 1,
            cpu_: 1,
            memory_: 4,
            public_regions_: [],
            project_regions_: [],
        }
    },
    mounted() {
        console.log('locations mounted', this.$props, this.$data)
        if (this.$props.location) this.location_ = this.$props.location
        if (this.$props.parallel_runners) this.parallel_runners_ = this.$props.parallel_runners
        if (this.$props.cpu) this.cpu_ = this.$props.cpu
        if (this.$props.memory) this.memory_ = this.$props.memory
        if (this.$props.public_regions) this.public_regions_ = this.$props.public_regions
        if (this.$props.project_regions) this.project_regions_ = this.$props.project_regions
        console.log('locations mounted end', this.$props, this.$data)
        $('.selectpicker').selectpicker('refresh')
    },
    watch: {
        public_regions_(newValue) {
            console.log('refreshing selectpickers')
            this.$nextTick(() => {
                $('.selectpicker').selectpicker('refresh')
                $('.selectpicker').selectpicker('render')
            })

        },
        project_regions_(newValue) {
            console.log('refreshing selectpickers')
            this.$nextTick(() => {
                $('.selectpicker').selectpicker('refresh')
                $('.selectpicker').selectpicker('render')
            })
        }
    },
    methods: {
        async fetch_locations() {
            console.log('fetching locations')
            const resp = await fetch(`/api/v1/shared/locations/${getSelectedProjectId()}`)
            if (resp.ok) {
                const {public_regions, project_regions} = await resp.json()
                this.public_regions_ = public_regions
                this.project_regions_ = project_regions
            } else {
                console.warn('Couldn\'t fetch locations. Resp code: ', resp.status)
            }

        }
    }
}

register_component('Locations', Locations)