<template>
  <div class="cashflow-container">
    <b-row>
        <b-colxx :xxs="3">
     <div class="filter-sm">
           <b-form-datepicker  class="filter-select" v-model="filtroGrillaOptions.fechaDesde"  placeholder="Fecha Desde"></b-form-datepicker>     
     </div>
     </b-colxx>
     <b-colxx :xxs="3">
          <div class="filter-sm">
                <b-form-datepicker  class="filter-select"  v-model="filtroGrillaOptions.fechaHasta" placeholder="Fecha Hasta"></b-form-datepicker>     
          </div>
    </b-colxx>
    <div class="search">
      <i class="simple-icon-refresh" title="Refrescar" @click="search"></i>          
    </div>
      
    </b-row>
   
    <loading ref="loader" />
    <b-carousel
      id="carousel-1"
      v-model="slide"
      :interval="0"
      :controls="true"
      :indicators="false"
      img-width="1024"
      img-height="480"
      @sliding-start="onSlideStart"
      @sliding-end="onSlideEnd"

      v-if="proyeccion.id > 0 && proyeccion.months.length > 0"
    >
      <!-- Text slides with image -->
      <b-carousel-slide v-for="(month, index) in proyeccion.months" img-blank-color="transparent" :key="month.id">
        <template #img style="margin: 18%">
              <div class="month-title">
                {{month.name + ' / ' + month.year}}
              </div>
              <table class="inlineTable">
                <tr>
                  <th class="c-grid-header totalizadores headcol">Orígen</th>
                  <th class="c-grid-header totalizadores" v-for="day in month.days" :key="day.id">
                    {{ day.number }}
                  </th>
                </tr>            
                  <template  v-if="opened.includes('ingreso' + month.name + month.year)">
                    <tr v-for="origen in month.origenes" :key="origen.id  + month.name + 'ingreso' + month.year">
                      <th class="origen-nombre headcol">{{ origen.origen.nombre }}</th>
                      <td v-for="(value, index) in origen.ingresos" class="value-field valores" :key="index">
                        {{ maskForCulNum(value) }}
                      </td>
                    </tr>
                  </template>      
                <tr @click="toggle('ingreso' + month.name + month.year)">
                  <th class="totalizadores headcol" >Ingresos</th>
                  <td v-for="total in month.totalesIngresos" :class="{ negative: total.valor < 0 }"  class="value-field totalizadores" :key="total.id + index + month.name + 'ingreso' + month.year">
                    {{ maskForCulNum(total.valor) }}
                  </td>
                </tr>
                <template  v-if="opened.includes('egreso' + month.name + month.year)">
                    <tr v-for="origen in month.origenes" :key="origen.id + month.name + 'egreso' + month.year">
                      <th class="origen-nombre headcol">{{ origen.origen.nombre }}</th>
                      <td v-for="(value, index) in origen.egresos" class="value-field valores" :key="index">
                        {{ maskForCulNum(value) }}
                      </td>
                    </tr>
                </template>
                <tr @click="toggle('egreso' + month.name + month.year)">
                  <th  class="totalizadores headcol">Egresos</th>
                  <td v-for="total in month.totalesEgresos" :class="{ negative: total.valor < 0 }"  class="value-field totalizadores"  :key="total.id + index + month.name + 'egreso' + month.year">
                    {{ maskForCulNum(total.valor) }}
                  </td>
                </tr>                               
                <tr>
                  <th :colspan="month.days.length + 1"></th>
                </tr>
                <template v-if="opened.includes('preBalance' + month.name + month.year)">
                    <tr v-for="origen in month.origenes" :key="origen.id  + month.name + 'preBalance' + month.year">
                      <th class="origen-nombre headcol">{{ origen.origen.nombre }}</th>
                      <td v-for="(value, index) in origen.preBalance" class="value-field valores" :key="index">
                        {{ maskForCulNum(value) }}
                      </td>
                    </tr>
                </template>
                <tr @click="toggle('preBalance' + month.name + month.year)">                  
                  <th class="totalizadores headcol" >Balance</th>
                  <td v-for="total in month.balance" :class="{ negative: total.valor < 0 }" class="value-field totalizadores" :key="total.id + index + month.name + 'balance' + month.year">
                    {{ maskForCulNum(total.valor) }}
                  </td>
                </tr>
                 <tr>
                  <th :colspan="month.days.length + 1"></th>
                </tr>
                <tr>
                  <th class="totalizadores headcol" > CONSOLIDADO</th>
                  <td class="value-field totalizadores" :class="{ negative: month.consolidado < 0 }" :colspan="month.days.length" >
                    {{ maskForCulNum(month.consolidado) }}
                  </td>
                </tr>
                <tr>
                  <th :colspan="month.days.length + 1"></th>
                </tr>
                <tr v-for="(tc, index) in month.tiposDeCambio"  :key="tc.id + index + month.name + 'balanceOrigen' + month.year">
                  <th class="origen-nombre headcol">TC $ a {{ tc.cotizacionMoneda.moneda.abreviatura }}</th>
                  <td class="value-field valores" v-for="(valor, index) in tc.valores" :key="tc.id + index + month.name + 'balance' + month.year">
                    {{ maskForCulNum(valor) }}
                  </td>
                </tr>
                  <tr>
                  <th :colspan="month.days.length + 1"></th>
                </tr>
                <template  v-if="opened.includes('saldoincial' + month.name + month.year)">
                <tr v-for="origen in month.origenes" :key="origen.id  + month.name + 'saldoincial' + month.year">
                  <th class="origen-nombre headcol">{{ 'S.I. - ' + origen.origen.nombre }}</th>
                  <td v-for="(value, index) in origen.saldosIniciales" class="value-field valores" :key="index">
                    <!-- <template>
                      <b-form-input  type="text"  />
                    </template> -->
                    {{ maskForCulNum(value) }}
                  </td>
                </tr>
                </template>
                <tr @click="toggle('saldoincial' + month.name + month.year)">
                  <th class="totalizadores headcol" > Balance Total</th>
                  <td v-for="total in month.balanceTotal" class="value-field totalizadores" :class="{ negative: total.valor < 0 }"  :key="total.id + index + month.name + 'saldoincial' + month.year">
                    {{ maskForCulNum(total.valor) }}
                  </td>
                </tr>
                
              </table>
        </template>
      </b-carousel-slide>
    </b-carousel>
    
  </div>
</template>
   <!-- <tr v-if="opened.includes(row.id)" :key="row.name">
        <td colspan="2">ON!</td>
      </tr>
      <tr @click="toggle(row.id)" :class="{ opened: opened.includes(row.id) }" :key="row.id">
        <td>{{ row.name }}</td>
        <td>{{ row.handle }}</td>
      </tr>       -->

 
<script>
import createNumberMask from "text-mask-addons/dist/createNumberMask";
import vuexStore from "../../../store";

const currencyMask = createNumberMask({
  prefix: "",
  allowDecimal: true,
  thousandsSeparatorSymbol: ".",
  decimalSymbol: ",",
  allowNegative: false,
});

export default {
  data() {
    return {
      mask: currencyMask,
      interval: 0,
      slide: 0,
      sliding: null,
      dataline: 10,
      grouping: {
        props: ["name"],
        // expandedAll: true,
      },
      opened: [],
      api: this.$api["cashflow"],
      filtroGrillaOptions: {
        fechaDesde: null,
        fechaHasta: null
      },
      proyeccion: {
        id: 0,
        months: [
          {
            name: "",
            year: "-",
            days: [],
            totalesIngresos: [],
            totalesEgresos: [],
            origenes: [
              {
                origen: { id: 0, nombre: "" },
                egresos: [],
                ingresos: [],
                saldosIniciales: [],
              },
            ],
          },
        ],
      },
    };
  },
  methods: {
    maskForCulNum(value) {
      value = value.toString();
      if (value.indexOf(".") <= -1) {
        value = value + ".00";
      } else {
        const regDecimal = /^\-?[0-9]+(?:\.[0-9]{2})?$/;
        if (!regDecimal.test(value)) {
          value = value + "0";
        }
      }
      const replnum = value.replace(".", ",");
      const numbers = replnum.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
      return numbers;
    },
    toggle(id) {
      const index = this.opened.indexOf(id);
      if (index > -1) {
        this.opened.splice(index, 1);
      } else {
        this.opened.push(id);
      }
    },
    getReport(filter) {
    this.$refs.loader.show();
      return this.api.getReport(filter);
    },
    onSlideStart(slide) {
      this.sliding = true;
    },
    onSlideEnd(slide) {
      this.sliding = false;
    },
    search() {
     
    var _this = this;
      this.getReport({desde: this.filtroGrillaOptions.fechaDesde, hasta: this.filtroGrillaOptions.fechaHasta}).then(function (response) {
         _this.$data.proyeccion = response.data; // #1
        _this.$refs.loader.hide();
      })
      .catch(function (error) {
        _this.showError(error);
      });;
      
    }
  },
  mounted: function () {    
    var _this = this;
    this.getReport().then(function (response) {
        _this.$data.proyeccion = response.data; // #1
        _this.$refs.loader.hide();
      })
      .catch(function (error) {
        this.showError(error);
      });;
      
  },
};
</script>
<style>
.c-grid-group-header {
  background-color: lightgray;
  border: 1px solid gray;
  border-bottom: 0;
  text-align: center;
}

.c-grid-group-header h4 {
  margin: 0;
  width: 100%;
}

.c-grid-header {
  background-color: lightgray;
  border: 1px solid gray;
  border-bottom: 0;
  text-align: center;
}

.c-grid-header h4 {
  margin: 0;
}

.value-field {
  text-align: right;
}

.negative {
  color: red;
}

.headcol {
  position: sticky;
    left: 0;
}

.inlineTable th,
.inlineTable td {
  padding:10px;
  vertical-align:top;
  border-top:1px solid #dee2e6;
  white-space: nowrap;
}


td.valores {  
  background-color: white;
}
/* .c-grid-container {  overflow-x: scroll; } */

.inlineTable {
  display: inline-block;
}

.carousel-inner {
  padding-left: 4%;
  padding-right: 4%;
  padding-top: 1%;
  background: #f8f8f8;
}

.carousel-control-prev,
.carousel-control-next {
  width: 4%;
}

.totalizadores {
  cursor: pointer;
  background-color: #E3E3E3;
  font-weight: 700 !important;
}

.carousel-item.active {
  background-color: transparent !important;
  overflow-x: scroll;
  height: 75vh;
}

.carousel-caption {
    position: absolute;
    height: 20px;
    top: 0;
    right: 0%;
    bottom: 0;
    left: 0;
    padding-top: 0;
    padding-bottom: 0;
    text-align: left;
    color: gray;    
    text-shadow: none;
}

.carousel-control-next-icon {
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='%' viewBox='0 0 8 8'%3e%3cpath d='M2.75 0l-1.5 1.5 2.5 2.5-2.5 2.5 1.5 1.5 4-4-4-4z'/%3e%3c/svg%3e");
}

.carousel-control-prev-icon {
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='%' viewBox='0 0 8 8'%3e%3cpath d='M5.25 0l-4 4 4 4 1.5-1.5-2.5-2.5 2.5-2.5-1.5-1.5z'/%3e%3c/svg%3e");
}

.origen-nombre {
  width: 100px; 
  font-weight: 700;
  background-color: #f8f8f8;
}

.myable td{
  padding:10px;
  vertical-align:top;
  border-top:1px solid #dee2e6
}

.fade-enter-active, .fade-leave-active {
  transition: opacity .5s
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0
}
.month-title{
  font-size: 1.8em;
  position:sticky;
  left: 0;
}


.cashflow-container .filter-select {
      border-radius: 23px;
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

.cashflow-container .filter-select label {
  padding-top: 0px !important;
}

.cashflow-container .filter-select button.btn {
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

      .cashflow-container .search {
        width: 0;
            padding-top: 10px;
    }

    .cashflow-container .search i {
        font-size: 20px;
        color: #666;
        cursor: pointer;
        margin: 4px;
        border-radius: 3px;
        position: relative;
        top: -1px;
    }

    .cashflow-container .search i:hover {        
        color: #333;        
        background-color: #eee;
    }
</style>
