<template>
  <div class="gastos-container">
    <div class="grid">
      <list-view
        ref="listView"
        resource="gastos"
        :onBeforeSave="onBeforeSave"
        :customValidations="customValidations"
        :showActions="true"
        :showEdit="true"
        :showDelete="true"
      >
        <template slot="title"> Gastos </template>
        <template slot="columns">
          <column field="id" title="Id" width="40" />         
          <column :field=" (entity) => { return entity.proveedor != null ? `${entity.proveedor.nombre} ` : ''; }" title="Proveedor" width="120" />          
          <column :field="(entity) => { return entity.proyecto != null ? `${entity.proyecto.nombre} ` : ''; }"  title="Proyecto" width="160" />
          <column :field="(entity) => maskForCulNum(entity.importeSinIva)" title="Importe (sin iva)" width="40" />          
          <column :field="(entity) => moment(entity.fechaFactura).format('DD/MM/YYYY')" title="F. Factura" width="80"  />
          <column :field="(entity) => moment(entity.fechaPago).format('DD/MM/YYYY')" title="F. Pago" width="80"  />
          <!-- <column :field="(entity) => { return entity.comercial != null ? `${entity.comercial.nombre} ` : ''; } " title="Comercial" width="120" /> -->                        
                    <column :field="(entity) => { return getEstado(entity.estadoId)}" title="Estado" width="80"  /> 
          <!-- <column :field="(entity) => moment(entity.fechafactura).format('DD/MM/YYYY')" title="F. Factura" width="80"  /> -->
        </template>
        <template slot="action-column" slot-scope="props">                     
            <b-button class="mb-1" size="xs" variant="outline-info" :disabled="!canApprove(props.entity.estadoId)" @click="changeStatusConfirm(props.entity)" >Aprobar</b-button>
            <b-button class="mb-1" size="xs" variant="outline-info" :disabled="!canPay(props.entity.estadoId)" @click="changeStatusConfirm(props.entity)" >Pagar</b-button>
        </template>
        <template slot="modal-form" slot-scope="props">          
            <b-form> 
                <b-form-group label="Descripcion"> 
                  <b-form-input  type="text" v-model="props.form.entity.descripcion" placeholder="Descripcion"  :disabled="beDisabled(props.form.entity.estadoId)"/>
                </b-form-group>  
                <b-form-group label="Proyecto"> 
                  <select-deluxe resource="proyectos" :selectItemLabel="({ nombre }) => `${nombre}`" method="getFilteredStatus" :filter="filterProyecto" :ordered="true"  placeholder="Seleccionar Proyecto" v-model="props.form.entity.proyecto" :disabled="beDisabled(props.form.entity.estadoId)"></select-deluxe>
                </b-form-group>                
                <b-form-group label="Proveedor"> 
                  <select-deluxe resource="proveedores" selectItemLabel="nombre" method="getAll"  :ordered="true"  placeholder="Seleccionar proveedor" v-model="props.form.entity.proveedor"  @input="setSupplierFilter(props.form.entity)"  :disabled="beDisabled(props.form.entity.estadoId)"></select-deluxe>
                </b-form-group>                
                <b-form-group label="Estado"> 
                  <b-form-select v-model="estados.selected" :disabled="true" :options="estados.opciones" placeholder="Estado"></b-form-select>
                </b-form-group>  
                <b-form-group label="Fecha de Factura *"> 
                  <b-form-datepicker v-model="props.form.entity.fechaFactura"   placeholder="Fecha de Factura" :state="$isValid(props.form.$v.form.entity.fechaFactura)" ></b-form-datepicker>     
                  <b-form-invalid-feedback>Ingrese Fecha de Factura</b-form-invalid-feedback>
                </b-form-group>
                <b-form-group label="Tipo de Comprobante"> 
                  <b-form-select v-model="props.form.entity.tipoComprobanteId" :options="tipoComprobantes" placeholder="Tipo de Comprobante"  :disabled="beDisabled(props.form.entity.estadoId)"></b-form-select>
                  <b-form-invalid-feedback>Seleccionar Tipo de Comprobante</b-form-invalid-feedback>              
                </b-form-group>
                <b-form-group label="Número de Factura"> 
                  <b-form-input   type="text" v-model="props.form.entity.numeroFactura" placeholder="Número de Factura"/>
                </b-form-group>
                <b-form-group label="Fecha de Pago *"> 
                  <b-form-datepicker v-model="props.form.entity.fechaPago"   placeholder="Fecha de Pago"   @input="calcularVencimiento(props.form.entity)"></b-form-datepicker>     
                  <b-form-invalid-feedback>Fecha de Pago</b-form-invalid-feedback>
                </b-form-group>
                <b-form-group label="Importe (sin iva) *"> 
                  <b-form-input type="text" v-model="props.form.entity.importeSinIva" placeholder="Importe (sin iva)"  v-mask="mask"  :state="$isValid(props.form.$v.form.entity.importeSinIva)" :disabled="beDisabled(props.form.entity.estadoId)" />
                  <b-form-invalid-feedback>Ingrese Importe (sin iva)</b-form-invalid-feedback>
                </b-form-group>     
                <b-form-group label="Concepto"> 
                  <select-deluxe resource="conceptos" selectItemLabel="nombre" method="getAll"  placeholder="Seleccionar concepto" :ordered="true" v-model="props.form.entity.concepto"  :disabled="beDisabled(props.form.entity.estadoId)" ></select-deluxe>
                   <b-form-invalid-feedback>Ingrese el Concepto</b-form-invalid-feedback>
                </b-form-group>
               <b-form-group label="Orígen de Fondos *"> 
                  <select-deluxe resource="origenes" :selectItemLabel="({ nombre }) => `${nombre}`" placeholder="Orígen de fondos"  :ordered="true"  v-model="props.form.entity.origenIngreso" :state="$isValid(props.form.$v.form.entity.origenIngreso)" :disabled="beDisabled(props.form.entity.estadoId)">
                    </select-deluxe>
                    <b-form-invalid-feedback>Ingrese el Orígen</b-form-invalid-feedback>
                </b-form-group>
            </b-form>
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
    <loading ref="loader" />
    
  </div>
</template>

<script>
import moment from 'moment';
import store from '../../../store'
const { required } = require("vuelidate/lib/validators");
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
        customValidations: {
          descripcion: { required },
          proyecto: { },
          proveedor: { },
          estadoId: { required },
          fechaFactura: { required },
          tipoComprobanteId: { },
          numeroFactura: { },        
          fechaPago: {},
          importeSinIva: { required },
          concepto: { },
          origenIngreso: {required},
      },
      filterProyecto: { id: 1 },
      formaDePago: [ 
              { value: 1, text: 'Contado'},
              { value: 2, text: 'Transferencia'},
              ],
      tipoComprobantes: [
              { value: 1, text: 'Factura'},
              { value: 2, text: 'Caja'},
              { value: 3, text: 'Nota de Crédito'},
              { value: 4, text: 'Nota de Débito'}
            ],
         estados: {
                      selected: 1,
                      opciones: [
                    { value: 1, text: 'Pendiente de Aprobación'},
                    { value: 2, text: 'Aprobado'},
                    { value: 3, text: 'Pagado'}
                ],
         },
      titleChangeStatus: '',
      bodyChangeStatus: '',       
      gastoSelected: null,
      token: store.state.auth.token,
      api: this.$api['gastos'],   
    }
  },
  methods: {
    beDisabled(estado) {
        return estado === 3;
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
    onBeforeEdit (form) {
        let result = { hasErrors: false, messages: [] };
        result.hasErrors = result.messages.length > 0;
        this.checkFormPermissions();
        if (form.entity && form.entity.id > 0) {
            this.estados.selected = form.entity.estadoId;
            if (form.entity.valor) {
              form.entity.valor = this.maskForCulNum(form.entity.valor);
            }      
        } else {
            this.estados.selected = 1;
            this.ordenPagoHito = [];
        }
        
        return Promise.resolve(result); 
    },    
    onBeforeSave(form) {
      let result = { hasErrors: false, messages: [] };
      result.hasErrors = result.messages.length > 0;
      form.entity.importeSinIva = form.entity.importeSinIva.toString().replaceAll('.','').replace(',', '.');
      form.entity.estadoId = this.estados.selected;
      return Promise.resolve(result);
    },
    calcularVencimiento(entity) {
      if (entity.proveedor) {
        const diasdePago = entity.proveedor.diasPago ? entity.proveedor.diasPago : 30;
        entity.fechaPago = moment(entity.fechaFactura).add(diasdePago, 'days').toDate();
        if (moment(entity.fechaPago).day() === 6 || moment(entity.fechaPago).day() === 0) { 
          entity.fechaPago = moment(entity.fechaPago).weekday(8).toDate();
        }   
      }
    },
    setSupplierFilter(entity) {
      this.calcularVencimiento(entity);
    },
    getEstado: function (id) {
      return this.estados.opciones[id - 1].text;
    },
    changeStatusConfirm(entity){
        this.gastoSelected = entity;
        const message = entity.estadoId === 1 ?  'APROBAR' : 'PAGAR'
        this.titleChangeStatus = message;
        this.bodyChangeStatus = entity.estadoId === 1? 
                                '¿Confirma que desea APROBAR la Órden de Pago?':
                                '¿Confirma que desea PAGAR la Órden de Pago?';
        this.$refs.confirmModal.show();
    },  
    async changeStatus(){    
        this.$refs.confirmModal.hide();   
        this.$refs.loader.show();     
        this.gastoSelected.estadoId = this.gastoSelected.estadoId === 1 ? 2 : 3;
        await this.api.update({ id: this.gastoSelected.id} , this.gastoSelected);       
        this.$refs.loader.hide();      
        this.$refs.listView.search();
    },
    async setCreateHito (p, t) {
       this.$refs.loader.show();
      // this.$v.form.entity.$reset();
      // this.resultModal.hasErrors = false;
      // this.form.entity = {...entity};
      // if(this.onBeforeEdit) {
      //     await this.onBeforeEdit(this.form);                    
      //   }
       this.$refs.hitoModal.show(p, t + ' | ' + p.nombre);  
       this.$refs.loader.hide(300);      
    },
    async setFinishProject (entity) {
      // this.$refs.loader.show();
      // this.$v.form.entity.$reset();
      // this.resultModal.hasErrors = false;
      // this.form.entity = {...entity};
      // if(this.onBeforeEdit) {
      //     await this.onBeforeEdit(this.form);                    
      //   }
      // this.$refs.entityModal.show();  
      // this.$refs.loader.hide(300);      
    },
  },   
};
</script>


<style>
.invalid-feedback.show {
  display: block;
}

.custom-select {
      font-size: 13px;
    }
</style>