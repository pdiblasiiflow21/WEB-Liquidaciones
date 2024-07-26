<template>
  <div>
    <b-modal id="modalHistorialProyectos" size="xl" ref="historialProyectoModal" title="Historial Proyectos" class="modal-right" no-close-on-backdrop>
      <data-grid ref="dataGrid" resource="historialproyectos" method="getbyParent" :filter="filter">
        <column  :field="(entity) => entity.updateDate ? moment(entity.updateDate).format('DD/MM/YYYY') :  moment(entity.createDate).format('DD/MM/YYYY')"   title="Fecha Actualización" width="40" />
        <column :field="(entity) => { return entity.estado != null ? `${entity.estado.descripcion} ` : '';}" title="Estado" width="120" />
        <column :field="(entity) => maskForCulNum(entity.valorTotal)"  title="Valor Total" width="40" />   
      </data-grid>
      <template slot="modal-footer">
        <b-button variant="outline-secondary" @click="$refs.historialProyectoModal.hide()">Cerrar</b-button>
      </template>
      <!-- <p>{{parent}}</p> -->
    </b-modal>
    <loading ref="loader" />
  </div>
</template>

<script>
import moment from "moment";

const { required } = require("vuelidate/lib/validators");

export default {    
  name: "historialProyectoComponent",
  props: {
    parent: { 
      type: Object,
      required: false,
      default:  0
    }
  },
  data() {
    return {
      moment: moment,
      modalTitle: this.title,      
      project: {},
      filter: { id: 0},
    } 
  },
  methods: { 
    show(entity) {
      this.parent = entity;
      this.filter = { id: entity.id };
      this.$refs["historialProyectoModal"].show();
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
     } else {
       value = '00';
     }
     
      const replnum = value.replace('.', ',');
      const numbers = replnum.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      return numbers;
    },
  }
};
</script>


<style>
.invalid-feedback.show {
  display: block;
}
</style>