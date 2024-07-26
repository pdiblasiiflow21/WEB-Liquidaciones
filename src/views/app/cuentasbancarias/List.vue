<template>
    <div class="cuentasbancarias-container">
        <b-container>
        <div class="grid"> 
          <b-row style="margin: 20px; float: right;"> 
            <div>
              <p  v-if="!form.entity.id || form.entity.id <= 0" style="font-size: 19px; margin-right: 15px; margin-top: 10px;"><strong>Fecha Inicio: </strong> {{ moment(form.entity.fechaInicio).format('DD/MM/YYYY') }}</p>
              <p   v-if="form.entity.id > 0" style="font-size: 19px; margin-right: 15px; margin-top: 10px;"><strong>Fecha Cierre: </strong> {{ form.entity.fechaCierre ? moment(form.entity.fechaCierre).format('DD/MM/YYYY') : '' }}</p>
            </div>
            <b-button variant="outline-primary" @click="save(form.entity)" v-if="!form.entity.id || form.entity.id <= 0" :disabled="form.entity.cajaMovimientos.length <= 0">
              Guardar
            </b-button> 
            <b-button variant="outline-primary" @click="update(form.entity)" v-if="form.entity.id > 0">
              Cerrar
            </b-button> 
          </b-row>      
        <b-table
                hover
                table-variant="Primary"
                responsive="sm"
                :items="form.entity.cajaMovimientos"
                :fields="origenesCols"
                :filter="filtroText"
                class="table">
        <template #cell(cuenta)="data">
            {{ data.item.origen.nombre }}
        </template>
        <template #cell(moneda)="data">
            {{ data.item.origen.moneda.abreviatura }}
        </template>
        <template v-slot:cell(ingresoanterior)="data" >
            <b-form-input type="text" v-model="data.item.ingresoAnterior" placeholder="Saldo Inicial Anterior"  v-mask="mask"   :disabled="true"/>
        </template>
        <template v-slot:cell(ingreso)="data" >
            <b-form-input type="text" v-model="data.item.ingreso" placeholder="Saldo Inicial"  v-mask="mask"  :disabled="!isNewIngreso(data.item.cajaEstadoId) && !data.item.fechaCierre"/>
        </template>
         
      </b-table>
        </div>   
        <loading ref="loader" />              
        </b-container> 
        
           <!-- MODAL ERROR  -->
    <div>
      <b-modal id="modal-error" title="Error">
        <template #modal-footer="{ ok }">
          <b> {{ errorGenerado }}</b>
          <b-button size="sm" variant="outline-danger" @click="ok()">
            Aceptar
          </b-button>
        </template>
      </b-modal>
    </div>
    </div>
   
</template>

<script>
import moment from 'moment';
 import createNumberMask from 'text-mask-addons/dist/createNumberMask';
    const currencyMask = createNumberMask({
      prefix: '',
      allowDecimal: true,
      thousandsSeparatorSymbol: '.',
      decimalSymbol: ',',
      allowNegative: false,
    });

const { required, minValue } = require('vuelidate/lib/validators')


    export default {
        data () {
            return {
                mask: currencyMask,
                moment: moment,
                origenesService: this.$api['origenes'],      
                cajaService: this.$api['cajaestados'],
                saldosinicialesService: this.$api['saldosiniciales'],
                origenes: [],
                cajaMovimientos: [],
                origenesCols: [{ key: "origenId" }, 'Cuenta', 'Moneda', 'IngresoAnterior', 'Ingreso'],
                filtroText: "",
                errorGenerado: "",
                cajaEstado: {
                    fechaInicio: '',
                    fechaCierre: '',
                    saldoInicial: 0,
                    saldoCierre: 0,
                },
                form: {
                    entity: {            
                        id: 0,
                        fechaInicio: '',
                        fechaCierre: '',
                        saldoInicial: 0,
                        saldoCierre: 0,
                        cajaMovimientos: [],
                        cajaMovimientosFinales: []
                    },                   
                },  
                 newEntity: {            
                        fechaInicio: '',
                        fechaCierre: '',
                        saldoInicial: 0,
                        saldoCierre: 0,
                        cajaMovimientos: [],
                        cajaMovimientosFinales: []
                    },                   
            }
        },
        // validations: {
        //     form: {
        //         entity: {
        //             mes:  { required },
        //             semana:  { required },
        //             fechaInicio:  { required },
        //             saldoInicial:  { minValue: minValue(0) },
        //         },        
        //     }
        // },
        methods: {
            onBeforeSave (form) {
                let result = { hasErrors: false, messages: [] };
                //add validations here  
                result.hasErrors = result.messages.length > 0;

                //apply custom logic here

                return Promise.resolve(result);
            },
            sumIngreso(value) {
                 this.form.entity.saldoInicial = 0;
                this.form.entity.cajaMovimientos.forEach(x => {
                    this.form.entity.saldoInicial += + x.ingreso;
                });

            },
            isNewIngreso(cajaEstadoId) {
                return !cajaEstadoId  || cajaEstadoId <= 0;
            },
            getOrigenes()  {
              return this.origenesService.get("origenes");
            }, 
            getOrigenes()  {
              return this.origenesService.get("origenes");
            }, 
            getLasCashflow() {
              return this.cajaService.getLast();
            }, 
            getOrigenesByCashflow(id) {
              return this.saldosinicialesService.getSaldoInicialByCashflow(id);
            },
            getPreviousCashflow() {
                return this.cajaService.getPrevious();
            },      
            // getWeekOfMonth(dateObj) {
            //     const date = moment(dateObj);
            //     const weekInYear = date.isoWeek();
            //     const result = weekInYear - date.startOf('month').isoWeek();
            //  return result < 0 ? weekInYear : result + 1;
            // },
            showError(error) {
              this.$refs.loader.hide();
              this.errorGenerado = error;
              this.$bvModal.show("modal-error");
            },
             async save(entity) {
                  this.$refs.loader.show();
                  // Agregar Validaciones
                  try {

                    if (entity.ingreso >= 0)
                    {
                      this.$refs.loader.hide(300);  
                      return;
                    }

                    const saveEnt = { ...entity };
                    saveEnt.cajaMovimientos.forEach(x => {
                      x.ingreso = x.ingreso.toString().replaceAll('.','').replace(',', '.');
                    });

                    const e =  await this.cajaService.save(saveEnt);
                    this.form.entity = e.data;
                     this.form.entity.cajaMovimientos.forEach(x => {
                          const ingresoAnterior = saveEnt.cajaMovimientos.find(c => c.origenId === x.origenId)?.ingresoAnterior;
                          x.ingresoAnterior = ingresoAnterior;
                        });
                    
                    this.$refs.loader.hide(300);         
                    
                  } catch(ex) {
                    this.$refs.loader.hide(300);         
                  }
                },
             async update(entity) {
                  this.$refs.loader.show();
                  // Agregar Validaciones
                  try {
                      if (entity.id > 0) {
                         const saveEnt = { ...entity };

                         const newSaldoAnterior = [];

                        saveEnt.cajaMovimientos.forEach(x => {
                          newSaldoAnterior.push({ ...x});
                          x.ingreso = x.ingreso.toString().replaceAll('.','').replace(',', '.');
                        });
                        await this.cajaService.update({ id: entity.id },  saveEnt);
              
                        this.form.entity = {            
                        fechaInicio: '',
                        fechaCierre: '',
                        saldoInicial: 0,
                        saldoCierre: 0,
                        cajaMovimientos: [],
                        cajaMovimientosFinales: []
                    };
                        const _this = this;
                        this.form.entity.fechaInicio = this.moment();
                        this.form.entity.cajaMovimientos = [];
                           this.origenes.forEach(function(x){
                                _this.$data.form.entity.cajaMovimientos.push({
                                                              origenId: x.id,
                                                              origen: x,
                                                              ingreso: 0,
                                                              egreso: 0,
                                                              ingresoAnterior:  newSaldoAnterior.find(c => c.origenId === x.id)?.ingreso,
                                                              balance: 0,
                                                              estadoMovimientoId: 1
                                                          });
                               
                             });
                      }

                      
                    this.$refs.loader.hide(300);         
                    
                  } catch(ex) {
                    // this.resultModal = ex.body.result; 
                    this.$refs.loader.hide(300);
                  }
            },
        },
        mounted: function () {        
            const _this = this;    
             this.$refs.loader.show();
             this.getLasCashflow().then(function (response) {
                //debugger;
                const hasCloseDate = response.data.fechaCierre ? true : false;
                  if (response.data && response.data !== '' && response.data.id > 0 ) {

                   
                      _this.$data.form.entity = response.data;
                      _this.$data.form.entity.fechaCierre = _this.moment();
                        _this.getOrigenesByCashflow({id: response.data.id}).then(function (responseO) {
                         responseO.data.map(function(value, key) {
                                _this.$data.origenes.push( value.origen );
                             });
                            responseO.data.map(function(value, key) {
                                _this.$data.form.entity.cajaMovimientos.push({
                                                              origenId: value.origenId,
                                                              origen: value.origen,
                                                              ingreso: value.ingreso,
                                                              egreso: 0,
                                                              ingresoAnterior: 0,
                                                              balance: 0,
                                                              estadoMovimientoId: 1
                                                          });
                             });

                              _this.$refs.loader.hide();
                              if (!hasCloseDate) {
                                 _this.$refs.loader.show();
                                _this.getPreviousCashflow().then(function(respPrev) {
                                  if (respPrev && respPrev.data && respPrev.data !== '' && respPrev.data.id) {
                                    _this.getOrigenesByCashflow({id: respPrev.data.id}).then(function (responseP) {
                                    //debugger;
                                    _this.$data.form.entity.cajaMovimientos.forEach( x => {
                                      x.ingresoAnterior = responseP.data.find(p => p.origenId === x.origenId).ingreso;
                                      });
                                   _this.$refs.loader.hide();

                                    })
                                    .catch(function (error) {
                                      _this.showError(error);

                                    });   
                                  }
                               });
                              }

                              
                        
                         })
                         .catch(function (error) {
                           _this.showError(error);
                         });   
                  } else {

                    _this.$data.form.entity =  {            
                        // mes: _this.moment().month() + 1,
                        // semana: _this.getWeekOfMonth(_this.moment()),
                        fechaInicio: _this.moment(),
                        saldoInicial: 0,
                        saldoCierre: 0,
                        cajaMovimientos: []
                    };

                    _this.getOrigenes().then(function (responseO) {

                      _this.getPreviousCashflow().then(function(respPrev) {
                          if (respPrev && respPrev.data && respPrev.data !== '' && respPrev.data.id) {
                               _this.getOrigenesByCashflow({id: respPrev.data.id}).then(function (responseP) {
                               _this.$data.origenes = responseO.data.data; // #1
                              responseO.data.data.forEach(x => {
                                  const p =  responseP.data.find(p => p.origenId === x.id);
                                  //debugger;
                                   _this.$data.form.entity.cajaMovimientos.push({
                                                                     origenId: x.id,
                                                                     origen: x,
                                                                     ingreso: 0,
                                                                     egreso: 0,
                                                                     ingresoAnterior: p.ingreso,
                                                                     balance: 0,
                                                                     estadoMovimientoId: 1
                                                                 });
                                   });
                                   _this.$refs.loader.hide();

                                })
                                .catch(function (error) {
                                  _this.showError(error);

                                });   
                             } else {
                                responseO.data.data.forEach(x => {
                                   _this.$data.form.entity.cajaMovimientos.push({
                                                                     origenId: x.id,
                                                                     origen: x,
                                                                     ingreso: 0,
                                                                     egreso: 0,
                                                                     ingresoAnterior: 0,
                                                                     balance: 0,
                                                                     estadoMovimientoId: 1
                                                                 });
                                   });
                                   _this.$refs.loader.hide();
                             }


                             })
                         })
                         .catch(function (error) {
                           _this.showError(error);
                         });   

                  }
                })
                .catch(function (error) {
                  _this.showError(error);
                });            
         
            },

            
    };
</script>


<style>
    .invalid-feedback.show {
        display: block
    }

    .btn-save-container {
        padding-top: 8.7%;
    }
</style>