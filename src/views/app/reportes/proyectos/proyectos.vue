<template>
  <div class="reporteproyectos-container">
    <div class="grid">
      <list-view
        resource="reporteproyecto"
        :method="getReport"
        :showActions="false"
        :showEdit="false"
        :showDelete="false"
        :searchSize="searchSize"
        :filter="{desde: filtroGrillaOptions.fechaDesde, hasta: filtroGrillaOptions.fechaHasta, estado: filtroGrillaOptions.selected}"
        :onAfterLoad="onAfterLoad"
        ref="list"
      >
        <template slot="title"> Reporte de Proyectos </template> 
        <template slot="action-btn">             
            <b-button variant="primary" size="lg"  @click="exportFile">Exportar</b-button>
        </template> 
        <template slot="filters"> 
          <b-colxx :xxs="3">
              <div class="filter   float-md-left mr-6 align-top"></div>
               <div class="filter-sm">
                     <b-form-datepicker  class="filter-select" v-model="filtroGrillaOptions.fechaDesde" placeholder="Fecha Desde"></b-form-datepicker>     
               </div>          
            </b-colxx>
            <b-colxx :xxs="3">
              <div class="filter   float-md-left mr-6 align-top"></div>
              <div class="filter-sm">
                <b-form-datepicker  class="filter-select"  v-model="filtroGrillaOptions.fechaHasta" placeholder="Fecha Hasta"></b-form-datepicker>     
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
          <column :field="(entity) => entity.proyecto.nombre"  title="Nombre" width="140" />   
          <column :field="(entity) => entity.proyecto.createdBy" title="Usuario"   width="60" />         
          <column :field="(entity) => moment(entity.proyecto.createDate).format('DD/MM/YYYY')" title="Fecha Creación" width="40" />       
          <column :field="(entity) => moment(entity.fechaDeAprobacion).format('DD/MM/YYYY')" title="Fecha Aprobación" width="40" />   
          <column :field="(entity) => entity.proyecto.estado.descripcion"  title="Estado" width="40" />   
          <column :field="(entity) => maskForCulNum(entity.proyecto.valorTotal)"  title="Valor Total" width="40" />   
          <column :field="(entity) => maskForCulNum(entity.facturado)"  title="Facturado" width="40" />   
          <column :field="(entity) => maskForCulNum(entity.pendientesFacturar)" title="Pendiente de Facturar" width="40" />   
          <column :field="(entity) => maskForCulNum(entity.gastosImputados)" title="Gastos Imputados" width="40" />   
          <column :field="(entity) => maskForCulNum(entity.gastosPendientesFacturar)" title="Gastos Pendientes Facturar" width="40" />   
          <column :field="(entity) => maskForCulNum(entity.resultadoDelProyecto)" title="Resultado" width="40" />             
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
      filtroGrillaOptions: {
        fechaDesde: null,
        fechaHasta: null,
        selected: 0,
        options: [
          { value: 0, text: 'Todos'},
          { value: 1, text: 'Pendiente'},
          { value: 2, text: 'Iniciado'},
          { value: 3, text: 'Pausado'},
          { value: 3, text: 'Demorado'},
          { value: 3, text: 'Finalizado'}
        ]
      },
      formasFacturacion: [
              { value: 1, text: 'Hito'},
              { value: 2, text: 'Mensual'},
              { value: 3, text: 'Único Pago'}
            ],            
      token: store.state.auth.token,
       api: this.$api['reporteproyecto'],    
       }
  },
  methods: {
       async exportFile(){
            this.$refs.loader.show();
            let response = await this.api.exportFile({desde: this.filtroGrillaOptions.fechaDesde, hasta: this.filtroGrillaOptions.fechaHasta, estado: this.filtroGrillaOptions.selected})
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
    refreshGridItem () {
        this.$refs.list.search();
      },
    onAfterLoad() {
      this.filtroGrillaOptions.fechaDesde = null;
      this.filtroGrillaOptions.fechaHasta = null;
    },
    maskForCulNum(value) {
      if (value) {
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
      } else {
        value = '0';
      }
     
      const replnum = value.replace('.', ',');
      const numbers = replnum.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      return numbers;
    },
    onBeforeSave(form) {
      let result = { hasErrors: false, messages: [] };
      //add validations here
      result.hasErrors = result.messages.length > 0;
      form.entity.valorTotal = form.entity.valorTotal.replaceAll('.','');
      //apply custom logic here

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
  
.reporteproyectos-container .filter-select {
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


.reporteproyectos-container .filter-select label {
  padding-top: 0px !important;
}

.reporteproyectos-container .filter-select button.btn {
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

    .reporteproyectos-container .top-right-button-container .new-button {
      display: none;
    }

</style>