<template>
    <div class="ordenespagos-container" v-if="canSeePage()">
        <list-view
            ref="listView"
            resource="detalleliquidacionpre"
            :filter=filtroGrillaOptions
            :onAfterLoad="onAfterLoad"
            :onBeforeLoad="onBeforeLoad"
            :onBeforeSave="onBeforeSave"
            :onBeforeEdit="onBeforeEdit"
            :showActions="true"
            :showEdit="false"
            :showDelete="false"
            :searchSize="searchSize"              
            :searchBy="sada"
            :showCheck="true" 
            :checkFunction="checkAllFunction"
        >
            <template slot='title'>
                Órdenes de Pago 
            </template>
            
            <template slot="action-btn">             
                <b-button variant="dark" size="sm"  @click="resetData"><img src="/assets/img/borrador.png" height ="20" width="20" /></b-button>
                <b-button variant="info" size="sm" :disabled="this.exportablesSelected.length <= 0 && !this.checkAllChecked" @click="ExportExcelConfirm" >Exportar Excel</b-button>
                <b-button variant="primary" :disabled="this.ordenesPagosSelected<=0 && !this.checkAllChecked" @click="GenerarLiquidacionConfirm">Generar Liquidacion</b-button>
            </template> 

        <template slot="filters"> 
            <b-colxx :xxs="3">
                <div class="filter   float-md-left mr-6 align-top"></div>
                <div class="filter-sm">
                    <select-deluxe resource="clientes" class="list-filter" :filter="filterClient" :selectItemLabel="({ razonSocial, nombre, apellido }) => `${razonSocial ? razonSocial : (nombre && apellido ? nombre + ' ' + apellido : '')}`" method="getAll"  valueField="id" placeholder="Seleccionar cliente" v-model="filtroGrillaOptions.clienteId" ></select-deluxe>
                </div>          
            </b-colxx>      

            <b-colxx :xxs="3">
              <div class="filter   float-md-left mr-6 align-top"></div>
               <div class="filter-sm">
                     <b-form-datepicker  class="filter-select" v-model="filtroGrillaOptions.fecha_desde" placeholder="Fecha Liquidable Desde" style="border-radius: 25px;"></b-form-datepicker>     
               </div>          
            </b-colxx>
            <b-colxx :xxs="3">
              <div class="filter   float-md-left mr-6 align-top"></div>
              <div class="filter-sm">
                <b-form-datepicker  class="filter-select"  v-model="filtroGrillaOptions.fecha_hasta" placeholder="Fecha Liquidable Hasta" style="border-radius: 25px;"></b-form-datepicker>     
              </div>
            </b-colxx>
            <b-colxx :xxs="3">
              <div class="filter   float-md-left mr-12 align-top"></div>
                <div class="filter-sm">
                  <b-form-select  variant="outline-info" class="filter-select"   v-model="filtroGrillaOptions.estado" style="border-radius: 25px;">
                    <option v-for="(selectOption, indexOpt) in filtroGrillaOptions.options"  :key="indexOpt" :value="selectOption.value">
                      {{ selectOption.text }}
                    </option>
                  </b-form-select>
                </div>         
            </b-colxx>
        </template> 

            <template slot='columns'>
                <column :field="(entity) => moment(entity.fecha).format('DD/MM/YYYY')"  title="Fecha" width="40" />   
                <column :field="(entity) => getRazonSocial(entity.cliente.razonSocial, entity.cliente.nombre, entity.cliente.apellido)"  title="Cliente" width="40" />       
                <column :field="(entity) => getCodigosSeguimiento(entity.codigoOrdenPago)" title="Códigos de seguimiento" width="50" />                                
                <column field="idMercadoPago" title="Orden de pago" width="15" />                                                
                <column :field="(entity) => maskForCulNum(entity.valorSinImpuesto)" title="Importe sin impuestos" width="100" />                                                
                <column :field="(entity) => getEstado(entity.estado)" title="Estado" width="50" />                                            
            </template>
            <template slot="action-column" slot-scope="props">
                <slot name="action-column" v-bind:entity="props.entity"></slot>
                <b-checkbox ref="checkLiquidar" class="mb-1" size="m" variant="outline-info" :disabled="props.entity.estado==1" @change="seleccionarOrden(props.entity, props.entity.id)" v-model="props.entity.check">Liquidar</b-checkbox>
                <b-checkbox class="mb-1 mx-2" size="m" variant="outline-info" :disabled="props.entity.estado==0" @change="seleccionarExportable(props.entity, props.entity.id)" v-model="props.entity.exportar">Exportar</b-checkbox>
            </template>
        </list-view>

        <b-modal ref="confirmModal" title="GENERAR LIQUIDACION">
                <input type="text" id="textdescripcion" ref="textdescripcion" class="form-control" pattern="[A-Za-z0-9]{8,20}"  placeholder="Ingrese Descripcion Liquidacion" required>
                <template slot="modal-footer">
                    <b-button variant="primary" @click="GenerarLiquidacion($refs.textdescripcion.value)" class="mr-1">Aceptar</b-button>
                    <b-button variant="secondary" @click="$refs.confirmModal.hide()">Cancelar</b-button>
                </template>
        </b-modal>

        <b-modal ref="exportModal" title="EXPORTAR A EXCEL">
            <p class="text-center mb-0">{{this.getExportableMessage()}}</p>
                <template slot="modal-footer">
                    <b-button variant="primary" @click="ExportarSeleccionados() && $refs.exportModal.hide()" class="mr-1">Aceptar</b-button>
                    <b-button variant="secondary" @click="$refs.exportModal.hide()">Cancelar</b-button>
                </template>
        </b-modal>

      

        <loading ref="loader" />

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
import { fromBytes } from 'long';
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
                searchSize: '0',
                disabledtxt: true,
                disabledexportExcel: true,
                filtroGrillaOptions: {
                    clienteId: null,
                    fecha_desde: null,
                    fecha_hasta: null,
                    selected: null,
                    estado: null,
                    options: [
                        { value: null, text: 'Estados Facturación (Todos)'},
                        { value: 2, text: 'Pendiente'},
                        { value: 1, text: 'Liquidada'}
                    ]
                },
                filterClient: {
                    tipoCliente: 1
                },
                users: [],
                moment: moment,
                modalSize: 'xl',
                cannotSetBillData: true,
                token: store.state.auth.token,
                estados: {
                      selected: 2,
                      opciones: [
                    { value: 2, text: 'Pendiente'},
                    { value: 1, text: 'Liquidada'}
                ]
                },
                generaliquidacionrequest: {
                    descripcion: '',
                    ids_ordenes: []
                },
                titleChangeStatus: '',
                bodyChangeStatus: '',       
                ordenesPagosSelected: [],
                exportablesSelected: [],
                txtDescripcionLiquidacion: '',
                api: this.$api['detalleliquidacionpre'],                
                sada: 'Buscar por Orden de Pago / Código de Seguimiento',
                uncheckedIds: [] ,
                uncheckedIdsToExport: [] ,
                checkAllChecked: false,
            }
        },
        validations: {
            form: {
                entity: {
                },        
            }
        },
        methods: {    
            checkAllFunction() {
                this.checkAllChecked = !this.checkAllChecked
                if (this.checkAllChecked) {
                    for (var i = 0; i < this.$refs.listView.$refs.dataGrid.rows.length; i++) {
                        var entity = this.$refs.listView.$refs.dataGrid.rows[i];
                        this.ordenesPagosSelected.push(entity.id);
                        this.exportablesSelected.push(entity.id);
                        entity.exportar = true;
                        entity.check = true;
                   }
                } else {
                    this.$refs.listView.$refs.dataGrid.rows.map(x => {x.check = false, x.exportar = false})
                    this.exportablesSelected = []
                    this.ordenesPagosSelected = []
                    this.uncheckedIds = [];
                    this.uncheckedIdsToExport = [];
                }           
            },
            canSeePage(){                          
                if (this.token) {
                    var objx =  JSON.parse(atob(this.token.split('.')[1])) ;
                    return objx.permissions.indexOf("write:ordenespagos") > -1 || objx.permissions.indexOf("read:ordenespagos") > -1 ;
                }        
            },
            generaliquidacion(generaliquidacionrequest) {
                 return this.api.generaliquidacion(generaliquidacionrequest);
            },
            beDisabled(estado) {
                return estado === 2;
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
            getExportableMessage()
            {               
                return this.checkAllChecked ?  'Se exportará el detalle de todas las órdenes seleccionadas.' : 'Se exportará el detalle de ' + (this.exportablesSelected.length?.toString() +
                        (this.exportablesSelected.length > 1 ? ' órdenes' : ' orden'));
            },
            getRazonSocial(razonSocial, nombre, apellido)
            {
                return razonSocial ? razonSocial : (nombre && apellido ? nombre + ' ' + apellido : '');
            },
            getCodigosSeguimiento(codigoOrdenPago) {
                if (codigoOrdenPago)
                {
                    return codigoOrdenPago.replaceAll(',',', ')
                }
                else {
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
              
              const replnum = value.toString().replace('.', ',');
              const numbers = replnum.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
              return numbers;
            },      
            checkFormPermissions() {
                var objx =  JSON.parse(atob(this.token.split('.')[1])) ;
                this.cannotSetBillData = objx.permissions.indexOf("write:datosLiquidaciones") > -1;
            },

            async exportFile(){
            this.$refs.loader.show();
            let response = await this.api.exportFile({desde: this.filtroGrillaOptions.fecha_desde, hasta: this.filtroGrillaOptions.fecha_hasta, estado: this.filtroGrillaOptions.estado})
               if(response){
                    const url = window.URL.createObjectURL(new Blob([response.data]));
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', 'reporte-ordenespagos.csv');
                    document.body.appendChild(link);
                    link.click();
               }
               this.$refs.loader.hide();

            },
            refreshGridItem () {            
                this.$refs.listView.search();
            },
            onAfterLoad() {
                if (this.checkAllChecked) {
                    for (var i = 0; i < this.$refs.listView.$refs.dataGrid.rows.length; i++) {
                        var entity = this.$refs.listView.$refs.dataGrid.rows[i];
                    
                            if (!this.uncheckedIds.includes(entity.id))
                            {
                                this.ordenesPagosSelected.push(entity.id);
                                entity.check = true;
                            }
                            if (!this.uncheckedIdsToExport.includes(entity.id))
                            {
                                this.exportablesSelected.push(entity.id);
                                entity.exportar = true;
                            }  
                   }
                } else {
                    this.disabledexportExcel = this.$refs.listView.$refs.dataGrid.rows.length <= 0;
                    for (var i = 0; i < this.ordenesPagosSelected.length; i++) {
                        var found = this.$refs.listView.$refs.dataGrid.rows.find(x => x.id === this.ordenesPagosSelected[i]);
                        if (found) {
                            found.check = true;
                        }
                   }
                   for (var i = 0; i < this.exportablesSelected.length; i++) {
                        var foundExportar = this.$refs.listView.$refs.dataGrid.rows.find(x => x.id === this.exportablesSelected[i]);
                        if (foundExportar) {
                            foundExportar.exportar = true;
                        }
                   }
                }
            },
            onBeforeLoad() {
                // if (this.$refs.listView.$refs.dataGrid.rows.length <= 0) {
                //     this.disabledexportExcel = true;
                // } else {
                //     this.disabledexportExcel = false;
                //     for (var i = 0; i < this.$refs.listView.$refs.dataGrid.rows.length; i++) {
                    
                //         if (this.$refs.listView.$refs.dataGrid.rows[i].check) {
                //             this.ordenesPagosSelected.push(this.$refs.listView.$refs.dataGrid.rows[i].id);
                //         }
                //    }
                // }
            },
            addToUnchecked(id) {
            this.uncheckedIds.push(id)
            },
            removeFromUnchecked(id) {
                var indexPos = this.uncheckedIds.indexOf(id)
                if (indexPos > -1) {
                    this.uncheckedIds.splice(indexPos, 1)
                }    
            },
            addToUncheckedExport(id) {
            this.uncheckedIdsToExport.push(id)
            },
            removeFromUncheckedExport(id) {
                var indexPos = this.uncheckedIdsToExport.indexOf(id)
                if (indexPos > -1) {
                    this.uncheckedIdsToExport.splice(indexPos, 1)
                }    
            },
            seleccionarOrden(entity, id){
                const found = this.ordenesPagosSelected.find(element => element == id);
                if (found == null)
                {
                    this.ordenesPagosSelected.push(id);
                    entity.check = true;
                    if (this.checkAllChecked) {
                        this.removeFromUnchecked(entity.id)
                    }
                }
                else 
                {
                    this.ordenesPagosSelected.forEach(function(ordenpago, index, object) {
                        if(ordenpago == id){
                            object.splice(index, 1);
                        }
                    });
                    entity.check = false;
                    if (this.checkAllChecked) {              
                        this.addToUnchecked(entity.id)
                    }
                }   
            },  
            seleccionarExportable(entity, id){
                const found = this.exportablesSelected.find(element => element == id);
                if (found == null)
                {
                    this.exportablesSelected.push(id);
                    entity.exportar = true;
                    if (this.checkAllChecked) {
                        this.removeFromUncheckedExport(entity.id)
                    }
                }
                else 
                {
                    this.exportablesSelected.forEach(function(ordenpago, index, object) {
                    if(ordenpago == id){
                        object.splice(index, 1);
                    }
                    });
                    entity.exportar = false;
                    if (this.checkAllChecked) {              
                        this.addToUncheckedExport(entity.id)
                    }
                }
            },  
            getEstado: function (id) {
                return this.estados.opciones.find(x => x.value === id).text;
            },
            resetData() {                
                this.ordenesPagosSelected = []
                this.resetFilters();
            },
            resetFilters() {
                this.filtroGrillaOptions.clienteId = null;
                this.filtroGrillaOptions.fecha_desde = null;
                this.filtroGrillaOptions.fecha_hasta = null;
                this.filtroGrillaOptions.estado = null;
                this.$refs.listView.resetTextAndSearch();
            },
            GenerarLiquidacionConfirm(){
                 this.titleChangeStatus = 'GENERAR';
                 this.bodyChangeStatus = '¿Confirma que desea GENERAR la Liquidacion?';
                 this.$refs.confirmModal.show();
            },  
            ExportExcelConfirm(){
                 this.$refs.exportModal.show();
            },
            async ExportarSeleccionados(){
                this.$refs.loader.show()
                if (this.checkAllChecked) {
                await this.api.exportAllToExcel({
                    uncheckedIds: this.uncheckedIdsToExport,
                    fechaDesde: this.filtroGrillaOptions.fecha_desde,
                    fechaHasta: this.filtroGrillaOptions.fecha_hasta ,
                    clienteId: this.filtroGrillaOptions.clienteId,
                        estado: this.filtroGrillaOptions.estado,
                    search: this.$refs.listView.multiColumnSearchText
                })
                .then((response) => {
                    try {
                        const url = window.URL.createObjectURL(new Blob([response.data]));
                        const link = document.createElement('a');
                        link.href = url;
                        link.setAttribute('download', 'ordenesPago.xlsx');
                        document.body.appendChild(link);
                        link.click();
                        this.$refs.loader.hide()
                    }
                    catch (err) {
                        this.$refs.loader.hide();
                    }
                })
            } else {
                let response = await this.api.generaExcel(this.exportablesSelected)
                   if(response){
                        const url = window.URL.createObjectURL(new Blob([response.data]));
                        const link = document.createElement('a');
                        link.href = url;
                        link.setAttribute('download', 'ordenesPago.xlsx');
                        document.body.appendChild(link);
                        link.click();
                        this.$refs.loader.hide()
                   }
                }
            },
            async GenerarLiquidacion(textdescripcion){
                this.$refs.loader.show();
                if (this.checkAllChecked) {
                    await this.api.generaallliquidaciones({
                        descripcion: textdescripcion,
                        uncheckedIds: this.uncheckedIds,
                        fechaDesde: this.filtroGrillaOptions.fecha_desde,
                        fechaHasta: this.filtroGrillaOptions.fecha_hasta,
                        clienteId: this.filtroGrillaOptions.clienteId,
                        search: this.$refs.listView.multiColumnSearchText
                    })
                    .then((response) => {
                        if (response.ok) {                    
                            this.resetData()
                        }

                        this.$refs.loader.hide();
                        this.$refs.confirmModal.hide();
                    })
                } else {
                    this.txtDescripcionLiquidacion = textdescripcion;
                    this.generaliquidacionrequest.descripcion = textdescripcion;
                    this.generaliquidacionrequest.ids_ordenes = this.ordenesPagosSelected;

                    let response = await this.generaliquidacion(this.generaliquidacionrequest);
                    if (response.ok) {                    
                        this.resetData()
                    }

                    this.$refs.loader.hide();
                    this.$refs.confirmModal.hide();
                }
            },  
            onBeforeEdit (form) {
                let result = { hasErrors: false, messages: [] };
                result.hasErrors = result.messages.length > 0;
                
                return Promise.resolve(result); 
            },    
            onBeforeSave (form) {
                let result = { hasErrors: false, messages: [] };

                result.hasErrors = result.messages.length > 0;

                return Promise.resolve(result); 
            },
            onBeforeClose(form) {
                this.resetData();
                this.$refs.listView.search();
                return Promise.resolve(true); 
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
    
.ordenespagos-container .top-right-button-container .new-button {
  display: none;
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