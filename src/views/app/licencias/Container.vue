<template>
  <div class="licencia-container">
    <div class="grid">
      <list-view 
            ref="listView" 
            resource="licencias" 
            method="basicQuery"
            :onBeforeSave="onBeforeSave"
            :customValidations="customValidations"
            :showActions="true"
            :showEdit="true"
            :showDelete="true"            
        >
        <!-- TITULO -->
        <template slot="title">Licencias</template>

        <!-- COLUMNAS -->
        <template slot="columns">
          <!-- <column field="id" title="Id" width="40"/> -->
          <column field="codigo" title="Código" />
          <column :field="(entity) => moment(entity.expiracion).format('DD/MM/YYYY')" title="Fecha de Expiracion"
          />
          <column :field="(entity) => { return entity.companiaNombre }" title="Compañía"/>

          <column :field="(entity) => { return entity.descripcion }" title="Descripción"/>
          <column :field="(entity) => { return entity.plan.nombre }" title="Plan"/>
          <column
            :field="(entity) => (entity.enabled ? 'Si' : 'No')"
            title="Habilitado"
          />
        </template> 

        <!-- FORMULARIO ALTA -->
        <template slot='modal-form' slot-scope="props">  
            <!-- CODIGO -->
            <b-form-group label="Código">
                <b-form-input  v-model="props.form.entity.codigo" placeholder="Código" :state="$isValid(props.form.$v.form.entity.codigo)" />
                <b-form-invalid-feedback>Ingrese el nombre</b-form-invalid-feedback>
            </b-form-group>   
            <!-- DESCRIPCION -->
            <b-form-group label="Descripcion">
                <b-form-input  v-model="props.form.entity.descripcion" placeholder="Descripcion" />
            <b-form-invalid-feedback>Ingrese la Descripcion</b-form-invalid-feedback>
            </b-form-group>   
            <!-- COMPANIA -->
            <b-form-group label="Compañías">
                <select-deluxe
                    resource="companias"
                    method="getAll"
                    selectItemLabel="nombre"
                    valueField="id"
                    placeholder="Seleccionar compañía" 
                    v-model="props.form.entity.companiaId"
                ></select-deluxe>
            </b-form-group>   
            <!-- PLANES -->
            <b-form-group label="Planes">
                <select-deluxe
                    resource="planes"
                    method="getAll"
                    selectItemLabel="nombre"
                    value="object"
                    placeholder="Seleccionar plan" 
                    v-model="props.form.entity.plan"
                ></select-deluxe>
            </b-form-group>   
            <!-- FECHA EXPIRACION -->
            <div class="d-flex-date">
                <label for="">Fecha de expiración</label>
                <h5>{{calcExpiration(props.form.entity.plan)}}</h5>
            </div>
        </template>
      </list-view>
    </div>
  </div>
</template>

<script>
import moment from 'moment';
const { required } = require('vuelidate/lib/validators');
export default {
    data(){
        return {
            moment: moment,
            customValidations: {
                codigo: { required }
            }
        };
    },
    methods:{
        calcExpiration(plan){
            if(plan){
                var d =  new Date();
                // var d = new Date(n.getFullYear, n.getMonth, n.getDate);
                d.setMonth(d.getMonth() + plan.mesesValidez);
                return d.toLocaleDateString();
            }
        },
        onBeforeSave(form) {
            let result = { hasErrors: false, messages: [] };
            //add validations here
            result.hasErrors = result.messages.length > 0;

            //apply custom logic here

            return Promise.resolve(result);
        }
    }
};
</script>

<style lang="scss" scoped>
.d-flex-date{    
    display: flex;
    label{
        margin-right: 25px;
    }
    h5{
        font-size: .9rem;
    }
}

</style>