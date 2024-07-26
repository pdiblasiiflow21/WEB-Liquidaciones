<template>
    <div>
        <list-view
            resource="origenes"
            :onBeforeSave="onBeforeSave"
            :customValidations="customValidations"
            :showActions="true"
            :showEdit="true"
            :showDelete="true"
        >
            <template slot='title'>
                Origenes 
            </template>
            <template slot='columns'>
                <column field="id" title="Id" width="40" />
                <column field="nombre" title="Nombre" />                                                
            </template>
            <template slot='modal-form' slot-scope="props">               
                <b-form-group label="Origen">
                    <b-form-input  v-model="props.form.entity.nombre" placeholder="Nombre" :state="$isValid(props.form.$v.form.entity.nombre)" />
                    <b-form-invalid-feedback>Ingrese el nombre</b-form-invalid-feedback>
                </b-form-group>                  
                <b-form-group label="Moneda">  
                  <select-deluxe resource="monedas" :selectItemLabel="({ abreviatura, nombre }) => `${abreviatura} - ${nombre}`" placeholder="Moneda" v-model="props.form.entity.moneda"  :state="$isValid(props.form.$v.form.entity.moneda)"></select-deluxe>
                  <b-form-invalid-feedback>Seleccione la moneda</b-form-invalid-feedback>
                </b-form-group>                      
            </template>
        </list-view>
    </div>
</template>

<script>
    const { required } = require('vuelidate/lib/validators')

    export default {
        data () {
            return {
                customValidations: {                    
                    nombre: { required },
                    moneda: { required }
                }
            }
        },
        methods: {
            onBeforeSave (form) {
                let result = { hasErrors: false, messages: [] };
                //add validations here  
                result.hasErrors = result.messages.length > 0;

                //apply custom logic here

                return Promise.resolve(result);
            }
        }
    };
</script>


<style>
    .invalid-feedback.show {
        display: block
    }
</style>