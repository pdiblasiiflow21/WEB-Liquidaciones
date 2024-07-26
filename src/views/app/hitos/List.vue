<template>
<div>
    <b-card no-body>
      <b-tabs card v-model="tabIndex">
        <b-tab title="Ventas" @click="linkClass(1)" active>
          <b-card-text>
            <data-grid ref="dataGridVentas" resource="hitos" method="getbyTipo" :filter="filterVenta" :showActions="showActions"    >
              <column field="descripcion" title="Descripcion" width="40" />
                <column :field="(entity) => { return getEstado(entity.estadoHitoId, 1)}" title="Estado" width="120"  /> 
                <column  :field="(entity) => maskForCulNum(entity.importeSinIva)" title="Importe (sin iva)" width="80" />
                <column :field="(entity) => entity.fechaFinalizacion ? moment(entity.fechaFinalizacion).format('DD/MM/YYYY') : ''" title="Fecha Finalización" width="40" />
              <!-- <column :field="(entity) => moment(entity.fechaFactura).format('DD/MM/YYYY')" title="Fecha de Factura" width="40" /> -->
              <!-- <column :field=" (entity) => { return entity.cliente != null ? `${entity.cliente.nombres} ` : ''; } " title="Cliente" width="120" /> -->
          <!-- <column field="concepto" title="Id" width="40" />
          <column field="descripcion" title="Id" width="40" />
          <column field="importeNeto" title="Id" width="40" />
          <column field="importeTotal" title="Id" width="40" />
          <column field="numeroFactura" title="Id" width="40" />
          <column field="origenDeIngreso" title="Id" width="40" />
          <column field="cuentaOrigenIngreso" title="Id" width="40" /> -->
             <template slot="action-column" slot-scope="props">
                <b-button class="mb-1" size="xs" variant="outline-info" @click="setEdit(props.entity)">Editar</b-button>
                <b-button class="mb-1" size="xs" variant="outline-primary" @click="confirmDelete(props.entity)" >Eliminar</b-button>
            </template>
          </data-grid>
          </b-card-text>
        </b-tab>
        <b-tab title="Gastos" @click="linkClass(2)" >
          <b-card-text>
            <data-grid ref="dataGridGastos" resource="hitos" method="getbyTipo" :filter="filterGasto" :showActions="showActions" >
              <column field="descripcion" title="Descripcion" width="40" />
             <column :field="(entity) => { return getEstado(entity.estadoHitoId, 2)}" title="Estado" width="120"  /> 
              <!-- <column :field="(entity) => moment(entity.fechaFactura).format('DD/MM/YYYY')" title="Fecha de Factura" width="40" /> -->
              <column :field="(entity) => { return entity.proveedor != null ? `${entity.proveedor.nombre} ` : ''; } " title="Proveedor" width="120" />
               <column :field="(entity) => maskForCulNum(entity.importeSinIva)" title="Importe (sin iva)" width="40" />
               <column :field="(entity) => entity.fechaFinalizacion ? moment(entity.fechaFinalizacion).format('DD/MM/YYYY') : ''" title="Fecha Finalización" width="40" />
            <template slot="action-column" slot-scope="props">
                <b-button class="mb-1" size="xs" variant="outline-info" @click="setEdit(props.entity)">Editar</b-button>
                <b-button class="mb-1" size="xs" variant="outline-primary" @click="confirmDelete(props.entity)" >Eliminar</b-button>
            </template>
          </data-grid>
          </b-card-text>
        </b-tab>
      </b-tabs>
    </b-card>
    <b-modal id="modalHito" ref="hitosModal" :title="modalTitle" class="modal-right" no-close-on-backdrop>
      <b-form> 
        <b-form-group label="Tipo de Hito">
          <b-form-select v-model="form.entity.tipoHitoId" :options="tipoHitos" placeholder="Tipo de Hito" ></b-form-select>
          <b-form-invalid-feedback>Seleccionar Tipo de Hito</b-form-invalid-feedback>              
        </b-form-group>
        <b-form-group label="Descripción"> 
          <b-form-input   type="text" v-model="form.entity.descripcion" placeholder="Descripción *" :state="$v.form.entity.descripcion.$dirty ? !$v.form.entity.descripcion.$error : null" />
          <b-form-invalid-feedback v-if="!$v.form.entity.descripcion.required" >Por favor Ingrese la Descripción</b-form-invalid-feedback>
        </b-form-group>   
        <b-form-group label="Proveedor" v-if="form.entity.tipoHitoId == 2"> 
          <select-deluxe resource="proveedores" selectItemLabel="nombre" method="getAll"  placeholder="Seleccionar Proveedor" v-model="form.entity.proveedor" :state="$isValid($v.form.entity.proveedor)"></select-deluxe>
          <div class="invalid-feedback show" v-if="$isValid($v.form.entity.proveedor) && !form.entity.proveedor">Ingrese el Proveedor</div>
        </b-form-group>        
        <b-form-group label="Estado" v-if="form.entity.tipoHitoId == 1"> 
          <b-form-select   :options="estadoHitosVenta.opciones" v-model="estadoHitosVenta.selected" :disabled="true" placeholder="Estado Hito" ></b-form-select>          
        </b-form-group>
        <b-form-group label="Estado" v-if="form.entity.tipoHitoId == 2"> 
          <b-form-select   :options="estadoHitosGasto.opciones" v-model="estadoHitosGasto.selected" :disabled="true" placeholder="Estado Hito" ></b-form-select>          
        </b-form-group>
        <b-form-group>
          <b-form-datepicker v-model="form.entity.fechaFinalizacion" :min="new Date()"  placeholder="Fecha Finalización *" :state="$v.form.entity.fechaFinalizacion.$dirty ? !$v.form.entity.fechaFinalizacion.$error : null"></b-form-datepicker>     
          <b-form-invalid-feedback v-if="!$v.form.entity.fechaFinalizacion.required" >Por favor Ingrese una fecha de finalización</b-form-invalid-feedback>
        </b-form-group>
        <b-form-group :label="form.entity.tipoHitoId == 2 ? 'Cuenta Orígen *' : 'Cuenta Destino *'"> 
            <select-deluxe resource="origenes"  :selectItemLabel="({ nombre }) => `${nombre}`"  method="getAll"  placeholder="Seleccionar cuenta" v-model="form.entity.origen"   :state="$isValid($v.form.entity.origen)"></select-deluxe>
            <div class="invalid-feedback show"  v-if="$isValid($v.form.entity.importeSinIva) && !form.entity.origen">{{form.entity.tipoHitoId == 2 ? 'Cuenta Orígen' : 'Cuenta Destino'}}</div>        
        </b-form-group>
        <b-form-group label="Importe (sin iva) *"> 
          <b-form-input type="text" v-model="form.entity.importeSinIva" placeholder="Importe (sin iva)"  v-mask="mask"  :state="$v.form.entity.importeSinIva.$dirty ? !$v.form.entity.importeSinIva.$error : null" />
          <b-form-invalid-feedback v-if="!$v.form.entity.fechaFinalizacion.required" >Importe (sin iva)</b-form-invalid-feedback>          
          <div class="invalid-feedback show" v-if="$isValid($v.form.entity.importeSinIva) && form.entity.importeSinIva <= 0">Ingrese un importe mayor a 0</div>
        </b-form-group>
         <b-form-group label="Observaciones">          
          <b-form-textarea v-model="form.entity.observaciones" placeholder="Observaciones" rows="3" max-rows="6" ></b-form-textarea>
        </b-form-group>
      </b-form>
      <template slot="modal-footer">
        <b-button variant="outline-secondary" @click="$refs.hitosModal.hide()">Cerrar</b-button>
        <b-button type="submit" variant="primary" class="mr-1" @click="save()">Aceptar</b-button>
      </template>
    </b-modal>

    <loading ref="loader" />
  </div>
</template>

<script>
import moment from "moment";
import { validationMixin } from 'vuelidate'
import createNumberMask from 'text-mask-addons/dist/createNumberMask';
const currencyMask = createNumberMask({
  prefix: '',
  allowDecimal: true,
  thousandsSeparatorSymbol: '.',
  decimalSymbol: ',',
  allowNegative: false,
});
const { required, requiredIf, minValue } = require("vuelidate/lib/validators");

export default {    
  name: "hitosComponent",
  props: {
    parentId: { 
      type: Number,
      required: false,
      default:  0
    }
  },
  mixins: [validationMixin],
  data() {
    return {
      mask: currencyMask,
      moment: moment,
        form: {
          entity: {
            
            },                   
        },    
      newEntity: {
        proyectoId: '',
        tipoHitoId: 1, 
        descripcion: '',      
        // tipoComprobanteId: {type: Number},
        importeSinIva: 0,
        estadoHitoId: null,
        observaciones:  '',
        // origenIngreso: null,
        clienteId: 0,
        proveedor: {},
        fechaFinalizacion: '',
        origen: {}
      },
      tabIndex: 0,
      modalTitle: this.title,      
      project: {},
      cliente: {},
      showActions: true,
      tipoHitos: [
              { value: 1, text: 'Venta'},
              { value: 2, text: 'Gasto'}
            ],
      estadoHitosVenta: {
        selected: 1,
        opciones: [
              { value: 1, text: 'Pendiente Facturación'},
              { value: 2, text: 'Facturado'},
              { value: 3, text: 'Cobrado'}
            ]},
      estadoHitosGasto: {
        selected: 1,
        opciones:[
              { value: 1, text: 'Pendiente de Pago'},
              { value: 2, text: 'Pagado'}
            ]},
      api: this.$api['hitos'],      
      filterVenta: { id: 1, proyectoId: this.parentId, pageSize: 5},
      filterGasto: { id: 2, proyectoId: this.parentId, pageSize: 5},
      result: { hasErrors: false, messages: [] },
                // rowCount: 0,
                // rows: [],
                // page: 1,                
      canAddVenta: false,
      canAddGasto: false        
    }
  },
  validations: {
     form: {
          entity: {
              proyectoId: { required },
              tipoHitoId: { required },                
              descripcion: { required },
              // tipoComprobanteId: { required },
              importeSinIva: { required },
              estadoHitoId: { required },
              observaciones:  {},
              // origenIngreso: {},
              clienteId: { required },
              proveedor: {  
                required: requiredIf(function () {
                     return this.form.entity.tipoHitoId === 2
                  })
              },
              fechaFinalizacion: {},
              origen: { required }       
        },        
    }
  },
  methods: { 
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
     } else {
       value = '00';
     }
     
      const replnum = value.replace('.', ',');
      const numbers = replnum.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      return numbers;
    },
    getEstado: function (id, tipo) {
        if (tipo === 1)
            return this.estadoHitosVenta.opciones[id - 1].text;
        else
            return this.estadoHitosGasto.opciones[id - 1].text;
    },
    show(project, title, cliente, addVenta, addGasto) {        
      this.$v.form.entity.$reset();
      this.$refs["hitosModal"].show();
      this.modalTitle = title + ' Hito';
      this.project = project;
      this.cliente = cliente;
      this.canAddVenta = addVenta;
      this.canAddGasto = addGasto;
      this.linkClass(this.newEntity.tipoHitoId);      
      this.form.entity = { ...this.newEntity };
      this.form.entity.proyectoId = project.id;
      this.form.entity.clienteId = project.clienteId;
      this.form.entity.origen = project.origen;
      
    },
    close() {
      this.$refs["hitosModal"].hide();
    },
    linkClass(idx) {
      if (this.canAddVenta && this.canAddGasto) {
          this.newEntity.tipoHitoId = idx;
          this.tipoHitos = [
              { value: 1, text: 'Venta'},
              { value: 2, text: 'Gasto'}
            ];
      } else if (this.canAddVenta && !this.canAddGasto) {
          this.newEntity.tipoHitoId = 1;
          this.tipoHitos =  [
              { value: 1, text: 'Venta'}
            ];
      } else {
        this.newEntity.tipoHitoId = 2;
        this.tipoHitos =  [
              { value: 2, text: 'Gasto'}
            ];
      }

    },
    onBeforeSave(form) {
      let result = { hasErrors: false, messages: [] };
      //add validations here
      result.hasErrors = result.messages.length > 0;
      return Promise.resolve(result);
    },
    onAfterSave() {
       this.$refs.loader.hide(300);        
        if (this.form.entity.tipoHitoId === 1) {
          this.$refs.dataGridVentas.search();
        } else {
          this.$refs.dataGridGastos.search();
        }
        
        this.close();
    },
    async save() {
      this.$refs.loader.show();
      // Agregar Validaciones
      try {
        
        this.form.entity.estadoHitoId = this.form.entity.tipoHitoId == 1 ? this.estadoHitosVenta.selected : this.estadoHitosGasto.selected;
        if (this.form.entity.importeSinIva) {
          this.form.entity.importeSinIva = this.form.entity.importeSinIva.toString().replaceAll('.','').replace(',', '.');
        }
        

        this.$v.form.entity.$touch();

        if (this.$v.form.entity.$invalid)
        {
          this.$refs.loader.hide(300);  
          return;
        }

       
        if(this.form.entity.id) {
          // await this.api.update(this.form.entity);
           await this.api.update({ id: this.form.entity.id} , this.form.entity )
        } else {
           await this.api.save(this.form.entity);
        }
       if(this.onAfterSave) {
          await this.onAfterSave();                    
        }
        // this.$refs.entityModal.hide();  
       
      } catch(ex) {
        // this.resultModal = ex.body.result; 
        this.$refs.loader.hide(300);         
      }
    },
    async setEdit (entity) {
      this.$refs.loader.show();
      this.$v.form.entity.$reset();
      this.modalTitle = 'Editar Hito | ' + entity.id;
      this.form.entity = {...entity};
        if (this.form.entity.importeSinIva) {
        this.form.entity.importeSinIva = this.maskForCulNum(this.form.entity.importeSinIva);
      }     
      // if(this.onBeforeEdit) {
      //   await this.onBeforeEdit(this.form);                    
      // }
      this.$refs["hitosModal"].show();  
      this.$refs.loader.hide(300);      
    },
     async confirmDelete (entity) {
      this.$refs.loader.show();
      this.form.entity = {...entity};
       if(this.form.entity.id) {
        await this.api.delete({id: this.form.entity.id});
       }

        if (this.form.entity.tipoHitoId === 1) {
          this.$refs.dataGridVentas.search();
        } else {
          this.$refs.dataGridGastos.search();
        }
      this.$refs.loader.hide(300);      
    },
  }
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