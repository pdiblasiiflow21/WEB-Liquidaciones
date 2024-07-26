<template>
    <div>
        <list-view
            resource="comerciales"
            :onBeforeSave="onBeforeSave"
            :customValidations="customValidations"
            :showActions="true"
            :showEdit="true"
            :showDelete="true"
        >
            <template slot='title'>
                Comerciales
            </template>
            <template slot='columns'>
                <column field="id" title="Id" width="40" />
                <column field="nombre" title="Nombre" />  
                            <column field="cuit" title="CUIT" width="50"/> 
                <column :field="(entity) => { return entity.direccion != null ? `${entity.direccion} ` : '' }" title="Dirección" width="100" />   
                <column :field="(entity) => { return entity.email != null ? `${entity.email} ` : '' }" title="Email" width="60" />  
                <column :field="(entity) => { return entity.celular != null ? `${entity.celular} ` : '' }" title="Nro Telefónico (Celular)" width="50" />                                               
            </template>
            <template slot='modal-form' slot-scope="props">               
                <b-form-group label="comercial">
                    <b-form-input  v-model="props.form.entity.nombre" placeholder="Nombre" :state="$isValid(props.form.$v.form.entity.nombre)" />
                    <b-form-invalid-feedback>Ingrese Nombre</b-form-invalid-feedback>

                       <b-form-input  v-model="props.form.entity.cuit" placeholder="CUIT" :state="$isValid(props.form.$v.form.entity.cuit)" />
                    <b-form-invalid-feedback>Ingrese CUIT</b-form-invalid-feedback>
                    <br/>

                    <b-form-input  v-model="props.form.entity.direccion" placeholder="Dirección" :state="$isValid(props.form.$v.form.entity.direccion)" />
                    <b-form-invalid-feedback>Ingrese direccion</b-form-invalid-feedback>
                    <br/>

                    <b-form-input  v-model="props.form.entity.email" placeholder="Email" :state="$isValid(props.form.$v.form.entity.email)" />
                    <b-form-invalid-feedback>Ingrese Email</b-form-invalid-feedback>
                    <br/>

                    <b-form-input  v-model="props.form.entity.celular" placeholder="Numero teléfono  (Celular)" :state="$isValid(props.form.$v.form.entity.celular)" />
                    <b-form-invalid-feedback>Ingrese Número de teléfono (Celular))</b-form-invalid-feedback>
                    <br/>

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
                        direccion:{required},
                    email:{required},
                    celular:{required},
                    cuit:{required}
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