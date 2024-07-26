<template>
    <div class="select-deluxe" v-click-outside="hide">
        <div class="" >
            <div class="">
                <div class="">{{ label }}</div>
                <div class="select-deluxe-header" v-bind:class="{ disabled: !enabled }">
                    <input class="form-control view"
                           :placeholder="placeholder"
                           v-bind:class="[validationClass,((enabled)?'':'disabled')]"                           
                           @blur="onBlurHandler"
                           @focus="onFocusHandler"
                           readOnly
                           v-model="formattedLabel"
                           @click="() => { if (enabled) toggle() }" />

                    <span class="iconsminds-close" v-if="selectedItem && enabled" @click="() => { if (enabled) setSelectedItem(null) }" ></span>                    
                </div>

                <div>
                    <div v-show="bodyVisible" class="select-deluxe-body"> 
                        <div style="position: relative;">
                            <search v-model="multiColumnSearchText" @input="search" :debounce="600"></search>
                            <div>
                            <ul v-if="!columns">
                                <li v-for="(item, index) in rows" :key="index" @click="setSelectedItem(item)">{{getFormattedLabel(item)}}</li>
                            </ul>
                            </div>
                            <basic-table v-if="columns"
                                         :rows="rows"
                                         @onRowSelected="setSelectedItem">
                                <column v-for="(column, index) in columns" :key="index" :field="column.field" :title="column.title" :width="column.width" />
                            </basic-table>
                            <div class="select-deluxe-pager" v-show="rowCount > rowsPerPage">
                                <paginate ref="paginate" :rowCount="rowCount" @pageChanged="pageChanged"></paginate>
                            </div>
                            <loading ref="loading" />
                        </div>                       
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'SelectDeluxe',
        props: {
            label: { required: false, default: '' },
            placeholder: { type: String, required: false, default: '' },            
            value: { required: false, default: null },
            resource: { type: String, required: true },
            method: { type: String, default: 'query' },
            valueField: { required: false },
            selectItemLabel: { required: true },
            width: { type: String, default: 'auto' },
            filter: { type: Object, default: () => { return {} } },
            enabled: { type: Boolean, required: false, default: true },
            allowFreeValue: { type: Boolean, required: false, default: false },
            preLoaded: { type: Boolean, required: false, default: false },
            state: { type: Boolean, required: false, default: null },
            ordered: { type: Boolean, required: false, default: false }
        },
        data() {
            return {
                isActive: false,
                loaded: false,
                bodyVisible: false,
                selectedItem: null,
                spinnerVisible: true,
                multiColumnSearchText: null,
                result: { hasErrors: false, messages: [] },
                rowCount: 0,
                rows: [],
                page: 1,
                rowsPerPage: 10
            }
        },
        mounted() {
            this.getSingleItem();

            if (this.preLoaded) {
                this.getPage();
            }
        },
        watch: {
            value(newVal) {
                if (!newVal) {
                    this.selectedItem = null;
                    return;
                }

                if (newVal !== this.selectedValue) {
                    this.getSingleItem();
                }
            },
            filter(newVal, oldVal) {
                if (this.loaded && newVal && JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
                    this.setSelectedItem(null);
                    this.search();
                }
            },
            bodyVisible(newVal) {
                if (!newVal && !this.selectedValue && this.allowFreeValue && this.multiColumnSearchText) {
                    let item = { ...this.defaultItem };
                    item[this.valueField] = this.multiColumnSearchText;
                    this.setSelectedItem(item);
                }
            }
        },
        computed: {
            api() {
                return this.$api[this.resource];
            },
            selectedValue() {
                if (!this.selectedItem) return null;

                return this.valueField ?
                    this.selectedItem[this.valueField] :
                    this.selectedItem;
            },
            formattedLabel() {
                return this.getFormattedLabel(this.selectedItem);
            },
            columns() {
                if (!this.$slots.default || !this.$slots.default.length) return null;

                let columns = this.$slots.default.filter(col => col.data).map(col => {
                    return {
                        field: col.data.attrs.field,
                        title: col.data.attrs.title,
                        width: col.data.attrs.width
                    }
                });

                return columns;
            },
            defaultItem() {
                return {
                    [this.valueField]: this.value,
                    [this.selectItemLabel]: this.value
                };
            },
            validationClass () {
                return this.state === null ? '' : this.state ? 'is-valid' : 'is-invalid';
            }
        },
        methods: {
            onBlurHandler(e) {
                this.isActive = false;
                this.$emit('blur', e);
            },
            onFocusHandler(e) {
                this.isActive = true;
                this.$emit('focus', e);
            },
            toggle() {
                this.bodyVisible = !this.bodyVisible;

                if (this.bodyVisible && (this.page > 1 || !this.loaded)) {
                    this.loaded = true;
                    this.page = 1;
                    this.$refs.paginate.reset();
                    this.getPage();
                }
            },
            hide() {
                this.bodyVisible = false;
            },
            getFormattedLabel(item) {
                if (!item) return null;

                return typeof this.selectItemLabel === 'function' ?
                    this.selectItemLabel(item) :
                    item[this.selectItemLabel];
            },
            search() {
                this.page = 1;
                this.$refs.paginate.reset();
                this.rows = [];
                this.rowCount = 0;
                this.getPage();
            },
            pageChanged(props) {
                this.page = props.page;
                this.rowsPerPage = props.rowsPerPage;

                this.getPage();
            },
            getPage() {
                let request = { ...this.filter, multiColumnSearchText: this.multiColumnSearchText, currentPage: this.page, pageSize: this.rowsPerPage,  };

                this.$refs.loading.show();

                this.api[this.method](request).then(response => {
                     this.rows = [];
                    this.rows = this.ordered ?  response.body.data.sort((a, b) => a.nombre ? a.nombre.localeCompare(b.nombre) : a.descripcion.localeCompare(b.descripcion)) : response.body.data;
                    this.rowCount = response.body.count
                    this.$refs.loading.hide(300);
                }).catch(err => {
                    this.result.hasErrors = true;
                    this.result.messages = [err];
                    this.$refs.loading.hide(300);
                })
            },
            getSingleItem() {                
                if (typeof this.value === 'object') {
                    this.selectedItem = this.value;
                    return;
                }

                this.api.get({ id: this.value }).then(response => {
                    this.selectedItem = response.body || this.defaultItem;
                }).catch(() => {
                    this.selectedItem = this.defaultItem;
                })
            },
            setSelectedItem(item) {
                this.selectedItem = item;

                if (!item) {
                    this.multiColumnSearchText = null;
                    this.loaded = false;
                }
                this.$emit('input', this.selectedValue);
                this.hide();
            },
            clear() {
                this.loaded = false;
                this.page = 1;
                this.rowCount = 0;
                this.rows = [];
                this.$refs.paginate.reset();
            }
        }
    };
</script>

<style>
    .select-deluxe {
        display: inline-block;
        /* background: white; */
        position: relative;
        width: 100%;
    }
    /* .select-deluxe:disabled {
        background-color: #e9ecef;
        opacity: 1;
    } */

    .disabled {
        cursor: not-allowed !important;
    }

    .select-deluxe-header {
        width: 100%;
        position: relative;
    }

        .select-deluxe-header input {
            width: 100%;
            background-color: #fff !important;
            display: inline-block;
            cursor: pointer;
        }
            
        .select-deluxe-header .iconsminds-close {
            position: absolute;
            right: 5px;
            top: 11px;
            font-size: 16px;
            z-index: 999;
            background: #fff;
        }
            

    .select-deluxe-body {
        padding: 5px;
        font-size: 12px;
        z-index: 10000;
        position: absolute;
        background-color: #fff;
        min-width: 98%;
        /* min-height: 160px; */
        box-shadow: 4px 4px 4px 2px rgba(0,0,0,0.25);
        border-radius: 4px;
        border: 1px solid #ccc;
    }

        .select-deluxe-body ul {
            margin: 0;
            padding: 0;
            display: block;
        }

        .select-deluxe-body li {
            list-style: none;
            display: flex;
            align-items: center;
            width: 100%;
            padding: 3px;
            margin: 0;
            line-height: 20px;
        }

        .select-deluxe-body li:first-child {
           padding-top: 10px;
        }        
            .select-deluxe-body li:hover {
                background-color: #cccccc;
                cursor: pointer;
            }

        .select-deluxe-body table {
            width: 100%;
            color: #333;
            margin-top: 4px;
        }

            .select-deluxe-body table th {
                text-align: left;
            }

        .select-deluxe-body td > div {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .select-deluxe-body tr:hover {
            cursor: pointer;
            background-color: #cccccc;
        }

    .select-deluxe-header i {
        cursor: pointer;
    }

    .select-deluxe .select-button {
        font-size: 24px;
        color: rgba(0,0,0,0.54);    
        position: absolute;
        top: 6px;
        right: 14px;    
    }

    .select-deluxe-body .pagination {
        padding: 0 0 !important;        
        font-size: 10px;
        /* position: absolute; */
        bottom: 0;
    }

        .select-deluxe-body .pagination > li {
            display: inline-block;
            width: auto;
        }

            .select-deluxe-body .pagination > li > a.page {
                padding: 4px;
            }


            .list-filter input{
    border-radius: 25px;
}
</style>
