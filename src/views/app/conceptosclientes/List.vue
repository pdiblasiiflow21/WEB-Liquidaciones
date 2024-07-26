<template>
    <div>
        <list-view
            ref="listView"
            resource="conceptosclientes"
            :onBeforeSave="onBeforeSave"
            :onBeforeEdit="onBeforeEdit"
            :filter=filtroGrillaOptions
            :customValidations="customValidations"
            :showActions="true"
            :modalSize="modalSize"
            :showEdit="showEdit"
            :showDelete="showDelete"         
            :searchBy="sada"
            :showNew="true"
        >
            <template slot='title'>
                Conceptos x Cliente
            </template>

        <template slot="action-btn">             
            <b-button variant="dark" size="sm"  @click="resetData"><img src="/assets/img/borrador.png" height ="20" width="20" /></b-button>
        </template> 

        <template slot="filters"> 
            <b-colxx :xxs="3">
              <div class="filter   float-md-left mr-6 align-top"></div>
               <div class="filter-sm">
                     <b-form-datepicker  class="filter-select" v-model="filtroGrillaOptions.fechaDesde" placeholder="Fecha Desde" style="border-radius: 25px;"></b-form-datepicker>     
               </div>          
            </b-colxx>
            <b-colxx :xxs="3">
              <div class="filter   float-md-left mr-6 align-top"></div>
              <div class="filter-sm">
                <b-form-datepicker  class="filter-select"  v-model="filtroGrillaOptions.fechaHasta" placeholder="Fecha Hasta" style="border-radius: 25px;"></b-form-datepicker>     
              </div>
            </b-colxx>
        </template> 

            <template slot='columns'>
                <column field="id" title="Id" width="40" />
                <column :field="(entity) => entity.cliente.razonSocialNombre"  title="Usuario OMS" width="150" />                                                
                <column :field="(entity) => { return entity.concepto.codigo }" title="Código concepto" width="100"/>                                                
                <column :field="(entity) => { return entity.observacion}" title="Observación" width="200"/>                                                
                <column :field="(entity) => maskForCulNum(entity.monto)"  title="Monto" width="100"/>
                <column :field="(entity) => { return entity.concepto.descuento ? 'Si' : 'No'}"  title="Descuento" width="150" /> 
                <column  :field="(entity) => entity.updateDate ? moment(entity.updateDate).format('DD/MM/YYYY') : moment(entity.createDate).format('DD/MM/YYYY')"   title="Fecha última modificación" width="150" />                                                    
                <column :field="(entity) => { return entity.estado != null ? `${getEstados(entity.estado)} ` : '' }" title="Estado" width="100"/>                                                
            </template>
            <template slot='modal-form' slot-scope="props">     
                    <b-row>
                        <b-col>
                            <b-form-group label="Cliente"> 
                                <select-deluxe resource="clientes" :filter="filterCustomer"  :selectItemLabel="({ razonSocialNombre, omsId }) => `${razonSocialNombre} (${omsId})`"  method="getAll"  placeholder="Seleccionar cliente" v-model="props.form.entity.cliente"  :state="$isValid(props.form.$v.form.entity.cliente)" :enabled="!(props.form.entity && props.form.entity.id > 0)"></select-deluxe>
                                <b-form-invalid-feedback>Seleccione el Cliente</b-form-invalid-feedback>
                            </b-form-group>
                        </b-col>
                        <b-col>
                            <b-form-group label="Concepto"> 
                                <select-deluxe resource="conceptos" :selectItemLabel="({ codigo, nombre}) => `${codigo + ' - ' + nombre}`" method="getAll"  placeholder="Seleccionar concepto" :ordered="true" v-model="props.form.entity.concepto" :state="$isValid(props.form.$v.form.entity.concepto)" :enabled="!(props.form.entity && props.form.entity.id > 0)" ></select-deluxe>
                                <b-form-invalid-feedback>Ingrese el Concepto</b-form-invalid-feedback>
                            </b-form-group>
                        </b-col>
                        <b-col>
                            <b-form-group label="Monto"> 
                                <b-form-input type="text"  placeholder="Monto" v-mask="numberMask"  v-model="props.form.entity.monto" :state="$isValid(props.form.$v.form.entity.monto)"/>  
                                <b-form-invalid-feedback>Ingrese el monto</b-form-invalid-feedback> 
                            </b-form-group>         
                        </b-col>
                        <b-col>      
                            <b-form-group label="Observación">
                                <b-form-input   placeholder="Observación" v-model="props.form.entity.observacion" :state="$isValid(props.form.$v.form.entity.observacion)"/>
                                <b-form-invalid-feedback>Ingrese Observación</b-form-invalid-feedback>                                
                            </b-form-group>
                        </b-col>                        
                    </b-row>
            </template>
        </list-view>
    </div>
</template>

<script>
    const { required } = require('vuelidate/lib/validators')
     import createNumberMask from 'text-mask-addons/dist/createNumberMask';
     import moment from "moment";
    const currencyMask = createNumberMask({
      prefix: '',
      allowDecimal: true,
      thousandsSeparatorSymbol: '.',
      decimalSymbol: ',',
      allowNegative: false,
    });


    export default {
        data () {
            return {
                numberMask: currencyMask,
                customValidations: {          
                    clienteId: {  },
                    conceptoId: {  },          
                    cliente: { required },
                    concepto: { required },
                    monto: { required },
                    observacion: {  }
                },
                filtroGrillaOptions: {
                    fechaDesde: null,
                    fechaHasta: null,
                },
                api: this.$api['conceptos'],
                estadosConceptos: [
                  { value: 1, text: 'Pendiente de Autorización'},
                  { value: 2, text: 'Autorizado'},
                  { value: 3, text: 'Anulado'},
                ], 
                modalSize: 'xl',
                filterCustomer: {
                    tipoCliente: 2
                },
                moment: moment,                
                sada: 'Buscar por Razón Social',
            }
        },
        methods: {
            maskForCulNum(value) {
            if (value) {
                value = value.toString();
                if (value.indexOf(".") <= -1) {
                    value = value + ".00";
                } else {
                    const regDecimal = /^\-?[0-9]+(?:\.[0-9]{2})?$/;
                    if (!regDecimal.test(value)) {
                        value = value + "0";
                    }
                }
            }
            const replnum = value.toString().replace(".", ",");
            const numbers = replnum.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
            return numbers;
            },
            showDelete(entity) {
                return entity.estado === 1; 
            },
            showEdit(entity) {
                return entity.estado === 1; 
            },
            onBeforeSave (form) {
                let result = { hasErrors: false, messages: [] };
                form.entity.monto = form.entity.monto.toString().replaceAll('.','').replace(',', '.')
                form.entity.clienteId = form.entity.cliente.id;
                form.entity.conceptoId = form.entity.concepto.id;
                return Promise.resolve(result);
            },
            onBeforeEdit(form) {
                let result = { hasErrors: false, messages: [] };
                if (form.entity?.monto)
                {
                    form.entity.monto = this.maskForCulNum(form.entity?.monto);
                }
                return Promise.resolve(result);
            },
            getEstados(estado) {
                return this.estadosConceptos.find(x => x.value === estado).text;
            },
            resetData() {
                this.resetFilters();
            },
            resetFilters() {
                this.filtroGrillaOptions.fechaDesde = null;
                this.filtroGrillaOptions.fechaHasta = null;
                this.$refs.listView.resetTextAndSearch();
            },
            refreshGridItem () {
                let cfiler = this.filtroGrillaOptions;
                this.$refs.listView.search();
            }
        }
    };
</script>


<style>
    .invalid-feedback.show {
        display: block
    }

    .button-container{
        padding-top: 27px;
    }

    .custom-select {
        font-size: 0.8rem;
    }
</style>