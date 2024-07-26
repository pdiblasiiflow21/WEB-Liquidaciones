<template>
    <div v-if="canSeePage()">
        <list-view
            resource="conceptos"
            :onBeforeSave="onBeforeSave"
            :onBeforeEdit="onBeforeEdit"
            :onBeforeDelete="onBeforeDelete"
            :customValidations="customValidations"
            :showActions="true"
            :showEdit="true"
            :showDelete="true"
            :showNew="true"  
                :searchBy="sada"
        >
            <template slot='title'>
                Conceptos 
            </template>
            <template slot='columns'>
                <column field="id" title="Id" width="40" />
                <column field="codigo" title="Código" width="150" />                                                
                <column field="nombre" title="Nombre" width="250"/>
                <column :field="(entity) => { return entity.codigoProducto != null ? entity.codigoProducto.productCode : ''}"  title="Código Producto" width="250" />
                <column :field="(entity) => { return entity.descuento ? 'Si' : 'No'}"  title="Descuento" width="150" />                                  
                <column :field="(entity) => moment(entity.updateDate ? entity.updateDate : entity.createDate).format('DD/MM/YYYY')"  title="Fecha Modificación" width="150" />                         
            </template>
            <template slot='modal-form' slot-scope="props">               
                <b-form-group label="">
                    <b-form-input  v-model="props.form.entity.codigo" placeholder="Código" :state="$isValid(props.form.$v.form.entity.codigo)" :disabled="props.form.entity && props.form.entity.id > 0"/>
                    <b-form-invalid-feedback>Ingrese el código</b-form-invalid-feedback>
                </b-form-group>
                <b-form-group label=""> 
                    <select-deluxe resource="codigoProducto" :selectItemLabel="({ productCode, productName}) => `${productCode + ' - ' + productName}`" method="getAll"  placeholder="Seleccionar código del producto" v-model="props.form.entity.codigoProducto" :state="$isValid(props.form.$v.form.entity.codigoProducto)"></select-deluxe>
                    <b-form-invalid-feedback>Ingrese el código del producto</b-form-invalid-feedback>
                </b-form-group>                    
                <b-form-group label="">
                    <b-form-input  v-model="props.form.entity.nombre" placeholder="Nombre" :state="$isValid(props.form.$v.form.entity.nombre)" />
                    <b-form-invalid-feedback>Ingrese el nombre</b-form-invalid-feedback>
                </b-form-group>
                <b-form-group label="">
                    <b-form-checkbox v-model="props.form.entity.descuento" :disabled="props.form.entity && props.form.entity.id > 0">Descuento</b-form-checkbox>
                </b-form-group>                
            </template>
         
        </list-view>
    </div>
    <div v-else>
        <div class="welcome">
            <h2>No tiene permisos para ver esta pantalla</h2>
            <span class="home-logo"></span>
        </div>
    </div>
</template>

<script>
    const { required } = require('vuelidate/lib/validators')

    import moment from 'moment';
    import store from "../../../../store";

    export default {
        data () {
            return {
                customValidations: {                    
                    codigo: { required },
                    nombre: { required },
                    codigoProducto: { required }
                },
                api: this.$api['conceptos'],
                codigoProductoFilter: { codigoProductoId: 0 },
                moment: moment,                
                sada: 'Buscar por Nombre',
                token: store.state.auth.token,
            }
        },
        methods: {
            canSeePage(){                          
                if (this.token) {
                    var objx =  JSON.parse(atob(this.token.split('.')[1])) ;
                    return objx.permissions.indexOf("write:conceptos") > -1 || objx.permissions.indexOf("read:conceptos") > -1 ;
                }        
            },
            validatecreate (entity) {
                 return this.api.validatecreate(entity);
            },
            validateupdate (entity) {
                 return this.api.validateupdate(entity);
            },
            validatedelete (entity) {
                 return this.api.validatedelete(entity);
            },
            setCodigoProductoFilter(entity) {
                this.codigoProductoFilter = { codigoProductoId: entity.codigoProducto ? entity.codigoProducto.id : 0 };
            },
            async onBeforeSave (form) {
                let result = { hasErrors: false, messages: [] };
                let response = null;
                if (form.entity && form.entity.id > 0) {
                    response = await this.validateupdate(form.entity)
                }
                else {
                    response = await this.validatecreate(form.entity);
                }
                if(response.body.successful == false)
                {
                   result.messages = [response.body.message]; 
                }
                result.hasErrors = result.messages.length > 0;
                return Promise.resolve(result);
            },
            async onBeforeEdit (form) {
                let result = { hasErrors: false, messages: [] };
                result.hasErrors = result.messages.length > 0;
                return Promise.resolve(result);
            },
            async onBeforeDelete (form) {
                let result = { hasErrors: false, messages: [] };
                let response = await this.validatedelete(form.entity);
                if(response.body.successful == false)
                {
                   result.messages = [response.body.message]; 
                }
                result.hasErrors = result.messages.length > 0;
                return Promise.resolve(result);               
            }
        }
    };
</script>


<style>
    .invalid-feedback.show {
        display: block
    }

    
.welcome {
   display: flex;
    flex-direction: column;
    justify-content: center;
    height: 80vh;
    width: 100%;
    text-align: center;
}

   .home-logo{
    height: 80%;
    background: url(/assets/img/logo-black.png) no-repeat;
    background-position: center center;
    background-size: 45%;
   }

</style>