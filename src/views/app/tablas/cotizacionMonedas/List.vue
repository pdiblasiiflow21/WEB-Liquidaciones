<template>
    <div>
        <list-view
            resource="cotizacionMonedas"
            :onBeforeSave="onBeforeSave"
            :customValidations="customValidations"
            :showActions="true"
            :showEdit="false"
            :showDelete="true"
        >
            <template slot='title'>
                Cotizaciones 
            </template>
            <template slot='columns'>
                <column field="id" title="Id" width="40" />
                <!-- <column field="monedaId" title="Moneda" />   -->
                <column :field="(entity) => entity.moneda.nombre" title="Moneda"   />   
                <column field="valor" title="Valor" />    
                <column field="createDate" title="Fecha" />                                               
            </template>
            <template slot='modal-form' slot-scope="props">               
                <b-form-group label="">
                    <br/>
                    <b-form-group label="Moneda">
                        <select-deluxe
                          resource="monedas"
                          :selectItemLabel="({ abreviatura, nombre }) => `${abreviatura} - ${nombre}`"
                          valueField="id"
                          placeholder="Moneda"
                          v-model="props.form.entity.monedaId"
                          :state="$isValid(props.form.$v.form.entity.monedaId)"
                        ></select-deluxe>
                        <div class="invalid-feedback show" v-if="$isValid(props.form.$v.form.entity.monedaId) === false">
                          Seleccione una moneda
                        </div>
                      </b-form-group>
                    <br/>
                    <b-form-input  v-model="props.form.entity.valor" placeholder="Valor" :state="$isValid(props.form.$v.form.entity.valor)" />
                    <b-form-invalid-feedback>Ingrese el Valor</b-form-invalid-feedback>
                    <br>
                    <p>*Cotizacion con respecto al Dolar</p>
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
                    monedaId: { required },
                    valor: { required }
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