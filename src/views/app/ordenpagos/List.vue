<template>
    <div class="ordenpago-container" v-if="canSeePage()">
        <div class="grid"> 
            <list-view
                ref="listView"
                resource="ordenpago"
                :onBeforeSave="onBeforeSave"
                :onBeforeClose="onBeforeClose"
                :customValidations="customValidations"
                :showActions="true"
                :showEdit="true"
                :showDelete="true"
                :modalSize="modalSize"
                :onBeforeEdit="onBeforeEdit"
            >
                <template slot='title'>
                    Órdenes de Pagos 
                </template>
             <template slot='columns'> 
                    <column field="descripcion" title="Descripción" width="160" />       
                    <column :field=" (entity) => { return entity.proveedor != null ? entity.proveedor.nombre : ''; }" title="Proveedor" width="120" />       
                    <column field="createdBy" title="Owner" width="80"  />
                    <column :field="(entity) => moment(entity.fechaFactura).format('DD/MM/YYYY')" title="F. de Facturación" width="80"  />
                    <column :field="(entity) => moment(entity.fechaVencimientoPago).format('DD/MM/YYYY')" title="F. de Pago" width="80"  />       
                    <column :field="(entity) => { return getEstado(entity.estadoId)}" title="Estado" width="80"  /> 
                    <column :field="(entity) => maskForCulNum(entity.valor)"  title="Valor" width="160" />  
                </template>
                 <template slot="action-column" slot-scope="props">                     
                    <b-button class="mb-1" size="xs" variant="outline-info" :disabled="!canApprove(props.entity.estadoId)" @click="changeStatusConfirm(props.entity)" >Aprobar</b-button>
                    <b-button class="mb-1" size="xs" variant="outline-info" :disabled="!canPay(props.entity.estadoId)" @click="changeStatusConfirm(props.entity)" >Pagar</b-button>
                </template>
                
                    
                <template slot='modal-form' slot-scope="props">  
                    <b-row>
                        <b-col>
                            <b-form-group label="Descripción *">
                                <b-form-input type="text" v-model="props.form.entity.descripcion" placeholder="Descripción"  :disabled="beDisabled(props.form.entity.estadoId)" :state="$isValid(props.form.$v.form.entity.descripcion)"/>  
                                <b-form-invalid-feedback v-if="!$v.form.entity.descripcion.required" >Por favor Ingrese la descripción</b-form-invalid-feedback>
                            </b-form-group>   
                        </b-col>
                        <b-col>
                            <b-form-group label="Proveedor *"> 
                                <select-deluxe resource="proveedores" selectItemLabel="nombre" method="getAll"  placeholder="Seleccionar proveedor"  @input="setSupplierFilter(props.form.entity)"  :state="$isValid(props.form.$v.form.entity.proveedor)" v-model="props.form.entity.proveedor"  :disabled="beDisabled(props.form.entity.estadoId)"></select-deluxe>
                                <b-form-invalid-feedback>Ingrese el Proveedor</b-form-invalid-feedback>        
                            </b-form-group>
                        </b-col>
                    </b-row>
                    <b-row>
                         <b-col>
                            <b-form-group label="Estado"> 
                                 <b-form-select v-model="estados.selected" :disabled="true" :options="estados.opciones" placeholder="Estado" ></b-form-select>
                            </b-form-group>
                        </b-col>
                        <b-col>
                            <b-form-group label="Cuenta Banco Orígen"> 
                                <select-deluxe resource="origenes"  :selectItemLabel="({ nombre }) => `${nombre}`"  method="getAll"  placeholder="Seleccionar cuenta" v-model="props.form.entity.origen" :state="$isValid(props.form.$v.form.entity.origen)"  :disabled="beDisabled(props.form.entity.estadoId)"></select-deluxe>
                                <b-form-invalid-feedback>Ingrese la Cuenta</b-form-invalid-feedback>        
                            </b-form-group>
                        </b-col>             
                    </b-row>
                    <b-row>
                        <b-col>           
                            <b-form-group label="Tipo de Comprobante"> 
                                <b-form-select v-model="props.form.entity.tipoComprobanteId" :options="tipoComprobantes" placeholder="Tipo de Comprobante"  :disabled="beDisabled(props.form.entity.estadoId)"></b-form-select>
                                <b-form-invalid-feedback>Seleccionar Tipo de Comprobante</b-form-invalid-feedback>              
                            </b-form-group>
                         </b-col>  
                        <b-col>
                            <b-form-group label="Valor *"> 
                                <b-form-input type="text" v-model="props.form.entity.valor" placeholder="Valor" v-mask="numberMask"  :state="$isValid(props.form.$v.form.entity.valor)" :disabled="true"/>  
                                <b-form-invalid-feedback>Ingrese el valor</b-form-invalid-feedback> 
                            </b-form-group>         
                        </b-col>
                    </b-row>
                    <b-row>
                        <b-col>
                            <b-form-group label="Número de Factura"> 
                                <b-form-input type="text" v-model="props.form.entity.numeroFactura" :disabled="!cannotSetBillData"  placeholder="Número de Factura" />
                           </b-form-group> 
                        </b-col>
                         <b-col>                             
                            <b-form-group label="Fecha Factura"> 
                                <b-form-datepicker v-model="props.form.entity.fechaFactura" :disabled="!cannotSetBillData" placeholder="Fecha Factura" @input="calcularVencimiento(props.form.entity)" ></b-form-datepicker>     
                                <b-form-invalid-feedback>Ingrese Fecha de Factura</b-form-invalid-feedback>
                            </b-form-group>
                        </b-col>
                        <b-col>
                            <b-form-group label="Fecha Vencimiento de Pago"> 
                                <b-form-datepicker v-model="props.form.entity.fechaVencimientoPago" placeholder="Fecha Vencimiento de Pago" :disabled="true"  ></b-form-datepicker>     
                                <b-form-invalid-feedback>Fecha Vencimiento de Pago</b-form-invalid-feedback>
                            </b-form-group>     
                        </b-col>
                   </b-row>
                    <b-form>
                        <b-row>
                            <b-col>
                                <b-form-group label="Hitos" :disabled="!props.form.entity.proveedor || props.form.entity.proveedor === 0" >
                                <select-deluxe resource="hitos" :selectItemLabel="({ descripcion, proyecto, fechaFinalizacion, importeSinIva }) => `Hito | ${proyecto.nombre} - ${descripcion} -  ${fechaFinalizacion ? moment(fechaFinalizacion).format('DD/MM/YYYY') : ''} - ${importeSinIva}`" method="getbySupplier" :filter="filterGasto" placeholder="Seleccionar Hito" v-model="props.form.entity.hito" >
                                </select-deluxe>       
                                </b-form-group>
                            </b-col>
                            <b-col>
                                <div class="button-container">
                                    <b-button @click="agregarItem(props.form.entity.hito, props.form.entity)" :disabled="!isValidHito(props.form.entity.hito) || beDisabled(props.form.entity.estadoId)"  variant="outline-primary" size="lg" class="mb-1" >Agregar</b-button>        
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
                                    <tr v-for="item in ordenPagoHito.filter(x => !x.deleted)" :key="item.id">
                                        <td>{{ item.hito.descripcion }}</td>                                        
                                        <td>{{ item.hito.proyecto.nombre }}</td>
                                        <td>{{ item.hito.fechaFinalizacion ? moment(item.hito.fechaFinalizacion).format('DD/MM/YYYY') : '' }}</td>
                                        <td>{{ item.hito.importeSinIva }}</td>
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
    <div v-else>
        <div class="welcome">
            <h2>No tiene permisos para ver esta pantalla</h2>
            <span class="home-logo"></span>
        </div>
    </div>
</template>

<script>

    import moment from 'moment';
    import { validationMixin } from 'vuelidate'    
    const { required, sameAs } = require("vuelidate/lib/validators");  
    import apiServices from "../../../api-services";
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
                numberMask: currencyMask,
                customValidations: {                    
                    proveedor: { required },
                    estadoId: {},
                    valor:{ required },
                    descripcion:{required},
                    proyecto : {},
                    hitos: {},
                    origen: { required },
                    tipoComprobanteId: {}
                },
                users: [],
                moment: moment,
                modalSize: 'xl',
                customerFilter: { id: 0 },
                filterGasto: { id: 0, estadoId: 1, monedaId: 2 },
                ordenPagoHito: [],
                cannotSetBillData: true,
                token: store.state.auth.token,
                estados: {
                      selected: 1,
                      opciones: [
                    { value: 1, text: 'Pendiente de Aprobación'},
                    { value: 2, text: 'Aprobado'},
                    { value: 3, text: 'Pagado'}
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
                ordenPagoSelected: null,
                api: this.$api['ordenpago'],   
            }
        },
        validations: {
            form: {
                entity: {
                    proveedor: { required },
                    estadoId: {},
                    valor:{ required },
                    descripcion:{required},
                    proyecto : {},
                    hitos: {},
                    origen: { required },
                    tipoComprobanteId: {} 
                },        
            }
        },
        methods: {          
            beDisabled(estado) {
                return estado === 3;
            },            
            getUser(id) {
                const user = this.users.find(x => x.userId ===id);    
                if (user) {
                    return user.nombre;
                }
                else
                {
                    return '';
                }
                
            },
            getUsers: function () {
                return apiServices.get("asignacion/users");
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
                }
              
              const replnum = value.replace('.', ',');
              const numbers = replnum.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
              return numbers;
            },      
            checkFormPermissions() {
                var objx =  JSON.parse(atob(this.token.split('.')[1])) ;
                this.cannotSetBillData = objx.permissions.indexOf("write:datosFacturaPago") > -1;
            },
            canApprove(estadoId) {
                if (estadoId == 1) {                    
                    var objx =  JSON.parse(atob(this.token.split('.')[1])) ;
                        return objx.permissions.indexOf("write:apruebaPago") > -1;
                }
            },
            canPay(estadoId) {
                if (estadoId == 2) {                    
                    var objx =  JSON.parse(atob(this.token.split('.')[1])) ;
                        return objx.permissions.indexOf("write:datosFacturaPago") > -1;
                }
            },
            getEstado: function (id) {
                return this.estados.opciones[id - 1].text;
            },
            calcularVencimiento(entity) {                
              const diasdePago = entity.proveedor.diasPago ? entity.proveedor.diasPago : 30;
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
                this.ordenPagoHito = [];
            },
            resetFilters() {
                this.customerFilter = { id: 0 };
                this.filterGasto = { id: 2, proyectoId: 0, estadoId: 1, monedaId: 2};
            },
            setSupplierFilter(entity) {
                this.filterGasto.id = entity.proveedor ? entity.proveedor.id  : null;
                this.filterGasto.monedaId = entity.origen ? entity.origen.monedaId : null;
                this.calcularVencimiento(entity);
            },
            changeStatusConfirm(entity){
                this.ordenPagoSelected = entity;
                const message = entity.estadoId === 1 ?  'APROBAR' : 'PAGAR'
                this.titleChangeStatus = message;
                this.bodyChangeStatus = entity.estadoId === 1? 
                                        '¿Confirma que desea APROBAR la Órden de Pago?':
                                        '¿Confirma que desea PAGAR la Órden de Pago?';
                this.$refs.confirmModal.show();
            },  
            async changeStatus(){    
                this.$refs.confirmModal.hide();   
                this.$refs.loader2.show();     
                this.ordenPagoSelected.estadoId = this.ordenPagoSelected.estadoId === 1 ? 2 : 3;
                await this.api.update({ id: this.ordenPagoSelected.id} , this.ordenPagoSelected);       
                this.$refs.loader2.hide();      
                this.$refs.listView.search();
            },
            onBeforeEdit (form) {
                let result = { hasErrors: false, messages: [] };
                result.hasErrors = result.messages.length > 0;
                this.checkFormPermissions();
                if (form.entity && form.entity.id > 0) {
                    this.estados.selected = form.entity.estadoId;
                    this.ordenPagoHito = form.entity.ordenPagoHito ? [...form.entity.ordenPagoHito ] : [];
                    this.filterGasto.id = form.entity.proveedor ? form.entity.proveedor.id  : 0;
                    if (form.entity.valor) {
                      form.entity.valor = this.maskForCulNum(form.entity.valor);
                    }      
                } else {
                    this.estados.selected = 1;
                    this.ordenPagoHito = [];
                }
                
                return Promise.resolve(result); 
            },    
            onBeforeSave (form) {
                let result = { hasErrors: false, messages: [] };
                //add validations here  

                form.entity.ordenPagoHito = [...this.ordenPagoHito ];
                if (form.entity.ordenPagoHito.length <= 0)
                {
                    result.messages = new Array("Ingrese al menos un hito");                                    
                } 

                result.hasErrors = result.messages.length > 0;
                form.entity.estadoId = this.estados.selected;
                
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
                this.ordenPagoHito.push({hitoId: hito.id, hito: hito });
                entity.valor = this.sumHitostotal();
                // this.resetFilters();
            },
            deleteItem(hito, entity) {
                var removeIndex = this.ordenPagoHito.map(function (hito) {
                    return hito;
                }).indexOf(hito);
                this.ordenPagoHito[removeIndex].deleted = true;
                entity.valor = this.sumHitostotal();
            },
             sumHitostotal() {
                let sumHitosTotal = 0;
                this.ordenPagoHito.filter(e => !e.deleted).forEach(x => {
                    sumHitosTotal += x.hito.importeSinIva;
                });
                return sumHitosTotal;
            },
    },
     mounted: function () {
    var _this = this;

    this.getUsers()
      .then(function (response) {
        _this.$data.users = response.data; // #1
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

    
    .button-container{
        padding-top: 4.9%;
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