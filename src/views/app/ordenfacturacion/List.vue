<template>
    <div class="ordenfacturacion-container">
        <div class="grid"> 
            <list-view
                ref="listView"
                resource="ordenfacturacion"
                :onBeforeSave="onBeforeSave"
                :onBeforeClose="onBeforeClose"
                :customValidations="customValidations"
                :showActions="true"
                :showEdit="true"
                :modalSize="modalSize"
                :showDelete="true"
                :onBeforeEdit="onBeforeEdit"
            >
                <template slot='title'>
                    Órdenes de Facturación 
                </template>
                <template slot='columns'> 
                    <column field="descripcion" title="Descripción" width="160" />         
                    <column :field=" (entity) => { return entity.cliente ? `${entity.cliente.nombres}  ${entity.cliente.apellidos ? entity.cliente.apellidos : ''}` : ''; }" title="Cliente" width="120" />      
                    <column :field="(entity) => entity.fechaFactura ? moment(entity.fechaFactura).format('DD/MM/YYYY') : ''" title="F. de Facturación" width="80"  />
                    <column :field="(entity) => entity.fechaVencimientoPago ?  moment(entity.fechaVencimientoPago).format('DD/MM/YYYY') : ''" title="F. de Pago" width="80"  />                                                         
                    <column :field="(entity) => { return getEstado(entity.estadoId)}" title="Estado" width="80"  />            
                    <column :field="(entity) => maskForCulNum(entity.valor)"  title="Valor" width="160" />  
                </template>
                <template slot="action-column" slot-scope="props">                     
                    <b-button class="mb-1" size="xs" variant="outline-info" :disabled="!canApprove(props.entity.estadoId)" @click="changeStatusConfirm(props.entity)" >Aprobar</b-button>
                    <b-button class="mb-1" size="xs" variant="outline-info" :disabled="!canBill(props.entity.estadoId)" @click="changeStatusConfirm(props.entity)" >Facturar</b-button>
                    <b-button class="mb-1" size="xs" variant="outline-info" :disabled="!canCash(props.entity.estadoId)" @click="changeStatusConfirm(props.entity)" >Cobrar</b-button>
                </template>
                <template slot='modal-form' slot-scope="props">  
                    <b-row>
                        <b-col>
                            <b-form-group label="Descripción *">
                                <b-form-input type="text" v-model="props.form.entity.descripcion" placeholder="Descripción" :disabled="beDisabled(props.form.entity.estadoId)" :state="$isValid(props.form.$v.form.entity.descripcion)"/>                                  
                                <b-form-invalid-feedback v-if="!$v.form.entity.descripcion.required" >Por favor Ingrese la descripción</b-form-invalid-feedback>
                            </b-form-group>   
                        </b-col>
                        <b-col>
                            <b-form-group label="Cliente"> 
                                <select-deluxe resource="clientes" :selectItemLabel="({ nombres, apellidos }) => `${nombres ? nombres : ''} ${apellidos ? apellidos : ''}`" @input="setCustomerFilter(props.form.entity)" method="getAll" placeholder="Seleccionar cliente" v-model="props.form.entity.cliente" :state="$v.form.entity.cliente.$dirty ? !$v.form.entity.cliente.$error : null"  :disabled="beDisabled(props.form.entity.estadoId)"></select-deluxe>
                                <b-form-invalid-feedback v-if="!$v.form.entity.cliente.required">Ingrese el cliente</b-form-invalid-feedback>                                 
                            </b-form-group>
                        </b-col>
                        <b-col>
                            <!-- <b-form-group label="Cuenta Banco Destino"> 
                                <select-deluxe resource="origenes"  :selectItemLabel="({ nombre }) => `${nombre}`"  method="getAll"  placeholder="Seleccionar cuenta" v-model="props.form.entity.origen" :state="$isValid(props.form.$v.form.entity.origen)"  :disabled="beDisabled(props.form.entity.estadoId)"></select-deluxe>
                                <b-form-invalid-feedback v-if="!$v.form.entity.origen.required">Ingrese la Cuenta</b-form-invalid-feedback>        
                            </b-form-group> -->
                             <b-form-group label="Cuenta Banco Destino"> 
                                <select-deluxe resource="origenes"  :selectItemLabel="({ nombre }) => `${nombre}`"  method="getAll"  placeholder="Seleccionar cuenta" v-model="origen" :state="$v.origen.$dirty ? !$v.origen.cliente.$error : null"  :disabled="beDisabled(props.form.entity.estadoId)"></select-deluxe>
                                <b-form-invalid-feedback v-if="!$v.origen.required">Ingrese la Cuenta</b-form-invalid-feedback>        
                            </b-form-group>
                        </b-col>             
                    </b-row>
                       <b-row>
                         <b-col>
                            <b-form-group label="Estado"> 
                                 <b-form-select v-model="estados.selected" :disabled="true" :options="estados.opciones" placeholder="Estado"></b-form-select>
                            </b-form-group>
                        </b-col>
                        <b-col>           
                            <b-form-group label="Tipo de Comprobante"> 
                                <b-form-select v-model="props.form.entity.tipoComprobanteId" :options="tipoComprobantes" placeholder="Tipo de Comprobante"  :disabled="beDisabled(props.form.entity.estadoId)"></b-form-select>
                                <b-form-invalid-feedback >Seleccionar Tipo de Comprobante</b-form-invalid-feedback>              
                            </b-form-group>
                         </b-col>  
                        <b-col>
                            <b-form-group label="Valor *"> 
                                <b-form-input type="text" v-model="props.form.entity.valor" placeholder="Valor" autocomplete="off" v-mask="mask"  :state="$isValid(props.form.$v.form.entity.valor)"  :disabled="true"/>  
                                <b-form-invalid-feedback v-if="!$v.form.entity.valor.required">Ingrese el valor</b-form-invalid-feedback> 
                                </b-form-group>      
                        </b-col>  
                    </b-row>
                    <b-row>
                        <b-col>
                            <b-form-group label="Numero Factura">
                                <b-form-input type="text" v-model="props.form.entity.numeroFactura" placeholder="Numero Factura" :disabled="beDisabled(props.form.entity.estadoId)" />                                  
                                <!-- <b-form-invalid-feedback v-if="!$v.form.entity.descripcion.required" >Por favor Ingrese la descripción</b-form-invalid-feedback> -->
                            </b-form-group> 
                        </b-col>
                        <b-col>                            
                            <b-form-group label="Fecha Facturación">
                                <b-form-datepicker v-model="props.form.entity.fechaFactura" :min="new Date()" placeholder="Fecha de Facturación"  @input="calcularVencimiento(props.form.entity)"></b-form-datepicker>
                                <b-form-invalid-feedback v-if="!$v.form.entity.fechaFactura.required">Ingrese la fecha de facturación</b-form-invalid-feedback>                    
                            </b-form-group>   
                        </b-col>
                        <b-col> 
                            <b-form-group label="Fecha Pago">
                                <b-form-datepicker v-model="props.form.entity.fechaVencimientoPago"   placeholder="Fecha de Pago" :disabled="true"  ></b-form-datepicker>     
                                <b-form-invalid-feedback>Ingrese la fecha de pago</b-form-invalid-feedback>                    
                                </b-form-group>   
                        </b-col>                                      
                    </b-row>                 
                    <b-form>
                        <b-row>
                             <b-col>
                                <b-form-group label="Proyectos" :disabled="!props.form.entity.cliente || props.form.entity.cliente === 0"> 
                                    <select-deluxe  resource="proyectos" :selectItemLabel="({ id, nombre }) => `${id} - ${nombre}`" method="getAllByCustomer" :filter="customerFilter" @input="setProjectFilter(props.form.entity.proyecto)" placeholder="Seleccionar proyecto" v-model="props.form.entity.proyecto">
                                    </select-deluxe>       
                                </b-form-group>
                            </b-col>
                            <b-col>
                                <b-form-group label="Hitos" :disabled="!props.form.entity.proyecto || props.form.entity.proyecto === 0" >
                                     <select-deluxe resource="hitos" :selectItemLabel="({ descripcion, proyecto, fechaFinalizacion, importeSinIva }) => `Hito | ${proyecto.nombre} - ${descripcion} - ${fechaFinalizacion ? moment(fechaFinalizacion).format('DD/MM/YYYY') : ''} - ${importeSinIva}`" method="getbyMoneda" :filter="filterVenta" placeholder="Seleccionar proyecto" v-model="props.form.entity.hito" >
                                    </select-deluxe>       
                                </b-form-group>
                            </b-col>
                            <b-col>
                              <div class="button-container">
                                <b-button @click="agregarItem(props.form.entity.hito, props.form.entity)" variant="outline-primary" size="lg" class="mb-1" :disabled="!isValidHito(props.form.entity.hito) || beDisabled(props.form.entity.estadoId)" >Agregar</b-button>        
                              </div>   
                            </b-col>
                        </b-row>
                    </b-form>
                    <b-row>
                        <b-col>
                            <table class="table table-striped">
                                <thead>
                                    <tr>
                                        <th>Hitos</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr class="header">
                                        <td>Hito</td>
                                        <td>Proyecto</td>
                                        <td>Fecha Finalización</td>
                                        <td>Importe (sin iva)</td>
                                        <td class="text-right">
                                            Acciones
                                        </td>
                                    </tr>
                                    <tr v-for="item in ordenFacturacionHito.filter(x => !x.deleted)" :key="item.id">
                                        <td>{{ item.hito.descripcion }}</td>
                                        <td>{{ item.hito.proyecto.nombre }}</td>                                        
                                        <td>{{ item.hito.fechaFinalizacion ? moment(item.hito.fechaFinalizacion).format('DD/MM/YYYY') : '' }}</td>
                                        <td class="text-right">{{ maskForCulNum(item.hito.importeSinIva) }}</td>
                                        <td class="text-right">
                                            <a href="#" @click.prevent="deleteItem(item, props.form.entity)" class="simple-icon-trash"></a>
                                        </td>
                                         <!-- v-if="!isEdit" -->
                                    </tr>
                                </tbody>
                            </table>
                        </b-col>
                    </b-row>
                </template>
            </list-view>
             <b-modal ref="confirmModal" :title="titleChangeStatus">
                {{bodyChangeStatus}}
                <!-- <error-info :show="resultModal.hasErrors" :messages="resultModal.messages"></error-info> -->
                <template slot="modal-footer">
                    <b-button variant="primary" @click="changeStatus()" class="mr-1">Aceptar</b-button>
                    <b-button variant="secondary" @click="$refs.confirmModal.hide()">Cancelar</b-button>
                </template>
            </b-modal>
        </div>   
        <loading ref="loader2" />       
    </div>
</template>

<script>

    import moment from 'moment';
    import { validationMixin } from 'vuelidate'    
    const { required, sameAs } = require("vuelidate/lib/validators");    
    import store from '../../../store'
    import createNumberMask from 'text-mask-addons/dist/createNumberMask';
    const currencyMask = createNumberMask({
      prefix: '',
      allowDecimal: true,
      thousandsSeparatorSymbol: '.',
      decimalSymbol: ',',
      allowNegative: false,
    });

    export default {
        mixins: [validationMixin],
        data () {
            return {
                mask: currencyMask,
                moment: moment,
                customValidations: {                    
                    cliente: { required },
                    fechaFactura:{  },
                    fechaVencimientoPago:{ },
                    valor:{ required },
                    descripcion:{ required },
                    proyecto : {  },
                    ordenFacturacionHito: {},
                    tipoComprobanteId: {}
                    // origen: { required }
                },
                modalSize: 'xl',
                customerFilter: { id: 0 },
                filterVenta: { id: 1, proyectoId: 0, estadosId: [1], monedaId: 1 },
                ordenFacturacionHito: [],
                cannotSetBillData: true,
                token: store.state.auth.token,
                estados: {
                      selected: 1,
                      opciones: [
                    { value: 1, text: 'Pendiente de Aprobación'},
                    { value: 2, text: 'Aprobado'},
                    { value: 3, text: 'Facturado'},
                    { value: 4, text: 'Cobrado'}
                ]
                },
                tipoComprobantes: [
                  { value: 1, text: 'Factura'},
                  { value: 2, text: 'Caja'},
                  { value: 3, text: 'Nota de Crédito'},
                  { value: 4, text: 'Nota de Débito'}
                ],
                titleChangeStatus: '',
                bodyChangeStatus: '',       
                ordenFacturaSelected: null,
                formaDePago: [ 
                    { value: 1, text: 'Contado'},
                    { value: 2, text: 'Transferencia'},
                ],
                api: this.$api['ordenfacturacion'],
                origen: null,                  
                // sumHitosTotal: 0,
            }
        },
        validations: {
            form: {
                entity: {
                    cliente: { required },
                    fechaFactura:{  },
                    fechaVencimientoPago:{ },
                    valor:{ required },
                    descripcion:{ required },
                    proyecto : {  },
                    ordenFacturacionHito: {},
                    tipoComprobanteId: {}
                    // origen: { required }   
                },        
            },
            origen: { required }
        },
        // watch :{
        //     'props.form.entity.proyecto'(val){
        //         console.log(val);
        //     }
        // },
        methods: {
            beDisabled(estado) {
                return estado === 4;
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
              return numbers;
            },
             checkFormPermissions() {
                try {
                    var objx =  JSON.parse(atob(this.token.split('.')[1])) ;
                    this.cannotSetBillData = objx.permissions.indexOf("write:datosFacturaVenta") > -1;
                    return false;
                } catch (error) {
                    return false;
                }  
            },
            canApprove(estadoId) {
                if (estadoId == 1) {                    
                    var objx =  JSON.parse(atob(this.token.split('.')[1])) ;
                        return objx.permissions.indexOf("write:apruebaFacturacion") > -1;
                }
            },
            canBill(estadoId) {
                if (estadoId == 2) {                    
                    var objx =  JSON.parse(atob(this.token.split('.')[1])) ;
                        return objx.permissions.indexOf("write:datosFacturaVenta") > -1;
                }
            },
            canCash(estadoId) {
                if (estadoId == 3) {                    
                    // var objx =  JSON.parse(atob(this.token.split('.')[1])) ;
                    //     return objx.permissions.indexOf("write:apruebaCobranza") > -1;
                    return true;
                }
            },
            getEstado: function (id) {
                return this.estados.opciones[id - 1].text;
            },
            calcularVencimiento(entity) {
              const diasdePago = entity.cliente.diasPago ? entity.cliente.diasPago : 30;
              entity.fechaVencimientoPago = moment(entity.fechaFactura).add(diasdePago, 'days').toDate();
               if (moment(entity.fechaVencimientoPago).day() === 6 || moment(entity.fechaVencimientoPago).day() === 0) { 
                   entity.fechaVencimientoPago = moment(entity.fechaVencimientoPago).weekday(8).toDate();
                }
            },
            isValidHito(hito) {
                return hito && hito.id > 0
            },
            resetData() {
                this.resetFilters();
                this.ordenFacturacionHito = [];
            },
            resetFilters() {
                this.customerFilter = { id: 0 };
                this.filterVenta = { id: 1, proyectoId: 0, estadosId: [1], monedaId: 1};
                this.origen = null;
            },
            setCustomerFilter(entity) {
                this.customerFilter = { id: entity.cliente ? entity.cliente.id  : 0 };
                this.filterVenta = { id: 1, proyectoId: 0, estadosId: [1], monedaId: 1};
                this.calcularVencimiento(entity);
            },
            setProjectFilter(proyecto) {
                this.filterVenta.proyectoId = proyecto ? proyecto.id  : null;
                this.filterVenta.pageSize = 1;
                this.filterVenta.monedaId = proyecto.origen.monedaId ? proyecto.origen.monedaId : null;
                // console.log(this.entity);
                if(this.origen == null)
                    this.origen = proyecto.origen;
                // debugger;
            },
            changeStatusConfirm(entity){
                this.ordenFacturaSelected = entity;
                const message = entity.estadoId === 1 ?  'APROBAR' :  entity.estadoId === 2 ? 'FACTURAR' : 'COBRAR';
                this.titleChangeStatus = message;
                this.bodyChangeStatus = '¿Confirma que desea ' + message + ' la Órden de Facturacion?';
                this.$refs.confirmModal.show();
            },  
            async changeStatus(){    
                this.$refs.confirmModal.hide();   
                this.$refs.loader2.show();     
                this.ordenFacturaSelected.estadoId = this.ordenFacturaSelected.estadoId === 1 ? 2 :  this.ordenFacturaSelected.estadoId === 2 ? 3 : 4;
                await this.api.update({ id: this.ordenFacturaSelected.id} , this.ordenFacturaSelected);       
                this.$refs.loader2.hide();      
                this.$refs.listView.search();
            },
            onBeforeEdit (form) {
                let result = { hasErrors: false, messages: [] };
                result.hasErrors = result.messages.length > 0;
                if (form.entity && form.entity.id > 0) {
                    this.estados.selected = form.entity.estadoId;
                    this.ordenFacturacionHito = form.entity.ordenFacturacionHito ? [...form.entity.ordenFacturacionHito ] : [];     
                    this.filterVenta.proyectoId = form.entity.proyecto ? form.entity.proyecto.id  : 0;
                    this.customerFilter = { id: form.entity.cliente ? form. entity.cliente.id  : 0 };
                    if (form.entity.valor) {
                      form.entity.valor = this.maskForCulNum(form.entity.valor);
                    }
                } else {
                    this.estados.selected = 1;
                    this.ordenFacturacionHito = [];
                }

                // this.sumHitostotal();

                return Promise.resolve(result); 
            },    
            onBeforeSave (form) {
                let result = { hasErrors: false, messages: [] };
                //add validations here  
                form.entity.origen = this.origen;
                form.entity.ordenFacturacionHito = [...this.ordenFacturacionHito ]; 
                if (form.entity.ordenFacturacionHito.length <= 0)
                {
                    result.messages = new Array("Ingrese al menos un hito");                                    
                }                

                result.hasErrors = result.messages.length > 0;
                form.entity.estadoId = this.estados.selected;                      
                
                // console.log(result);
                // if(result.hasErrors)
                //     this.$refs.loader.hide(); 

                if (form.entity.valor) {
                    form.entity.valor = form.entity.valor.toString().replaceAll('.','').replace(',', '.');
                }
                this.resetData();
                return Promise.resolve(result); 
            },            
            onBeforeClose(form) {
                this.resetData();                 
                this.$refs.listView.search();
                return Promise.resolve(true); 
            },            
            agregarItem(hito, entity) {
                this.ordenFacturacionHito.push({hitoId: hito.id, hito: hito, deleted: 0 });
                entity.valor = this.sumHitostotal();
                // this.resetFilters();
            },
            deleteItem(hito, entity) {
                var removeIndex = this.ordenFacturacionHito.map(function (hito) {
                    return hito;
                }).indexOf(hito);
                this.ordenFacturacionHito[removeIndex].deleted = true;

                 entity.valor = this.sumHitostotal();
            },
            sumHitostotal() {
                let sumHitosTotal = 0;
                this.ordenFacturacionHito.filter(e => !e.deleted).forEach(x => {
                    sumHitosTotal += x.hito.importeSinIva;
                });
                return sumHitosTotal;
            },
        }
            
    };
</script>


<style>
    .invalid-feedback.show {
        display: block
    }

    .button-container{
        padding-top: 8%;
    }

      table tbody tr.header {
        background-color: white !important;
        font-weight: 700;
        font-size: 14px;
    }

table tbody tr.header td{
        background-color: white;
    }

    
.custom-select {
      font-size: 13px;
    }
</style>