<template>
    <ul class="pagination justify-content-center pagination-sm">
        <b-pagination
            v-model="currentPage"
            :total-rows="this.rowCount"
            :per-page="this.rowsPerPage"
            :hide-ellipsis=true
            first-text="<<"
            prev-text="<"
            next-text=">"
            last-text=">>"
            class="mt-4"
            @input="updatePage(currentPage)"
        ></b-pagination>
    </ul>


</template>

<script>

    export default {
        name: 'Paginate',
        props: {            
            rowCount: {
                type: Number,
                required: true                
            },
            rowsPerPage: {
                type: Number,
                required: false,
                default: 10
            },
        },
        data () {
            return {
                pageGroupSize: 5,                
                currentPage: 1
            }
        },
        methods: {
            reset() {
                this.currentPage = 1;
                this.offset = 0;
            },
            updatePage(page){
                this.$emit('pageChanged', { page: page, rowsPerPage: this.rowsPerPage });
            }
        }
    };
</script>

<style scoped>
    .page-item {
        display: flex;
        justify-content: center;
        align-items: center;
    }

    @media screen and (max-width: 600px) {
        .pagination {      
            padding: 0 0 !important;
            margin: 10px 0;
            font-size: 12px;
        }

        .pagination > li {    
            display: inline-block;
            width: auto;
        }

        .pagination > li > a.page-link {    
            padding: 8px;    
        }
    }
</style>
