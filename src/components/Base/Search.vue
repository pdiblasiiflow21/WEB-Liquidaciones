<template>
    <div class="search   float-md-left mr-12 align-top">        
        <div class="search-sm">
            <b-input  v-model="val" :placeholder="searchBy" />
        </div>
        <i class="simple-icon-refresh" title="Refrescar" @click="refresh"></i>                
    </div>     
</template>

<script>
    export default {
        name: 'Search',
        props: {
            debounce: {
                type: Number,
                required: false,
                default: 600
            },
            value: {
                required: false,
                default: null
            }
            ,
            searchBy: {
                required: false,
                default: 'Buscar'
            }
        },
        data() {
            return {
                val: null,
                timeoutId: null,
                reset: false                
            }
        },
        watch: {
            val() {
                if (this.reset){
                    this.reset = false;
                    return;
                }

                if (this.timeoutId) {
                    clearTimeout(this.timeoutId);
                }
                
                this.timeoutId = setTimeout(() => this.$emit('input', this.val), this.debounce);
            }
        },
        methods: {
            refresh() {                
               this.$emit('refresh'); 
            },
            resetInput() {
                this.val = null;
                this.reset = true
            }
        },

    };
</script>

<style> 
    .search {
        width: 100%;
        display: flex;
    }

    .search .search-sm{
        width: 100%;
        display: flex;
    }
  

    .search i {
        font-size: 20px;
        color: #666;
        cursor: pointer;
        margin: 4px;
        border-radius: 3px;
        position: relative;
        top: -1px;
    }

    .search i:hover {        
        color: #333;        
        background-color: #eee;
    }
</style>
