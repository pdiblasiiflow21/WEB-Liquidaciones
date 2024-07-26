<template>    
<vue-perfect-scrollbar class="scroll" :settings="{ suppressScrollX: false, wheelPropagation: false }"  >
    <table class="table b-table" >
         
        <thead v-if="columns">
            <tr>
                <th v-for="(column, index) in columns" :key="index" v-bind:style="{ width: column.width ? column.width + 'px' : 'auto' }">
                    {{ column.title }}
                </th>
                <th v-if="showActions && !showCheck" style="width: 80px;">Acciones</th>
                <th v-if="showCheck" style="width: 80px;"> <b-checkbox class="mb-1" size="m" variant="outline-info"  @change="checkFunction()"></b-checkbox></th>
            </tr>
        </thead>
        <tbody  v-if="columns">
                <tr  class="table-row" v-for="(row, index) in rows" :key="index" @click="$emit('onRowSelected', row)">
                    <td :data-label="column.title" v-for="(column, index2) in columns" :key="index2" >
                        <div v-if="typeof column.field == 'function'" v-html="column.field(row)"></div>
                        <span v-if="typeof column.field != 'function'">
                            {{ row[column.field] }}
                        </span>                   
                    </td>
                    <td data-label="Acciones" v-if="showActions">
                        <div class="action-column">
                            <slot name="action-column" v-bind:entity="row"></slot>
                        </div>
                    </td>                
                </tr>
                <tr v-if="columns && !rows.length"> 
                    <td :colspan="columns.length" class="text-center">
                        <p>No se encontraron registros</p>
                    </td>
                </tr>  
                      
        </tbody>
        <tbody v-if="!columns">
            
            <tr > 
                    <td>
                        Add one or more columns into the table
                    </td>
                </tr>
        </tbody>
        
    </table>
    </vue-perfect-scrollbar> 
</template>

<script>

    export default {
        name: 'BasicTable',
        props: {
            rows: {
                type: Array,
                required: true,
                default: function () {
                    return [];
                }
            },
            showActions: { required: false },
            showCheck: { required: false, default: false },
            checkFunction: {
                type: Function,
                required: false
            }
        },
        computed: {          
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
            }            
        }        
    };
</script>

<style scoped>
    .table {
        margin-bottom: 0;
    }

        .table .table-row {
            cursor: pointer;
        }

            .table .table-row:hover {
                background-color: #eee;
            }

            .table .table-row td {
                padding: .75rem;
            }

            .table .action-column {
                display: flex;
                align-items: center;
                position: relative;
                top: 2px;
            }

             .table .action-column button {
                margin: 0 2px;
            }


    @media screen and (max-width: 600px) {
        .table thead {
            border: none;
            clip: rect(0 0 0 0);
            height: 1px;
            margin: -1px;
            overflow: hidden;
            padding: 0;
            position: absolute;
            width: 1px;
        }

        .table tr {
            border-bottom: 3px solid #ddd;
            display: block;
        }

        .table td {
            border-bottom: 1px solid #ddd;
            display: block;
            text-align: right;
        }


            .table td::before {
                content: attr(data-label);
                float: left;
                font-weight: bold;
            }

            .table .action-column {
               justify-content: flex-end;
            }
    }
</style>
