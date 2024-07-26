<template>
  <div class="facturacionygastos-container">
    <div class="grid">
      <list-view
        resource="facturacionygastos"
        :method="getReport"
        :showActions="false"
        :showEdit="false"
        :showDelete="false"
        :searchSize="searchSize"
        :filter="filtro"
        :onAfterLoad="onAfterLoad"
        ref="list"
      >
        <template slot="title"> Reporte de Facturación y Gastos </template>
           <template slot="action-btn">             
            <b-button variant="primary" size="lg"  @click="exportFile">Exportar</b-button>
        </template> 
        <template slot="filters"> 
          <b-colxx :xxs="3">
              <div class="filter   float-md-left mr-6 align-top"></div>
               <div class="filter-sm">
                     <b-form-datepicker class="filter-select" reset-button v-model="filtroGrillaOptions.fechaDesde"  placeholder="Fecha Desde" ></b-form-datepicker>     
               </div>
          
            </b-colxx>
                 <b-colxx :xxs="3">
              <div class="filter   float-md-left mr-6 align-top"></div>
               <div class="filter-sm">
                     <b-form-datepicker  class="filter-select" reset-button  v-model="filtroGrillaOptions.fechaHasta" placeholder="Fecha Hasta" ></b-form-datepicker>     
               </div>
          
            </b-colxx>
            <b-colxx :xxs="3">
              <div class="filter   float-md-left mr-12 align-top"></div>
               <div class="filter-sm">
                  <b-form-select  variant="outline-info" class="filter-select"   v-model="filtroGrillaOptions.selected" v-on:change="refreshGridItem($event, value)" >
                    <option v-for="(selectOption, indexOpt) in filtroGrillaOptions.options"  :key="indexOpt" :value="selectOption.value">
                      {{ selectOption.text }}
                    </option>
                  </b-form-select>
               </div>
          
            </b-colxx>
        </template>    
        <template slot="columns">
          <column :field="(entity) => moment(entity.fechaCreacionPago).format('DD/MM/YYYY')"  title="F. Creacion" width="40" />   
          <!-- <column :field="(entity) => moment(entity.mesAnio).format('YYYY')" title="Mes Año" width="40" />    -->
          <!-- <column field="semana" title="Semana" width="40" />    -->
          <column field="tipoMovimiento" title="Tipo" width="40" />   
          <column :field="(entity) => getEstadoFacturacion(entity.estadoCobro)" title="Estado" width="40" />   
          <!-- <column :field="(entity) => getEstadoFacturacion(entity.estadoMovimiento)" title="Estado Movimiento" width="40" />    -->
          <column :field="(entity) => entity.fechaRealPago ? moment(entity.fechaRealPago).format('DD/MM/YYYY') : ''" title="Fecha" width="40" />   
          <!-- <column :field="(entity) => moment(entity.mesAnioReal).format('MM/YYYY')" title="Mes/Año Real" width="40" />    -->
          <!-- <column field="semanaReal" title="Semana Real" width="40" />    -->
          <column field="createdBy" title="Comercial" width="40" />   
          <column :field=" (entity) => { return entity.proveedor != null ? `${entity.proveedor.nombre} ` : ''; }" title="Entidad" width="60" /> 
          <column :field="(entity) => getEstadoPagos(entity.estadoPago)"  title="Estado Pago" width="40" />   
          <column field="concepto" title="Concepto" width="40" />   
          <column field="formaPago" title="Forma Pago" width="40" />   
          <column :field="(entity) => getTipoFactura(entity.tipoFactura)" title="Tipo Factura" width="40" />   
          <column field="numeroFactura" title="Núm. Factura" width="40" />   
          <column field="moneda" title="Moneda" width="40" />   
          <column :field="(entity) => maskForCulNum(entity.valorMonedaOrigen)" title="Valor Origen" width="40" />   
          <column :field="(entity) => maskForCulNum(entity.valorPesos)" title="Valor Pesos" width="40" />   
          
        </template>
      </list-view>
    </div>
    <loading ref="loader" />
    
  </div>
</template>

<script>
import moment from 'moment';
import store from '../../../../store'

import createNumberMask from 'text-mask-addons/dist/createNumberMask';
const currencyMask = createNumberMask({
  prefix: '',
  allowDecimal: true,
  thousandsSeparatorSymbol: '.',
  decimalSymbol: ',',
  allowNegative: false,
});
export default {
  data() {
    return {
        mask: currencyMask,
        moment: moment,
      searchSize: '3',
      getReport: 'getReport',
      fechaDesde: '',
      fechaHasta: '',
      filtroGrillaOptions: {
        fechaDesde: null,
        fechaHasta: null,
        selected: 0,
        options: [
          { value: 0, text: 'Todos'},
          { value: 1, text: 'Facturación'},
          { value: 2, text: 'Pago'},
          { value: 3, text: 'Gasto'}
        ]
      },
      formasFacturacion: [
              { value: 1, text: 'Hito'},
              { value: 2, text: 'Mensual'},
              { value: 3, text: 'Único Pago'}
            ],            
      token: store.state.auth.token,
      estadosFacturacion: [
          { value: 0, text: ''},
          { value: 1, text: 'Pendiente de Aprobación'},
          { value: 2, text: 'Aprobado'},
          { value: 3, text: 'Facturado'},
          { value: 4, text: 'Cobrado'}
                ],
      estadosPagos: [
          { value: 0, text: ''},
          { value: 1, text: 'Pendiente de Aprobación'},
          { value: 2, text: 'Aprobado'},
          { value: 3, text: 'Pagado'}
      ],
       tipoComprobantes: [
                  { value: 0, text: ''},
                  { value: 1, text: 'Factura'},
                  { value: 2, text: 'Caja'},
                  { value: 3, text: 'Nota de Crédito'},
                  { value: 4, text: 'Nota de Débito'}
                ],
       api: this.$api['facturacionygastos'],    
    }
  },
  computed:{
    filtro: function(){
      return {desde: this.filtroGrillaOptions.fechaDesde, hasta: this.filtroGrillaOptions.fechaHasta, tipo: this.filtroGrillaOptions.selected};
    }
  },
  watch: {
    filtro: {
      handler: function(val, oldVal){
        var _this = this;
        setTimeout(() => {_this.refreshGridItem();}, 500);
      }
    }
	},
  methods: {
           async exportFile(){
            this.$refs.loader.show();
            let response = await this.api.exportFile({desde: this.filtroGrillaOptions.fechaDesde, hasta: this.filtroGrillaOptions.fechaHasta, tipo: this.filtroGrillaOptions.selected})
               if(response){
                    const url = window.URL.createObjectURL(new Blob([response.data]));
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', 'reporte-proyecto.csv');
                    document.body.appendChild(link);
                    link.click();
               }
               this.$refs.loader.hide();

        },
     refreshGridItem: function(id) {
        this.$refs.list.search();
      },
    onAfterLoad() {
      // this.filtroGrillaOptions.fechaDesde = null;
      // this.filtroGrillaOptions.fechaHasta = null;
    },
    getTipoFactura(value) {
      const estado = this.tipoComprobantes.find(x => x.value == value);
      if (estado) {
        return estado.text;
      } else {
        return '';
      }
      
    },
    getEstadoFacturacion(value) {
      const estado = this.estadosFacturacion.find(x => x.value == value);
      if (estado) {
        return estado.text;
      } else {
        return '';
      }
      
    },
    getEstadoPagos(value) {
      const estado = this.estadosPagos.find(x => x.value == value);
      if (estado) {
        return estado.text;
      } else {
        return '';
      }
    },
    maskForCulNum(value) {
      value = value.toString();
      if (value.indexOf('.') <= -1) {
        value = value + '.00';
      } else {
        const regDecimal = /^\-?[0-9]+(?:\.[0-9]{2})?$/;
        if (!regDecimal.test(value)){
          value = value + '0';
        }
      }
      const replnum = value.replace('.', ',');
      const numbers = replnum.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      const numbersSinComa = numbers.substring(0,numbers.indexOf(','));
      return numbersSinComa;
    },
    onBeforeSave(form) {
      let result = { hasErrors: false, messages: [] };
      result.hasErrors = result.messages.length > 0;
      form.entity.valorTotal = form.entity.valorTotal.replaceAll('.','');

      return Promise.resolve(result);
    },  
  },   
};
</script>


<style>
.invalid-feedback.show {
  display: block;
}

    .filter {
        width: 100%;
        display: flex;
    }

    .filter .filter-sm{
        width: 100%;
        display: flex;
    }
  
.facturacionygastos-container .filter-select {
      border-radius: 23px;
    margin: 10px 0;
    height: 28px !important;
    background: none;
    outline: initial !important;
    border: 1px solid #8f8f8f;
    border-radius: 15px;
    padding: 0.25rem 0.75rem 0.25rem 0.75rem;
    font-size: 0.76rem;
    line-height: 1.3;
    color: #212121;
}

.facturacionygastos-container .filter-select label {
  padding-top: 0px !important;
}

.facturacionygastos-container .filter-select button.btn {
  padding-top: 0px !important;
}

    .filter i {
        font-size: 20px;
        color: #666;
        cursor: pointer;
        margin: 4px;
        border-radius: 3px;
        position: relative;
        top: -1px;
    }

    .filter i:hover {        
        color: #333;        
        background-color: #eee;
    }

    .custom-select {
      font-size: 13px;
    }


    .facturacionygastos-container .top-right-button-container .new-button {
      display: none;
    }

</style>